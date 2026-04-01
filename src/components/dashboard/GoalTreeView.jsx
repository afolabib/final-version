import { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, Target, Flag, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { createGoal, buildGoalTree } from '@/lib/goalService';

const STATUS_STYLES = {
  active:    { color: '#6C5CE7', bg: '#6C5CE708', label: 'Active' },
  blocked:   { color: '#FDCB6E', bg: '#FDCB6E08', label: 'Blocked' },
  completed: { color: '#00B894', bg: '#00B89408', label: 'Done' },
  cancelled: { color: '#B2BEC3', bg: '#B2BEC308', label: 'Cancelled' },
};

const TYPE_ICONS = {
  mission: '🏔️',
  goal:    '🎯',
  project: '📋',
  task:    '✅',
};

// ─── Create goal inline form ──────────────────────────────────────────────────
function CreateGoalForm({ parentId, companyId, defaultType, onDone, onCancel }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState(defaultType || 'goal');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createGoal(companyId, 'user', { title: title.trim(), parentGoalId: parentId || null });
      onDone();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 mt-2 ml-6">
      <select
        value={type}
        onChange={e => setType(e.target.value)}
        className="text-xs rounded-lg px-2 py-1.5 outline-none"
        style={{ background: '#F1F5F9', border: '1px solid rgba(0,0,0,0.08)', color: '#64748B' }}>
        <option value="goal">Goal</option>
        <option value="project">Project</option>
        <option value="task">Task</option>
      </select>
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') onCancel(); }}
        placeholder="What's the goal?"
        className="flex-1 text-sm px-3 py-1.5 rounded-lg outline-none"
        style={{ background: '#F8FAFF', border: '1.5px solid #6C5CE7', color: '#0A0A1A' }}
      />
      <button onClick={handleCreate} disabled={loading || !title.trim()}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        style={{ background: '#6C5CE7', color: '#fff', opacity: loading || !title.trim() ? 0.6 : 1 }}>
        {loading ? '…' : 'Add'}
      </button>
      <button onClick={onCancel} className="text-xs px-2 py-1.5 rounded-lg hover:bg-slate-100" style={{ color: '#94A3B8' }}>
        ✕
      </button>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value = 0 }) {
  return (
    <div className="h-1 rounded-full overflow-hidden" style={{ background: '#E2E8F0', width: 60 }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, value)}%`, background: '#6C5CE7' }} />
    </div>
  );
}

// ─── Single goal row ──────────────────────────────────────────────────────────
function GoalNode({ goal, depth = 0, companyId }) {
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const hasChildren = goal.children && goal.children.length > 0;
  const st = STATUS_STYLES[goal.status] || STATUS_STYLES.pending;
  const indent = depth * 20;

  return (
    <div>
      <div
        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-colors hover:bg-white"
        style={{ marginLeft: indent }}>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded transition-colors hover:bg-slate-100"
          style={{ color: hasChildren ? '#94A3B8' : 'transparent' }}>
          {hasChildren ? (expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : null}
        </button>

        {/* Type icon */}
        <span className="text-base flex-shrink-0">{TYPE_ICONS[goal.type] || '🎯'}</span>

        {/* Title */}
        <span className="flex-1 text-sm font-medium" style={{ color: '#0A0A1A' }}>{goal.title}</span>

        {/* Status badge */}
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33` }}>
          {st.label}
        </span>

        {/* Progress */}
        {typeof goal.progressPct === 'number' && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ProgressBar value={goal.progressPct} />
            <span className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>{goal.progressPct}%</span>
          </div>
        )}

        {/* Add child */}
        <button
          onClick={() => setAdding(true)}
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg transition-all hover:bg-slate-100"
          style={{ color: '#94A3B8' }}
          title="Add sub-goal">
          <Plus size={12} />
        </button>
      </div>

      {/* Inline create form */}
      {adding && (
        <CreateGoalForm
          parentId={goal.id}
          companyId={companyId}
          defaultType={goal.type === 'goal' ? 'project' : 'task'}
          onDone={() => setAdding(false)}
          onCancel={() => setAdding(false)} />
      )}

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {goal.children.map(child => (
            <GoalNode key={child.id} goal={child} depth={depth + 1} companyId={companyId} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function GoalTreeView() {
  const { goals, activeCompanyId, company } = useCompany();
  const [addingRoot, setAddingRoot] = useState(false);

  const tree = buildGoalTree(goals);

  // Stats
  const total = goals.length;
  const completed = goals.filter(g => g.status === 'completed').length;
  const active = goals.filter(g => g.status === 'active').length;
  const blocked = goals.filter(g => g.status === 'blocked').length;

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(180deg,#EEF0F8 0%,#F8FAFF 40%,#FFF 100%)' }}>

      {/* Header */}
      <div className="px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0A0A1A' }}>Goals</h1>
            {company?.mission && (
              <p className="text-sm mt-1 max-w-lg" style={{ color: '#64748B' }}>
                🏔️ <span className="font-medium">Mission:</span> {company.mission}
              </p>
            )}
          </div>
          <button
            onClick={() => setAddingRoot(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg,#6C5CE7,#7C6CF7)', color: '#fff', boxShadow: '0 4px 14px rgba(108,92,231,0.35)' }}>
            <Plus size={16} />
            Add Goal
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          {[
            { label: 'Total',     value: total,     color: '#6C5CE7' },
            { label: 'Active',    value: active,    color: '#00B894' },
            { label: 'Completed', value: completed, color: '#00B894' },
            { label: 'Blocked',   value: blocked,   color: '#FDCB6E' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-xs" style={{ color: '#94A3B8' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}>

          {/* Add root goal inline */}
          {addingRoot && (
            <div className="px-4 pt-4">
              <CreateGoalForm
                parentId={null}
                companyId={activeCompanyId}
                defaultType="goal"
                onDone={() => setAddingRoot(false)}
                onCancel={() => setAddingRoot(false)} />
            </div>
          )}

          {tree.length === 0 && !addingRoot ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <span className="text-5xl">🎯</span>
              <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                No goals yet. Add your first goal to get started.
              </p>
            </div>
          ) : (
            <div className="py-2">
              {tree.map(root => (
                <GoalNode key={root.id} goal={root} depth={0} companyId={activeCompanyId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
