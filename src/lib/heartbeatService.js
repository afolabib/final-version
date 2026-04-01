import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  serverTimestamp, query, where, orderBy, limit
} from 'firebase/firestore';
import { firestore } from './firebaseClient';

const COL = 'heartbeats';

export const HEARTBEAT_STATUS = {
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export async function createHeartbeatRun(companyId, agentId, triggeredBy = 'timer') {
  const ref = await addDoc(collection(firestore, COL), {
    companyId,
    agentId,
    triggeredBy, // 'timer' | 'assignment' | 'manual'
    status: HEARTBEAT_STATUS.RUNNING,
    tasksProcessed: 0,
    tokensUsed: 0,
    costUsd: 0,
    summary: '',
    errorMessage: null,
    startedAt: serverTimestamp(),
    completedAt: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function completeHeartbeatRun(runId, { tasksProcessed = 0, tokensUsed = 0, costUsd = 0, summary = '' }) {
  await updateDoc(doc(firestore, COL, runId), {
    status: HEARTBEAT_STATUS.COMPLETED,
    tasksProcessed,
    tokensUsed,
    costUsd,
    summary,
    completedAt: serverTimestamp(),
  });
}

export async function failHeartbeatRun(runId, errorMessage) {
  await updateDoc(doc(firestore, COL, runId), {
    status: HEARTBEAT_STATUS.FAILED,
    errorMessage,
    completedAt: serverTimestamp(),
  });
}

export function subscribeLatestHeartbeats(companyId, cb, count = 30) {
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function subscribeAgentHeartbeats(companyId, agentId, cb) {
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    where('agentId', '==', agentId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

// Manual heartbeat trigger — calls the Fly.io OpenClaw gateway
export async function triggerManualHeartbeat(agentId, companyId) {
  // This calls the Fly.io VPS endpoint to wake the OpenClaw agent
  // The VPS writes the heartbeat result back to Firestore
  try {
    const res = await fetch(`/api/heartbeat/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, companyId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
