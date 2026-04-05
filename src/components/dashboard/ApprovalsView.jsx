import { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Users, DollarSign, Zap, Shield, CheckCircle2, Inbox, HelpCircle, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompany } from '@/contexts/CompanyContext';
import { approveRequest, rejectRequest, addApprovalMessage } from '@/lib/approvalService';
import { httpsCallable } from 'firebase/functions';
import { functions as firebaseFunctions } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';

const TYPE_META = {
  needs_input:      { icon: HelpCircle,  label: 'Agent Needs Help',  color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
  hire_agent:       { icon: Users,       label: 'Hire Agent',        color: '#5B5FFF', bg: 'rgba(91,95,255,0.08)' },
  fire_agent:       { icon: XCircle,     label: 'Terminate Agent',   color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  budget_override:  { icon: DollarSign,  label: 'Budget Override',   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  strategy_change:  { icon: Zap,         label: 'Strategy Change',   color: '#0984E3', bg: 'rgba(9,132,227,0.08)' },
  external_action:  { icon: Shield,      label: 'External Action',   color: '#E17055', bg: 'rgba(225,112,85,0.08)' },
};

const chatProxyFn = httpsCallable(firebaseFunctions, 'chatProxy');

// ── needs_input card: conversational thread until resolved ────────────────────
function NeedsInputCard({ approval, companyId, index }) {
  const { user } = useAuth();
  const uid = user?.uid || user?.id || 'board';
  const agentName = approval.agentName || 'Agent';
  const agentRole = approval.agentRole || 'ops';

  // Thread = initial agent question + any follow-ups stored in approval.messages
  const storedMessages = approval.messages || [];
  const [localMessages, setLocalMessages] = useState([]);
  const [input, setInput]     = useState('');
  const [thinking, setThinking] = useState(false);
  const [resolved, setResolved] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Merge stored messages with local (avoid duplicates by checking last entry)
  const thread = storedMessages.length > localMessages.length ? storedMessages : localMessages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread, thinking]);

  useEffect(() => {
    if (!resolved) setTimeout(() => inputRef.current?.focus(), 100);
  }, [resolved]);

  async function handleSend() {
    const msg = input.trim();
    if (!msg || thinking) return;
    setInput('');

    // Add user message immediately to local state
    const userMsg = { role: 'user', text: msg };
    const newThread = [...thread, userMsg];
    setLocalMessages(newThread);
    setThinking(true);

    try {
      // Persist user message to Firestore
      await addApprovalMessage(approval.id, 'user', msg);

      // Call chatProxy with full conversation context
      const history = [
        { role: 'user', content: `I need your help with this: ${approval.title}. ${approval.description}` },
        ...newThread.slice(0, -1).map(m => ({
          role: m.role === 'agent' ? 'assistant' : 'user',
          content: m.text,
        })),
        { role: 'user', content: msg },
      ];

      const result = await chatProxyFn({
        agentName,
        agentRole,
        companyId,
        messages: history,
      });

      const reply = result.data?.reply || "Got it, I'll proceed with that.";
      const agentMsg = { role: 'agent', text: reply };
      setLocalMessages(prev => [...prev, agentMsg]);
      await addApprovalMessage(approval.id, 'agent', reply);

      // Auto-resolve if agent signals it's done
      const done = /\b(resolved|proceeding|i('ll| will) (take|handle|proceed|continue)|on it|understood|got it|will do)\b/i.test(reply);
      if (done) {
        setTimeout(async () => {
          await approveRequest(companyId, uid, approval.id, newThread.concat(agentMsg).map(m => `${m.role}: ${m.text}`).join('\n'));
          setResolved(true);
        }, 1200);
      }
    } catch {
      setLocalMessages(prev => [...prev, { role: 'agent', text: "I had trouble processing that. Please try again." }]);
    } finally {
      setThinking(false);
    }
  }

  async function handleResolve() {
    const summary = thread.map(m => `${m.role}: ${m.text}`).join('\n') || 'Resolved by founder';
    await approveRequest(companyId, uid, approval.id, summary);
    setResolved(true);
  }

  async function handleSkip() {
    await rejectRequest(companyId, uid, approval.id, "Founder can't provide this right now.");
    setResolved(true);
  }

  const time = approval.createdAt?.toDate ? approval.createdAt.toDate() : new Date();
  const timeStr = time.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (resolved) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="rounded-2xl px-5 py-4 flex items-center gap-3"
        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <CheckCircle2 size={16} style={{ color: '#10B981' }} />
        <span className="text-sm font-semibold" style={{ color: '#059669' }}>Resolved — agent will continue</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.97)', border: '1.5px solid rgba(139,92,246,0.2)', boxShadow: '0 4px 24px rgba(139,92,246,0.08)' }}>

      <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #8B5CF6, #8B5CF644)' }} />

      <div className="px-5 pt-4 pb-0">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139,92,246,0.1)' }}>
            <HelpCircle size={15} style={{ color: '#8B5CF6' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                {agentName} Needs Your Help
              </span>
              <span className="text-[10px] font-semibold" style={{ color: '#CBD5E1' }}>{timeStr}</span>
            </div>
            <p className="text-sm font-bold mt-0.5 truncate" style={{ color: '#0A0F1E' }}>{approval.title}</p>
          </div>
          <button onClick={handleSkip}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all flex-shrink-0"
            style={{ color: '#94A3B8', background: 'rgba(148,163,184,0.08)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
            Skip
          </button>
        </div>

        {/* Conversation thread */}
        <div className="space-y-3 max-h-72 overflow-y-auto mb-3 px-1">
          {/* Initial question */}
          <div className="flex gap-2.5 items-start">
            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
              <Bot size={11} color="white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%]"
              style={{ background: 'rgba(139,92,246,0.06)', color: '#0A0F1E', border: '1px solid rgba(139,92,246,0.1)' }}>
              {approval.description}
            </div>
          </div>

          {/* Follow-up messages */}
          {thread.map((m, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 items-start ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'agent' && (
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
                  <Bot size={11} color="white" />
                </div>
              )}
              <div className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%]"
                style={m.role === 'user' ? {
                  background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)',
                  color: 'white',
                  borderBottomRightRadius: 6,
                } : {
                  background: 'rgba(139,92,246,0.06)',
                  color: '#0A0F1E',
                  border: '1px solid rgba(139,92,246,0.1)',
                  borderBottomLeftRadius: 6,
                }}>
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(91,95,255,0.1)' }}>
                  <User size={11} style={{ color: '#5B5FFF' }} />
                </div>
              )}
            </motion.div>
          ))}

          {/* Thinking indicator */}
          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 items-start">
              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
                <Bot size={11} color="white" />
              </div>
              <div className="rounded-2xl px-3.5 py-2.5 flex gap-1"
                style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.1)', borderBottomLeftRadius: 6 }}>
                {[0, 0.15, 0.3].map(d => (
                  <motion.div key={d}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#8B5CF6', opacity: 0.6 }} />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t pb-4 pt-3" style={{ borderColor: 'rgba(139,92,246,0.1)' }}>
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Reply to the agent…"
              rows={1}
              className="flex-1 rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none"
              style={{
                background: 'rgba(139,92,246,0.04)',
                border: '1.5px solid rgba(139,92,246,0.15)',
                color: '#0A0A1A',
                caretColor: '#8B5CF6',
                minHeight: 42,
              }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            />
            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleSend}
                disabled={!input.trim() || thinking}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                style={{ background: input.trim() ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' : 'rgba(139,92,246,0.1)' }}>
                <Send size={13} color={input.trim() ? 'white' : '#8B5CF6'} strokeWidth={2.5} />
              </button>
              {thread.length > 0 && (
                <button
                  onClick={handleResolve}
                  title="Mark as resolved"
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <CheckCircle2 size={13} style={{ color: '#10B981' }} />
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] mt-1.5" style={{ color: '#CBD5E1' }}>Enter to send · ✓ to mark resolved</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Standard approval card ─────────────────────────────────────────────────────
function ApprovalCard({ approval, companyId, index }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);
  const [done, setDone] = useState(null);
  const meta = TYPE_META[approval.type] || TYPE_META.strategy_change;
  const Icon = meta.icon;
  const uid = user?.uid || user?.id || 'board';

  async function handleApprove() {
    setLoading('approve');
    try {
      await approveRequest(companyId, uid, approval.id);
      setDone('approved');
    } finally { setLoading(null); }
  }

  async function handleReject() {
    setLoading('reject');
    try {
      await rejectRequest(companyId, uid, approval.id, 'Rejected by board.');
      setDone('rejected');
    } finally { setLoading(null); }
  }

  const time = approval.createdAt?.toDate ? approval.createdAt.toDate() : new Date();
  const timeStr = time.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="rounded-2xl px-5 py-4 flex items-center gap-3"
        style={{ background: done === 'approved' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.04)', border: `1px solid ${done === 'approved' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.10)'}` }}>
        {done === 'approved'
          ? <CheckCircle2 size={16} style={{ color: '#10B981' }} />
          : <XCircle size={16} style={{ color: '#EF4444' }} />}
        <span className="text-sm font-semibold" style={{ color: done === 'approved' ? '#059669' : '#DC2626' }}>
          {done === 'approved' ? 'Approved' : 'Rejected'} — {approval.title}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden group"
      style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', backdropFilter: 'blur(12px)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(91,95,255,0.10)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.05)'}>

      <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}44)` }} />

      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: meta.bg, border: `1.5px solid ${meta.color}20` }}>
            <Icon size={19} style={{ color: meta.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: meta.bg, color: meta.color }}>
                {meta.label}
              </span>
              <span className="text-[10px] font-semibold" style={{ color: '#CBD5E1' }}>{timeStr}</span>
            </div>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#0A0F1E' }}>{approval.title || approval.type}</h3>
            {approval.description && (
              <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{approval.description}</p>
            )}
            {approval.metadata && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {Object.entries(approval.metadata).map(([k, v]) => (
                  <span key={k} className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: '#F8FAFF', border: '1px solid rgba(91,95,255,0.08)', color: '#64748B' }}>
                    <span className="font-bold">{k}:</span> {String(v)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3.5" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <button onClick={handleApprove} disabled={!!loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all"
            style={{ background: loading === 'approve' ? '#E2E8F0' : 'linear-gradient(135deg,#10B981,#059669)', color: loading === 'approve' ? '#94A3B8' : '#fff', boxShadow: loading === 'approve' ? 'none' : '0 4px 12px rgba(16,185,129,0.28)', opacity: loading && loading !== 'approve' ? 0.4 : 1 }}>
            <CheckCircle size={13} />
            {loading === 'approve' ? 'Approving…' : 'Approve'}
          </button>

          <button onClick={handleReject} disabled={!!loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all"
            style={{ background: loading === 'reject' ? '#E2E8F0' : 'rgba(239,68,68,0.07)', color: loading === 'reject' ? '#94A3B8' : '#EF4444', border: '1.5px solid rgba(239,68,68,0.15)', opacity: loading && loading !== 'reject' ? 0.4 : 1 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}>
            <XCircle size={13} />
            {loading === 'reject' ? 'Rejecting…' : 'Reject'}
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: meta.color }} />
            <span className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>Awaiting decision</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ApprovalsView() {
  const { pendingApprovals, activeCompanyId } = useCompany();

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>
      <div className="flex items-center justify-between px-8 py-5 flex-shrink-0">
        <div>
          <h1 className="heading-serif text-3xl font-bold" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Approvals</h1>
          <p className="text-sm mt-1 font-medium" style={{ color: '#64748B' }}>
            {pendingApprovals.length > 0
              ? `${pendingApprovals.length} decision${pendingApprovals.length !== 1 ? 's' : ''} waiting for your sign-off`
              : 'All clear — no pending decisions'}
          </p>
        </div>
        {pendingApprovals.length > 0 && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{ background: 'rgba(91,95,255,0.08)', border: '1.5px solid rgba(91,95,255,0.15)' }}>
            <span className="relative flex-shrink-0" style={{ width: 8, height: 8 }}>
              <span className="block w-2 h-2 rounded-full" style={{ background: '#5B5FFF' }} />
              <span className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ background: '#5B5FFF' }} />
            </span>
            <span className="text-sm font-bold" style={{ color: '#5B5FFF' }}>{pendingApprovals.length} pending</span>
          </motion.div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {pendingApprovals.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-2"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.10), rgba(16,185,129,0.05))', border: '1.5px solid rgba(16,185,129,0.15)' }}>
              <CheckCircle2 size={36} style={{ color: '#10B981' }} strokeWidth={1.5} />
            </div>
            <p className="text-base font-bold" style={{ color: '#0A0F1E' }}>All caught up</p>
            <p className="text-sm font-medium text-center max-w-xs" style={{ color: '#94A3B8' }}>
              No decisions waiting. Your agents are operating autonomously.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {pendingApprovals.map((a, i) =>
                a.type === 'needs_input'
                  ? <NeedsInputCard key={a.id} approval={a} companyId={activeCompanyId} index={i} />
                  : <ApprovalCard key={a.id} approval={a} companyId={activeCompanyId} index={i} />
              )}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
