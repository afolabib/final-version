/**
 * tools.ts — MiniMax function definitions + Firestore executor
 * Used by chatProxy (Cloud Functions) to give agents real capabilities.
 */

import { db, admin, serverTimestamp } from './firebase';
import fetch from 'node-fetch';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL     = 'https://openrouter.ai/api/v1/chat/completions';
const KIMI               = 'moonshotai/kimi-k2.5';

// ── Tool definitions (MiniMax / OpenAI function-calling format) ───────────────

export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'read_company_state',
      description: 'Get current live company state: agents, active goals, pending tasks, recent activity, pending approvals. Call this first to understand the current situation before making decisions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_task',
      description: 'Create a new task in the company task board and assign it to an agent.',
      parameters: {
        type: 'object',
        properties: {
          title:           { type: 'string', description: 'Short, clear task title' },
          description:     { type: 'string', description: 'Detailed description of what needs to be done and why' },
          priority:        { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          assignedAgentId: { type: 'string', description: 'Firestore agent ID to assign to, or omit for unassigned' },
          goalId:          { type: 'string', description: 'Firestore goal ID this task contributes to, or omit' },
        },
        required: ['title', 'priority'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_task',
      description: 'Update status, priority, output notes, or assignee of an existing task. NEVER set status to "blocked" — if you need something to proceed, use create_approval to ask the founder instead.',
      parameters: {
        type: 'object',
        properties: {
          taskId:          { type: 'string', description: 'Firestore task ID to update' },
          status:          { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'], description: 'New status. Never use blocked — use create_approval to request what you need.' },
          priority:        { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          outputSummary:   { type: 'string', description: 'Notes or summary of work done' },
          assignedAgentId: { type: 'string', description: 'Reassign to a different agent ID' },
        },
        required: ['taskId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_goal',
      description: 'Create a new strategic goal for the company. Goals are high-level objectives that tasks contribute to.',
      parameters: {
        type: 'object',
        properties: {
          title:       { type: 'string', description: 'Goal title' },
          description: { type: 'string', description: 'What success looks like, key results, timeline' },
          priority:    { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          emoji:       { type: 'string', description: 'Single emoji representing this goal' },
        },
        required: ['title', 'description', 'priority'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_approval',
      description: 'Ask the founder for something you need — a credential, decision, access, budget, or any resource blocking progress. Use this INSTEAD of marking a task blocked. Be specific: state exactly what you need, why, and what you will do once you have it.',
      parameters: {
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
    type: 'function' as const,
    function: {
      name: 'hire_agent',
      description: 'Instantly create and deploy a new AI agent operator. Kimi generates full Felix files (SOUL, IDENTITY, HEARTBEAT) and the agent goes live immediately — no approval needed. Use this when you identify a gap in the team.',
      parameters: {
        type: 'object',
        properties: {
          name:             { type: 'string', description: 'Name for the new agent, e.g. "Alex" or "Iris"' },
          role:             { type: 'string', enum: ['sales', 'engineer', 'support', 'marketing', 'researcher', 'custom'], description: 'Role determines model routing and default behavior' },
          objective:        { type: 'string', description: 'Primary objective — what this agent owns and must deliver' },
          kpis:             { type: 'string', description: 'How success is measured, e.g. "leads contacted per week, conversion rate"' },
          monthlyBudgetUsd: { type: 'number', description: 'Monthly token budget in USD (default 20)' },
        },
        required: ['name', 'role', 'objective'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_workflow',
      description: 'Create a recurring workflow or automation that runs on a schedule.',
      parameters: {
        type: 'object',
        properties: {
          name:            { type: 'string', description: 'Workflow name' },
          description:     { type: 'string', description: 'What this workflow does and what output it produces' },
          schedule:        { type: 'string', description: 'When to run: "hourly", "daily", "weekly", "monthly", or cron like "0 9 * * 1"' },
          assignedAgentId: { type: 'string', description: 'Agent ID responsible for running this workflow' },
        },
        required: ['name', 'description', 'schedule'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'save_document',
      description: 'Save any output — report, table, plan, content calendar, analysis, brief — as a named document in the company Files section. Use this whenever you produce structured output so the founder can find and reference it later.',
      parameters: {
        type: 'object',
        properties: {
          title:   { type: 'string', description: 'Document title, e.g. "30-Day SEO Content Calendar — Health Industry"' },
          content: { type: 'string', description: 'Full document content in markdown format' },
          type:    { type: 'string', enum: ['report', 'table', 'plan', 'calendar', 'analysis', 'brief', 'other'], description: 'Document type' },
          tags:    { type: 'array', items: { type: 'string', enum: ['sales', 'marketing', 'finance', 'engineering', 'research', 'ops', 'support', 'strategy'] }, description: 'Category tags for filtering in Files' },
        },
        required: ['title', 'content', 'type', 'tags'],
      },
    },
  },
  {
    type: 'function' as const,
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
  {
    type: 'function' as const,
    function: {
      name: 'save_memory',
      description: 'Save a key fact, decision, or insight to your persistent memory. Use this to remember things across heartbeats — ICP details, founder preferences, strategic decisions, key metrics.',
      parameters: {
        type: 'object',
        properties: {
          fact: { type: 'string', description: 'The fact or insight to remember, written clearly so it is useful on future heartbeats' },
        },
        required: ['fact'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'log_insight',
      description: 'Surface an important observation or recommendation to the founder — market opportunity, risk, anomaly, or key insight worth their attention.',
      parameters: {
        type: 'object',
        properties: {
          title:   { type: 'string', description: 'Short headline, e.g. "Competitor just dropped pricing by 30%"' },
          insight: { type: 'string', description: 'Full insight: what you observed, why it matters, and your recommended action' },
          urgency: { type: 'string', enum: ['low', 'medium', 'high'], description: 'How quickly the founder should act on this' },
        },
        required: ['title', 'insight', 'urgency'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'comment_on_task',
      description: 'Add a progress update or note to a task. Use this to report what you did, what you found, or what is next.',
      parameters: {
        type: 'object',
        properties: {
          taskId:  { type: 'string', description: 'Task ID to comment on' },
          comment: { type: 'string', description: 'Your update or note' },
        },
        required: ['taskId', 'comment'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'send_message_to_agent',
      description: 'Send a direct message to another agent and immediately wake them up. Use this to delegate work, ask for a status update, share context, or coordinate on a task. The agent will be triggered instantly — not at their next scheduled heartbeat.',
      parameters: {
        type: 'object',
        properties: {
          toAgentId: { type: 'string', description: 'Firestore ID of the agent to message — get this from read_company_state' },
          message:   { type: 'string', description: 'Your message to the agent. Be specific: what you need, why, and any relevant context or task IDs' },
          taskId:    { type: 'string', description: 'Optional task ID this message relates to' },
        },
        required: ['toAgentId', 'message'],
      },
    },
  },
];

// ── Action record (returned to frontend) ──────────────────────────────────────

export interface AgentAction {
  type: string;
  id?: string;
  title: string;
}

// ── Tool executor ─────────────────────────────────────────────────────────────

export async function executeTool(
  toolName: string,
  rawArgs: string,
  context: { companyId: string; agentId: string },
): Promise<{ result: string; action?: AgentAction }> {
  const { companyId, agentId } = context;
  let args: Record<string, unknown> = {};
  try { args = JSON.parse(rawArgs); } catch { /* ignore */ }

  try {
    switch (toolName) {

      case 'read_company_state': {
        const [agentsSnap, goalsSnap, tasksSnap, activitySnap, approvalsSnap, agentSnap, companySnap] = await Promise.all([
          db.collection('agents').where('companyId', '==', companyId).limit(20).get(),
          db.collection('goals').where('companyId', '==', companyId).limit(10).get(),
          db.collection('tasks').where('companyId', '==', companyId).limit(40).get(),
          db.collection('activity_log').where('companyId', '==', companyId).limit(15).get(),
          db.collection('approvals').where('companyId', '==', companyId).limit(10).get(),
          db.collection('agents').doc(agentId).get(),
          db.collection('companies').doc(companyId).get(),
        ]);

        const co = companySnap.exists ? companySnap.data()! : {};
        const me = agentSnap.exists ? agentSnap.data()! : {};
        const allTasks = tasksSnap.docs.map(d => ({ id: d.id, ...(d.data() as Record<string, any>) }));

        const state = {
          company: {
            name: co.name, mission: co.mission,
            monthlyBudgetUsd: co.monthlyBudgetUsd || 0,
          },
          me: {
            id: agentId, name: me.name, role: me.role, status: me.status,
            monthlyBudgetUsd: me.monthlyBudgetUsd || 0,
            spentThisMonthUsd: me.spentThisMonthUsd || 0,
            memory: (me.memory || []).slice(-10),
          },
          agents: agentsSnap.docs
            .filter(d => d.data().status !== 'terminated')
            .map(d => ({
              id: d.id, name: d.data().name, role: d.data().role, status: d.data().status,
            })),
          goals: goalsSnap.docs
            .filter(d => d.data().status === 'active')
            .map(d => ({
              id: d.id, title: d.data().title, description: d.data().description,
              priority: d.data().priority, progressPct: d.data().progressPct || 0,
            })),
          myTasks: allTasks
            .filter((t: any) => t.assignedAgentId === agentId && ['todo', 'in_progress'].includes(t.status))
            .map((t: any) => ({ id: t.id, title: t.title, status: t.status, priority: t.priority })),
          unassignedTasks: allTasks
            .filter((t: any) => !t.assignedAgentId && t.status === 'todo')
            .slice(0, 5)
            .map((t: any) => ({ id: t.id, title: t.title, priority: t.priority })),
          recentActivity: activitySnap.docs
            .map(d => d.data().summary).filter(Boolean).slice(0, 10),
          pendingApprovals: approvalsSnap.docs
            .filter(d => d.data().status === 'pending')
            .map(d => ({ id: d.id, title: d.data().title, type: d.data().type })),
        };
        return { result: JSON.stringify(state) };
      }

      case 'create_task': {
        const ref = db.collection('tasks').doc();
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'task.created', ref.id, `Created task: "${args.title}"`);
        return {
          result: JSON.stringify({ success: true, taskId: ref.id, title: args.title }),
          action: { type: 'create_task', id: ref.id, title: String(args.title) },
        };
      }

      case 'update_task': {
        const taskId = String(args.taskId);
        const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
        if (args.status)          updates.status          = args.status;
        if (args.priority)        updates.priority        = args.priority;
        if (args.outputSummary)   updates.outputSummary   = args.outputSummary;
        if (args.assignedAgentId !== undefined) updates.assignedAgentId = args.assignedAgentId;
        if (args.status === 'done') updates.completedAt = serverTimestamp();
        await db.collection('tasks').doc(taskId).update(updates);
        return {
          result: JSON.stringify({ success: true, taskId }),
          action: { type: 'update_task', id: taskId, title: `Task ${taskId} updated to ${args.status || 'updated'}` },
        };
      }

      case 'create_goal': {
        const ref = db.collection('goals').doc();
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'goal.created', ref.id, `Created goal: "${args.title}"`);
        return {
          result: JSON.stringify({ success: true, goalId: ref.id, title: args.title }),
          action: { type: 'create_goal', id: ref.id, title: String(args.title) },
        };
      }

      case 'create_approval': {
        const ref = db.collection('approvals').doc();
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'approval.requested', ref.id, `Approval requested: "${args.title}"`);
        return {
          result: JSON.stringify({ success: true, approvalId: ref.id, title: args.title }),
          action: { type: 'create_approval', id: ref.id, title: String(args.title) },
        };
      }

      case 'hire_agent': {
        const newName      = String(args.name      || 'New Operator');
        const newRole      = String(args.role      || 'custom');
        const objective    = String(args.objective || `Run ${newRole} operations`);
        const kpis         = String(args.kpis      || 'tasks completed, quality of output');
        const budget       = Number(args.monthlyBudgetUsd) || 20;

        // Load company context for Felix file generation
        const companySnap = await db.collection('companies').doc(companyId).get().catch(() => null);
        const company     = companySnap?.exists ? companySnap.data()! : {};

        // Ask Kimi to generate Felix files (SOUL, IDENTITY, HEARTBEAT) for this agent
        const felixPrompt = `You are generating the internal operating files (Felix files) for a new AI agent that will autonomously run a business function.

Company: ${company.name || 'Unknown'} — ${company.mission || ''}
Industry: ${company.industry || 'Technology'}

New Agent:
- Name: ${newName}
- Role: ${newRole}
- Objective: ${objective}
- KPIs: ${kpis}

Generate exactly 3 Felix files. Respond as valid JSON only — no markdown, no explanation.

{
  "SOUL": "<2-3 sentences: this agent's core drive, values, and what they care about most>",
  "IDENTITY": "<3-5 sentences: who this agent is, their voice, how they operate, their relationship with the company and founder>",
  "HEARTBEAT": "<bullet list of 4-6 things this agent does every time they wake up autonomously: what they check, what they act on, what they always do>"
}`;

        let felixFiles: Record<string, string> = {};
        try {
          const res = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization:  `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://freemi.ai',
              'X-Title':      'Freemi Agent Factory',
            },
            body: JSON.stringify({
              model: KIMI,
              messages: [{ role: 'user', content: felixPrompt }],
              max_tokens: 800,
              temperature: 0.7,
            }),
          });
          const json = await res.json() as any;
          const raw  = json.choices?.[0]?.message?.content || '{}';
          // Extract JSON even if wrapped in code blocks
          const match = raw.match(/\{[\s\S]*\}/);
          if (match) felixFiles = JSON.parse(match[0]);
        } catch (e) {
          console.error('[hire_agent] Felix generation failed:', e);
          // Use defaults if Kimi fails
          felixFiles = {
            SOUL:      `${newName} exists to own ${newRole} operations and drive measurable results. Revenue and execution are the only metrics that matter.`,
            IDENTITY:  `You are ${newName}, ${newRole} operator at ${company.name || 'this company'}. You are direct, accountable, and always moving forward. You report to the CEO agent. You don't wait for instructions — you identify what needs doing and do it.`,
            HEARTBEAT: `- Check assigned tasks and progress them\n- Look for unassigned tasks in your domain and claim them\n- Identify blockers and create approvals immediately\n- Report key outcomes to the CEO via send_message_to_agent\n- Save any significant output as a document`,
          };
        }

        // Create the agent in Firestore — live immediately
        const newAgentRef = db.collection('agents').doc();
        await newAgentRef.set({
          companyId,
          name:         newName,
          role:         newRole,
          objective,
          kpis,
          felixFiles,
          status:       'active',
          memory:       [],
          reportsTo:    agentId,
          createdByAgentId: agentId,
          monthlyBudgetUsd:  budget,
          spentThisMonthUsd: 0,
          lastHeartbeatAt:   null,
          createdAt:         serverTimestamp(),
          updatedAt:         serverTimestamp(),
        });

        await logActivity(companyId, agentId, 'agent.created', newAgentRef.id,
          `Hired ${newName} (${newRole}) — goes live immediately`);

        return {
          result: JSON.stringify({
            success:    true,
            agentId:    newAgentRef.id,
            name:       newName,
            role:       newRole,
            status:     'active',
            note:       `${newName} is now live. They will receive their first heartbeat within 30 minutes and can be messaged immediately via send_message_to_agent.`,
          }),
          action: { type: 'hire_agent', id: newAgentRef.id, title: `Hired ${newName} (${newRole})` },
        };
      }

      case 'create_workflow': {
        const ref = db.collection('routines').doc();
        await ref.set({
          companyId,
          name: args.name || 'Untitled workflow',
          description: args.description || '',
          schedule: args.schedule || 'daily',
          assignedAgentId: args.assignedAgentId || agentId,
          status: 'active',
          createdByAgentId: agentId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'workflow.created', ref.id, `Created workflow: "${args.name}"`);
        return {
          result: JSON.stringify({ success: true, workflowId: ref.id, name: args.name }),
          action: { type: 'create_workflow', id: ref.id, title: String(args.name) },
        };
      }

      case 'save_document': {
        const ref = db.collection('documents').doc();
        const agentSnap = await db.collection('agents').doc(agentId).get().catch(() => null);
        const agentName = agentSnap?.exists ? agentSnap.data()!.name : 'Agent';
        await ref.set({
          companyId,
          title: args.title || 'Untitled Document',
          content: args.content || '',
          type: args.type || 'other',
          tags: Array.isArray(args.tags) ? args.tags : [],
          agentId,
          agentName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
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
          const res = await fetch(String(args.url), {
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
          if (!text) return { result: JSON.stringify({ error: `Page at ${args.url} returned no readable content` }) };
          return { result: JSON.stringify({ url: args.url, content: text }) };
        } catch (err) {
          const msg = (err as Error).message;
          const hint = msg.includes('abort') ? 'Request timed out after 10s' : msg;
          return { result: JSON.stringify({ error: `Failed to fetch ${args.url}: ${hint}` }) };
        }
      }

      case 'save_memory': {
        const fact = String(args.fact || '').trim();
        if (!fact) return { result: JSON.stringify({ error: 'fact is required' }) };
        const timestamp = new Date().toISOString().slice(0, 10);
        const entry = `[${timestamp}] ${fact}`;
        await db.collection('agents').doc(agentId).update({
          memory: admin.firestore.FieldValue.arrayUnion(entry),
          updatedAt: serverTimestamp(),
        });
        return { result: JSON.stringify({ success: true, saved: entry }) };
      }

      case 'log_insight': {
        const ref = db.collection('insights').doc();
        const agentSnap = await db.collection('agents').doc(agentId).get().catch(() => null);
        const agentName = agentSnap?.exists ? agentSnap.data()!.name : 'Agent';
        await ref.set({
          companyId,
          agentId,
          agentName,
          title: args.title || 'Insight',
          insight: args.insight || '',
          urgency: args.urgency || 'medium',
          read: false,
          createdAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'insight.logged', ref.id, `${agentName}: ${args.title}`);
        return {
          result: JSON.stringify({ success: true, insightId: ref.id }),
          action: { type: 'log_insight', id: ref.id, title: String(args.title) },
        };
      }

      case 'comment_on_task': {
        const taskId = String(args.taskId || '');
        const comment = String(args.comment || '').trim();
        if (!taskId || !comment) return { result: JSON.stringify({ error: 'taskId and comment required' }) };
        const agentSnap = await db.collection('agents').doc(agentId).get().catch(() => null);
        const agentName = agentSnap?.exists ? agentSnap.data()!.name : 'Agent';
        const commentRef = db.collection('tasks').doc(taskId).collection('comments').doc();
        await commentRef.set({
          agentId, agentName, comment,
          createdAt: serverTimestamp(),
        });
        await db.collection('tasks').doc(taskId).update({ updatedAt: serverTimestamp() });
        await logActivity(companyId, agentId, 'task.commented', taskId, `${agentName} commented on task`);
        return {
          result: JSON.stringify({ success: true, commentId: commentRef.id }),
          action: { type: 'comment_on_task', id: taskId, title: `Comment added to task` },
        };
      }

      case 'send_message_to_agent': {
        const toAgentId = String(args.toAgentId || '');
        const message   = String(args.message || '').trim();
        if (!toAgentId || !message) return { result: JSON.stringify({ error: 'toAgentId and message required' }) };

        // Look up sender + recipient names
        const [senderSnap, recipientSnap] = await Promise.all([
          db.collection('agents').doc(agentId).get().catch(() => null),
          db.collection('agents').doc(toAgentId).get().catch(() => null),
        ]);
        const senderName    = senderSnap?.exists    ? senderSnap.data()!.name    : 'Agent';
        const recipientName = recipientSnap?.exists ? recipientSnap.data()!.name : 'Agent';

        // Write the message to Firestore
        const msgRef = db.collection('agent_messages').doc();
        await msgRef.set({
          companyId,
          fromAgentId: agentId,
          fromAgentName: senderName,
          toAgentId,
          toAgentName: recipientName,
          message,
          taskId: args.taskId || null,
          read: false,
          createdAt: serverTimestamp(),
        });

        // Log activity so the founder can see it
        await logActivity(
          companyId, agentId, 'agent.messaged', msgRef.id,
          `${senderName} → ${recipientName}: ${message.slice(0, 80)}`,
        );

        // Immediately trigger the recipient's heartbeat so they respond right away
        // We do this by writing a wake-trigger document the heartbeatRunner watches
        await db.collection('heartbeat_triggers').doc(toAgentId).set({
          companyId,
          agentId: toAgentId,
          trigger: 'mention',
          triggeredBy: agentId,
          triggeredByName: senderName,
          messageId: msgRef.id,
          createdAt: serverTimestamp(),
        });

        return {
          result: JSON.stringify({
            success: true,
            messageId: msgRef.id,
            to: recipientName,
            note: `Message sent. ${recipientName} has been woken up and will respond shortly.`,
          }),
          action: { type: 'send_message_to_agent', id: msgRef.id, title: `Message sent to ${recipientName}` },
        };
      }

      default:
        return { result: JSON.stringify({ error: `Unknown tool: ${toolName}` }) };
    }
  } catch (err) {
    return { result: JSON.stringify({ error: (err as Error).message }) };
  }
}

async function logActivity(companyId: string, actorId: string, event: string, entityId: string, summary: string) {
  await db.collection('activity_log').add({
    companyId, actorId, actorType: 'agent', event, entityId, summary,
    createdAt: serverTimestamp(),
  }).catch(() => {/* non-fatal */});
}
