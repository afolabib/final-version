import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, ExternalLink } from 'lucide-react';
import { useClips } from '@/contexts/ClipsContext';
import ClipsGlassCard from '../shared/ClipsGlassCard';
import ClipsGradientText from '../shared/ClipsGradientText';
import ClipsEmptyState from '../shared/ClipsEmptyState';

const PLATFORMS = [
  { id: 'tiktok',    name: 'TikTok',          color: '#FF0050', connected: true },
  { id: 'youtube',   name: 'YouTube Shorts',   color: '#FF0000', connected: true },
  { id: 'instagram', name: 'Instagram Reels',  color: '#E1306C', connected: false },
  { id: 'linkedin',  name: 'LinkedIn',          color: '#0077B5', connected: false },
  { id: 'x',         name: 'X (Twitter)',       color: '#1DA1F2', connected: false },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function SchedulerView() {
  const { schedules, addSchedule } = useClips();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDay, daysInMonth]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // Mock scheduled items
  const mockScheduled = [
    { day: 12, platform: 'tiktok', title: 'Growth Hack Clip', time: '9:00 AM' },
    { day: 12, platform: 'youtube', title: 'Podcast Highlight', time: '2:00 PM' },
    { day: 15, platform: 'tiktok', title: 'Product Demo', time: '10:00 AM' },
    { day: 18, platform: 'youtube', title: 'Conference Talk', time: '4:00 PM' },
    { day: 22, platform: 'tiktok', title: 'Tips & Tricks', time: '8:00 AM' },
    { day: 25, platform: 'youtube', title: 'Interview Clip', time: '1:00 PM' },
  ];

  const getScheduledForDay = (day) => mockScheduled.filter(s => s.day === day);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#0A0F1E' }}>
              <ClipsGradientText>Scheduler</ClipsGradientText>
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>Schedule and auto-publish clips across platforms</p>
          </div>
          <button className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 btn-press"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}>
            <Plus size={14} /> Schedule Clip
          </button>
        </div>
      </motion.div>

      <div className="flex gap-6">
        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1">
          <ClipsGlassCard className="p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft size={18} style={{ color: '#64748B' }} />
              </button>
              <h3 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>{MONTHS[month]} {year}</h3>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight size={18} style={{ color: '#64748B' }} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color: '#64748B' }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const scheduled = getScheduledForDay(day);
                return (
                  <div
                    key={day}
                    className="min-h-[80px] p-1.5 rounded-lg transition-all cursor-pointer hover:bg-gray-50"
                    style={{
                      background: isToday(day) ? 'rgba(91,95,255,0.06)' : 'transparent',
                      border: isToday(day) ? '1px solid rgba(91,95,255,0.12)' : '1px solid rgba(91,95,255,0.04)',
                    }}
                  >
                    <span className={`text-[11px] font-medium`} style={{ color: isToday(day) ? '#5B5FFF' : '#64748B' }}>
                      {day}
                    </span>
                    {scheduled.map((s, j) => {
                      const platform = PLATFORMS.find(p => p.id === s.platform);
                      return (
                        <div key={j} className="mt-1 px-1.5 py-0.5 rounded text-[8px] font-medium truncate"
                          style={{ background: `${platform?.color}15`, color: platform?.color }}>
                          {s.title}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </ClipsGlassCard>
        </motion.div>

        {/* Sidebar - Platforms & Upcoming */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="w-[280px] flex-shrink-0 space-y-4">

          {/* Platform connections */}
          <ClipsGlassCard className="p-4">
            <h3 className="text-xs font-bold mb-3" style={{ color: '#0A0F1E' }}>Platform Connections</h3>
            <div className="space-y-2">
              {PLATFORMS.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg"
                  style={{ background: 'rgba(91,95,255,0.03)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.connected ? '#10B981' : '#94A3B8' }} />
                    <span className="text-[11px] font-medium" style={{ color: '#0A0F1E' }}>{p.name}</span>
                  </div>
                  <button className="text-[10px] font-medium px-2 py-0.5 rounded"
                    style={{
                      background: p.connected ? 'rgba(16,185,129,0.08)' : 'rgba(91,95,255,0.06)',
                      color: p.connected ? '#10B981' : '#5B5FFF',
                    }}>
                    {p.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </ClipsGlassCard>

          {/* Upcoming posts */}
          <ClipsGlassCard className="p-4">
            <h3 className="text-xs font-bold mb-3" style={{ color: '#0A0F1E' }}>Upcoming Posts</h3>
            <div className="space-y-2">
              {mockScheduled.slice(0, 4).map((s, i) => {
                const platform = PLATFORMS.find(p => p.id === s.platform);
                return (
                  <div key={i} className="p-2.5 rounded-lg" style={{ background: 'rgba(91,95,255,0.03)', border: '1px solid rgba(91,95,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: platform?.color }} />
                      <span className="text-[10px] font-medium" style={{ color: platform?.color }}>{platform?.name}</span>
                    </div>
                    <p className="text-[11px] font-medium truncate" style={{ color: '#0A0F1E' }}>{s.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={10} style={{ color: '#64748B' }} />
                      <span className="text-[10px]" style={{ color: '#64748B' }}>{MONTHS[month]} {s.day}, {s.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ClipsGlassCard>
        </motion.div>
      </div>
    </div>
  );
}
