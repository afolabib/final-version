import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Users, DollarSign, Zap, Shield, CheckCircle2, Inbox, HelpCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompany } from '@/contexts/CompanyContext';
import { approveRequest, rejectRequest } from '@/lib/approvalService';
import { useAuth } from '@/lib/AuthContext';

const TYPE_META = {
  needs_input:      { icon: HelpCircle,  label: 'Agent Needs Help',  color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
  hire_agent:       { icon: Users,       label: 'Hire Agent',        color: '#5B5FFF', bg: 'rgba(91,95,255,0.08)' },
  fire_agent:       { icon: XCircle,     label: 'Terminate Agent',   color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  budget_override:  { icon: DollarSign,  label: 'Budget Override',   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  strategy_change:  { icon: Zap,         label: 'Strategy Change',   color: '#0984E3', bg: 'rgba(9,132,227,0.08)' },
  external_action:  { icon: Shield,      label: 'External Action',   color: '#E17055', bg: 'rgba(225,112,85,0.08)' },
};

// ── needs_input card: conversational response UI ──────────────────────────────
function NeedsInputCard({ approval, companyId, index }) {
  const { user } = useAuth();
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(null);
  const [done, setDone] = useState(null);
  const meta = TYPE_META.needs_input;
  const uid = user?.uid || user?.id || 'board';

  const time = approval.createdAt?.toDate ? approval.createdAt.toDate() : new Date();
  const timeStr = time.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const agentName = approval.agentName || 'Agent';

  async function handleSend() {
    if (!response.trim()) return;
    setLoading('send');
    try {
      await approveRequest(companyId, uid, approval.id, response.trim());
      setDone('sent');
    } finally { setLoading(null); }
  }

  async function handleCantHelp() {
    setLoading('cant');
    try {
      await rejectRequest(companyId, uid, approval.id, "Founder can't provide this right now.");
      setDone('cant');
    } finally { setLoading(null); }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="rounded-2xl px-5 py-4 flex items-center gap-3"
        style={{ background: done === 'sent' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.04)', border: `1px solid ${done === 'sent' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.10)'}` }}>
        {done === 'sent'
          ? <CheckCircle2 size={16} style={{ color: '#10B981' }} />
          : <XCircle size={16} style={{ color: '#EF4444' }} />}
        <span className="text-sm font-semibold" style={{ color: done === 'sent' ? '#059669' : '#DC2626' }}>
          {done === 'sent' ? 'Response sent — agent will retry' : "Skipped — agent will move on"}
        </span>
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

      <div className="px-5 pt-4 pb-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1.5px solid rgba(139,92,246,0.2)' }}>
            <HelpCircle size={19} style={{ color: '#8B5CF6' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                Agent Needs Your Help
              </span>
              <span className="text-[10px] font-semibold" style={{ color: '#CBD5E1' }}>{timeStr}</span>
            </div>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#0A0F1E' }}>{approval.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{approval.description}</p>
          </div>
        </div>

        {/* Response input */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.03)' }}>
          <div className="px-4 pt-3 pb-1">
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#8B5CF6' }}>
              Your response — the agent will use this to continue
            </p>
            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="Type your answer here… e.g. 'The API key is sk-...' or 'Use the Stripe test account' or 'Proceed with option B'"
              rows={3}
              className="w-full text-sm outline-none resize-none bg-transparent leading-relaxed"
              style={{ color: '#0A0A1A', caretColor: '#8B5CF6' }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend(); }}
            />
          </div>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: '1px solid rgba(139,92,246,0.1)' }}>
            <span className="text-[10px]" style={{ color: '#CBD5E1' }}>⌘ Enter to send</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCantHelp}
                disabled={!!loading}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ color: '#94A3B8', background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
                {loading === 'cant' ? 'Skipping…' : "Can't help"}
              </button>
              <button
                onClick={handleSend}
                disabled={!response.trim() || !!loading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-sm transition-all"
                style={{
                  background: response.trim() ? 'linear-gradient(135deg,#8B5CF6,#7C3AED)' : 'rgba(139,92,246,0.2)',
                  color: response.trim() ? '#fff' : '#8B5CF6',
                  boxShadow: response.trim() ? '0 4px 12px rgba(139,92,246,0.3)' : 'none',
                }}>
                <Send size={12} />
                {loading === 'send' ? 'Sending…' : 'Send to agent'}
              </button>
            </div>
          </div>
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
