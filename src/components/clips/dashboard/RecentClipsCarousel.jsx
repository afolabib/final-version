import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ViralityBadge from '../gallery/ViralityBadge';

export default function RecentClipsCarousel({ clips }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  return (
    <div className="relative group">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(91,95,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        <ChevronLeft size={16} style={{ color: '#0A0F1E' }} />
      </button>
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(91,95,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        <ChevronRight size={16} style={{ color: '#0A0F1E' }} />
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {clips.map((clip, i) => (
          <motion.div
            key={clip.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 w-[180px] group/card cursor-pointer"
          >
            {/* Phone frame */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                aspectRatio: '9/16',
                background: clip.thumbnailGradient,
                border: '1px solid rgba(91,95,255,0.10)',
              }}
            >
              {clip.thumbnailUrl && (
                <img src={clip.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              )}
              {/* Virality badge */}
              <div className="absolute top-2 right-2">
                <ViralityBadge score={clip.viralityScore} size="sm" />
              </div>

              {/* Caption preview */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-[10px] font-bold text-white leading-tight line-clamp-2">
                  {clip.captions?.[0]?.text || clip.title}
                </p>
              </div>

              {/* Duration */}
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-black/60">
                0:{String(clip.duration).padStart(2, '0')}
              </div>
            </div>

            <p className="text-[11px] font-medium mt-2 truncate" style={{ color: '#64748B' }}>{clip.title}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
