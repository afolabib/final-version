import { useState } from 'react';
import { X, ChevronRight, DollarSign, Shield, Zap } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { createAgent, AGENT_ROLES, ROLE_COLORS } from '@/lib/agentService';

const ROLE_TEMPLATES = [
  { role: AGENT_ROLES.SALES,      emoji: '💼', label: 'Sales Rep',      desc: 'Qualifies leads, follows up, books demos' },
  { role: AGENT_ROLES.ENGINEER,   emoji: '🛠️', label: 'Engineer',       desc: 'Reviews PRs, writes code, manages issues' },
  { role: AGENT_ROLES.SUPPORT,    emoji: '🎧', label: 'Support',         desc: 'Triages tickets, replies to customers' },
  { role: AGENT_ROLES.MARKETING,  emoji: '📣', label: 'Marketing',       desc: 'Drafts content, schedules posts, tracks metrics' },
  { role: AGENT_ROLES.RESEARCHER, emoji: '🔬', label: 'Researcher',      desc: 'Analyzes data, writes reports, finds insights' },
  { role: AGENT_ROLES.CUSTOM,     emoji: '✨', label: 'Custom',          desc: 'Define a fully custom role and instructions' },
];

const AUTONOMY_LEVELS = [
  { value: 'full',     label: 'Full autonomy',    desc: 'Runs independently, no approval needed' },
  { value: 'approval', label: 'Board approval',   desc: 'Major decisions require your sign-off' },
  { value: 'manual',   label: 'Manual only',      desc: 'Only acts when you explicitly trigger it' },
];

export default function AgentHireModal({ reportsToId, onClose }) {
  const { activeCompanyId, agents } = useCompany();
  const [step, setStep] = useState(1); // 1=role, 2=configure
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({
    name: '',
    customRole: '',
    autonomy: 'approval',
    budgetMonthly: 50,
    instructions: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportsToAgent = agents.find(a => a.id === reportsToId);

  async function handleHire() {
    setError('');
    const name = form.name.trim();
    if (!name) { setError('Agent name is required.'); return; }

    setLoading(true);
    try {
      const role = selectedRole.role === AGENT_ROLES.CUSTOM ? form.customRole || 'custom' : selectedRole.role;
      await createAgent({
        companyId: activeCompanyId,
        name,
        role,
        avatar: selectedRole.emoji,
        reportsTo: reportsToId || null,
        budgetMonthly: Number(form.budgetMonthly),
        requiresApproval: form.autonomy === 'approval',
        autonomyLevel: form.autonomy,
        instructions: form.instructions,
      }, 'user');
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to hire agent.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#fff', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#0A0A1A' }}>
              {step === 1 ? 'Choose a role' : `Configure ${selectedRole?.label}`}
            </h2>
            {reportsToAgent && (
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                Reports to: {reportsToAgent.name}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors" style={{ color: '#64748B' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* Step 1: Role picker */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {ROLE_TEMPLATES.map(t => {
                const color = ROLE_COLORS[t.role] || '#6C5CE7';
                return (
                  <button key={t.role}
                    onClick={() => { setSelectedRole(t); setStep(2); }}
                    className="group text-left rounded-2xl p-4 transition-all border"
                    style={{
                      border: '1.5px solid rgba(0,0,0,0.07)',
                      background: 'rgba(248,250,255,0.8)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'; e.currentTarget.style.background = 'rgba(248,250,255,0.8)'; }}>
                    <div className="text-2xl mb-2">{t.emoji}</div>
                    <div className="font-semibold text-sm mb-1" style={{ color: '#0A0A1A' }}>{t.label}</div>
                    <div className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{t.desc}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Configure */}
          {step === 2 && selectedRole && (
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>Agent Name</label>
                <input
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{ background: '#F8FAFF', border: '1.5px solid rgba(0,0,0,0.08)', color: '#0A0A1A' }}
                  placeholder={`e.g. ${selectedRole.label} Rex`}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = '#6C5CE7'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.08)'; }}
                />
              </div>

              {/* Custom role name */}
              {selectedRole.role === AGENT_ROLES.CUSTOM && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>Role Title</label>
                  <input
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: '#F8FAFF', border: '1.5px solid rgba(0,0,0,0.08)', color: '#0A0A1A' }}
                    placeholder="e.g. Legal Counsel"
                    value={form.customRole}
                    onChange={e => setForm(f => ({ ...f, customRole: e.target.value }))}
                  />
                </div>
              )}

              {/* Autonomy */}
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#64748B' }}>Autonomy Level</label>
                <div className="space-y-2">
                  {AUTONOMY_LEVELS.map(a => (
                    <button key={a.value}
                      onClick={() => setForm(f => ({ ...f, autonomy: a.value }))}
                      className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 transition-all border"
                      style={{
                        border: form.autonomy === a.value ? '1.5px solid #6C5CE7' : '1.5px solid rgba(0,0,0,0.07)',
                        background: form.autonomy === a.value ? 'rgba(108,92,231,0.06)' : '#F8FAFF',
                      }}>
                      <Shield size={14} style={{ color: form.autonomy === a.value ? '#6C5CE7' : '#94A3B8', flexShrink: 0 }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: form.autonomy === a.value ? '#6C5CE7' : '#0A0A1A' }}>{a.label}</div>
                        <div className="text-xs" style={{ color: '#94A3B8' }}>{a.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>
                  <DollarSign size={12} />
                  Monthly Budget Cap (USD)
                </label>
                <div className="flex items-center gap-3">
                  <input type="range" min={10} max={500} step={10}
                    value={form.budgetMonthly}
                    onChange={e => setForm(f => ({ ...f, budgetMonthly: e.target.value }))}
                    className="flex-1 accent-indigo-500" />
                  <span className="text-sm font-bold w-14 text-right" style={{ color: '#6C5CE7' }}>
                    ${form.budgetMonthly}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Agent pauses automatically at 100% of cap.</p>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>
                  Instructions <span className="normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                  style={{ background: '#F8FAFF', border: '1.5px solid rgba(0,0,0,0.08)', color: '#0A0A1A', minHeight: 72 }}
                  placeholder="Specific instructions for this agent…"
                  value={form.instructions}
                  onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                />
              </div>

              {error && (
                <p className="text-sm font-medium rounded-xl px-4 py-2" style={{ background: '#FEF2F2', color: '#EF4444' }}>
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {step === 2 ? (
            <>
              <button onClick={() => setStep(1)}
                className="text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                style={{ color: '#64748B' }}>
                ← Back
              </button>
              <button
                onClick={handleHire}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: loading ? '#E2E8F0' : 'linear-gradient(135deg,#6C5CE7,#7C6CF7)',
                  color: loading ? '#94A3B8' : '#fff',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(108,92,231,0.35)',
                }}>
                {loading ? 'Hiring…' : (
                  <>
                    <Zap size={14} />
                    {form.autonomy === 'approval' ? 'Request Hire' : 'Hire Agent'}
                  </>
                )}
              </button>
            </>
          ) : (
            <button onClick={onClose}
              className="text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              style={{ color: '#64748B' }}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
