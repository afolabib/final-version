import { useState } from 'react';
import { Plus, Play, Pause, Clock, RefreshCw, Trash2, Zap } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { triggerManualHeartbeat } from '@/lib/heartbeatService';

// Routine templates for quick creation
const ROUTINE_TEMPLATES = [
  { id: 'daily-standup',    label: 'Daily Standup',         cron: '0 9 * * 1-5',  emoji: '☀️',  desc: 'Morning brief: review tasks, blockers, priorities' },
  { id: 'lead-review',      label: 'Lead Review',           cron: '0 */4 * * *',  emoji: '💼',  desc: 'Qualify and score new leads every 4 hours' },
  { id: 'inbox-triage',     label: 'Inbox Triage',          cron: '*/30 * * * *', emoji: '📬',  desc: 'Triage and respond to support tickets every 30 min' },
  { id: 'weekly-report',    label: 'Weekly Report',         cron: '0 17 * * 5',   emoji: '📊',  desc: 'Compile weekly performance metrics every Friday' },
  { id: 'health-check',     label: 'Agent Health Check',    cron: '*/15 * * * *', emoji: '💓',  desc: 'Verify all agents are responsive and on-task' },
  { id: 'content-queue',    label: 'Content Queue',         cron: '0 8 * * *',    emoji: '✍️',  desc: 'Draft and schedule social content each morning' },
];

function cronToHuman(cron) {
  const map = {
    '0 9 * * 1-5':  'Weekdays at 9am',
    '0 */4 * * *':  'Every 4 hours',
    '*/30 * * * *': 'Every 30 minutes',
    '0 17 * * 5':   'Fridays at 5pm',
    '*/15 * * * *': 'Every 15 minutes',
    '0 8 * * *':    'Daily at 8am',
  };
  return map[cron] || cron;
}

function RoutineCard({ routine, onToggle, onDelete, onRunNow }) {
  const [running, setRunning] = useState(false);

  async function handleRunNow() {
    setRunning(true);
    try { await onRunNow(routine); }
    finally { setRunning(false); }
  }

  return (
    <div className="group rounded-2xl p-5 transition-all"
      style={{
        background: 'rgba(255,255,255,0.85)',
        border: routine.active ? '1.5px solid rgba(108,92,231,0.2)' : '1px solid rgba(0,0,0,0.07)',
        backdropFilter: 'blur(12px)',
      }}>

      <div className="flex items-start gap-3">
        {/* Emoji */}
        <div className="text-2xl flex-shrink-0 mt-0.5">{routine.emoji}</div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm" style={{ color: '#0A0A1A' }}>{routine.label}</h3>
            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{
                background: routine.active ? 'rgba(0,184,148,0.12)' : '#F1F5F9',
                color: routine.active ? '#00B894' : '#94A3B8',
              }}>
              {routine.active ? 'Active' : 'Paused'}
            </span>
          </div>
          <p className="text-xs mb-2 line-clamp-1" style={{ color: '#64748B' }}>{routine.desc}</p>
          <div className="flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
            <Clock size={11} />
            <span className="text-xs">{cronToHuman(routine.cron)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={handleRunNow}
            disabled={running}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            title="Run now"
            style={{ color: running ? '#94A3B8' : '#6C5CE7' }}>
            {running ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
          </button>
          <button
            onClick={() => onToggle(routine)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            title={routine.active ? 'Pause' : 'Resume'}
            style={{ color: '#64748B' }}>
            {routine.active ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={() => onDelete(routine.id)}
            className="p-2 rounded-xl hover:bg-red-50 transition-colors"
            title="Delete routine"
            style={{ color: '#EF4444' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RoutinesView() {
  const { activeCompanyId } = useCompany();
  const [routines, setRoutines] = useState(
    ROUTINE_TEMPLATES.map(t => ({ ...t, active: false, id: t.id }))
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [triggering, setTriggering] = useState(false);

  function handleToggle(routine) {
    setRoutines(rs => rs.map(r => r.id === routine.id ? { ...r, active: !r.active } : r));
  }

  function handleDelete(id) {
    setRoutines(rs => rs.filter(r => r.id !== id));
  }

  async function handleRunNow(routine) {
    // Trigger a manual heartbeat run tagged to this routine
    await triggerManualHeartbeat(null, activeCompanyId);
  }

  async function handleGlobalHeartbeat() {
    setTriggering(true);
    try { await triggerManualHeartbeat(null, activeCompanyId); }
    finally { setTriggering(false); }
  }

  function addTemplate(template) {
    if (!routines.find(r => r.id === template.id)) {
      setRoutines(rs => [...rs, { ...template, active: true }]);
    }
    setShowTemplates(false);
  }

  const activeCount = routines.filter(r => r.active).length;

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(180deg,#EEF0F8 0%,#F8FAFF 40%,#FFF 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A0A1A' }}>Routines</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            {activeCount} active routine{activeCount !== 1 ? 's' : ''} — runs via OpenClaw on Fly.io
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGlobalHeartbeat}
            disabled={triggering}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm transition-all hover:bg-white"
            style={{ color: '#64748B', border: '1px solid rgba(0,0,0,0.08)' }}>
            <RefreshCw size={14} className={triggering ? 'animate-spin' : ''} />
            {triggering ? 'Pinging…' : 'Ping agents'}
          </button>
          <button
            onClick={() => setShowTemplates(s => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg,#6C5CE7,#7C6CF7)', color: '#fff', boxShadow: '0 4px 14px rgba(108,92,231,0.35)' }}>
            <Plus size={16} />
            Add Routine
          </button>
        </div>
      </div>

      {/* Template picker */}
      {showTemplates && (
        <div className="px-8 pb-4 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(108,92,231,0.2)', background: 'rgba(255,255,255,0.9)' }}>
            <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6C5CE7', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              Choose a template
            </div>
            <div className="grid grid-cols-2 gap-0 divide-x divide-y" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              {ROUTINE_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => addTemplate(t)}
                  disabled={!!routines.find(r => r.id === t.id)}
                  className="text-left flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors disabled:opacity-40">
                  <span className="text-xl">{t.emoji}</span>
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#0A0A1A' }}>{t.label}</div>
                    <div className="text-xs" style={{ color: '#94A3B8' }}>{cronToHuman(t.cron)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Routines grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <span className="text-5xl">⏰</span>
            <p className="text-sm" style={{ color: '#94A3B8' }}>No routines yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routines.map(r => (
              <RoutineCard key={r.id} routine={r} onToggle={handleToggle} onDelete={handleDelete} onRunNow={handleRunNow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
