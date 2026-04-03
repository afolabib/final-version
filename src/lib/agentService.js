import {
  collection, doc, addDoc, getDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, query, where, orderBy, getDocs
} from 'firebase/firestore';
import { firestore, isDemoMode } from './firebaseClient';
import { localCreateAgent, localSubscribeAgents, localUpdateAgent } from './localDB';
import { logActivity } from './activityService';

const COL = 'agents';

export const AGENT_ROLES = {
  CEO: 'ceo',
  SALES: 'sales',
  ENGINEER: 'engineer',
  SUPPORT: 'support',
  MARKETING: 'marketing',
  RESEARCHER: 'researcher',
  CUSTOM: 'custom',
};

export const AGENT_STATUS = {
  ACTIVE: 'active',
  SLEEPING: 'sleeping',
  PAUSED: 'paused',
  ERROR: 'error',
  PENDING_APPROVAL: 'pending_approval',
  TERMINATED: 'terminated',
};

export const ROLE_COLORS = {
  ceo: '#6C5CE7',
  sales: '#00B894',
  engineer: '#0984E3',
  support: '#E17055',
  marketing: '#FDCB6E',
  researcher: '#A29BFE',
  custom: '#74B9FF',
};

export async function createAgent(companyId, userId, agentData) {
  const {
    name, role, reportsTo = null, systemPrompt = '',
    monthlyBudgetUsd = 20, heartbeatIntervalMinutes = 30,
    adapterType = 'openclaw_gateway', config = {},
    requiresApproval = false,
  } = agentData;

  if (requiresApproval) {
    // Create approval request instead of agent directly
    const { createApproval } = await import('./approvalService');
    const approvalId = await createApproval(companyId, userId, {
      type: 'hire_agent',
      title: `Hire ${name} (${role})`,
      description: `Request to add ${name} as ${role} agent`,
      payload: { name, role, reportsTo, systemPrompt, monthlyBudgetUsd, adapterType, config },
    });
    return { pending: true, approvalId };
  }

  const ref = await addDoc(collection(firestore, COL), {
    companyId,
    ownerId: userId,
    name,
    role,
    reportsTo,
    systemPrompt,
    status: AGENT_STATUS.SLEEPING,
    monthlyBudgetUsd,
    spentThisMonthUsd: 0,
    heartbeatIntervalMinutes,
    adapterType,
    config,
    lastHeartbeatAt: null,
    nextHeartbeatAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await logActivity(companyId, userId, 'agent', 'agent.hired', ref.id, `${name} joined the team as ${role}`);
  return { pending: false, agentId: ref.id };
}

export async function createCEOAgent(companyId, userId) {
  const data = {
    ownerId: userId,
    name: 'Freemi',
    role: AGENT_ROLES.CEO,
    reportsTo: null,
    systemPrompt: 'You are Freemi, the CEO of this company. You receive goals from the founder and delegate work to your team. You create tasks, assign them to agents, track progress, and report back. You think strategically and always ask: does this serve the company mission?',
    status: AGENT_STATUS.SLEEPING,
    monthlyBudgetUsd: 50,
    spentThisMonthUsd: 0,
    heartbeatIntervalMinutes: 30,
    adapterType: 'openclaw_gateway',
    config: {},
    lastHeartbeatAt: null,
    nextHeartbeatAt: null,
    isCEO: true,
  };
  if (isDemoMode) return localCreateAgent(companyId, data);
  const ref = await addDoc(collection(firestore, COL), {
    companyId, ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAgent(agentId, updates) {
  await updateDoc(doc(firestore, COL, agentId), { ...updates, updatedAt: serverTimestamp() });
}

export async function fireAgent(companyId, userId, agentId, reason = '') {
  const snap = await getDoc(doc(firestore, COL, agentId));
  const name = snap.data()?.name || 'Agent';
  await updateDoc(doc(firestore, COL, agentId), {
    status: AGENT_STATUS.TERMINATED,
    terminatedAt: serverTimestamp(),
    terminationReason: reason,
    updatedAt: serverTimestamp(),
  });
  await logActivity(companyId, userId, 'agent', 'agent.fired', agentId, `${name} was terminated. ${reason}`);
}

export async function pauseAgent(agentId, reason = 'manual') {
  await updateDoc(doc(firestore, COL, agentId), {
    status: AGENT_STATUS.PAUSED,
    pauseReason: reason,
    pausedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function resumeAgent(agentId) {
  await updateDoc(doc(firestore, COL, agentId), {
    status: AGENT_STATUS.SLEEPING,
    pauseReason: null,
    pausedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToAgents(companyId, cb) {
  if (isDemoMode) return localSubscribeAgents(companyId, cb);
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId),
    where('status', '!=', AGENT_STATUS.TERMINATED),
    orderBy('status'),
    orderBy('createdAt')
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function subscribeToAgent(agentId, cb) {
  return onSnapshot(doc(firestore, COL, agentId), snap => {
    if (snap.exists()) cb({ id: snap.id, ...snap.data() });
    else cb(null);
  });
}

export async function getAgent(agentId) {
  const snap = await getDoc(doc(firestore, COL, agentId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Build org tree from flat agents array
export function buildOrgTree(agents) {
  const map = {};
  const roots = [];
  agents.forEach(a => { map[a.id] = { ...a, children: [] }; });
  agents.forEach(a => {
    const parentId = a.reportsTo || a.reportsToId;
    if (parentId && map[parentId]) map[parentId].children.push(map[a.id]);
    else roots.push(map[a.id]);
  });
  return roots;
}
