"use strict";
/**
 * heartbeatRunner.ts — Autonomous agent heartbeat (ported from Paperclip)
 *
 * Scheduled: every 30 minutes, runs all active agents autonomously
 * Callable:  triggerAgentHeartbeat — manual trigger from the dashboard
 *
 * Each run loads the agent's Felix files, builds a heartbeat prompt,
 * and runs the same OpenRouter tool-use loop as chatProxy.
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
exports.onAgentMessageTrigger = exports.triggerAgentHeartbeat = exports.scheduledHeartbeat = void 0;
const functions = __importStar(require("firebase-functions"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const firebase_1 = require("./firebase");
const tools_1 = require("./tools");
const modelRouter_1 = require("./modelRouter");
const cfg = functions.config();
const OPENROUTER_API_KEY = cfg.openrouter?.api_key || process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_TOOL_ROUNDS = 8;
// ── Scheduled heartbeat — every 30 minutes ────────────────────────────────────
exports.scheduledHeartbeat = functions
    .pubsub.schedule('every 30 minutes')
    .onRun(async () => {
    if (!OPENROUTER_API_KEY) {
        console.warn('[heartbeat] OPENROUTER_API_KEY not set — skipping');
        return;
    }
    const snap = await firebase_1.db.collection('agents')
        .where('status', 'in', ['active', 'sleeping'])
        .limit(20)
        .get();
    console.log(`[heartbeat] Running for ${snap.docs.length} agents`);
    // Run agents in parallel (up to 5 at a time to avoid quota issues)
    const chunks = [];
    for (let i = 0; i < snap.docs.length; i += 5) {
        chunks.push(snap.docs.slice(i, i + 5));
    }
    for (const chunk of chunks) {
        await Promise.allSettled(chunk.map(d => runHeartbeat(d.id, d.data().companyId, 'scheduled')));
    }
});
// ── Manual trigger from dashboard ─────────────────────────────────────────────
exports.triggerAgentHeartbeat = functions
    .runWith({ timeoutSeconds: 120 })
    .https.onCall(async (data, _context) => {
    const { agentId, companyId } = data;
    if (!agentId || !companyId) {
        throw new functions.https.HttpsError('invalid-argument', 'agentId and companyId required');
    }
    if (!OPENROUTER_API_KEY) {
        throw new functions.https.HttpsError('failed-precondition', 'OPENROUTER_API_KEY not configured');
    }
    return runHeartbeat(agentId, companyId, 'manual');
});
// ── Wake on message — fires when send_message_to_agent writes a trigger doc ───
exports.onAgentMessageTrigger = functions.firestore
    .document('heartbeat_triggers/{agentId}')
    .onWrite(async (change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    if (!data)
        return null;
    const { agentId } = context.params;
    const { companyId, trigger } = data;
    if (!OPENROUTER_API_KEY)
        return null;
    // Delete the trigger doc so it doesn't fire again on re-write
    await change.after.ref.delete().catch(() => { });
    console.log(`[heartbeat] Agent ${agentId} woken by ${trigger}`);
    await runHeartbeat(agentId, companyId, trigger || 'mention');
    return null;
});
// ── Core heartbeat execution ──────────────────────────────────────────────────
async function runHeartbeat(agentId, companyId, trigger) {
    const runRef = firebase_1.db.collection('heartbeat_runs').doc();
    const startedAt = new Date();
    // Mark agent as running
    await firebase_1.db.collection('agents').doc(agentId).update({
        status: 'running',
        lastHeartbeatAt: (0, firebase_1.serverTimestamp)(),
        updatedAt: (0, firebase_1.serverTimestamp)(),
    }).catch(() => { });
    await runRef.set({
        agentId,
        companyId,
        trigger,
        status: 'running',
        startedAt: (0, firebase_1.serverTimestamp)(),
        tokensIn: 0,
        tokensOut: 0,
        costUsd: 0,
        summary: '',
    });
    try {
        const result = await executeHeartbeat(agentId, companyId, runRef.id, trigger);
        // Mark agent back to active
        await firebase_1.db.collection('agents').doc(agentId).update({
            status: 'active',
            lastHeartbeatAt: (0, firebase_1.serverTimestamp)(),
            updatedAt: (0, firebase_1.serverTimestamp)(),
        }).catch(() => { });
        await runRef.update({
            status: 'completed',
            ...result,
            finishedAt: (0, firebase_1.serverTimestamp)(),
        });
        return result;
    }
    catch (err) {
        const msg = err.message;
        console.error(`[heartbeat] Agent ${agentId} failed:`, msg);
        await firebase_1.db.collection('agents').doc(agentId).update({
            status: 'error',
            lastErrorMessage: msg,
            updatedAt: (0, firebase_1.serverTimestamp)(),
        }).catch(() => { });
        await runRef.update({
            status: 'failed',
            errorMessage: msg,
            finishedAt: (0, firebase_1.serverTimestamp)(),
        });
        throw err;
    }
}
async function executeHeartbeat(agentId, companyId, runId, trigger) {
    // ── Load agent from Firestore ──────────────────────────────────────────────
    const agentSnap = await firebase_1.db.collection('agents').doc(agentId).get();
    if (!agentSnap.exists)
        throw new Error(`Agent ${agentId} not found`);
    const agent = agentSnap.data();
    // ── Load company context ───────────────────────────────────────────────────
    const companySnap = await firebase_1.db.collection('companies').doc(companyId).get();
    const company = companySnap.exists ? companySnap.data() : {};
    // ── Build system prompt from Felix files ───────────────────────────────────
    const felix = agent.felixFiles || {};
    const isFirstRun = !agent.lastHeartbeatAt;
    let systemPrompt;
    if (felix.SOUL || felix.IDENTITY || felix.HEARTBEAT) {
        // Use Felix files (Paperclip-style structured prompt)
        const parts = [
            felix.SOUL ? `# SOUL\n${felix.SOUL}` : null,
            felix.IDENTITY ? `# IDENTITY\n${felix.IDENTITY}` : null,
            isFirstRun && felix.BOOTSTRAP ? `# BOOTSTRAP\n${felix.BOOTSTRAP}` : null,
            felix.HEARTBEAT ? `# HEARTBEAT PROTOCOL\n${felix.HEARTBEAT}` : null,
        ].filter(Boolean);
        systemPrompt = parts.join('\n\n');
    }
    else {
        // Fallback to systemPrompt field or role default
        systemPrompt = agent.systemPrompt || buildDefaultSystemPrompt(agent.name, agent.role);
    }
    // Append company context
    systemPrompt += `\n\n## Company\n- Name: ${company.name || 'Unknown'}\n- Mission: ${company.mission || 'Not set'}\n- Industry: ${company.industry || 'Technology'}`;
    // Append agent memory if exists
    const memory = agent.memory || [];
    if (memory.length > 0) {
        systemPrompt += `\n\n## Your Memory\n${memory.slice(-20).map(m => `- ${m}`).join('\n')}`;
    }
    // ── Build heartbeat user prompt ────────────────────────────────────────────
    const now = new Date();
    const lastRun = agent.lastHeartbeatAt?.toDate?.() || null;
    const timeSinceLast = lastRun
        ? `${Math.round((now.getTime() - lastRun.getTime()) / 60000)} minutes ago`
        : 'first run';
    // Load assigned tasks + pending approvals for context
    const [myTasksSnap, approvalsSnap, messagesSnap] = await Promise.all([
        firebase_1.db.collection('tasks')
            .where('companyId', '==', companyId)
            .where('assignedAgentId', '==', agentId)
            .where('status', 'in', ['todo', 'in_progress'])
            .limit(10)
            .get(),
        firebase_1.db.collection('approvals')
            .where('companyId', '==', companyId)
            .where('status', '==', 'pending')
            .limit(5)
            .get(),
        firebase_1.db.collection('agent_messages')
            .where('toAgentId', '==', agentId)
            .where('read', '==', false)
            .limit(10)
            .get(),
    ]);
    const myTasks = myTasksSnap.docs.map(d => ({
        id: d.id, title: d.data().title, status: d.data().status, priority: d.data().priority,
    }));
    const pendingApprovals = approvalsSnap.docs.map(d => ({
        id: d.id, title: d.data().title, type: d.data().type,
    }));
    const incomingMessages = messagesSnap.docs.map(d => ({
        id: d.id, from: d.data().fromAgentName, message: d.data().message, taskId: d.data().taskId,
    }));
    // Mark messages as read
    if (incomingMessages.length > 0) {
        const batch = firebase_1.db.batch();
        messagesSnap.docs.forEach(d => batch.update(d.ref, { read: true }));
        await batch.commit().catch(() => { });
    }
    const userPrompt = [
        `Wake reason: ${trigger}`,
        `Current time: ${now.toUTCString()}`,
        `Last heartbeat: ${timeSinceLast}`,
        incomingMessages.length > 0
            ? `\n📬 Messages from teammates:\n${incomingMessages.map(m => `- From ${m.from}: "${m.message}"${m.taskId ? ` (task: ${m.taskId})` : ''}`).join('\n')}`
            : '',
        myTasks.length > 0
            ? `\nYour assigned tasks:\n${myTasks.map(t => `- [${t.status}] ${t.title} (id: ${t.id})`).join('\n')}`
            : '\nYou have no assigned tasks — look for work to do.',
        pendingApprovals.length > 0
            ? `\nPending approvals:\n${pendingApprovals.map(a => `- ${a.title} (${a.type})`).join('\n')}`
            : '',
        isFirstRun ? '\nThis is your first heartbeat. Run your bootstrap checklist.' : '',
        '\nReview the situation. Call read_company_state for full context. Take the actions that matter most.',
    ].filter(Boolean).join('\n');
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ];
    // Route model based on agent role — heartbeats always use Kimi as the brain
    const primaryModel = (0, modelRouter_1.routeModel)({ agentRole: agent.role, trigger });
    const modelChain = (0, modelRouter_1.getModelChain)(primaryModel);
    console.log(`[heartbeat] ${agent.name} (${agent.role}) → ${primaryModel}`);
    let tokensIn = 0, tokensOut = 0;
    let finalSummary = '';
    let resolvedModel = primaryModel;
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        let json;
        let ok = false;
        for (const model of modelChain) {
            const res = await (0, node_fetch_1.default)(OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://freemi.ai',
                    'X-Title': 'Freemi Heartbeat',
                },
                body: JSON.stringify({
                    model,
                    messages,
                    tools: tools_1.TOOL_DEFINITIONS,
                    tool_choice: 'auto',
                    max_tokens: 1200,
                }),
            });
            json = await res.json();
            if (res.ok) {
                ok = true;
                resolvedModel = model;
                break;
            }
            console.warn(`[heartbeat] ${model} failed ${res.status}, trying fallback`);
        }
        if (!ok)
            throw new Error(`OpenRouter error: ${json?.error?.message}`);
        tokensIn += json.usage?.prompt_tokens || 0;
        tokensOut += json.usage?.completion_tokens || 0;
        const choice = json.choices?.[0];
        const msg = choice?.message;
        if (!msg)
            break;
        messages.push({ role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls });
        if (!msg.tool_calls?.length || choice.finish_reason === 'stop') {
            finalSummary = msg.content || '';
            break;
        }
        // Execute tools
        for (const tc of msg.tool_calls) {
            const { result } = await (0, tools_1.executeTool)(tc.function.name, tc.function.arguments, { companyId, agentId });
            messages.push({ role: 'tool', tool_call_id: tc.id, content: result });
        }
    }
    // ── Track cost ─────────────────────────────────────────────────────────────
    const MODEL_COSTS = {
        'moonshotai/kimi-k2.5': { in: 0.14, out: 0.55 },
        'minimax/minimax-01': { in: 0.20, out: 1.10 },
        'anthropic/claude-sonnet-4-5': { in: 3.00, out: 15.00 },
        'anthropic/claude-3.5-haiku': { in: 0.80, out: 4.00 },
        'openai/gpt-4o': { in: 2.50, out: 10.00 },
    };
    const costs = MODEL_COSTS[resolvedModel] || { in: 0.50, out: 1.50 };
    const costUsd = (tokensIn * costs.in + tokensOut * costs.out) / 1000000;
    await firebase_1.db.collection('cost_events').add({
        companyId, agentId, runId,
        source: 'heartbeat',
        trigger,
        model: resolvedModel,
        tokensIn, tokensOut, costUsd,
        createdAt: (0, firebase_1.serverTimestamp)(),
    }).catch(() => { });
    // Update agent spend
    await firebase_1.db.collection('agents').doc(agentId).update({
        spentThisMonthUsd: (agent.spentThisMonthUsd || 0) + costUsd,
        updatedAt: (0, firebase_1.serverTimestamp)(),
    }).catch(() => { });
    // Log activity
    await firebase_1.db.collection('activity_log').add({
        companyId, actorId: agentId, actorType: 'agent',
        event: 'heartbeat.completed',
        entityId: runId,
        summary: finalSummary
            ? `${agent.name}: ${finalSummary.slice(0, 120)}`
            : `${agent.name} completed heartbeat (${trigger})`,
        createdAt: (0, firebase_1.serverTimestamp)(),
    }).catch(() => { });
    return {
        summary: finalSummary,
        tokensIn,
        tokensOut,
        costUsd,
    };
}
function buildDefaultSystemPrompt(name, role) {
    return `You are ${name}, an AI operator at this company.
Your role: ${role}.
You own your domain and execute against the company's goals.
Voice: direct, warm, honest. Ownership mentality — think like someone with equity.
Fix first, report after. Revenue is the scoreboard.`;
}
