/**
 * widgetChat.ts
 *
 * HTTPS onRequest: public-facing chat endpoint for FreemiWidget embeds.
 * Called via fetch() from the widget JS with CORS open to all origins.
 *
 * POST body: { widgetId, message, sessionId, history: [{role, content}] }
 * Response:  { reply, sessionId }
 */

import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import { db, serverTimestamp } from './firebase';

const cfg = functions.config();
const OPENROUTER_API_KEY = cfg.openrouter?.api_key || process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface WidgetConfig {
  businessName: string;
  greeting?: string;
  capabilities?: string[];
  customInstructions?: string;
  ownerEmail?: string;
}

function buildSystemPrompt(config: WidgetConfig): string {
  const { businessName, customInstructions, capabilities = [] } = config;

  const customBlock = customInstructions
    ? `\n${customInstructions}\n`
    : '';

  const capabilitiesBlock = capabilities.length > 0
    ? capabilities.join(', ')
    : 'general enquiries, bookings, complaints, lead capture';

  return `You are the Freemi Concierge for ${businessName}.

You are not a chatbot. You are an execution system embedded in chat.

Your role: understand intent, take action immediately, complete tasks end-to-end.
${customBlock}
CAPABILITIES: ${capabilitiesBlock}

CORE RULES:
- Never redirect users to another page. Execute everything inside this conversation.
- Always progress the task. Every response moves it forward.
- Collect data in short sequential steps — never overwhelm.
- Handle: bookings, enquiries, complaints, purchases, lead capture.

INTERACTION FLOW:
1. Understand intent
2. Take control — guide step by step
3. Collect: name, email, request type, date/timeline, budget (if relevant)
4. Confirm completion clearly

TONE: professional, efficient, calm, confident. No robotic phrasing.

When you have collected all required information, end your response with a JSON block exactly like this:
<FREEMI_ACTION>
{"type":"booking"|"enquiry"|"complaint"|"lead", "data":{...collected fields...}}
</FREEMI_ACTION>`;
}

function parseFreemiAction(reply: string): {
  visibleReply: string;
  leadData: Record<string, unknown> | null;
} {
  const actionRegex = /<FREEMI_ACTION>\s*([\s\S]*?)\s*<\/FREEMI_ACTION>/;
  const match = reply.match(actionRegex);

  if (!match) {
    return { visibleReply: reply.trim(), leadData: null };
  }

  let leadData: Record<string, unknown> | null = null;
  try {
    leadData = JSON.parse(match[1]);
  } catch {
    // malformed JSON in action block — ignore it
  }

  const visibleReply = reply.replace(actionRegex, '').trim();
  return { visibleReply, leadData };
}

export const widgetChat = functions.https.onRequest(async (req, res) => {
  // ── CORS preflight ─────────────────────────────────────────────────────────
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

    // ── Validate required fields ─────────────────────────────────────────────
    if (!widgetId || typeof widgetId !== 'string') {
      res.status(400).json({ error: 'widgetId is required' });
      return;
    }
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'message is required' });
      return;
    }
    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }
    if (!OPENROUTER_API_KEY) {
      res.status(500).json({ error: 'OpenRouter API key not configured' });
      return;
    }

    // ── Fetch widget config from Firestore ───────────────────────────────────
    const widgetSnap = await db.collection('widgets').doc(widgetId).get();
    if (!widgetSnap.exists) {
      res.status(404).json({ error: 'Widget not found' });
      return;
    }

    const widgetConfig = widgetSnap.data() as WidgetConfig;

    // ── Build messages for OpenRouter ────────────────────────────────────────
    const systemPrompt = buildSystemPrompt(widgetConfig);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-20).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    // ── Call OpenRouter ──────────────────────────────────────────────────────
    const orRes = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://freemi.ai',
        'X-Title': 'FreemiWidget',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    const orJson = (await orRes.json()) as any;

    if (!orRes.ok) {
      console.error('[widgetChat] OpenRouter error:', orJson);
      res.status(500).json({ error: `OpenRouter error: ${orJson?.error?.message || orRes.status}` });
      return;
    }

    const rawReply: string = orJson.choices?.[0]?.message?.content || '';

    // ── Parse FREEMI_ACTION block ────────────────────────────────────────────
    const { visibleReply, leadData } = parseFreemiAction(rawReply);

    // ── Persist conversation to Firestore ────────────────────────────────────
    const updatedMessages = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: visibleReply },
    ];

    const conversationUpdate: Record<string, unknown> = {
      widgetId,
      messages: updatedMessages,
      updatedAt: serverTimestamp(),
    };

    // Merge leadData if a structured action was captured
    if (leadData) {
      conversationUpdate.leadData = leadData;
    } else {
      // Ensure leadData field exists even when empty
      conversationUpdate['leadData'] = {};
    }

    await db
      .collection('widget_conversations')
      .doc(sessionId)
      .set(conversationUpdate, { merge: true });

    // ── Respond ──────────────────────────────────────────────────────────────
    res.status(200).json({ reply: visibleReply, sessionId });
  } catch (err) {
    console.error('[widgetChat] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
