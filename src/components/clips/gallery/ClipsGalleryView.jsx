import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Filter, SlidersHorizontal, Download, Grid3X3, List, ChevronDown } from 'lucide-react';
import { useClips } from '@/contexts/ClipsContext';
import useClipsNav from '@/hooks/useClipsNav';
import ClipCard from './ClipCard';
import ViralityBadge from './ViralityBadge';
import ClipsGlassCard from '../shared/ClipsGlassCard';
import ClipsGradientText from '../shared/ClipsGradientText';

export default function ClipsGalleryView({ projectId }) {
  const { currentProject, currentClips, loadProject } = useClips();
  const { navigate, dashboardPath, editorPath } = useClipsNav();
  const [sortBy, setSortBy] = useState('score');
  const [selectedClips, setSelectedClips] = useState(new Set());
  const [filterRatio, setFilterRatio] = useState('all');

  // Load project on mount or when projectId changes
  useEffect(() => {
    if (projectId) {
      // Always load — ensures clips are generated even if context was reset
      loadProject(projectId);
    }
  }, [projectId]);

  const sortedClips = useMemo(() => {
    let clips = [...currentClips];
    if (filterRatio !== 'all') clips = clips.filter(c => c.aspectRatio === filterRatio);
    if (sortBy === 'score') clips.sort((a, b) => b.viralityScore - a.viralityScore);
    if (sortBy === 'duration') clips.sort((a, b) => b.duration - a.duration);
    if (sortBy === 'date') clips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return clips;
  }, [currentClips, sortBy, filterRatio]);

  const toggleSelect = (clipId) => {
    setSelectedClips(prev => {
      const next = new Set(prev);
      if (next.has(clipId)) next.delete(clipId);
      else next.add(clipId);
      return next;
    });
  };

  const avgScore = currentClips.length
    ? Math.round(currentClips.reduce((a, c) => a + c.viralityScore, 0) / currentClips.length)
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate(dashboardPath)}
          className="flex items-center gap-2 text-sm transition-colors mb-4"
          style={{ color: '#64748B' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#0A0F1E' }}>
              {currentProject?.title || 'Project Clips'}
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>
              {currentClips.length} clips generated
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-3">
            <ClipsGlassCard className="px-4 py-2 flex items-center gap-2" hover={false}>
              <span className="text-[11px]" style={{ color: '#64748B' }}>Avg Score</span>
              <ViralityBadge score={avgScore} size="sm" />
            </ClipsGlassCard>
            <ClipsGlassCard className="px-4 py-2 flex items-center gap-2" hover={false}>
              <span className="text-[11px]" style={{ color: '#64748B' }}>Best</span>
              <ViralityBadge score={sortedClips[0]?.viralityScore || 0} size="sm" />
            </ClipsGlassCard>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 mb-6"
      >
        {/* Sort */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.08)' }}>
          <SlidersHorizontal size={14} style={{ color: '#64748B' }} />
          {['score', 'duration', 'date'].map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
              style={{
                background: sortBy === s ? 'rgba(91,95,255,0.08)' : 'transparent',
                color: sortBy === s ? '#5B5FFF' : '#64748B',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Ratio filter */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.08)' }}>
          {['all', '9:16', '16:9', '1:1'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRatio(r)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
              style={{
                background: filterRatio === r ? 'rgba(91,95,255,0.08)' : 'transparent',
                color: filterRatio === r ? '#5B5FFF' : '#64748B',
              }}
            >
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {selectedClips.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-xs" style={{ color: '#64748B' }}>{selectedClips.size} selected</span>
            <button
              className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}
            >
              <Download size={14} /> Export Selected
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Clips Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AnimatePresence>
          {sortedClips.map((clip, i) => (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.03 }}
            >
              <ClipCard
                clip={clip}
                selected={selectedClips.has(clip.id)}
                onSelect={() => toggleSelect(clip.id)}
                onEdit={() => navigate(editorPath(clip.id))}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
