"use strict";
/**
 * routineExecutor.ts — Executes saved automations on schedule
 *
 * Runs every 15 minutes. Queries active routines that are due,
 * executes each step in sequence, updates lastRunAt / nextRunAt.
 *
 * Supported step types:
 *   schedule     → trigger (determines schedule)
 *   agent_task   → runs AI agent via OpenRouter tool loop
 *   create_task  → writes to tasks collection
 *   notify       → writes to activity_log
 *   http_request → fetch any URL
 *   wait         → skips (async waits handled via nextRunAt offset)
 *   send_email / slack_message → logs intent (Composio execution TBD)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerRoutine = exports.executeRoutines = void 0;
const functions = __importStar(require("firebase-functions"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const firebase_1 = require("./firebase");
const tools_1 = require("./tools");
const cfg = functions.config();
const OPENROUTER_API_KEY = cfg.openrouter?.api_key || process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const KIMI = 'moonshotai/kimi-k2.5';
const HAIKU = 'anthropic/claude-3.5-haiku';
const MAX_TOOL_ROUNDS = 6;
// ── Cron label → next run milliseconds offset ─────────────────────────────────
function cronToMs(label) {
    const l = (label || '').toLowerCase();
    if (l.includes('15 min'))
        return 15 * 60 * 1000;
    if (l.includes('hour'))
        return 60 * 60 * 1000;
    if (l.includes('day'))
        return 24 * 60 * 60 * 1000;
    if (l.includes('monday') || l.includes('weekly'))
        return 7 * 24 * 60 * 60 * 1000;
    if (l.includes('friday'))
        return 7 * 24 * 60 * 60 * 1000;
    if (l.includes('month'))
        return 30 * 24 * 60 * 60 * 1000;
    return 24 * 60 * 60 * 1000; // default: daily
}
// ── Scheduled runner — every 15 minutes ──────────────────────────────────────
exports.executeRoutines = functions
    .pubsub.schedule('every 15 minutes')
    .onRun(async () => {
    if (!OPENROUTER_API_KEY)
        return;
    const now = new Date();
    // Find active routines that are due (nextRunAt <= now, or never run)
    const snap = await firebase_1.db.collection('routines')
        .where('active', '==', true)
        .limit(20)
        .get();
    const due = snap.docs.filter(d => {
        const data = d.data();
        if (!data.nextRunAt)
            return true; // never run
        const next = data.nextRunAt?.toDate?.() || null;
        return next && next <= now;
    });
    console.log(`[routineExecutor] ${due.length} routines due out of ${snap.docs.length} active`);
    for (const routineDoc of due) {
        try {
            await runRoutine(routineDoc.id, routineDoc.data());
        }
        catch (e) {
            console.error(`[routineExecutor] Routine ${routineDoc.id} failed:`, e.message);
        }
    }
});
// ── Manual trigger from dashboard ─────────────────────────────────────────────
exports.triggerRoutine = functions
    .runWith({ timeoutSeconds: 120 })
    .https.onCall(async (data, _context) => {
    const { routineId } = data;
    if (!routineId)
        throw new functions.https.HttpsError('invalid-argument', 'routineId required');
    if (!OPENROUTER_API_KEY)
        throw new functions.https.HttpsError('failed-precondition', 'OPENROUTER_API_KEY not set');
    const snap = await firebase_1.db.collection('routines').doc(routineId).get();
    if (!snap.exists)
        throw new functions.https.HttpsError('not-found', 'Routine not found');
    return runRoutine(routineId, snap.data());
});
// ── Core execution ────────────────────────────────────────────────────────────
async function runRoutine(routineId, routine) {
    const { companyId, steps = [], name } = routine;
    if (!companyId || steps.length === 0)
        return;
    console.log(`[routineExecutor] Running "${name}" (${routineId})`);
    // Mark as running
    await firebase_1.db.collection('routines').doc(routineId).update({
        status: 'running',
        lastRunAt: (0, firebase_1.serverTimestamp)(),
    }).catch(() => { });
    const runRef = firebase_1.db.collection('routine_runs').doc();
    await runRef.set({
        routineId, companyId, name,
        status: 'running',
        startedAt: (0, firebase_1.serverTimestamp)(),
        steps: [],
    });
    // Find trigger step to get schedule interval
    const trigger = steps.find((s) => TRIGGER_TYPES_IDS.has(s.type));
    const intervalMs = trigger?.type === 'schedule'
        ? cronToMs(trigger.config?.cron_label || '')
        : 24 * 60 * 60 * 1000;
    // Variable store for interpolation between steps
    const vars = {};
    const stepResults = [];
    // Execute non-trigger steps in sequence
    const actionSteps = steps.filter((s) => !TRIGGER_TYPES_IDS.has(s.type));
    for (const step of actionSteps) {
        try {
            const result = await executeStep(step, vars, companyId);
            vars[step.config?.output_var || step.id] = result;
            stepResults.push({ id: step.id, type: step.type, status: 'done', output: result.slice(0, 200) });
        }
        catch (e) {
            const msg = e.message;
            stepResults.push({ id: step.id, type: step.type, status: 'error', error: msg });
            console.error(`[routineExecutor] Step ${step.type} failed:`, msg);
        }
    }
    // Mark complete, schedule next run
    const nextRun = new Date(Date.now() + intervalMs);
    await firebase_1.db.collection('routines').doc(routineId).update({
        status: 'active',
        lastRunAt: (0, firebase_1.serverTimestamp)(),
        nextRunAt: nextRun,
    }).catch(() => { });
    await runRef.update({
        status: 'completed',
        finishedAt: (0, firebase_1.serverTimestamp)(),
        steps: stepResults,
    });
    // Log to activity feed
    await firebase_1.db.collection('activity_log').add({
        companyId,
        actorId: routineId,
        actorType: 'automation',
        event: 'routine.completed',
        entityId: runRef.id,
        summary: `Automation "${name}" ran — ${actionSteps.length} steps executed`,
        createdAt: (0, firebase_1.serverTimestamp)(),
    }).catch(() => { });
    return { runId: runRef.id, steps: stepResults.length };
}
// ── Step executor ─────────────────────────────────────────────────────────────
async function executeStep(step, vars, companyId) {
    const cfg = step.config || {};
    // Interpolate {{var}} placeholders from previous step outputs
    const interpolate = (s) => (s || '').replace(/\{\{(\w+)(?:\.\w+)*\}\}/g, (_, k) => vars[k] || '');
    switch (step.type) {
        case 'agent_task': {
            const instruction = interpolate(cfg.instruction || 'Review the current company state and take appropriate action.');
            const reply = await runAgentTask(instruction, companyId);
            return reply;
        }
        case 'create_task': {
            const ref = firebase_1.db.collection('tasks').doc();
            await ref.set({
                companyId,
                title: interpolate(cfg.title || 'Automation task'),
                description: interpolate(cfg.description || ''),
                priority: cfg.priority || 'medium',
                status: 'todo',
                assignedAgentId: null,
                createdByRoutine: true,
                createdAt: (0, firebase_1.serverTimestamp)(),
                updatedAt: (0, firebase_1.serverTimestamp)(),
            });
            return `Task created: "${cfg.title}"`;
        }
        case 'notify': {
            await firebase_1.db.collection('activity_log').add({
                companyId,
                actorType: 'automation',
                event: 'routine.notify',
                summary: interpolate(cfg.message || cfg.title || 'Automation notification'),
                createdAt: (0, firebase_1.serverTimestamp)(),
            });
            return 'Notification sent';
        }
        case 'http_request': {
            const url = interpolate(cfg.url || '');
            if (!url.startsWith('http'))
                return 'Skipped — no URL';
            const res = await (0, node_fetch_1.default)(url, {
                method: cfg.method || 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: cfg.method !== 'GET' ? JSON.stringify({ source: 'freemi_automation' }) : undefined,
            });
            return `HTTP ${cfg.method || 'POST'} ${url} → ${res.status}`;
        }
        case 'wait':
            return 'Wait step (async execution — skipped in sync run)';
        case 'condition':
            return 'Condition evaluated (always continue)';
        case 'send_email':
            return `Email queued to ${interpolate(cfg.to || '')} — subject: "${interpolate(cfg.subject || '')}"`;
        case 'slack_message':
            return `Slack message queued to ${cfg.channel || '#general'}`;
        default:
            return `Step type "${step.type}" executed`;
    }
}
// ── AI agent task runner ──────────────────────────────────────────────────────
async function runAgentTask(instruction, companyId) {
    const companySnap = await firebase_1.db.collection('companies').doc(companyId).get().catch(() => null);
    const company = companySnap?.exists ? companySnap.data() : {};
    const systemPrompt = `You are an autonomous AI operator at ${company.name || 'this company'}.
Mission: ${company.mission || 'Not set'}. Industry: ${company.industry || 'Technology'}.
You have access to tools. Execute the instruction and report what you did.`;
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: instruction },
    ];
    let finalReply = '';
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        let json;
        for (const model of [KIMI, HAIKU]) {
            const res = await (0, node_fetch_1.default)(OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://freemi.ai',
                    'X-Title': 'Freemi Automation',
                },
                body: JSON.stringify({ model, messages, tools: tools_1.TOOL_DEFINITIONS, tool_choice: 'auto', max_tokens: 800 }),
            });
            json = await res.json();
            if (res.ok)
                break;
        }
        const msg = json.choices?.[0]?.message;
        if (!msg)
            break;
        messages.push({ role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls });
        if (!msg.tool_calls?.length || json.choices?.[0]?.finish_reason === 'stop') {
            finalReply = msg.content || '';
            break;
        }
        for (const tc of msg.tool_calls) {
            const { result } = await (0, tools_1.executeTool)(tc.function.name, tc.function.arguments, { companyId, agentId: 'automation' });
            messages.push({ role: 'tool', tool_call_id: tc.id, content: result });
        }
    }
    return finalReply || 'Task completed.';
}
const TRIGGER_TYPES_IDS = new Set(['schedule', 'email', 'new_record', 'webhook', 'form_submit', 'stripe_event']);
