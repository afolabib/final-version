import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Share2, Smartphone, Monitor, Square, Type, Image, Palette, Wand2, Loader2, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClips } from '@/contexts/ClipsContext';
import { useAuth } from '@/lib/AuthContext';
import ViralityBadge from '../gallery/ViralityBadge';
import { renderClip, isRendererConfigured } from '@/lib/clipsExport';

const ASPECT_RATIOS = [
  { id: '9:16', label: 'Vertical', icon: Smartphone, w: 9, h: 16 },
  { id: '16:9', label: 'Landscape', icon: Monitor, w: 16, h: 9 },
  { id: '1:1',  label: 'Square', icon: Square, w: 1, h: 1 },
];

const CAPTION_STYLES = [
  { id: 'modern',  label: 'Modern',  color: '#fff',     bg: 'rgba(0,0,0,0.6)' },
  { id: 'karaoke', label: 'Karaoke', color: '#FBBF24',  bg: 'rgba(0,0,0,0.8)' },
  { id: 'neon',    label: 'Neon',    color: '#5B5FFF',  bg: 'transparent' },
  { id: 'bold',    label: 'Bold',    color: '#fff',     bg: 'rgba(91,95,255,0.8)' },
  { id: 'minimal', label: 'Minimal', color: '#94A3B8',  bg: 'transparent' },
];

const RENDER_STEPS = [
  'Downloading clip…',
  'Cutting with FFmpeg…',
  'Burning captions…',
  'Uploading to storage…',
];

export default function ClipEditorView({ clipId }) {
  const navigate = useNavigate();
  const { currentClips, currentProject, updateClipData } = useClips();
  const { user } = useAuth();
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [captionStyle, setCaptionStyle] = useState('modern');
  const [activeTab, setActiveTab] = useState('captions');

  // Render state
  const [renderState, setRenderState] = useState('idle'); // idle | rendering | ready | error
  const [renderStep, setRenderStep] = useState('');
  const [renderStepIdx, setRenderStepIdx] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [renderError, setRenderError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);
  const renderKeyRef = useRef(`${aspectRatio}-${captionStyle}`);

  const clip = currentClips.find(c => c.id === clipId) || currentClips[0] || {
    id: 'demo', title: 'Demo Clip', duration: 30, viralityScore: 85,
    hookScore: 88, flowScore: 82, thumbnailGradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    captions: [
      { start: 0, end: 3, text: "Here's something nobody talks about" },
      { start: 3, end: 6, text: "When I first started my journey" },
      { start: 6, end: 9, text: "I made this critical mistake" },
      { start: 9, end: 12, text: "That changed everything for me" },
    ],
  };

  // Load cached URL or auto-render on first open
  useEffect(() => {
    if (clip.downloadUrl) {
      setVideoUrl(clip.downloadUrl);
      setRenderState('ready');
    } else if (clip.videoId && isRendererConfigured()) {
      startRender();
    }
  }, [clip.id]); // eslint-disable-line

  const startRender = async (forceRatio, forceStyle) => {
    const ratio = forceRatio || aspectRatio;
    const style = forceStyle || captionStyle;
    renderKeyRef.current = `${ratio}-${style}`;
    setRenderState('rendering');
    setRenderError(null);
    setVideoUrl(null);
    setRenderStepIdx(0);
    setRenderStep(RENDER_STEPS[0]);

    // Cycle through step labels visually
    const stepTimer = setInterval(() => {
      setRenderStepIdx(i => {
        const next = Math.min(i + 1, RENDER_STEPS.length - 1);
        setRenderStep(RENDER_STEPS[next]);
        return next;
      });
    }, 8000);

    try {
      const url = await renderClip({
        clip,
        aspectRatio: ratio,
        captionStyle: style,
        projectId: currentProject?.id || clip.projectId,
        ownerId: user?.uid,
        onStep: (s) => setRenderStep(s),
      });
      clearInterval(stepTimer);
      setVideoUrl(url);
      setRenderState('ready');
      // Cache for next open
      updateClipData(clip.id, { downloadUrl: url });
    } catch (e) {
      clearInterval(stepTimer);
      setRenderError(e.message);
      setRenderState('error');
    }
  };

  const handleRerender = () => startRender(aspectRatio, captionStyle);

  const handleAspectChange = (id) => {
    setAspectRatio(id);
    if (renderState === 'ready') {
      // Mark as needing re-render
      setRenderState('idle');
      setVideoUrl(null);
    }
  };

  const handleStyleChange = (id) => {
    setCaptionStyle(id);
    if (renderState === 'ready') {
      setRenderState('idle');
      setVideoUrl(null);
    }
  };

  const playerDims = {
    '9:16':  { width: '220px', aspectRatio: '9/16' },
    '16:9':  { width: '440px', aspectRatio: '16/9' },
    '1:1':   { width: '320px', aspectRatio: '1/1'  },
  }[aspectRatio];

  return (
    <div className="flex flex-col h-[calc(100vh-44px)]">
      {/* Top bar */}
      <div className="relative flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.08)', background: 'rgba(255,255,255,0.97)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} style={{ color: '#64748B' }} />
          </button>
          <div>
            <h2 className="text-sm font-bold truncate max-w-[240px]" style={{ color: '#0A0F1E' }}>{clip.title}</h2>
            <p className="text-[10px]" style={{ color: '#64748B' }}>
              {clip.startTime != null ? `${Math.floor(clip.startTime/60)}:${String(clip.startTime%60).padStart(2,'0')} → ${Math.floor(clip.endTime/60)}:${String(clip.endTime%60).padStart(2,'0')}` : 'Editing clip'}
            </p>
          </div>
          <ViralityBadge score={clip.viralityScore} size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            style={{ background: 'rgba(91,95,255,0.04)', color: '#64748B', border: '1px solid rgba(91,95,255,0.08)' }}>
            <Share2 size={14} /> Share
          </button>

          {renderState === 'ready' && videoUrl ? (
            <a href={videoUrl} download={`${clip.title}.mp4`} target="_blank" rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
              <Download size={14} /> Download MP4
            </a>
          ) : renderState === 'rendering' ? (
            <button disabled className="px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 opacity-80"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
              <Loader2 size={14} className="animate-spin" /> {renderStep || 'Rendering…'}
            </button>
          ) : (
            <button onClick={handleRerender}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 btn-press"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}>
              <Sparkles size={14} /> {renderState === 'error' ? 'Retry' : 'Generate Clip'}
            </button>
          )}
        </div>

        {/* Error toast */}
        <AnimatePresence>
          {renderState === 'error' && renderError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-14 right-4 z-50 flex items-start gap-2 px-4 py-3 rounded-2xl text-xs shadow-lg max-w-xs"
              style={{ background: '#0A0F1E', color: 'white' }}>
              <AlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
              <span>{renderError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: video preview */}
        <div className="flex-1 flex flex-col items-center justify-center p-6" style={{ background: '#080818' }}>

          {/* Aspect ratio picker */}
          <div className="flex gap-2 mb-5">
            {ASPECT_RATIOS.map(ar => (
              <button key={ar.id} onClick={() => handleAspectChange(ar.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: aspectRatio === ar.id ? 'rgba(91,95,255,0.15)' : 'rgba(91,95,255,0.04)',
                  color: aspectRatio === ar.id ? '#C4B5FD' : '#64748B',
                  border: `1px solid ${aspectRatio === ar.id ? 'rgba(91,95,255,0.25)' : 'rgba(91,95,255,0.08)'}`,
                }}>
                <ar.icon size={12} /> {ar.label}
              </button>
            ))}
          </div>

          {/* Player frame */}
          <div className="relative rounded-2xl overflow-hidden"
            style={{
              ...playerDims,
              maxHeight: '62vh',
              background: clip.thumbnailGradient,
              border: '1px solid rgba(91,95,255,0.15)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}>

            <AnimatePresence mode="wait">

              {/* ── Rendered video ── */}
              {renderState === 'ready' && videoUrl && (
                <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    style={{ background: '#000' }}
                    onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
                  />
                </motion.div>
              )}

              {/* ── Rendering progress ── */}
              {renderState === 'rendering' && (
                <motion.div key="rendering" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                  {clip.thumbnailUrl && (
                    <img src={clip.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 8px 24px rgba(91,95,255,0.4)' }}>
                      <Loader2 size={24} className="text-white animate-spin" />
                    </div>
                    <p className="text-white text-xs font-semibold text-center">{renderStep}</p>
                    <div className="flex gap-1.5">
                      {RENDER_STEPS.map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                          style={{ background: i <= renderStepIdx ? '#5B5FFF' : 'rgba(255,255,255,0.2)' }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Idle / Generate ── */}
              {(renderState === 'idle' || renderState === 'error') && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  {clip.thumbnailUrl && (
                    <img src={clip.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <button onClick={handleRerender}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white btn-press"
                      style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 8px 24px rgba(91,95,255,0.5)' }}>
                      <Sparkles size={16} />
                      {renderState === 'error' ? 'Retry Generate' : 'Generate Clip'}
                    </button>
                    <p className="text-white/50 text-[10px] text-center">
                      Cuts & encodes the clip with captions
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Re-render + download row */}
          {renderState === 'ready' && videoUrl && (
            <div className="flex items-center gap-3 mt-4">
              <button onClick={handleRerender}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(91,95,255,0.12)', color: '#C4B5FD' }}>
                <RefreshCw size={12} /> Re-render
              </button>
              <a href={videoUrl} download={`${clip.title}.mp4`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[11px] font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
                <Download size={12} /> Download MP4
              </a>
            </div>
          )}

          {/* Caption timeline */}
          {clip.captions?.length > 0 && (
            <div className="w-full max-w-lg mt-3 px-4">
              <p className="text-[10px] font-semibold mb-1.5" style={{ color: '#64748B' }}>Caption timeline</p>
              <div className="relative h-6 rounded-lg overflow-hidden" style={{ background: 'rgba(91,95,255,0.06)' }}>
                {clip.captions.map((cap, i) => (
                  <div key={i} className="absolute top-1 bottom-1 rounded-md"
                    style={{
                      left: `${(cap.start / (clip.duration || 1)) * 100}%`,
                      width: `${Math.max(1, ((cap.end - cap.start) / (clip.duration || 1)) * 100)}%`,
                      background: renderState === 'ready' && currentTime >= cap.start && currentTime < cap.end
                        ? 'rgba(91,95,255,0.6)'
                        : `rgba(91,95,255,${0.2 + (i % 3) * 0.12})`,
                      border: '1px solid rgba(91,95,255,0.25)',
                    }}
                    title={cap.text}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Edit panels */}
        <div className="w-[320px] flex-shrink-0 flex flex-col"
          style={{ borderLeft: '1px solid rgba(91,95,255,0.08)', background: 'rgba(255,255,255,0.98)' }}>

          <div className="flex px-3 pt-3 gap-1">
            {[
              { id: 'captions', label: 'Captions', icon: Type },
              { id: 'broll',    label: 'B-Roll',   icon: Image },
              { id: 'brand',    label: 'Brand',    icon: Palette },
              { id: 'ai',       label: 'AI',       icon: Wand2 },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? 'rgba(91,95,255,0.08)' : 'transparent',
                  color: activeTab === tab.id ? '#5B5FFF' : '#64748B',
                }}>
                <tab.icon size={13} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'captions' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold mb-2 block" style={{ color: '#64748B' }}>Caption Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CAPTION_STYLES.map(s => (
                      <button key={s.id} onClick={() => handleStyleChange(s.id)}
                        className="p-3 rounded-xl text-center transition-all"
                        style={{
                          background: captionStyle === s.id ? 'rgba(91,95,255,0.08)' : 'rgba(91,95,255,0.03)',
                          border: `1px solid ${captionStyle === s.id ? 'rgba(91,95,255,0.15)' : 'rgba(91,95,255,0.06)'}`,
                        }}>
                        <span className="text-[11px] font-bold block" style={{ color: s.color === '#fff' ? '#0A0F1E' : s.color }}>Aa</span>
                        <span className="text-[9px] mt-0.5 block" style={{ color: '#64748B' }}>{s.label}</span>
                      </button>
                    ))}
                  </div>
                  {renderState === 'idle' && (
                    <p className="text-[10px] mt-2 text-center" style={{ color: '#94A3B8' }}>
                      Select style then click Generate Clip
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold mb-2 block" style={{ color: '#64748B' }}>Segments</label>
                  <div className="space-y-1.5">
                    {clip.captions?.map((cap, i) => (
                      <div key={i} className="p-2.5 rounded-xl transition-all"
                        style={{
                          background: renderState === 'ready' && currentTime >= cap.start && currentTime < cap.end
                            ? 'rgba(91,95,255,0.08)' : 'rgba(91,95,255,0.02)',
                          border: `1px solid ${renderState === 'ready' && currentTime >= cap.start && currentTime < cap.end
                            ? 'rgba(91,95,255,0.15)' : 'rgba(91,95,255,0.05)'}`,
                        }}>
                        <span className="text-[9px] font-mono block mb-0.5" style={{ color: '#64748B' }}>
                          {cap.start.toFixed(1)}s – {cap.end.toFixed(1)}s
                        </span>
                        <p className="text-xs" style={{ color: '#0A0F1E' }}>{cap.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'broll' && (
              <div className="space-y-4">
                <label className="text-[11px] font-semibold mb-2 block" style={{ color: '#64748B' }}>AI B-Roll Generation</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Photorealistic', 'Abstract', 'Cinematic', 'Pop Art', 'Watercolor', 'Retro'].map(s => (
                    <button key={s} className="p-4 rounded-xl text-center transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(91,95,255,0.03)', border: '1px solid rgba(91,95,255,0.08)' }}>
                      <Image size={20} className="mx-auto mb-2" style={{ color: '#64748B' }} />
                      <span className="text-[11px] font-medium" style={{ color: '#64748B' }}>{s}</span>
                    </button>
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}>
                  <Wand2 size={16} /> Generate B-Roll
                </button>
              </div>
            )}

            {activeTab === 'brand' && (
              <div className="space-y-4">
                <label className="text-[11px] font-semibold mb-2 block" style={{ color: '#64748B' }}>Brand Kit</label>
                <button className="w-full p-4 rounded-xl text-center"
                  style={{ background: 'rgba(91,95,255,0.03)', border: '1px dashed rgba(91,95,255,0.15)' }}>
                  <Palette size={20} className="mx-auto mb-2" style={{ color: '#64748B' }} />
                  <span className="text-xs" style={{ color: '#64748B' }}>Select a Brand Kit</span>
                </button>
                <label className="text-[11px] font-semibold mb-2 block" style={{ color: '#64748B' }}>Intro/Outro</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Fade In', 'Slide Up', 'Zoom', 'None'].map(t => (
                    <button key={t} className="p-3 rounded-xl text-center text-[11px] font-medium"
                      style={{ color: '#64748B', background: 'rgba(91,95,255,0.03)', border: '1px solid rgba(91,95,255,0.06)' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-3">
                <label className="text-[11px] font-semibold mb-2 block" style={{ color: '#64748B' }}>AI Enhancements</label>
                {[
                  { label: 'Remove Filler Words', desc: 'Remove "um", "uh", "like"' },
                  { label: 'Enhance Audio', desc: 'AI noise reduction & normalization' },
                  { label: 'Auto Reframe', desc: 'Smart speaker tracking' },
                  { label: 'Generate Voiceover', desc: 'AI narration from captions' },
                ].map(feat => (
                  <div key={feat.label} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(91,95,255,0.03)', border: '1px solid rgba(91,95,255,0.06)' }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#0A0F1E' }}>{feat.label}</p>
                      <p className="text-[10px]" style={{ color: '#64748B' }}>{feat.desc}</p>
                    </div>
                    <div className="w-9 h-5 rounded-full relative cursor-pointer" style={{ background: 'rgba(91,95,255,0.10)' }}>
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full" style={{ background: '#94A3B8' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
