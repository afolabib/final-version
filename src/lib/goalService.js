import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  serverTimestamp, query, where, orderBy
} from 'firebase/firestore';
import { firestore, isDemoMode } from './firebaseClient';
import { localCreateGoal, localUpdateGoal, localSubscribeGoals } from './localDB';
import { logActivity } from './activityService';

const COL = 'goals';

export const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
  CANCELLED: 'cancelled',
};

export const GOAL_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export async function createGoal(companyId, userId, { title, description = '', parentGoalId = null, ownerAgentId = null, priority = 'high', dueDate = null, emoji = null, isProject = false }) {
  if (isDemoMode) return localCreateGoal(companyId, userId, { title, description, parentGoalId, ownerAgentId, priority, dueDate, emoji });
  const ref = await addDoc(collection(firestore, COL), {
    companyId,
    title,
    description,
    parentGoalId,
    ownerAgentId,
    priority,
    dueDate,
    emoji,
    isProject,
    status: GOAL_STATUS.ACTIVE,
    progressPct: 0,
    createdByUserId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logActivity(companyId, userId, 'user', 'goal.created', ref.id, `New goal: "${title}"`);
  return ref.id;
}

export async function updateGoal(companyId, userId, goalId, updates) {
  if (isDemoMode) return localUpdateGoal(companyId, goalId, updates);
  await updateDoc(doc(firestore, COL, goalId), { ...updates, updatedAt: serverTimestamp() });
  if (updates.status === GOAL_STATUS.COMPLETED) {
    await logActivity(companyId, userId, 'user', 'goal.completed', goalId, `Goal completed: "${updates.title || goalId}"`);
  }
}

export function subscribeGoals(companyId, cb) {
  if (isDemoMode) return localSubscribeGoals(companyId, cb);
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

// Build a goal tree from a flat array
export function buildGoalTree(goals) {
  const map = {};
  const roots = [];
  goals.forEach(g => { map[g.id] = { ...g, children: [] }; });
  goals.forEach(g => {
    if (g.parentGoalId && map[g.parentGoalId]) map[g.parentGoalId].children.push(map[g.id]);
    else roots.push(map[g.id]);
  });
  return roots;
}
