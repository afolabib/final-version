import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Sparkles, X, RefreshCw, Monitor,
  Users, Settings, Zap,
  CheckCircle2, Clock, Maximize2, Copy, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useCompany } from '@/contexts/CompanyContext';
import FreemiCharacter from '@/components/FreemiCharacter';
import ChatInput from './ChatInput';

// ── Agent definitions ─────────────────────────────────────────────────────────
const AGENTS = [
  { id: 'freemi', name: 'Freemi', role: 'AI Chief Executive', color: '#5B5FFF', emoji: '🤖', gradient: 'linear-gradient(135deg,#5B5FFF,#6B63FF)' },
  { id: 'rex',    name: 'Rex',    role: 'Sales Operator',     color: '#00B894', emoji: '🎯', gradient: 'linear-gradient(135deg,#00B894,#00CEC9)' },
  { id: 'echo',   name: 'Echo',   role: 'Support Operator',   color: '#0984E3', emoji: '💬', gradient: 'linear-gradient(135deg,#0984E3,#74B9FF)' },
  { id: 'dev',    name: 'Dev',    role: 'Engineering Operator',color: '#E17055', emoji: '⚙️', gradient: 'linear-gradient(135deg,#E17055,#FDCB6E)' },
  { id: 'nova',   name: 'Nova',   role: 'Ops Operator',       color: '#A29BFE', emoji: '📊', gradient: 'linear-gradient(135deg,#A29BFE,#6C5CE7)' },
];

const FREEMI_REPLIES = [
  "Got it. I'm breaking that into tasks and assigning the right agents now. You'll have an update within the hour.",
  "On it. I've briefed Rex and Echo — they're starting immediately. I'll keep you posted on progress.",
  "Great goal. I've analyzed your current pipeline and I think the fastest path forward is to have Nova pull the data first, then Rex can act on it. Starting now.",
  "Understood. I've prioritised this above the current queue and notified your team. Expect a status update in your inbox shortly.",
  "Perfect. I'm coordinating with Dev to unblock this — there's a dependency on the API integration that he'll handle first.",
];

const QUICK_CHIPS = [
  { emoji: '📊', text: 'Summarize today\'s activity' },
  { emoji: '🎯', text: 'What are my top priorities?' },
  { emoji: '💰', text: 'Review budget status' },
  { emoji: '🤝', text: 'How is Rex performing?' },
  { emoji: '⚡', text: 'Run a full team briefing' },
  { emoji: '📋', text: 'Show pending approvals' },
];

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, agent }) {
  const isUser = msg.role === 'user';
  const [liked, setLiked] = useState(null);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex gap-3 mb-6 group ${isUser ? 'flex-row-reverse' : ''}`}>

      {/* Avatar */}
      {!isUser ? (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold"
          style={{ background: agent.gradient, boxShadow: `0 4px 12px ${agent.color}35` }}>
          {agent.name[0]}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,#334155,#475569)' }}>
          U
        </div>
      )}

      <div className={`flex flex-col max-w-[72%] ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-bold" style={{ color: '#0A0F1E' }}>{agent.name}</span>
            <span className="text-[10px] font-medium" style={{ color: '#CBD5E1' }}>{msg.time}</span>
            {msg.processing && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
                Processing…
              </span>
            )}
          </div>
        )}

        <div className="rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-wrap"
          style={isUser ? {
            background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)',
            color: '#fff',
            borderBottomRightRadius: 6,
            boxShadow: '0 4px 16px rgba(91,95,255,0.25)',
          } : {
            background: '#fff',
            color: '#1E293B',
            border: '1px solid rgba(91,95,255,0.09)',
            borderBottomLeftRadius: 6,
            boxShadow: '0 2px 12px rgba(91,95,255,0.06)',
          }}>
          {msg.content}
        </div>

        {/* Agent message actions */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={copy}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors"
              style={{ color: copied ? '#5B5FFF' : '#94A3B8', background: copied ? 'rgba(91,95,255,0.06)' : 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.06)'; e.currentTarget.style.color = '#5B5FFF'; }}
              onMouseLeave={e => { if (!copied) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}>
              <Copy size={11} /> {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={() => setLiked(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: liked === true ? '#22C55E' : '#94A3B8' }}
              onMouseEnter={e => e.currentTarget.style.color = '#22C55E'}
              onMouseLeave={e => { if (liked !== true) e.currentTarget.style.color = '#94A3B8'; }}>
              <ThumbsUp size={11} />
            </button>
            <button onClick={() => setLiked(false)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: liked === false ? '#EF4444' : '#94A3B8' }}
              onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
              onMouseLeave={e => { if (liked !== false) e.currentTarget.style.color = '#94A3B8'; }}>
              <ThumbsDown size={11} />
            </button>
          </div>
        )}

        {isUser && (
          <span className="text-[10px] mt-1" style={{ color: '#CBD5E1' }}>{msg.time}</span>
        )}
      </div>
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator({ agent }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex gap-3 mb-6">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
        style={{ background: agent.gradient, boxShadow: `0 4px 12px ${agent.color}35` }}>
        {agent.name[0]}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-bold" style={{ color: '#0A0F1E' }}>{agent.name}</span>
          <span className="text-[10px]" style={{ color: '#CBD5E1' }}>typing…</span>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
          style={{ background: '#fff', border: '1px solid rgba(91,95,255,0.09)', borderBottomLeftRadius: 6, boxShadow: '0 2px 12px rgba(91,95,255,0.06)' }}>
          {[0, 0.18, 0.36].map(d => (
            <motion.div key={d} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.55, repeat: Infinity, delay: d }}
              className="w-2 h-2 rounded-full" style={{ background: '#5B5FFF', opacity: 0.6 }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Side panel ────────────────────────────────────────────────────────────────
function SidePanel({ panel, onClose, agent, agents: allAgents, onAgentChange }) {
  if (panel === 'agents') return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <Users size={14} style={{ color: '#5B5FFF' }} />
          <span className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Switch Agent</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: '#94A3B8' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          <X size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {allAgents.map(a => (
          <button key={a.id} onClick={() => { onAgentChange(a); onClose(); }}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
            style={{
              background: a.id === agent.id ? `${a.color}0D` : 'rgba(248,250,252,0.8)',
              border: a.id === agent.id ? `1.5px solid ${a.color}30` : '1.5px solid transparent',
            }}
            onMouseEnter={e => { if (a.id !== agent.id) e.currentTarget.style.background = 'rgba(91,95,255,0.04)'; }}
            onMouseLeave={e => { if (a.id !== agent.id) e.currentTarget.style.background = 'rgba(248,250,252,0.8)'; }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: a.gradient, boxShadow: `0 4px 12px ${a.color}30` }}>
              {a.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: '#0A0F1E' }}>{a.name}</p>
              <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{a.role}</p>
            </div>
            {a.id === agent.id && (
              <div className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#5B5FFF' }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  if (panel === 'computer') return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <Monitor size={14} style={{ color: '#5B5FFF' }} />
          <span className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Agent's Computer</span>
        </div>
        <div className="flex gap-1">
          <button className="p-1.5 rounded-lg transition-colors" style={{ color: '#94A3B8' }}><Maximize2 size={12} /></button>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: '#94A3B8' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={13} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Mock browser */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(91,95,255,0.1)', boxShadow: '0 4px 16px rgba(91,95,255,0.06)' }}>
          <div className="px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(91,95,255,0.04)', borderBottom: '1px solid rgba(91,95,255,0.08)' }}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FCA5A5' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FCD34D' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#6EE7B7' }} />
            </div>
            <div className="flex-1 rounded-lg px-2 py-1 text-[10px]" style={{ background: 'white', color: '#94A3B8' }}>
              hubspot.com/crm/contacts
            </div>
          </div>
          <div className="flex items-center justify-center py-10" style={{ background: '#fff' }}>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-xs font-semibold" style={{ color: '#5B5FFF' }}>Reviewing CRM contacts</p>
              <p className="text-[10px] mt-1" style={{ color: '#94A3B8' }}>Scanning 234 leads…</p>
            </div>
          </div>
        </div>
        {/* Task progress */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.08)' }}>
          <p className="text-[11px] font-bold mb-3" style={{ color: '#64748B' }}>CURRENT TASKS</p>
          {[
            { label: 'Scan new leads from HubSpot', done: true },
            { label: 'Score leads by ICP fit', done: true },
            { label: 'Send outreach to top 10', done: false, active: true },
            { label: 'Log results to dashboard', done: false },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-2.5 py-2">
              {t.done ? (
                <CheckCircle2 size={13} style={{ color: '#22C55E', flexShrink: 0 }} />
              ) : t.active ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ flexShrink: 0 }}>
                  <RefreshCw size={13} style={{ color: '#5B5FFF' }} />
                </motion.div>
              ) : (
                <Clock size={13} style={{ color: '#CBD5E1', flexShrink: 0 }} />
              )}
              <span className="text-xs" style={{ color: t.done ? '#94A3B8' : t.active ? '#5B5FFF' : '#CBD5E1', textDecoration: t.done ? 'line-through' : 'none' }}>
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (panel === 'activity') return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <Zap size={14} style={{ color: '#5B5FFF' }} />
          <span className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Live Activity</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: '#94A3B8' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <X size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {[
          { agent: 'Rex',   color: '#00B894', action: 'Scored 12 new leads',          time: '2m ago',  icon: '🎯' },
          { agent: 'Echo',  color: '#0984E3', action: 'Resolved ticket #4821',         time: '5m ago',  icon: '✅' },
          { agent: 'Nova',  color: '#A29BFE', action: 'Filed Q2 ops report',           time: '12m ago', icon: '📋' },
          { agent: 'Dev',   color: '#E17055', action: 'Merged PR #142 to staging',     time: '18m ago', icon: '🔀' },
          { agent: 'Rex',   color: '#00B894', action: 'Booked 2 discovery calls',      time: '34m ago', icon: '📅' },
          { agent: 'Echo',  color: '#0984E3', action: 'Updated 6 knowledge base docs', time: '41m ago', icon: '📝' },
          { agent: 'Freemi',color: '#5B5FFF', action: 'Delegated new goal to Rex',     time: '1h ago',  icon: '🤖' },
        ].map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(91,95,255,0.06)' }}>
            <div className="text-base flex-shrink-0 mt-0.5">{item.icon}</div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold" style={{ color: item.color }}>{item.agent}</span>
              <span className="text-xs ml-1" style={{ color: '#4B5563' }}>{item.action}</span>
              <div className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>{item.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ChatView() {
  const [searchParams] = useSearchParams();
  const { agents: companyAgents } = useCompany();

  // Merge company agents with defaults
  const allAgents = AGENTS;

  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'agent', time: now(),
      content: "Hey! I'm Freemi, your AI Chief Executive. Tell me your goals and I'll get the right agents working on them immediately. What do you need?",
    }
  ]);
  const [typing, setTyping] = useState(false);
  const [panel, setPanel] = useState(null);
  const bottomRef = useRef(null);
  const initialized = useRef(false);

  // Handle initial query from home page
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const q = searchParams.get('q');
    if (q) {
      // Small delay so component mounts fully
      setTimeout(() => sendMessage(q), 100);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const msg = (typeof text === 'string' ? text : '').trim();
    if (!msg) return;
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', time: now(), content: msg }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 800));
    setTyping(false);
    const reply = FREEMI_REPLIES[Math.floor(Math.random() * FREEMI_REPLIES.length)];
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'agent', time: now(), content: reply }]);
  };

  const togglePanel = (id) => setPanel(p => p === id ? null : id);

  const PANEL_BTNS = [
    { id: 'agents',   icon: Users,    label: 'Agents' },
    { id: 'computer', icon: Monitor,  label: 'Computer' },
    { id: 'activity', icon: Zap,      label: 'Activity' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F7FF 45%, #FAFCFF 100%)' }}>

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(91,95,255,0.08)' }}>

        {/* Agent selector */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ background: activeAgent.gradient, boxShadow: `0 4px 12px ${activeAgent.color}30` }}>
            {activeAgent.name[0]}
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#0A0F1E' }}>{activeAgent.name}</p>
            <p className="text-[10px]" style={{ color: '#94A3B8' }}>{activeAgent.role}</p>
          </div>
          <div className="flex items-center gap-1 ml-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#22C55E' }}>Online</span>
          </div>
        </div>

        {/* Agent selector chips (desktop) */}
        <div className="hidden md:flex items-center gap-1.5">
          {AGENTS.map(a => (
            <button key={a.id} onClick={() => setActiveAgent(a)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
              style={{
                background: a.id === activeAgent.id ? `${a.color}12` : 'transparent',
                color: a.id === activeAgent.id ? a.color : '#94A3B8',
                border: a.id === activeAgent.id ? `1px solid ${a.color}25` : '1px solid transparent',
              }}
              onMouseEnter={e => { if (a.id !== activeAgent.id) { e.currentTarget.style.background = 'rgba(91,95,255,0.05)'; e.currentTarget.style.color = '#5B5FFF'; } }}
              onMouseLeave={e => { if (a.id !== activeAgent.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}>
              <div className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[9px] font-bold"
                style={{ background: a.gradient }}>
                {a.name[0]}
              </div>
              {a.name}
            </button>
          ))}
        </div>

        {/* Panel toggles */}
        <div className="flex items-center gap-1.5">
          {PANEL_BTNS.map(pb => (
            <button key={pb.id} onClick={() => togglePanel(pb.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                color: panel === pb.id ? '#5B5FFF' : '#64748B',
                background: panel === pb.id ? 'rgba(91,95,255,0.10)' : 'rgba(0,0,0,0.03)',
                border: panel === pb.id ? '1px solid rgba(91,95,255,0.20)' : '1px solid rgba(0,0,0,0.06)',
                boxShadow: panel === pb.id ? '0 2px 8px rgba(91,95,255,0.12)' : 'none',
              }}
              onMouseEnter={e => { if (panel !== pb.id) { e.currentTarget.style.background = 'rgba(91,95,255,0.06)'; e.currentTarget.style.color = '#5B5FFF'; e.currentTarget.style.borderColor = 'rgba(91,95,255,0.15)'; } }}
              onMouseLeave={e => { if (panel !== pb.id) { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; } }}>
              <pb.icon size={14} strokeWidth={1.9} />
              <span className="hidden lg:inline">{pb.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content: messages + optional side panel ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Messages area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6">
            {/* Empty state header */}
            {messages.length === 1 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10">
                <div className="flex justify-center mb-4">
                  <FreemiCharacter size="sm" color="#5B5FFF" />
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: '#0A0F1E' }}>
                  Chat with {activeAgent.name}
                </h2>
                <p className="text-sm" style={{ color: '#94A3B8' }}>{activeAgent.role} · Always on</p>
              </motion.div>
            )}

            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} agent={activeAgent} />
            ))}
            <AnimatePresence>
              {typing && <TypingIndicator agent={activeAgent} />}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          {messages.length <= 2 && !typing && (
            <div className="px-6 md:px-10 pb-3 flex gap-2 flex-wrap">
              {QUICK_CHIPS.map((c, i) => (
                <motion.button key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => sendMessage(c.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    color: '#5B5FFF',
                    border: '1px solid rgba(91,95,255,0.12)',
                    boxShadow: '0 2px 8px rgba(91,95,255,0.06)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.06)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(91,95,255,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(91,95,255,0.06)'; }}>
                  <span>{c.emoji}</span> {c.text}
                </motion.button>
              ))}
            </div>
          )}

          {/* Input bar — full toolbar with Skills, Monitor, Files, Mic, AI Model */}
          <ChatInput onSend={(text) => sendMessage(text)} onOpenComputer={() => togglePanel('computer')} />
        </div>

        {/* ── Side panel ── */}
        <AnimatePresence>
          {panel && (
            <motion.div
              key={panel}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex-shrink-0 flex flex-col"
              style={{
                width: 300,
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid rgba(91,95,255,0.08)',
                boxShadow: '-8px 0 32px rgba(91,95,255,0.06)',
              }}>
              <SidePanel panel={panel} onClose={() => setPanel(null)}
                agent={activeAgent} agents={AGENTS} onAgentChange={setActiveAgent} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
