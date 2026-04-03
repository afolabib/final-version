import {
  collection, addDoc, onSnapshot, serverTimestamp,
  query, where, orderBy, limit
} from 'firebase/firestore';
import { firestore, isDemoMode } from './firebaseClient';
import { localLogActivity, localSubscribeActivity } from './localDB';

const COL = 'activity_log';

export async function logActivity(companyId, actorId, actorType = 'user', action, entityId, summary, metadata = {}) {
  if (isDemoMode) return localLogActivity(companyId, { actorId, actorType, action, entityId, summary, metadata });
  try {
    await addDoc(collection(firestore, COL), {
      companyId,
      actorId,
      actorType, // 'agent' | 'user' | 'system'
      action,    // 'agent.hired' | 'task.created' | 'goal.completed' etc.
      entityId,
      summary,
      metadata,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Activity log failed:', e);
  }
}

export function subscribeRecentActivity(companyId, cb, count = 50) {
  if (isDemoMode) return localSubscribeActivity(companyId, cb, count);
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function subscribeAgentActivity(companyId, agentId, cb) {
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    where('actorId', '==', agentId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
