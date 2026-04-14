import { firestore as db } from './firebaseClient';
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';

// ── Mock data generators ────────────────────────────────────────────────────

const CLIP_TITLES = [
  'The ONE thing that changed everything',
  'Nobody talks about this...',
  'This is why most people fail',
  'Wait for it... 🔥',
  'The secret behind viral growth',
  'I wish I knew this sooner',
  'Stop doing THIS immediately',
  'Here\'s the harsh truth',
  'This blew my mind',
  'The 3-second rule that works',
  'Why 99% get this wrong',
  'My biggest mistake revealed',
  'This hack saves hours',
  'The untold story behind...',
  'You won\'t believe what happened next',
];

const THUMBNAIL_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
];

const MOCK_CAPTIONS = [
  [
    { start: 0, end: 2.5, text: "Here's something that nobody talks about" },
    { start: 2.5, end: 5.0, text: "When I first started my journey" },
    { start: 5.0, end: 8.0, text: "I made this critical mistake" },
    { start: 8.0, end: 11.0, text: "And it cost me everything" },
    { start: 11.0, end: 14.0, text: "But then I discovered this one trick" },
    { start: 14.0, end: 17.0, text: "That completely changed the game" },
  ],
  [
    { start: 0, end: 3.0, text: "The biggest lie in our industry" },
    { start: 3.0, end: 6.0, text: "Is that you need to hustle 24/7" },
    { start: 6.0, end: 9.0, text: "What actually works is focus" },
    { start: 9.0, end: 12.0, text: "Deep, intentional focus on what matters" },
  ],
  [
    { start: 0, end: 2.0, text: "Stop scrolling and listen" },
    { start: 2.0, end: 5.0, text: "This will save you years of pain" },
    { start: 5.0, end: 8.0, text: "I spent $50,000 learning this lesson" },
    { start: 8.0, end: 11.0, text: "So you don't have to" },
    { start: 11.0, end: 14.0, text: "Here are the three steps" },
    { start: 14.0, end: 16.0, text: "Number one, start with why" },
    { start: 16.0, end: 19.0, text: "Number two, build in public" },
    { start: 19.0, end: 22.0, text: "Number three, never give up" },
  ],
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateViralityScore() {
  // Weighted toward 40-85 range with occasional high scores
  const r = Math.random();
  if (r < 0.05) return randomInt(90, 99);
  if (r < 0.25) return randomInt(70, 89);
  if (r < 0.70) return randomInt(45, 69);
  return randomInt(20, 44);
}

function generateMockClip(projectId, index) {
  const viralityScore = generateViralityScore();
  const hookScore = Math.min(99, viralityScore + randomInt(-15, 15));
  const flowScore = Math.min(99, viralityScore + randomInt(-15, 15));
  const duration = randomInt(15, 60);
  const startTime = randomInt(0, 600);

  return {
    id: `clip_${projectId}_${index}`,
    projectId,
    title: CLIP_TITLES[index % CLIP_TITLES.length],
    startTime,
    endTime: startTime + duration,
    duration,
    thumbnailGradient: THUMBNAIL_GRADIENTS[index % THUMBNAIL_GRADIENTS.length],
    viralityScore,
    hookScore: Math.max(10, hookScore),
    flowScore: Math.max(10, flowScore),
    captions: MOCK_CAPTIONS[index % MOCK_CAPTIONS.length],
    aspectRatio: '9:16',
    brandKitId: null,
    bRollEnabled: false,
    status: 'draft',
    exportUrl: null,
    createdAt: new Date().toISOString(),
  };
}

// ── Processing simulation ───────────────────────────────────────────────────

const PROCESSING_STEPS = [
  { id: 'download',  label: 'Downloading video',          icon: 'Download' },
  { id: 'analyze',   label: 'Analyzing content',          icon: 'Brain' },
  { id: 'detect',    label: 'Detecting key moments',      icon: 'Sparkles' },
  { id: 'generate',  label: 'Generating clips',           icon: 'Film' },
  { id: 'caption',   label: 'Adding AI captions',         icon: 'Captions' },
  { id: 'score',     label: 'Scoring virality',           icon: 'TrendingUp' },
];

export { PROCESSING_STEPS };

export async function simulateProcessing(onProgress) {
  for (let i = 0; i < PROCESSING_STEPS.length; i++) {
    onProgress({ step: i, total: PROCESSING_STEPS.length, ...PROCESSING_STEPS[i] });
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 1800));
  }
  onProgress({ step: PROCESSING_STEPS.length, total: PROCESSING_STEPS.length, id: 'done', label: 'Complete!' });
}

// ── Project CRUD ────────────────────────────────────────────────────────────

export async function createProject(ownerId, { url, title }) {
  const projectData = {
    ownerId,
    title: title || extractTitle(url),
    sourceUrl: url,
    sourceType: detectSourceType(url),
    status: 'processing',
    thumbnailGradient: THUMBNAIL_GRADIENTS[randomInt(0, THUMBNAIL_GRADIENTS.length - 1)],
    duration: randomInt(120, 3600),
    clipCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'clipProjects'), projectData);
  return { id: ref.id, ...projectData };
}

export async function completeProject(projectId, clipCount) {
  await updateDoc(doc(db, 'clipProjects', projectId), {
    status: 'ready',
    clipCount,
    updatedAt: serverTimestamp(),
  });
}

export async function getProjects(ownerId) {
  const q = query(
    collection(db, 'clipProjects'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getProject(projectId) {
  const snap = await getDoc(doc(db, 'clipProjects', projectId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ── Clip CRUD ───────────────────────────────────────────────────────────────

export async function generateClipsForProject(projectId) {
  const count = randomInt(6, 12);
  const clips = [];
  for (let i = 0; i < count; i++) {
    const clip = generateMockClip(projectId, i);
    const ref = await addDoc(collection(db, 'clipProjects', projectId, 'clips'), clip);
    clips.push({ ...clip, id: ref.id });
  }
  return clips;
}

export async function getClips(projectId) {
  const q = query(
    collection(db, 'clipProjects', projectId, 'clips'),
    orderBy('viralityScore', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateClip(projectId, clipId, data) {
  await updateDoc(doc(db, 'clipProjects', projectId, 'clips', clipId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── Brand Kit ───────────────────────────────────────────────────────────────

export async function saveBrandKit(ownerId, data) {
  if (data.id) {
    await updateDoc(doc(db, 'brandKits', data.id), { ...data, updatedAt: serverTimestamp() });
    return data;
  }
  const ref = await addDoc(collection(db, 'brandKits'), {
    ownerId,
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data };
}

export async function getBrandKits(ownerId) {
  const q = query(collection(db, 'brandKits'), where('ownerId', '==', ownerId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteBrandKit(kitId) {
  await deleteDoc(doc(db, 'brandKits', kitId));
}

// ── Schedule ────────────────────────────────────────────────────────────────

export async function createSchedule(data) {
  const ref = await addDoc(collection(db, 'clipSchedules'), {
    ...data,
    status: 'scheduled',
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data };
}

export async function getSchedules(ownerId) {
  const q = query(collection(db, 'clipSchedules'), where('ownerId', '==', ownerId), orderBy('scheduledAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function detectSourceType(url) {
  if (!url) return 'upload';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.includes('twitch.tv')) return 'twitch';
  return 'url';
}

function extractTitle(url) {
  if (!url) return 'Untitled Project';
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '') + ' Video';
  } catch {
    return 'Untitled Project';
  }
}

// ── Mock usage stats ────────────────────────────────────────────────────────

export function getMockUsageStats() {
  return {
    creditsUsed: 47,
    creditsTotal: 150,
    clipsCreated: 34,
    projectsCount: 6,
    exportsCount: 12,
    sparklineData: [
      { day: 'Mon', clips: 4 }, { day: 'Tue', clips: 7 },
      { day: 'Wed', clips: 3 }, { day: 'Thu', clips: 8 },
      { day: 'Fri', clips: 5 }, { day: 'Sat', clips: 2 },
      { day: 'Sun', clips: 5 },
    ],
  };
}

// ── Mock recent clips for dashboard carousel ────────────────────────────────

export function getMockRecentClips() {
  return Array.from({ length: 8 }, (_, i) => generateMockClip('demo', i));
}

// ── Mock projects for dashboard grid ────────────────────────────────────────

export function getMockProjects() {
  return [
    { id: 'p1', title: 'Marketing Keynote 2024', sourceType: 'youtube', status: 'ready', clipCount: 8, thumbnailGradient: THUMBNAIL_GRADIENTS[0], duration: 2400, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'p2', title: 'Podcast Ep. 47 - Growth', sourceType: 'youtube', status: 'ready', clipCount: 12, thumbnailGradient: THUMBNAIL_GRADIENTS[1], duration: 3600, createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'p3', title: 'Product Demo Walkthrough', sourceType: 'upload', status: 'ready', clipCount: 6, thumbnailGradient: THUMBNAIL_GRADIENTS[2], duration: 900, createdAt: new Date(Date.now() - 259200000).toISOString() },
    { id: 'p4', title: 'Team All-Hands Q1', sourceType: 'youtube', status: 'ready', clipCount: 10, thumbnailGradient: THUMBNAIL_GRADIENTS[3], duration: 5400, createdAt: new Date(Date.now() - 345600000).toISOString() },
    { id: 'p5', title: 'Conference Talk - AI Future', sourceType: 'vimeo', status: 'processing', clipCount: 0, thumbnailGradient: THUMBNAIL_GRADIENTS[4], duration: 1800, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'p6', title: 'Customer Interview Series', sourceType: 'upload', status: 'ready', clipCount: 15, thumbnailGradient: THUMBNAIL_GRADIENTS[5], duration: 4200, createdAt: new Date(Date.now() - 432000000).toISOString() },
  ];
}

// ── Mock analytics data ─────────────────────────────────────────────────────

export function getMockAnalytics() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return {
    totalViews: 124500,
    totalEngagement: 8340,
    avgViralityScore: 72,
    topPlatform: 'TikTok',
    viewsOverTime: days.map((d, i) => ({ day: d, views: randomInt(800, 5000), engagement: randomInt(50, 400) })),
    platformBreakdown: [
      { name: 'TikTok', value: 45, color: '#FF0050' },
      { name: 'YouTube Shorts', value: 25, color: '#FF0000' },
      { name: 'Instagram Reels', value: 20, color: '#E1306C' },
      { name: 'LinkedIn', value: 7, color: '#0077B5' },
      { name: 'X', value: 3, color: '#1DA1F2' },
    ],
  };
}
