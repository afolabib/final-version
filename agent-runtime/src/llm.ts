/**
 * MiniMax LLM client — single entry point for all model calls.
 * Supports both simple completion and full tool-use loops.
 */

const MINIMAX_API_URL = 'https://api.minimax.io/v1/text/chatcompletion_v2';

export const MODELS = {
  heartbeat: 'MiniMax-M2.5-highspeed',
  task:      'MiniMax-M2.5-highspeed',
  chat:      'MiniMax-M2.5-highspeed',
} as const;

export type ModelType = keyof typeof MODELS;

const COST_PER_TOKEN: Record<string, number> = {
  'MiniMax-M2.5-highspeed': 0.0000004,
};

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

// ── Simple completion (no tools) ──────────────────────────────────────────────

export async function llmCall(
  type:      ModelType,
  messages:  LLMMessage[],
  maxTokens = 1024,
): Promise<LLMResult> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) throw new Error('MINIMAX_API_KEY not set');

  const model = MODELS[type];

  const res = await fetch(MINIMAX_API_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body:    JSON.stringify({ model, messages, max_completion_tokens: maxTokens }),
  });

  const data = await res.json() as any;
  if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax error: ${data.base_resp.status_msg}`);
  }
  if (!res.ok) throw new Error(`MiniMax HTTP ${res.status}`);

  const tokensIn  = data.usage?.prompt_tokens     || 0;
  const tokensOut = data.usage?.completion_tokens || 0;
  const cost      = COST_PER_TOKEN[model] || 0.0000001;

  return {
    text:      data.choices?.[0]?.message?.content || '',
    tokensIn,  tokensOut,
    costUsd:   (tokensIn + tokensOut) * cost,
    model,
  };
}

// ── Tool-use loop ─────────────────────────────────────────────────────────────

export async function llmToolLoop(
  type:            ModelType,
  messages:        LLMMessage[],
  tools:           ToolDefinition[],
  toolExecutor:    (name: string, args: Record<string, unknown>) => Promise<string>,
  maxTokens      = 2048,
  maxRounds      = 8,
): Promise<ToolLoopResult> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) throw new Error('MINIMAX_API_KEY not set');

  const model      = MODELS[type];
  const costPerTok = COST_PER_TOKEN[model] || 0.0000001;

  let totalIn  = 0;
  let totalOut = 0;
  let finalText = '';
  const toolCallsMade: Array<{ name: string; args: Record<string, unknown> }> = [];

  const conversation: LLMMessage[] = [...messages];

  for (let round = 0; round < maxRounds; round++) {
    const res = await fetch(MINIMAX_API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body:    JSON.stringify({
        model,
        messages:               conversation,
        tools,
        tool_choice:            'auto',
        max_completion_tokens:  maxTokens,
      }),
    });

    const data = await res.json() as any;
    if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
      throw new Error(`MiniMax error: ${data.base_resp.status_msg}`);
    }
    if (!res.ok) throw new Error(`MiniMax HTTP ${res.status}`);

    totalIn  += data.usage?.prompt_tokens     || 0;
    totalOut += data.usage?.completion_tokens || 0;

    const choice  = data.choices?.[0];
    const msg     = choice?.message;
    const finish  = choice?.finish_reason;

    if (!msg) break;

    // Add assistant turn to history
    conversation.push({
      role:       'assistant',
      content:    msg.content || '',
      tool_calls: msg.tool_calls,
    });

    if (!msg.tool_calls?.length || finish === 'stop') {
      finalText = msg.content || '';
      break;
    }

    // Execute tools
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
    costUsd:      (totalIn + totalOut) * costPerTok,
    model,
    toolCallsMade,
  };
}
