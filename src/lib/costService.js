import {
  collection, addDoc, onSnapshot, serverTimestamp,
  query, where, orderBy, limit, getDocs
} from 'firebase/firestore';
import { firestore } from './firebaseClient';

const COL = 'cost_events';

export async function recordCostEvent(companyId, { agentId, heartbeatId = null, taskId = null, model, tokensIn = 0, tokensOut = 0, costUsd }) {
  await addDoc(collection(firestore, COL), {
    companyId,
    agentId,
    heartbeatId,
    taskId,
    model,
    tokensIn,
    tokensOut,
    costUsd,
    billedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}

export function subscribeAgentSpend(companyId, agentId, cb) {
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    where('agentId', '==', agentId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, snap => {
    const events = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const total = events.reduce((sum, e) => sum + (e.costUsd || 0), 0);
    cb({ events, totalUsd: total });
  });
}

export async function getMonthlySpend(companyId) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc'),
    limit(500)
  );
  const snap = await getDocs(q);
  const events = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Aggregate by agent
  const byAgent = {};
  let totalUsd = 0;
  events.forEach(e => {
    if (!byAgent[e.agentId]) byAgent[e.agentId] = 0;
    byAgent[e.agentId] += e.costUsd || 0;
    totalUsd += e.costUsd || 0;
  });

  return { totalUsd, byAgent, events };
}

export function subscribeCostEvents(companyId, cb, count = 100) {
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
