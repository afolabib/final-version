/**
 * agentTools.ts — Tool definitions + executor for the agent runtime.
 * Same capabilities as the Cloud Function tools but using Firebase Admin SDK.
 */

import { getDb, serverTimestamp } from './firestoreClient';
import type { ToolDefinition } from './llm';

export const AGENT_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name:        'read_company_state',
      description: 'Get live company state: agents, goals, tasks, recent activity, pending approvals. Always call this first.',
      parameters:  { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name:        'create_task',
      description: 'Create and assign a task in the task board.',
      parameters:  {
        type: 'object',
        properties: {
          title:           { type: 'string' },
          description:     { type: 'string' },
          priority:        { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          assignedAgentId: { type: 'string', description: 'Agent ID to assign to, or null' },
          goalId:          { type: 'string', description: 'Goal ID, or null' },
        },
        required: ['title', 'priority'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name:        'update_task',
      description: 'Update status, priority, output, or assignee of an existing task. NEVER set status to "blocked" — if you cannot proceed, use create_approval to ask the founder for exactly what you need.',
      parameters:  {
        type: 'object',
        properties: {
          taskId:          { type: 'string' },
          status:          { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'], description: 'Never use blocked. If stuck, call create_approval instead.' },
          priority:        { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          outputSummary:   { type: 'string' },
          assignedAgentId: { type: 'string' },
        },
        required: ['taskId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name:        'create_goal',
      description: 'Create a new strategic goal.',
      parameters:  {
        type: 'object',
        properties: {
          title:       { type: 'string' },
          description: { type: 'string' },
          priority:    { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          emoji:       { type: 'string' },
        },
        required: ['title', 'description', 'priority'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name:        'create_approval',
      description: 'Ask the founder for something you need — a credential, decision, access, budget, or any resource blocking progress. Use this INSTEAD of marking a task blocked. Be specific: state exactly what you need, why, and what you will do once you have it.',
      parameters:  {
        type: 'object',
        properties: {
          title:       { type: 'string', description: 'Short summary of what you need, e.g. "Need Stripe API key to process payments"' },
          description: { type: 'string', description: 'Full context: what you are trying to do, what is blocking you, exactly what you need from the founder, and what you will do once you have it' },
          type:        { type: 'string', enum: ['needs_input', 'strategy_change', 'budget_override', 'external_action', 'hire_agent'], description: 'Use needs_input when blocked and waiting for a credential, decision, or resource' },
        },
        required: ['title', 'description', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name:        'hire_agent',
      description: 'Request to hire a new AI operator (creates an approval for the founder).',
      parameters:  {
        type: 'object',
        properties: {
          name:             { type: 'string' },
          role:             { type: 'string', enum: ['sales', 'engineer', 'support', 'marketing', 'researcher', 'custom'] },
          reason:           { type: 'string' },
          monthlyBudgetUsd: { type: 'number' },
        },
        required: ['name', 'role', 'reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name:        'create_workflow',
      description: 'Create a recurring workflow or automation on a schedule.',
      parameters:  {
        type: 'object',
        properties: {
          name:            { type: 'string' },
          description:     { type: 'string' },
          schedule:        { type: 'string', description: '"hourly", "daily", "weekly", or cron expression' },
          assignedAgentId: { type: 'string' },
        },
        required: ['name', 'description', 'schedule'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name:        'fetch_url',
      description: 'Fetch and read the text content of any public URL.',
      parameters:  {
        type: 'object',
        properties: {
          url: { type: 'string' },
        },
        required: ['url'],
      },
    },
  },
];

// ── Tool executor ─────────────────────────────────────────────────────────────

export async function executeAgentTool(
  name: string,
  args: Record<string, unknown>,
  context: { companyId: string; agentId: string },
): Promise<string> {
  const { companyId, agentId } = context;
  const db = getDb();

  try {
    switch (name) {

      case 'read_company_state': {
        const [agentsSnap, goalsSnap, tasksSnap, activitySnap, approvalsSnap] = await Promise.all([
          db.collection('agents').where('companyId', '==', companyId).limit(20).get(),
          db.collection('goals').where('companyId', '==', companyId).limit(10).get(),
          db.collection('tasks').where('companyId', '==', companyId).limit(30).get(),
          db.collection('activity_log').where('companyId', '==', companyId).limit(15).get(),
          db.collection('approvals').where('companyId', '==', companyId).limit(10).get(),
        ]);

        return JSON.stringify({
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
        });
      }

      case 'create_task': {
        const ref = db.collection('tasks').doc();
        await ref.set({
          companyId, title: args.title || 'Untitled task',
          description: args.description || '', priority: args.priority || 'medium',
          assignedAgentId: args.assignedAgentId || null, goalId: args.goalId || null,
          status: 'todo', createdByAgentId: agentId, requiresApproval: false,
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'task.created', ref.id, `Created task: "${args.title}"`);
        return JSON.stringify({ success: true, taskId: ref.id, title: args.title });
      }

      case 'update_task': {
        const taskId = String(args.taskId);
        const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
        if (args.status)                      updates.status          = args.status;
        if (args.priority)                    updates.priority        = args.priority;
        if (args.outputSummary)               updates.outputSummary   = args.outputSummary;
        if (args.assignedAgentId !== undefined) updates.assignedAgentId = args.assignedAgentId;
        if (args.status === 'done')           updates.completedAt     = serverTimestamp();
        await db.collection('tasks').doc(taskId).update(updates);
        return JSON.stringify({ success: true, taskId });
      }

      case 'create_goal': {
        const ref = db.collection('goals').doc();
        await ref.set({
          companyId, title: args.title || 'Untitled goal',
          description: args.description || '', priority: args.priority || 'medium',
          emoji: args.emoji || '🎯', ownerAgentId: agentId, status: 'active',
          progressPct: 0, createdByAgentId: agentId, createdByUserId: null, parentGoalId: null,
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'goal.created', ref.id, `Created goal: "${args.title}"`);
        return JSON.stringify({ success: true, goalId: ref.id, title: args.title });
      }

      case 'create_approval': {
        const ref = db.collection('approvals').doc();
        await ref.set({
          companyId, requestingActorId: agentId, requestedByAgentId: agentId,
          type: args.type || 'strategy_change', title: args.title, description: args.description,
          payload: args, status: 'pending', decidedByUserId: null, decidedAt: null,
          decisionNote: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'approval.requested', ref.id, `Approval requested: "${args.title}"`);
        return JSON.stringify({ success: true, approvalId: ref.id });
      }

      case 'hire_agent': {
        const ref = db.collection('approvals').doc();
        const agentName = String(args.name || 'New Operator');
        const agentRole = String(args.role || 'ops');
        await ref.set({
          companyId, requestingActorId: agentId, requestedByAgentId: agentId,
          type: 'hire_agent', title: `Hire ${agentName} (${agentRole})`,
          description: String(args.reason || `Hiring a ${agentRole} operator.`),
          payload: {
            name: agentName, role: agentRole, reportsTo: agentId,
            monthlyBudgetUsd: Number(args.monthlyBudgetUsd) || 30,
            heartbeatIntervalMinutes: 60, systemPrompt: '',
          },
          status: 'pending', decidedByUserId: null, decidedAt: null,
          decisionNote: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'hire.requested', ref.id, `Hire requested: ${agentName} (${agentRole})`);
        return JSON.stringify({ success: true, approvalId: ref.id, name: agentName });
      }

      case 'create_workflow': {
        const ref = db.collection('routines').doc();
        await ref.set({
          companyId, name: args.name || 'Untitled workflow',
          description: args.description || '', schedule: args.schedule || 'daily',
          assignedAgentId: args.assignedAgentId || agentId,
          status: 'active', createdByAgentId: agentId,
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'workflow.created', ref.id, `Created workflow: "${args.name}"`);
        return JSON.stringify({ success: true, workflowId: ref.id, name: args.name });
      }

      case 'fetch_url': {
        try {
          const res = await fetch(String(args.url), {
            headers: { 'User-Agent': 'Freemi-Agent/1.0' },
            signal:  AbortSignal.timeout(8000),
          });
          const html = await res.text();
          const text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 4000);
          return JSON.stringify({ url: args.url, content: text });
        } catch (err) {
          return JSON.stringify({ error: `Failed to fetch: ${(err as Error).message}` });
        }
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    return JSON.stringify({ error: (err as Error).message });
  }
}

async function logActivity(companyId: string, actorId: string, event: string, entityId: string, summary: string) {
  const db = getDb();
  await db.collection('activity_log').add({
    companyId, actorId, actorType: 'agent', event, entityId, summary,
    createdAt: serverTimestamp(),
  }).catch(() => {});
}
