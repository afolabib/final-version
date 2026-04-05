import { useState, useRef, useEffect, useMemo } from 'react';
import { collection, query, where, limit, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Sparkles, X, RefreshCw, Monitor,
  Users, Settings, Zap, ArrowRight,
  CheckCircle2, Clock, Maximize2, Copy, ThumbsUp, ThumbsDown,
  MessageSquare, Plus, ChevronLeft, ChevronRight, PenSquare,
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCompany } from '@/contexts/CompanyContext';
import FreemiCharacter from '@/components/FreemiCharacter';
import ChatInput from './ChatInput';
import FilesTab from './config-tabs/FilesTab';
import ReactMarkdown from 'react-markdown';
import { httpsCallable } from 'firebase/functions';
import { functions as firebaseFunctions } from '@/lib/firebaseClient';

// ── Fallback agent definitions ────────────────────────────────────────────────
const FALLBACK_AGENTS = [
  { id: 'freemi', name: 'Freemi', role: 'AI Chief Executive', color: '#5B5FFF', gradient: 'linear-gradient(135deg,#5B5FFF,#6B63FF)' },
  { id: 'rex',    name: 'Rex',    role: 'Sales Operator',     color: '#00B894', gradient: 'linear-gradient(135deg,#00B894,#00CEC9)' },
  { id: 'echo',   name: 'Echo',   role: 'Support Operator',   color: '#0984E3', gradient: 'linear-gradient(135deg,#0984E3,#74B9FF)' },
  { id: 'dev',    name: 'Dev',    role: 'Engineering Operator',color: '#E17055', gradient: 'linear-gradient(135deg,#E17055,#FDCB6E)' },
  { id: 'nova',   name: 'Nova',   role: 'Ops Operator',       color: '#A29BFE', gradient: 'linear-gradient(135deg,#A29BFE,#6C5CE7)' },
];

const PALETTE = [
  { color: '#5B5FFF', gradient: 'linear-gradient(135deg,#5B5FFF,#6B63FF)' },
  { color: '#00B894', gradient: 'linear-gradient(135deg,#00B894,#00CEC9)' },
  { color: '#0984E3', gradient: 'linear-gradient(135deg,#0984E3,#74B9FF)' },
  { color: '#E17055', gradient: 'linear-gradient(135deg,#E17055,#FDCB6E)' },
  { color: '#A29BFE', gradient: 'linear-gradient(135deg,#A29BFE,#6C5CE7)' },
  { color: '#FD79A8', gradient: 'linear-gradient(135deg,#FD79A8,#E84393)' },
];

const chatProxyFn = httpsCallable(firebaseFunctions, 'chatProxy');

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
  const [displayed, setDisplayed] = useState(msg.streaming ? '' : msg.content);

  useEffect(() => {
    if (!msg.streaming) { setDisplayed(msg.content); return; }
    setDisplayed('');
    let i = 0;
    const full = msg.content;
    const tick = () => {
      if (i >= full.length) return;
      const step = Math.min(3, full.length - i);
      i += step;
      setDisplayed(full.slice(0, i));
      setTimeout(tick, 18);
    };
    setTimeout(tick, 18);
  }, [msg.content, msg.streaming]);

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

        <div className="rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed"
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
          {isUser ? (
            <span style={{ whiteSpace: 'pre-wrap' }}>{displayed}</span>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                h1: ({ children }) => <h1 className="text-base font-bold mb-1 mt-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold mb-1 mt-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1.5">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                pre: ({ children }) => <div className="rounded-xl p-3 my-2 text-xs font-mono overflow-x-auto" style={{ background: '#F8FAFF', border: '1px solid rgba(91,95,255,0.1)', color: '#374151' }}>{children}</div>,
                code: ({ inline, children }) => inline
                  ? <code className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>{children}</code>
                  : <code className="text-xs font-mono" style={{ color: '#374151' }}>{children}</code>,
                hr: () => <hr className="my-2 border-slate-100" />,
                blockquote: ({ children }) => <blockquote className="border-l-2 pl-3 my-1 italic" style={{ borderColor: '#5B5FFF', color: '#64748B' }}>{children}</blockquote>,
              }}
            >
              {displayed}
            </ReactMarkdown>
          )}
          {msg.streaming && displayed.length < msg.content.length && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.7, repeat: Infinity }}
              className="inline-block w-0.5 h-3.5 ml-0.5 rounded-full align-middle"
              style={{ background: '#5B5FFF' }}
            />
          )}
        </div>

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
function SidePanel({ panel, onClose, agent, agents: allAgents, onAgentChange, companyId }) {
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
    <AgentComputer agent={agent} onClose={onClose} companyId={companyId} />
  );

  if (panel === 'activity') return (
    <LiveActivity companyId={companyId} onClose={onClose} />
  );

  if (panel === 'settings') return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <Settings size={14} style={{ color: '#5B5FFF' }} />
          <span className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Agent Files</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: '#94A3B8' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          <X size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <FilesTab agent={agent} companyId={companyId} />
      </div>
    </div>
  );

  return null;
}

// ── Agent Computer ────────────────────────────────────────────────────────────
function AgentComputer({ agent, onClose, companyId }) {
  const [tasks, setTasks]            = useState([]);
  const [heartbeats, setHeartbeats]  = useState([]);
  const [activity, setActivity]      = useState([]);
  const [termLines, setTermLines]    = useState([]);
  const termRef                      = useRef(null);

  useEffect(() => {
    if (!companyId || !agent?.id) return;

    const unsubTasks = onSnapshot(
      query(collection(firestore, 'tasks'), where('companyId', '==', companyId), where('assignedAgentId', '==', agent.id), limit(10)),
      snap => setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubHb = onSnapshot(
      query(collection(firestore, 'heartbeats'), where('agentId', '==', agent.id), limit(5)),
      snap => {
        const docs = snap.docs.map(d => d.data()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setHeartbeats(docs);
        const lines = docs.flatMap(h => [
          { text: `[heartbeat] ${new Date((h.createdAt?.seconds || 0) * 1000).toLocaleTimeString()}`, color: '#64748B' },
          { text: `  → ${h.summary}`, color: '#22C55E' },
          { text: `  → ${h.decisionsCount} decision(s) · $${h.costUsd?.toFixed(5)}`, color: '#94A3B8' },
        ]);
        setTermLines(lines);
      }
    );
    const unsubAct = onSnapshot(
      query(collection(firestore, 'activity_log'), where('companyId', '==', companyId), where('actorId', '==', agent.id), limit(10)),
      snap => {
        const docs = snap.docs.map(d => d.data()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setActivity(docs);
      }
    );
    return () => { unsubTasks(); unsubHb(); unsubAct(); };
  }, [agent?.id, companyId]);

  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight, behavior: 'smooth' });
  }, [termLines]);

  const inProgress  = tasks.filter(t => t.status === 'in_progress');
  const todo        = tasks.filter(t => t.status === 'todo');
  const done        = tasks.filter(t => t.status === 'done');
  const currentTask = inProgress[0] || todo[0] || null;

  return (
    <div className="flex flex-col h-full" style={{ background: '#0A0F1E' }}>
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#EF4444' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#F59E0B' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22C55E' }} />
          </div>
          <span className="text-[11px] font-mono font-semibold" style={{ color: '#64748B' }}>
            {agent.name.toLowerCase()}@fly-machine ~ freemi-runtime
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#22C55E' }}>LIVE</span>
          </div>
          <button onClick={onClose} className="p-1 rounded" style={{ color: '#475569' }}
            onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {currentTask && (
          <div className="px-4 py-2.5 flex-shrink-0" style={{ background: 'rgba(91,95,255,0.12)', borderBottom: '1px solid rgba(91,95,255,0.2)' }}>
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <RefreshCw size={10} style={{ color: '#818CF8' }} />
              </motion.div>
              <span className="text-[11px] font-mono" style={{ color: '#818CF8' }}>WORKING:</span>
              <span className="text-[11px] font-mono truncate" style={{ color: '#C7D2FE' }}>{currentTask.title}</span>
            </div>
          </div>
        )}

        <div ref={termRef} className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed"
          style={{ background: '#0A0F1E' }}>
          <p style={{ color: '#334155' }}>Freemi Agent Runtime v1.0</p>
          <p style={{ color: '#334155' }}>Agent: <span style={{ color: '#60A5FA' }}>{agent.name}</span> · Role: <span style={{ color: '#60A5FA' }}>{agent.role}</span></p>
          <p style={{ color: '#334155' }}>Company: <span style={{ color: '#60A5FA' }}>{companyId}</span></p>
          <p style={{ color: '#22C55E' }}>✓ Firestore connected</p>
          <p style={{ color: '#22C55E' }}>✓ MiniMax API ready</p>
          <p style={{ color: '#22C55E' }}>✓ Heartbeat scheduler active</p>
          <p style={{ color: '#334155' }}>──────────────────────────</p>

          {done.slice(0, 3).map((t, i) => (
            <div key={t.id}>
              <p style={{ color: '#475569' }}>[task] {t.title}</p>
              <p style={{ color: '#22C55E' }}>  ✓ done{t.outputSummary ? ` — ${t.outputSummary.slice(0, 80)}…` : ''}</p>
            </div>
          ))}
          {inProgress.map(t => (
            <div key={t.id}>
              <p style={{ color: '#818CF8' }}>[task] {t.title}</p>
              <motion.p animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                style={{ color: '#818CF8' }}>  ⟳ processing…</motion.p>
            </div>
          ))}
          {termLines.map((line, i) => (
            <p key={i} style={{ color: line.color }}>{line.text}</p>
          ))}
          {activity.slice(0, 5).map((a, i) => (
            <p key={i} style={{ color: '#475569' }}>[{a.event}] {a.summary}</p>
          ))}
          <div className="flex items-center gap-1 mt-1">
            <span style={{ color: '#22C55E' }}>$</span>
            <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-1.5 h-3 rounded-sm" style={{ background: '#22C55E' }} />
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2"
          style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-[10px] font-mono" style={{ color: '#475569' }}>
            tasks: <span style={{ color: '#22C55E' }}>{done.length}</span> done · <span style={{ color: '#818CF8' }}>{inProgress.length}</span> active · <span style={{ color: '#64748B' }}>{todo.length}</span> todo
          </span>
          <span className="text-[10px] font-mono ml-auto" style={{ color: '#334155' }}>
            fly-iad · freemi-agents
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Live Activity ─────────────────────────────────────────────────────────────
function LiveActivity({ companyId, onClose }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!companyId) return;
    const q = query(collection(firestore, 'activity_log'), where('companyId', '==', companyId), limit(20));
    return onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setItems(docs);
    });
  }, [companyId]);

  const timeAgo = (ts) => {
    if (!ts?.seconds) return '';
    const diff = Math.floor((Date.now() / 1000) - ts.seconds);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const eventIcon = (event) => {
    if (event?.includes('task')) return '✅';
    if (event?.includes('goal')) return '🎯';
    if (event?.includes('heartbeat')) return '💓';
    if (event?.includes('hire') || event?.includes('agent')) return '🤖';
    if (event?.includes('approval')) return '📋';
    if (event?.includes('workflow')) return '⚡';
    return '📌';
  };

  return (
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
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-center py-8" style={{ color: '#CBD5E1' }}>No activity yet.</p>
        )}
        {items.map((item, i) => (
          <motion.div key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(91,95,255,0.06)' }}>
            <div className="text-sm flex-shrink-0 mt-0.5">{eventIcon(item.event)}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-snug" style={{ color: '#374151' }}>{item.summary}</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>{timeAgo(item.createdAt)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Action cards ──────────────────────────────────────────────────────────────
const ACTION_META = {
  create_task:     { emoji: '✅', label: 'Task created',       route: '/dashboard/tasks' },
  update_task:     { emoji: '🔄', label: 'Task updated',       route: '/dashboard/tasks' },
  create_goal:     { emoji: '🎯', label: 'Goal created',       route: '/dashboard/goals' },
  create_approval: { emoji: '📋', label: 'Approval requested', route: '/dashboard/inbox' },
  hire_agent:      { emoji: '👤', label: 'Hire requested',     route: '/dashboard/inbox' },
  create_workflow: { emoji: '⚡', label: 'Workflow created',   route: '/dashboard/routines' },
  save_document:   { emoji: '📄', label: 'Document saved',     route: '/dashboard/files' },
};

function ActionCards({ actions, navigate }) {
  if (!actions?.length) return null;
  return (
    <div className="flex flex-col gap-2 mt-3 ml-11">
      {actions.map((action, i) => {
        const meta = ACTION_META[action.type] || { emoji: '✨', label: action.type, route: '/dashboard' };
        return (
          <motion.button key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => navigate(meta.route)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all w-full"
            style={{ background: 'rgba(91,95,255,0.06)', border: '1.5px solid rgba(91,95,255,0.18)', color: '#1E293B' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(91,95,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(91,95,255,0.18)'; }}>
            <span className="text-lg flex-shrink-0">{meta.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide mb-0.5" style={{ color: '#5B5FFF' }}>{meta.label}</p>
              <p className="text-sm font-semibold truncate" style={{ color: '#0A0F1E' }}>{action.title}</p>
            </div>
            <ArrowRight size={13} style={{ color: '#5B5FFF', flexShrink: 0 }} />
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Sessions sidebar ──────────────────────────────────────────────────────────
function SessionSidebar({ sessions, activeSessionId, onSelect, onNew, agents, collapsed, onToggle }) {
  const timeAgo = (ts) => {
    if (!ts?.seconds) return '';
    const diff = Math.floor((Date.now() / 1000) - ts.seconds);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 2) return 'yesterday';
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(ts.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group sessions
  const groups = useMemo(() => {
    const todayStart  = new Date(); todayStart.setHours(0,0,0,0);
    const yestStart   = new Date(todayStart); yestStart.setDate(yestStart.getDate()-1);
    const weekStart   = new Date(todayStart); weekStart.setDate(weekStart.getDate()-7);
    const g = { today: [], yesterday: [], week: [], older: [] };
    sessions.forEach(s => {
      const ts = (s.updatedAt?.seconds || s.createdAt?.seconds || 0) * 1000;
      if (ts >= todayStart.getTime())   g.today.push(s);
      else if (ts >= yestStart.getTime()) g.yesterday.push(s);
      else if (ts >= weekStart.getTime()) g.week.push(s);
      else g.older.push(s);
    });
    return g;
  }, [sessions]);

  const agentColor = (agentId) => {
    const a = agents.find(x => x.id === agentId);
    return a ? a.gradient : 'linear-gradient(135deg,#5B5FFF,#6B63FF)';
  };

  const renderGroup = (label, items) => {
    if (!items.length) return null;
    return (
      <div key={label} className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-3" style={{ color: '#CBD5E1' }}>{label}</p>
        <div className="space-y-0.5">
          {items.map(s => {
            const isActive = s.id === activeSessionId;
            return (
              <button key={s.id} onClick={() => onSelect(s)}
                className="w-full text-left px-3 py-2.5 rounded-xl transition-all group relative"
                style={{
                  background: isActive ? 'rgba(91,95,255,0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(91,95,255,0.18)' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; } }}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                    style={{ background: agentColor(s.agentId) }}>
                    {s.agentName?.[0] || 'A'}
                  </div>
                  <p className="text-xs font-semibold truncate flex-1 min-w-0"
                    style={{ color: isActive ? '#5B5FFF' : '#374151' }}>
                    {s.title || 'Untitled'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 pl-7">
                  <span className="text-[10px]" style={{ color: '#94A3B8' }}>{s.agentName}</span>
                  <span className="text-[10px]" style={{ color: '#E2E8F0' }}>·</span>
                  <span className="text-[10px]" style={{ color: '#94A3B8' }}>{timeAgo(s.updatedAt || s.createdAt)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4 gap-3 flex-shrink-0"
        style={{ width: 48, borderRight: '1px solid rgba(91,95,255,0.08)', background: 'rgba(255,255,255,0.95)' }}>
        <button onClick={onNew}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.1)'}>
          <Plus size={14} />
        </button>
        <button onClick={onToggle}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ color: '#94A3B8' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#5B5FFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
          <ChevronRight size={14} />
        </button>
        {sessions.slice(0, 8).map(s => (
          <button key={s.id} onClick={() => onSelect(s)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 transition-all"
            style={{ background: agentColor(s.agentId), opacity: s.id === activeSessionId ? 1 : 0.5, boxShadow: s.id === activeSessionId ? `0 2px 8px rgba(91,95,255,0.3)` : 'none' }}
            title={s.title}>
            {s.agentName?.[0] || 'A'}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-shrink-0 overflow-hidden"
      style={{ width: 240, borderRight: '1px solid rgba(91,95,255,0.08)', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <MessageSquare size={13} style={{ color: '#5B5FFF' }} />
          <span className="text-xs font-bold" style={{ color: '#0A0F1E' }}>Conversations</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onNew}
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
            style={{ color: '#5B5FFF' }}
            title="New chat"
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <PenSquare size={13} />
          </button>
          <button onClick={onToggle}
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#5B5FFF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
            <ChevronLeft size={13} />
          </button>
        </div>
      </div>

      {/* New Chat button */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <button onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF', border: '1px solid rgba(91,95,255,0.15)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.08)'; }}>
          <Plus size={13} />
          New Chat
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {sessions.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare size={20} style={{ color: '#E2E8F0', margin: '0 auto 8px' }} />
            <p className="text-[11px]" style={{ color: '#CBD5E1' }}>No conversations yet</p>
          </div>
        ) : (
          <>
            {renderGroup('Today', groups.today)}
            {renderGroup('Yesterday', groups.yesterday)}
            {renderGroup('This Week', groups.week)}
            {renderGroup('Older', groups.older)}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ChatView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { agents: companyAgents, activeCompanyId, company } = useCompany();

  const AGENTS = useMemo(() => {
    if (companyAgents && companyAgents.length > 0) {
      return companyAgents.map((a, i) => ({
        id: a.id,
        name: a.name,
        role: a.jobTitle || a.role || 'AI Agent',
        color: PALETTE[i % PALETTE.length].color,
        gradient: PALETTE[i % PALETTE.length].gradient,
        // preserve full agent data for system prompt
        systemPrompt: a.systemPrompt || '',
        heartbeatInstructions: a.heartbeatInstructions || '',
        _raw: a,
      }));
    }
    return FALLBACK_AGENTS;
  }, [companyAgents]);

  const resolveInitialAgent = () => {
    const name = searchParams.get('agent');
    if (name) {
      const match = AGENTS.find(a => a.name.toLowerCase() === name.toLowerCase());
      if (match) return match;
    }
    return AGENTS[0];
  };

  const initialAgent = resolveInitialAgent();

  const [activeAgent, setActiveAgent]             = useState(initialAgent);
  const [messages, setMessages]                   = useState([greetingMsg(initialAgent)]);
  const [typing, setTyping]                       = useState(false);
  const [panel, setPanel]                         = useState(null);
  const [sessions, setSessions]                   = useState([]);
  const [currentSessionId, setCurrentSessionId]   = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed]   = useState(false);
  const bottomRef    = useRef(null);
  const initialized  = useRef(false);

  // Load sessions from Firestore
  useEffect(() => {
    if (!activeCompanyId) return;
    const q = query(
      collection(firestore, 'chat_sessions'),
      where('companyId', '==', activeCompanyId),
      limit(60)
    );
    return onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.updatedAt?.seconds || b.createdAt?.seconds || 0) - (a.updatedAt?.seconds || a.createdAt?.seconds || 0));
      setSessions(list);
    });
  }, [activeCompanyId]);

  // Re-select agent if URL param changes
  useEffect(() => {
    const name = searchParams.get('agent');
    if (!name) return;
    const match = AGENTS.find(a => a.name.toLowerCase() === name.toLowerCase());
    if (match && match.id !== activeAgent.id) {
      startNewSession(match);
    }
  }, [searchParams.get('agent')]);

  // Handle initial query from home page
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const q = searchParams.get('q');
    if (q) setTimeout(() => sendMessage(q), 100);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  function startNewSession(agent) {
    const a = agent || activeAgent;
    setCurrentSessionId(null);
    setActiveAgent(a);
    setMessages([greetingMsg(a)]);
  }

  function loadSession(session) {
    const agent = AGENTS.find(a => a.id === session.agentId) || AGENTS[0];
    setActiveAgent(agent);
    setCurrentSessionId(session.id);
    const restored = (session.messages || []).map(m => ({ ...m, streaming: false }));
    if (restored.length === 0) {
      setMessages([greetingMsg(agent)]);
    } else {
      setMessages(restored);
    }
  }

  const sendMessage = async (text) => {
    const msg = (typeof text === 'string' ? text : '').trim();
    if (!msg) return;

    const userMsg = { id: Date.now(), role: 'user', time: now(), content: msg };
    const prevMessages = messages; // capture before state update
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // track session id locally so async closure has it
    let sessionIdRef = currentSessionId;

    try {
      const history = prevMessages.slice(-12).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      // Build system prompt from agent template + company context
      const { getAgentSystemPrompt } = await import('@/lib/agentTemplates');
      const systemPrompt = getAgentSystemPrompt(
        activeAgent._raw || activeAgent,
        company?.name,
        company?.mission
      );

      const result = await chatProxyFn({
        agentId:      activeAgent.id,
        companyId:    activeCompanyId,
        agentName:    activeAgent.name,
        agentRole:    activeAgent.role,
        systemPrompt,
        messages: [...history, { role: 'user', content: msg }],
      });

      const reply   = result.data?.reply   || "I'm having trouble responding right now. Please try again.";
      const actions = result.data?.actions || [];

      const agentMsg = { id: Date.now() + 1, role: 'agent', time: now(), content: reply, actions, streaming: true };
      setTyping(false);
      setMessages(prev => [...prev, agentMsg]);

      // Persist session to Firestore
      const toStore = [...prevMessages, userMsg, { ...agentMsg, streaming: false }];

      if (!sessionIdRef) {
        const ref = await addDoc(collection(firestore, 'chat_sessions'), {
          companyId:  activeCompanyId,
          agentId:    activeAgent.id,
          agentName:  activeAgent.name,
          agentRole:  activeAgent.role,
          title:      msg.slice(0, 60),
          messages:   toStore,
          createdAt:  serverTimestamp(),
          updatedAt:  serverTimestamp(),
        });
        sessionIdRef = ref.id;
        setCurrentSessionId(ref.id);
      } else {
        await updateDoc(doc(firestore, 'chat_sessions', sessionIdRef), {
          messages:  toStore,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error('Chat proxy error:', err);
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'agent', time: now(),
        content: "I'm having trouble connecting right now. Please try again.",
      }]);
    }
  };

  const togglePanel = (id) => setPanel(p => p === id ? null : id);

  const PANEL_BTNS = [
    { id: 'agents',   icon: Users,    label: 'Agents' },
    { id: 'computer', icon: Monitor,  label: 'Computer' },
    { id: 'activity', icon: Zap,      label: 'Activity' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="h-full flex overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>

      {/* ── Sessions sidebar ── */}
      <SessionSidebar
        sessions={sessions}
        activeSessionId={currentSessionId}
        onSelect={loadSession}
        onNew={() => startNewSession()}
        agents={AGENTS}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(91,95,255,0.08)' }}>

          {/* Agent info */}
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

          {/* Agent selector chips */}
          <div className="hidden md:flex items-center gap-1.5">
            {AGENTS.map(a => (
              <button key={a.id} onClick={() => startNewSession(a)}
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

        {/* Messages + right side panel */}
        <div className="flex flex-1 overflow-hidden">

          {/* Message list */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6">
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
                <div key={msg.id}>
                  <MessageBubble msg={msg} agent={activeAgent} />
                  {msg.role === 'agent' && msg.actions?.length > 0 && (
                    <ActionCards actions={msg.actions} navigate={navigate} />
                  )}
                </div>
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

            <ChatInput onSend={(text) => sendMessage(text)} onOpenComputer={() => togglePanel('computer')} agent={activeAgent} companyId={activeCompanyId} />
          </div>

          {/* Right side panel */}
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
                  width: panel === 'computer' ? 380 : panel === 'settings' ? 480 : 300,
                  background: panel === 'computer' ? '#0A0F1E' : 'rgba(255,255,255,0.97)',
                  backdropFilter: 'blur(20px)',
                  borderLeft: '1px solid rgba(91,95,255,0.08)',
                  boxShadow: '-8px 0 32px rgba(91,95,255,0.06)',
                }}>
                <SidePanel panel={panel} onClose={() => setPanel(null)} companyId={activeCompanyId}
                  agent={activeAgent} agents={AGENTS} onAgentChange={a => startNewSession(a)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function greetingMsg(agent) {
  return { id: 1, role: 'agent', time: now(), content: `Hey! I'm ${agent.name}, your ${agent.role}. How can I help you today?` };
}

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
