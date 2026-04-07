/**
 * AI Model Orchestrator — routes work to the right model.
 *
 * Rules:
 * 1. Kimi K2.5 is the brain — handles all heavy reasoning, heartbeats, task execution
 * 2. Fast/cheap models handle summaries, classification, simple extractions
 * 3. Automatic fallback: if brain fails → Claude Haiku → Llama free
 * 4. Budget-aware: if agent >80% through monthly budget → route simple tasks to worker
 * 5. Retry with exponential backoff on transient errors (429, 500, 503)
 */

import {
  MODEL_REGISTRY, TASK_ROUTING, costPerToken,
  type ModelSpec, type TaskType,
} from './models';
import type { LLMMessage, ToolDefinition, LLMResult, ToolLoopResult, ToolCall } from './llm';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY not set');
  return key;
}

function headers(): Record<string, string> {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${getApiKey()}`,
    'HTTP-Referer':  'https://freemi.ai',
    'X-Title':       'Freemi Agent Orchestrator',
  };
}

// ── Model selection ───────────────────────────────────────────────────────────

export interface RouteOptions {
  taskType:      TaskType;
  budgetUsedPct?: number;  // 0-1 — if >0.8, route simple tasks to cheaper model
  forceModel?:   keyof typeof MODEL_REGISTRY; // override routing
}

export function selectModel(opts: RouteOptions): ModelSpec {
  if (opts.forceModel) return MODEL_REGISTRY[opts.forceModel];

  let tier = TASK_ROUTING[opts.taskType] as keyof typeof MODEL_REGISTRY;

  // Budget pressure doesn't change routing — MiniMax is already cost-efficient

  return MODEL_REGISTRY[tier];
}

// ── Retry helper ──────────────────────────────────────────────────────────────

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxAttempts = 3,
): Promise<Response> {
  let lastErr: Error = new Error('unknown');
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, init);
      // Retry on rate limit / server error
      if (res.status === 429 || res.status >= 500) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(`[orchestrator] HTTP ${res.status}, retrying in ${delay}ms (attempt ${attempt + 1})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err as Error;
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`[orchestrator] fetch error, retrying in ${delay}ms:`, lastErr.message);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

// ── Single completion ─────────────────────────────────────────────────────────

async function callModel(
  model:     ModelSpec,
  messages:  LLMMessage[],
  maxTokens: number,
  tools?:    ToolDefinition[],
): Promise<{ data: any; res: Response }> {
  const body: Record<string, unknown> = {
    model:      model.id,
    messages,
    max_tokens: maxTokens,
  };
  if (tools?.length) {
    body.tools        = tools;
    body.tool_choice  = 'auto';
  }

  const res = await fetchWithRetry(OPENROUTER_API_URL, {
    method:  'POST',
    headers: headers(),
    body:    JSON.stringify(body),
  });

  const data = await res.json() as any;
  return { data, res };
}

// ── Fallback chain ────────────────────────────────────────────────────────────

const FALLBACK_CHAIN: Array<keyof typeof MODEL_REGISTRY> = ['brain', 'fallback', 'budget'];

async function callWithFallback(
  primary:   ModelSpec,
  messages:  LLMMessage[],
  maxTokens: number,
  tools?:    ToolDefinition[],
): Promise<{ data: any; model: ModelSpec }> {
  const chain = [primary.role === 'brain' ? 'brain' : primary.role, 'fallback', 'budget'] as const;

  for (const tier of chain) {
    const model = MODEL_REGISTRY[tier];
    try {
      const { data, res } = await callModel(model, messages, maxTokens, tools);
      if (!res.ok) {
        console.warn(`[orchestrator] ${model.name} failed (${res.status}), trying next model…`);
        continue;
      }
      if (tier !== 'brain' && primary.role === 'brain') {
        console.warn(`[orchestrator] Fell back from ${primary.name} to ${model.name}`);
      }
      return { data, model };
    } catch (err) {
      console.warn(`[orchestrator] ${model.name} error:`, (err as Error).message);
    }
  }
  throw new Error('All models in fallback chain failed');
}

// ── Simple completion ─────────────────────────────────────────────────────────

export async function orchestrate(
  opts:      RouteOptions,
  messages:  LLMMessage[],
  maxTokens = 1024,
): Promise<LLMResult> {
  const model = selectModel(opts);
  const { data, model: usedModel } = await callWithFallback(model, messages, maxTokens);

  const tokensIn  = data.usage?.prompt_tokens     || 0;
  const tokensOut = data.usage?.completion_tokens || 0;
  const cost      = costPerToken(usedModel);

  return {
    text:     data.choices?.[0]?.message?.content || '',
    tokensIn, tokensOut,
    costUsd:  tokensIn * cost.in + tokensOut * cost.out,
    model:    usedModel.id,
  };
}

// ── Tool-use loop ─────────────────────────────────────────────────────────────

export async function orchestrateToolLoop(
  opts:         RouteOptions,
  messages:     LLMMessage[],
  tools:        ToolDefinition[],
  toolExecutor: (name: string, args: Record<string, unknown>) => Promise<string>,
  maxTokens   = 2048,
  maxRounds   = 8,
): Promise<ToolLoopResult> {
  const primaryModel = selectModel(opts);

  let totalIn  = 0;
  let totalOut = 0;
  let totalCost = 0;
  let finalText  = '';
  let usedModelId = primaryModel.id;
  const toolCallsMade: Array<{ name: string; args: Record<string, unknown> }> = [];
  const conversation: LLMMessage[] = [...messages];

  for (let round = 0; round < maxRounds; round++) {
    const { data, model: usedModel } = await callWithFallback(
      primaryModel, conversation, maxTokens, tools
    );

    usedModelId = usedModel.id;
    const roundIn  = data.usage?.prompt_tokens     || 0;
    const roundOut = data.usage?.completion_tokens || 0;
    const cost     = costPerToken(usedModel);

    totalIn   += roundIn;
    totalOut  += roundOut;
    totalCost += roundIn * cost.in + roundOut * cost.out;

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
      finalText = msg.content || '';
      break;
    }

    for (const tc of msg.tool_calls as ToolCall[]) {
      let args: Record<string, unknown> = {};
      try { args = JSON.parse(tc.function.arguments); } catch { /* ignore */ }

      toolCallsMade.push({ name: tc.function.name, args });

      let toolResult: string;
      try {
        toolResult = await toolExecutor(tc.function.name, args);
      } catch (err) {
        toolResult = JSON.stringify({ error: (err as Error).message });
      }

      conversation.push({
        role:         'tool',
        tool_call_id: tc.id,
        content:      toolResult,
      });
    }
  }

  return {
    text:         finalText,
    tokensIn:     totalIn,
    tokensOut:    totalOut,
    costUsd:      totalCost,
    model:        usedModelId,
    toolCallsMade,
  };
}

// ── Parallel synthesis (for high-stakes decisions) ────────────────────────────
// Run brain + fallback in parallel, synthesise the best answer.
// Use for nightly CEO reviews or critical strategy decisions.

export async function orchestrateParallel(
  messages:  LLMMessage[],
  maxTokens = 1024,
): Promise<LLMResult> {
  const [brainResult, fallbackResult] = await Promise.allSettled([
    callModel(MODEL_REGISTRY.brain,    messages, maxTokens),
    callModel(MODEL_REGISTRY.fallback, messages, maxTokens),
  ]);

  // Prefer brain if it succeeded
  if (brainResult.status === 'fulfilled' && brainResult.value.res.ok) {
    const { data, model } = { data: brainResult.value.data, model: MODEL_REGISTRY.brain };
    const tokensIn  = data.usage?.prompt_tokens     || 0;
    const tokensOut = data.usage?.completion_tokens || 0;
    const cost      = costPerToken(model);
    return {
      text:     data.choices?.[0]?.message?.content || '',
      tokensIn, tokensOut,
      costUsd:  tokensIn * cost.in + tokensOut * cost.out,
      model:    model.id,
    };
  }

  // Fall through to fallback model result
  if (fallbackResult.status === 'fulfilled' && fallbackResult.value.res.ok) {
    const { data, model } = { data: fallbackResult.value.data, model: MODEL_REGISTRY.fallback };
    const tokensIn  = data.usage?.prompt_tokens     || 0;
    const tokensOut = data.usage?.completion_tokens || 0;
    const cost      = costPerToken(model);
    return {
      text:     data.choices?.[0]?.message?.content || '',
      tokensIn, tokensOut,
      costUsd:  tokensIn * cost.in + tokensOut * cost.out,
      model:    model.id,
    };
  }

  throw new Error('Parallel orchestration: all models failed');
}
