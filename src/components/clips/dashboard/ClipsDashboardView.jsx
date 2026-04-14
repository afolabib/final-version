import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Film, Zap, Download, Play, Clock, ExternalLink } from 'lucide-react';
import { useClips } from '@/contexts/ClipsContext';
import ClipsGlassCard from '../shared/ClipsGlassCard';
import ClipsGradientText from '../shared/ClipsGradientText';
import QuickStartInput from './QuickStartInput';
import UsageStats from './UsageStats';
import RecentProjectsGrid from './RecentProjectsGrid';
import RecentClipsCarousel from './RecentClipsCarousel';
import CreateProjectFlow from '../create/CreateProjectFlow';

export default function ClipsDashboardView() {
  const [showCreate, setShowCreate] = useState(false);
  const [initialUrl, setInitialUrl] = useState('');
  const { projects, recentClips, usageStats } = useClips();

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#0A0F1E' }}>
          Welcome to <ClipsGradientText>FreemiClips</ClipsGradientText>
        </h1>
        <p className="text-sm" style={{ color: '#64748B' }}>
          Turn long videos into viral short clips with AI
        </p>
      </motion.div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <QuickStartInput onSubmit={(url) => { setInitialUrl(url); setShowCreate(true); }} />
      </motion.div>

      {/* Usage Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <UsageStats stats={usageStats} />
      </motion.div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: '#0A0F1E' }}>Recent Projects</h2>
          <button className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)' }}>
            View All
          </button>
        </div>
        <RecentProjectsGrid projects={projects} />
      </motion.div>

      {/* Recent Clips Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: '#0A0F1E' }}>Top Clips</h2>
        </div>
        <RecentClipsCarousel clips={recentClips} />
      </motion.div>

      {/* Create Flow Dialog */}
      {showCreate && <CreateProjectFlow onClose={() => { setShowCreate(false); setInitialUrl(''); }} initialUrl={initialUrl} />}
    </div>
  );
}
