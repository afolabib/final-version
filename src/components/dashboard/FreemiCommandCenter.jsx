import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Zap, Users, Target, BarChart2, RefreshCw, ArrowUpRight } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/lib/AuthContext';
import { createGoal } from '@/lib/goalService';
import { createTask } from '@/lib/taskService';
import { logActivity } from '@/lib/activityService';
import { AGENT_STATUS, ROLE_COLORS } from '@/lib/agentService';
import { formatDistanceToNow } from 'date-fns';

// ── Activity feed item ─────────────────────────────────────────────────────────
function ActivityItem({ item, agents }) {
  const agent = agents.find(a => a.id === item.actorId);
  const color = agent ? (ROLE_COLORS[agent.role] || '#6C5CE7') : '#6C5CE7';
  const initial = agent?.name?.[0]?.toUpperCase() || (item.actorType === 'system' ? '⚡' : 'F');
  const time = item.createdAt?.toDate ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : 'just now';

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 py-2.5 px-1 border-b last:border-0"
      style={{ borderColor: 'rgba(108,92,231,0.06)' }}>
      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5"
        style={{ background: color, boxShadow: `0 2px 6px ${color}40` }}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed" style={{ color: '#374151' }}>
          {agent && <span className="font-semibold">{agent.name} </span>}
          {item.summary}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>{time}</p>
      </div>
    </motion.div>
  );
}

// ── CEO status indicator ───────────────────────────────────────────────────────
function FreemiStatus({ agent }) {
  if (!agent) return null;
  const statusMap = {
    [AGENT_STATUS.ACTIVE]:   { label: 'Running', color: '#00B894', pulse: true },
    [AGENT_STATUS.SLEEPING]: { label: 'Standby', color: '#FDCB6E', pulse: false },
    [AGENT_STATUS.PAUSED]:   { label: 'Paused',  color: '#B2BEC3', pulse: false },
    [AGENT_STATUS.ERROR]:    { label: 'Error',   color: '#D63031', pulse: true },
  };
  const { label, color, pulse } = statusMap[agent.status] || statusMap[AGENT_STATUS.SLEEPING];
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex-shrink-0" style={{ width: 8, height: 8 }}>
        <span className="block rounded-full w-2 h-2" style={{ background: color }} />
        {pulse && <span className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: color }} />}
      </span>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Quick stat card ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all card-lift"
      style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(108,92,231,0.08)', boxShadow: '0 2px 12px rgba(108,92,231,0.05)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-bold leading-none" style={{ color: '#0A0A1A' }}>{value}</p>
        <p className="text-[10px] mt-0.5 font-medium uppercase tracking-wide" style={{ color: '#94A3B8' }}>{label}</p>
      </div>
    </button>
  );
}

// ── Quick prompts ──────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'Close 10 enterprise deals this month',
  'Reduce support ticket response time to under 2 hours',
  'Launch the new product feature by end of quarter',
  'Grow social media following by 5,000 followers',
];

export default function FreemiCommandCenter() {
  const { company, agents, goals, recentActivity, activeCompanyId, ceoAgent } = useCompany();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const textareaRef = useRef();
  const feedRef = useRef();

  const activeAgents = agents.filter(a => a.status !== AGENT_STATUS.TERMINATED);
  const activeGoals = goals.filter(g => g.status === 'active');

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [recentActivity.length]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [input]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || sending || !activeCompanyId) return;
    setSending(true);
    try {
      // Create a goal from the input — Freemi will break it down into tasks
      const uid = user?.uid || 'user';
      const goalId = await createGoal(activeCompanyId, uid, {
        title: text,
        description: `Goal submitted via FreemiOS Command Center`,
        ownerAgentId: ceoAgent?.id || null,
        priority: 'high',
      });
      await logActivity(activeCompanyId, uid, 'user', 'goal.submitted', goalId, `New goal for Freemi: "${text}"`);
      setInput('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleKey = e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="h-full flex flex-col" style={{ padding: '28px 32px 0' }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 flex-shrink-0">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>{greeting()}</p>
          <h1 className="text-2xl font-bold" style={{ color: '#0A0A1A' }}>
            {company?.name || 'Your Company'}
          </h1>
          <p className="text-sm mt-1 max-w-lg line-clamp-1" style={{ color: '#64748B' }}>
            {company?.mission || 'Set your mission in Settings'}
          </p>
        </div>
        <FreemiStatus agent={ceoAgent} />
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-4 gap-3 mb-6 flex-shrink-0">
        <StatCard icon={Users}    label="Agents"  value={activeAgents.length} color="#6C5CE7" onClick={() => {}} />
        <StatCard icon={Target}   label="Goals"   value={activeGoals.length}  color="#00B894" onClick={() => {}} />
        <StatCard icon={Zap}      label="Tasks"   value="—"                   color="#0984E3" onClick={() => {}} />
        <StatCard icon={BarChart2} label="Spend"  value="$0"                  color="#E17055" onClick={() => {}} />
      </div>

      {/* ── Two-column: input + feed ── */}
      <div className="flex-1 flex gap-6 min-h-0 pb-6">

        {/* Left: Freemi input */}
        <div className="flex flex-col gap-4" style={{ width: '55%', flexShrink: 0 }}>

          {/* Freemi card */}
          <div className="rounded-2xl p-5 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(108,92,231,0.1)', boxShadow: '0 4px 24px rgba(108,92,231,0.08)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center ambient-pulse flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#6C5CE7,#7C6CF7)', boxShadow: '0 6px 20px rgba(108,92,231,0.4)' }}>
                <div className="w-4 h-4 rounded-full bg-white/90" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#0A0A1A' }}>Brief Freemi</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>Tell your CEO what to work on</p>
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="What should the company focus on? e.g. Close 10 enterprise deals, reduce churn by 20%, launch new feature…"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all input-focus-ring"
                style={{
                  background: '#F8FAFF',
                  border: '1.5px solid rgba(108,92,231,0.15)',
                  color: '#0A0A1A',
                  minHeight: 100,
                  lineHeight: 1.7,
                }}
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px]" style={{ color: '#94A3B8' }}>⌘↵ to send</p>
                <button onClick={handleSubmit} disabled={!input.trim() || sending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all btn-press"
                  style={{
                    background: input.trim() ? 'linear-gradient(135deg,#6C5CE7,#7C6CF7)' : '#E2E8F0',
                    boxShadow: input.trim() ? '0 4px 16px rgba(108,92,231,0.35)' : 'none',
                    color: input.trim() ? '#fff' : '#94A3B8',
                  }}>
                  <Send size={13} />
                  {sending ? 'Sending…' : 'Brief Freemi'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {sent && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: 'rgba(0,184,148,0.08)', color: '#00B894', border: '1px solid rgba(0,184,148,0.15)' }}>
                  <Zap size={13} />
                  <span className="font-medium">Freemi received your goal and is on it.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick prompts */}
          <div className="flex-shrink-0">
            <p className="text-xs font-semibold mb-2 px-1" style={{ color: '#94A3B8' }}>Quick goals</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => setInput(p)}
                  className="text-left px-3 py-2.5 rounded-xl text-xs transition-all"
                  style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(108,92,231,0.08)', color: '#64748B' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,92,231,0.25)'; e.currentTarget.style.color = '#6C5CE7'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(108,92,231,0.08)'; e.currentTarget.style.color = '#64748B'; }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Active goals list */}
          {activeGoals.length > 0 && (
            <div className="flex-shrink-0 rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(108,92,231,0.08)' }}>
              <p className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: '#94A3B8' }}>Active Goals</p>
              <div className="space-y-2">
                {activeGoals.slice(0, 4).map(g => (
                  <div key={g.id} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#6C5CE7' }} />
                    <span className="text-sm flex-1 truncate" style={{ color: '#374151' }}>{g.title}</span>
                    <span className="text-[10px]" style={{ color: '#94A3B8' }}>{g.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live activity feed */}
        <div className="flex-1 min-w-0 flex flex-col rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(108,92,231,0.08)', boxShadow: '0 4px 24px rgba(108,92,231,0.06)' }}>
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(108,92,231,0.07)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00B894' }} />
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#374151' }}>Live Activity</p>
            </div>
            <span className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>
              {recentActivity.length} events
            </span>
          </div>

          <div ref={feedRef} className="flex-1 overflow-y-auto px-3 py-2">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <RefreshCw size={24} style={{ color: '#CBD5E1' }} className="mb-2" />
                <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No activity yet</p>
                <p className="text-xs mt-1" style={{ color: '#CBD5E1' }}>Brief Freemi to get started</p>
              </div>
            ) : (
              recentActivity.map(item => (
                <ActivityItem key={item.id} item={item} agents={agents} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
