import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Edit3, Check, Zap, Waves, X } from 'lucide-react';
import ViralityBadge from './ViralityBadge';

export default function ClipCard({ clip, selected, onSelect, onEdit }) {
  const [previewing, setPreviewing] = useState(false);
  const hasThumbnail = !!clip.thumbnailUrl;
  const canPreview = !!clip.videoId;

  const handlePlay = (e) => {
    e.stopPropagation();
    if (canPreview) setPreviewing(true);
    else onEdit();
  };

  return (
    <div className="group relative">
      {/* Phone frame */}
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer"
        style={{
          aspectRatio: '9/16',
          background: clip.thumbnailGradient,
          border: selected ? '2px solid #5B5FFF' : '1px solid rgba(91,95,255,0.10)',
          boxShadow: selected ? '0 0 20px rgba(91,95,255,0.15)' : 'none',
        }}
        onClick={onEdit}
      >
        {/* Thumbnail */}
        {hasThumbnail && !previewing && (
          <img
            src={clip.thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Inline YouTube preview */}
        {previewing && clip.videoId && (
          <>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${clip.videoId}?start=${clip.startTime || 0}&end=${Math.ceil((clip.endTime || (clip.startTime || 0) + (clip.duration || 45))) + 1}&autoplay=1&rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              onClick={(e) => { e.stopPropagation(); setPreviewing(false); }}
              className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.7)' }}>
              <X size={12} className="text-white" />
            </button>
          </>
        )}

        {/* Selection checkbox */}
        {!previewing && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="absolute top-2 left-2 z-10 w-6 h-6 rounded-md flex items-center justify-center transition-all"
            style={{
              background: selected ? '#5B5FFF' : 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              border: selected ? 'none' : '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {selected && <Check size={14} className="text-white" />}
          </motion.button>
        )}

        {/* Virality badge */}
        {!previewing && (
          <div className="absolute top-2 right-2 z-10">
            <ViralityBadge score={clip.viralityScore} size="sm" />
          </div>
        )}

        {/* Hover overlay */}
        {!previewing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
            <button
              onClick={handlePlay}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
              <Play className="w-5 h-5 text-white ml-0.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white flex items-center gap-1.5"
              style={{ background: 'rgba(91,95,255,0.9)', backdropFilter: 'blur(8px)' }}>
              <Edit3 size={12} /> Edit
            </button>
          </div>
        )}

        {/* Caption preview */}
        {!previewing && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <p className="text-[10px] font-bold text-white text-center leading-tight line-clamp-2">
              {clip.captions?.[0]?.text || clip.title}
            </p>
          </div>
        )}

        {/* Duration badge */}
        {!previewing && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-black/60 backdrop-blur-sm">
            {Math.floor((clip.duration || 0) / 60)}:{String((clip.duration || 0) % 60).padStart(2, '0')}
          </div>
        )}

        {/* Timestamp */}
        {!previewing && clip.startTime != null && (
          <div className="absolute top-2 left-10 px-1.5 py-0.5 rounded text-[8px] font-mono text-white/70 bg-black/40 backdrop-blur-sm">
            {Math.floor(clip.startTime / 60)}:{String(clip.startTime % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Info below card */}
      <div className="mt-2 px-1">
        <p className="text-[11px] font-medium truncate" style={{ color: '#0A0F1E' }}>{clip.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#64748B' }}>
            <Zap size={10} style={{ color: '#F59E0B' }} /> Hook {clip.hookScore}
          </span>
          <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#64748B' }}>
            <Waves size={10} style={{ color: '#06B6D4' }} /> Flow {clip.flowScore}
          </span>
        </div>
        {clip.scoreReason && (
          <p className="text-[9px] mt-0.5 line-clamp-1" style={{ color: '#94A3B8' }}>{clip.scoreReason}</p>
        )}
      </div>
    </div>
  );
}
