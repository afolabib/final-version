import { useState, useRef } from 'react';
import { Plus, Trash2, Pause, Play, Settings } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useCompany } from '@/contexts/CompanyContext';
import { AGENT_STATUS, ROLE_COLORS, getRoleEmoji, fireAgent, pauseAgent, resumeAgent, buildOrgTree, updateAgent } from '@/lib/agentService';
import { localUpdateAgent } from '@/lib/localDB';
import { isDemoMode } from '@/lib/firebaseClient';
import AgentHireModal from './AgentHireModal';
import AgentConfigModal from './AgentConfigModal';

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || '#5B5FFF';
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: `${c}22`, color: c, border: `1px solid ${c}44` }}>
      {role}
    </span>
  );
}

// ─── Status dot ───────────────────────────────────────────────────────────────
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

// ─── Agent card ───────────────────────────────────────────────────────────────
function AgentCard({ agent, isRoot, onFire, onPause, onResume, onHireUnder, onConfigure, onDragStart, onDragOver, onDrop, isDragOver }) {
  const [confirming, setConfirming] = useState(false);
  const roleColor = ROLE_COLORS[agent.role] || '#5B5FFF';

  async function handleFire() {
    if (!confirming) { setConfirming(true); return; }
    await onFire(agent.id);
    setConfirming(false);
  }

  return (
    <div
      draggable={!isRoot}
      onDragStart={e => { if (!isRoot) onDragStart(e, agent.id); }}
      onDragOver={e => { e.preventDefault(); onDragOver(agent.id); }}
      onDrop={e => { e.preventDefault(); onDrop(agent.id); }}
      onDragLeave={() => onDragOver(null)}
      className="relative group rounded-2xl border transition-all duration-200"
      style={{
        background: isDragOver ? `${roleColor}10` : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        border: isDragOver
          ? `2px dashed ${roleColor}`
          : '1px solid rgba(0,0,0,0.07)',
        width: 190,
        padding: '14px 14px 10px',
        cursor: isRoot ? 'default' : 'grab',
        boxShadow: isDragOver
          ? `0 0 0 4px ${roleColor}20`
          : '0 2px 12px rgba(0,0,0,0.06)',
        transform: isDragOver ? 'scale(1.03)' : 'none',
        transition: 'all 200ms ease',
      }}>

      {/* Role color bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: roleColor }} />

      {/* Avatar + status */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${roleColor}22` }}>
          {getRoleEmoji(agent)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <StatusDot status={agent.status} />
            <span className="font-semibold text-sm truncate" style={{ color: '#0A0A1A' }}>{agent.name}</span>
          </div>
          <RoleBadge role={agent.role} />
        </div>
      </div>

      {/* Current task */}
      {agent.currentTask && (
        <p className="text-[11px] mb-2 line-clamp-1" style={{ color: '#64748B' }}>
          ⚡ {agent.currentTask}
        </p>
      )}

      {/* Drag hint for non-root */}
      {!isRoot && (
        <p className="text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity mb-1"
          style={{ color: '#CBD5E1' }}>
          drag to reassign reporting line
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="flex-1 text-[10px] font-medium px-2 py-1 rounded-lg transition-colors"
          style={{ background: '#F1F5F9', color: '#64748B' }}
          onClick={() => onHireUnder(agent.id)}>
          + Hire under
        </button>
        <button
          onClick={() => onConfigure(agent)}
          className="p-1.5 rounded-lg transition-colors hover:bg-indigo-50"
          title="Configure"
          style={{ color: '#5B5FFF' }}>
          <Settings size={12} />
        </button>

        {(agent.status === AGENT_STATUS.ACTIVE || agent.status === AGENT_STATUS.SLEEPING) && (
          <button
            onClick={() => agent.status === AGENT_STATUS.PAUSED ? onResume(agent.id) : onPause(agent.id)}
            className="p-1.5 rounded-lg transition-colors hover:bg-slate-100"
            style={{ color: '#64748B' }}>
            {agent.status === AGENT_STATUS.PAUSED ? <Play size={12} /> : <Pause size={12} />}
          </button>
        )}

        {!isRoot && (
          <button
            onClick={handleFire}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: confirming ? '#EF4444' : '#94A3B8', background: confirming ? '#FEF2F2' : 'transparent' }}>
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Connector lines (SVG-based, drawn over the layout) ───────────────────────
function ConnectorLines({ parentRef, childRefs }) {
  // This uses CSS-based approach for reliability
  return null;
}

// ─── Org node (recursive) ─────────────────────────────────────────────────────
function OrgNode({ agent, onFire, onPause, onResume, onHireUnder, onConfigure, onDragStart, onDragOver, onDrop, dragOverId }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = agent.children && agent.children.length > 0;

  return (
    <div className="flex flex-col items-center select-none">
      <AgentCard
        agent={agent}
        isRoot={agent.isCEO}
        onFire={onFire}
        onPause={onPause}
        onResume={onResume}
        onHireUnder={onHireUnder}
        onConfigure={onConfigure}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        isDragOver={dragOverId === agent.id}
      />

      {hasChildren && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-1 text-[9px] font-semibold transition-colors"
          style={{ color: '#CBD5E1' }}
          onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
          onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}>
          {expanded ? '▲ collapse' : `▼ ${agent.children.length} reports`}
        </button>
      )}

      {hasChildren && expanded && (
        <div className="flex flex-col items-center">
          {/* Vertical stem down from parent */}
          <div style={{ width: 1, height: 24, background: '#CBD5E1' }} />

          {agent.children.length === 1 ? (
            // Single child — straight line
            <div className="flex flex-col items-center">
              <OrgNode
                agent={agent.children[0]}
                onFire={onFire} onPause={onPause} onResume={onResume} onHireUnder={onHireUnder} onConfigure={onConfigure}
                onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} dragOverId={dragOverId}
              />
            </div>
          ) : (
            // Multiple children — horizontal bar + branches
            <div className="flex flex-col items-center w-full">
              {/* Horizontal bar spanning children */}
              <div className="relative flex items-start" style={{ gap: 24 }}>
                {/* The horizontal connector bar */}
                <div
                  className="absolute"
                  style={{
                    top: 0,
                    left: '50%',
                    transform: 'none',
                    height: 1,
                    background: '#CBD5E1',
                    // Spans from center of first child to center of last child
                    left: `calc(${100 / (agent.children.length * 2)}%)`,
                    right: `calc(${100 / (agent.children.length * 2)}%)`,
                  }}
                />
                {agent.children.map((child, i) => (
                  <div key={child.id} className="flex flex-col items-center">
                    {/* Vertical drop down to child card */}
                    <div style={{ width: 1, height: 24, background: '#CBD5E1' }} />
                    <OrgNode
                      agent={child}
                      onFire={onFire} onPause={onPause} onResume={onResume} onHireUnder={onHireUnder}
                      onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} dragOverId={dragOverId}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function OrgChartView({ embedded = false }) {
  const { agents, activeCompanyId } = useCompany();
  const [hireOpen, setHireOpen] = useState(false);
  const [hireReportsTo, setHireReportsTo] = useState(null);
  const [configAgent, setConfigAgent] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const tree = buildOrgTree(agents);

  async function handleFire(agentId) {
    await fireAgent(activeCompanyId, 'user', agentId);
  }
  async function handlePause(agentId) { await pauseAgent(agentId); }
  async function handleResume(agentId) { await resumeAgent(agentId); }
  function handleHireUnder(reportsToId) { setHireReportsTo(reportsToId); setHireOpen(true); }

  function handleDragStart(e, agentId) {
    setDragId(agentId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(agentId) {
    if (agentId !== dragId) setDragOverId(agentId);
  }

  async function handleDrop(targetId) {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }

    // Prevent dropping onto own descendant
    const isDescendant = (nodeId, potentialAncestorId) => {
      const node = agents.find(a => a.id === nodeId);
      if (!node) return false;
      if (node.reportsTo === potentialAncestorId) return true;
      if (node.reportsTo) return isDescendant(node.reportsTo, potentialAncestorId);
      return false;
    };
    if (isDescendant(targetId, dragId)) { setDragId(null); setDragOverId(null); return; }

    // Update reportsTo
    if (isDemoMode) {
      localUpdateAgent(activeCompanyId, dragId, { reportsTo: targetId });
    } else {
      await updateAgent(dragId, { reportsTo: targetId });
    }

    setDragId(null);
    setDragOverId(null);
  }

  return (
    <div className={embedded ? 'flex flex-col' : 'h-full flex flex-col'}
      style={embedded ? {} : { background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>

      {/* Header — hidden when embedded */}
      {!embedded && (
        <div className="flex items-center justify-between px-8 py-5 flex-shrink-0">
          <div>
            <h1 className="heading-serif text-3xl font-bold" style={{ color: '#0A0F1E' }}>Team</h1>
            <p className="text-sm mt-1 font-medium" style={{ color: '#64748B' }}>
              {agents.length} operator{agents.length !== 1 ? 's' : ''} · drag cards to reassign reporting lines
            </p>
          </div>
          <button
            onClick={() => { setHireReportsTo(null); setHireOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg,#5B5FFF,#6B63FF)', color: '#fff', boxShadow: '0 4px 14px rgba(91,95,255,0.35)' }}>
            <Plus size={16} />
            Hire Agent
          </button>
        </div>
      )}

      {/* Chart */}
      <div className={embedded ? 'overflow-auto p-6' : 'flex-1 overflow-auto p-8'}
        onDragOver={e => e.preventDefault()}
        onDrop={() => { setDragId(null); setDragOverId(null); }}>
        {tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(91,95,255,0.1)' }}>🧠</div>
            <p className="text-center font-medium" style={{ color: '#64748B' }}>
              No agents yet. Hire your first agent to get started.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center min-w-max mx-auto gap-0">
            {tree.map(root => (
              <OrgNode
                key={root.id}
                agent={root}
                onFire={handleFire}
                onPause={handlePause}
                onResume={handleResume}
                onHireUnder={handleHireUnder}
                onConfigure={setConfigAgent}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                dragOverId={dragOverId}
              />
            ))}
          </div>
        )}
      </div>

      {hireOpen && (
        <AgentHireModal reportsToId={hireReportsTo} onClose={() => setHireOpen(false)} />
      )}

      <AnimatePresence>
        {configAgent && (
          <AgentConfigModal agent={configAgent} onClose={() => setConfigAgent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
