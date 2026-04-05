import { useState, useEffect, useRef } from 'react';
import { Plus, ChevronDown, ChevronRight, Circle, Clock, AlertTriangle, CheckCircle2, X, Target, Layers, TrendingUp, CheckSquare, Trash2, Flag, Calendar, AlignLeft, Smile, Bot, ChevronDown as ChevronDownSm } from 'lucide-react';
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
  const { agents } = useCompany();
  const [showAssign, setShowAssign] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const assignRef = useRef(null);

  const cfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG[TASK_STATUS.TODO];
  const Icon = cfg.Icon;
  const priColor = PRIORITY_COLORS[task.priority] || '#94A3B8';
  const isDone = task.status === TASK_STATUS.DONE;
  const isRunning = task.status === TASK_STATUS.IN_PROGRESS;
  const isBlocked = task.status === TASK_STATUS.BLOCKED;
  const assignedAgent = agents.find(a => a.id === task.assignedAgentId);
  const activeAgents = agents.filter(a => a.status !== 'terminated');

  // Close dropdown on outside click
  useEffect(() => {
    if (!showAssign) return;
    const handler = e => { if (assignRef.current && !assignRef.current.contains(e.target)) setShowAssign(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAssign]);

  async function cycleStatus() {
    // Blocked tasks cycle back to TODO so user can retry
    if (task.status === TASK_STATUS.BLOCKED) {
      await updateTask(companyId, userId, task.id, { status: TASK_STATUS.TODO });
      return;
    }
    const order = [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.NEEDS_REVIEW, TASK_STATUS.DONE];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    await updateTask(companyId, userId, task.id, { status: next });
  }

  async function assignToAgent(agent) {
    setAssigning(true);
    setShowAssign(false);
    try {
      await updateTask(companyId, userId, task.id, {
        assignedAgentId: agent.id,
        status: 'todo', // reset so machine picks it up
      });
    } finally { setAssigning(false); }
  }

  return (
    <div className="group flex items-center gap-3 px-5 py-3 transition-all"
      style={{ borderTop: '1px solid rgba(0,0,0,0.04)', background: isBlocked ? 'rgba(239,68,68,0.03)' : 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = isBlocked ? 'rgba(239,68,68,0.06)' : 'rgba(91,95,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = isBlocked ? 'rgba(239,68,68,0.03)' : 'transparent'}>

      <button onClick={cycleStatus} className="flex-shrink-0 transition-transform hover:scale-110 active:scale-95">
        <Icon size={15} style={{ color: cfg.color }} />
      </button>

      <span className={`flex-1 text-sm font-medium transition-all ${isDone ? 'line-through' : ''}`}
        style={{ color: isDone ? '#CBD5E1' : isBlocked ? '#B91C1C' : '#0A0F1E' }}>
        {task.title}
      </span>
      {isBlocked && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
          title={task.blockedReason || 'Click the icon to move back to To Do'}
          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
          BLOCKED
        </span>
      )}

      {/* Assigned agent pill — always visible if assigned */}
      {assignedAgent && (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: isRunning ? 'rgba(91,95,255,0.10)' : 'rgba(0,0,0,0.05)',
            color: isRunning ? '#5B5FFF' : '#94A3B8',
          }}>
          <Bot size={9} />
          {assignedAgent.name}
          {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse ml-0.5" />}
        </span>
      )}

      {/* Assign button + dropdown */}
      {!isDone && (
        <div ref={assignRef} className="relative flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowAssign(s => !s)}
            disabled={assigning}
            className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
            style={{
              background: showAssign ? 'rgba(91,95,255,0.10)' : 'rgba(0,0,0,0.04)',
              color: showAssign ? '#5B5FFF' : '#94A3B8',
            }}>
            <Bot size={10} />
            {assigning ? '…' : assignedAgent ? 'Reassign' : 'Run with AI'}
          </button>

          <AnimatePresence>
            {showAssign && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-8 z-50 py-1 rounded-xl overflow-hidden"
                style={{
                  background: '#fff',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(0,0,0,0.07)',
                  minWidth: 160,
                }}>
                {activeAgents.length === 0 ? (
                  <p className="px-3 py-2 text-xs font-medium" style={{ color: '#94A3B8' }}>No active agents</p>
                ) : (
                  activeAgents.map(agent => (
                    <button key={agent.id} onClick={() => assignToAgent(agent)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left transition-colors"
                      style={{ color: '#0A0F1E' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-black flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#5B5FFF,#7C3AED)' }}>
                        {agent.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-none">{agent.name}</p>
                        <p className="text-[10px] mt-0.5 capitalize" style={{ color: '#94A3B8' }}>{agent.role}</p>
                      </div>
                      {agent.id === task.assignedAgentId && (
                        <CheckCircle2 size={11} className="ml-auto flex-shrink-0" style={{ color: '#10B981' }} />
                      )}
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Status / priority chips */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
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

      {/* Output preview if task is done */}
      {isDone && task.outputSummary && (
        <button
          onClick={() => alert(task.outputSummary)}
          className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(16,185,129,0.10)', color: '#10B981' }}>
          View output
        </button>
      )}
    </div>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────
function ProjectCard({ goal, tasks, companyId, userId, index }) {
  const isDone = goal.status === 'completed' || goal.status === 'cancelled';
  const [expanded, setExpanded] = useState(!isDone);
  const [showDone, setShowDone] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const st = GOAL_STATUS_STYLES[goal.status] || GOAL_STATUS_STYLES.active;
  const doneTasks = tasks.filter(t => t.status === TASK_STATUS.DONE);
  const activeTasks = tasks.filter(t => t.status !== TASK_STATUS.DONE);
  const doneCount = doneTasks.length;
  const inProgressCount = tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;
  const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const visibleTasks = showDone ? tasks : activeTasks;

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
            {visibleTasks.map(t => (
              <TaskRow key={t.id} task={t} companyId={companyId} userId={userId} />
            ))}
          </AnimatePresence>
          {doneCount > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setShowDone(v => !v); }}
              className="flex items-center gap-1.5 px-5 py-2 text-[11px] font-semibold transition-colors"
              style={{ color: showDone ? '#10B981' : '#CBD5E1', borderTop: activeTasks.length > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#10B981'}
              onMouseLeave={e => e.currentTarget.style.color = showDone ? '#10B981' : '#CBD5E1'}>
              <CheckCircle2 size={11} />
              {showDone ? 'Hide' : `Show ${doneCount} completed`}
            </button>
          )}
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

// ── New project panel (slide-in drawer) ──────────────────────────────────────
const EMOJI_OPTIONS = ['🎯','🚀','💡','🛠️','📈','🌱','⚡','🔥','💎','🎨','🏆','📦','🔬','🌐','💼'];
const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: '#EF4444' },
  { value: 'high',     label: 'High',     color: '#F59E0B' },
  { value: 'medium',   label: 'Medium',   color: '#5B5FFF' },
  { value: 'low',      label: 'Low',      color: '#94A3B8' },
];

function AddProjectPanel({ companyId, userId, onDone, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [priority, setPriority] = useState('high');
  const [showEmojis, setShowEmojis] = useState(false);
  const [taskInputs, setTaskInputs] = useState(['']);
  const [loading, setLoading] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const addTaskRow = () => setTaskInputs(prev => [...prev, '']);
  const updateTask_ = (i, v) => setTaskInputs(prev => prev.map((t, idx) => idx === i ? v : t));
  const removeTask = (i) => setTaskInputs(prev => prev.filter((_, idx) => idx !== i));

  async function handle() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const goalId = await createGoal(companyId, userId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        emoji,
        isProject: true,
      });
      const validTasks = taskInputs.filter(t => t.trim());
      await Promise.all(
        validTasks.map((t, i) =>
          createTask(companyId, userId, { title: t.trim(), goalId, priority: 'medium' })
        )
      );
      onDone();
    } finally { setLoading(false); }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(10,15,30,0.25)', backdropFilter: 'blur(3px)' }}
        onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col w-full"
        style={{ maxWidth: 480, maxHeight: '90vh', background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(91,95,255,0.18), 0 8px 32px rgba(0,0,0,0.10)', border: '1px solid rgba(91,95,255,0.1)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div>
            <h2 className="text-base font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>New Project</h2>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#94A3B8' }}>Set up your project and add tasks</p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"
            style={{ color: '#94A3B8' }}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Emoji + Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: '#94A3B8' }}>Project name</label>
            <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ border: '1.5px solid rgba(91,95,255,0.15)', background: '#FAFBFF' }}>
              <div className="relative">
                <button onClick={() => setShowEmojis(s => !s)}
                  className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors flex-shrink-0">
                  {emoji}
                </button>
                <AnimatePresence>
                  {showEmojis && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 4 }}
                      className="absolute top-12 left-0 z-10 p-2 rounded-2xl grid grid-cols-5 gap-1"
                      style={{ background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)', width: 200 }}>
                      {EMOJI_OPTIONS.map(e => (
                        <button key={e} onClick={() => { setEmoji(e); setShowEmojis(false); }}
                          className="text-xl w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
                          {e}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input
                ref={titleRef}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && onCancel()}
                placeholder="e.g. Launch v2.0, Q3 Marketing…"
                className="flex-1 text-sm font-bold outline-none bg-transparent"
                style={{ color: '#0A0F1E' }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
              <AlignLeft size={10} /> Description <span className="normal-case font-medium">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project about? What does success look like?"
              rows={3}
              className="w-full text-sm outline-none resize-none p-3 rounded-2xl font-medium"
              style={{ border: '1.5px solid rgba(0,0,0,0.08)', background: '#FAFBFF', color: '#0A0F1E', lineHeight: 1.6 }}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
              <Flag size={10} /> Priority
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRIORITY_OPTIONS.map(p => (
                <button key={p.value} onClick={() => setPriority(p.value)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: priority === p.value ? `${p.color}15` : 'rgba(0,0,0,0.04)',
                    color: priority === p.value ? p.color : '#94A3B8',
                    border: `1.5px solid ${priority === p.value ? p.color : 'transparent'}`,
                  }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center justify-between" style={{ color: '#94A3B8' }}>
              <div className="flex items-center gap-1.5">
                <CheckSquare size={10} />
                Tasks
                {taskInputs.filter(t => t.trim()).length > 0 && (
                  <span className="ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF' }}>
                    {taskInputs.filter(t => t.trim()).length}
                  </span>
                )}
              </div>
              <span className="normal-case font-medium text-[10px]">Press Enter to add more</span>
            </label>

            <div className="flex flex-col gap-2">
              {taskInputs.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-dashed flex-shrink-0" style={{ borderColor: '#CBD5E1' }} />
                  <input
                    value={t}
                    onChange={e => updateTask_(i, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); addTaskRow(); }
                      if (e.key === 'Backspace' && !t && taskInputs.length > 1) removeTask(i);
                    }}
                    placeholder={i === 0 ? 'Add a task…' : 'Another task…'}
                    className="flex-1 text-sm font-medium outline-none px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(0,0,0,0.03)', color: '#0A0F1E', border: '1px solid rgba(0,0,0,0.06)' }}
                  />
                  {taskInputs.length > 1 && (
                    <button onClick={() => removeTask(i)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors flex-shrink-0"
                      style={{ color: '#CBD5E1' }}>
                      <X size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addTaskRow}
              className="flex items-center gap-2 mt-3 text-xs font-semibold transition-colors px-1"
              style={{ color: '#CBD5E1' }}
              onMouseEnter={e => e.currentTarget.style.color = '#5B5FFF'}
              onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}>
              <Plus size={11} /> Add another task
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#FAFBFF', borderRadius: '0 0 24px 24px' }}>
          <button
            onClick={handle}
            disabled={loading || !title.trim()}
            className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all"
            style={{
              background: title.trim() ? 'linear-gradient(135deg,#5B5FFF,#7C3AED)' : '#E2E8F0',
              color: title.trim() ? '#fff' : '#94A3B8',
              boxShadow: title.trim() ? '0 4px 14px rgba(91,95,255,0.30)' : 'none',
              opacity: loading ? 0.7 : 1,
            }}>
            {loading ? 'Creating…' : `Create project${taskInputs.filter(t=>t.trim()).length > 0 ? ` + ${taskInputs.filter(t=>t.trim()).length} task${taskInputs.filter(t=>t.trim()).length > 1 ? 's' : ''}` : ''}`}
          </button>
          <button onClick={onCancel}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors"
            style={{ color: '#64748B' }}>
            Cancel
          </button>
        </div>
      </motion.div>
      </div>
    </>
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
  const [tasks, setTasks]           = useState([]);
  const [addingProject, setAddingProject] = useState(false);
  const [viewFilter, setViewFilter] = useState('active'); // 'today' | 'active' | 'all'

  const userId = user?.uid || 'user';

  useEffect(() => {
    if (!activeCompanyId) return;
    return subscribeTasks(activeCompanyId, setTasks);
  }, [activeCompanyId]);

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);

  function filterTask(t) {
    if (viewFilter === 'today') {
      const ts = t.updatedAt?.seconds || t.createdAt?.seconds || 0;
      return ts * 1000 >= todayStart.getTime();
    }
    if (viewFilter === 'active') return t.status !== TASK_STATUS.DONE && t.status !== TASK_STATUS.CANCELLED;
    return true; // 'all'
  }

  // Projects = goals explicitly marked isProject:true, OR (backwards compat) goals that have linked tasks
  const taskGoalIds = new Set(tasks.map(t => t.goalId).filter(Boolean));
  const isProjectGoal = g => g.isProject === true || (g.isProject === undefined && taskGoalIds.has(g.id));
  const activeGoals = goals.filter(g => isProjectGoal(g) && g.status !== 'cancelled' && g.status !== 'completed');
  const doneGoals   = goals.filter(g => isProjectGoal(g) && g.status === 'completed');

  const tasksFor = goalId => tasks.filter(t => t.goalId === goalId && filterTask(t));
  const backlog   = tasks.filter(t => !t.goalId && filterTask(t));

  const totalTasks    = tasks.length;
  const doneTasks     = tasks.filter(t => t.status === TASK_STATUS.DONE).length;
  const activeTasks   = tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;
  const overallPct    = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>

      {/* Header */}
      <div className="px-8 py-5 flex-shrink-0">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="heading-serif text-3xl font-bold" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Projects</h1>
            <p className="text-sm mt-1 font-medium" style={{ color: '#64748B' }}>
              {activeGoals.length} active · {totalTasks} tasks · {doneTasks} completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.07)' }}>
              {[{ id: 'today', label: 'Today' }, { id: 'active', label: 'Active' }, { id: 'all', label: 'All' }].map(f => (
                <button key={f.id} onClick={() => setViewFilter(f.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: viewFilter === f.id ? '#5B5FFF' : 'transparent',
                    color: viewFilter === f.id ? '#fff' : '#94A3B8',
                    boxShadow: viewFilter === f.id ? '0 2px 6px rgba(91,95,255,0.25)' : 'none',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAddingProject(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg,#5B5FFF,#6B63FF)', color: '#fff', boxShadow: '0 4px 14px rgba(91,95,255,0.35)' }}>
              <Plus size={15} />
              New Project
            </button>
          </div>
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
              Projects are for bigger initiatives — "Build a website", "Launch campaign". One-off tasks live on the task board.
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

      {/* New project panel */}
      <AnimatePresence>
        {addingProject && (
          <AddProjectPanel
            companyId={activeCompanyId}
            userId={userId}
            onDone={() => setAddingProject(false)}
            onCancel={() => setAddingProject(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
