import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ArrowRight, Youtube, CheckCircle2, Sparkles, Globe, User, Clock, FileVideo, Loader2 } from 'lucide-react';
import { useClips } from '@/contexts/ClipsContext';
import useClipsNav from '@/hooks/useClipsNav';
import { fetchVideoMetadata, extractVideoId } from '@/lib/youtubeService';
import ProcessingAnimation from './ProcessingAnimation';

const VIDEO_EXTS = /\.(mp4|mov|avi|webm|mkv|mpeg|m4v)$/i;

export default function CreateProjectFlow({ onClose, initialUrl = '' }) {
  const [step, setStep] = useState('input'); // input | fetching | uploading | processing | complete
  const [url, setUrl] = useState(initialUrl);
  const [metadata, setMetadata] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const { createNewProject, createProjectFromFile, processing } = useClips();
  const { navigate, projectPath } = useClipsNav();
  const fileInputRef = useRef(null);

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const videoId = extractVideoId(url);

  // ── YouTube URL flow ──────────────────────────────────────────────────────
  const runProcessing = async (videoUrl) => {
    setError(null);
    setStep('fetching');
    let meta = null;
    try { meta = await fetchVideoMetadata(videoUrl); setMetadata(meta); } catch {}
    setStep('processing');
    try {
      const result = await createNewProject(videoUrl);
      setStep('complete');
      setTimeout(() => { navigate(projectPath(result.project.id)); onClose(); }, 1500);
    } catch (e) {
      setError(e.message || 'Processing failed');
      setStep('input');
    }
  };

  useEffect(() => {
    if (initialUrl && initialUrl !== 'upload') runProcessing(initialUrl);
  }, []); // eslint-disable-line

  const handleSubmit = () => { if (url.trim()) runProcessing(url.trim()); };

  // ── File handling ─────────────────────────────────────────────────────────
  const acceptFile = (file) => {
    if (!file) return;
    if (!VIDEO_EXTS.test(file.name) && !file.type.startsWith('video/')) {
      setError('Please select a video file (MP4, MOV, AVI, WebM, MKV)');
      return;
    }
    if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
      setError('File too large — maximum 2GB');
      return;
    }
    setError(null);
    setUploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  // ── File upload + transcribe flow ─────────────────────────────────────────
  const runFileProcessing = async () => {
    if (!uploadFile) return;
    setError(null);
    setStep('uploading');
    setUploadProgress(0);
    try {
      const result = await createProjectFromFile(uploadFile, (pct) => setUploadProgress(pct));
      setStep('complete');
      setTimeout(() => { navigate(projectPath(result.project.id)); onClose(); }, 1500);
    } catch (e) {
      setError(e.message || 'Upload failed');
      setStep('input');
    }
  };

  const displayName = uploadFile
    ? uploadFile.name
    : metadata?.title
    ? `"${metadata.title.slice(0, 35)}..."`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg mx-4 rounded-3xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.99)', border: '1px solid rgba(91,95,255,0.10)', boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(91,95,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <h2 className="text-base font-bold" style={{ color: '#0A0F1E' }}>
              {step === 'input'      && 'New Project'}
              {step === 'fetching'   && 'Fetching video info…'}
              {step === 'uploading'  && 'Uploading video…'}
              {step === 'processing' && 'AI Processing'}
              {step === 'complete'   && 'Clips Ready!'}
            </h2>
          </div>
          {step === 'input' && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={18} style={{ color: '#64748B' }} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* ── Input step ── */}
            {step === 'input' && (
              <motion.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>

                {/* URL input */}
                <label className="text-xs font-medium mb-2 block" style={{ color: '#64748B' }}>Paste a YouTube URL</label>
                <div className="relative">
                  <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                    style={{ color: '#0A0F1E', background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.10)' }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                  {isYouTube && <Youtube size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />}
                  {url && !isYouTube && <Globe size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />}
                </div>

                {/* YouTube preview */}
                {videoId && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-xl flex gap-3 p-3"
                    style={{ background: 'rgba(91,95,255,0.03)', border: '1px solid rgba(91,95,255,0.06)' }}>
                    <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt=""
                      className="w-24 h-[54px] rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium" style={{ color: '#0A0F1E' }}>YouTube Video Detected</p>
                      <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: '#10B981' }}>
                        <CheckCircle2 size={10} /> Ready to process
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px" style={{ background: 'rgba(91,95,255,0.08)' }} />
                  <span className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>OR UPLOAD A FILE</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(91,95,255,0.08)' }} />
                </div>

                {/* File drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                  style={{
                    background: dragging ? 'rgba(91,95,255,0.08)' : uploadFile ? 'rgba(16,185,129,0.04)' : 'rgba(91,95,255,0.03)',
                    border: `2px dashed ${dragging ? 'rgba(91,95,255,0.4)' : uploadFile ? 'rgba(16,185,129,0.3)' : 'rgba(91,95,255,0.12)'}`,
                  }}>
                  {uploadFile ? (
                    <>
                      <FileVideo size={22} style={{ color: '#10B981' }} />
                      <p className="text-sm font-semibold truncate max-w-[280px]" style={{ color: '#10B981' }}>{uploadFile.name}</p>
                      <p className="text-[10px]" style={{ color: '#94A3B8' }}>
                        {(uploadFile.size / 1024 / 1024).toFixed(1)} MB — click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={20} style={{ color: '#94A3B8' }} />
                      <p className="text-sm font-medium" style={{ color: '#64748B' }}>Drop video here or click to browse</p>
                      <p className="text-[10px]" style={{ color: '#CBD5E1' }}>MP4, MOV, AVI, WebM, MKV — up to 2GB</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
                  onChange={e => acceptFile(e.target.files?.[0])} />

                {/* Error */}
                {error && (
                  <p className="text-xs mt-2 text-center" style={{ color: '#EF4444' }}>{error}</p>
                )}

                {/* CTA */}
                {uploadFile && !url.trim() ? (
                  <button onClick={runFileProcessing}
                    className="w-full mt-4 py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 btn-press"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
                    <Sparkles size={16} /> Generate Clips from File
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={!url.trim()}
                    className="w-full mt-4 py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 btn-press disabled:opacity-30"
                    style={{
                      background: url.trim() ? 'linear-gradient(135deg, #5B5FFF, #7C3AED)' : 'rgba(91,95,255,0.10)',
                      boxShadow: url.trim() ? '0 4px 20px rgba(91,95,255,0.35)' : 'none',
                    }}>
                    Generate Clips <ArrowRight size={16} />
                  </button>
                )}
              </motion.div>
            )}

            {/* ── Upload progress ── */}
            {step === 'uploading' && (
              <motion.div key="uploading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="py-6 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                  <Loader2 size={24} className="text-white animate-spin" />
                </div>
                <div className="w-full">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span style={{ color: '#64748B' }}>Uploading {uploadFile?.name}</span>
                    <span style={{ color: '#5B5FFF' }}>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(91,95,255,0.08)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #5B5FFF, #7C3AED)', width: `${uploadProgress}%` }}
                      animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <p className="text-[10px] mt-2 text-center" style={{ color: '#94A3B8' }}>
                    Uploading securely — transcription will start automatically
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── AI Processing ── */}
            {(step === 'fetching' || step === 'processing') && (
              <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}>
                {metadata && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-xl flex gap-3 p-3"
                    style={{ background: 'rgba(91,95,255,0.03)', border: '1px solid rgba(91,95,255,0.06)' }}>
                    {metadata.thumbnailUrl && (
                      <img src={metadata.thumbnailUrl} alt="" className="w-20 h-[45px] rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate" style={{ color: '#0A0F1E' }}>{metadata.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}>
                          <User size={10} /> {metadata.author}
                        </span>
                        <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}>
                          <Clock size={10} /> ~{Math.floor((metadata.estimatedDuration || 0) / 60)}min
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <ProcessingAnimation processing={processing} videoTitle={displayName} />
              </motion.div>
            )}

            {/* ── Complete ── */}
            {step === 'complete' && (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <CheckCircle2 size={64} className="mx-auto mb-4" style={{ color: '#10B981' }} />
                </motion.div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#0A0F1E' }}>Clips Ready!</h3>
                <p className="text-sm" style={{ color: '#64748B' }}>
                  {displayName ? `Found viral moments in ${displayName}` : 'Redirecting to your clips…'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
