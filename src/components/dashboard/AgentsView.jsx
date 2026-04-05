import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, MessageSquare, CheckCircle2, Activity, Plus, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '@/contexts/CompanyContext';
import { AGENT_STATUS, ROLE_COLORS } from '@/lib/agentService';
import AgentConfigModal from './AgentConfigModal';

// ── Presence / status config ──────────────────────────────────────────────────

const STATUS_CONFIG = {
  [AGENT_STATUS.ACTIVE]: {
    label: 'Active',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    pulse: true,
  },
  [AGENT_STATUS.SLEEPING]: {
    label: 'Idle',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    pulse: false,
  },
  [AGENT_STATUS.PAUSED]: {
    label: 'Paused',
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.2)',
    pulse: false,
  },
  [AGENT_STATUS.ERROR]: {
    label: 'Error',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    pulse: true,
  },
  [AGENT_STATUS.PENDING_APPROVAL]: {
    label: 'Pending',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.2)',
    pulse: true,
  },
};

// ── Emoji per role ────────────────────────────────────────────────────────────

const ROLE_EMOJI = {
  ceo:        '🧠',
  sales:      '🤝',
  support:    '🎧',
  marketing:  '📣',
  operations: '⚙️',
  finance:    '📊',
  engineering:'💻',
  research:   '🔬',
  hr:         '👥',
  legal:      '⚖️',
  product:    '🎯',
  design:     '🎨',
  default:    '🤖',
};

function getRoleEmoji(agent) {
  const role = agent.role?.toLowerCase() || 'default';
  return ROLE_EMOJI[role] || ROLE_EMOJI.default;
}

// ── Activity descriptors per role ─────────────────────────────────────────────

const ROLE_ACTIVITY = {
  ceo: ['Reviewing company strategy', 'Delegating tasks', 'Monitoring KPIs'],
  sales: ['Scoring new leads', 'Sending follow-ups', 'Updating CRM'],
  support: ['Resolving tickets', 'Drafting replies', 'Monitoring inbox'],
  marketing: ['Scheduling content', 'Analyzing metrics', 'Creating campaigns'],
  operations: ['Running workflows', 'Processing data', 'Monitoring systems'],
  default: ['Processing tasks', 'Monitoring activity', 'Standing by'],
};

function getActivity(agent) {
  const role = agent.role?.toLowerCase() || 'default';
  const pool = ROLE_ACTIVITY[role] || ROLE_ACTIVITY.default;
  if (agent.status === AGENT_STATUS.ACTIVE) return pool[0];
  if (agent.status === AGENT_STATUS.SLEEPING) return 'Standing by';
  if (agent.status === AGENT_STATUS.PAUSED)   return 'Paused by operator';
  if (agent.status === AGENT_STATUS.ERROR)    return 'Needs attention';
  return 'Initialising…';
}

// ── Fake micro-stats per agent (illustrative) ─────────────────────────────────

function agentStats(agent, index) {
  const base = (index + 1) * 3;
  return {
    tasks: agent.status === AGENT_STATUS.ACTIVE ? base + 4 : 0,
    messages: agent.status === AGENT_STATUS.ACTIVE ? base + 2 : 0,
    uptime: agent.status !== AGENT_STATUS.TERMINATED ? `${92 + (index % 7)}%` : '—',
  };
}

// ── Agent card ────────────────────────────────────────────────────────────────

function AgentCard({ agent, index, onView }) {
  const [hovered, setHovered] = useState(false);
  const color = ROLE_COLORS[agent.role] || '#5B5FFF';
  const emoji = getRoleEmoji(agent);
  const cfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG[AGENT_STATUS.PAUSED];
  const activity = getActivity(agent);
  const stats = agentStats(agent, index);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden flex flex-col cursor-pointer"
      style={{
        background: '#fff',
        border: hovered ? '1px solid rgba(91,95,255,0.18)' : '1px solid rgba(91,95,255,0.08)',
        boxShadow: hovered
          ? '0 16px 48px rgba(91,95,255,0.11), 0 4px 12px rgba(0,0,0,0.04)'
          : '0 2px 12px rgba(91,95,255,0.05), 0 1px 3px rgba(0,0,0,0.03)',
        transition: 'border-color 200ms, box-shadow 220ms, transform 220ms',
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}
      onClick={onView}>

      {/* Coloured header strip */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Top row: avatar + status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${color}18, ${color}10)`,
                  border: `1px solid ${color}30`,
                  boxShadow: `0 4px 12px ${color}20`,
                }}>
                {emoji}
              </div>
              {/* Presence dot */}
              <span className="absolute -bottom-0.5 -right-0.5 flex"
                style={{ width: 10, height: 10 }}>
                <span className="block rounded-full w-2.5 h-2.5 border-2 border-white"
                  style={{ background: cfg.color }} />
                {cfg.pulse && (
                  <span className="absolute inset-0 rounded-full animate-ping opacity-50"
                    style={{ background: cfg.color }} />
                )}
              </span>
            </div>

            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight truncate" style={{ color: '#0A0F1E' }}>
                {agent.name}
              </p>
              <p className="text-xs capitalize mt-0.5" style={{ color: '#94A3B8', fontWeight: 500 }}>
                {agent.role || 'Operator'}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
            }}>
            {cfg.label}
          </span>
        </div>

        {/* Activity line */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
          style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.07)' }}>
          <Activity size={11} style={{ color: '#5B5FFF', flexShrink: 0 }} />
          <span className="text-xs font-medium truncate" style={{ color: '#5B5FFF' }}>
            {activity}
          </span>
        </div>

        {/* Micro-stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Tasks', value: stats.tasks, icon: CheckCircle2, color: '#5B5FFF' },
            { label: 'Messages', value: stats.messages, icon: MessageSquare, color: '#0EA5E9' },
            { label: 'Uptime', value: stats.uptime, icon: Zap, color: '#10B981' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2.5 text-center"
              style={{ background: 'rgba(248,250,255,0.8)', border: '1px solid rgba(91,95,255,0.06)' }}>
              <s.icon size={10} style={{ color: s.color, margin: '0 auto 3px' }} />
              <p className="text-sm font-bold leading-none mb-0.5"
                style={{ color: '#0A0F1E', fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* View button */}
        <button
          className="mt-auto w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
          style={{
            background: hovered ? 'rgba(91,95,255,0.07)' : 'rgba(91,95,255,0.04)',
            color: '#5B5FFF',
            border: '1px solid rgba(91,95,255,0.12)',
          }}>
          View operator
          <ArrowUpRight size={11} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Deploy card ───────────────────────────────────────────────────────────────

function DeployCard({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="rounded-2xl flex flex-col items-center justify-center gap-3 py-12 transition-all"
      style={{
        background: hovered ? 'rgba(91,95,255,0.04)' : 'rgba(255,255,255,0.6)',
        border: `2px dashed ${hovered ? 'rgba(91,95,255,0.3)' : 'rgba(91,95,255,0.15)'}`,
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'all 220ms',
      }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{
          background: hovered ? 'rgba(91,95,255,0.1)' : 'rgba(91,95,255,0.06)',
          transition: 'background 220ms',
        }}>
        <Plus size={20} style={{ color: '#5B5FFF' }} strokeWidth={2} />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold" style={{ color: '#5B5FFF' }}>Deploy new operator</p>
        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Choose from templates or build custom</p>
      </div>
    </motion.button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AgentsView({ onDeploy }) {
  const navigate = useNavigate();
  const { agents } = useCompany();
  const [configAgent, setConfigAgent] = useState(null);
  const visibleAgents = (agents || []).filter(a => a.status !== AGENT_STATUS.TERMINATED);
  const activeCount = visibleAgents.filter(a => a.status === AGENT_STATUS.ACTIVE).length;

  return (
    <div className="h-full flex flex-col overflow-y-auto px-6 md:px-8 py-6 md:py-8"
      style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F7FF 45%, #FAFCFF 100%)' }}>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="heading-serif text-3xl font-bold tracking-tight" style={{ color: '#0A0F1E' }}>
            Operators
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: '#64748B' }}>
            {visibleAgents.length > 0
              ? `${visibleAgents.length} deployed · ${activeCount} active right now`
              : 'Your AI workforce — deploy your first operator to get started'}
          </p>
        </div>

        {visibleAgents.length > 0 && (
          <button
            onClick={onDeploy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all btn-press"
            style={{
              background: 'linear-gradient(135deg, #5B5FFF, #2563EB)',
              boxShadow: '0 4px 14px rgba(91,95,255,0.35)',
            }}>
            <Plus size={14} />
            New operator
          </button>
        )}
      </motion.div>

      {/* Empty state */}
      {visibleAgents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 float"
            style={{
              background: 'linear-gradient(135deg, #5B5FFF, #2563EB)',
              boxShadow: '0 12px 40px rgba(91,95,255,0.35)',
            }}>
            <Sparkles size={32} color="#fff" strokeWidth={1.5} />
          </div>
          <h2 className="heading-serif text-2xl font-bold mb-2" style={{ color: '#0A0F1E' }}>
            Your AI workforce awaits
          </h2>
          <p className="text-sm max-w-sm mb-8" style={{ color: '#64748B', lineHeight: 1.7 }}>
            Deploy intelligent operators that work 24/7 — handling emails, scoring leads,
            managing tasks, and more.
          </p>
          <button
            onClick={onDeploy}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white btn-press btn-breathe"
            style={{
              background: 'linear-gradient(135deg, #5B5FFF, #2563EB)',
            }}>
            <Sparkles size={15} />
            Deploy your first operator
          </button>
        </motion.div>
      )}

      {/* Agents grid */}
      {visibleAgents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleAgents.map((agent, i) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              index={i}
              onView={() => setConfigAgent(agent)}
            />
          ))}
          <DeployCard onClick={onDeploy} />
        </div>
      )}

      <AnimatePresence>
        {configAgent && (
          <AgentConfigModal agent={configAgent} onClose={() => setConfigAgent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
