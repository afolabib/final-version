/**
 * agentTools.ts — Tool definitions + executor for the agent runtime.
 */

import { getDb, serverTimestamp } from './firestoreClient';
import type { ToolDefinition } from './llm';
import { Composio } from 'composio-core';
import { saveMemory, forgetMemory } from './memory';
import { getPage } from './browser';

const composio = process.env.COMPOSIO_API_KEY
  ? new Composio({ apiKey: process.env.COMPOSIO_API_KEY })
  : null;

export const AGENT_TOOL_DEFINITIONS: ToolDefinition[] = [

  // ── Company state ────────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'read_company_state',
      description: 'Get live company state: agents, goals, tasks, recent activity, pending approvals, connected integrations. Always call this first before acting.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_company_profile',
      description: 'Read the company profile: name, mission, industry, website, team size, and strategic context.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_company_profile',
      description: 'Update the company profile field(s). Use when you learn something important about the company mission, positioning, or strategy.',
      parameters: {
        type: 'object',
        properties: {
          mission:    { type: 'string' },
          industry:   { type: 'string' },
          website:    { type: 'string' },
          notes:      { type: 'string', description: 'Additional strategic notes or context' },
        },
        required: [],
      },
    },
  },

  // ── Tasks ────────────────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create and assign a task in the task board.',
      parameters: {
        type: 'object',
        properties: {
          title:           { type: 'string' },
          description:     { type: 'string' },
          priority:        { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          assignedAgentId: { type: 'string', description: 'Agent ID to assign to, or omit' },
          goalId:          { type: 'string', description: 'Goal ID to link to, or omit' },
          dueDate:         { type: 'string', description: 'ISO date string, e.g. 2025-06-01' },
        },
        required: ['title', 'priority'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_task',
      description: 'Update status, priority, output, or assignee of an existing task. NEVER use status "blocked" — call create_approval instead.',
      parameters: {
        type: 'object',
        properties: {
          taskId:          { type: 'string' },
          status:          { type: 'string', enum: ['todo', 'in_progress', 'needs_review', 'done', 'cancelled'] },
          priority:        { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          outputSummary:   { type: 'string', description: 'Brief summary of what was accomplished' },
          output:          { type: 'string', description: 'Full detailed output, report, or result' },
          assignedAgentId: { type: 'string' },
          dueDate:         { type: 'string' },
        },
        required: ['taskId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'bulk_create_tasks',
      description: 'Create multiple tasks at once — useful when breaking down a goal into a work plan.',
      parameters: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title:           { type: 'string' },
                description:     { type: 'string' },
                priority:        { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                assignedAgentId: { type: 'string' },
                goalId:          { type: 'string' },
              },
              required: ['title', 'priority'],
            },
          },
        },
        required: ['tasks'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_task_metrics',
      description: 'Get task completion stats: total, done, in_progress, overdue, by agent, by goal.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },

  // ── Goals ────────────────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'create_goal',
      description: 'Create a new strategic goal.',
      parameters: {
        type: 'object',
        properties: {
          title:       { type: 'string' },
          description: { type: 'string' },
          priority:    { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          emoji:       { type: 'string' },
          targetDate:  { type: 'string', description: 'ISO date string' },
        },
        required: ['title', 'description', 'priority'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_goal_progress',
      description: 'Update the progress percentage and status of a goal.',
      parameters: {
        type: 'object',
        properties: {
          goalId:      { type: 'string' },
          progressPct: { type: 'number', description: '0-100' },
          status:      { type: 'string', enum: ['active', 'completed', 'paused', 'cancelled'] },
          notes:       { type: 'string', description: 'What drove this progress update' },
        },
        required: ['goalId', 'progressPct'],
      },
    },
  },

  // ── Documents & files ────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'create_document',
      description: 'Save a document, report, analysis, or plan to the company Files. Use this to persist any significant output so the founder can review it.',
      parameters: {
        type: 'object',
        properties: {
          title:   { type: 'string' },
          type:    { type: 'string', enum: ['report', 'analysis', 'plan', 'brief', 'table', 'calendar', 'other'] },
          content: { type: 'string', description: 'Full document content — can be markdown' },
          tags:    { type: 'array', items: { type: 'string' }, description: 'e.g. ["marketing", "q2", "strategy"]' },
        },
        required: ['title', 'type', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_documents',
      description: 'List documents saved in the company Files. Optionally filter by tag or search term.',
      parameters: {
        type: 'object',
        properties: {
          tag:    { type: 'string', description: 'Filter by tag e.g. "marketing"' },
          search: { type: 'string', description: 'Search in title' },
          limit:  { type: 'number', description: 'Max results, default 10' },
        },
        required: [],
      },
    },
  },

  // ── Approvals & escalation ───────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'create_approval',
      description: 'Ask the founder for something you need — a credential, decision, access, budget, or any resource blocking progress. Use this INSTEAD of marking a task blocked. Be specific.',
      parameters: {
        type: 'object',
        properties: {
          title:       { type: 'string', description: 'Short summary e.g. "Need Stripe API key to process payments"' },
          description: { type: 'string', description: 'Full context: what you need, why, and what you will do once you have it' },
          type:        { type: 'string', enum: ['needs_input', 'strategy_change', 'budget_override', 'external_action', 'hire_agent'] },
        },
        required: ['title', 'description', 'type'],
      },
    },
  },

  // ── Agents & hiring ──────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'hire_agent',
      description: 'Request to hire a new AI operator (creates an approval for the founder).',
      parameters: {
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
      name: 'message_agent',
      description: 'Send a message or instruction to another agent in the company by creating a high-priority task assigned to them.',
      parameters: {
        type: 'object',
        properties: {
          toAgentId: { type: 'string', description: 'Agent ID to send the message to' },
          subject:   { type: 'string' },
          message:   { type: 'string', description: 'Full instructions or context for the other agent' },
          priority:  { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
        },
        required: ['toAgentId', 'subject', 'message'],
      },
    },
  },

  // ── Automations / scheduling ─────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'create_workflow',
      description: 'Create a recurring workflow or automation on a schedule.',
      parameters: {
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
      name: 'schedule_followup',
      description: 'Schedule a reminder task for yourself or another agent to follow up on something at a specific date/time.',
      parameters: {
        type: 'object',
        properties: {
          subject:   { type: 'string' },
          notes:     { type: 'string' },
          followUpAt: { type: 'string', description: 'ISO date string when the follow-up should happen' },
          agentId:   { type: 'string', description: 'Agent to assign to, defaults to self' },
        },
        required: ['subject', 'followUpAt'],
      },
    },
  },

  // ── Research & web ───────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'fetch_url',
      description: 'Fetch and read the text content of any public URL. Use for reading articles, competitor websites, documentation, or any web page.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string' },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the web and return a list of relevant results with titles, URLs, and snippets. Use for market research, competitor analysis, finding leads, or any open-ended research.',
      parameters: {
        type: 'object',
        properties: {
          query:  { type: 'string' },
          limit:  { type: 'number', description: 'Number of results, default 5, max 10' },
        },
        required: ['query'],
      },
    },
  },

  // ── Data & calculations ──────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Evaluate a mathematical or financial expression and return the result. Useful for budget calculations, growth projections, ROI, etc.',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'A safe math expression e.g. "(1200 * 12) * 0.15"' },
          context:    { type: 'string', description: 'What this calculation is for' },
        },
        required: ['expression'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_cost_events',
      description: 'Read agent spending data: total cost, cost by agent, cost this month. Use to report on budget usage.',
      parameters: {
        type: 'object',
        properties: {
          agentId: { type: 'string', description: 'Filter by specific agent, or omit for all agents' },
        },
        required: [],
      },
    },
  },

  // ── Notifications & logs ─────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'log_insight',
      description: 'Log an important insight, finding, or observation to the activity feed so the founder sees it in their Inbox. Use for significant discoveries during research or analysis.',
      parameters: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'One-line insight to show in the inbox' },
          detail:  { type: 'string', description: 'Optional longer explanation' },
        },
        required: ['summary'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_notification',
      description: 'Send an urgent notification to the founder that appears in their Inbox immediately. Use sparingly — only for things that truly need immediate attention.',
      parameters: {
        type: 'object',
        properties: {
          title:   { type: 'string' },
          message: { type: 'string' },
          urgency: { type: 'string', enum: ['normal', 'urgent', 'critical'] },
        },
        required: ['title', 'message'],
      },
    },
  },

  // ── Browser / computer use ───────────────────────────────────────────────────
  // The agent controls a real Chromium browser running on a virtual display.
  // Every action is visible live via the Screen panel in the Freemi dashboard.
  {
    type: 'function',
    function: {
      name: 'browser_navigate',
      description: 'Navigate the agent\'s browser to a URL. The action is immediately visible on the live screen. Use this before any other browser tools.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Full URL, e.g. https://example.com' },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'browser_screenshot',
      description: 'Take a screenshot of the current browser page. Returns the page title, URL, and a base64 PNG. Use to verify the current state before acting.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'browser_click',
      description: 'Click an element on the current page by CSS selector or visible text. Examples: "button.submit", "text=Sign In", "#continue-btn".',
      parameters: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector or text=... selector' },
        },
        required: ['selector'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'browser_type',
      description: 'Type text into a form input or text area on the current page.',
      parameters: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector for the input field' },
          text:     { type: 'string', description: 'Text to type' },
          clear:    { type: 'boolean', description: 'Clear existing value first (default true)' },
        },
        required: ['selector', 'text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'browser_get_text',
      description: 'Extract visible text content from the current page or a specific element. Good for reading page content after navigation.',
      parameters: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector to scope extraction, or omit for full page text' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'browser_scroll',
      description: 'Scroll the page up or down to reveal more content.',
      parameters: {
        type: 'object',
        properties: {
          direction: { type: 'string', enum: ['up', 'down'] },
          amount:    { type: 'number', description: 'Pixels to scroll, default 600' },
        },
        required: ['direction'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'browser_wait',
      description: 'Wait for an element to appear, or wait a set number of seconds.',
      parameters: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector to wait for (optional)' },
          seconds:  { type: 'number', description: 'Seconds to wait if no selector given, default 2' },
        },
        required: [],
      },
    },
  },

  // ── Integrations ─────────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'call_integration',
      description: 'Call a connected integration to take action in an external app (Slack, Gmail, HubSpot, GitHub, etc.). First check connectedIntegrations from read_company_state. Use SCREAMING_SNAKE_CASE action names like SLACK_SEND_MESSAGE, GMAIL_SEND_EMAIL, HUBSPOT_CREATE_CONTACT.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', description: 'e.g. SLACK_SEND_MESSAGE, GMAIL_SEND_EMAIL, HUBSPOT_CREATE_CONTACT, GITHUB_CREATE_ISSUE, NOTION_CREATE_PAGE' },
          params: { type: 'object', description: 'Action-specific parameters' },
        },
        required: ['action', 'params'],
      },
    },
  },
  // ── Memory ───────────────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'remember',
      description: 'Save something important to your persistent memory so you remember it next session. Use for: founder preferences, lessons learned, key facts about the company, relationship notes, goal insights. Keep key short and descriptive.',
      parameters: {
        type: 'object',
        properties: {
          type:  { type: 'string', enum: ['fact', 'preference', 'lesson', 'context', 'relationship', 'goal_insight'], description: 'Category of memory' },
          key:   { type: 'string', description: 'Short label e.g. "founder_prefers_weekly_reports", "competitor_main_weakness"' },
          value: { type: 'string', description: 'The memory content — be specific and concrete' },
        },
        required: ['type', 'key', 'value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'forget',
      description: 'Delete a memory that is no longer accurate or relevant.',
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'The key of the memory to delete' },
        },
        required: ['key'],
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'list_integration_actions',
      description: 'List available actions for a specific connected integration so you know what you can do with it.',
      parameters: {
        type: 'object',
        properties: {
          app: { type: 'string', description: 'App name e.g. "slack", "gmail", "hubspot"' },
        },
        required: ['app'],
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

      // ── Company state ────────────────────────────────────────────────────────
      case 'read_company_state': {
        const [agentsSnap, goalsSnap, tasksSnap, activitySnap, approvalsSnap, companySnap] = await Promise.all([
          db.collection('agents').where('companyId', '==', companyId).limit(20).get(),
          db.collection('goals').where('companyId', '==', companyId).limit(10).get(),
          db.collection('tasks').where('companyId', '==', companyId).limit(30).get(),
          db.collection('activity_log').where('companyId', '==', companyId).orderBy('createdAt', 'desc').limit(15).get(),
          db.collection('approvals').where('companyId', '==', companyId).limit(10).get(),
          db.collection('companies').doc(companyId).get(),
        ]);
        const integrations = companySnap.data()?.integrations || {};
        return JSON.stringify({
          agents: agentsSnap.docs
            .filter(d => d.data().status !== 'terminated')
            .map(d => ({ id: d.id, name: d.data().name, role: d.data().role, status: d.data().status })),
          goals: goalsSnap.docs
            .filter(d => d.data().status === 'active')
            .map(d => ({ id: d.id, title: d.data().title, description: d.data().description, priority: d.data().priority, progressPct: d.data().progressPct || 0 })),
          tasks: tasksSnap.docs
            .filter(d => ['todo', 'in_progress', 'needs_review'].includes(d.data().status))
            .map(d => ({ id: d.id, title: d.data().title, status: d.data().status, priority: d.data().priority, assignedAgentId: d.data().assignedAgentId || 'unassigned' })),
          recentActivity: activitySnap.docs.map(d => d.data().summary).filter(Boolean).slice(0, 10),
          pendingApprovals: approvalsSnap.docs
            .filter(d => d.data().status === 'pending')
            .map(d => ({ id: d.id, title: d.data().title, type: d.data().type })),
          connectedIntegrations: Object.keys(integrations),
        });
      }

      case 'read_company_profile': {
        const snap = await db.collection('companies').doc(companyId).get();
        const data = snap.data() || {};
        return JSON.stringify({
          name: data.name, mission: data.mission, industry: data.industry,
          website: data.website, teamSize: data.teamSize, notes: data.notes,
        });
      }

      case 'update_company_profile': {
        const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
        if (args.mission)  updates.mission  = args.mission;
        if (args.industry) updates.industry = args.industry;
        if (args.website)  updates.website  = args.website;
        if (args.notes)    updates.notes    = args.notes;
        await db.collection('companies').doc(companyId).update(updates);
        return JSON.stringify({ success: true });
      }

      // ── Tasks ────────────────────────────────────────────────────────────────
      case 'create_task': {
        const ref = db.collection('tasks').doc();
        await ref.set({
          companyId, title: args.title || 'Untitled task',
          description: args.description || '', priority: args.priority || 'medium',
          assignedAgentId: args.assignedAgentId || null, goalId: args.goalId || null,
          dueDate: args.dueDate || null,
          status: 'todo', createdByAgentId: agentId,
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'task.created', ref.id, `Created task: "${args.title}"`);
        return JSON.stringify({ success: true, taskId: ref.id });
      }

      case 'update_task': {
        const taskId = String(args.taskId);
        const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
        if (args.status)                        updates.status          = args.status;
        if (args.priority)                      updates.priority        = args.priority;
        if (args.outputSummary)                 updates.outputSummary   = args.outputSummary;
        if (args.output)                        updates.output          = args.output;
        if (args.assignedAgentId !== undefined) updates.assignedAgentId = args.assignedAgentId;
        if (args.dueDate)                       updates.dueDate         = args.dueDate;
        if (args.status === 'done')             updates.completedAt     = serverTimestamp();
        await db.collection('tasks').doc(taskId).update(updates);
        if (args.status === 'done') {
          await logActivity(companyId, agentId, 'task.completed', taskId, `Completed task`);
        }
        return JSON.stringify({ success: true, taskId });
      }

      case 'bulk_create_tasks': {
        const tasks = (args.tasks as Array<Record<string, unknown>>) || [];
        const ids: string[] = [];
        await Promise.all(tasks.map(async task => {
          const ref = db.collection('tasks').doc();
          await ref.set({
            companyId, title: task.title || 'Untitled', description: task.description || '',
            priority: task.priority || 'medium', assignedAgentId: task.assignedAgentId || null,
            goalId: task.goalId || null, status: 'todo', createdByAgentId: agentId,
            createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
          });
          ids.push(ref.id);
        }));
        await logActivity(companyId, agentId, 'task.created', ids[0], `Bulk created ${ids.length} tasks`);
        return JSON.stringify({ success: true, taskIds: ids, count: ids.length });
      }

      case 'read_task_metrics': {
        const snap = await db.collection('tasks').where('companyId', '==', companyId).get();
        const all = snap.docs.map(d => d.data());
        const byStatus: Record<string, number> = {};
        const byAgent: Record<string, number> = {};
        let overdue = 0;
        const now = Date.now();
        for (const t of all) {
          byStatus[t.status] = (byStatus[t.status] || 0) + 1;
          if (t.assignedAgentId) byAgent[t.assignedAgentId] = (byAgent[t.assignedAgentId] || 0) + 1;
          if (t.dueDate && t.status !== 'done' && new Date(t.dueDate).getTime() < now) overdue++;
        }
        return JSON.stringify({ total: all.length, byStatus, byAgent, overdue });
      }

      // ── Goals ────────────────────────────────────────────────────────────────
      case 'create_goal': {
        const ref = db.collection('goals').doc();
        await ref.set({
          companyId, title: args.title || 'Untitled goal', description: args.description || '',
          priority: args.priority || 'medium', emoji: args.emoji || '🎯',
          targetDate: args.targetDate || null, ownerAgentId: agentId, status: 'active',
          progressPct: 0, createdByAgentId: agentId,
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'goal.created', ref.id, `Created goal: "${args.title}"`);
        return JSON.stringify({ success: true, goalId: ref.id });
      }

      case 'update_goal_progress': {
        const goalId = String(args.goalId);
        const updates: Record<string, unknown> = {
          progressPct: args.progressPct, updatedAt: serverTimestamp(),
        };
        if (args.status) updates.status = args.status;
        if (args.notes)  updates.progressNotes = args.notes;
        if (Number(args.progressPct) >= 100) updates.status = 'completed';
        await db.collection('goals').doc(goalId).update(updates);
        await logActivity(companyId, agentId, 'goal.updated', goalId, `Goal progress: ${args.progressPct}%${args.notes ? ` — ${args.notes}` : ''}`);
        return JSON.stringify({ success: true, goalId });
      }

      // ── Documents ────────────────────────────────────────────────────────────
      case 'create_document': {
        const ref = db.collection('documents').doc();
        await ref.set({
          companyId, title: args.title || 'Untitled', type: args.type || 'other',
          content: args.content || '', tags: args.tags || [],
          agentName: (await db.collection('agents').doc(agentId).get()).data()?.name || 'Agent',
          actorType: 'agent', createdByAgentId: agentId,
          createdAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'document.created', ref.id, `Saved document: "${args.title}"`);
        return JSON.stringify({ success: true, documentId: ref.id });
      }

      case 'read_documents': {
        let q = db.collection('documents').where('companyId', '==', companyId);
        const snap = await q.limit(Number(args.limit) || 10).get();
        let docs = snap.docs.map(d => ({ id: d.id, title: d.data().title, type: d.data().type, tags: d.data().tags, createdAt: d.data().createdAt?.toDate?.()?.toISOString() }));
        if (args.tag) docs = docs.filter(d => d.tags?.includes(args.tag));
        if (args.search) docs = docs.filter(d => d.title?.toLowerCase().includes(String(args.search).toLowerCase()));
        return JSON.stringify({ documents: docs, count: docs.length });
      }

      // ── Approvals ────────────────────────────────────────────────────────────
      case 'create_approval': {
        const ref = db.collection('approvals').doc();
        await ref.set({
          companyId, requestingActorId: agentId, requestedByAgentId: agentId,
          type: args.type || 'needs_input', title: args.title, description: args.description,
          payload: args, status: 'pending', decidedByUserId: null, decidedAt: null,
          decisionNote: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'approval.requested', ref.id, `Approval requested: "${args.title}"`);
        return JSON.stringify({ success: true, approvalId: ref.id });
      }

      // ── Agents ───────────────────────────────────────────────────────────────
      case 'hire_agent': {
        const ref = db.collection('approvals').doc();
        const agentName = String(args.name || 'New Operator');
        const agentRole = String(args.role || 'ops');
        await ref.set({
          companyId, requestingActorId: agentId, requestedByAgentId: agentId,
          type: 'hire_agent', title: `Hire ${agentName} (${agentRole})`,
          description: String(args.reason || `Hiring a ${agentRole} operator.`),
          payload: { name: agentName, role: agentRole, reportsTo: agentId, monthlyBudgetUsd: Number(args.monthlyBudgetUsd) || 30 },
          status: 'pending', decidedByUserId: null, decidedAt: null,
          decisionNote: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'hire.requested', ref.id, `Hire requested: ${agentName} (${agentRole})`);
        return JSON.stringify({ success: true, approvalId: ref.id });
      }

      case 'message_agent': {
        const ref = db.collection('tasks').doc();
        await ref.set({
          companyId, title: String(args.subject),
          description: String(args.message),
          priority: String(args.priority || 'high'),
          assignedAgentId: String(args.toAgentId),
          goalId: null, status: 'todo', createdByAgentId: agentId,
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'agent.message', ref.id, `Message to agent: "${args.subject}"`);
        return JSON.stringify({ success: true, taskId: ref.id });
      }

      // ── Automations ──────────────────────────────────────────────────────────
      case 'create_workflow': {
        const ref = db.collection('routines').doc();
        await ref.set({
          companyId, name: args.name || 'Untitled workflow', description: args.description || '',
          schedule: args.schedule || 'daily', assignedAgentId: args.assignedAgentId || agentId,
          status: 'active', createdByAgentId: agentId,
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        await logActivity(companyId, agentId, 'workflow.created', ref.id, `Created workflow: "${args.name}"`);
        return JSON.stringify({ success: true, workflowId: ref.id });
      }

      case 'schedule_followup': {
        const ref = db.collection('tasks').doc();
        await ref.set({
          companyId, title: `Follow-up: ${args.subject}`,
          description: String(args.notes || ''), priority: 'medium',
          assignedAgentId: String(args.agentId || agentId),
          goalId: null, status: 'todo', dueDate: args.followUpAt || null,
          createdByAgentId: agentId, isFollowUp: true,
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        return JSON.stringify({ success: true, taskId: ref.id, followUpAt: args.followUpAt });
      }

      // ── Web research ─────────────────────────────────────────────────────────
      case 'fetch_url': {
        try {
          const res = await fetch(String(args.url), {
            headers: { 'User-Agent': 'Freemi-Agent/1.0' },
            signal: AbortSignal.timeout(8000),
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

      case 'search_web': {
        // Uses DuckDuckGo Instant Answer API (no API key needed)
        try {
          const q = encodeURIComponent(String(args.query));
          const res = await fetch(`https://api.duckduckgo.com/?q=${q}&format=json&no_redirect=1&no_html=1`, {
            headers: { 'User-Agent': 'Freemi-Agent/1.0' },
            signal: AbortSignal.timeout(6000),
          });
          const data = await res.json() as Record<string, unknown>;

          // Gather results from RelatedTopics + AbstractText
          const results: Array<{ title: string; url: string; snippet: string }> = [];
          const abstract = String(data.AbstractText || '');
          const abstractUrl = String(data.AbstractURL || '');
          if (abstract) results.push({ title: String(data.Heading || args.query), url: abstractUrl, snippet: abstract.slice(0, 300) });

          const topics = (data.RelatedTopics as Array<{ Text?: string; FirstURL?: string }>) || [];
          for (const t of topics.slice(0, Number(args.limit) || 5)) {
            if (t.Text && t.FirstURL) {
              results.push({ title: t.Text.split(' - ')[0] || '', url: t.FirstURL, snippet: t.Text.slice(0, 300) });
            }
          }
          return JSON.stringify({ query: args.query, results: results.slice(0, Number(args.limit) || 5) });
        } catch (err) {
          return JSON.stringify({ error: `Search failed: ${(err as Error).message}` });
        }
      }

      // ── Data & calculations ──────────────────────────────────────────────────
      case 'calculate': {
        try {
          // Safe evaluation — only allow math chars
          const expr = String(args.expression).replace(/[^0-9+\-*/().,% ]/g, '');
          // eslint-disable-next-line no-new-func
          const result = Function(`"use strict"; return (${expr})`)();
          return JSON.stringify({ expression: args.expression, result, context: args.context });
        } catch (err) {
          return JSON.stringify({ error: `Calculation failed: ${(err as Error).message}` });
        }
      }

      case 'read_cost_events': {
        let q = db.collection('cost_events').where('companyId', '==', companyId);
        if (args.agentId) q = q.where('agentId', '==', String(args.agentId)) as typeof q;
        const snap = await q.limit(200).get();
        const events = snap.docs.map(d => d.data());
        const totalUsd = events.reduce((sum, e) => sum + (Number(e.costUsd) || 0), 0);
        const byAgent: Record<string, number> = {};
        for (const e of events) {
          if (e.agentId) byAgent[e.agentId] = (byAgent[e.agentId] || 0) + (Number(e.costUsd) || 0);
        }
        return JSON.stringify({ totalUsd: totalUsd.toFixed(6), byAgent, eventCount: events.length });
      }

      // ── Notifications ────────────────────────────────────────────────────────
      case 'log_insight': {
        await logActivity(companyId, agentId, 'agent.insight', agentId, String(args.summary));
        return JSON.stringify({ success: true });
      }

      case 'send_notification': {
        await db.collection('activity_log').add({
          companyId, actorId: agentId, actorType: 'agent',
          event: args.urgency === 'critical' ? 'agent.heartbeat.error' : 'approval.requested',
          entityId: agentId,
          summary: `${args.urgency === 'critical' ? '🚨' : args.urgency === 'urgent' ? '⚠️' : '💡'} ${args.title}: ${args.message}`,
          createdAt: serverTimestamp(),
        });
        return JSON.stringify({ success: true });
      }

      // ── Integrations ─────────────────────────────────────────────────────────
      case 'call_integration': {
        if (!composio) return JSON.stringify({ error: 'Composio not configured — COMPOSIO_API_KEY env var missing.' });
        const action = String(args.action);
        const params = (args.params as Record<string, unknown>) || {};
        try {
          const entity = await composio.getEntity(companyId);
          const result = await entity.execute(action, params);
          await logActivity(companyId, agentId, 'integration.called', action, `Called ${action} via integration`);
          return JSON.stringify({ success: true, action, result });
        } catch (err: unknown) {
          const msg = (err as Error).message || String(err);
          if (msg.includes('No connected account') || msg.includes('not connected')) {
            const appName = action.split('_')[0].toLowerCase();
            return JSON.stringify({ error: `${appName} is not connected. Use create_approval to ask the founder to connect it in Integrations.` });
          }
          return JSON.stringify({ error: msg });
        }
      }

      case 'remember': {
        const id = await saveMemory(
          agentId, companyId,
          String(args.type) as import('./memory').MemoryType,
          String(args.key),
          String(args.value),
        );
        return JSON.stringify({ success: true, memoryId: id, key: args.key });
      }

      case 'forget': {
        await forgetMemory(agentId, String(args.key));
        return JSON.stringify({ success: true, key: args.key });
      }

      case 'list_integration_actions': {
        if (!composio) return JSON.stringify({ error: 'Composio not configured.' });
        try {
          const app = String(args.app).toLowerCase();
          const actions = await composio.actions.list({ apps: [app], limit: 20 });
          return JSON.stringify({ app, actions: (actions as Array<{ name: string; description: string }>).map(a => ({ name: a.name, description: a.description })) });
        } catch (err) {
          return JSON.stringify({ error: (err as Error).message });
        }
      }

      // ── Browser / computer use ──────────────────────────────────────────────
      case 'browser_navigate': {
        const page = await getPage();
        await page.goto(String(args.url), { waitUntil: 'domcontentloaded', timeout: 20000 });
        const title = await page.title();
        return JSON.stringify({ success: true, url: page.url(), title });
      }

      case 'browser_screenshot': {
        const page = await getPage();
        const buf  = await page.screenshot({ type: 'png', fullPage: false });
        const b64  = buf.toString('base64');
        const title = await page.title();
        // Return image as data URL so the LLM can inspect it
        return JSON.stringify({ url: page.url(), title, screenshot: `data:image/png;base64,${b64}` });
      }

      case 'browser_click': {
        const page = await getPage();
        const sel  = String(args.selector);
        await page.click(sel, { timeout: 8000 });
        await page.waitForTimeout(600);
        const title = await page.title();
        return JSON.stringify({ success: true, clicked: sel, url: page.url(), title });
      }

      case 'browser_type': {
        const page = await getPage();
        const sel  = String(args.selector);
        if (args.clear !== false) await page.fill(sel, '');
        await page.type(sel, String(args.text), { delay: 40 });
        return JSON.stringify({ success: true, typed: args.text, selector: sel });
      }

      case 'browser_get_text': {
        const page = await getPage();
        let text: string;
        if (args.selector) {
          text = await page.locator(String(args.selector)).innerText({ timeout: 5000 }).catch(() => '');
        } else {
          text = await page.evaluate(() => (document.body as HTMLElement).innerText);
        }
        return JSON.stringify({ text: text.trim().slice(0, 6000), url: page.url() });
      }

      case 'browser_scroll': {
        const page   = await getPage();
        const amount = Number(args.amount) || 600;
        const delta  = args.direction === 'up' ? -amount : amount;
        await page.evaluate((y: number) => window.scrollBy(0, y), delta);
        await page.waitForTimeout(300);
        return JSON.stringify({ success: true, scrolled: delta, url: page.url() });
      }

      case 'browser_wait': {
        const page = await getPage();
        if (args.selector) {
          await page.waitForSelector(String(args.selector), { timeout: 15000 });
        } else {
          await page.waitForTimeout((Number(args.seconds) || 2) * 1000);
        }
        return JSON.stringify({ success: true, url: page.url() });
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
