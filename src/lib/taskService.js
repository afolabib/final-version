import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  serverTimestamp, query, where, orderBy, runTransaction
} from 'firebase/firestore';
import { firestore } from './firebaseClient';
import { logActivity } from './activityService';

const COL = 'tasks';

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  NEEDS_REVIEW: 'needs_review',
  DONE: 'done',
  BLOCKED: 'blocked',
  CANCELLED: 'cancelled',
};

export const TASK_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export async function createTask(companyId, userId, { title, description = '', goalId = null, assignedAgentId = null, priority = 'medium', dueDate = null, requiresApproval = false }) {
  const ref = await addDoc(collection(firestore, COL), {
    companyId,
    title,
    description,
    goalId,
    assignedAgentId,
    priority,
    dueDate,
    status: TASK_STATUS.TODO,
    requiresApproval,
    approvalId: null,
    outputSummary: null,
    checkoutRunId: null,
    executionLockedAt: null,
    createdByUserId: userId,
    createdByAgentId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logActivity(companyId, userId, 'user', 'task.created', ref.id, `Task created: "${title}"`);
  return ref.id;
}

export async function updateTask(companyId, userId, taskId, updates) {
  await updateDoc(doc(firestore, COL, taskId), { ...updates, updatedAt: serverTimestamp() });
  if (updates.status) {
    await logActivity(companyId, userId, 'user', `task.${updates.status}`, taskId, `Task ${updates.status}: "${updates.title || taskId}"`);
  }
}

// Atomic task checkout — prevents double-work (Paperclip semantics)
export async function checkoutTask(taskId, agentId, runId) {
  const ref = doc(firestore, COL, taskId);
  await runTransaction(firestore, async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Task not found');
    const data = snap.data();
    if (data.executionLockedAt) throw new Error('Task already checked out');
    tx.update(ref, {
      status: TASK_STATUS.IN_PROGRESS,
      checkoutRunId: runId,
      assignedAgentId: agentId,
      executionLockedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function releaseTask(taskId, { status = TASK_STATUS.DONE, outputSummary = '' } = {}) {
  await updateDoc(doc(firestore, COL, taskId), {
    status,
    outputSummary,
    checkoutRunId: null,
    executionLockedAt: null,
    completedAt: status === TASK_STATUS.DONE ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeTasks(companyId, cb) {
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function subscribeTasksByAgent(companyId, agentId, cb) {
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    where('assignedAgentId', '==', agentId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
