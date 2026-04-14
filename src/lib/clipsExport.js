/**
 * clipsExport.js — Client-side export trigger for Freemi Renderer (Cloud Run)
 *
 * After deploying cloudrun/ run:
 *   bash cloudrun/deploy.sh
 * Then paste the printed URL and secret below.
 */

// ── Set these after running cloudrun/deploy.sh ────────────────────────────────
export const RENDERER_URL = 'https://freemi-renderer-595171619404.us-central1.run.app';
export const RENDER_SECRET = 'freemi-render-039a646f1178b33c';

// ── Check if renderer is configured ──────────────────────────────────────────
export function isRendererConfigured() {
  return !!RENDERER_URL;
}

/**
 * Trigger a render job on Cloud Run.
 *
 * @param {object} clip     - Clip object from Firestore/context
 * @param {string} aspectRatio  - '9:16' | '16:9' | '1:1'
 * @param {string} captionStyle - 'modern' | 'karaoke' | 'neon' | 'bold' | 'minimal'
 * @param {string} projectId
 * @param {string} ownerId
 * @param {function} onStep - callback(stepLabel: string)
 * @returns {Promise<string>} - download URL
 */
export async function renderClip({ clip, aspectRatio, captionStyle, projectId, ownerId, onStep }) {
  if (!RENDERER_URL) throw new Error('Renderer not configured — run cloudrun/deploy.sh first');

  onStep?.('Sending to renderer…');

  const res = await fetch(`${RENDERER_URL}/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Render-Secret': RENDER_SECRET,
    },
    body: JSON.stringify({
      videoId: clip.videoId,
      startTime: clip.startTime,
      endTime: clip.endTime,
      captions: clip.captions || [],
      aspectRatio,
      captionStyle,
      projectId,
      clipId: clip.id,
      ownerId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Render failed');
  }

  const data = await res.json();
  return data.downloadUrl;
}
