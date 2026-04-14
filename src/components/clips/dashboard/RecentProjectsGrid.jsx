import { motion } from 'framer-motion';
import { Film, Clock, Play, Youtube, Upload, Globe, Loader2 } from 'lucide-react';
import useClipsNav from '@/hooks/useClipsNav';
import ClipsGlassCard from '../shared/ClipsGlassCard';

const SOURCE_ICONS = {
  youtube: Youtube,
  upload: Upload,
  vimeo: Globe,
  tiktok: Film,
  url: Globe,
};

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecentProjectsGrid({ projects }) {
  const { navigate, projectPath } = useClipsNav();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.slice(0, 6).map((project, i) => {
        const SourceIcon = SOURCE_ICONS[project.sourceType] || Globe;
        const isProcessing = project.status === 'processing';

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <ClipsGlassCard
              className="overflow-hidden group"
              onClick={() => !isProcessing && navigate(projectPath(project.id))}
            >
              {/* Thumbnail */}
              <div
                className="h-32 relative flex items-center justify-center overflow-hidden"
                style={{ background: project.thumbnailGradient }}
              >
                {project.thumbnailUrl && (
                  <img src={project.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                )}
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 text-white/80 animate-spin" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                )}

                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-semibold text-white bg-black/50 backdrop-blur-sm">
                  {formatDuration(project.duration)}
                </div>

                {/* Source badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold text-white bg-black/50 backdrop-blur-sm flex items-center gap-1">
                  <SourceIcon size={10} />
                  {project.sourceType}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm font-semibold truncate" style={{ color: '#0A0F1E' }}>{project.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] flex items-center gap-1" style={{ color: '#64748B' }}>
                    <Film size={12} />
                    {isProcessing ? 'Processing...' : `${project.clipCount} clips`}
                  </span>
                  <span className="text-[11px] flex items-center gap-1" style={{ color: '#64748B' }}>
                    <Clock size={12} />
                    {timeAgo(project.createdAt)}
                  </span>
                </div>

                {isProcessing && (
                  <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(91,95,255,0.10)' }}>
                    <motion.div
                      animate={{ width: ['0%', '60%', '80%'] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #5B5FFF, #7C3AED)' }}
                    />
                  </div>
                )}
              </div>
            </ClipsGlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
