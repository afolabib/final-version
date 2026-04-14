/**
 * widgetChat.ts  — Freemi AI Concierge v2
 *
 * Upgrades over v1:
 *  1. Usage enforcement  — checks monthly conversation count vs plan limit before calling AI
 *  2. Knowledge base     — injects per-widget FAQ/docs into system prompt
 *  3. Orchestrator prompt — intent classification, memory, structured collection, escalation
 *  4. Token tracking     — records token usage per conversation for cost visibility
 *
 * POST body: { widgetId, message, sessionId, history: [{role, content}] }
 * Response:  { reply, sessionId, usageWarning? }
 */

import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import { db, serverTimestamp, admin } from './firebase';

const increment = admin.firestore.FieldValue.increment;

const cfg = functions.config();
const OPENROUTER_API_KEY = cfg.openrouter?.api_key || process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Plan limits ───────────────────────────────────────────────────────────────
const PLAN_LIMITS: Record<string, number> = {
  starter:  500,
  growth:   1500,
  business: 5000,
};

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface WidgetConfig {
  businessName: string;
  botName?: string;
  greeting?: string;
  capabilities?: string[];
  customInstructions?: string;
  tone?: string;
  personality?: string[];
  ownerEmail?: string;
  userId?: string;
  ownerId?: string;
}

interface KnowledgeEntry {
  title: string;
  content: string;
}

interface PageEntry {
  title?: string;
  slug?: string;
  sections?: Array<{ heading?: string; body?: string; text?: string; content?: string }>;
  content?: string;
  body?: string;
}

// ── Usage doc helpers ─────────────────────────────────────────────────────────
// Structure: usage/{userId}/monthly/{YYYY-MM}
//   → { total: N, widgets: { widgetId: N }, updatedAt }
// This gives us O(1) reads and atomic writes — no collection scans.

function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function usageRef(userId: string) {
  return db.collection('usage').doc(userId).collection('monthly').doc(monthKey());
}

async function getMonthlyUsage(userId: string): Promise<{ total: number; widgets: Record<string, number> }> {
  const snap = await usageRef(userId).get();
  if (!snap.exists) return { total: 0, widgets: {} };
  const d = snap.data() as any;
  return { total: d.total || 0, widgets: d.widgets || {} };
}

async function incrementUsage(userId: string, widgetId: string): Promise<void> {
  await usageRef(userId).set({
    total: increment(1),
    [`widgets.${widgetId}`]: increment(1),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ── Fetch knowledge base entries for a widget ─────────────────────────────────
async function getKnowledgeBase(widgetId: string): Promise<KnowledgeEntry[]> {
  try {
    const snap = await db.collection('widgets').doc(widgetId)
      .collection('knowledge').get();
    return snap.docs.map(d => d.data() as KnowledgeEntry);
  } catch {
    return [];
  }
}

// ── Fetch website pages for an owner ─────────────────────────────────────────
async function getWebsitePages(ownerId: string): Promise<string> {
  try {
    // Find sites owned by this user
    const sitesSnap = await db.collection('websites')
      .where('userId', '==', ownerId).limit(3).get();
    if (sitesSnap.empty) return '';

    const sections: string[] = [];
    for (const siteDoc of sitesSnap.docs) {
      const site = siteDoc.data();
      const pagesSnap = await db.collection('websites').doc(siteDoc.id)
        .collection('pages').limit(20).get();

      for (const pageDoc of pagesSnap.docs) {
        const page = pageDoc.data() as PageEntry;
        const pageTitle = page.title || pageDoc.id;
        const chunks: string[] = [];

        // Extract text from sections array
        if (Array.isArray(page.sections)) {
          for (const s of page.sections) {
            const heading = s.heading || '';
            const body = s.body || s.text || s.content || '';
            if (body) chunks.push(heading ? `${heading}: ${body}` : body);
          }
        }
        // Flat content fields
        if (page.content) chunks.push(page.content);
        if (page.body) chunks.push(page.body);

        if (chunks.length > 0) {
          sections.push(`### ${pageTitle}\n${chunks.join('\n').slice(0, 800)}`);
        }
      }
    }

    return sections.length > 0
      ? `# WEBSITE CONTENT\n\nUse this to answer questions about the business.\n\n${sections.join('\n\n')}`
      : '';
  } catch {
    return '';
  }
}

// ── Felix-style system prompt builder ────────────────────────────────────────
// Generates a rich multi-file identity context for the concierge agent,
// modelled on the Felix v11 framework: SOUL + IDENTITY + ORCHESTRATION + KNOWLEDGE
function buildSystemPrompt(config: WidgetConfig, knowledge: KnowledgeEntry[], websiteContent = ''): string {
  const name        = config.businessName || 'this business';
  const botName     = config.botName || 'Concierge';
  const tone        = config.tone || 'professional';
  const personality = (config.personality || []).join(', ') || 'warm, efficient, confident';
  const caps        = (config.capabilities || []).length > 0
    ? (config.capabilities || []).join(', ')
    : 'general enquiries, bookings, lead capture, support';

  // ── SOUL ──────────────────────────────────────────────────────────────────
  const SOUL = `# ${botName} — AI Concierge for ${name}

Tone: ${tone}. Personality: ${personality}.

RULES (non-negotiable):
- Max 2 sentences per response. Be direct. No filler.
- Ask ONE question per message. Never two.
- Never redirect — execute everything inside this chat.
- Use the visitor's name as soon as you know it.
- Never apologise for being an AI.`;

  // ── IDENTITY ──────────────────────────────────────────────────────────────
  const IDENTITY = `# Capabilities: ${caps}`;

  // ── ORCHESTRATION ─────────────────────────────────────────────────────────
  const ORCHESTRATION = `# How to handle conversations

Classify intent silently: BOOKING / ENQUIRY / LEAD / SUPPORT / FAQ

Collect one field at a time:
- BOOKING: name → date → email → details
- LEAD: name → interest → email
- SUPPORT: name → issue → email
- ENQUIRY: answer → next step

Never re-ask for info already given. Reference it naturally.

When all fields collected, confirm in 1 sentence then output:
<FREEMI_ACTION>
{"type":"booking|enquiry|lead|support","data":{...all fields...}}
</FREEMI_ACTION>`;

  // ── BUSINESS CONTEXT ──────────────────────────────────────────────────────
  const CONTEXT = config.customInstructions
    ? `# BUSINESS CONTEXT — ${name}\n\n${config.customInstructions}`
    : '';

  // ── KNOWLEDGE BASE ────────────────────────────────────────────────────────
  const KNOWLEDGE = knowledge.length > 0
    ? `# KNOWLEDGE BASE — ${name}\n\nUse the following entries to answer visitor questions accurately. Always prefer this information over general knowledge.\n\n` +
      knowledge.map(k => `## ${k.title}\n${k.content}`).join('\n\n')
    : '';

  // ── Assemble ──────────────────────────────────────────────────────────────
  return [SOUL, IDENTITY, ORCHESTRATION, CONTEXT, KNOWLEDGE, websiteContent]
    .filter(Boolean)
    .join('\n\n---\n\n');
}

// ── Parse FREEMI_ACTION ───────────────────────────────────────────────────────
function parseFreemiAction(reply: string): {
  visibleReply: string;
  leadData: Record<string, unknown> | null;
} {
  const actionRegex = /<FREEMI_ACTION>\s*([\s\S]*?)\s*<\/FREEMI_ACTION>/;
  const match = reply.match(actionRegex);
  if (!match) return { visibleReply: reply.trim(), leadData: null };

  let leadData: Record<string, unknown> | null = null;
  try { leadData = JSON.parse(match[1]); } catch { /* ignore malformed */ }

  return { visibleReply: reply.replace(actionRegex, '').trim(), leadData };
}

// ── Main handler ──────────────────────────────────────────────────────────────
export const widgetChat = functions.https.onRequest(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.set(CORS_HEADERS).status(204).send('');
    return;
  }
  res.set(CORS_HEADERS);

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { widgetId, message, sessionId, history = [] } = req.body as {
      widgetId: string;
      message: string;
      sessionId: string;
      history: HistoryMessage[];
    };

    if (!widgetId || !message || !sessionId) {
      res.status(400).json({ error: 'widgetId, message, and sessionId are required' });
      return;
    }
    if (!OPENROUTER_API_KEY) {
      res.status(500).json({ error: 'OpenRouter API key not configured' });
      return;
    }

    // ── Fetch widget config ──────────────────────────────────────────────────
    const widgetSnap = await db.collection('widgets').doc(widgetId).get();
    // Use empty defaults if widget doc doesn't exist yet — chat still works
    const widgetConfig: WidgetConfig = widgetSnap.exists
      ? (widgetSnap.data() as WidgetConfig)
      : { businessName: widgetId };

    // ── Usage enforcement ────────────────────────────────────────────────────
    const ownerId = widgetConfig.userId || widgetConfig.ownerId;
    let usageWarning: string | undefined;
    let planLimit = PLAN_LIMITS.starter;

    if (ownerId) {
      const [companySnap, monthlyUsage] = await Promise.all([
        db.collection('companies').doc(ownerId).get(),
        getMonthlyUsage(ownerId),
      ]);

      const planId: string = companySnap.exists ? (companySnap.data()?.planId || 'starter') : 'starter';
      planLimit = PLAN_LIMITS[planId] ?? PLAN_LIMITS.starter;
      const used = monthlyUsage.total;

      if (used >= planLimit) {
        res.status(429).json({
          error: 'Monthly conversation limit reached',
          reply: "I'm not available right now — please contact us directly.",
          limitReached: true,
          used,
          limit: planLimit,
        });
        return;
      }

      // Warn at 80%
      if (used >= planLimit * 0.8) {
        usageWarning = `${used}/${planLimit} conversations used this month`;
      }
    }

    // ── Fetch knowledge base + website pages in parallel ────────────────────
    const [knowledge, websiteContent] = await Promise.all([
      getKnowledgeBase(widgetId),
      ownerId ? getWebsitePages(ownerId) : Promise.resolve(''),
    ]);

    // ── Build prompt & call AI ───────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt(widgetConfig, knowledge, websiteContent);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-20).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const orRes = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://freemi.ai',
        'X-Title': 'FreemiWidget',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-5-haiku',
        messages,
        max_tokens: 250,
        temperature: 0.6,
      }),
    });

    const orJson = (await orRes.json()) as any;
    if (!orRes.ok) {
      console.error('[widgetChat] OpenRouter error:', orJson);
      res.status(500).json({ error: `OpenRouter error: ${orJson?.error?.message || orRes.status}` });
      return;
    }

    const rawReply: string = orJson.choices?.[0]?.message?.content || '';
    const tokensUsed: number = orJson.usage?.total_tokens || 0;

    const { visibleReply, leadData } = parseFreemiAction(rawReply);

    // ── Persist to Firestore ─────────────────────────────────────────────────
    const updatedMessages = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: visibleReply },
    ];

    const isNewConversation = history.length === 0;

    // Run conversation save + usage increment in parallel
    const writes: Promise<any>[] = [
      db.collection('widget_conversations').doc(sessionId).set({
        widgetId,
        ownerId: ownerId || null,
        messages: updatedMessages,
        leadData: leadData || {},
        tokensUsed,
        updatedAt: serverTimestamp(),
        ...(isNewConversation ? { createdAt: serverTimestamp() } : {}),
      }, { merge: true }),
    ];

    // Only count new conversations (first user message of session) against usage
    if (isNewConversation && ownerId) {
      writes.push(incrementUsage(ownerId, widgetId));
    }

    await Promise.all(writes);

    // ── Respond ──────────────────────────────────────────────────────────────
    res.status(200).json({
      reply: visibleReply,
      sessionId,
      ...(usageWarning ? { usageWarning } : {}),
    });

  } catch (err) {
    console.error('[widgetChat] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
