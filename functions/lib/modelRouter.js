"use strict";
/**
 * modelRouter.ts — Intelligent model routing for Freemi agents
 *
 * Kimi K2.5 is the orchestration brain: long-context reasoning, strategy,
 * planning, decomposition, agent coordination.
 *
 * Route by agent role + task content so every token goes to the right model.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FALLBACK_CHAINS = exports.MODELS = void 0;
exports.routeModel = routeModel;
exports.getModelChain = getModelChain;
// All models available on OpenRouter
exports.MODELS = {
    // Kimi K2.5 — long-context, strategy, orchestration, research (PRIMARY BRAIN)
    KIMI: 'moonshotai/kimi-k2.5',
    // MiniMax Text 01 / MiniMax-2.7 — fast UI-facing interactions, real-time agents
    MINIMAX: 'minimax/minimax-01',
    // Claude Sonnet — writing, content, nuanced language tasks
    SONNET: 'anthropic/claude-sonnet-4-5',
    // Claude Haiku — fast, cheap execution, simple tool calls
    HAIKU: 'anthropic/claude-3.5-haiku',
    // GPT-4o — structured reasoning, reliable tool use
    GPT4O: 'openai/gpt-4o',
};
// Fallback chain per primary: if primary fails, try these in order
exports.FALLBACK_CHAINS = {
    [exports.MODELS.KIMI]: [exports.MODELS.GPT4O, exports.MODELS.HAIKU],
    [exports.MODELS.MINIMAX]: [exports.MODELS.KIMI, exports.MODELS.HAIKU],
    [exports.MODELS.SONNET]: [exports.MODELS.KIMI, exports.MODELS.HAIKU],
    [exports.MODELS.GPT4O]: [exports.MODELS.KIMI, exports.MODELS.HAIKU],
    [exports.MODELS.HAIKU]: [exports.MODELS.MINIMAX, exports.MODELS.KIMI],
};
/**
 * Returns the best model for the given context.
 * Kimi handles orchestration, strategy, CEO, research, and agent heartbeats.
 * Sonnet handles writing and content.
 * Haiku handles fast, simple, reactive tasks.
 */
function routeModel(ctx) {
    const role = (ctx.agentRole || '').toLowerCase();
    const trigger = (ctx.trigger || '').toLowerCase();
    const hint = (ctx.messageHint || '').toLowerCase();
    // ── CEO and researcher always get Kimi — they need long-context reasoning
    if (role === 'ceo' || role === 'researcher' || role === 'chief') {
        return exports.MODELS.KIMI;
    }
    // ── Heartbeat / scheduled runs — Kimi for autonomous multi-step reasoning
    if (trigger === 'scheduled' || trigger === 'manual' || trigger === 'mention') {
        return exports.MODELS.KIMI;
    }
    // ── Marketing / content — Sonnet writes better copy
    if (role === 'marketing' || role === 'content' || role === 'brand') {
        if (isContentTask(hint))
            return exports.MODELS.SONNET;
        return exports.MODELS.KIMI; // strategy/planning within marketing still goes to Kimi
    }
    // ── Engineering — GPT-4o for structured technical reasoning
    if (role === 'engineer' || role === 'dev' || role === 'engineering') {
        return exports.MODELS.GPT4O;
    }
    // ── Support — fast and reactive, MiniMax handles real-time agent chat
    if (role === 'support' || role === 'customer') {
        return exports.MODELS.MINIMAX;
    }
    // ── Sales — Kimi for strategy, MiniMax for quick follow-up responses
    if (role === 'sales') {
        if (isStrategyTask(hint))
            return exports.MODELS.KIMI;
        return exports.MODELS.MINIMAX;
    }
    // ── Keyword overrides on message content
    if (isStrategyTask(hint))
        return exports.MODELS.KIMI;
    if (isContentTask(hint))
        return exports.MODELS.SONNET;
    if (isFastTask(hint))
        return exports.MODELS.MINIMAX;
    // Default: Kimi is the brain
    return exports.MODELS.KIMI;
}
/** Returns the full fallback chain starting with the primary model */
function getModelChain(primary) {
    return [primary, ...(exports.FALLBACK_CHAINS[primary] || [exports.MODELS.HAIKU])];
}
// ── Keyword heuristics ────────────────────────────────────────────────────────
function isStrategyTask(hint) {
    return /\b(strateg|plan|roadmap|priorit|goal|objective|analyse|analyze|research|market|competitor|decompos|orchestrat)\b/.test(hint);
}
function isContentTask(hint) {
    return /\b(write|draft|copy|blog|post|email|tweet|caption|subject line|headline|content|campaign|script)\b/.test(hint);
}
function isFastTask(hint) {
    return /\b(update|mark|status|check|confirm|ack|acknowledge|reply|quick|simple)\b/.test(hint);
}
