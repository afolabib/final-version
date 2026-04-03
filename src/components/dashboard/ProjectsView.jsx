import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, Circle, Clock, AlertTriangle, CheckCircle2, X, Target, Layers, TrendingUp, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/lib/AuthContext';
import { createGoal, updateGoal, GOAL_STATUS } from '@/lib/goalService';
import { createTask, updateTask, subscribeTasks, TASK_STATUS, TASK_PRIORITY } from '@/lib/taskService';

const GOAL_STATUS_STYLES = {
  active:    { color: '#5B5FFF', bg: 'rgba(91,95,255,0.07)',   label: 'Active',    gradient: 'linear-gradient(135deg,#5B5FFF,#6B63FF)' },
  blocked:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.07)',  label: 'Blocked',   gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)' },
  completed: { color: '#10B981', bg: 'rgba(16,185,129,0.07)',  label: 'Done',      gradient: 'linear-gradient(135deg,#10B981,#059669)' },
  cancelled: { color: '#94A3B8', bg: 'rgba(148,163,184,0.07)', label: 'Cancelled', gradient: 'linear-gradient(135deg,#94A3B8,#64748B)' },
};

const TASK_STATUS_CONFIG = {
  [TASK_STATUS.TODO]:         { color: '#94A3B8', Icon: Circle,        label: 'To do' },
  [TASK_STATUS.IN_PROGRESS]:  { color: '#5B5FFF', Icon: Clock,         label: 'In progress' },
  [TASK_STATUS.NEEDS_REVIEW]: { color: '#F59E0B', Icon: AlertTriangle,  label: 'Review' },
  [TASK_STATUS.DONE]:         { color: '#10B981', Icon: CheckCircle2,   label: 'Done' },
  [TASK_STATUS.BLOCKED]:      { color: '#EF4444', Icon: AlertTriangle,  label: 'Blocked' },
};

const PRIORITY_COLORS = {
  critical: '#EF4444',
  high:     '#F59E0B',
  medium:   '#5B5FFF',
  low:      '#94A3B8',
};

// ── Inline task create ────────────────────────────────────────────────────────
function AddTaskInline({ companyId, userId, goalId, onDone, onCancel }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createTask(companyId, userId, { title: title.trim(), goalId: goalId || null, priority: 'medium' });
      onDone();
    } finally { setLoading(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2.5 px-5 py-3"
      style={{ borderTop: '1px solid rgba(91,95,255,0.06)' }}>
      <div className="w-4 h-4 rounded-full border-2 border-dashed flex-shrink-0" style={{ borderColor: '#CBD5E1' }} />
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handle(); if (e.key === 'Escape') onCancel(); }}
        placeholder="Task name…"
        className="flex-1 text-sm outline-none bg-transparent font-medium"
        style={{ color: '#0A0F1E' }}
      />
      <button onClick={handle} disabled={loading || !title.trim()}
        className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
        style={{ background: title.trim() ? '#5B5FFF' : '#E2E8F0', color: title.trim() ? '#fff' : '#94A3B8', opacity: loading ? 0.6 : 1 }}>
        {loading ? '…' : 'Add'}
      </button>
      <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
        style={{ color: '#CBD5E1' }}>
        <X size={12} />
      </button>
    </motion.div>
  );
}

// ── Task row ──────────────────────────────────────────────────────────────────
function TaskRow({ task, companyId, userId }) {
  const cfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG[TASK_STATUS.TODO];
  const Icon = cfg.Icon;
  const priColor = PRIORITY_COLORS[task.priority] || '#94A3B8';
  const isDone = task.status === TASK_STATUS.DONE;

  async function cycleStatus() {
    const order = [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.NEEDS_REVIEW, TASK_STATUS.DONE];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    await updateTask(companyId, userId, task.id, { status: next });
  }

  return (
    <div className="group flex items-center gap-3 px-5 py-3 transition-all"
      style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <button onClick={cycleStatus} className="flex-shrink-0 transition-transform hover:scale-110 active:scale-95">
        <Icon size={15} style={{ color: cfg.color }} />
      </button>
      <span className={`flex-1 text-sm font-medium transition-all ${isDone ? 'line-through' : ''}`}
        style={{ color: isDone ? '#CBD5E1' : '#0A0F1E' }}>
        {task.title}
      </span>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.priority && task.priority !== 'medium' && (
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
            style={{ background: `${priColor}15`, color: priColor }}>
            {task.priority}
          </span>
        )}
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${cfg.color}12`, color: cfg.color }}>
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────
function ProjectCard({ goal, tasks, companyId, userId, index }) {
  const [expanded, setExpanded] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const st = GOAL_STATUS_STYLES[goal.status] || GOAL_STATUS_STYLES.active;
  const doneCount = tasks.filter(t => t.status === TASK_STATUS.DONE).length;
  const inProgressCount = tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;
  const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden mb-4"
      style={{
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 4px 24px rgba(91,95,255,0.05)',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(91,95,255,0.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(91,95,255,0.05)'}>

      {/* Colored top accent */}
      <div className="h-0.5" style={{ background: st.gradient }} />

      {/* Goal header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer"
        style={{ borderBottom: expanded && (tasks.length > 0 || addingTask) ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
        onClick={() => setExpanded(e => !e)}>

        <button className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100">
          {expanded
            ? <ChevronDown size={13} style={{ color: '#94A3B8' }} />
            : <ChevronRight size={13} style={{ color: '#94A3B8' }} />}
        </button>

        <span className="text-lg flex-shrink-0">{goal.emoji || '🎯'}</span>

        <span className="flex-1 text-sm font-bold" style={{ color: '#0A0F1E', letterSpacing: '-0.01em' }}>
          {goal.title}
        </span>

        {/* Progress bar + pct */}
        {tasks.length > 0 && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {inProgressCount > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full hidden sm:block"
                style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
                {inProgressCount} in progress
              </span>
            )}
            <div className="flex items-center gap-2">
              <div className="relative h-2 rounded-full overflow-hidden" style={{ width: 64, background: '#EEF2FF' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: st.gradient }} />
              </div>
              <span className="text-[11px] font-bold w-7 text-right"
                style={{ color: pct === 100 ? '#10B981' : '#64748B' }}>
                {pct}%
              </span>
            </div>
          </div>
        )}

        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: st.bg, color: st.color }}>
          {st.label}
        </span>
        <span className="text-[11px] font-medium flex-shrink-0 ml-1" style={{ color: '#CBD5E1' }}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tasks */}
      {expanded && (
        <div>
          {tasks.length === 0 && !addingTask && (
            <div className="px-12 py-4">
              <span className="text-xs italic" style={{ color: '#E2E8F0' }}>No tasks yet</span>
            </div>
          )}
          <AnimatePresence>
            {tasks.map(t => (
              <TaskRow key={t.id} task={t} companyId={companyId} userId={userId} />
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {addingTask && (
              <AddTaskInline companyId={companyId} userId={userId} goalId={goal.id}
                onDone={() => setAddingTask(false)} onCancel={() => setAddingTask(false)} />
            )}
          </AnimatePresence>
          {!addingTask && (
            <button
              onClick={e => { e.stopPropagation(); setAddingTask(true); }}
              className="flex items-center gap-2 px-5 py-3 w-full transition-all text-xs font-semibold group/add"
              style={{ color: '#CBD5E1', borderTop: tasks.length > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#5B5FFF'; e.currentTarget.style.background = 'rgba(91,95,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#CBD5E1'; e.currentTarget.style.background = 'transparent'; }}>
              <Plus size={12} /> Add task
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Backlog card ──────────────────────────────────────────────────────────────
function BacklogCard({ tasks, companyId, userId }) {
  const [expanded, setExpanded] = useState(true);
  const [addingTask, setAddingTask] = useState(false);

  if (tasks.length === 0 && !addingTask) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="rounded-2xl overflow-hidden mb-4"
      style={{
        background: 'rgba(255,255,255,0.7)',
        border: '1.5px dashed rgba(91,95,255,0.14)',
      }}>

      <div className="flex items-center gap-3 px-5 py-4 cursor-pointer"
        style={{ borderBottom: expanded ? '1px solid rgba(91,95,255,0.06)' : 'none' }}
        onClick={() => setExpanded(e => !e)}>
        <button className="flex-shrink-0">
          {expanded
            ? <ChevronDown size={13} style={{ color: '#94A3B8' }} />
            : <ChevronRight size={13} style={{ color: '#94A3B8' }} />}
        </button>
        <span className="text-lg flex-shrink-0">📌</span>
        <span className="flex-1 text-sm font-bold" style={{ color: '#94A3B8' }}>Backlog</span>
        <span className="text-[11px] font-medium flex-shrink-0" style={{ color: '#CBD5E1' }}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {expanded && (
        <div>
          {tasks.map(t => <TaskRow key={t.id} task={t} companyId={companyId} userId={userId} />)}
          <AnimatePresence>
            {addingTask && (
              <AddTaskInline companyId={companyId} userId={userId} goalId={null}
                onDone={() => setAddingTask(false)} onCancel={() => setAddingTask(false)} />
            )}
          </AnimatePresence>
          {!addingTask && (
            <button
              onClick={() => setAddingTask(true)}
              className="flex items-center gap-2 px-5 py-3 w-full transition-all text-xs font-semibold"
              style={{ color: '#CBD5E1', borderTop: tasks.length > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#5B5FFF'; e.currentTarget.style.background = 'rgba(91,95,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#CBD5E1'; e.currentTarget.style.background = 'transparent'; }}>
              <Plus size={12} /> Add task
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── New project form ──────────────────────────────────────────────────────────
function AddProjectForm({ companyId, userId, onDone, onCancel }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createGoal(companyId, userId, { title: title.trim(), priority: 'high' });
      onDone();
    } finally { setLoading(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      className="rounded-2xl overflow-hidden mb-4"
      style={{ background: 'rgba(255,255,255,0.97)', border: '1.5px solid rgba(91,95,255,0.2)', boxShadow: '0 8px 32px rgba(91,95,255,0.10)' }}>
      <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#5B5FFF,#6B63FF)' }} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">🎯</span>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handle(); if (e.key === 'Escape') onCancel(); }}
            placeholder="Project name…"
            className="flex-1 text-base font-bold outline-none bg-transparent"
            style={{ color: '#0A0F1E', letterSpacing: '-0.01em' }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handle} disabled={loading || !title.trim()}
            className="text-sm font-bold px-4 py-2 rounded-xl transition-all"
            style={{
              background: title.trim() ? 'linear-gradient(135deg,#5B5FFF,#6B63FF)' : '#E2E8F0',
              color: title.trim() ? '#fff' : '#94A3B8',
              boxShadow: title.trim() ? '0 4px 12px rgba(91,95,255,0.25)' : 'none',
              opacity: loading ? 0.7 : 1,
            }}>
            {loading ? 'Creating…' : 'Create project'}
          </button>
          <button onClick={onCancel} className="text-sm px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors font-medium"
            style={{ color: '#94A3B8' }}>
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Completed section ─────────────────────────────────────────────────────────
function CompletedSection({ goals, tasksFor, companyId, userId }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-xs font-bold mb-3 transition-colors px-1"
        style={{ color: '#CBD5E1' }}
        onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
        onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {goals.length} completed project{goals.length !== 1 ? 's' : ''}
        <CheckCircle2 size={11} style={{ color: '#10B981', marginLeft: 2 }} />
      </button>
      <AnimatePresence>
        {open && goals.map((goal, i) => (
          <ProjectCard key={goal.id} goal={goal} tasks={tasksFor(goal.id)} companyId={companyId} userId={userId} index={i} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function ProjectsView() {
  const { goals, activeCompanyId } = useCompany();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [addingProject, setAddingProject] = useState(false);

  const userId = user?.uid || 'user';

  useEffect(() => {
    if (!activeCompanyId) return;
    return subscribeTasks(activeCompanyId, setTasks);
  }, [activeCompanyId]);

  const activeGoals = goals.filter(g => g.status !== 'cancelled' && g.status !== 'completed');
  const doneGoals   = goals.filter(g => g.status === 'completed');

  const tasksFor = goalId => tasks.filter(t => t.goalId === goalId);
  const backlog   = tasks.filter(t => !t.goalId);

  const totalTasks    = tasks.length;
  const doneTasks     = tasks.filter(t => t.status === TASK_STATUS.DONE).length;
  const activeTasks   = tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;
  const overallPct    = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F7FF 45%, #FAFCFF 100%)' }}>

      {/* Header */}
      <div className="px-8 py-5 flex-shrink-0">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="heading-serif text-3xl font-bold" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Projects</h1>
            <p className="text-sm mt-1 font-medium" style={{ color: '#64748B' }}>
              {activeGoals.length} active · {totalTasks} tasks · {doneTasks} completed
            </p>
          </div>
          <button
            onClick={() => setAddingProject(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg,#5B5FFF,#6B63FF)', color: '#fff', boxShadow: '0 4px 14px rgba(91,95,255,0.35)' }}>
            <Plus size={15} />
            New Project
          </button>
        </div>

        {/* Stats strip */}
        {totalTasks > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Tasks',  value: totalTasks,   icon: Layers,      color: '#5B5FFF' },
              { label: 'In Progress',  value: activeTasks,  icon: TrendingUp,  color: '#F59E0B' },
              { label: 'Completed',    value: `${doneTasks} · ${overallPct}%`, icon: CheckSquare, color: '#10B981' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(8px)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}12` }}>
                    <Icon size={14} style={{ color: s.color }} />
                  </div>
                  <div>
                    <div className="text-lg font-black leading-none" style={{ color: '#0A0F1E', fontVariantNumeric: 'tabular-nums' }}>
                      {s.value}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: '#94A3B8' }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">

        <AnimatePresence>
          {addingProject && (
            <AddProjectForm
              companyId={activeCompanyId}
              userId={userId}
              onDone={() => setAddingProject(false)}
              onCancel={() => setAddingProject(false)} />
          )}
        </AnimatePresence>

        {/* Empty state */}
        {activeGoals.length === 0 && !addingProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-2"
              style={{
                background: 'linear-gradient(135deg, rgba(91,95,255,0.12), rgba(99,102,241,0.06))',
                border: '1.5px solid rgba(91,95,255,0.15)',
              }}>
              <Target size={36} style={{ color: '#5B5FFF' }} strokeWidth={1.5} />
            </div>
            <p className="text-base font-bold" style={{ color: '#0A0F1E' }}>No projects yet</p>
            <p className="text-sm font-medium text-center max-w-xs" style={{ color: '#94A3B8', lineHeight: 1.6 }}>
              Create a project to organize tasks and track progress toward a goal.
            </p>
            <button
              onClick={() => setAddingProject(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all mt-2"
              style={{ background: 'linear-gradient(135deg,#5B5FFF,#6B63FF)', color: '#fff', boxShadow: '0 4px 14px rgba(91,95,255,0.30)' }}>
              <Plus size={14} /> Create first project
            </button>
          </motion.div>
        )}

        {/* Active projects */}
        {activeGoals.map((goal, i) => (
          <ProjectCard
            key={goal.id}
            goal={goal}
            tasks={tasksFor(goal.id)}
            companyId={activeCompanyId}
            userId={userId}
            index={i} />
        ))}

        {/* Backlog */}
        <BacklogCard tasks={backlog} companyId={activeCompanyId} userId={userId} />

        {/* Completed */}
        {doneGoals.length > 0 && (
          <CompletedSection goals={doneGoals} tasksFor={tasksFor} companyId={activeCompanyId} userId={userId} />
        )}
      </div>
    </div>
  );
}
