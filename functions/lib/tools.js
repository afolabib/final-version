"use strict";
/**
 * tools.ts — MiniMax function definitions + Firestore executor
 * Used by chatProxy (Cloud Functions) to give agents real capabilities.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITIONS = void 0;
exports.executeTool = executeTool;
const firebase_1 = require("./firebase");
const node_fetch_1 = __importDefault(require("node-fetch"));
// ── Tool definitions (MiniMax / OpenAI function-calling format) ───────────────
exports.TOOL_DEFINITIONS = [
    {
        type: 'function',
        function: {
            name: 'read_company_state',
            description: 'Get current live company state: agents, active goals, pending tasks, recent activity, pending approvals. Call this first to understand the current situation before making decisions.',
            parameters: { type: 'object', properties: {}, required: [] },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_task',
            description: 'Create a new task in the company task board and assign it to an agent.',
            parameters: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'Short, clear task title' },
                    description: { type: 'string', description: 'Detailed description of what needs to be done and why' },
                    priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                    assignedAgentId: { type: 'string', description: 'Firestore agent ID to assign to, or omit for unassigned' },
                    goalId: { type: 'string', description: 'Firestore goal ID this task contributes to, or omit' },
                },
                required: ['title', 'priority'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'update_task',
            description: 'Update status, priority, output notes, or assignee of an existing task. NEVER set status to "blocked" — if you need something to proceed, use create_approval to ask the founder instead.',
            parameters: {
                type: 'object',
                properties: {
                    taskId: { type: 'string', description: 'Firestore task ID to update' },
                    status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'], description: 'New status. Never use blocked — use create_approval to request what you need.' },
                    priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                    outputSummary: { type: 'string', description: 'Notes or summary of work done' },
                    assignedAgentId: { type: 'string', description: 'Reassign to a different agent ID' },
                },
                required: ['taskId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_goal',
            description: 'Create a new strategic goal for the company. Goals are high-level objectives that tasks contribute to.',
            parameters: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'Goal title' },
                    description: { type: 'string', description: 'What success looks like, key results, timeline' },
                    priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                    emoji: { type: 'string', description: 'Single emoji representing this goal' },
                },
                required: ['title', 'description', 'priority'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_approval',
            description: 'Ask the founder for something you need — a credential, decision, access, budget, or any resource blocking progress. Use this INSTEAD of marking a task blocked. Be specific: state exactly what you need, why, and what you will do once you have it.',
            parameters: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'Short summary of what you need, e.g. "Need Stripe API key to process payments"' },
                    description: { type: 'string', description: 'Full context: what you are trying to do, what is blocking you, exactly what you need from the founder, and what you will do once you have it' },
                    type: { type: 'string', enum: ['needs_input', 'strategy_change', 'budget_override', 'external_action', 'hire_agent'], description: 'Use needs_input when blocked and waiting for a credential, decision, or resource' },
                },
                required: ['title', 'description', 'type'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'hire_agent',
            description: 'Request to hire a new AI agent operator. Creates a pending approval the founder must approve.',
            parameters: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Name for the new agent' },
                    role: { type: 'string', enum: ['sales', 'engineer', 'support', 'marketing', 'researcher', 'custom'] },
                    reason: { type: 'string', description: 'Business case for hiring — what gap does this fill?' },
                    monthlyBudgetUsd: { type: 'number', description: 'Monthly token budget in USD (default 30)' },
                },
                required: ['name', 'role', 'reason'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_workflow',
            description: 'Create a recurring workflow or automation that runs on a schedule.',
            parameters: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Workflow name' },
                    description: { type: 'string', description: 'What this workflow does and what output it produces' },
                    schedule: { type: 'string', description: 'When to run: "hourly", "daily", "weekly", "monthly", or cron like "0 9 * * 1"' },
                    assignedAgentId: { type: 'string', description: 'Agent ID responsible for running this workflow' },
                },
                required: ['name', 'description', 'schedule'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'save_document',
            description: 'Save any output — report, table, plan, content calendar, analysis, brief — as a named document in the company Files section. Use this whenever you produce structured output so the founder can find and reference it later.',
            parameters: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'Document title, e.g. "30-Day SEO Content Calendar — Health Industry"' },
                    content: { type: 'string', description: 'Full document content in markdown format' },
                    type: { type: 'string', enum: ['report', 'table', 'plan', 'calendar', 'analysis', 'brief', 'other'], description: 'Document type' },
                    tags: { type: 'array', items: { type: 'string', enum: ['sales', 'marketing', 'finance', 'engineering', 'research', 'ops', 'support', 'strategy'] }, description: 'Category tags for filtering in Files' },
                },
                required: ['title', 'content', 'type', 'tags'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'fetch_url',
            description: 'Fetch and read the text content of any public URL — websites, articles, competitor pages, docs.',
            parameters: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'Full URL to fetch (must start with https://)' },
                },
                required: ['url'],
            },
        },
    },
];
// ── Tool executor ─────────────────────────────────────────────────────────────
async function executeTool(toolName, rawArgs, context) {
    const { companyId, agentId } = context;
    let args = {};
    try {
        args = JSON.parse(rawArgs);
    }
    catch { /* ignore */ }
    try {
        switch (toolName) {
            case 'read_company_state': {
                // Use single-field queries only to avoid requiring composite indexes
                const [agentsSnap, goalsSnap, tasksSnap, activitySnap, approvalsSnap] = await Promise.all([
                    firebase_1.db.collection('agents').where('companyId', '==', companyId).limit(20).get(),
                    firebase_1.db.collection('goals').where('companyId', '==', companyId).limit(10).get(),
                    firebase_1.db.collection('tasks').where('companyId', '==', companyId).limit(30).get(),
                    firebase_1.db.collection('activity_log').where('companyId', '==', companyId).limit(15).get(),
                    firebase_1.db.collection('approvals').where('companyId', '==', companyId).limit(10).get(),
                ]);
                const state = {
                    agents: agentsSnap.docs
                        .filter(d => d.data().status !== 'terminated')
                        .map(d => ({
                        id: d.id, name: d.data().name, role: d.data().role,
                        status: d.data().status, machineStatus: d.data().machineStatus,
                    })),
                    goals: goalsSnap.docs
                        .filter(d => d.data().status === 'active')
                        .map(d => ({
                        id: d.id, title: d.data().title, description: d.data().description,
                        priority: d.data().priority, progressPct: d.data().progressPct || 0,
                    })),
                    tasks: tasksSnap.docs
                        .filter(d => ['todo', 'in_progress'].includes(d.data().status))
                        .map(d => ({
                        id: d.id, title: d.data().title, status: d.data().status,
                        priority: d.data().priority, assignedAgentId: d.data().assignedAgentId || 'unassigned',
                    })),
                    recentActivity: activitySnap.docs.map(d => d.data().summary).filter(Boolean).slice(0, 10),
                    pendingApprovals: approvalsSnap.docs
                        .filter(d => d.data().status === 'pending')
                        .map(d => ({ id: d.id, title: d.data().title, type: d.data().type })),
                };
                return { result: JSON.stringify(state) };
            }
            case 'create_task': {
                const ref = firebase_1.db.collection('tasks').doc();
                await ref.set({
                    companyId,
                    title: args.title || 'Untitled task',
                    description: args.description || '',
                    priority: args.priority || 'medium',
                    assignedAgentId: args.assignedAgentId || null,
                    goalId: args.goalId || null,
                    status: 'todo',
                    createdByAgentId: agentId,
                    requiresApproval: false,
                    createdAt: (0, firebase_1.serverTimestamp)(),
                    updatedAt: (0, firebase_1.serverTimestamp)(),
                });
                await logActivity(companyId, agentId, 'task.created', ref.id, `Created task: "${args.title}"`);
                return {
                    result: JSON.stringify({ success: true, taskId: ref.id, title: args.title }),
                    action: { type: 'create_task', id: ref.id, title: String(args.title) },
                };
            }
            case 'update_task': {
                const taskId = String(args.taskId);
                const updates = { updatedAt: (0, firebase_1.serverTimestamp)() };
                if (args.status)
                    updates.status = args.status;
                if (args.priority)
                    updates.priority = args.priority;
                if (args.outputSummary)
                    updates.outputSummary = args.outputSummary;
                if (args.assignedAgentId !== undefined)
                    updates.assignedAgentId = args.assignedAgentId;
                if (args.status === 'done')
                    updates.completedAt = (0, firebase_1.serverTimestamp)();
                await firebase_1.db.collection('tasks').doc(taskId).update(updates);
                return {
                    result: JSON.stringify({ success: true, taskId }),
                    action: { type: 'update_task', id: taskId, title: `Task ${taskId} updated to ${args.status || 'updated'}` },
                };
            }
            case 'create_goal': {
                const ref = firebase_1.db.collection('goals').doc();
                await ref.set({
                    companyId,
                    title: args.title || 'Untitled goal',
                    description: args.description || '',
                    priority: args.priority || 'medium',
                    emoji: args.emoji || '🎯',
                    ownerAgentId: agentId,
                    status: 'active',
                    progressPct: 0,
                    createdByAgentId: agentId,
                    createdByUserId: null,
                    parentGoalId: null,
                    createdAt: (0, firebase_1.serverTimestamp)(),
                    updatedAt: (0, firebase_1.serverTimestamp)(),
                });
                await logActivity(companyId, agentId, 'goal.created', ref.id, `Created goal: "${args.title}"`);
                return {
                    result: JSON.stringify({ success: true, goalId: ref.id, title: args.title }),
                    action: { type: 'create_goal', id: ref.id, title: String(args.title) },
                };
            }
            case 'create_approval': {
                const ref = firebase_1.db.collection('approvals').doc();
                await ref.set({
                    companyId,
                    requestingActorId: agentId,
                    requestedByAgentId: agentId,
                    type: args.type || 'strategy_change',
                    title: args.title,
                    description: args.description,
                    payload: args,
                    status: 'pending',
                    decidedByUserId: null,
                    decidedAt: null,
                    decisionNote: '',
                    createdAt: (0, firebase_1.serverTimestamp)(),
                    updatedAt: (0, firebase_1.serverTimestamp)(),
                });
                await logActivity(companyId, agentId, 'approval.requested', ref.id, `Approval requested: "${args.title}"`);
                return {
                    result: JSON.stringify({ success: true, approvalId: ref.id, title: args.title }),
                    action: { type: 'create_approval', id: ref.id, title: String(args.title) },
                };
            }
            case 'hire_agent': {
                const ref = firebase_1.db.collection('approvals').doc();
                const agentName = String(args.name || 'New Operator');
                const agentRole = String(args.role || 'ops');
                await ref.set({
                    companyId,
                    requestingActorId: agentId,
                    requestedByAgentId: agentId,
                    type: 'hire_agent',
                    title: `Hire ${agentName} (${agentRole})`,
                    description: String(args.reason || `Hiring a ${agentRole} operator.`),
                    payload: {
                        name: agentName,
                        role: agentRole,
                        reportsTo: agentId,
                        monthlyBudgetUsd: Number(args.monthlyBudgetUsd) || 30,
                        heartbeatIntervalMinutes: 60,
                        systemPrompt: '',
                    },
                    status: 'pending',
                    decidedByUserId: null,
                    decidedAt: null,
                    decisionNote: '',
                    createdAt: (0, firebase_1.serverTimestamp)(),
                    updatedAt: (0, firebase_1.serverTimestamp)(),
                });
                await logActivity(companyId, agentId, 'hire.requested', ref.id, `Hire requested: ${agentName} (${agentRole})`);
                return {
                    result: JSON.stringify({ success: true, approvalId: ref.id, name: agentName }),
                    action: { type: 'hire_agent', id: ref.id, title: `${agentName} (${agentRole})` },
                };
            }
            case 'create_workflow': {
                const ref = firebase_1.db.collection('routines').doc();
                await ref.set({
                    companyId,
                    name: args.name || 'Untitled workflow',
                    description: args.description || '',
                    schedule: args.schedule || 'daily',
                    assignedAgentId: args.assignedAgentId || agentId,
                    status: 'active',
                    createdByAgentId: agentId,
                    createdAt: (0, firebase_1.serverTimestamp)(),
                    updatedAt: (0, firebase_1.serverTimestamp)(),
                });
                await logActivity(companyId, agentId, 'workflow.created', ref.id, `Created workflow: "${args.name}"`);
                return {
                    result: JSON.stringify({ success: true, workflowId: ref.id, name: args.name }),
                    action: { type: 'create_workflow', id: ref.id, title: String(args.name) },
                };
            }
            case 'save_document': {
                const ref = firebase_1.db.collection('documents').doc();
                const agentSnap = await firebase_1.db.collection('agents').doc(agentId).get().catch(() => null);
                const agentName = agentSnap?.exists ? agentSnap.data().name : 'Agent';
                await ref.set({
                    companyId,
                    title: args.title || 'Untitled Document',
                    content: args.content || '',
                    type: args.type || 'other',
                    tags: Array.isArray(args.tags) ? args.tags : [],
                    agentId,
                    agentName,
                    createdAt: (0, firebase_1.serverTimestamp)(),
                    updatedAt: (0, firebase_1.serverTimestamp)(),
                });
                await logActivity(companyId, agentId, 'document.created', ref.id, `Document saved: "${args.title}"`);
                return {
                    result: JSON.stringify({ success: true, documentId: ref.id, title: args.title }),
                    action: { type: 'save_document', id: ref.id, title: String(args.title) },
                };
            }
            case 'fetch_url': {
                try {
                    const controller = new AbortController();
                    const timer = setTimeout(() => controller.abort(), 10000);
                    const res = await (0, node_fetch_1.default)(String(args.url), {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (compatible; Freemi-Agent/1.0)',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
                        },
                        signal: controller.signal,
                    });
                    clearTimeout(timer);
                    const html = await res.text();
                    const text = html
                        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .slice(0, 6000);
                    if (!text)
                        return { result: JSON.stringify({ error: `Page at ${args.url} returned no readable content` }) };
                    return { result: JSON.stringify({ url: args.url, content: text }) };
                }
                catch (err) {
                    const msg = err.message;
                    const hint = msg.includes('abort') ? 'Request timed out after 10s' : msg;
                    return { result: JSON.stringify({ error: `Failed to fetch ${args.url}: ${hint}` }) };
                }
            }
            default:
                return { result: JSON.stringify({ error: `Unknown tool: ${toolName}` }) };
        }
    }
    catch (err) {
        return { result: JSON.stringify({ error: err.message }) };
    }
}
async function logActivity(companyId, actorId, event, entityId, summary) {
    await firebase_1.db.collection('activity_log').add({
        companyId, actorId, actorType: 'agent', event, entityId, summary,
        createdAt: (0, firebase_1.serverTimestamp)(),
    }).catch(() => { });
}
