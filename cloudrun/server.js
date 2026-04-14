'use strict';

const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const admin = require('firebase-admin');
admin.initializeApp(); // Uses Application Default Credentials on GCP
const db = admin.firestore();
const bucket = admin.storage().bucket('freemi-3f7c7.appspot.com');

const app = express();
app.use(express.json({ limit: '1mb' }));

const RENDER_SECRET = process.env.RENDER_SECRET || '';

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Render-Secret');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  next();
});

// ── Auth middleware ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  if (RENDER_SECRET && req.headers['x-render-secret'] !== RENDER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ ok: true }));

// ── Caption style → FFmpeg ASS force_style ────────────────────────────────────
// ASS color: &HAABBGGRR (alpha, blue, green, red)
const CAPTION_STYLES = {
  modern:  "Fontname=Arial,FontSize=24,Bold=1,PrimaryColour=&H00FFFFFF,BackColour=&H99000000,BorderStyle=3,Shadow=0,Alignment=2,MarginV=40",
  karaoke: "Fontname=Arial,FontSize=28,Bold=1,PrimaryColour=&H0000FFFF,BackColour=&HCC000000,BorderStyle=3,Shadow=0,Alignment=2,MarginV=40",
  neon:    "Fontname=Arial,FontSize=24,Bold=1,PrimaryColour=&H00FF5F5B,OutlineColour=&H00FF5F5B,Outline=2,Shadow=0,Alignment=2,MarginV=40",
  bold:    "Fontname=Arial,FontSize=30,Bold=1,PrimaryColour=&H00FFFFFF,BackColour=&HCC5F5BFF,BorderStyle=3,Shadow=0,Alignment=2,MarginV=40",
  minimal: "Fontname=Arial,FontSize=20,PrimaryColour=&H00B8A394,Outline=0,Shadow=0,Alignment=2,MarginV=40",
};

// ── Build SRT file from captions array ───────────────────────────────────────
function buildSRT(captions) {
  return captions.map((cap, i) => {
    const fmt = s => {
      const ms = Math.round((s % 1) * 1000);
      const sec = Math.floor(s) % 60;
      const min = Math.floor(s / 60) % 60;
      const hr = Math.floor(s / 3600);
      return `${String(hr).padStart(2,'0')}:${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
    };
    return `${i+1}\n${fmt(cap.start)} --> ${fmt(cap.end)}\n${cap.text}\n`;
  }).join('\n');
}

// ── FFmpeg crop filter for aspect ratio ───────────────────────────────────────
function cropFilter(aspectRatio) {
  switch (aspectRatio) {
    case '9:16': return "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920";
    case '1:1':  return "crop=min(iw\\,ih):min(iw\\,ih):(iw-min(iw\\,ih))/2:(ih-min(iw\\,ih))/2,scale=1080:1080";
    case '16:9': return "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1:black";
    default:     return "scale=1080:1920";
  }
}

// ── Main render endpoint ──────────────────────────────────────────────────────
app.post('/render', async (req, res) => {
  const { videoId, startTime, endTime, captions = [], aspectRatio = '9:16', captionStyle = 'modern', projectId, clipId, ownerId } = req.body;

  if (!videoId || !projectId || !clipId) {
    return res.status(400).json({ error: 'videoId, projectId, clipId required' });
  }

  const jobId = crypto.randomUUID();
  const tmpDir = path.join(os.tmpdir(), jobId);
  fs.mkdirSync(tmpDir, { recursive: true });

  const sourceFile  = path.join(tmpDir, 'source.mp4');
  const clipFile    = path.join(tmpDir, 'clip.mp4');
  const captionFile = path.join(tmpDir, 'caps.srt');
  const outputFile  = path.join(tmpDir, 'output.mp4');

  try {
    // ── Update Firestore: rendering ──────────────────────────────────────────
    const exportRef = db.collection('clipExports').doc(clipId);
    await exportRef.set({
      clipId, projectId, ownerId: ownerId || null, status: 'rendering',
      step: 'Downloading video…', startedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // ── Step 1: Download just the clip segment with yt-dlp ───────────────────
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const startSec = Math.floor(startTime);
    const endSec   = Math.ceil(endTime);
    const duration = endSec - startSec;

    console.log(`[${jobId}] Downloading ${videoUrl} segment ${startSec}-${endSec}s`);

    execSync(
      `yt-dlp -f "best[height<=720][ext=mp4]/best[height<=720]/bestvideo[height<=720]+bestaudio/best" ` +
      `--download-sections "*${startSec}-${endSec}" ` +
      `--force-keyframes-at-cuts ` +
      `--merge-output-format mp4 ` +
      `--retries 5 --retry-sleep 3 ` +
      `--no-check-certificates ` +
      `--add-header "User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" ` +
      `-o "${sourceFile}" "${videoUrl}"`,
      { timeout: 300_000, stdio: 'pipe' }
    );

    await exportRef.update({ step: 'Cutting clip…' });

    // ── Step 2: Cut to exact duration (yt-dlp segment already starts at 0) ──
    execSync(
      `ffmpeg -y -i "${sourceFile}" -ss 0 -t ${endTime - startTime} -c copy "${clipFile}"`,
      { timeout: 120_000, stdio: 'pipe' }
    );

    await exportRef.update({ step: 'Applying captions & crop…' });

    // ── Step 3: Build SRT caption file ───────────────────────────────────────
    let videoFilter = cropFilter(aspectRatio);

    if (captions.length > 0) {
      fs.writeFileSync(captionFile, buildSRT(captions), 'utf8');
      const style = CAPTION_STYLES[captionStyle] || CAPTION_STYLES.modern;
      // Escape path for FFmpeg
      const srtPath = captionFile.replace(/\\/g, '/').replace(/:/g, '\\:');
      videoFilter += `,subtitles='${srtPath}':force_style='${style}'`;
    }

    // ── Step 4: Render final output ──────────────────────────────────────────
    execSync(
      `ffmpeg -y -i "${clipFile}" ` +
      `-vf "${videoFilter}" ` +
      `-c:v libx264 -preset fast -crf 23 ` +
      `-c:a aac -b:a 128k ` +
      `-movflags +faststart ` +
      `-t ${Math.min(duration + 2, 120)} ` +
      `"${outputFile}"`,
      { timeout: 300_000, stdio: 'pipe' }
    );

    await exportRef.update({ step: 'Uploading…' });

    // ── Step 5: Upload to Firebase Storage ───────────────────────────────────
    const storageDestination = `clips/${projectId}/${clipId}_${aspectRatio.replace(':','-')}.mp4`;
    await bucket.upload(outputFile, {
      destination: storageDestination,
      metadata: { contentType: 'video/mp4', cacheControl: 'public, max-age=86400' },
    });

    const file = bucket.file(storageDestination);
    await file.makePublic();
    const downloadUrl = `https://storage.googleapis.com/freemi-3f7c7.appspot.com/${storageDestination}`;

    // ── Step 6: Update Firestore with result ─────────────────────────────────
    await exportRef.update({
      status: 'complete',
      step: 'Done',
      downloadUrl,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Also update the clip doc itself
    await db.collection('clipProjects').doc(projectId).collection('clips').doc(clipId)
      .update({ exportUrl: downloadUrl, exportedAt: admin.firestore.FieldValue.serverTimestamp() })
      .catch(() => {});

    console.log(`[${jobId}] Complete: ${downloadUrl}`);
    return res.json({ success: true, downloadUrl });

  } catch (err) {
    console.error(`[${jobId}] Error:`, err.message);
    await db.collection('clipExports').doc(clipId).update({
      status: 'error',
      error: err.message,
    }).catch(() => {});
    return res.status(500).json({ error: err.message });

  } finally {
    // Cleanup temp files
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Freemi Renderer listening on :${PORT}`));
