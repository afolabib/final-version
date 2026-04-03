import { useState } from 'react';
import { Bell, Search, CheckCheck, Zap, Mail, MessageSquare, FileText, AlertCircle, TrendingUp, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_ICON = {
  message:   { icon: MessageSquare, color: '#5B5FFF', bg: 'rgba(91,95,255,0.08)' },
  task:      { icon: Zap,           color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  report:    { icon: TrendingUp,    color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  alert:     { icon: AlertCircle,   color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  email:     { icon: Mail,          color: '#0984E3', bg: 'rgba(9,132,227,0.08)' },
  file:      { icon: FileText,      color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
};

const seed = [
  { id: 1, type: 'message',  agent: 'Atlas',   title: 'Lead follow-up drafted',        body: 'I drafted a follow-up email for the inbound lead from the website. Ready to review and send.',   time: '2m ago',  read: false },
  { id: 2, type: 'alert',    agent: 'Rex',     title: 'Budget threshold reached',       body: 'API spend is at 87% of your monthly limit. Consider adding credits or reducing frequency.',       time: '14m ago', read: false },
  { id: 3, type: 'report',   agent: 'Nova',    title: 'Weekly performance report',      body: '42 tasks completed, 3 escalated, 98% uptime. Revenue pipeline increased by $12,400.',           time: '1h ago',  read: false },
  { id: 4, type: 'task',     agent: 'Atlas',   title: 'Support tickets triaged',        body: '8 new tickets processed. 3 escalated to you, 5 resolved autonomously.',                         time: '2h ago',  read: true  },
  { id: 5, type: 'email',    agent: 'Echo',    title: 'New reply from client',          body: 'Sarah from Acme Corp replied to your outreach. She\'s interested in a demo next week.',         time: '3h ago',  read: true  },
  { id: 6, type: 'file',     agent: 'Dev',     title: 'Contract draft ready',           body: 'NDA template has been filled out based on your last conversation. Download or edit in Files.',   time: '5h ago',  read: true  },
  { id: 7, type: 'report',   agent: 'Nova',    title: 'Competitor analysis complete',   body: 'Analyzed 5 competitors. Full report saved to Files. Key insight: pricing gap opportunity.',     time: '1d ago',  read: true  },
  { id: 8, type: 'task',     agent: 'Atlas',   title: 'Calendar blocked & prepped',     body: 'Tomorrow\'s 9am call has a briefing doc ready. Added prep time at 8:30am.',                    time: '1d ago',  read: true  },
];

const FILTERS = ['All', 'Unread', 'Tasks', 'Reports', 'Alerts'];

export default function InboxView() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState(seed);

  const unreadCount = items.filter(i => !i.read).length;

  const visible = items.filter(item => {
    if (filter === 'Unread' && item.read) return false;
    if (filter === 'Tasks'   && item.type !== 'task') return false;
    if (filter === 'Reports' && item.type !== 'report') return false;
    if (filter === 'Alerts'  && item.type !== 'alert') return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.body.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const markAllRead = () => setItems(prev => prev.map(i => ({ ...i, read: true })));
  const markRead = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8" style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F7FF 45%, #FAFCFF 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: 'rgba(91,95,255,0.08)' }}>
              <Bell size={16} style={{ color: '#5B5FFF' }} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: '#EF4444' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>Inbox</h1>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Updates and messages from your agents.</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.08)', border: '1px solid rgba(91,95,255,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.08)'}>
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: filter === f ? 'linear-gradient(135deg, #5B5FFF, #7C3AED)' : 'rgba(255,255,255,0.8)',
                  color: filter === f ? '#fff' : '#6B7280',
                  border: filter === f ? 'none' : '1px solid rgba(0,0,0,0.06)',
                }}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl w-full sm:w-72" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Search size={13} style={{ color: '#CBD5E1' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inbox..." className="flex-1 text-sm outline-none bg-transparent font-medium" style={{ color: '#374151' }} />
          </div>
        </div>
      </motion.div>

      {/* List */}
      <AnimatePresence>
        <div className="space-y-2">
          {visible.map((item, i) => {
            const meta = TYPE_ICON[item.type] || TYPE_ICON.task;
            const Icon = meta.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                onClick={() => markRead(item.id)}
                className="flex items-start gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: item.read ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.97)',
                  border: item.read ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(91,95,255,0.15)',
                  boxShadow: item.read ? 'none' : '0 4px 20px rgba(91,95,255,0.08)',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(91,95,255,0.10)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = item.read ? 'none' : '0 4px 20px rgba(91,95,255,0.08)'}>

                {/* Unread dot */}
                <div className="w-2 flex-shrink-0 flex items-center pt-1.5">
                  {!item.read && <div className="w-2 h-2 rounded-full" style={{ background: '#5B5FFF' }} />}
                </div>

                {/* Type icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                  <Icon size={15} style={{ color: meta.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold truncate" style={{ color: item.read ? '#374151' : '#0F172A' }}>{item.title}</span>
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#6B7280' }}>{item.body}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Bot size={11} style={{ color: '#CBD5E1' }} />
                    <span className="text-[11px] font-semibold" style={{ color: '#94A3B8' }}>{item.agent}</span>
                    <span className="text-[11px]" style={{ color: '#CBD5E1' }}>·</span>
                    <span className="text-[11px]" style={{ color: '#CBD5E1' }}>{item.time}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.10)' }}>
            <CheckCheck size={24} style={{ color: '#C5C9E0' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#94A3B8' }}>All caught up</p>
        </div>
      )}
    </div>
  );
}
