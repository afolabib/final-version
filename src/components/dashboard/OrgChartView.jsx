import { useState } from 'react';
import { Plus, Trash2, Pause, Play, AlertCircle, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { AGENT_ROLES, AGENT_STATUS, ROLE_COLORS, fireAgent, pauseAgent, resumeAgent, buildOrgTree } from '@/lib/agentService';
import AgentHireModal from './AgentHireModal';

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || '#6C5CE7';
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: `${c}22`, color: c, border: `1px solid ${c}44` }}>
      {role}
    </span>
  );
}

// ─── Status dot ──────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const map = {
    [AGENT_STATUS.ACTIVE]:   { color: '#00B894', pulse: true },
    [AGENT_STATUS.SLEEPING]: { color: '#FDCB6E', pulse: false },
    [AGENT_STATUS.PAUSED]:   { color: '#B2BEC3', pulse: false },
    [AGENT_STATUS.ERROR]:    { color: '#D63031', pulse: true },
  };
  const { color = '#B2BEC3', pulse = false } = map[status] || {};
  return (
    <span className="relative flex-shrink-0" style={{ width: 8, height: 8 }}>
      <span className="block rounded-full w-2 h-2" style={{ background: color }} />
      {pulse && <span className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: color }} />}
    </span>
  );
}

// ─── Agent card ──────────────────────────────────────────────────────────────
function AgentCard({ agent, isRoot, onFire, onPause, onResume, onHireUnder, children }) {
  const [expanded, setExpanded] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const hasChildren = children && children.length > 0;
  const roleColor = ROLE_COLORS[agent.role] || '#6C5CE7';

  async function handleFire() {
    if (!confirming) { setConfirming(true); return; }
    await onFire(agent.id);
    setConfirming(false);
  }

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div className="relative group rounded-2xl border transition-all duration-200 hover:shadow-md"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,0,0.07)',
          width: 200,
          padding: '16px 16px 12px',
        }}>

        {/* Role color bar */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: roleColor }} />

        {/* Avatar + status */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: `${roleColor}22` }}>
            {agent.avatar || (agent.isCEO ? '🧠' : '🤖')}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <StatusDot status={agent.status} />
              <span className="font-semibold text-sm truncate" style={{ color: '#0A0A1A' }}>{agent.name}</span>
            </div>
            <RoleBadge role={agent.role} />
          </div>
        </div>

        {/* Current task snippet */}
        {agent.currentTask && (
          <p className="text-[11px] mb-2 line-clamp-1" style={{ color: '#64748B' }}>
            ⚡ {agent.currentTask}
          </p>
        )}

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="flex-1 text-[10px] font-medium px-2 py-1 rounded-lg transition-colors"
            style={{ background: '#F1F5F9', color: '#64748B' }}
            onClick={() => onHireUnder(agent.id)}
            title="Hire agent reporting to this one">
            + Hire under
          </button>

          {agent.status === AGENT_STATUS.ACTIVE || agent.status === AGENT_STATUS.SLEEPING ? (
            <button
              onClick={() => agent.status === AGENT_STATUS.PAUSED ? onResume(agent.id) : onPause(agent.id)}
              className="p-1.5 rounded-lg transition-colors hover:bg-slate-100"
              title={agent.status === AGENT_STATUS.PAUSED ? 'Resume' : 'Pause'}
              style={{ color: '#64748B' }}>
              {agent.status === AGENT_STATUS.PAUSED ? <Play size={12} /> : <Pause size={12} />}
            </button>
          ) : null}

          {!isRoot && (
            <button
              onClick={handleFire}
              className="p-1.5 rounded-lg transition-colors"
              title={confirming ? 'Click again to confirm' : 'Fire agent'}
              style={{ color: confirming ? '#EF4444' : '#94A3B8', background: confirming ? '#FEF2F2' : 'transparent' }}>
              <Trash2 size={12} />
            </button>
          )}
        </div>

        {/* Expand toggle */}
        {hasChildren && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-colors"
            style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', color: '#64748B' }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="mt-6 flex flex-col items-center">
          {/* Vertical connector line */}
          <div className="w-px bg-slate-200" style={{ height: 20 }} />
          {/* Horizontal bar + children */}
          <div className="flex items-start gap-6">
            {children.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Connector dot */}
                <div className="w-px bg-slate-200" style={{ height: 20 }} />
                <OrgNode agent={child} onFire={onFire} onPause={onPause} onResume={onResume} onHireUnder={onHireUnder} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Recursive org node ───────────────────────────────────────────────────────
function OrgNode({ agent, onFire, onPause, onResume, onHireUnder }) {
  return (
    <AgentCard agent={agent} isRoot={agent.isCEO} onFire={onFire} onPause={onPause} onResume={onResume} onHireUnder={onHireUnder}
      children={agent.children || []}>
    </AgentCard>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function OrgChartView() {
  const { agents, activeCompanyId } = useCompany();
  const [hireOpen, setHireOpen] = useState(false);
  const [hireReportsTo, setHireReportsTo] = useState(null);

  const tree = buildOrgTree(agents);

  async function handleFire(agentId) {
    await fireAgent(activeCompanyId, 'user', agentId);
  }

  async function handlePause(agentId) {
    await pauseAgent(agentId);
  }

  async function handleResume(agentId) {
    await resumeAgent(agentId);
  }

  function handleHireUnder(reportsToId) {
    setHireReportsTo(reportsToId);
    setHireOpen(true);
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(180deg,#EEF0F8 0%,#F8FAFF 40%,#FFF 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A0A1A' }}>Team</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            {agents.length} agent{agents.length !== 1 ? 's' : ''} in your organization
          </p>
        </div>
        <button
          onClick={() => { setHireReportsTo(null); setHireOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
          style={{ background: 'linear-gradient(135deg,#6C5CE7,#7C6CF7)', color: '#fff', boxShadow: '0 4px 14px rgba(108,92,231,0.35)' }}>
          <Plus size={16} />
          Hire Agent
        </button>
      </div>

      {/* Org chart */}
      <div className="flex-1 overflow-auto p-8">
        {tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(108,92,231,0.1)' }}>🧠</div>
            <p className="text-center font-medium" style={{ color: '#64748B' }}>
              No agents yet. Hire your first agent to get started.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center min-w-max mx-auto">
            {tree.map(root => (
              <OrgNode key={root.id} agent={root}
                onFire={handleFire} onPause={handlePause} onResume={handleResume} onHireUnder={handleHireUnder} />
            ))}
          </div>
        )}
      </div>

      {/* Hire modal */}
      {hireOpen && (
        <AgentHireModal
          reportsToId={hireReportsTo}
          onClose={() => setHireOpen(false)} />
      )}
    </div>
  );
}
