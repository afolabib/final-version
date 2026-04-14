/**
 * OpenRouter LLM client — OpenAI-compatible API.
 * Supports simple completion and full tool-use loops.
 * Model: configurable via OPENROUTER_MODEL env var (default: anthropic/claude-3.5-haiku)
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL      = 'moonshotai/kimi-k1.5';

export const MODELS = {
  heartbeat: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
  task:      process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
  chat:      process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
} as const;

export type ModelType = keyof typeof MODELS;

// Cost per token fallback — OpenRouter billing varies by model.
// These are rough estimates; actual cost comes from the x-usage headers.
const COST_FALLBACK = 0.0000004; // $0.40 per million tokens (haiku-level)

export interface LLMMessage {
  role:          'system' | 'user' | 'assistant' | 'tool';
  content:       string;
  name?:         string;
  tool_calls?:   ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id:       string;
  type:     'function';
  function: { name: string; arguments: string };
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name:        string;
    description: string;
    parameters:  Record<string, unknown>;
  };
}

export interface LLMResult {
  text:       string;
  tokensIn:   number;
  tokensOut:  number;
  costUsd:    number;
  model:      string;
}

export interface ToolLoopResult extends LLMResult {
  toolCallsMade: Array<{ name: string; args: Record<string, unknown> }>;
}

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY not set');
  return key;
}

function getHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer':  'https://freemi.ai',
    'X-Title':       'Freemi Agent Runtime',
  };
}

// ── Simple completion (no tools) ──────────────────────────────────────────────

export async function llmCall(
  type:      ModelType,
  messages:  LLMMessage[],
  maxTokens = 1024,
): Promise<LLMResult> {
  const apiKey = getApiKey();
  const model  = MODELS[type];

  const res = await fetch(OPENROUTER_API_URL, {
    method:  'POST',
    headers: getHeaders(apiKey),
    body:    JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });

  const data = await res.json() as any;
  if (!res.ok) throw new Error(`OpenRouter error ${res.status}: ${data.error?.message || JSON.stringify(data)}`);

  const tokensIn  = data.usage?.prompt_tokens     || 0;
  const tokensOut = data.usage?.completion_tokens || 0;

  return {
    text:    data.choices?.[0]?.message?.content || '',
    tokensIn, tokensOut,
    costUsd: (tokensIn + tokensOut) * COST_FALLBACK,
    model,
  };
}

// ── Tool-use loop ─────────────────────────────────────────────────────────────

export async function llmToolLoop(
  type:         ModelType,
  messages:     LLMMessage[],
  tools:        ToolDefinition[],
  toolExecutor: (name: string, args: Record<string, unknown>) => Promise<string>,
  maxTokens   = 2048,
  maxRounds   = 8,
): Promise<ToolLoopResult> {
  const apiKey = getApiKey();
  const model  = MODELS[type];

  let totalIn  = 0;
  let totalOut = 0;
  let finalText = '';
  const toolCallsMade: Array<{ name: string; args: Record<string, unknown> }> = [];
  const conversation: LLMMessage[] = [...messages];

  for (let round = 0; round < maxRounds; round++) {
    const res = await fetch(OPENROUTER_API_URL, {
      method:  'POST',
      headers: getHeaders(apiKey),
      body:    JSON.stringify({
        model,
        messages:    conversation,
        tools,
        tool_choice: 'auto',
        max_tokens:  maxTokens,
      }),
    });

    const data = await res.json() as any;
    if (!res.ok) throw new Error(`OpenRouter error ${res.status}: ${data.error?.message || JSON.stringify(data)}`);

    totalIn  += data.usage?.prompt_tokens     || 0;
    totalOut += data.usage?.completion_tokens || 0;

    const choice = data.choices?.[0];
    const msg    = choice?.message;
    const finish = choice?.finish_reason;

    if (!msg) break;

    // Add assistant turn to history
    conversation.push({
      role:       'assistant',
      content:    msg.content || '',
      tool_calls: msg.tool_calls,
    });

    // No tool calls or model said stop — we're done
    if (!msg.tool_calls?.length || finish === 'stop') {
      finalText = msg.content || '';
      break;
    }

    // Execute each tool call
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
    costUsd:      (totalIn + totalOut) * COST_FALLBACK,
    model,
    toolCallsMade,
  };
}
