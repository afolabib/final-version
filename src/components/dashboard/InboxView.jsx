import { useState, useEffect } from 'react';
import { Bell, Search, CheckCheck, Zap, Mail, MessageSquare, FileText, AlertCircle, TrendingUp, Bot, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useCompany } from '@/contexts/CompanyContext';

// Map activity_log event types → inbox display
const EVENT_META = {
  'task.completed':           { type: 'task',    icon: Zap,           color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',   label: 'Task Done' },
  'task.created':             { type: 'task',    icon: Zap,           color: '#5B5FFF', bg: 'rgba(91,95,255,0.08)',    label: 'Task Created' },
  'approval.requested':       { type: 'alert',   icon: AlertCircle,   color: '#EF4444', bg: 'rgba(239,68,68,0.08)',    label: 'Needs Approval' },
  'approval.approved':        { type: 'task',    icon: CheckCircle2,  color: '#10B981', bg: 'rgba(16,185,129,0.08)',   label: 'Approved' },
  'approval.rejected':        { type: 'alert',   icon: AlertCircle,   color: '#EF4444', bg: 'rgba(239,68,68,0.08)',    label: 'Rejected' },
  'approval.needs_input_resolved': { type: 'task', icon: Zap,         color: '#10B981', bg: 'rgba(16,185,129,0.08)',  label: 'Agent Unblocked' },
  'goal.created':             { type: 'report',  icon: TrendingUp,    color: '#10B981', bg: 'rgba(16,185,129,0.08)',   label: 'Goal Set' },
  'goal.updated':             { type: 'report',  icon: TrendingUp,    color: '#10B981', bg: 'rgba(16,185,129,0.08)',   label: 'Goal Updated' },
  'document.created':         { type: 'file',    icon: FileText,      color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',   label: 'File Saved' },
  'agent.heartbeat':          { type: 'message', icon: Bot,           color: '#0984E3', bg: 'rgba(9,132,227,0.08)',    label: 'Agent Update' },
  'agent.created':            { type: 'message', icon: Bot,           color: '#5B5FFF', bg: 'rgba(91,95,255,0.08)',    label: 'Agent Deployed' },
  'chat.message':             { type: 'message', icon: MessageSquare, color: '#5B5FFF', bg: 'rgba(91,95,255,0.08)',    label: 'Message' },
  'default':                  { type: 'message', icon: Bot,           color: '#94A3B8', bg: 'rgba(148,163,184,0.08)',  label: 'Activity' },
};

function getMeta(event) {
  return EVENT_META[event] || EVENT_META.default;
}

function timeAgo(date) {
  if (!date) return '—';
  const now = Date.now();
  const ts = date instanceof Date ? date.getTime() : date.toDate ? date.toDate().getTime() : now;
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const FILTERS = ['All', 'Unread', 'Tasks', 'Reports', 'Alerts'];

export default function InboxView() {
  const { activeCompanyId } = useCompany();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeCompanyId) { setLoading(false); return; }
    const q = query(
      collection(firestore, 'activity_log'),
      where('companyId', '==', activeCompanyId),
      orderBy('createdAt', 'desc'),
      limit(60)
    );
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [activeCompanyId]);

  const markRead = id => setReadIds(prev => new Set([...prev, id]));
  const markAllRead = () => setReadIds(new Set(items.map(i => i.id)));
  const unreadCount = items.filter(i => !readIds.has(i.id)).length;

  const visible = items.filter(item => {
    const meta = getMeta(item.event);
    if (filter === 'Unread'  && readIds.has(item.id)) return false;
    if (filter === 'Tasks'   && meta.type !== 'task') return false;
    if (filter === 'Reports' && meta.type !== 'report') return false;
    if (filter === 'Alerts'  && meta.type !== 'alert') return false;
    if (search && !item.summary?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8"
      style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F7FF 45%, #FAFCFF 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: 'rgba(91,95,255,0.08)' }}>
              <Bell size={16} style={{ color: '#5B5FFF' }} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: '#EF4444' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#0A0A1A' }}>Inbox</h1>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.07)', border: '1px solid rgba(91,95,255,0.15)' }}>
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-40"
            style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.08)' }}>
            <Search size={13} style={{ color: '#94A3B8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search activity…"
              className="text-sm outline-none bg-transparent w-full" style={{ color: '#0A0A1A' }} />
          </div>
          <div className="flex gap-1.5">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: filter === f ? 'rgba(91,95,255,0.1)' : 'rgba(255,255,255,0.8)',
                  color: filter === f ? '#5B5FFF' : '#6B7280',
                  border: filter === f ? '1px solid rgba(91,95,255,0.2)' : '1px solid rgba(0,0,0,0.06)',
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Items */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.6)' }}>
            <Bell size={28} style={{ color: '#CBD5E1', marginBottom: 12 }} />
            <p className="text-sm font-bold" style={{ color: '#374151' }}>
              {items.length === 0 ? 'No activity yet' : 'Nothing matches this filter'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
              {items.length === 0 ? 'Agent activity will appear here as they work.' : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {visible.map((item, i) => {
                const meta = getMeta(item.event);
                const Icon = meta.icon;
                const isRead = readIds.has(item.id);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    onClick={() => markRead(item.id)}
                    className="flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all"
                    style={{
                      background: isRead ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.95)',
                      border: isRead ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(91,95,255,0.1)',
                      boxShadow: isRead ? 'none' : '0 2px 12px rgba(91,95,255,0.06)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,95,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = isRead ? 'none' : '0 2px 12px rgba(91,95,255,0.06)'}>

                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: meta.bg }}>
                      <Icon size={15} style={{ color: meta.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: meta.color }}>
                          {meta.label}
                        </span>
                        {!isRead && (
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#5B5FFF' }} />
                        )}
                      </div>
                      <p className="text-sm font-medium leading-snug" style={{ color: isRead ? '#64748B' : '#0A0A1A' }}>
                        {item.summary || item.event}
                      </p>
                      {item.actorId && (
                        <p className="text-[11px] mt-0.5" style={{ color: '#CBD5E1' }}>
                          {item.actorType === 'agent' ? '🤖' : '👤'} {item.actorId === 'system' ? 'System' : item.actorId.slice(0, 8)}
                        </p>
                      )}
                    </div>

                    <span className="text-[11px] flex-shrink-0 mt-0.5" style={{ color: '#94A3B8' }}>
                      {timeAgo(item.createdAt)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
