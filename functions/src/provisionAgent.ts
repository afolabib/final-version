/**
 * provisionAgent.ts
 *
 * Firestore trigger: when an agent doc is created with status='active',
 * spin up a dedicated Fly.io machine for that agent running the freemi-agent-runtime.
 *
 * Each agent gets its own "computer" on Fly.io.
 */

import * as functions from 'firebase-functions';
import { randomBytes } from 'crypto';
import fetch from 'node-fetch';
import { db, serverTimestamp } from './firebase';

const cfg = functions.config();

const FLY_API_TOKEN    = cfg.fly?.api_token      || process.env.FLY_API_TOKEN || '';
const FLY_API_BASE     = 'https://api.machines.dev';
const FLY_APP_NAME     = cfg.fly?.app_name       || process.env.FLY_APP_NAME  || 'freemi-agents';
const FLY_REGION       = cfg.fly?.region         || process.env.FLY_REGION    || 'iad';
const AGENT_IMAGE      = process.env.AGENT_RUNTIME_IMAGE || 'registry.fly.io/freemi-agents:latest';
const AGENT_PORT       = 8080;

// Secrets forwarded to every Fly machine
const MINIMAX_API_KEY         = cfg.minimax?.api_key              || process.env.MINIMAX_API_KEY         || '';
const FIREBASE_PROJECT_ID     = cfg.app?.firebase_project_id      || process.env.FIREBASE_PROJECT_ID     || 'freemi-3f7c7';
const FIREBASE_SERVICE_ACCOUNT = cfg.app?.firebase_service_account || process.env.FIREBASE_SERVICE_ACCOUNT || '';

export const onAgentCreated = functions.firestore
  .document('agents/{agentId}')
  .onCreate(async (snap, context) => {
    const agent = snap.data();
    const { agentId } = context.params;

    if (agent.status !== 'active') return null;
    if (!FLY_API_TOKEN) {
      console.warn('FLY_API_TOKEN not set — skipping machine provisioning');
      return null;
    }

    const companyId = agent.companyId;
    console.log(`Agent created: ${agent.name} for company ${companyId}`);

    try {
      // ── Check if this company already has a running machine ──────────────
      const existingSnap = await db.collection('agent_machines')
        .where('companyId', '==', companyId)
        .where('status', '==', 'running')
        .limit(1)
        .get();

      if (!existingSnap.empty) {
        // Machine exists — just tell it to reload and pick up the new agent
        const existing = existingSnap.docs[0].data();
        console.log(`Company ${companyId} already has machine ${existing.machineId} — sending reload`);

        await fetch(`${existing.url}/reload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${existing.gatewayToken}`,
          },
        }).catch(err => console.warn('Reload ping failed (machine may be starting):', err.message));

        await snap.ref.update({ machineStatus: 'online', updatedAt: serverTimestamp() });
        return null;
      }

      // ── No machine yet — create one for the whole company ────────────────
      const gatewayToken = randomBytes(32).toString('hex');

      const machine = await createFlyMachine({
        companyId,
        gatewayToken,
        memoryMb: 1024,
      });

      const machineUrl = `https://${FLY_APP_NAME}.fly.dev`;

      // Store machine record keyed to company (not agent)
      await db.collection('agent_machines').add({
        companyId,
        machineId: machine.id,
        flyApp: FLY_APP_NAME,
        region: FLY_REGION,
        url: machineUrl,
        gatewayToken,
        status: 'running',
        image: AGENT_IMAGE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Mark this agent online
      await snap.ref.update({
        machineStatus: 'provisioning',
        machineId: machine.id,
        updatedAt: serverTimestamp(),
      });

      // Activity log
      await db.collection('activity_log').add({
        companyId: agent.companyId,
        actorId: agentId,
        actorType: 'agent',
        event: 'agent.provisioned',
        entityId: agentId,
        summary: `${agent.name}'s machine is starting up on Fly.io`,
        createdAt: serverTimestamp(),
      });

      console.log(`Machine ${machine.id} created for agent ${agentId}`);

    } catch (err) {
      console.error(`Failed to provision machine for agent ${agentId}:`, err);
      await snap.ref.update({
        machineStatus: 'failed',
        machineError: (err as Error).message,
        updatedAt: serverTimestamp(),
      });
    }

    return null;
  });

async function createFlyMachine(params: {
  companyId: string;
  gatewayToken: string;
  memoryMb: number;
}): Promise<{ id: string }> {
  const { companyId, gatewayToken, memoryMb } = params;

  // Fly Machines API requires config nested under "config" key
  const body = {
    region: FLY_REGION,
    config: {
      image: AGENT_IMAGE,
      guest: {
        cpu_kind: 'shared',
        cpus: 1,
        memory_mb: memoryMb,
      },
      env: {
        PORT:                   String(AGENT_PORT),
        COMPANY_ID:             companyId,
        GATEWAY_TOKEN:          gatewayToken,
        MINIMAX_API_KEY,
        FIREBASE_PROJECT_ID,
        FIREBASE_SERVICE_ACCOUNT,
        NODE_ENV:               'production',
        FLY_APP_NAME,
      },
      services: [
        {
          ports: [
            { port: 443, handlers: ['tls', 'http'] },
            { port: 80,  handlers: ['http'] },
          ],
          protocol: 'tcp',
          internal_port: AGENT_PORT,
        },
      ],
      checks: {
        health: {
          type: 'http',
          port: AGENT_PORT,
          path: '/health',
          interval: '30s',
          timeout: '5s',
          grace_period: '30s',
        },
      },
      restart: {
        policy: 'always',
      },
    },
  };

  const res = await fetch(
    `${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/machines`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FLY_API_TOKEN}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fly API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<{ id: string }>;
}

/**
 * Callable: manually trigger machine provisioning for an existing agent.
 * Useful for re-provisioning after a machine failure.
 */
export const reprovisionAgent = functions.https.onCall(async (data) => {
  const { companyId } = data as { companyId: string };
  if (!companyId) throw new functions.https.HttpsError('invalid-argument', 'companyId required');

  const gatewayToken = randomBytes(32).toString('hex');

  const machine = await createFlyMachine({ companyId, gatewayToken, memoryMb: 1024 });

  await db.collection('agent_machines').add({
    companyId,
    machineId: machine.id,
    flyApp:    FLY_APP_NAME,
    region:    FLY_REGION,
    url:       `https://${FLY_APP_NAME}.fly.dev`,
    gatewayToken,
    status:    'running',
    image:     AGENT_IMAGE,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { machineId: machine.id };
});
