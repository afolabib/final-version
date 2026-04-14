"use strict";
/**
 * transcribeVideo.ts — Uploaded video → AssemblyAI transcript → AI clips
 *
 * POST body: { storagePath, projectId, ownerId, filename }
 *
 * Flow:
 *  1. Download uploaded video from Firebase Storage
 *  2. Upload binary to AssemblyAI upload endpoint → get audio_url
 *  3. Submit transcription job (word-level timestamps)
 *  4. Poll until complete (~1/4 of video duration)
 *  5. Convert AssemblyAI words → WordEvent format
 *  6. Build timestamped transcript, send to Claude for clip selection
 *  7. Save clips to Firestore, update project status → 'ready'
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
exports.transcribeVideo = void 0;
const functions = __importStar(require("firebase-functions"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const firebase_1 = require("./firebase");
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};
const cfg = functions.config();
const ASSEMBLYAI_KEY = cfg.assemblyai?.api_key || process.env.ASSEMBLYAI_API_KEY || '';
const OPENROUTER_KEY = cfg.openrouter?.api_key || process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const ASSEMBLYAI_BASE = 'https://api.assemblyai.com/v2';
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
// ── Step 1: Download file from Firebase Storage → Buffer ──────────────────────
async function downloadFromStorage(storagePath) {
    const bucket = firebase_1.admin.storage().bucket();
    const file = bucket.file(storagePath);
    const [buffer] = await file.download();
    return buffer;
}
// ── Step 2: Upload to AssemblyAI → audio_url ─────────────────────────────────
async function uploadToAssemblyAI(buffer) {
    const res = await (0, node_fetch_1.default)(`${ASSEMBLYAI_BASE}/upload`, {
        method: 'POST',
        headers: {
            'Authorization': ASSEMBLYAI_KEY,
            'Content-Type': 'application/octet-stream',
            'Transfer-Encoding': 'chunked',
        },
        body: buffer,
    });
    if (!res.ok)
        throw new Error(`AssemblyAI upload failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.upload_url;
}
// ── Step 3+4: Submit transcription + poll ────────────────────────────────────
async function transcribeWithAssemblyAI(audioUrl) {
    // Submit job
    const submitRes = await (0, node_fetch_1.default)(`${ASSEMBLYAI_BASE}/transcript`, {
        method: 'POST',
        headers: {
            'Authorization': ASSEMBLYAI_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            audio_url: audioUrl,
            word_boost: [],
            format_text: true,
            punctuate: true,
            disfluencies: false, // remove filler words like "um", "uh"
        }),
    });
    if (!submitRes.ok)
        throw new Error(`AssemblyAI submit failed: ${submitRes.status}`);
    const { id } = await submitRes.json();
    // Poll until complete (max 8 minutes)
    const deadline = Date.now() + 8 * 60 * 1000;
    while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 5000)); // wait 5s between polls
        const pollRes = await (0, node_fetch_1.default)(`${ASSEMBLYAI_BASE}/transcript/${id}`, {
            headers: { 'Authorization': ASSEMBLYAI_KEY },
        });
        const data = await pollRes.json();
        if (data.status === 'completed') {
            // Convert AssemblyAI words → WordEvent format
            return (data.words || []).map((w) => ({
                utf8: w.text,
                tOffsetMs: w.start,
                dDurationMs: w.end - w.start,
            }));
        }
        if (data.status === 'error') {
            throw new Error(`AssemblyAI transcription error: ${data.error}`);
        }
        // status === 'processing' or 'queued' — keep polling
    }
    throw new Error('Transcription timed out after 8 minutes');
}
// ── Step 5: Build timestamped transcript for Claude ───────────────────────────
function buildTimestampedTranscript(words) {
    const lines = [];
    let currentLine = [];
    let lineStartMs = words[0]?.tOffsetMs || 0;
    let lastMarkerMs = -99999;
    const MARKER_INTERVAL_MS = 10000;
    for (const word of words) {
        if (word.tOffsetMs - lastMarkerMs >= MARKER_INTERVAL_MS && currentLine.length > 0) {
            lines.push(`[${formatSec(lineStartMs / 1000)}] ${currentLine.join(' ')}`);
            currentLine = [];
            lineStartMs = word.tOffsetMs;
            lastMarkerMs = word.tOffsetMs;
        }
        else if (currentLine.length === 0) {
            lineStartMs = word.tOffsetMs;
        }
        currentLine.push(word.utf8);
    }
    if (currentLine.length > 0) {
        lines.push(`[${formatSec(lineStartMs / 1000)}] ${currentLine.join(' ')}`);
    }
    return lines.join('\n');
}
function formatSec(totalSec) {
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}
// ── Step 6: Claude finds best clip moments ────────────────────────────────────
async function findClipsWithAI(transcript, videoDurationSec) {
    const MAX_CHARS = 80000;
    const truncated = transcript.length > MAX_CHARS
        ? transcript.slice(0, MAX_CHARS) + '\n[transcript truncated]'
        : transcript;
    const prompt = `You are an expert short-form video editor. Find the BEST moments in this transcript for viral TikTok / Instagram Reels / YouTube Shorts clips.

Identify 8-10 moments (15-90 seconds each) that would make outstanding standalone clips.

Look for:
- Strong hooks in the first 3 seconds
- Complete thoughts/stories that stand alone
- Emotional peaks, controversial opinions, surprising facts
- Quotable moments, practical tips, revelations
- Natural start/end points (don't cut mid-sentence)

Timestamps format: [M:SS]

Return ONLY a JSON array. Each item:
{
  "startSec": number,
  "endSec": number,
  "title": string,        // viral title, max 8 words
  "viralityScore": number,  // 0-100
  "hookScore": number,
  "flowScore": number,
  "reason": string          // one sentence why this clip works
}

TRANSCRIPT:
${truncated}

Return ONLY the JSON array.`;
    try {
        const res = await (0, node_fetch_1.default)(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'anthropic/claude-3-5-sonnet',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 3000,
                temperature: 0.4,
            }),
        });
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content || '[]';
        const jsonStr = raw.match(/\[[\s\S]*\]/)?.[0] || '[]';
        const clips = JSON.parse(jsonStr);
        return clips
            .filter((c) => typeof c.startSec === 'number' && typeof c.endSec === 'number')
            .map((c) => ({
            startSec: Math.max(0, Math.round(c.startSec)),
            endSec: Math.min(videoDurationSec, Math.round(c.endSec)),
            title: String(c.title || '').slice(0, 80),
            viralityScore: Math.min(99, Math.max(10, Math.round(c.viralityScore || 60))),
            hookScore: Math.min(99, Math.max(10, Math.round(c.hookScore || 60))),
            flowScore: Math.min(99, Math.max(10, Math.round(c.flowScore || 60))),
            reason: String(c.reason || '').slice(0, 200),
        }))
            .filter((c) => c.endSec - c.startSec >= 10)
            .slice(0, 10);
    }
    catch (e) {
        console.error('[transcribeVideo] Claude call failed:', e);
        return [];
    }
}
// ── Build captions from word events in a time window ─────────────────────────
function buildCaptions(words, startMs, endMs) {
    const window = words.filter(w => w.tOffsetMs >= startMs && w.tOffsetMs < endMs);
    const WORDS_PER = 6;
    const captions = [];
    for (let i = 0; i < window.length; i += WORDS_PER) {
        const chunk = window.slice(i, i + WORDS_PER);
        const first = chunk[0];
        const last = chunk[chunk.length - 1];
        captions.push({
            start: Math.max(0, (first.tOffsetMs - startMs) / 1000),
            end: Math.max(0, (last.tOffsetMs + last.dDurationMs - startMs) / 1000),
            text: chunk.map(w => w.utf8).join(' ').trim(),
        });
    }
    return captions;
}
// ── Save clips to Firestore ───────────────────────────────────────────────────
async function saveClips(projectId, ownerId, clips, words) {
    const sorted = [...clips].sort((a, b) => b.viralityScore - a.viralityScore).slice(0, 10);
    const batch = firebase_1.db.batch();
    for (let i = 0; i < sorted.length; i++) {
        const c = sorted[i];
        const startMs = c.startSec * 1000;
        const endMs = c.endSec * 1000;
        const windowWords = words.filter(w => w.tOffsetMs >= startMs && w.tOffsetMs < endMs);
        const text = windowWords.map(w => w.utf8).join(' ');
        const ref = firebase_1.db.collection('clipProjects').doc(projectId).collection('clips').doc();
        batch.set(ref, {
            projectId, ownerId,
            title: c.title,
            startTime: c.startSec,
            endTime: c.endSec,
            duration: c.endSec - c.startSec,
            thumbnailUrl: null,
            thumbnailGradient: GRADIENT_POOL[i % GRADIENT_POOL.length],
            viralityScore: c.viralityScore,
            hookScore: c.hookScore,
            flowScore: c.flowScore,
            scoreReason: c.reason,
            captions: buildCaptions(words, startMs, endMs),
            transcript: text.slice(0, 1000),
            aspectRatio: '9:16',
            status: 'draft',
            videoId: null, // no YouTube ID for uploads
            sourceType: 'upload',
            createdAt: (0, firebase_1.serverTimestamp)(),
        });
    }
    await batch.commit();
    await firebase_1.db.collection('clipProjects').doc(projectId).update({
        status: 'ready',
        clipCount: sorted.length,
        updatedAt: (0, firebase_1.serverTimestamp)(),
    });
}
// ── HTTP handler ──────────────────────────────────────────────────────────────
exports.transcribeVideo = functions
    .runWith({ timeoutSeconds: 540, memory: '1GB' })
    .https.onRequest(async (req, res) => {
    res.set(CORS_HEADERS);
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'POST only' });
        return;
    }
    const { storagePath, projectId, ownerId } = req.body;
    if (!storagePath || !projectId || !ownerId) {
        res.status(400).json({ error: 'storagePath, projectId, ownerId required' });
        return;
    }
    if (!ASSEMBLYAI_KEY) {
        res.status(500).json({ error: 'AssemblyAI API key not configured. Run: firebase functions:config:set assemblyai.api_key="YOUR_KEY"' });
        return;
    }
    const projectRef = firebase_1.db.collection('clipProjects').doc(projectId);
    try {
        await projectRef.update({ status: 'processing', processingStep: 'Uploading to transcription service…', updatedAt: (0, firebase_1.serverTimestamp)() });
        // 1. Download from Storage
        const buffer = await downloadFromStorage(storagePath);
        await projectRef.update({ processingStep: 'Transcribing audio…', updatedAt: (0, firebase_1.serverTimestamp)() });
        // 2. Upload to AssemblyAI
        const audioUrl = await uploadToAssemblyAI(buffer);
        // 3+4. Transcribe
        const words = await transcribeWithAssemblyAI(audioUrl);
        if (words.length < 20) {
            // No speech detected — save empty clips
            await projectRef.update({ status: 'error', processingError: 'No speech detected in video', updatedAt: (0, firebase_1.serverTimestamp)() });
            res.status(422).json({ error: 'No speech detected' });
            return;
        }
        await projectRef.update({ processingStep: 'AI is finding the best moments…', updatedAt: (0, firebase_1.serverTimestamp)() });
        // 5. Build transcript for Claude
        const transcript = buildTimestampedTranscript(words);
        const lastWord = words[words.length - 1];
        const videoDurationSec = Math.ceil((lastWord.tOffsetMs + lastWord.dDurationMs) / 1000);
        // 6. Let Claude find best moments
        let aiClips = await findClipsWithAI(transcript, videoDurationSec);
        // Fallback: evenly spaced clips if Claude fails
        if (aiClips.length < 3) {
            const count = 8;
            aiClips = Array.from({ length: count }, (_, i) => {
                const startSec = Math.floor((i / count) * videoDurationSec);
                return {
                    startSec, endSec: Math.min(videoDurationSec, startSec + 45),
                    title: `Highlight ${i + 1}`,
                    viralityScore: 45, hookScore: 45, flowScore: 45,
                    reason: 'Auto-selected (AI fallback)',
                };
            });
        }
        await projectRef.update({ processingStep: 'Saving clips…', updatedAt: (0, firebase_1.serverTimestamp)() });
        // 7. Save
        await saveClips(projectId, ownerId, aiClips, words);
        res.json({ success: true, clipCount: Math.min(aiClips.length, 10) });
    }
    catch (e) {
        console.error('[transcribeVideo] error:', e);
        await projectRef.update({ status: 'error', processingError: e.message, updatedAt: (0, firebase_1.serverTimestamp)() }).catch(() => { });
        res.status(500).json({ error: e.message });
    }
});
