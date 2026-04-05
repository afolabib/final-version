import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  serverTimestamp, query, where, orderBy
} from 'firebase/firestore';
import { firestore, isDemoMode } from './firebaseClient';
import { localSubscribeApprovals, localApproveRequest, localRejectRequest } from './localDB';
import { logActivity } from './activityService';

const COL = 'approvals';

export const APPROVAL_TYPES = {
  NEEDS_INPUT: 'needs_input',
  HIRE_AGENT: 'hire_agent',
  FIRE_AGENT: 'fire_agent',
  BUDGET_OVERRIDE: 'budget_override',
  STRATEGY_CHANGE: 'strategy_change',
  EXTERNAL_ACTION: 'external_action',
};

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

export async function createApproval(companyId, requestingActorId, { type, title, description, payload = {} }) {
  const ref = await addDoc(collection(firestore, COL), {
    companyId,
    requestingActorId,
    type,
    title,
    description,
    payload,
    status: APPROVAL_STATUS.PENDING,
    decidedByUserId: null,
    decidedAt: null,
    decisionNote: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function approveRequest(companyId, userId, approvalId, note = '') {
  if (isDemoMode) { localApproveRequest(companyId, userId, approvalId); return; }
  const ref = doc(firestore, COL, approvalId);
  await updateDoc(ref, {
    status: APPROVAL_STATUS.APPROVED,
    decidedByUserId: userId,
    decidedAt: serverTimestamp(),
    decisionNote: note,
    updatedAt: serverTimestamp(),
  });
  await logActivity(companyId, userId, 'user', 'approval.approved', approvalId, `Approved: ${note || 'no note'}`);
}

export async function rejectRequest(companyId, userId, approvalId, note = '') {
  if (isDemoMode) { localRejectRequest(companyId, userId, approvalId, note); return; }
  await updateDoc(doc(firestore, COL, approvalId), {
    status: APPROVAL_STATUS.REJECTED,
    decidedByUserId: userId,
    decidedAt: serverTimestamp(),
    decisionNote: note,
    updatedAt: serverTimestamp(),
  });
  await logActivity(companyId, userId, 'user', 'approval.rejected', approvalId, `Rejected: ${note || 'no note'}`);
}

export function subscribePendingApprovals(companyId, cb) {
  if (isDemoMode) return localSubscribeApprovals(companyId, cb);
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    where('status', '==', APPROVAL_STATUS.PENDING),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function subscribeAllApprovals(companyId, cb) {
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
