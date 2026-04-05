import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp, ArrowRight, CheckCircle2, AlertTriangle,
  Clock, RefreshCw, ChevronDown, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/lib/AuthContext';
import FreemiCharacter from '@/components/FreemiCharacter';
import { AGENT_STATUS } from '@/lib/agentService';
import { triggerManualHeartbeat } from '@/lib/heartbeatService';

const AGENT_COLORS = ['#5B5FFF','#00B894','#0984E3','#E17055','#FDCB6E','#A29BFE','#74B9FF'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function dateString() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// ── Priority feed item ────────────────────────────────────────────────────────
function FeedItem({ color, bg, border, icon: Icon, title, sub, cta, onCta, urgent, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl relative overflow-hidden"
      style={{
        background: hovered ? `${color}0D` : bg,
        border: `1.5px solid ${hovered ? `${color}35` : border}`,
        transition: 'background 180ms, border-color 180ms, transform 180ms, box-shadow 180ms',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: urgent
          ? `0 0 0 2px ${color}18, ${hovered ? `0 8px 24px ${color}18` : 'none'}`
          : hovered ? `0 6px 20px ${color}14` : 'none',
      }}>
      {urgent && (
        <span className="absolute inset-0 rounded-2xl animate-ping opacity-[0.06] pointer-events-none"
          style={{ background: color, animationDuration: '2.5s' }} />
      )}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}>
        <Icon size={16} style={{ color }} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight" style={{ color: '#0A0F1E' }}>{title}</p>
        {sub && <p className="text-xs mt-0.5 truncate" style={{ color: '#94A3B8' }}>{sub}</p>}
      </div>
      {cta && (
        <button
          onClick={onCta}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: `${color}12`, color }}
          onMouseEnter={e => e.currentTarget.style.background = `${color}22`}
          onMouseLeave={e => e.currentTarget.style.background = `${color}12`}>
          {cta} <ArrowRight size={11} />
        </button>
      )}
    </motion.div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ value, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center px-5 py-3 rounded-2xl transition-all"
      style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(91,95,255,0.08)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.97)'; e.currentTarget.style.borderColor = `${color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.75)'; e.currentTarget.style.borderColor = 'rgba(91,95,255,0.08)'; }}>
      <span className="text-xl font-black leading-none" style={{ color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span className="text-[10px] font-semibold mt-0.5" style={{ color: '#94A3B8' }}>{label}</span>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FreemiCommandCenter() {
  const { company, agents, goals, tasks, pendingApprovals, heartbeats, activeCompanyId, ceoAgent } = useCompany();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const [pingingHeartbeat, setPingingHeartbeat] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const textareaRef = useRef();

  const activeAgents = agents.filter(a => a.status !== AGENT_STATUS.TERMINATED);
  const selectedAgent = activeAgents.find(a => a.id === selectedAgentId) || activeAgents[0] || null;

  useEffect(() => {
    const handler = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setAgentDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [input]);

  const userName = user?.displayName || user?.email?.split('@')[0] || '';
  const firstNameDisplay = userName ? `, ${userName.split(' ')[0]}` : '';

  const approvalCount = (pendingApprovals || []).length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const openTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length;
  const activeGoals = goals.filter(g => g.status === 'active');
  const blockedGoals = goals.filter(g => g.status === 'blocked');

  const latestHeartbeat = heartbeats?.[0] || null;
  const freemiMachineStatus = ceoAgent?.machineStatus || null;
  const freemiOnline = freemiMachineStatus === 'online';

  // Build priority feed — max 3 items, most urgent first
  const feedItems = [];

  if (approvalCount > 0) {
    feedItems.push({
      id: 'approvals',
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.05)',
      border: 'rgba(245,158,11,0.18)',
      icon: AlertTriangle,
      title: `${approvalCount} approval${approvalCount !== 1 ? 's' : ''} waiting for your sign-off`,
      sub: pendingApprovals[0]?.title || 'Agent needs your decision to continue',
      cta: 'Resolve',
      onCta: () => navigate('/dashboard/inbox'),
      urgent: true,
    });
  }

  if (blockedGoals.length > 0) {
    feedItems.push({
      id: 'blocked',
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.04)',
      border: 'rgba(239,68,68,0.14)',
      icon: AlertTriangle,
      title: `${blockedGoals.length} project${blockedGoals.length !== 1 ? 's' : ''} blocked`,
      sub: blockedGoals[0]?.title || 'Needs attention',
      cta: 'View',
      onCta: () => navigate('/dashboard/projects'),
      urgent: true,
    });
  }

  if (doneTasks > 0 && feedItems.length < 3) {
    feedItems.push({
      id: 'done',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.04)',
      border: 'rgba(16,185,129,0.12)',
      icon: CheckCircle2,
      title: `${doneTasks} task${doneTasks !== 1 ? 's' : ''} completed`,
      sub: latestHeartbeat?.summary || 'Your team has been busy',
      cta: 'Review',
      onCta: () => navigate('/dashboard/projects'),
      urgent: false,
    });
  }

  if (activeGoals.length > 0 && feedItems.length < 3) {
    feedItems.push({
      id: 'goals',
      color: '#5B5FFF',
      bg: 'rgba(91,95,255,0.04)',
      border: 'rgba(91,95,255,0.10)',
      icon: Clock,
      title: `${activeGoals.length} active project${activeGoals.length !== 1 ? 's' : ''} in progress`,
      sub: activeGoals[0]?.title || 'Work underway',
      cta: 'View',
      onCta: () => navigate('/dashboard/projects'),
      urgent: false,
    });
  }

  // If nothing to show, show a calm "all good" state
  const allClear = feedItems.length === 0;

  const handleTriggerHeartbeat = async () => {
    if (!ceoAgent?.id || pingingHeartbeat) return;
    setPingingHeartbeat(true);
    await triggerManualHeartbeat(ceoAgent.id, activeCompanyId);
    setTimeout(() => setPingingHeartbeat(false), 3000);
  };

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    const agentParam = selectedAgent ? `&agent=${encodeURIComponent(selectedAgent.name)}` : '';
    navigate(`/dashboard/chat?q=${encodeURIComponent(text)}${agentParam}`);
  };

  const handleKey = e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>

      {/* ── Top summary bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-shrink-0 flex items-center justify-between px-8 py-3"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>

        <div className="flex items-center gap-2">
          {/* Freemi status dot */}
          <span className="relative flex-shrink-0" style={{ width: 8, height: 8 }}>
            <span className="block w-2 h-2 rounded-full"
              style={{ background: freemiOnline ? '#10B981' : activeAgents.length > 0 ? '#F59E0B' : '#CBD5E1' }} />
            {(freemiOnline || activeAgents.length > 0) && (
              <span className="absolute inset-0 rounded-full animate-ping opacity-40"
                style={{ background: freemiOnline ? '#10B981' : '#F59E0B' }} />
            )}
          </span>
          <span className="text-xs font-semibold" style={{ color: '#94A3B8' }}>
            {freemiOnline
              ? `Freemi online · ${activeAgents.length} operator${activeAgents.length !== 1 ? 's' : ''}`
              : activeAgents.length > 0
                ? `${activeAgents.length} operator${activeAgents.length !== 1 ? 's' : ''} ready`
                : 'No operators deployed'}
          </span>
          {freemiOnline && (
            <button
              onClick={handleTriggerHeartbeat}
              disabled={pingingHeartbeat}
              title="Trigger heartbeat now"
              className="p-1 rounded-lg transition-all disabled:opacity-50"
              style={{ color: '#C7D0E8' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#5B5FFF'; e.currentTarget.style.background = 'rgba(91,95,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#C7D0E8'; e.currentTarget.style.background = 'transparent'; }}>
              <RefreshCw size={11} className={pingingHeartbeat ? 'animate-spin' : ''} />
            </button>
          )}
        </div>

        <span className="text-xs font-medium" style={{ color: '#C7D0E8' }}>{dateString()}</span>
      </motion.div>

      {/* ── Main scrollable content ── */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 py-10">
        <div className="w-full max-w-xl flex flex-col gap-8">

          {/* ── Greeting ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <h1 className="heading-serif font-bold tracking-tight"
              style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)', color: '#0A0F1E', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              {greeting()}{firstNameDisplay}.
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: '#94A3B8' }}>
              {allClear ? "You're all caught up. Here's what's active." : "Here's what needs your attention."}
            </p>
          </motion.div>

          {/* ── Stats row ── */}
          {activeAgents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-3 gap-3">
              <StatPill value={approvalCount} label="waiting" color="#F59E0B" onClick={() => navigate('/dashboard/inbox')} />
              <StatPill value={activeAgents.length} label="active" color="#5B5FFF" onClick={() => navigate('/dashboard/agents')} />
              <StatPill value={openTasks} label="open tasks" color="#10B981" onClick={() => navigate('/dashboard/projects')} />
            </motion.div>
          )}

          {/* ── Priority feed ── */}
          <div className="flex flex-col gap-3">
            {feedItems.slice(0, 3).map((item, i) => (
              <FeedItem key={item.id} {...item} delay={0.15 + i * 0.07} />
            ))}

            {allClear && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl"
                style={{ background: 'rgba(16,185,129,0.05)', border: '1.5px solid rgba(16,185,129,0.12)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.12)' }}>
                  <CheckCircle2 size={16} style={{ color: '#10B981' }} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0A0F1E' }}>All clear — nothing needs you right now</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Your team is working. Use the input below to assign new work.</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Command input ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="rounded-2xl input-focus-ring"
            style={{
              background: 'rgba(255,255,255,0.97)',
              border: focused ? '1.5px solid rgba(91,95,255,0.28)' : '1.5px solid rgba(91,95,255,0.09)',
              boxShadow: focused
                ? '0 0 0 4px rgba(91,95,255,0.07), 0 8px 32px rgba(91,95,255,0.10)'
                : '0 4px 24px rgba(91,95,255,0.06)',
              transition: 'border-color 200ms, box-shadow 200ms',
            }}>

            {/* Agent selector */}
            <div className="flex items-center gap-2.5 px-4 pt-3 pb-1">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#C7D0E8' }}>Tell</span>
              {activeAgents.length > 0 ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAgentDropdownOpen(o => !o)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all"
                    style={{
                      background: agentDropdownOpen ? 'rgba(91,95,255,0.10)' : 'rgba(91,95,255,0.06)',
                      border: '1px solid rgba(91,95,255,0.15)',
                    }}>
                    {selectedAgent ? (() => {
                      const idx = activeAgents.findIndex(a => a.id === selectedAgent.id);
                      const color = AGENT_COLORS[idx % AGENT_COLORS.length];
                      return (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: `${color}30`, border: `1.5px solid ${color}` }} />
                          <span className="text-[11px] font-semibold" style={{ color }}>{selectedAgent.name}</span>
                        </>
                      );
                    })() : (
                      <span className="text-[11px] font-semibold" style={{ color: '#94A3B8' }}>Select</span>
                    )}
                    <ChevronDown size={10} style={{ color: '#94A3B8', transform: agentDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                  </button>

                  <AnimatePresence>
                    {agentDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-1.5 rounded-xl overflow-hidden z-50"
                        style={{
                          minWidth: 180,
                          background: '#fff',
                          border: '1px solid rgba(91,95,255,0.12)',
                          boxShadow: '0 8px 32px rgba(91,95,255,0.14)',
                        }}>
                        {activeAgents.map((agent, i) => {
                          const color = AGENT_COLORS[i % AGENT_COLORS.length];
                          const isSelected = selectedAgent?.id === agent.id;
                          return (
                            <button
                              key={agent.id}
                              onClick={() => { setSelectedAgentId(agent.id); setAgentDropdownOpen(false); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                              style={{ background: isSelected ? 'rgba(91,95,255,0.05)' : 'transparent' }}
                              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
                              <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: `${color}25`, border: `1.5px solid ${color}` }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate" style={{ color: '#0A0F1E' }}>{agent.name}</p>
                                <p className="text-[10px] truncate" style={{ color: '#94A3B8' }}>{agent.jobTitle || agent.role || 'AI Operator'}</p>
                              </div>
                              {isSelected && <Check size={12} style={{ color: '#5B5FFF', flexShrink: 0 }} />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <span className="text-xs font-medium" style={{ color: '#CBD5E1' }}>your team</span>
              )}
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#C7D0E8' }}>to…</span>
            </div>

            <div className="px-5 pt-1 pb-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Write a blog post about our new feature launch…"
                className="w-full text-sm outline-none resize-none bg-transparent leading-relaxed"
                style={{
                  color: '#0A0F1E',
                  caretColor: '#5B5FFF',
                  minHeight: 52,
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                }}
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
              <span className="text-[11px] font-medium" style={{ color: '#CBD5E1' }}>⌘↵ send</span>
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all btn-press disabled:opacity-40"
                style={{
                  background: input.trim() ? 'linear-gradient(135deg, #5B5FFF, #2563EB)' : '#E2E8F0',
                  boxShadow: input.trim() ? '0 4px 14px rgba(91,95,255,0.40)' : 'none',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                }}>
                <ArrowUp size={14} style={{ color: input.trim() ? '#fff' : '#94A3B8' }} />
              </button>
            </div>
          </motion.div>

          {/* ── Deploy CTA (no agents yet) ── */}
          {activeAgents.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="flex flex-col items-center gap-3 pt-2">
              <p className="text-xs font-medium text-center" style={{ color: '#C7D0E8' }}>
                No operators deployed yet
              </p>
              <button
                onClick={() => navigate('/dashboard/agents')}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white transition-all btn-press btn-breathe"
                style={{ background: 'linear-gradient(135deg, #5B5FFF, #2563EB)', boxShadow: '0 6px 20px rgba(91,95,255,0.35)' }}>
                Deploy your first operator →
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
