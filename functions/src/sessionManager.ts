/**
 * Session & Project Memory Manager
 *
 * One Fly.io machine per client.
 * Projects are logical namespaces on that machine.
 * Agents share company memory but have isolated project memory.
 *
 * Firestore structure:
 *   companies/{companyId}/sessions/{sessionId}
 *   companies/{companyId}/projects/{projectId}/sessions/{sessionId}
 *   companies/{companyId}/agentMemory/{agentId}
 */

import * as functions from 'firebase-functions';
import { db, serverTimestamp } from './firebase';
import fetch from 'node-fetch';

const FLY_API_TOKEN = process.env.FLY_API_TOKEN;
const FLY_API_BASE = 'https://api.machines.dev';
const FLY_APP_NAME = process.env.FLY_APP_NAME || 'maagic-operators';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SessionStatus = 'starting' | 'active' | 'paused' | 'completed' | 'failed';

export type AgentSession = {
  id: string;
  companyId: string;
  projectId: string | null;   // null = company-level session
  agentId: string;
  agentName: string;
  status: SessionStatus;
  goal: string;
  startedAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  endedAt: FirebaseFirestore.Timestamp | null;
  machineId: string | null;   // Fly.io machine ID
  browserSessionId: string | null; // Browserbase session
  memoryNamespace: string;    // Pinecone namespace
  taskLog: TaskEntry[];
  messageLog: MessageEntry[];
  creditsUsed: number;
  metadata: Record<string, unknown>;
};

type TaskEntry = {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  result: string | null;
};

type MessageEntry = {
  role: 'agent' | 'user' | 'system';
  content: string;
  timestamp: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function memoryNamespace(companyId: string, projectId: string | null): string {
  return projectId
    ? `${companyId}__${projectId}`
    : `${companyId}__shared`;
}

async function getMachineId(companyId: string): Promise<string | null> {
  const snap = await db.collection('instances')
    .where('companyId', '==', companyId)
    .where('status', '==', 'running')
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data().machineId || null;
}

async function pingMachine(machineId: string, payload: unknown): Promise<boolean> {
  try {
    const res = await fetch(
      `${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/machines/${machineId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${FLY_API_TOKEN}` },
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ── Cloud Functions ───────────────────────────────────────────────────────────

/**
 * Create a new agent session.
 * Called when a user assigns a task or goal to an agent.
 */
export const createSession = functions.https.onCall(async (data, context) => {
  const { companyId, projectId, agentId, agentName, goal } = data;

  if (!companyId || !agentId || !goal) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
  }

  const machineId = await getMachineId(companyId);
  const namespace = memoryNamespace(companyId, projectId || null);

  const sessionRef = projectId
    ? db.collection(`companies/${companyId}/projects/${projectId}/sessions`).doc()
    : db.collection(`companies/${companyId}/sessions`).doc();

  const session: Omit<AgentSession, 'id'> = {
    companyId,
    projectId: projectId || null,
    agentId,
    agentName,
    status: machineId ? 'starting' : 'failed',
    goal,
    startedAt: serverTimestamp() as FirebaseFirestore.Timestamp,
    updatedAt: serverTimestamp() as FirebaseFirestore.Timestamp,
    endedAt: null,
    machineId,
    browserSessionId: null,
    memoryNamespace: namespace,
    taskLog: [],
    messageLog: [],
    creditsUsed: 0,
    metadata: {},
  };

  await sessionRef.set(session);

  // Also log to company-level sessions for dashboard activity feed
  await db.collection(`companies/${companyId}/sessions`).doc(sessionRef.id).set({
    ...session,
    projectId: projectId || null,
  });

  // Notify the Fly machine to start working
  if (machineId) {
    await notifyMachine(machineId, companyId, sessionRef.id, {
      type: 'START_SESSION',
      sessionId: sessionRef.id,
      agentId,
      goal,
      memoryNamespace: namespace,
      projectId: projectId || null,
    });
  }

  return { sessionId: sessionRef.id, status: session.status };
});

/**
 * Pause a running session — agent checkpoints its state.
 */
export const pauseSession = functions.https.onCall(async (data, context) => {
  const { companyId, sessionId } = data;

  const sessionRef = db.collection(`companies/${companyId}/sessions`).doc(sessionId);
  const snap = await sessionRef.get();
  if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Session not found.');

  const session = snap.data() as AgentSession;
  if (session.status !== 'active') return { success: false, reason: 'Session not active.' };

  await sessionRef.update({ status: 'paused', updatedAt: serverTimestamp() });

  if (session.machineId) {
    await notifyMachine(session.machineId, companyId, sessionId, {
      type: 'PAUSE_SESSION',
      sessionId,
    });
  }

  return { success: true };
});

/**
 * Resume a paused session — agent reloads state and continues.
 */
export const resumeSession = functions.https.onCall(async (data, context) => {
  const { companyId, sessionId } = data;

  const sessionRef = db.collection(`companies/${companyId}/sessions`).doc(sessionId);
  const snap = await sessionRef.get();
  if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Session not found.');

  const session = snap.data() as AgentSession;
  if (session.status !== 'paused') return { success: false, reason: 'Session not paused.' };

  await sessionRef.update({ status: 'active', updatedAt: serverTimestamp() });

  if (session.machineId) {
    await notifyMachine(session.machineId, companyId, sessionId, {
      type: 'RESUME_SESSION',
      sessionId,
      memoryNamespace: session.memoryNamespace,
    });
  }

  return { success: true };
});

/**
 * Append a task entry to the session log — called by the Fly machine.
 */
export const logSessionTask = functions.https.onCall(async (data, context) => {
  const { companyId, sessionId, task } = data;

  const sessionRef = db.collection(`companies/${companyId}/sessions`).doc(sessionId);

  await sessionRef.update({
    taskLog: require('firebase-admin').firestore.FieldValue.arrayUnion(task),
    updatedAt: serverTimestamp(),
  });

  // Also push to activity feed
  await db.collection(`companies/${companyId}/activityLog`).add({
    sessionId,
    ...task,
    createdAt: serverTimestamp(),
  });

  return { success: true };
});

/**
 * Complete a session.
 */
export const completeSession = functions.https.onCall(async (data, context) => {
  const { companyId, sessionId, creditsUsed = 0 } = data;

  const sessionRef = db.collection(`companies/${companyId}/sessions`).doc(sessionId);
  await sessionRef.update({
    status: 'completed',
    endedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    creditsUsed,
  });

  return { success: true };
});

/**
 * Get all sessions for a company, optionally scoped to a project.
 */
export const getSessions = functions.https.onCall(async (data, context) => {
  const { companyId, projectId, limit = 20 } = data;

  let query = db.collection(`companies/${companyId}/sessions`)
    .orderBy('startedAt', 'desc')
    .limit(limit);

  if (projectId) {
    query = query.where('projectId', '==', projectId) as any;
  }

  const snap = await query.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
});

// ── Notify Fly machine ────────────────────────────────────────────────────────

async function notifyMachine(
  machineId: string,
  companyId: string,
  sessionId: string,
  payload: Record<string, unknown>
): Promise<void> {
  // Find the machine's gateway URL from Firestore
  const snap = await db.collection('instances')
    .where('machineId', '==', machineId)
    .limit(1)
    .get();

  if (snap.empty) return;

  const instance = snap.docs[0].data();
  const gatewayUrl = instance.url;
  const gatewayToken = instance.gatewayToken;

  if (!gatewayUrl || !gatewayToken) return;

  try {
    await fetch(`${gatewayUrl}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${gatewayToken}`,
      },
      body: JSON.stringify({ companyId, sessionId, ...payload }),
    });
  } catch (err) {
    console.error('Failed to notify machine:', err);
    // Don't throw — machine may be starting up, session stays in 'starting' state
  }
}
