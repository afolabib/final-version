import { motion } from 'framer-motion';
import { Zap, Film, FolderOpen, Download } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import ClipsGlassCard from '../shared/ClipsGlassCard';

const STATS = [
  { key: 'creditsUsed', label: 'Credits Used', icon: Zap, color: '#5B5FFF', format: (s) => `${s.creditsUsed}/${s.creditsTotal}` },
  { key: 'clipsCreated', label: 'Clips Created', icon: Film, color: '#3B82F6', format: (s) => s.clipsCreated },
  { key: 'projectsCount', label: 'Projects', icon: FolderOpen, color: '#06B6D4', format: (s) => s.projectsCount },
  { key: 'exportsCount', label: 'Exports', icon: Download, color: '#10B981', format: (s) => s.exportsCount },
];

export default function UsageStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <ClipsGlassCard className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              {/* Mini sparkline */}
              <div className="w-16 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.sparklineData}>
                    <defs>
                      <linearGradient id={`spark-${stat.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stat.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={stat.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="clips"
                      stroke={stat.color}
                      strokeWidth={1.5}
                      fill={`url(#spark-${stat.key})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-xl font-bold" style={{ color: '#0A0F1E' }}>{stat.format(stats)}</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#64748B' }}>{stat.label}</p>
          </ClipsGlassCard>
        </motion.div>
      ))}
    </div>
  );
}
