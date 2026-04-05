import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Bot, Circle, Clock, AlertTriangle, CheckCircle2, Ban, Layers } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/lib/AuthContext';
import { createTask, updateTask, TASK_STATUS } from '@/lib/taskService';

// ── Column config ─────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    id: TASK_STATUS.TODO,
    label: 'To Do',
    icon: Circle,
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.18)',
    dotColor: '#CBD5E1',
  },
  {
    id: TASK_STATUS.IN_PROGRESS,
    label: 'In Progress',
    icon: Clock,
    color: '#5B5FFF',
    bg: 'rgba(91,95,255,0.06)',
    border: 'rgba(91,95,255,0.18)',
    dotColor: '#5B5FFF',
  },
  {
    id: TASK_STATUS.NEEDS_REVIEW,
    label: 'Needs Review',
    icon: AlertTriangle,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.20)',
    dotColor: '#F59E0B',
  },
  {
    id: TASK_STATUS.DONE,
    label: 'Done',
    icon: CheckCircle2,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.18)',
    dotColor: '#10B981',
  },
  {
    id: TASK_STATUS.BLOCKED,
    label: 'Blocked',
    icon: Ban,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.18)',
    dotColor: '#EF4444',
  },
];

const PRIORITY_COLORS = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#5B5FFF',
  low: '#94A3B8',
};

// ── Quick-add card ─────────────────────────────────────────────────────────────
function AddTaskCard({ companyId, userId, status, onDone, onCancel }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createTask(companyId, userId, { title: title.trim(), priority: 'medium', status });
      onDone();
    } finally { setLoading(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="rounded-2xl p-3 mb-2"
      style={{ background: '#fff', border: '1.5px solid rgba(91,95,255,0.20)', boxShadow: '0 4px 16px rgba(91,95,255,0.10)' }}>
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
        placeholder="Task name…"
        className="w-full text-sm font-medium outline-none bg-transparent mb-2.5"
        style={{ color: '#0A0F1E' }}
      />
      <div className="flex items-center gap-2">
        <button onClick={submit} disabled={loading || !title.trim()}
          className="flex-1 py-1.5 rounded-xl text-xs font-black transition-all"
          style={{
            background: title.trim() ? 'linear-gradient(135deg,#5B5FFF,#7C3AED)' : '#E2E8F0',
            color: title.trim() ? '#fff' : '#94A3B8',
          }}>
          {loading ? '…' : 'Add'}
        </button>
        <button onClick={onCancel}
          className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"
          style={{ color: '#CBD5E1' }}>
          <X size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Task card (plain div — motion wrapper is in Column) ───────────────────────
function TaskCard({ task, agents, isDragging, onDragStart, onDragEnd }) {
  const assignedAgent = agents.find(a => a.id === task.assignedAgentId);
  const priColor = PRIORITY_COLORS[task.priority] || '#94A3B8';
  const goalName = task._goalTitle;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="rounded-2xl p-3.5 mb-2.5 cursor-grab active:cursor-grabbing select-none transition-all"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: isDragging ? '0 16px 48px rgba(91,95,255,0.18)' : '0 2px 8px rgba(0,0,0,0.05)',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      }}>
      <p className="text-sm font-semibold leading-snug mb-2" style={{ color: '#0A0F1E' }}>
        {task.title}
      </p>
      {goalName && (
        <p className="text-[10px] font-semibold mb-2 px-2 py-0.5 rounded-full inline-block"
          style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
          {goalName}
        </p>
      )}
      {task.outputSummary && (
        <p className="text-[11px] leading-relaxed mb-2 line-clamp-2" style={{ color: '#64748B' }}>
          {task.outputSummary}
        </p>
      )}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5">
          {task.priority && task.priority !== 'medium' && (
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
              style={{ background: `${priColor}15`, color: priColor }}>
              {task.priority}
            </span>
          )}
        </div>
        {assignedAgent && (
          <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#94A3B8' }}>
            <Bot size={9} />{assignedAgent.name}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────
function Column({ col, tasks, agents, goals, companyId, userId, onTaskMove, draggingTaskId }) {
  const [adding, setAdding] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const ColIcon = col.icon;

  const tasksWithGoals = tasks.map(t => ({
    ...t,
    _goalTitle: goals.find(g => g.id === t.goalId)?.title || null,
  }));

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onTaskMove(taskId, col.id);
  }

  return (
    <div className="flex flex-col min-w-0" style={{ width: 260, flexShrink: 0 }}>
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <ColIcon size={13} style={{ color: col.color }} />
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: col.color }}>
            {col.label}
          </span>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
            style={{ background: col.bg, color: col.color }}>
            {tasks.length}
          </span>
        </div>
        {col.id !== TASK_STATUS.DONE && col.id !== TASK_STATUS.BLOCKED && (
          <button onClick={() => setAdding(true)}
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-200"
            style={{ color: '#CBD5E1' }}>
            <Plus size={13} />
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 min-h-[200px] rounded-2xl p-2.5 transition-all"
        style={{
          background: dragOver ? col.bg : 'rgba(0,0,0,0.02)',
          border: `2px dashed ${dragOver ? col.border : 'transparent'}`,
          transition: 'all 0.15s ease',
        }}>

        <AnimatePresence>
          {adding && (
            <AddTaskCard
              key="add"
              companyId={companyId}
              userId={userId}
              status={col.id}
              onDone={() => setAdding(false)}
              onCancel={() => setAdding(false)}
            />
          )}
          {tasksWithGoals.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              agents={agents}
              isDragging={draggingTaskId === task.id}
              onDragStart={e => {
                e.dataTransfer.setData('taskId', task.id);
                e.dataTransfer.effectAllowed = 'move';
                // bubble up to parent via custom event
                setTimeout(() => document.dispatchEvent(new CustomEvent('kanban:dragstart', { detail: task.id })), 0);
              }}
              onDragEnd={() => {
                document.dispatchEvent(new CustomEvent('kanban:dragend'));
              }}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && !adding && (
          <div className="flex flex-col items-center justify-center h-24 gap-1.5 opacity-40">
            <ColIcon size={18} style={{ color: col.color }} />
            <p className="text-[10px] font-semibold" style={{ color: col.color }}>Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Kanban Board ─────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const { tasks, agents, goals, activeCompanyId } = useCompany();
  const { user } = useAuth();
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const userId = user?.uid || 'user';

  // Listen for drag events from TaskCard
  useEffect(() => {
    const onStart = e => setDraggingTaskId(e.detail);
    const onEnd = () => setDraggingTaskId(null);
    document.addEventListener('kanban:dragstart', onStart);
    document.addEventListener('kanban:dragend', onEnd);
    return () => {
      document.removeEventListener('kanban:dragstart', onStart);
      document.removeEventListener('kanban:dragend', onEnd);
    };
  }, []);

  const totalDone = tasks.filter(t => t.status === TASK_STATUS.DONE).length;
  const totalTasks = tasks.length;
  const inProgress = tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;

  async function handleTaskMove(taskId, newStatus) {
    await updateTask(activeCompanyId, userId, taskId, { status: newStatus });
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F7FF 45%, #FAFCFF 100%)' }}>

      {/* Header */}
      <div className="px-8 py-5 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="heading-serif text-3xl font-bold" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>
              Board
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: '#64748B' }}>
              {totalTasks} tasks · {inProgress} in progress · {totalDone} done
            </p>
          </div>

          {/* Quick stats */}
          {totalTasks > 0 && (
            <div className="flex items-center gap-2">
              {COLUMNS.map(col => {
                const count = tasks.filter(t => t.status === col.id).length;
                if (count === 0) return null;
                const ColIcon = col.icon;
                return (
                  <div key={col.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                    style={{ background: col.bg, border: `1px solid ${col.border}` }}>
                    <ColIcon size={11} style={{ color: col.color }} />
                    <span className="text-xs font-black" style={{ color: col.color }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overall progress bar */}
        {totalTasks > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((totalDone / totalTasks) * 100)}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg,#5B5FFF,#10B981)' }}
              />
            </div>
            <span className="text-xs font-black flex-shrink-0" style={{ color: '#64748B' }}>
              {Math.round((totalDone / totalTasks) * 100)}% complete
            </span>
          </div>
        )}
      </div>

      {/* Board — horizontal scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8">
        {totalTasks === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(91,95,255,0.12), rgba(99,102,241,0.06))',
                border: '1.5px solid rgba(91,95,255,0.15)',
              }}>
              <Layers size={36} style={{ color: '#5B5FFF' }} strokeWidth={1.5} />
            </div>
            <p className="text-base font-bold" style={{ color: '#0A0F1E' }}>No tasks yet</p>
            <p className="text-sm font-medium text-center max-w-xs" style={{ color: '#94A3B8', lineHeight: 1.6 }}>
              Create tasks in Projects or add them directly to a column below.
            </p>
          </motion.div>
        ) : (
          <div className="flex gap-4 h-full" style={{ width: 'max-content' }}>
            {COLUMNS.map(col => (
              <Column
                key={col.id}
                col={col}
                tasks={tasks.filter(t => t.status === col.id)}
                agents={agents}
                goals={goals}
                companyId={activeCompanyId}
                userId={userId}
                onTaskMove={handleTaskMove}
                draggingTaskId={draggingTaskId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
