/**
 * localStorage-backed database for demo mode (no Firebase credentials).
 * Implements the same interface as the Firestore services.
 */

const P = 'freemios_';
const get = k => { try { return JSON.parse(localStorage.getItem(P + k)); } catch { return null; } };
const set = (k, v) => localStorage.setItem(P + k, JSON.stringify(v));
const uid_gen = () => Math.random().toString(36).slice(2, 10);

// ─── Companies ───────────────────────────────────────────────────────────────

export function localGetUserCompanies(uid) {
  const all = get('companies') || {};
  return Object.values(all).filter(c => c.ownerId === uid);
}

export function localCreateCompany(uid, { name, mission, industry = '', size = 'startup' }) {
  const id = 'co-' + uid_gen();
  const all = get('companies') || {};
  all[id] = { id, ownerId: uid, name, mission, industry, size, planId: 'starter', isBootstrapped: false, createdAt: new Date().toISOString() };
  set('companies', all);
  return id;
}

export function localGetCompany(companyId) {
  const all = get('companies') || {};
  return all[companyId] || null;
}

export function localUpdateCompany(companyId, updates) {
  const all = get('companies') || {};
  if (all[companyId]) { all[companyId] = { ...all[companyId], ...updates }; set('companies', all); }
}

export function localSubscribeToCompany(companyId, cb) {
  const data = localGetCompany(companyId);
  cb(data);
  // Poll for changes every 500ms (simple reactivity for local mode)
  const iv = setInterval(() => cb(localGetCompany(companyId)), 500);
  return () => clearInterval(iv);
}

// ─── Agents ──────────────────────────────────────────────────────────────────

export function localGetAgents(companyId) {
  return (get('agents_' + companyId) || []).filter(a => a.status !== 'terminated');
}

export function localCreateAgent(companyId, agentData) {
  const id = 'ag-' + uid_gen();
  const agents = get('agents_' + companyId) || [];
  agents.push({ id, companyId, ...agentData, createdAt: new Date().toISOString() });
  set('agents_' + companyId, agents);
  return id;
}

export function localUpdateAgent(companyId, agentId, updates) {
  const agents = get('agents_' + companyId) || [];
  const idx = agents.findIndex(a => a.id === agentId);
  if (idx !== -1) { agents[idx] = { ...agents[idx], ...updates }; set('agents_' + companyId, agents); }
}

export function localSubscribeAgents(companyId, cb) {
  cb(localGetAgents(companyId));
  const iv = setInterval(() => cb(localGetAgents(companyId)), 500);
  return () => clearInterval(iv);
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export function localGetGoals(companyId) {
  return get('goals_' + companyId) || [];
}

export function localCreateGoal(companyId, userId, data) {
  const id = 'goal-' + uid_gen();
  const goals = localGetGoals(companyId);
  goals.unshift({ id, companyId, createdByUserId: userId, status: 'active', progressPct: 0, ...data, createdAt: new Date().toISOString() });
  set('goals_' + companyId, goals);
  return id;
}

export function localUpdateGoal(companyId, goalId, updates) {
  const goals = localGetGoals(companyId);
  const idx = goals.findIndex(g => g.id === goalId);
  if (idx !== -1) { goals[idx] = { ...goals[idx], ...updates }; set('goals_' + companyId, goals); }
}

export function localSubscribeGoals(companyId, cb) {
  cb(localGetGoals(companyId));
  const iv = setInterval(() => cb(localGetGoals(companyId)), 500);
  return () => clearInterval(iv);
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export function localGetTasks(companyId) {
  return get('tasks_' + companyId) || [];
}

export function localCreateTask(companyId, userId, data) {
  const id = 'task-' + uid_gen();
  const tasks = localGetTasks(companyId);
  tasks.unshift({ id, companyId, createdByUserId: userId, status: 'todo', ...data, createdAt: new Date().toISOString() });
  set('tasks_' + companyId, tasks);
  return id;
}

export function localUpdateTask(companyId, taskId, updates) {
  const tasks = localGetTasks(companyId);
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx !== -1) { tasks[idx] = { ...tasks[idx], ...updates }; set('tasks_' + companyId, tasks); }
}

export function localSubscribeTasks(companyId, cb) {
  cb(localGetTasks(companyId));
  const iv = setInterval(() => cb(localGetTasks(companyId)), 500);
  return () => clearInterval(iv);
}

// ─── Approvals ───────────────────────────────────────────────────────────────

export function localGetApprovals(companyId) {
  return (get('approvals_' + companyId) || []).filter(a => a.status === 'pending');
}

export function localSubscribeApprovals(companyId, cb) {
  cb(localGetApprovals(companyId));
  const iv = setInterval(() => cb(localGetApprovals(companyId)), 500);
  return () => clearInterval(iv);
}

export function localApproveRequest(companyId, userId, approvalId) {
  const all = get('approvals_' + companyId) || [];
  const idx = all.findIndex(a => a.id === approvalId);
  if (idx !== -1) { all[idx] = { ...all[idx], status: 'approved', decidedByUserId: userId, decidedAt: new Date().toISOString() }; }
  set('approvals_' + companyId, all);
}

export function localRejectRequest(companyId, userId, approvalId, note = '') {
  const all = get('approvals_' + companyId) || [];
  const idx = all.findIndex(a => a.id === approvalId);
  if (idx !== -1) { all[idx] = { ...all[idx], status: 'rejected', decidedByUserId: userId, decidedAt: new Date().toISOString(), decisionNote: note }; }
  set('approvals_' + companyId, all);
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export function localGetActivity(companyId, limit = 50) {
  return (get('activity_' + companyId) || []).slice(0, limit);
}

export function localLogActivity(companyId, event) {
  const activity = localGetActivity(companyId);
  activity.unshift({ id: 'act-' + uid_gen(), companyId, ...event, createdAt: new Date().toISOString() });
  set('activity_' + companyId, activity.slice(0, 200));
}

export function localSubscribeActivity(companyId, cb, limit = 50) {
  cb(localGetActivity(companyId, limit));
  const iv = setInterval(() => cb(localGetActivity(companyId, limit)), 500);
  return () => clearInterval(iv);
}
