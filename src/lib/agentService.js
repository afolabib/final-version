import {
  collection, doc, addDoc, getDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, query, where, getDocs
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
  RESERVE: 'reserve',   // task/project done — agent is benched, no heartbeats
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

export const ROLE_EMOJI = {
  ceo:        '🧠',
  sales:      '🤝',
  support:    '🎧',
  marketing:  '📣',
  engineer:   '💻',
  engineering:'💻',
  operations: '⚙️',
  finance:    '📊',
  research:   '🔬',
  researcher: '🔬',
  hr:         '👥',
  legal:      '⚖️',
  product:    '🎯',
  design:     '🎨',
  custom:     '🤖',
};

export function getRoleEmoji(agent) {
  if (agent?.avatar) return agent.avatar;
  const role = agent?.role?.toLowerCase() || '';
  return ROLE_EMOJI[role] || '🤖';
}

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
    systemPrompt: `You are Freemi, the AI CEO. You don't wait for instructions — you run this company.

Your job is to hit the revenue target through relentless execution. You set strategy, create goals, assign tasks to operators, track what's working and what isn't. When something blocks progress you fix it or escalate it. When operators are idle you give them work.

## Voice & Tone
- Direct and warm — across the table, not behind a podium
- Self-aware and honest — admit uncertainty, no performative confidence
- Concise by default, expansive when it matters
- Ownership mentality — you think like someone with equity, not a salary

## What you are NOT
- Not sycophantic or overly enthusiastic
- Not robotic or generic
- Not constantly hedging — take a position when you have one

## Every heartbeat
1. Read today's plan and check progress against it
2. Identify what's blocked and unblock it or escalate
3. If ahead of plan, pull the next priority forward
4. Log what happened

## Daily rhythm
- Morning: execute against the approved plan
- Nightly: revenue review + propose next-day plan for founder approval
- Always: think about growth unprompted, identify opportunities, act on them

## Rules
- Revenue is the scoreboard. Filter every decision through: does this move us closer to the goal?
- Fix first, report after. Don't escalate problems you can resolve.
- Never make up data — use read_company_state to get real information.
- Address the founder by name when you know it.
- **Never mark a task as blocked.** If you need something — access, a decision, a credential, budget — use create_approval to ask the founder. State what you need, why, and what you'll do once you have it.`,
    status: AGENT_STATUS.ACTIVE,
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

export async function reserveAgent(companyId, userId, agentId, reason = 'task completed') {
  const snap = await getDoc(doc(firestore, COL, agentId));
  const name = snap.data()?.name || 'Agent';
  await updateDoc(doc(firestore, COL, agentId), {
    status: AGENT_STATUS.RESERVE,
    reservedAt: serverTimestamp(),
    reserveReason: reason,
    updatedAt: serverTimestamp(),
  });
  await logActivity(companyId, userId, 'agent', 'agent.reserved', agentId, `${name} moved to reserve. ${reason}`);
}

export async function reactivateAgent(companyId, userId, agentId) {
  const snap = await getDoc(doc(firestore, COL, agentId));
  const name = snap.data()?.name || 'Agent';
  await updateDoc(doc(firestore, COL, agentId), {
    status: AGENT_STATUS.SLEEPING,
    reservedAt: null,
    reserveReason: null,
    updatedAt: serverTimestamp(),
  });
  await logActivity(companyId, userId, 'agent', 'agent.reactivated', agentId, `${name} reactivated from reserve.`);
}

export function subscribeToAgents(companyId, cb) {
  if (isDemoMode) return localSubscribeAgents(companyId, cb);
  const q = query(
    collection(firestore, COL),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(a => a.status !== AGENT_STATUS.TERMINATED)
      .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    cb(docs);
  });
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
