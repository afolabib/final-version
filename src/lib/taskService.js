import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  serverTimestamp, query, where, orderBy, runTransaction
} from 'firebase/firestore';
import { firestore, isDemoMode } from './firebaseClient';
import { localCreateTask, localUpdateTask, localSubscribeTasks } from './localDB';
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
  if (isDemoMode) return localCreateTask(companyId, userId, { title, description, goalId, assignedAgentId, priority, dueDate, requiresApproval });
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
  if (isDemoMode) return localUpdateTask(companyId, taskId, updates);
  await updateDoc(doc(firestore, COL, taskId), { ...updates, updatedAt: serverTimestamp() });
  if (updates.status) {
    await logActivity(companyId, userId, 'user', `task.${updates.status}`, taskId, `Task ${updates.status}: "${updates.title || taskId}"`);
  }
}

export async function deleteTask(companyId, taskId) {
  if (isDemoMode) return;
  await deleteDoc(doc(firestore, COL, taskId));
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
  if (isDemoMode) return localSubscribeTasks(companyId, cb);
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    cb(docs);
  });
}

export function subscribeTasksByAgent(companyId, agentId, cb) {
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    where('assignedAgentId', '==', agentId)
  );
  return onSnapshot(q, snap => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    cb(docs);
  });
}
