import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { loadAllAgents, type AgentIdentity } from './identity';
import { processTask } from './taskRunner';
import { runHeartbeat, startHeartbeatSchedule } from './heartbeat';
import { getDb, serverTimestamp } from './firestoreClient';

const PORT         = Number(process.env.PORT || 8080);
const COMPANY_ID   = process.env.COMPANY_ID || '';
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '';

// All active agents for this company, keyed by agentId
const agents = new Map<string, AgentIdentity>();

const app = express();
app.use(express.json());

// ── Auth middleware ───────────────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!GATEWAY_TOKEN) { next(); return; }
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token !== GATEWAY_TOKEN) { res.status(401).json({ error: 'Unauthorized' }); return; }
  next();
}

// ── Health check (no auth) ────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    companyId: COMPANY_ID,
    agents:    agents.size,
    names:     [...agents.values()].map(a => a.name),
    uptime:    Math.floor(process.uptime()),
  });
});

// ── Reload: pick up newly provisioned agents without restarting ───────────────
app.post('/reload', requireAuth, async (_req, res) => {
  res.json({ reloading: true });
  setImmediate(() => syncAgents().catch(console.error));
});

// ── Receive task / heartbeat triggers from Cloud Functions ────────────────────
app.post('/session', requireAuth, async (req, res) => {
  const { type, taskId, agentId } = req.body as {
    type?: string; taskId?: string; agentId?: string;
  };

  res.json({ received: true });

  setImmediate(async () => {
    try {
      if (taskId && agentId) {
        const identity = agents.get(agentId);
        if (identity) await processTask(taskId, identity);
      } else if (type === 'HEARTBEAT' && agentId) {
        const identity = agents.get(agentId);
        if (identity) await runHeartbeat(identity);
      } else if (type === 'PROCESS_PENDING') {
        // Process pending tasks for all agents
        for (const identity of agents.values()) {
          await processPendingForAgent(identity);
        }
      }
    } catch (err) {
      console.error('Session handler error:', err);
    }
  });
});

// ── Manual heartbeat for a specific agent ─────────────────────────────────────
app.post('/heartbeat/:agentId', requireAuth, async (req, res) => {
  const identity = agents.get(req.params.agentId);
  if (!identity) { res.status(404).json({ error: 'Agent not found' }); return; }
  res.json({ triggered: true });
  setImmediate(() => runHeartbeat(identity).catch(console.error));
});

// ── Status ────────────────────────────────────────────────────────────────────
app.get('/status', requireAuth, (_req, res) => {
  res.json({
    companyId: COMPANY_ID,
    agents: [...agents.values()].map(a => ({
      agentId:  a.agentId,
      name:     a.name,
      role:     a.role,
      isCEO:    a.isCEO,
      budget:   a.monthlyBudgetUsd,
      interval: a.heartbeatIntervalMinutes,
    })),
  });
});

// ── Core: load agents and start their schedules ───────────────────────────────
async function syncAgents(): Promise<void> {
  if (!COMPANY_ID) throw new Error('COMPANY_ID not set');

  console.log(`[Runtime] Syncing agents for company ${COMPANY_ID}...`);
  const db = getDb();
  const fresh = await loadAllAgents(COMPANY_ID);

  for (const identity of fresh) {
    if (!agents.has(identity.agentId)) {
      agents.set(identity.agentId, identity);
      console.log(`[Runtime] Starting agent: ${identity.name} (${identity.role})`);

      // Mark online
      await db.collection('agents').doc(identity.agentId).update({
        machineStatus: 'online',
        lastOnlineAt:  serverTimestamp(),
        updatedAt:     serverTimestamp(),
      }).catch(() => {});

      // Start this agent's heartbeat schedule
      startHeartbeatSchedule(identity, identity.heartbeatIntervalMinutes);

      // Process any tasks waiting since machine was down
      await processPendingForAgent(identity);
    }
  }

  console.log(`[Runtime] ${agents.size} agent(s) active`);
}

async function processPendingForAgent(identity: AgentIdentity): Promise<void> {
  const db = getDb();
  const snap = await db.collection('tasks')
    .where('companyId',       '==', identity.companyId)
    .where('assignedAgentId', '==', identity.agentId)
    .limit(5)
    .get();

  const pending = snap.docs.filter(d =>
    ['todo', 'in_progress'].includes(d.data().status)
  );

  if (pending.length === 0) return;
  console.log(`[${identity.name}] ${pending.length} pending task(s)`);
  for (const doc of pending) await processTask(doc.id, identity);
}

// ── Subscribe to new task assignments for ALL agents in this company ──────────
function subscribeToTasks(): void {
  const db = getDb();
  db.collection('tasks')
    .where('companyId', '==', COMPANY_ID)
    .where('status',    '==', 'todo')
    .onSnapshot(snap => {
      snap.docChanges().forEach(change => {
        if (change.type !== 'added') return;
        const task     = change.doc.data();
        const identity = agents.get(task.assignedAgentId);
        if (!identity) return;
        console.log(`[${identity.name}] New task: "${task.title}"`);
        processTask(change.doc.id, identity).catch(console.error);
      });
    }, err => console.error('Firestore subscription error:', err));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Freemi Agent Runtime starting...');
  console.log(`Company: ${COMPANY_ID}`);

  if (!COMPANY_ID) {
    throw new Error('COMPANY_ID environment variable is required');
  }

  // Load all agents for this company
  await syncAgents();

  // Real-time task subscription for all agents
  subscribeToTasks();

  // Start HTTP server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Runtime listening on :${PORT} — ${agents.size} agent(s) running`);
  });
}

// Graceful shutdown — mark all agents offline
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  const db = getDb();
  await Promise.all(
    [...agents.keys()].map(id =>
      db.collection('agents').doc(id).update({
        machineStatus: 'offline',
        updatedAt:     serverTimestamp(),
      }).catch(() => {})
    )
  );
  process.exit(0);
});

main().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
