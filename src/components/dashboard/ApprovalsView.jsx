import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Users, DollarSign, Zap, Shield } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { approveRequest, rejectRequest } from '@/lib/approvalService';
import { useAuth } from '@/lib/AuthContext';

const TYPE_META = {
  hire_agent:       { icon: Users,       label: 'Hire Agent',        color: '#6C5CE7' },
  fire_agent:       { icon: XCircle,     label: 'Terminate Agent',   color: '#EF4444' },
  budget_override:  { icon: DollarSign,  label: 'Budget Override',   color: '#FDCB6E' },
  strategy_change:  { icon: Zap,         label: 'Strategy Change',   color: '#0984E3' },
  external_action:  { icon: Shield,      label: 'External Action',   color: '#E17055' },
};

function ApprovalCard({ approval }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null); // 'approve' | 'reject'
  const meta = TYPE_META[approval.type] || TYPE_META.strategy_change;
  const Icon = meta.icon;

  async function handleApprove() {
    setLoading('approve');
    try { await approveRequest(approval.id, user?.id || 'board'); }
    finally { setLoading(null); }
  }

  async function handleReject() {
    setLoading('reject');
    try { await rejectRequest(approval.id, user?.id || 'board', 'Rejected by board.'); }
    finally { setLoading(null); }
  }

  const time = approval.createdAt?.toDate ? approval.createdAt.toDate() : new Date();
  const timeStr = time.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="rounded-2xl p-5 transition-all"
      style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(108,92,231,0.15)', backdropFilter: 'blur(12px)' }}>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${meta.color}15` }}>
          <Icon size={18} style={{ color: meta.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{ background: `${meta.color}15`, color: meta.color }}>
              {meta.label}
            </span>
            <span className="text-xs" style={{ color: '#94A3B8' }}>{timeStr}</span>
          </div>

          <h3 className="font-semibold text-sm mb-1" style={{ color: '#0A0A1A' }}>
            {approval.summary || approval.type}
          </h3>

          {approval.details && (
            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{approval.details}</p>
          )}

          {/* Metadata chips */}
          {approval.metadata && (
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(approval.metadata).map(([k, v]) => (
                <span key={k} className="text-xs px-2 py-1 rounded-lg"
                  style={{ background: '#F1F5F9', color: '#64748B' }}>
                  <span className="font-medium">{k}:</span> {String(v)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <button
          onClick={handleApprove}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: loading === 'approve' ? '#E2E8F0' : '#00B894',
            color: loading === 'approve' ? '#94A3B8' : '#fff',
            opacity: loading && loading !== 'approve' ? 0.5 : 1,
          }}>
          <CheckCircle size={14} />
          {loading === 'approve' ? 'Approving…' : 'Approve'}
        </button>

        <button
          onClick={handleReject}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: loading === 'reject' ? '#E2E8F0' : '#FEF2F2',
            color: loading === 'reject' ? '#94A3B8' : '#EF4444',
            border: '1.5px solid rgba(239,68,68,0.2)',
            opacity: loading && loading !== 'reject' ? 0.5 : 1,
          }}>
          <XCircle size={14} />
          {loading === 'reject' ? 'Rejecting…' : 'Reject'}
        </button>
      </div>
    </div>
  );
}

export default function ApprovalsView() {
  const { pendingApprovals } = useCompany();

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(180deg,#EEF0F8 0%,#F8FAFF 40%,#FFF 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A0A1A' }}>Inbox</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            {pendingApprovals.length > 0
              ? `${pendingApprovals.length} decision${pendingApprovals.length !== 1 ? 's' : ''} waiting for you`
              : 'All clear — no pending decisions'}
          </p>
        </div>
        {pendingApprovals.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)' }}>
            <Clock size={14} style={{ color: '#6C5CE7' }} />
            <span className="text-sm font-bold" style={{ color: '#6C5CE7' }}>{pendingApprovals.length}</span>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {pendingApprovals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(0,184,148,0.1)' }}>✅</div>
            <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
              Nothing waiting. You're all caught up.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map(a => (
              <ApprovalCard key={a.id} approval={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
