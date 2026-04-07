/**
 * memory.ts — Felix-standard 3-layer memory system.
 *
 * Layer 1: Knowledge Graph — entity-based facts (people, companies, projects)
 *          stored in agent_knowledge/{agentId}/entities/{entityId}
 *
 * Layer 2: Daily Notes — raw timeline of events per day
 *          stored in agent_daily_notes/{agentId}_{date}
 *
 * Layer 3: Tacit Knowledge — patterns, preferences, lessons (MEMORY.md equivalent)
 *          stored in agent_memory/{agentId}/entries/{key}
 *
 * Decay: facts are tagged hot/warm/cold based on last access.
 * Hot (≤7d) → loaded first. Warm (8-30d) → loaded if space. Cold (>30d) → skipped.
 */

import { getDb, serverTimestamp } from './firestoreClient';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MemoryType = 'fact' | 'preference' | 'lesson' | 'context' | 'relationship' | 'goal_insight';
export type MemoryHeat = 'hot' | 'warm' | 'cold';

export interface TacitMemory {
  id:         string;
  type:       MemoryType;
  key:        string;
  value:      string;
  heat:       MemoryHeat;
  usedCount:  number;
  lastUsedAt: string;
  createdAt:  string;
}

export interface EntityFact {
  id:          string;
  entity:      string;   // e.g. "john_smith", "acme_corp"
  entityType:  'person' | 'company' | 'product' | 'project' | 'other';
  fact:        string;
  category:    'relationship' | 'milestone' | 'status' | 'preference' | 'contact';
  status:      'active' | 'superseded';
  supersededBy?: string;
  createdAt:   string;
}

export interface DailyNote {
  date:      string;   // YYYY-MM-DD
  entries:   string[]; // timeline entries
  plan?:     string;   // today's proposed plan (CEO writes this)
  summary?:  string;   // end-of-day summary
}

// ── Heat calculation ──────────────────────────────────────────────────────────

function getHeat(lastUsedAt: string): MemoryHeat {
  if (!lastUsedAt) return 'warm';
  const daysSince = (Date.now() - new Date(lastUsedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince <= 7)  return 'hot';
  if (daysSince <= 30) return 'warm';
  return 'cold';
}

// ── Layer 3: Tacit Knowledge (MEMORY.md equivalent) ──────────────────────────

export async function loadTacitMemory(agentId: string): Promise<TacitMemory[]> {
  const db = getDb();
  try {
    const snap = await db
      .collection('agent_memory')
      .where('agentId', '==', agentId)
      .orderBy('usedCount', 'desc')
      .limit(40)
      .get();

    return snap.docs
      .map(d => {
        const data = d.data();
        const lastUsed = data.lastUsedAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || '';
        return {
          id:         d.id,
          type:       data.type as MemoryType,
          key:        data.key,
          value:      data.value,
          heat:       getHeat(lastUsed),
          usedCount:  data.usedCount || 0,
          lastUsedAt: lastUsed,
          createdAt:  data.createdAt?.toDate?.()?.toISOString() || '',
        };
      })
      .filter(m => m.heat !== 'cold') // skip cold memories by default
      .sort((a, b) => {
        const heatOrder = { hot: 0, warm: 1, cold: 2 };
        return heatOrder[a.heat] - heatOrder[b.heat];
      });
  } catch {
    return [];
  }
}

export async function saveTacitMemory(
  agentId:   string,
  companyId: string,
  type:      MemoryType,
  key:       string,
  value:     string,
): Promise<string> {
  const db = getDb();
  const existing = await db
    .collection('agent_memory')
    .where('agentId', '==', agentId)
    .where('key', '==', key)
    .limit(1)
    .get();

  const now = new Date().toISOString();
  if (!existing.empty) {
    await existing.docs[0].ref.update({ value, type, lastUsedAt: now, updatedAt: serverTimestamp() });
    return existing.docs[0].id;
  }
  const ref = db.collection('agent_memory').doc();
  await ref.set({
    agentId, companyId, type, key, value,
    usedCount: 0, lastUsedAt: now,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function forgetTacitMemory(agentId: string, key: string): Promise<void> {
  const db = getDb();
  const snap = await db.collection('agent_memory').where('agentId', '==', agentId).where('key', '==', key).limit(1).get();
  await Promise.all(snap.docs.map(d => d.ref.delete()));
}

// ── Layer 1: Knowledge Graph (~/life/ equivalent) ────────────────────────────

export async function saveEntityFact(
  agentId:    string,
  companyId:  string,
  entity:     string,
  entityType: EntityFact['entityType'],
  fact:       string,
  category:   EntityFact['category'],
): Promise<string> {
  const db = getDb();
  const ref = db.collection('agent_knowledge').doc();
  await ref.set({
    agentId, companyId, entity, entityType, fact, category,
    status: 'active', supersededBy: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function loadEntityFacts(agentId: string, entity?: string): Promise<EntityFact[]> {
  const db = getDb();
  try {
    let q = db.collection('agent_knowledge')
      .where('agentId', '==', agentId)
      .where('status', '==', 'active');
    if (entity) q = q.where('entity', '==', entity) as typeof q;
    const snap = await q.limit(30).get();
    return snap.docs.map(d => ({
      id:          d.id,
      entity:      d.data().entity,
      entityType:  d.data().entityType,
      fact:        d.data().fact,
      category:    d.data().category,
      status:      d.data().status,
      createdAt:   d.data().createdAt?.toDate?.()?.toISOString() || '',
    }));
  } catch {
    return [];
  }
}

// ── Layer 2: Daily Notes ──────────────────────────────────────────────────────

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function appendDailyNote(agentId: string, companyId: string, entry: string): Promise<void> {
  const db = getDb();
  const date = todayKey();
  const docId = `${agentId}_${date}`;
  const ref = db.collection('agent_daily_notes').doc(docId);
  const snap = await ref.get();
  const ts = new Date().toISOString().slice(11, 16); // HH:MM

  if (!snap.exists) {
    await ref.set({ agentId, companyId, date, entries: [`[${ts}] ${entry}`], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  } else {
    const entries: string[] = snap.data()?.entries || [];
    entries.push(`[${ts}] ${entry}`);
    await ref.update({ entries, updatedAt: serverTimestamp() });
  }
}

export async function loadTodayNote(agentId: string): Promise<DailyNote | null> {
  const db = getDb();
  const date = todayKey();
  const snap = await db.collection('agent_daily_notes').doc(`${agentId}_${date}`).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  return { date: d.date, entries: d.entries || [], plan: d.plan, summary: d.summary };
}

export async function saveDailyPlan(agentId: string, companyId: string, plan: string): Promise<void> {
  const db = getDb();
  const date = todayKey();
  const ref = db.collection('agent_daily_notes').doc(`${agentId}_${date}`);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({ agentId, companyId, date, entries: [], plan, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  } else {
    await ref.update({ plan, updatedAt: serverTimestamp() });
  }
}

// ── Load all memory for prompt injection ─────────────────────────────────────

export async function loadAllMemory(agentId: string): Promise<{
  tacit: TacitMemory[];
  entities: EntityFact[];
  todayNote: DailyNote | null;
}> {
  const [tacit, entities, todayNote] = await Promise.all([
    loadTacitMemory(agentId),
    loadEntityFacts(agentId),
    loadTodayNote(agentId),
  ]);
  return { tacit, entities, todayNote };
}

// ── Format memory for system prompt ──────────────────────────────────────────

export function formatMemoryForPrompt(tacit: TacitMemory[], entities: EntityFact[], todayNote: DailyNote | null): string {
  if (tacit.length === 0 && entities.length === 0 && !todayNote) return '';

  const parts: string[] = ['--- YOUR MEMORY ---'];

  // Today's plan (highest priority)
  if (todayNote?.plan) {
    parts.push(`📅 TODAY'S PLAN:\n${todayNote.plan}`);
  }

  // Today's activity so far
  if (todayNote?.entries && todayNote.entries.length > 0) {
    parts.push(`🗓 TODAY'S ACTIVITY:\n${todayNote.entries.slice(-10).join('\n')}`);
  }

  // Tacit knowledge by type
  if (tacit.length > 0) {
    const typeLabels: Record<MemoryType, string> = {
      preference:   '💡 Founder Preferences',
      lesson:       '🎓 Lessons Learned',
      fact:         '📌 Key Facts',
      context:      '🏢 Context',
      relationship: '🤝 Relationships',
      goal_insight: '🎯 Goal Insights',
    };
    const byType: Partial<Record<MemoryType, TacitMemory[]>> = {};
    for (const m of tacit) {
      if (!byType[m.type]) byType[m.type] = [];
      byType[m.type]!.push(m);
    }
    for (const [type, entries] of Object.entries(byType)) {
      const label = typeLabels[type as MemoryType] || type;
      parts.push(`${label}:\n${entries!.map(e => `  - ${e.key}: ${e.value}`).join('\n')}`);
    }
  }

  // Knowledge graph (people, companies)
  if (entities.length > 0) {
    const byEntity: Record<string, EntityFact[]> = {};
    for (const e of entities) {
      if (!byEntity[e.entity]) byEntity[e.entity] = [];
      byEntity[e.entity].push(e);
    }
    const entityLines = Object.entries(byEntity).map(([entity, facts]) =>
      `  ${entity}: ${facts.map(f => f.fact).join('; ')}`
    ).join('\n');
    parts.push(`🗂 KNOWLEDGE GRAPH:\n${entityLines}`);
  }

  parts.push('--- END MEMORY ---');
  return '\n\n' + parts.join('\n\n');
}

// ── Legacy aliases (keep backward compat) ────────────────────────────────────
export const loadAgentMemory  = loadTacitMemory;
export const saveMemory       = saveTacitMemory;
export const forgetMemory     = forgetTacitMemory;
