/**
 * YouTube metadata fetcher — uses oEmbed (no API key needed) + thumbnail URLs.
 * Extracts video ID, fetches title/author, generates thumbnail URLs.
 */

// ── Extract video ID from various YouTube URL formats ───────────────────────
export function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ── Detect platform from URL ────────────────────────────────────────────────
export function detectPlatform(url) {
  if (!url) return { type: 'upload', name: 'Upload' };
  if (url.includes('youtube.com') || url.includes('youtu.be')) return { type: 'youtube', name: 'YouTube' };
  if (url.includes('tiktok.com')) return { type: 'tiktok', name: 'TikTok' };
  if (url.includes('vimeo.com')) return { type: 'vimeo', name: 'Vimeo' };
  if (url.includes('twitch.tv')) return { type: 'twitch', name: 'Twitch' };
  if (url.includes('linkedin.com')) return { type: 'linkedin', name: 'LinkedIn' };
  return { type: 'url', name: 'Web Video' };
}

// ── Get YouTube thumbnail URLs ──────────────────────────────────────────────
export function getYouTubeThumbnails(videoId) {
  return {
    default: `https://img.youtube.com/vi/${videoId}/default.jpg`,       // 120x90
    medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,      // 320x180
    high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,        // 480x360
    standard: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,    // 640x480
    maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,  // 1280x720
  };
}

// ── Fetch video metadata via oEmbed ─────────────────────────────────────────
export async function fetchYouTubeMetadata(url) {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error('oEmbed fetch failed');
    const data = await res.json();

    const thumbnails = getYouTubeThumbnails(videoId);

    return {
      videoId,
      title: data.title || 'Untitled Video',
      author: data.author_name || 'Unknown Channel',
      authorUrl: data.author_url || '',
      thumbnailUrl: thumbnails.high,
      thumbnails,
      // oEmbed doesn't give duration, so we estimate based on typical video lengths
      estimatedDuration: estimateVideoDuration(data.title),
      platform: 'youtube',
    };
  } catch (err) {
    console.warn('YouTube metadata fetch failed:', err);
    // Fallback: return basic info from video ID
    const thumbnails = getYouTubeThumbnails(videoId);
    return {
      videoId,
      title: 'YouTube Video',
      author: 'Unknown Channel',
      authorUrl: '',
      thumbnailUrl: thumbnails.high,
      thumbnails,
      estimatedDuration: 600,
      platform: 'youtube',
    };
  }
}

// ── Fetch metadata for any URL ──────────────────────────────────────────────
export async function fetchVideoMetadata(url) {
  const platform = detectPlatform(url);

  if (platform.type === 'youtube') {
    return fetchYouTubeMetadata(url);
  }

  // For non-YouTube, return generic metadata
  return {
    videoId: null,
    title: `${platform.name} Video`,
    author: 'Creator',
    authorUrl: '',
    thumbnailUrl: null,
    thumbnails: null,
    estimatedDuration: 600,
    platform: platform.type,
  };
}

// ── Estimate video duration from title keywords ─────────────────────────────
function estimateVideoDuration(title) {
  const lower = (title || '').toLowerCase();
  if (lower.includes('short') || lower.includes('clip') || lower.includes('reel')) return 60;
  if (lower.includes('podcast') || lower.includes('interview') || lower.includes('episode')) return 3600;
  if (lower.includes('tutorial') || lower.includes('how to') || lower.includes('guide')) return 900;
  if (lower.includes('keynote') || lower.includes('talk') || lower.includes('conference')) return 2700;
  if (lower.includes('vlog') || lower.includes('daily')) return 600;
  return 480 + Math.floor(Math.random() * 1200); // 8-28 min
}

// ── Generate realistic clip titles from video title ─────────────────────────
export function generateClipTitles(videoTitle, count = 8) {
  const words = videoTitle.split(/\s+/).filter(w => w.length > 3);
  const keyPhrase = words.slice(0, 3).join(' ');

  const templates = [
    `The moment that changed everything in "${keyPhrase}"`,
    `"${words[0] || 'This'}" — the part everyone missed`,
    `Why ${keyPhrase} matters more than you think`,
    `The brutal truth about ${words.slice(-2).join(' ') || 'success'}`,
    `${words[0] || 'This'} just dropped a bombshell 💣`,
    `Stop everything and watch this part`,
    `The 3-second rule that actually works`,
    `Nobody is talking about this...`,
    `This changed my entire perspective`,
    `The #1 mistake everyone makes`,
    `Wait for it... 🔥`,
    `This is why 99% of people fail`,
    `The secret they don't want you to know`,
    `I can't believe this was said on camera`,
    `The most important 30 seconds of the video`,
    `Here's what they got wrong about ${words[0] || 'this'}`,
  ];

  // Shuffle and pick
  const shuffled = templates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ── Generate realistic captions from a clip title ───────────────────────────
export function generateCaptions(clipTitle, duration) {
  const segmentCount = Math.max(3, Math.min(8, Math.floor(duration / 4)));
  const segmentDuration = duration / segmentCount;

  const captionTemplates = [
    "Let me tell you something that nobody talks about",
    "When I first started on this journey",
    "The biggest mistake I see people making",
    "Here's what actually works in practice",
    "And this is the part that blew my mind",
    "So what does this mean for you?",
    "The key takeaway is simple",
    "If you remember one thing from this",
    "The data doesn't lie about this",
    "And that's exactly why this matters",
    "But here's where it gets interesting",
    "Pay close attention to this next part",
    "This completely changed my approach",
    "The results speak for themselves",
    "And the best part? Anyone can do this",
  ];

  const shuffled = captionTemplates.sort(() => Math.random() - 0.5);
  return Array.from({ length: segmentCount }, (_, i) => ({
    start: Math.round(i * segmentDuration * 10) / 10,
    end: Math.round((i + 1) * segmentDuration * 10) / 10,
    text: shuffled[i % shuffled.length],
  }));
}
