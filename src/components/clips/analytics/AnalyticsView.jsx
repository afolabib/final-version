import { motion } from 'framer-motion';
import { TrendingUp, Eye, Heart, Share2, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useClips } from '@/contexts/ClipsContext';
import ClipsGlassCard from '../shared/ClipsGlassCard';
import ClipsGradientText from '../shared/ClipsGradientText';

const STATS = [
  { label: 'Total Views', value: '124.5K', change: '+12.3%', up: true, icon: Eye, color: '#5B5FFF' },
  { label: 'Engagement', value: '8,340', change: '+8.7%', up: true, icon: Heart, color: '#EC4899' },
  { label: 'Avg Virality', value: '72', change: '+3.2', up: true, icon: TrendingUp, color: '#10B981' },
  { label: 'Shares', value: '2,150', change: '-2.1%', up: false, icon: Share2, color: '#3B82F6' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(91,95,255,0.10)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p className="text-[10px]" style={{ color: '#64748B' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-bold" style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>
      ))}
    </div>
  );
};

export default function AnalyticsView() {
  const { analytics } = useClips();

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#0A0F1E' }}>
          <ClipsGradientText>Analytics</ClipsGradientText>
        </h1>
        <p className="text-sm" style={{ color: '#64748B' }}>Track performance across all your clips and platforms</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <ClipsGlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-0.5 text-[11px] font-semibold ${stat.up ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {stat.change}
                </div>
              </div>
              <p className="text-xl font-bold" style={{ color: '#0A0F1E' }}>{stat.value}</p>
              <p className="text-[11px]" style={{ color: '#64748B' }}>{stat.label}</p>
            </ClipsGlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <ClipsGlassCard className="p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: '#0A0F1E' }}>Performance Over Time</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.viewsOverTime}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5B5FFF" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#5B5FFF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(91,95,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="views" stroke="#5B5FFF" strokeWidth={2} fill="url(#viewsGrad)" name="Views" />
                  <Area type="monotone" dataKey="engagement" stroke="#06B6D4" strokeWidth={2} fill="url(#engGrad)" name="Engagement" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ClipsGlassCard>
        </motion.div>

        {/* Platform breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ClipsGlassCard className="p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: '#0A0F1E' }}>Platform Breakdown</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.platformBreakdown}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics.platformBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {analytics.platformBreakdown.map(p => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                    <span className="text-[11px]" style={{ color: '#64748B' }}>{p.name}</span>
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: '#0A0F1E' }}>{p.value}%</span>
                </div>
              ))}
            </div>
          </ClipsGlassCard>
        </motion.div>
      </div>

      {/* Top clips table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <ClipsGlassCard className="p-5">
          <h3 className="text-sm font-bold mb-4" style={{ color: '#0A0F1E' }}>Top Performing Clips</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(91,95,255,0.08)' }}>
                  {['Clip', 'Views', 'Engagement', 'Virality', 'Platform'].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold py-2 px-3" style={{ color: '#64748B' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { title: 'The ONE thing that changed everything', views: '45.2K', engagement: '3.1K', score: 94, platform: 'TikTok' },
                  { title: 'Nobody talks about this...', views: '32.8K', engagement: '2.4K', score: 87, platform: 'YouTube' },
                  { title: 'This blew my mind', views: '28.1K', engagement: '1.9K', score: 82, platform: 'TikTok' },
                  { title: 'Stop doing THIS immediately', views: '21.4K', engagement: '1.5K', score: 78, platform: 'Instagram' },
                  { title: 'The 3-second rule that works', views: '18.6K', engagement: '1.2K', score: 71, platform: 'LinkedIn' },
                ].map((clip, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid rgba(91,95,255,0.04)' }}>
                    <td className="py-2.5 px-3 text-xs font-medium" style={{ color: '#0A0F1E' }}>{clip.title}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#64748B' }}>{clip.views}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#64748B' }}>{clip.engagement}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-black text-white"
                        style={{ background: clip.score >= 90 ? 'linear-gradient(135deg,#5B5FFF,#7C3AED)' : clip.score >= 70 ? '#10B981' : '#F59E0B' }}>
                        {clip.score}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#64748B' }}>{clip.platform}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ClipsGlassCard>
      </motion.div>
    </div>
  );
}
