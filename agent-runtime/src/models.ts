/**
 * Model registry — all AI models available via OpenRouter.
 * Kimi K2.5 is the primary brain for all heavy reasoning.
 * Fast/cheap models handle summarisation, classification, and simple tasks.
 */

export interface ModelSpec {
  id:          string;   // OpenRouter model ID
  name:        string;
  role:        'brain' | 'worker' | 'fallback';
  maxContext:  number;   // max context tokens
  costInPMT:   number;   // $ per million input tokens
  costOutPMT:  number;   // $ per million output tokens
  strengths:   string[];
}

export const MODEL_REGISTRY: Record<string, ModelSpec> = {

  // ── Primary brain ────────────────────────────────────────────────────────────
  brain: {
    id:         'moonshotai/kimi-k2.5',
    name:       'Kimi K2.5',
    role:       'brain',
    maxContext: 131072,
    costInPMT:  1.00,
    costOutPMT: 3.00,
    strengths:  ['reasoning', 'strategy', 'tool_use', 'long_context', 'code', 'planning'],
  },

  // ── Worker — MiniMax for small/simple tasks ──────────────────────────────────
  worker: {
    id:         'minimax/minimax-m2.7',
    name:       'MiniMax M2.7',
    role:       'worker',
    maxContext: 1000000,
    costInPMT:  0.20,
    costOutPMT: 1.10,
    strengths:  ['fast', 'long_context', 'summarisation', 'classification', 'tool_use'],
  },

  // ── Fallback if brain fails ──────────────────────────────────────────────────
  fallback: {
    id:         'anthropic/claude-3.5-haiku',
    name:       'Claude 3.5 Haiku',
    role:       'fallback',
    maxContext: 200000,
    costInPMT:  0.80,
    costOutPMT: 4.00,
    strengths:  ['reasoning', 'tool_use', 'code', 'reliable'],
  },
};

// ── Task routing table ────────────────────────────────────────────────────────
// Maps task types to which model tier to use by default.

export type TaskType =
  | 'heartbeat'      // agent periodic reasoning cycle → brain
  | 'task_execution' // execute a work task with tools → brain
  | 'bootstrap'      // first-run context gathering → brain
  | 'chat'           // direct chat with founder → brain
  | 'summarise'      // summarise text/logs → worker
  | 'classify'       // simple classify/label → worker
  | 'extract'        // extract structured data → worker
  | 'simple';        // any trivial operation → worker

export const TASK_ROUTING: Record<TaskType, keyof typeof MODEL_REGISTRY> = {
  heartbeat:      'brain',
  task_execution: 'brain',
  bootstrap:      'brain',
  chat:           'brain',
  summarise:      'worker',
  classify:       'worker',
  extract:        'worker',
  simple:         'worker',
};

// Cost per token helpers
export function costPerToken(spec: ModelSpec): { in: number; out: number } {
  return {
    in:  spec.costInPMT  / 1_000_000,
    out: spec.costOutPMT / 1_000_000,
  };
}
