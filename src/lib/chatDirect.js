/**
 * chatDirect.js — calls OpenRouter directly from the browser.
 * Used as the primary chat engine (no Cloud Function needed).
 * Tools are executed via Firestore client SDK.
 */

import {
  collection, addDoc, doc, updateDoc, getDoc, getDocs,
  query, where, serverTimestamp, limit, orderBy,
} from 'firebase/firestore';
import { firestore } from './firebaseClient';

const OPENROUTER_URL   = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY          = import.meta.env.VITE_OPENROUTER_API_KEY;
const DEFAULT_MODEL    = import.meta.env.VITE_OPENROUTER_MODEL || 'moonshotai/kimi-k2.5';
const FALLBACK_MODEL   = 'anthropic/claude-3.5-haiku';
const MAX_TOOL_ROUNDS  = 6;

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'read_company_state',
      description: 'Read full company state: agents, goals, tasks, pending approvals, recent activity, connected integrations.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create a task and assign it to an agent.',
      parameters: {
        type: 'object',
        properties: {
          title:           { type: 'string', description: 'Task title' },
          description:     { type: 'string', description: 'What needs to be done' },
          assignedAgentId: { type: 'string', description: 'Agent ID to assign to' },
          priority:        { type: 'string', enum: ['low','medium','high','critical'], description: 'Task priority' },
          goalId:          { type: 'string', description: 'Goal this task contributes to (optional)' },
        },
        required: ['title', 'assignedAgentId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_goal',
      description: 'Create a new strategic goal.',
      parameters: {
        type: 'object',
        properties: {
          title:         { type: 'string' },
          description:   { type: 'string' },
          targetRevenue: { type: 'number', description: 'Revenue target in USD' },
          deadline:      { type: 'string', description: 'ISO date string' },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_approval',
      description: 'Create an approval request for the founder to review.',
      parameters: {
        type: 'object',
        properties: {
          title:       { type: 'string', description: 'Short title' },
          description: { type: 'string', description: 'Full description of what you need' },
          type:        { type: 'string', description: 'Type of approval: hire_agent, budget, strategy, access, needs_input' },
        },
        required: ['title', 'description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_url',
      description: 'Fetch and read a web page. Use this whenever asked to look something up, research, or browse.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Full URL to fetch' },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'save_document',
      description: 'Save a document, report, plan, or analysis to the company Files section.',
      parameters: {
        type: 'object',
        properties: {
          title:   { type: 'string' },
          content: { type: 'string' },
          type:    { type: 'string', description: 'report, plan, analysis, spec, calendar' },
          tags:    { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'content'],
      },
    },
  },
];

// ── Tool executor ─────────────────────────────────────────────────────────────

async function executeTool(name, args, { companyId, agentId }) {
  try {
    switch (name) {

      case 'read_company_state': {
        const [agentsSnap, goalsSnap, tasksSnap, approvalsSnap] = await Promise.all([
          getDocs(query(collection(firestore, 'agents'), where('companyId', '==', companyId), limit(20))),
          getDocs(query(collection(firestore, 'goals'),  where('companyId', '==', companyId), limit(10))),
          getDocs(query(collection(firestore, 'tasks'),  where('companyId', '==', companyId), where('status', '!=', 'done'), limit(20))),
          getDocs(query(collection(firestore, 'approvals'), where('companyId', '==', companyId), where('status', '==', 'pending'), limit(10))),
        ]);
        return JSON.stringify({
          agents:           agentsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => a.status !== 'terminated'),
          goals:            goalsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          openTasks:        tasksSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          pendingApprovals: approvalsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        });
      }

      case 'create_task': {
        const ref = await addDoc(collection(firestore, 'tasks'), {
          companyId,
          title:           args.title,
          description:     args.description || '',
          assignedAgentId: args.assignedAgentId,
          priority:        args.priority || 'medium',
          status:          'todo',
          goalId:          args.goalId || null,
          createdBy:       agentId,
          createdAt:       serverTimestamp(),
          updatedAt:       serverTimestamp(),
        });
        return JSON.stringify({ success: true, taskId: ref.id, title: args.title });
      }

      case 'create_goal': {
        const ref = await addDoc(collection(firestore, 'goals'), {
          companyId,
          title:         args.title,
          description:   args.description || '',
          targetRevenue: args.targetRevenue || null,
          deadline:      args.deadline || null,
          status:        'active',
          progress:      0,
          createdBy:     agentId,
          createdAt:     serverTimestamp(),
          updatedAt:     serverTimestamp(),
        });
        return JSON.stringify({ success: true, goalId: ref.id, title: args.title });
      }

      case 'create_approval': {
        const ref = await addDoc(collection(firestore, 'approvals'), {
          companyId,
          agentId,
          title:       args.title,
          description: args.description,
          type:        args.type || 'general',
          status:      'pending',
          createdAt:   serverTimestamp(),
          updatedAt:   serverTimestamp(),
        });
        return JSON.stringify({ success: true, approvalId: ref.id });
      }

      case 'fetch_url': {
        try {
          const res = await fetch(args.url, { signal: AbortSignal.timeout(8000) });
          const text = await res.text();
          // Strip HTML tags for readability
          const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s{3,}/g, '\n').slice(0, 3000);
          return JSON.stringify({ url: args.url, content: clean });
        } catch (e) {
          return JSON.stringify({ url: args.url, error: e.message });
        }
      }

      case 'save_document': {
        const ref = await addDoc(collection(firestore, 'documents'), {
          companyId,
          title:     args.title,
          content:   args.content,
          type:      args.type || 'report',
          tags:      args.tags || [],
          createdBy: agentId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return JSON.stringify({ success: true, docId: ref.id, title: args.title });
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    return JSON.stringify({ error: err.message });
  }
}

// ── LLM call with fallback ────────────────────────────────────────────────────

async function callLLM(model, messages, tools) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'HTTP-Referer':  window.location.origin,
      'X-Title':       'Freemi Chat',
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: 'auto',
      max_tokens: 1024,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return data;
}

// ── Main chat function ────────────────────────────────────────────────────────

export async function sendChatMessage({
  agentId,
  companyId,
  agentName = 'Freemi',
  agentRole = 'AI Chief Executive',
  systemPrompt,
  messages,
}) {
  if (!API_KEY) throw new Error('VITE_OPENROUTER_API_KEY not set');

  const conversation = [
    { role: 'system', content: systemPrompt || `You are ${agentName}, ${agentRole}. Be direct, helpful, and take action using tools when needed.` },
    ...messages.slice(-12),
  ];

  const actions = [];
  let finalReply = '';
  let usedModel = DEFAULT_MODEL;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    let data;
    try {
      data = await callLLM(DEFAULT_MODEL, conversation, TOOL_DEFINITIONS);
      usedModel = DEFAULT_MODEL;
    } catch (primaryErr) {
      console.warn('[chatDirect] Primary model failed, trying fallback:', primaryErr.message);
      try {
        data = await callLLM(FALLBACK_MODEL, conversation, TOOL_DEFINITIONS);
        usedModel = FALLBACK_MODEL;
      } catch (fallbackErr) {
        throw new Error(`Both models failed. Primary: ${primaryErr.message}. Fallback: ${fallbackErr.message}`);
      }
    }

    const choice = data.choices?.[0];
    const msg    = choice?.message;
    const finish = choice?.finish_reason;

    if (!msg) break;

    conversation.push({
      role:       'assistant',
      content:    msg.content || '',
      tool_calls: msg.tool_calls,
    });

    if (!msg.tool_calls?.length || finish === 'stop') {
      finalReply = msg.content || '';
      break;
    }

    for (const tc of msg.tool_calls) {
      let args = {};
      try { args = JSON.parse(tc.function.arguments); } catch { /* ignore */ }

      const result = await executeTool(tc.function.name, args, { companyId, agentId });
      actions.push({ tool: tc.function.name, args, result });

      conversation.push({
        role:         'tool',
        tool_call_id: tc.id,
        content:      result,
      });
    }
  }

  return { reply: finalReply || "Done.", actions, model: usedModel };
}
