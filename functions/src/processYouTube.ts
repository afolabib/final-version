/**
 * processYouTube.ts — Real YouTube transcript → AI-selected clips
 *
 * POST body: { videoId, projectId, ownerId }
 *
 * Flow:
 *  1. Fetch full YouTube timed-text transcript
 *  2. Build a timestamped readable transcript string
 *  3. Send full transcript to Claude → Claude acts as editor, picks best moments
 *     with exact start/end timestamps, titles, scores, and reasons
 *  4. Extract word events for each window → build word-level captions
 *  5. Save clips to Firestore, update project status
 */

import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import { db, serverTimestamp } from './firebase';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const cfg = functions.config();
const OPENROUTER_API_KEY = cfg.openrouter?.api_key || process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const GRADIENT_POOL = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #ffecd2, #fcb69f)',
  'linear-gradient(135deg, #89f7fe, #66a6ff)',
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface WordEvent {
  utf8: string;
  tOffsetMs: number;
  dDurationMs?: number;
}

interface AIClip {
  startSec: number;
  endSec: number;
  title: string;
  viralityScore: number;
  hookScore: number;
  flowScore: number;
  reason: string;
}

interface BuiltClip {
  title: string;
  startMs: number;
  endMs: number;
  text: string;
  captions: { start: number; end: number; text: string }[];
  viralityScore: number;
  hookScore: number;
  flowScore: number;
  scoreReason: string;
}

// ── Step 1: Fetch transcript ──────────────────────────────────────────────────

async function fetchTranscript(videoId: string): Promise<WordEvent[]> {
  const urls = [
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en-US&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en-GB&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&asr_langs=en&kind=asr&lang=en&fmt=json3`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Freemi/1.0)' },
      });
      if (!res.ok) continue;
      const data = await res.json() as any;
      const words: WordEvent[] = [];
      for (const event of (data.events || [])) {
        if (!event.segs) continue;
        for (const seg of event.segs) {
          if (seg.utf8 && seg.utf8.trim() && seg.utf8.trim() !== '\n') {
            words.push({
              utf8: seg.utf8.trim(),
              tOffsetMs: (event.tStartMs || 0) + (seg.tOffsetMs || 0),
              dDurationMs: seg.dDurationMs || event.dDurationMs || 500,
            });
          }
        }
      }
      if (words.length > 20) return words;
    } catch {}
  }
  return [];
}

// ── Step 2: Build timestamped transcript for Claude ───────────────────────────
// Format: [0:05] word word word word word word word word
// Timestamp marker every ~10 seconds so Claude can reference exact moments

function buildTimestampedTranscript(words: WordEvent[]): string {
  if (words.length === 0) return '';

  const lines: string[] = [];
  let currentLine: string[] = [];
  let lineStartMs = words[0].tOffsetMs;
  let lastMarkerMs = -99999;
  const MARKER_INTERVAL_MS = 10_000; // new timestamp every ~10s

  for (const word of words) {
    const shouldMark = word.tOffsetMs - lastMarkerMs >= MARKER_INTERVAL_MS;
    if (shouldMark && currentLine.length > 0) {
      lines.push(`[${formatSec(lineStartMs / 1000)}] ${currentLine.join(' ')}`);
      currentLine = [];
      lineStartMs = word.tOffsetMs;
      lastMarkerMs = word.tOffsetMs;
    } else if (currentLine.length === 0) {
      lineStartMs = word.tOffsetMs;
    }
    currentLine.push(word.utf8);
  }
  if (currentLine.length > 0) {
    lines.push(`[${formatSec(lineStartMs / 1000)}] ${currentLine.join(' ')}`);
  }

  return lines.join('\n');
}

function formatSec(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Step 3: Claude finds the best clip moments ────────────────────────────────

async function findClipsWithAI(
  transcript: string,
  videoDurationSec: number,
): Promise<AIClip[]> {

  // Limit transcript length for very long videos (keep ~120 mins max)
  const MAX_CHARS = 80_000;
  const truncated = transcript.length > MAX_CHARS
    ? transcript.slice(0, MAX_CHARS) + '\n[transcript truncated]'
    : transcript;

  const prompt = `You are an expert short-form video editor. Your job is to find the BEST moments in this video transcript to turn into viral TikTok / Instagram Reels / YouTube Shorts clips.

Read the full transcript below and identify 8-10 moments that would make outstanding standalone short clips (15-90 seconds each).

Look for:
- Strong hooks in the first 3 seconds (provocative statements, questions, surprising facts)
- Complete thoughts or stories that stand alone without context
- Emotional peaks, controversial opinions, counterintuitive insights
- Quotable moments, practical tips, or "aha" revelations
- Natural start/end points (don't cut mid-sentence)

The timestamps in the transcript are formatted as [M:SS].

Return ONLY a JSON array. Each item:
{
  "startSec": number,   // exact second to start the clip
  "endSec": number,     // exact second to end the clip (15-90s after start)
  "title": string,      // viral clip title, max 8 words, no quotes
  "viralityScore": number,  // 0-100: will this stop the scroll?
  "hookScore": number,      // 0-100: how strong is the opening 3 seconds?
  "flowScore": number,      // 0-100: does it hold attention start to finish?
  "reason": string          // one sentence: why this moment works as a clip
}

TRANSCRIPT:
${truncated}

Return ONLY the JSON array, nothing else.`;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-5-sonnet',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.4,
      }),
    });

    const data = await res.json() as any;
    const raw = data.choices?.[0]?.message?.content || '[]';
    const jsonStr = raw.match(/\[[\s\S]*\]/)?.[0] || '[]';
    const clips: AIClip[] = JSON.parse(jsonStr);

    // Validate and clamp
    return clips
      .filter(c => typeof c.startSec === 'number' && typeof c.endSec === 'number')
      .map(c => ({
        startSec: Math.max(0, Math.round(c.startSec)),
        endSec: Math.min(videoDurationSec, Math.round(c.endSec)),
        title: String(c.title || 'Untitled clip').slice(0, 80),
        viralityScore: Math.min(99, Math.max(10, Math.round(c.viralityScore || 60))),
        hookScore: Math.min(99, Math.max(10, Math.round(c.hookScore || 60))),
        flowScore: Math.min(99, Math.max(10, Math.round(c.flowScore || 60))),
        reason: String(c.reason || '').slice(0, 200),
      }))
      .filter(c => c.endSec - c.startSec >= 10) // minimum 10s
      .slice(0, 10);
  } catch (e) {
    console.error('[findClipsWithAI] Claude call failed:', e);
    return [];
  }
}

// ── Step 4: Extract words for a time window → build captions ─────────────────

function extractWordsInWindow(words: WordEvent[], startMs: number, endMs: number): WordEvent[] {
  return words.filter(w => w.tOffsetMs >= startMs && w.tOffsetMs < endMs);
}

function buildCaptions(
  words: WordEvent[],
  clipStartMs: number,
): { start: number; end: number; text: string }[] {
  if (words.length === 0) return [];
  const WORDS_PER_CAPTION = 6;
  const captions: { start: number; end: number; text: string }[] = [];

  for (let i = 0; i < words.length; i += WORDS_PER_CAPTION) {
    const chunk = words.slice(i, i + WORDS_PER_CAPTION);
    const chunkStart = (chunk[0].tOffsetMs - clipStartMs) / 1000;
    const lastWord = chunk[chunk.length - 1];
    const chunkEnd = (lastWord.tOffsetMs + (lastWord.dDurationMs || 500) - clipStartMs) / 1000;
    captions.push({
      start: Math.max(0, chunkStart),
      end: Math.max(0, chunkEnd),
      text: chunk.map(w => w.utf8).join(' ').trim(),
    });
  }
  return captions;
}

// ── Heuristic fallback when AI can't find clips ───────────────────────────────

function heuristicClips(words: WordEvent[], videoDurationSec: number): BuiltClip[] {
  const HOOK_WORDS = ['secret', 'truth', 'nobody', 'everyone', 'stop', 'mistake',
    'changed', 'discovered', 'never', 'always', 'biggest', 'worst', 'best',
    'honest', 'actually', 'real', 'problem', 'wrong', 'failed', 'win'];

  // Build 30-second windows and score by hook word density
  const windowSec = 45;
  const stepSec = 15;
  const candidates: BuiltClip[] = [];

  for (let s = 0; s + windowSec <= videoDurationSec; s += stepSec) {
    const startMs = s * 1000;
    const endMs = (s + windowSec) * 1000;
    const windowWords = extractWordsInWindow(words, startMs, endMs);
    if (windowWords.length < 20) continue;

    const text = windowWords.map(w => w.utf8).join(' ').toLowerCase();
    const hookCount = HOOK_WORDS.filter(w => text.includes(w)).length;
    const vs = Math.min(80, 35 + hookCount * 9);

    candidates.push({
      title: windowWords.slice(0, 6).map(w => w.utf8).join(' '),
      startMs, endMs,
      text: windowWords.map(w => w.utf8).join(' '),
      captions: buildCaptions(windowWords, startMs),
      viralityScore: vs,
      hookScore: Math.min(90, vs + 5),
      flowScore: Math.min(85, vs - 5),
      scoreReason: 'Selected by keyword heuristics',
    });
  }

  return candidates
    .sort((a, b) => b.viralityScore - a.viralityScore)
    .slice(0, 10);
}

// ── Step 5: Save to Firestore ─────────────────────────────────────────────────

async function saveClips(
  projectId: string,
  ownerId: string,
  videoId: string,
  clips: BuiltClip[],
): Promise<void> {
  const sorted = clips.sort((a, b) => b.viralityScore - a.viralityScore).slice(0, 10);
  const batch = db.batch();

  for (let i = 0; i < sorted.length; i++) {
    const clip = sorted[i];
    const ref = db.collection('clipProjects').doc(projectId).collection('clips').doc();
    batch.set(ref, {
      projectId,
      ownerId,
      title: clip.title,
      startTime: Math.round(clip.startMs / 1000),
      endTime: Math.round(clip.endMs / 1000),
      duration: Math.round((clip.endMs - clip.startMs) / 1000),
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      thumbnailGradient: GRADIENT_POOL[i % GRADIENT_POOL.length],
      viralityScore: clip.viralityScore,
      hookScore: clip.hookScore,
      flowScore: clip.flowScore,
      scoreReason: clip.scoreReason,
      captions: clip.captions,
      transcript: clip.text.slice(0, 1000),
      aspectRatio: '9:16',
      status: 'draft',
      videoId,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
  await db.collection('clipProjects').doc(projectId).update({
    status: 'ready',
    clipCount: sorted.length,
    updatedAt: serverTimestamp(),
  });
}

// ── HTTP handler ──────────────────────────────────────────────────────────────

export const processYouTubeVideo = functions
  .runWith({ timeoutSeconds: 300, memory: '512MB' })
  .https.onRequest(async (req, res) => {
    res.set(CORS_HEADERS);
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

    const { videoId, projectId, ownerId } = req.body;
    if (!videoId || !projectId || !ownerId) {
      res.status(400).json({ error: 'videoId, projectId, ownerId required' });
      return;
    }

    const projectRef = db.collection('clipProjects').doc(projectId);

    try {
      await projectRef.update({ status: 'processing', processingStep: 'Fetching transcript…', updatedAt: serverTimestamp() });

      // 1. Fetch transcript
      const words = await fetchTranscript(videoId);
      const hasTranscript = words.length > 30;

      if (!hasTranscript) {
        // No captions — evenly space placeholder clips
        await projectRef.update({ processingStep: 'No transcript — generating highlights…', updatedAt: serverTimestamp() });
        const snap = await projectRef.get();
        const duration = snap.data()?.duration || 600;
        const placeholders: BuiltClip[] = Array.from({ length: 8 }, (_, i) => {
          const startMs = Math.floor((i / 8) * duration) * 1000;
          return {
            title: `Highlight ${i + 1}`,
            startMs, endMs: startMs + 45_000,
            text: '', captions: [],
            viralityScore: 40 + Math.floor(Math.random() * 25),
            hookScore: 40 + Math.floor(Math.random() * 25),
            flowScore: 40 + Math.floor(Math.random() * 25),
            scoreReason: 'No transcript — manual review recommended',
          };
        });
        await saveClips(projectId, ownerId, videoId, placeholders);
        res.json({ success: true, clipCount: placeholders.length, hasTranscript: false });
        return;
      }

      // 2. Build timestamped transcript for Claude
      await projectRef.update({ processingStep: 'Reading transcript…', updatedAt: serverTimestamp() });
      const timestampedTranscript = buildTimestampedTranscript(words);

      // 3. Let Claude find the best moments
      await projectRef.update({ processingStep: 'AI is finding the best moments…', updatedAt: serverTimestamp() });
      const lastWordMs = words[words.length - 1].tOffsetMs + (words[words.length - 1].dDurationMs || 500);
      const videoDurationSec = Math.ceil(lastWordMs / 1000);

      let aiClips = await findClipsWithAI(timestampedTranscript, videoDurationSec);

      // 4. Convert AI clip picks into full clip objects with captions
      await projectRef.update({ processingStep: 'Building captions…', updatedAt: serverTimestamp() });

      let builtClips: BuiltClip[];

      if (aiClips.length >= 3) {
        builtClips = aiClips.map((c, i) => {
          const startMs = c.startSec * 1000;
          const endMs = c.endSec * 1000;
          const clipWords = extractWordsInWindow(words, startMs, endMs);
          const text = clipWords.map(w => w.utf8).join(' ');
          return {
            title: c.title,
            startMs, endMs, text,
            captions: buildCaptions(clipWords, startMs),
            viralityScore: c.viralityScore,
            hookScore: c.hookScore,
            flowScore: c.flowScore,
            scoreReason: c.reason,
          };
        });
      } else {
        // Claude failed or returned too few — use heuristic fallback
        console.warn(`[processYouTube] AI returned ${aiClips.length} clips, falling back to heuristics`);
        builtClips = heuristicClips(words, videoDurationSec);
      }

      // 5. Save
      await projectRef.update({ processingStep: 'Saving clips…', updatedAt: serverTimestamp() });
      await saveClips(projectId, ownerId, videoId, builtClips);

      res.json({ success: true, clipCount: Math.min(builtClips.length, 10), hasTranscript: true });

    } catch (e: any) {
      console.error('[processYouTube] error:', e);
      await projectRef.update({ status: 'error', processingError: e.message || 'Unknown error', updatedAt: serverTimestamp() }).catch(() => {});
      res.status(500).json({ error: e.message || 'Processing failed' });
    }
  });
