import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle2, Circle, Clock, AlertTriangle, X, Copy, CheckCheck, Trash2, ChevronDown, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/lib/AuthContext';
import { subscribeTasks, createTask, updateTask, deleteTask, TASK_STATUS, TASK_PRIORITY } from '@/lib/taskService';
import { ROLE_COLORS } from '@/lib/agentService';

const COLUMNS = [
  { id: TASK_STATUS.TODO,         label: 'To Do',       color: '#94A3B8', Icon: Circle },
  { id: TASK_STATUS.IN_PROGRESS,  label: 'In Progress', color: '#5B5FFF', Icon: Clock },
  { id: TASK_STATUS.NEEDS_REVIEW, label: 'Review',      color: '#F59E0B', Icon: AlertTriangle },
  { id: TASK_STATUS.DONE,         label: 'Done',        color: '#00B894', Icon: CheckCircle2 },
  { id: TASK_STATUS.BLOCKED,      label: 'Blocked',     color: '#EF4444', Icon: ShieldAlert },
];

const PRIORITY_COLORS = {
  critical: '#EF4444',
  high:     '#F59E0B',
  medium:   '#5B5FFF',
  low:      '#94A3B8',
};

// ─── Task detail popup ────────────────────────────────────────────────────────
function TaskDetailPopup({ task, agents, companyId, userId, onClose, onDelete }) {
  const agent = agents.find(a => a.id === task.assignedAgentId);
  const agentColor = agent ? (ROLE_COLORS[agent.role] || '#5B5FFF') : '#94A3B8';
  const [title, setTitle]       = useState(task.title || '');
  const [desc, setDesc]         = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [status, setStatus]     = useState(task.status || TASK_STATUS.TODO);
  const [saving, setSaving]     = useState(false);
  const [copied, setCopied]     = useState(false);
  const hasOutput = task.outputSummary && task.outputSummary.trim().length > 10;

  async function save(patch) {
    setSaving(true);
    await updateTask(companyId, userId, task.id, patch).catch(() => {});
    setSaving(false);
  }

  async function handleStatusChange(val) {
    setStatus(val);
    await save({ status: val });
  }

  async function handlePriorityChange(val) {
    setPriority(val);
    await save({ priority: val });
  }

  async function handleBlurTitle() {
    if (title.trim() && title !== task.title) await save({ title: title.trim() });
  }

  async function handleBlurDesc() {
    if (desc !== task.description) await save({ description: desc });
  }

  function copyOutput() {
    navigator.clipboard.writeText(task.outputSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function escalateToApprovals() {
    setSaving(true);
    await addDoc(collection(firestore, 'approvals'), {
      companyId,
      requestingActorId: task.assignedAgentId || 'system',
      requestedByAgentId: task.assignedAgentId || null,
      type: 'needs_input',
      title: `Unblocked needed: "${task.title}"`,
      description: task.blockedReason
        || task.outputSummary
        || `The task "${task.title}" was marked as blocked. Please provide what is needed so this can be completed.`,
      payload: { taskId: task.id },
      status: 'pending',
      decidedByUserId: null,
      decidedAt: null,
      decisionNote: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch(() => {});
    await save({ status: TASK_STATUS.TODO, blockedReason: '' });
    setSaving(false);
  }

  const priColor = PRIORITY_COLORS[priority] || '#94A3B8';
  const colInfo  = COLUMNS.find(c => c.id === status) || COLUMNS[0];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,26,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.18)', maxHeight: '88vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #F0F1FF' }}>
          <div className="flex items-center gap-2">
            <colInfo.Icon size={14} style={{ color: colInfo.color }} />
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: colInfo.color }}>
              {colInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onDelete(task.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: '#EF4444' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Trash2 size={13} />
            </button>
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: '#94A3B8' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Title */}
          <div>
            <textarea
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleBlurTitle}
              rows={2}
              className="w-full text-lg font-bold outline-none resize-none bg-transparent leading-snug"
              style={{ color: '#0A0A1A' }}
              placeholder="Task title"
            />
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status */}
            <div className="relative">
              <select
                value={status}
                onChange={e => handleStatusChange(e.target.value)}
                className="text-xs font-semibold pl-2.5 pr-6 py-1.5 rounded-lg outline-none appearance-none cursor-pointer"
                style={{ background: `${colInfo.color}14`, color: colInfo.color, border: `1px solid ${colInfo.color}30` }}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                <option value={TASK_STATUS.CANCELLED}>Cancelled</option>
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colInfo.color }} />
            </div>

            {/* Priority */}
            <div className="relative">
              <select
                value={priority}
                onChange={e => handlePriorityChange(e.target.value)}
                className="text-xs font-semibold pl-2.5 pr-6 py-1.5 rounded-lg outline-none appearance-none cursor-pointer"
                style={{ background: `${priColor}14`, color: priColor, border: `1px solid ${priColor}30` }}>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: priColor }} />
            </div>

            {/* Agent badge */}
            {agent && (
              <span className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                style={{ background: `${agentColor}14`, color: agentColor, border: `1px solid ${agentColor}30` }}>
                {agent.name}
              </span>
            )}

            {saving && <span className="text-xs" style={{ color: '#94A3B8' }}>Saving…</span>}
          </div>

          {/* Description */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#CBD5E1' }}>Description</p>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              onBlur={handleBlurDesc}
              rows={3}
              className="w-full text-sm outline-none resize-none rounded-xl px-3 py-2.5 leading-relaxed"
              style={{ background: '#F8FAFF', border: '1px solid #E8EAFF', color: '#374151' }}
              placeholder="Add a description…"
            />
          </div>

          {/* Blocked reason banner */}
          {status === TASK_STATUS.BLOCKED && (
            <div className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-start gap-3 px-4 py-3"
                style={{ background: 'rgba(239,68,68,0.05)' }}>
                <ShieldAlert size={14} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold mb-0.5" style={{ color: '#EF4444' }}>Blocked</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
                    {task.blockedReason || 'The agent hit a blocker on this task.'}
                  </p>
                </div>
              </div>
              <div className="px-4 py-2.5" style={{ borderTop: '1px solid rgba(239,68,68,0.12)', background: 'rgba(255,255,255,0.8)' }}>
                <button
                  onClick={escalateToApprovals}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}>
                  <ArrowUpRight size={12} />
                  Escalate to Approvals
                </button>
                <p className="text-[10px] mt-1.5" style={{ color: '#94A3B8' }}>
                  Creates an approval request and resets the task to To Do
                </p>
              </div>
            </div>
          )}

          {/* Agent output */}
          {hasOutput && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#CBD5E1' }}>Agent Output</p>
                <button onClick={copyOutput}
                  className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors"
                  style={{ color: copied ? '#5B5FFF' : '#94A3B8', background: copied ? 'rgba(91,95,255,0.08)' : 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#5B5FFF'; e.currentTarget.style.background = 'rgba(91,95,255,0.08)'; }}
                  onMouseLeave={e => { if (!copied) { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; } }}>
                  {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs leading-relaxed whitespace-pre-wrap rounded-xl px-4 py-3 overflow-y-auto"
                style={{ background: '#F8FAFF', border: '1px solid rgba(91,95,255,0.1)', color: '#374151', fontFamily: 'ui-monospace, monospace', maxHeight: 260 }}>
                {task.outputSummary}
              </pre>
            </div>
          )}

          {/* Timestamps */}
          {task.createdAt && (
            <p className="text-[10px]" style={{ color: '#CBD5E1' }}>
              Created {task.createdAt?.toDate?.()?.toLocaleDateString?.() || '—'}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Task card ────────────────────────────────────────────────────────────────
function TaskCard({ task, agents, onClick }) {
  const agent = agents.find(a => a.id === task.assignedAgentId);
  const agentColor = agent ? (ROLE_COLORS[agent.role] || '#5B5FFF') : null;
  const priColor = PRIORITY_COLORS[task.priority] || '#94A3B8';
  const hasOutput = task.outputSummary && task.outputSummary.trim().length > 10;
  const isBlocked = task.status === TASK_STATUS.BLOCKED;

  return (
    <div
      onClick={onClick}
      className="rounded-xl p-3 mb-2 group cursor-pointer transition-all"
      style={{
        background: isBlocked ? 'rgba(239,68,68,0.03)' : '#fff',
        border: isBlocked ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = isBlocked ? '0 6px 20px rgba(239,68,68,0.1)' : '0 6px 20px rgba(91,95,255,0.1)'; e.currentTarget.style.borderColor = isBlocked ? 'rgba(239,68,68,0.35)' : 'rgba(91,95,255,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = isBlocked ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.07)'; }}>

      <p className="text-sm font-medium mb-2 leading-snug" style={{ color: '#0A0A1A' }}>{task.title}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
            style={{ background: `${priColor}18`, color: priColor }}>
            {task.priority}
          </span>
          {agent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ background: `${agentColor}18`, color: agentColor }}>
              {agent.name}
            </span>
          )}
        </div>
        {hasOutput && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
            Output
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Create task inline ───────────────────────────────────────────────────────
function CreateTaskInline({ companyId, userId, onDone, onCancel }) {
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
          className="text-xs font-semibold px-3 py-1 rounded-lg"
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
function KanbanColumn({ col, tasks, agents, companyId, userId, onCardClick }) {
  const [adding, setAdding] = useState(false);
  const Icon = col.Icon;

  return (
    <div className="flex flex-col min-w-0 flex-1" style={{ minWidth: 200 }}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Icon size={13} style={{ color: col.color }} />
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: col.color }}>{col.label}</span>
          <span className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: `${col.color}18`, color: col.color }}>
            {tasks.length}
          </span>
        </div>
        {col.id !== TASK_STATUS.BLOCKED && (
          <button onClick={() => setAdding(true)}
            className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-slate-100 transition-colors"
            style={{ color: '#CBD5E1' }}>
            <Plus size={11} />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-24">
        {adding && (
          <CreateTaskInline
            companyId={companyId}
            userId={userId}
            onDone={() => setAdding(false)}
            onCancel={() => setAdding(false)} />
        )}
        {tasks.map(t => (
          <TaskCard key={t.id} task={t} agents={agents} onClick={() => onCardClick(t)} />
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
  const [tasks, setTasks]         = useState([]);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    if (!activeCompanyId) return;
    const unsub = subscribeTasks(activeCompanyId, setTasks);
    return unsub;
  }, [activeCompanyId]);

  async function handleDelete(taskId) {
    setSelected(null);
    await deleteTask(activeCompanyId, taskId).catch(() => {});
  }

  const [showAllDone, setShowAllDone] = useState(false);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const filtered = search
    ? tasks.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  const byStatus = id => {
    const col = filtered.filter(t => t.status === id);
    if (id === TASK_STATUS.DONE && !showAllDone) {
      return col.filter(t => (t.completedAt?.seconds || t.updatedAt?.seconds || 0) * 1000 >= sevenDaysAgo);
    }
    return col;
  };
  const doneCount = tasks.filter(t => t.status === TASK_STATUS.DONE).length;
  const recentDoneCount = tasks.filter(t => t.status === TASK_STATUS.DONE && (t.completedAt?.seconds || t.updatedAt?.seconds || 0) * 1000 >= sevenDaysAgo).length;

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
              onCardClick={setSelected}
              showAllDoneToggle={col.id === TASK_STATUS.DONE && doneCount > recentDoneCount}
              showAllDone={showAllDone}
              onToggleAllDone={() => setShowAllDone(v => !v)}
              hiddenDoneCount={doneCount - recentDoneCount} />
          ))}
        </div>
      </div>

      {/* Task detail popup */}
      <AnimatePresence>
        {selected && (
          <TaskDetailPopup
            task={selected}
            agents={agents}
            companyId={activeCompanyId}
            userId={user?.uid || 'user'}
            onClose={() => setSelected(null)}
            onDelete={handleDelete} />
        )}
      </AnimatePresence>
    </div>
  );
}
