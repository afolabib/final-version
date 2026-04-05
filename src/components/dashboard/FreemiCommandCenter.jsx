import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paperclip, ArrowUp, TrendingUp, Users, CheckCircle2,
  Zap, Sparkles, X, ArrowRight, Clock, Flag, Bell, RefreshCw, Activity, ChevronDown, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/lib/AuthContext';
import FreemiCharacter from '@/components/FreemiCharacter';
const AGENT_COLORS = ['#5B5FFF','#00B894','#0984E3','#E17055','#FDCB6E','#A29BFE','#74B9FF'];
import { AGENT_STATUS } from '@/lib/agentService';
import { triggerManualHeartbeat } from '@/lib/heartbeatService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function dateString() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// ── Quick action chips ────────────────────────────────────────────────────────

const CHIPS = [
  { emoji: '🎯', text: 'Score leads' },
  { emoji: '✍️', text: 'Compose responses' },
  { emoji: '📅', text: 'Schedule meetings' },
  { emoji: '💬', text: 'Follow-up messages' },
];

// ── Priority config ───────────────────────────────────────────────────────────

const PRIORITY_COLORS = {
  critical: '#EF4444',
  high:     '#F59E0B',
  medium:   '#5B5FFF',
  low:      '#94A3B8',
};

// ── Quick Look Panel ──────────────────────────────────────────────────────────

function QuickLookPanel({ title, items, emptyText, onClose, onViewAll, viewAllPath, renderItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.98)',
        border: '1.5px solid rgba(91,95,255,0.12)',
        boxShadow: '0 24px 64px rgba(91,95,255,0.14), 0 4px 16px rgba(0,0,0,0.06)',
      }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
        <h3 className="font-bold text-sm" style={{ color: '#0A0F1E' }}>{title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.06)'}>
            View all <ArrowRight size={11} />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y" style={{ divideColor: 'rgba(0,0,0,0.04)', maxHeight: 320, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(91,95,255,0.06)' }}>
              <CheckCircle2 size={18} style={{ color: '#CBD5E1' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: '#CBD5E1' }}>{emptyText}</p>
          </div>
        ) : (
          items.slice(0, 6).map((item, i) => (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}>
              {renderItem(item)}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({ task }) {
  const priColor = PRIORITY_COLORS[task.priority] || '#94A3B8';
  const statusColors = {
    todo: { color: '#94A3B8', label: 'To do' },
    in_progress: { color: '#5B5FFF', label: 'In progress' },
    needs_review: { color: '#F59E0B', label: 'Review' },
    done: { color: '#10B981', label: 'Done' },
  };
  const st = statusColors[task.status] || statusColors.todo;

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 transition-colors"
      style={{ cursor: 'default' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.color }} />
      <p className="flex-1 text-sm font-medium truncate" style={{ color: '#0A0F1E' }}>{task.title}</p>
      <div className="flex items-center gap-2 flex-shrink-0">
        {task.priority && (
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
            style={{ background: `${priColor}15`, color: priColor }}>
            {task.priority}
          </span>
        )}
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${st.color}12`, color: st.color }}>
          {st.label}
        </span>
      </div>
    </div>
  );
}

// ── Goal row ──────────────────────────────────────────────────────────────────

function GoalRow({ goal }) {
  const statusColors = {
    active:    { color: '#5B5FFF', label: 'Active' },
    pending:   { color: '#F59E0B', label: 'Pending' },
    completed: { color: '#10B981', label: 'Done' },
    paused:    { color: '#94A3B8', label: 'Paused' },
  };
  const st = statusColors[goal.status] || statusColors.pending;

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 transition-colors"
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <TrendingUp size={13} style={{ color: st.color, flexShrink: 0 }} />
      <p className="flex-1 text-sm font-medium truncate" style={{ color: '#0A0F1E' }}>{goal.title}</p>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ background: `${st.color}12`, color: st.color }}>
        {st.label}
      </span>
    </div>
  );
}

// ── Insight card ──────────────────────────────────────────────────────────────

function InsightCard({ value, label, sub, color, bg, border, icon: Icon, delay = 0, onClick, urgent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer relative overflow-hidden"
      style={{
        background: hovered ? `${color}10` : bg,
        border: `1px solid ${hovered ? `${color}30` : border}`,
        transition: 'background 180ms, border-color 180ms, transform 180ms, box-shadow 180ms',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered
          ? `0 8px 24px ${color}18`
          : urgent ? `0 0 0 2px ${color}20` : 'none',
      }}>

      {/* Urgent pulse ring */}
      {urgent && (
        <span className="absolute inset-0 rounded-2xl animate-ping opacity-10 pointer-events-none"
          style={{ background: color, animationDuration: '2s' }} />
      )}

      <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}>
        <Icon size={16} style={{ color }} strokeWidth={2} />
        {urgent && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
            style={{ background: color }} />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-lg font-bold leading-none mb-0.5"
          style={{ color, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </p>
        <p className="text-xs font-medium leading-tight" style={{ color: '#64748B' }}>
          {label}
          {sub && <span className="opacity-60"> · {sub}</span>}
        </p>
      </div>

      <ArrowRight size={12} style={{
        color: hovered ? color : 'transparent',
        marginLeft: 'auto',
        transition: 'color 180ms',
        flexShrink: 0,
      }} />
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function FreemiCommandCenter() {
  const { company, agents, goals, tasks, pendingApprovals, heartbeats, activeCompanyId, ceoAgent } = useCompany();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);
  const [quickLook, setQuickLook] = useState(null);
  const [pingingHeartbeat, setPingingHeartbeat] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const textareaRef = useRef();

  const activeAgents = agents.filter(a => a.status !== AGENT_STATUS.TERMINATED);

  // Default selection to first agent (Freemi/CEO)
  const selectedAgent = activeAgents.find(a => a.id === selectedAgentId) || activeAgents[0] || null;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setAgentDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const userName = company?.name || '';
  const doneTasks   = tasks.filter(t => t.status === 'done').length;
  const openTasks   = tasks.filter(t => t.status !== 'done');
  const activeGoals = goals.filter(g => g.status === 'active');

  // Real heartbeat data
  const latestHeartbeat = heartbeats?.[0] || null;
  const freemiMachineStatus = ceoAgent?.machineStatus || null;
  const freemiOnline = freemiMachineStatus === 'online';
  const freemiProvisioning = freemiMachineStatus === 'provisioning' || freemiMachineStatus === 'pending';

  const statusText = freemiOnline
    ? `Freemi online · ${activeAgents.length} operator${activeAgents.length !== 1 ? 's' : ''}`
    : freemiProvisioning
      ? 'Freemi starting up…'
      : activeAgents.length > 0
        ? `${activeAgents.length} operator${activeAgents.length !== 1 ? 's' : ''} ready`
        : 'No operators deployed';

  const approvalCount = (pendingApprovals || []).length;

  const handleTriggerHeartbeat = async () => {
    if (!ceoAgent?.id || pingingHeartbeat) return;
    setPingingHeartbeat(true);
    await triggerManualHeartbeat(ceoAgent.id, activeCompanyId);
    setTimeout(() => setPingingHeartbeat(false), 3000);
  };

  function formatHeartbeatTime(hb) {
    if (!hb?.createdAt) return null;
    const ts = hb.createdAt?.toDate ? hb.createdAt.toDate() : new Date(hb.createdAt);
    const mins = Math.round((Date.now() - ts.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  }

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }, [input]);

  // Close quicklook on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') setQuickLook(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const agentParam = selectedAgent ? `&agent=${encodeURIComponent(selectedAgent.name)}` : '';
    navigate(`/dashboard/chat?q=${encodeURIComponent(text)}${agentParam}`);
  };

  const handleKey = e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F7FF 45%, #FAFCFF 100%)' }}>

      {/* Speaking to bar */}
      <div className="flex-shrink-0 px-8 py-2.5 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
        <span className="text-[10px] font-black uppercase tracking-widest flex-shrink-0" style={{ color: '#C7D0E8' }}>
          Speaking to
        </span>

        {/* Dropdown */}
        {activeAgents.length > 0 ? (
          <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button
              onClick={() => setAgentDropdownOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
              style={{
                background: agentDropdownOpen ? 'rgba(91,95,255,0.1)' : 'rgba(91,95,255,0.06)',
                border: '1px solid rgba(91,95,255,0.15)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.1)'}
              onMouseLeave={e => { if (!agentDropdownOpen) e.currentTarget.style.background = 'rgba(91,95,255,0.06)'; }}>
              {selectedAgent ? (() => {
                const idx = activeAgents.findIndex(a => a.id === selectedAgent.id);
                const color = AGENT_COLORS[idx % AGENT_COLORS.length];
                return (
                  <>
                    <div className="relative flex-shrink-0" style={{ width: 22, height: 22, overflow: 'visible' }}>
                      <div style={{ transform: 'scale(0.55)', transformOrigin: 'top left', position: 'absolute', top: -2, left: -1 }}>
                        <FreemiCharacter size="xs" color={color} />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white"
                        style={{ background: selectedAgent.status === 'active' ? '#10B981' : '#FDCB6E' }} />
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color }}>{selectedAgent.name}</span>
                  </>
                );
              })() : (
                <span className="text-[11px] font-semibold" style={{ color: '#94A3B8' }}>Select agent</span>
              )}
              <ChevronDown size={11} style={{ color: '#94A3B8', transform: agentDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            {/* Menu */}
            <AnimatePresence>
              {agentDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-1.5 rounded-xl overflow-hidden z-50"
                  style={{
                    minWidth: 200,
                    background: '#fff',
                    border: '1px solid rgba(91,95,255,0.12)',
                    boxShadow: '0 8px 32px rgba(91,95,255,0.14), 0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                  {activeAgents.map((agent, i) => {
                    const color = AGENT_COLORS[i % AGENT_COLORS.length];
                    const isSelected = selectedAgent?.id === agent.id;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => { setSelectedAgentId(agent.id); setAgentDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                        style={{ background: isSelected ? 'rgba(91,95,255,0.05)' : 'transparent' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
                        <div className="relative flex-shrink-0" style={{ width: 32, height: 32, overflow: 'visible' }}>
                          <div style={{ transform: 'scale(0.75)', transformOrigin: 'top left', position: 'absolute', top: -2, left: -1 }}>
                            <FreemiCharacter size="xs" color={color} />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white"
                            style={{ background: agent.status === 'active' ? '#10B981' : '#FDCB6E' }} />
                        </div>
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
          <span className="text-xs font-medium" style={{ color: '#CBD5E1' }}>No operators yet</span>
        )}
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 overflow-y-auto">

        {/* Freemi avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 relative flex flex-col items-center">
          <div className="absolute inset-0 scale-[1.4] rounded-full"
            style={{ background: `radial-gradient(circle, ${(AGENT_COLORS[activeAgents.findIndex(a=>a.id===selectedAgent?.id)%AGENT_COLORS.length] || '#5B5FFF')}1F 0%, transparent 70%)`, filter: 'blur(12px)', transition: 'background 0.4s' }} />
          <FreemiCharacter size="sm" color={AGENT_COLORS[activeAgents.findIndex(a=>a.id===selectedAgent?.id) % AGENT_COLORS.length] || '#5B5FFF'} />
        </motion.div>

        {/* Serif greeting */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="heading-serif font-bold tracking-tight text-center mb-1.5"
          style={{
            fontSize: 'clamp(2rem, 3.8vw, 3rem)',
            color: '#0A0F1E',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}>
          {greeting()}{userName ? `, ${userName}` : ''}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="text-sm mb-7 text-center font-medium"
          style={{ color: '#94A3B8', letterSpacing: '0.01em' }}>
          {dateString()} · {statusText}
        </motion.p>

        {/* ── Freemi live status bar ── */}
        {(freemiOnline || freemiProvisioning || latestHeartbeat) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="w-full max-w-2xl mb-4 flex items-center gap-3 px-4 py-2.5 rounded-2xl"
            style={{
              background: freemiOnline ? 'rgba(16,185,129,0.06)' : 'rgba(91,95,255,0.05)',
              border: `1px solid ${freemiOnline ? 'rgba(16,185,129,0.15)' : 'rgba(91,95,255,0.10)'}`,
            }}>
            {/* Status dot */}
            <span className="relative flex-shrink-0" style={{ width: 8, height: 8 }}>
              <span className="block w-2 h-2 rounded-full"
                style={{ background: freemiOnline ? '#10B981' : freemiProvisioning ? '#FDCB6E' : '#CBD5E1' }} />
              {(freemiOnline || freemiProvisioning) && (
                <span className="absolute inset-0 rounded-full animate-ping opacity-50"
                  style={{ background: freemiOnline ? '#10B981' : '#FDCB6E' }} />
              )}
            </span>

            {/* Last heartbeat summary */}
            <div className="flex-1 min-w-0">
              {latestHeartbeat ? (
                <p className="text-xs truncate" style={{ color: '#374151' }}>
                  <span className="font-semibold" style={{ color: '#5B5FFF' }}>Freemi</span>
                  {' '}· {latestHeartbeat.summary || 'Heartbeat completed'}
                  {latestHeartbeat.decisionsCount > 0 && (
                    <span className="ml-1.5 font-semibold" style={{ color: '#10B981' }}>
                      +{latestHeartbeat.decisionsCount} action{latestHeartbeat.decisionsCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-xs" style={{ color: '#94A3B8' }}>
                  {freemiProvisioning ? 'Freemi is starting up, first heartbeat coming soon…' : 'Awaiting first heartbeat'}
                </p>
              )}
            </div>

            {/* Time + trigger button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {latestHeartbeat && (
                <span className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>
                  {formatHeartbeatTime(latestHeartbeat)}
                </span>
              )}
              {freemiOnline && (
                <button
                  onClick={handleTriggerHeartbeat}
                  disabled={pingingHeartbeat}
                  title="Trigger Freemi heartbeat now"
                  className="p-1.5 rounded-lg transition-all disabled:opacity-50"
                  style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.08)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.08)'}>
                  <RefreshCw size={12} className={pingingHeartbeat ? 'animate-spin' : ''} />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Pending Approvals pill — only shown when there are approvals ── */}
        <AnimatePresence>
          {approvalCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6">
              <button
                onClick={() => setQuickLook(v => v === 'approvals' ? null : 'approvals')}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all"
                style={{
                  background: quickLook === 'approvals' ? 'rgba(245,158,11,0.10)' : 'rgba(245,158,11,0.07)',
                  border: `1.5px solid ${quickLook === 'approvals' ? 'rgba(245,158,11,0.35)' : 'rgba(245,158,11,0.22)'}`,
                  boxShadow: quickLook === 'approvals' ? '0 4px 20px rgba(245,158,11,0.15)' : 'none',
                }}>
                {/* Pulsing dot */}
                <span className="relative flex-shrink-0" style={{ width: 10, height: 10 }}>
                  <span className="block w-2.5 h-2.5 rounded-full" style={{ background: '#F59E0B' }} />
                  <span className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ background: '#F59E0B' }} />
                </span>
                <span className="text-sm font-semibold" style={{ color: '#B45309' }}>
                  {approvalCount} pending approval{approvalCount !== 1 ? 's' : ''} waiting for your sign-off
                </span>
                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#B45309' }}>
                  {quickLook === 'approvals' ? 'Close ↑' : 'Review →'}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Approvals Quick Look ── */}
        <AnimatePresence>
          {quickLook === 'approvals' && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl mb-5 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.99)',
                border: '1.5px solid rgba(245,158,11,0.18)',
                boxShadow: '0 20px 60px rgba(245,158,11,0.10), 0 4px 16px rgba(0,0,0,0.06)',
              }}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(245,158,11,0.10)' }}>
                <div className="flex items-center gap-2.5">
                  <Bell size={14} style={{ color: '#F59E0B' }} />
                  <span className="font-bold text-sm" style={{ color: '#0A0F1E' }}>
                    Pending Approvals
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#B45309' }}>
                    {approvalCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setQuickLook(null); navigate('/dashboard/inbox'); }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.08)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}>
                    View all <ArrowRight size={11} />
                  </button>
                  <button
                    onClick={() => setQuickLook(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: '#94A3B8' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Approval items */}
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {pendingApprovals.length === 0 ? (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-sm font-medium" style={{ color: '#CBD5E1' }}>Nothing pending</p>
                  </div>
                ) : (
                  pendingApprovals.slice(0, 6).map((approval, i) => (
                    <motion.div
                      key={approval.id || i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.2 }}
                      className="flex items-center gap-4 px-5 py-4 transition-colors"
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(245,158,11,0.10)' }}>
                        <Bell size={14} style={{ color: '#F59E0B' }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#0A0F1E' }}>
                          {approval.title || 'Approval request'}
                        </p>
                        {approval.description && (
                          <p className="text-xs mt-0.5 truncate" style={{ color: '#94A3B8' }}>
                            {approval.description}
                          </p>
                        )}
                      </div>

                      {/* Review button */}
                      <button
                        onClick={() => { setQuickLook(null); navigate('/dashboard/inbox'); }}
                        className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(245,158,11,0.10)', color: '#B45309' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.20)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.10)'}>
                        Review
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Command box ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: activeAgents.length > 0 ? 0.32 : 0.2 }}
          className="w-full max-w-2xl rounded-2xl mb-5 input-focus-ring"
          style={{
            background: 'rgba(255,255,255,0.97)',
            border: focused ? '1.5px solid rgba(91,95,255,0.28)' : '1.5px solid rgba(91,95,255,0.09)',
            boxShadow: focused
              ? '0 0 0 4px rgba(91,95,255,0.07), 0 8px 32px rgba(91,95,255,0.10)'
              : '0 4px 24px rgba(91,95,255,0.06)',
            transition: 'border-color 200ms, box-shadow 200ms',
          }}>

          <div className="px-5 pt-5 pb-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="What would you like Freemi to handle?"
              className="w-full text-sm outline-none resize-none bg-transparent leading-relaxed"
              style={{
                color: '#0A0F1E',
                caretColor: '#5B5FFF',
                minHeight: 60,
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-1.5">
              <button className="p-2 rounded-xl transition-colors"
                style={{ color: '#CBD5E1' }}
                onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
                onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}>
                <Paperclip size={13} />
              </button>
              <span className="text-[11px] font-medium" style={{ color: '#CBD5E1' }}>⌘K focus · ⌘↵ send</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!input.trim() || sending}
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

        {/* Sent confirmation */}
        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm mb-4"
              style={{
                background: 'rgba(16,185,129,0.08)',
                color: '#10B981',
                border: '1px solid rgba(16,185,129,0.2)',
              }}>
              <CheckCircle2 size={13} strokeWidth={2.5} />
              <span className="font-semibold">Freemi is on it.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick action chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="flex flex-wrap gap-2 justify-center max-w-xl">
          {CHIPS.map(c => (
            <button key={c.text} onClick={() => navigate(`/dashboard/chat?q=${encodeURIComponent(c.text)}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1.5px solid rgba(91,95,255,0.09)',
                color: '#374151',
                boxShadow: '0 2px 8px rgba(91,95,255,0.05)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(91,95,255,0.28)';
                e.currentTarget.style.background = 'rgba(91,95,255,0.04)';
                e.currentTarget.style.color = '#5B5FFF';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,95,255,0.10)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(91,95,255,0.09)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.92)';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(91,95,255,0.05)';
              }}>
              <span>{c.emoji}</span>
              {c.text}
            </button>
          ))}
        </motion.div>

        {/* Deploy CTA */}
        {activeAgents.length === 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            onClick={() => navigate('/dashboard/agents')}
            className="mt-8 flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white transition-all btn-press btn-breathe"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #2563EB)' }}>
            Deploy your first operator →
          </motion.button>
        )}

        {/* Stats strip */}
        {activeAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex items-center gap-6 mt-6">
            {[
              {
                icon: Users,
                label: `${activeAgents.length} operator${activeAgents.length !== 1 ? 's' : ''}`,
                onClick: () => navigate('/dashboard/agents'),
                active: false,
              },
              {
                icon: TrendingUp,
                label: `${activeGoals.length} goal${activeGoals.length !== 1 ? 's' : ''}`,
                onClick: () => setQuickLook(v => v === 'goals' ? null : 'goals'),
                active: quickLook === 'goals',
              },
              {
                icon: Zap,
                label: `${openTasks.length} open task${openTasks.length !== 1 ? 's' : ''}`,
                onClick: () => navigate('/dashboard/projects'),
                active: false,
              },
            ].map(s => (
              <button key={s.label} onClick={s.onClick}
                className="flex items-center gap-1.5 text-xs font-semibold transition-all"
                style={{
                  color: s.active ? '#5B5FFF' : '#94A3B8',
                  borderBottom: s.active ? '1.5px solid #5B5FFF' : '1.5px solid transparent',
                  paddingBottom: 2,
                }}
                onMouseEnter={e => { if (!s.active) e.currentTarget.style.color = '#5B5FFF'; }}
                onMouseLeave={e => { if (!s.active) e.currentTarget.style.color = '#94A3B8'; }}>
                <s.icon size={12} />
                {s.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
