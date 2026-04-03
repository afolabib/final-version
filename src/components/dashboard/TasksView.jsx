import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle2, Circle, Clock, AlertTriangle, X } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/lib/AuthContext';
import { subscribeTasks, createTask, updateTask, TASK_STATUS, TASK_PRIORITY } from '@/lib/taskService';
import { ROLE_COLORS } from '@/lib/agentService';

const COLUMNS = [
  { id: TASK_STATUS.TODO,         label: 'To Do',       color: '#94A3B8', Icon: Circle },
  { id: TASK_STATUS.IN_PROGRESS,  label: 'In Progress', color: '#5B5FFF', Icon: Clock },
  { id: TASK_STATUS.NEEDS_REVIEW, label: 'Review',      color: '#F59E0B', Icon: AlertTriangle },
  { id: TASK_STATUS.DONE,         label: 'Done',        color: '#00B894', Icon: CheckCircle2 },
];

const PRIORITY_COLORS = {
  critical: '#EF4444',
  high:     '#F59E0B',
  medium:   '#5B5FFF',
  low:      '#94A3B8',
};

// ─── Task card ────────────────────────────────────────────────────────────────
function TaskCard({ task, agents, onStatusChange }) {
  const agent = agents.find(a => a.id === task.assignedAgentId);
  const agentColor = agent ? (ROLE_COLORS[agent.role] || '#5B5FFF') : null;
  const priColor = PRIORITY_COLORS[task.priority] || '#94A3B8';

  return (
    <div className="rounded-xl p-3 mb-2 group cursor-default transition-all"
      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

      <p className="text-sm font-medium mb-2 leading-snug" style={{ color: '#0A0A1A' }}>{task.title}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Priority */}
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
            style={{ background: `${priColor}18`, color: priColor }}>
            {task.priority}
          </span>
          {/* Agent */}
          {agent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ background: `${agentColor}18`, color: agentColor }}>
              {agent.name}
            </span>
          )}
        </div>

        {/* Move to next status */}
        <select
          value={task.status}
          onChange={e => onStatusChange(task.id, e.target.value)}
          className="text-[10px] rounded-lg px-1.5 py-0.5 outline-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: '#F1F5F9', border: '1px solid rgba(0,0,0,0.08)', color: '#64748B' }}
          onClick={e => e.stopPropagation()}>
          {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Create task form ─────────────────────────────────────────────────────────
function CreateTaskInline({ companyId, userId, defaultStatus, onDone, onCancel }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createTask(companyId, userId, { title: title.trim(), priority: 'medium' });
      onDone();
    } finally { setLoading(false); }
  }

  return (
    <div className="rounded-xl p-3 mb-2" style={{ background: '#F8FAFF', border: '1.5px solid rgba(91,95,255,0.2)' }}>
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') onCancel(); }}
        placeholder="Task title…"
        className="w-full text-sm outline-none bg-transparent mb-2"
        style={{ color: '#0A0A1A' }}
      />
      <div className="flex items-center gap-2">
        <button onClick={handleCreate} disabled={loading || !title.trim()}
          className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
          style={{ background: '#5B5FFF', color: '#fff', opacity: loading || !title.trim() ? 0.5 : 1 }}>
          {loading ? '…' : 'Add'}
        </button>
        <button onClick={onCancel} className="text-xs px-2 py-1 rounded-lg hover:bg-slate-100" style={{ color: '#94A3B8' }}>
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Kanban column ────────────────────────────────────────────────────────────
function KanbanColumn({ col, tasks, agents, companyId, userId, onStatusChange }) {
  const [adding, setAdding] = useState(false);
  const Icon = col.Icon;

  return (
    <div className="flex flex-col min-w-0 flex-1" style={{ minWidth: 200 }}>
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Icon size={13} style={{ color: col.color }} />
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: col.color }}>{col.label}</span>
          <span className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: `${col.color}18`, color: col.color }}>
            {tasks.length}
          </span>
        </div>
        <button onClick={() => setAdding(true)}
          className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-slate-100 transition-colors"
          style={{ color: '#CBD5E1' }}>
          <Plus size={11} />
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 min-h-24">
        {adding && (
          <CreateTaskInline
            companyId={companyId}
            userId={userId}
            defaultStatus={col.id}
            onDone={() => setAdding(false)}
            onCancel={() => setAdding(false)} />
        )}
        {tasks.map(t => (
          <TaskCard key={t.id} task={t} agents={agents} onStatusChange={onStatusChange} />
        ))}
        {tasks.length === 0 && !adding && (
          <div className="flex items-center justify-center py-8 rounded-xl border-2 border-dashed"
            style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <span className="text-xs" style={{ color: '#CBD5E1' }}>No tasks</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function TasksView() {
  const { activeCompanyId, agents } = useCompany();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!activeCompanyId) return;
    const unsub = subscribeTasks(activeCompanyId, setTasks);
    return unsub;
  }, [activeCompanyId]);

  async function handleStatusChange(taskId, newStatus) {
    await updateTask(activeCompanyId, user?.uid || 'user', taskId, { status: newStatus });
  }

  const filtered = search
    ? tasks.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  const byStatus = id => filtered.filter(t => t.status === id);
  const doneCount = tasks.filter(t => t.status === TASK_STATUS.DONE).length;

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F7FF 45%, #FAFCFF 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A0A1A' }}>Tasks</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            {tasks.length} total · {doneCount} done
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)' }}>
            <Search size={13} style={{ color: '#94A3B8' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="text-sm outline-none bg-transparent w-36"
              style={{ color: '#0A0A1A' }}
            />
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto px-8 pb-8">
        <div className="flex gap-4 h-full" style={{ minWidth: 800 }}>
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              col={col}
              tasks={byStatus(col.id)}
              agents={agents}
              companyId={activeCompanyId}
              userId={user?.uid || 'user'}
              onStatusChange={handleStatusChange} />
          ))}
        </div>
      </div>
    </div>
  );
}
