import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  getMockProjects, getMockRecentClips, getMockUsageStats, getMockAnalytics,
  simulateProcessing, createProject, getProjects,
  getClips, saveBrandKit, getBrandKits, deleteBrandKit as deleteKitFromDB,
  createSchedule, getSchedules, updateClip,
} from '@/lib/clipsService';
import {
  fetchVideoMetadata, extractVideoId,
  generateClipTitles, generateCaptions, detectPlatform,
} from '@/lib/youtubeService';
import { collection, addDoc, serverTimestamp, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { firestore as db, storage } from '@/lib/firebaseClient';

const PROCESS_URL    = 'https://us-central1-freemi-3f7c7.cloudfunctions.net/processYouTubeVideo';
const TRANSCRIBE_URL = 'https://us-central1-freemi-3f7c7.cloudfunctions.net/transcribeVideo';

const PROCESSING_STEP_LABELS = [
  'Fetching transcript…',
  'Segmenting content…',
  'Scoring segments with AI…',
  'Saving clips…',
];
import { useAuth } from '@/lib/AuthContext';

const ClipsContext = createContext(null);

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

// Mock project IDs — never attempt Firestore reads for these
const MOCK_IDS = new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'demo']);

function generateViralityScore() {
  const r = Math.random();
  if (r < 0.08) return 90 + Math.floor(Math.random() * 10);
  if (r < 0.30) return 70 + Math.floor(Math.random() * 20);
  if (r < 0.75) return 45 + Math.floor(Math.random() * 25);
  return 20 + Math.floor(Math.random() * 25);
}

function normaliseDoc(doc) {
  return {
    ...doc,
    createdAt: doc.createdAt?.toDate
      ? doc.createdAt.toDate().toISOString()
      : doc.createdAt || new Date().toISOString(),
  };
}

function deriveUsageStats(projects) {
  const clipsCreated = projects.reduce((s, p) => s + (p.clipCount || 0), 0);
  const mock = getMockUsageStats();
  return { ...mock, creditsUsed: clipsCreated, clipsCreated, projectsCount: projects.length };
}

function buildClips(project, count) {
  const { id: projectId, title, duration, videoId } = project;
  const titles = generateClipTitles(title, count);
  return Array.from({ length: count }, (_, i) => {
    const vs = generateViralityScore();
    const clipDuration = 15 + Math.floor(Math.random() * 45);
    const startTime = Math.floor(Math.random() * Math.max(60, (duration || 600) - clipDuration));
    return {
      id: `clip_${projectId}_${i}`,
      projectId,
      title: titles[i] || `Clip ${i + 1}`,
      duration: clipDuration,
      startTime,
      endTime: startTime + clipDuration,
      thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
      thumbnailGradient: GRADIENT_POOL[i % GRADIENT_POOL.length],
      viralityScore: vs,
      hookScore: Math.max(10, Math.min(99, vs + Math.floor(Math.random() * 20) - 10)),
      flowScore: Math.max(10, Math.min(99, vs + Math.floor(Math.random() * 20) - 10)),
      captions: generateCaptions(titles[i], clipDuration),
      aspectRatio: '9:16',
      status: 'draft',
      videoId: videoId || null,
      sourceTitle: title,
      createdAt: new Date().toISOString(),
    };
  }).sort((a, b) => b.viralityScore - a.viralityScore);
}

export function ClipsProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [recentClips, setRecentClips] = useState([]);
  const [usageStats, setUsageStats] = useState(getMockUsageStats());
  const [analytics] = useState(getMockAnalytics());
  const [currentProject, setCurrentProject] = useState(null);
  const [currentClips, setCurrentClips] = useState([]);
  const [processing, setProcessing] = useState(null);
  const [brandKits, setBrandKitsState] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const clipsCache = useRef({});

  // ── Load projects ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!uid) return;
    setProjectsLoading(true);
    getProjects(uid)
      .then(docs => {
        if (docs.length > 0) {
          const normalised = docs.map(normaliseDoc);
          setProjects(normalised);
          setRecentClips([]);
          setUsageStats(deriveUsageStats(normalised));
          setUsingMock(false);
        } else {
          setProjects(getMockProjects());
          setRecentClips(getMockRecentClips());
          setUsageStats(getMockUsageStats());
          setUsingMock(true);
        }
      })
      .catch(() => {
        setProjects(getMockProjects());
        setRecentClips(getMockRecentClips());
        setUsageStats(getMockUsageStats());
        setUsingMock(true);
      })
      .finally(() => setProjectsLoading(false));
  }, [uid]);

  // ── Load brand kits ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!uid) return;
    getBrandKits(uid)
      .then(kits => {
        setBrandKitsState(kits.length > 0 ? kits : [
          { id: 'bk1', name: 'Default Brand', colors: { primary: '#5B5FFF', secondary: '#7C3AED', accent: '#06B6D4' }, fontFamily: 'Inter', captionStyle: 'modern' },
        ]);
      })
      .catch(() => {
        setBrandKitsState([
          { id: 'bk1', name: 'Default Brand', colors: { primary: '#5B5FFF', secondary: '#7C3AED', accent: '#06B6D4' }, fontFamily: 'Inter', captionStyle: 'modern' },
        ]);
      });
  }, [uid]);

  // ── Load schedules ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!uid) return;
    getSchedules(uid).then(setSchedules).catch(() => {});
  }, [uid]);

  // ── Create project + clips (real pipeline) ───────────────────────────────

  const createNewProject = useCallback(async (url) => {
    // 1. Fetch metadata for title/thumbnail
    let metadata = null;
    try { metadata = await fetchVideoMetadata(url); } catch {}

    const videoId = metadata?.videoId || extractVideoId(url);
    const platform = detectPlatform(url);
    const isYouTube = platform.type === 'youtube' && !!videoId;

    const baseData = {
      title: metadata?.title || `${platform.name} Video`,
      author: metadata?.author || 'Creator',
      sourceUrl: url,
      sourceType: platform.type,
      thumbnailUrl: metadata?.thumbnailUrl || null,
      thumbnailGradient: GRADIENT_POOL[Math.floor(Math.random() * GRADIENT_POOL.length)],
      duration: metadata?.estimatedDuration || 600,
      videoId: videoId || null,
    };

    // 2. Create project doc in Firestore
    let projectId;
    if (uid) {
      const saved = await createProject(uid, { url, title: baseData.title });
      projectId = saved.id;
    } else {
      projectId = `p_${Date.now()}`;
    }

    const project = { ...baseData, id: projectId, status: 'processing', clipCount: 0, createdAt: new Date().toISOString() };
    setProjects(prev => [project, ...prev.filter(p => !MOCK_IDS.has(p.id))]);
    setCurrentProject(project);
    if (usingMock) setUsingMock(false);

    // 3. Call real Cloud Function for YouTube, fall back to simulation otherwise
    if (isYouTube && uid) {
      // Show initial processing state
      setProcessing({ projectId, step: 0, total: 4, label: 'Fetching transcript…', id: 'transcript' });

      // Listen to Firestore for step updates
      const unsubscribe = onSnapshot(doc(db, 'clipProjects', projectId), snap => {
        const data = snap.data();
        if (data?.processingStep) {
          const stepIdx = PROCESSING_STEP_LABELS.indexOf(data.processingStep);
          setProcessing({
            projectId,
            step: stepIdx >= 0 ? stepIdx : 1,
            total: 4,
            label: data.processingStep,
            id: 'processing',
          });
        }
        if (data?.status === 'ready' || data?.status === 'error') {
          unsubscribe();
        }
      });

      // Fire-and-forget the Cloud Function (returns when done)
      let cfSuccess = false;
      try {
        const cfRes = await fetch(PROCESS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId, projectId, ownerId: uid }),
        });
        cfSuccess = cfRes.ok;
      } catch (e) {
        console.warn('[Clips] Cloud Function failed, falling back to simulation:', e);
      }
      unsubscribe();

      if (cfSuccess) {
        // Load the real clips from Firestore
        const firestoreClips = await getClips(projectId);
        const normalised = firestoreClips.map(normaliseDoc);
        clipsCache.current[projectId] = normalised;
        const updated = { ...project, status: 'ready', clipCount: normalised.length };
        setCurrentProject(updated);
        setCurrentClips(normalised);
        setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
        setUsageStats(prev => ({
          ...prev,
          creditsUsed: prev.creditsUsed + normalised.length,
          clipsCreated: prev.clipsCreated + normalised.length,
          projectsCount: prev.projectsCount + 1,
        }));
        setProcessing(null);
        return { project: updated, clips: normalised };
      }
      // Fall through to simulation if CF failed
    }

    // 4. Fallback: simulate + generate clips client-side
    await simulateProcessing(progress => setProcessing({ projectId, ...progress }));

    const clipCount = 6 + Math.floor(Math.random() * 6);
    const clips = buildClips(project, clipCount);

    const savedClips = [];
    if (uid) {
      for (const clip of clips) {
        const { id: _tmp, ...clipData } = clip;
        try {
          const ref = await addDoc(
            collection(db, 'clipProjects', projectId, 'clips'),
            { ...clipData, createdAt: serverTimestamp() }
          );
          savedClips.push({ ...clip, id: ref.id });
        } catch { savedClips.push(clip); }
      }
    } else {
      savedClips.push(...clips);
    }

    clipsCache.current[projectId] = savedClips;
    const updated = { ...project, status: 'ready', clipCount: savedClips.length };
    setCurrentProject(updated);
    setCurrentClips(savedClips);
    setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
    setUsageStats(prev => ({
      ...prev,
      creditsUsed: prev.creditsUsed + savedClips.length,
      clipsCreated: prev.clipsCreated + savedClips.length,
      projectsCount: prev.projectsCount + 1,
    }));
    setProcessing(null);
    return { project: updated, clips: savedClips };
  }, [uid, usingMock]);

  // ── Load clips for a project ──────────────────────────────────────────────

  const loadProject = useCallback(async (projectId) => {
    if (currentProject?.id === projectId && currentClips.length > 0) return;

    if (clipsCache.current[projectId]) {
      const proj = projects.find(p => p.id === projectId);
      if (proj) setCurrentProject(proj);
      setCurrentClips(clipsCache.current[projectId]);
      return;
    }

    const proj = projects.find(p => p.id === projectId);
    const project = proj || { id: projectId, title: 'Video Project', clipCount: 8, duration: 600, videoId: null };
    setCurrentProject(project);

    if (uid && !MOCK_IDS.has(projectId)) {
      try {
        const docs = await getClips(projectId);
        if (docs.length > 0) {
          const normalised = docs.map(normaliseDoc);
          clipsCache.current[projectId] = normalised;
          setCurrentClips(normalised);
          return;
        }
      } catch {}
    }

    const clips = buildClips(project, project.clipCount || 8);
    clipsCache.current[projectId] = clips;
    setCurrentClips(clips);
  }, [uid, projects, currentProject, currentClips]);

  // ── Update a clip ─────────────────────────────────────────────────────────

  const updateClipData = useCallback(async (clipId, data) => {
    const projectId = currentProject?.id;
    if (!projectId) return;

    setCurrentClips(prev => prev.map(c => c.id === clipId ? { ...c, ...data } : c));
    if (clipsCache.current[projectId]) {
      clipsCache.current[projectId] = clipsCache.current[projectId].map(
        c => c.id === clipId ? { ...c, ...data } : c
      );
    }

    if (uid && !MOCK_IDS.has(projectId)) {
      await updateClip(projectId, clipId, data).catch(() => {});
    }
  }, [uid, currentProject]);

  // ── Brand kit CRUD ────────────────────────────────────────────────────────

  const setBrandKits = useCallback((updater) => {
    setBrandKitsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (uid) {
        // Save new/updated kits
        next.forEach(kit => {
          if (kit.id === 'bk1') return;
          const old = prev.find(k => k.id === kit.id);
          if (!old || JSON.stringify(old) !== JSON.stringify(kit)) {
            saveBrandKit(uid, kit).catch(() => {});
          }
        });
        // Delete removed kits
        prev.forEach(kit => {
          if (kit.id === 'bk1') return;
          if (!next.find(k => k.id === kit.id)) {
            deleteKitFromDB(kit.id).catch(() => {});
          }
        });
      }
      return next;
    });
  }, [uid]);

  // ── Create project from uploaded file ─────────────────────────────────────

  const createProjectFromFile = useCallback(async (file, onProgress) => {
    if (!uid) throw new Error('You must be logged in to upload videos');

    const title = file.name.replace(/\.[^/.]+$/, '');
    const saved = await createProject(uid, { url: '', title });
    const projectId = saved.id;

    const project = {
      id: projectId, title, sourceType: 'upload', videoId: null,
      thumbnailGradient: GRADIENT_POOL[Math.floor(Math.random() * GRADIENT_POOL.length)],
      duration: 0, status: 'processing', clipCount: 0,
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [project, ...prev.filter(p => !MOCK_IDS.has(p.id))]);
    setCurrentProject(project);
    if (usingMock) setUsingMock(false);

    // 1. Upload file to Firebase Storage with progress
    const path = `clip-uploads/${uid}/${Date.now()}-${file.name}`;
    await new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef(storage, path), file);
      task.on('state_changed',
        snap => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        resolve,
      );
    });

    // 2. Listen for Firestore step updates
    setProcessing({ projectId, step: 1, total: 4, label: 'Transcribing audio…', id: 'transcribe' });
    const unsubscribe = onSnapshot(doc(db, 'clipProjects', projectId), snap => {
      const data = snap.data();
      if (data?.processingStep) {
        setProcessing({ projectId, step: 1, total: 4, label: data.processingStep, id: 'processing' });
      }
      if (data?.status === 'ready' || data?.status === 'error') unsubscribe();
    });

    // 3. Call transcribeVideo Cloud Function
    let cfRes;
    try {
      cfRes = await fetch(TRANSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath: path, projectId, ownerId: uid }),
      });
    } catch (e) {
      unsubscribe();
      throw e;
    }
    unsubscribe();

    if (!cfRes.ok) {
      const body = await cfRes.json().catch(() => ({}));
      throw new Error(body.error || `Transcription failed (${cfRes.status})`);
    }

    // 4. Load clips from Firestore
    const firestoreClips = await getClips(projectId);
    const normalised = firestoreClips.map(normaliseDoc);
    clipsCache.current[projectId] = normalised;
    const updated = { ...project, status: 'ready', clipCount: normalised.length };
    setCurrentProject(updated);
    setCurrentClips(normalised);
    setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
    setUsageStats(prev => ({
      ...prev,
      creditsUsed: prev.creditsUsed + normalised.length,
      clipsCreated: prev.clipsCreated + normalised.length,
      projectsCount: prev.projectsCount + 1,
    }));
    setProcessing(null);
    return { project: updated, clips: normalised };
  }, [uid, usingMock]);

  // ── Add schedule ──────────────────────────────────────────────────────────

  const addSchedule = useCallback((schedule) => {
    const entry = { ...schedule, id: `sched_${Date.now()}`, status: 'scheduled' };
    setSchedules(prev => [...prev, entry]);
    if (uid) {
      createSchedule({ ...schedule, ownerId: uid })
        .then(saved => setSchedules(prev => prev.map(s => s.id === entry.id ? { ...s, id: saved.id } : s)))
        .catch(() => {});
    }
  }, [uid]);

  return (
    <ClipsContext.Provider value={{
      projects, projectsLoading, usingMock,
      recentClips, usageStats, analytics,
      currentProject, currentClips, processing,
      brandKits, setBrandKits, schedules, addSchedule,
      createNewProject, createProjectFromFile, loadProject, updateClipData,
      setCurrentProject, setCurrentClips,
    }}>
      {children}
    </ClipsContext.Provider>
  );
}

export function useClips() {
  const ctx = useContext(ClipsContext);
  if (!ctx) throw new Error('useClips must be used within ClipsProvider');
  return ctx;
}

export { ClipsContext };
