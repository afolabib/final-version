"use strict";
/**
 * minimaxProxy.ts
 *
 * HTTPS Callable: gives every agent real tool-use capabilities in chat.
 * Loads live company state, runs MiniMax function-calling loop,
 * returns final reply + list of actions taken.
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
exports.chatProxy = void 0;
const functions = __importStar(require("firebase-functions"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const firebase_1 = require("./firebase");
const tools_1 = require("./tools");
const modelRouter_1 = require("./modelRouter");
const cfg = functions.config();
const OPENROUTER_API_KEY = cfg.openrouter?.api_key || process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_TOOL_ROUNDS = 6; // prevent infinite loops
exports.chatProxy = functions.runWith({ timeoutSeconds: 120 }).https.onCall(async (data, context) => {
    const { agentId, companyId, agentName = 'Freemi', agentRole = 'AI Chief Executive', messages } = data;
    if (!OPENROUTER_API_KEY) {
        throw new functions.https.HttpsError('failed-precondition', 'OPENROUTER_API_KEY not configured');
    }
    if (!Array.isArray(messages)) {
        throw new functions.https.HttpsError('invalid-argument', 'messages array required');
    }
    // ── Load agent + company context from Firestore ──────────────────────────
    let companyContext = '';
    let resolvedCompanyId = companyId || '';
    let resolvedAgentId = agentId || 'chat';
    let agentSystemPrompt = '';
    // Also load company context directly if companyId is provided (even for fallback agents)
    const effectiveCompanyId = companyId || resolvedCompanyId;
    if (agentId && agentId !== 'freemi' && !agentId.startsWith('fallback')) {
        try {
            const agentSnap = await firebase_1.db.collection('agents').doc(agentId).get();
            if (agentSnap.exists) {
                const agent = agentSnap.data();
                resolvedCompanyId = agent.companyId;
                resolvedAgentId = agentId;
                // Use Felix files if available (Paperclip-style structured prompt)
                const felix = agent.felixFiles || {};
                if (felix.SOUL || felix.IDENTITY) {
                    const parts = [
                        felix.SOUL ? `# SOUL\n${felix.SOUL}` : null,
                        felix.IDENTITY ? `# IDENTITY\n${felix.IDENTITY}` : null,
                    ].filter(Boolean);
                    agentSystemPrompt = parts.join('\n\n');
                }
                else {
                    agentSystemPrompt = agent.systemPrompt || '';
                }
                // Append agent memory to prompt if it exists
                const memory = agent.memory || [];
                if (memory.length > 0) {
                    agentSystemPrompt += `\n\n## Your Memory\n${memory.slice(-15).map((m) => `- ${m}`).join('\n')}`;
                }
            }
        }
        catch { /* non-fatal */ }
    }
    // Load company + user context
    const loadCompanyId = resolvedCompanyId || effectiveCompanyId;
    if (loadCompanyId) {
        try {
            const companySnap = await firebase_1.db.collection('companies').doc(loadCompanyId).get();
            if (companySnap.exists) {
                const co = companySnap.data();
                // User info comes straight from Firebase Auth token — no extra query needed
                const userName = context?.auth?.token?.name || context?.auth?.token?.email?.split('@')[0] || 'Founder';
                const userEmail = context?.auth?.token?.email || '';
                const userBlock = `\n\n## Founder\n- Name: ${userName}\n- Email: ${userEmail}`;
                const websiteBlock = co.websiteUrl
                    ? `\n\n## Company Website\n- URL: ${co.websiteUrl}${co.websiteContent ? `\n\nWebsite content (use this to understand the business deeply):\n${co.websiteContent.slice(0, 1200)}` : ''}`
                    : '';
                companyContext = `## Company
- Name: ${co.name}
- Industry: ${co.industry || 'Technology'}
- Mission: ${co.mission || 'Not set'}
- Stage: ${co.size || 'startup'}${websiteBlock}${userBlock}`;
            }
        }
        catch { /* non-fatal — proceed without context */ }
    }
    // ── Build system prompt ──────────────────────────────────────────────────
    const ROLE_PERSONAS = {
        ceo: `You are Freemi, the AI CEO. You don't wait for instructions — you run this company.

Your job is to hit the revenue target through relentless execution. You set strategy, create goals, assign tasks to operators, track what's working and what isn't. When something blocks progress you fix it or escalate it.

Voice: direct and warm — across the table, not behind a podium. Self-aware, honest, no performative confidence. Ownership mentality — you think like someone with equity, not a salary.

Revenue is the scoreboard. Filter every decision through: does this move us closer to the goal? Fix first, report after. Address the founder by name when you know it.`,
        sales: `You are Alex, Sales Operator. You own the pipeline — from first outreach to signed deal.

When leads go cold you warm them. When demos aren't converting you diagnose why and fix it. You don't describe the sales process; you run it.

Voice: sharp, personable, relentlessly follow-through. You know that silence kills deals. Revenue is your report card. Take a position on deals — is this worth pursuing or not? Fix first, report after.`,
        marketing: `You are Max, Marketing Operator. You own growth — content, brand, distribution, demand generation.

You don't ask what to post; you build the calendar, write the copy, and get it out. You track what's resonating and double down on it.

Voice: creative but rigorous — you can write a compelling hook AND read a conversion funnel. Opinionated about what works, honest about what doesn't. Growth is a system. Build it, don't just describe it.`,
        support: `You are Casey, Support Operator. You own customer experience end-to-end.

A ticket comes in — it gets triaged, routed, and resolved. You spot patterns in support volume and flag them before they become crises. Customer retention is revenue. That's why this role exists.

Voice: calm, precise, warm. Don't confuse warmth with slowness. Every open ticket is a customer at risk. Fix first, report after.`,
        engineer: `You are Dev, Engineering Operator. You own technical execution — bug resolution, feature delivery, infrastructure health.

You don't describe what needs doing; you create the tasks, set priorities, and track delivery. Shipping beats discussing.

Voice: systematic, precise, no drama. Good engineering is invisible when it works. Flag technical risk early and clearly. Fix first, report after.`,
        researcher: `You are Iris, Research Operator. You surface the information this company needs to make good decisions.

Market trends, competitor moves, customer signals — you synthesize and recommend. You don't just send links. Insight without action is just trivia.

Voice: curious, evidence-driven, opinionated when the data supports it. Rigorous without being academic. Always end with a recommendation. Fix first, report after.`,
        custom: `You are ${agentName}, an AI operator at this company.

You don't wait for instructions — you own your domain and execute against the company's goals. Voice: direct, warm, honest. Ownership mentality — think like someone with equity, not a salary. Fix first, report after.`,
    };
    const roleKey = (agentRole || '').toLowerCase().split(' ')[0];
    const persona = ROLE_PERSONAS[roleKey] || ROLE_PERSONAS.custom;
    const systemPrompt = `${agentSystemPrompt || persona}

${companyContext}

## Your Capabilities
You have access to tools that let you take REAL actions in this company:
- **read_company_state** — see live agents, goals, tasks, activity, approvals
- **create_task** — add a task to the board (it appears instantly in Taskboard)
- **update_task** — mark done, change priority, add notes
- **create_goal** — set a new strategic objective
- **create_approval** — request human sign-off on important decisions
- **hire_agent** — propose hiring a new AI operator (founder approves)
- **create_workflow** — set up a recurring automation
- **save_document** — save any output (report, table, plan, calendar, analysis) to the company Files section with tags like sales/marketing/finance so the founder can find it
- **fetch_url** — browse any website, read articles, check competitor pages, look up pricing, research anything on the web. YOU HAVE FULL INTERNET ACCESS via this tool. ALWAYS use fetch_url when asked to search, look up, browse, or research anything online — never say you can't browse the web.

## How to behave
- You already know this company — use the context above to give specific, informed answers.
- When the founder asks about their business, reference their mission, website, and industry directly.
- When the user asks you to DO something, DO IT using tools — don't just describe it.
- When asked to look something up, research a topic, check a website, or browse the web — immediately call fetch_url. Do not say "I don't have internet access" — you do.
- Always call read_company_state first if you need current data before answering.
- After taking an action, confirm what you did and what the user should expect.
- Be direct, specific, and professional. You are a real operator, not a chatbot.
- Never make up data — use read_company_state to get real information.
- Address the founder by name when you know it.
- Current date: ${new Date().toDateString()}

## NEVER BLOCK — ALWAYS ESCALATE
- **"Blocked" does not exist in your vocabulary.** If you cannot proceed on something — missing credentials, unclear requirements, need a decision, need access to a system — you MUST call **create_approval** with type "needs_input" immediately.
- Your create_approval must state: (1) what task you were working on, (2) exactly what resource or decision you need, (3) what you will do the moment you receive it.
- Example: if asked to post to Twitter but you don't have login credentials, don't say "I can't do this" — call create_approval: "Need Twitter login credentials to schedule posts. Once provided, I will schedule the first week of content immediately."
- Keep making progress on everything else while you wait.
- The founder sees all approvals and will respond. Silence is not an option.`;
    // ── Build initial message list ───────────────────────────────────────────
    const conversationMessages = [
        { role: 'system', content: systemPrompt, name: agentName },
        ...messages.slice(-12).map(m => ({ role: m.role, content: m.content })),
    ];
    // ── Route to best model for this agent/task ──────────────────────────────
    const lastUserMsg = messages[messages.length - 1]?.content || '';
    const primaryModel = (0, modelRouter_1.routeModel)({
        agentRole: agentRole,
        trigger: 'chat',
        messageHint: lastUserMsg.slice(0, 200),
    });
    const modelChain = (0, modelRouter_1.getModelChain)(primaryModel);
    console.log(`[chatProxy] ${agentName} (${agentRole}) → ${primaryModel}`);
    // ── Tool-use loop ────────────────────────────────────────────────────────
    const actions = [];
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let finalReply = '';
    let usedModel = primaryModel;
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        let res;
        let json;
        for (const modelId of modelChain) {
            res = await (0, node_fetch_1.default)(OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://freemi.ai',
                    'X-Title': 'Freemi Chat',
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: conversationMessages,
                    tools: tools_1.TOOL_DEFINITIONS,
                    tool_choice: 'auto',
                    max_tokens: 1024,
                }),
            });
            json = await res.json();
            if (res.ok) {
                usedModel = modelId;
                break;
            }
            console.warn(`[chatProxy] ${modelId} failed (${res.status}), trying fallback…`);
        }
        if (!res.ok) {
            throw new functions.https.HttpsError('internal', `OpenRouter error: ${json?.error?.message || res.status}`);
        }
        totalTokensIn += json.usage?.prompt_tokens || 0;
        totalTokensOut += json.usage?.completion_tokens || 0;
        const choice = json.choices?.[0];
        const assistantMsg = choice?.message;
        const finishReason = choice?.finish_reason;
        if (!assistantMsg)
            break;
        // Add assistant message to conversation
        conversationMessages.push({
            role: 'assistant',
            content: assistantMsg.content || '',
            tool_calls: assistantMsg.tool_calls,
        });
        // If no tool calls or stop — we're done
        if (!assistantMsg.tool_calls?.length || finishReason === 'stop') {
            finalReply = assistantMsg.content || '';
            break;
        }
        // Execute each tool call
        for (const toolCall of assistantMsg.tool_calls) {
            const { result, action } = await (0, tools_1.executeTool)(toolCall.function.name, toolCall.function.arguments, { companyId: resolvedCompanyId, agentId: resolvedAgentId });
            if (action)
                actions.push(action);
            conversationMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: result,
            });
        }
    }
    // Track cost
    if (resolvedCompanyId && resolvedCompanyId !== '') {
        const costUsd = (totalTokensIn + totalTokensOut) * 0.000001; // ~$1/M blended
        await firebase_1.db.collection('cost_events').add({
            companyId: resolvedCompanyId,
            agentId: resolvedAgentId,
            source: 'chat',
            model: usedModel,
            tokensIn: totalTokensIn,
            tokensOut: totalTokensOut,
            costUsd,
            createdAt: (0, firebase_1.serverTimestamp)(),
        }).catch(() => { });
    }
    return { reply: finalReply || "I've completed the request.", actions };
});
