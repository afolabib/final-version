import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Layers, CheckSquare, Bell, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '@/contexts/CompanyContext';
import { ROLE_COLORS, getRoleEmoji } from '@/lib/agentService';

const TYPE_CONFIG = {
  agent:    { icon: Users,       color: '#5B5FFF', label: 'Agent',    path: a => `/dashboard/chat?agent=${encodeURIComponent(a.name)}` },
  task:     { icon: CheckSquare, color: '#10B981', label: 'Task',     path: () => '/dashboard/projects' },
  project:  { icon: Layers,      color: '#0EA5E9', label: 'Project',  path: () => '/dashboard/projects' },
  approval: { icon: Bell,        color: '#F59E0B', label: 'Approval', path: () => '/dashboard/inbox' },
};

function ResultRow({ item, active, onClick }) {
  const cfg = TYPE_CONFIG[item.type];
  const Icon = cfg.icon;
  const ref = useRef(null);

  useEffect(() => {
    if (active && ref.current) ref.current.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <button
      ref={ref}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-xl"
      style={{ background: active ? 'rgba(91,95,255,0.07)' : 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = active ? 'rgba(91,95,255,0.07)' : 'transparent'}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${cfg.color}15` }}>
        {item.emoji
          ? <span className="text-base leading-none">{item.emoji}</span>
          : <Icon size={14} style={{ color: cfg.color }} strokeWidth={2} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: '#0A0F1E' }}>{item.title}</p>
        {item.sub && <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{item.sub}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${cfg.color}12`, color: cfg.color }}>{cfg.label}</span>
        {active && <ArrowRight size={12} style={{ color: '#5B5FFF' }} />}
      </div>
    </button>
  );
}

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { agents, tasks, goals, pendingApprovals } = useCompany();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Build searchable items
  const allItems = useMemo(() => {
    const items = [];
    (agents || []).forEach(a => items.push({
      id: `agent-${a.id}`, type: 'agent',
      title: a.name, sub: a.jobTitle || a.role || 'AI Operator',
      emoji: getRoleEmoji ? getRoleEmoji(a) : '🤖',
      _raw: a,
    }));
    (tasks || []).filter(t => t.status !== 'done' && t.status !== 'cancelled').forEach(t => items.push({
      id: `task-${t.id}`, type: 'task',
      title: t.title, sub: `${t.status || 'todo'} · ${t.priority || 'normal'} priority`,
      _raw: t,
    }));
    (goals || []).filter(g => g.isProject || g.isProject === undefined).filter(g => g.status === 'active').forEach(g => items.push({
      id: `project-${g.id}`, type: 'project',
      title: g.title, sub: g.description || 'Active project',
      emoji: g.emoji || null,
      _raw: g,
    }));
    (pendingApprovals || []).forEach(a => items.push({
      id: `approval-${a.id}`, type: 'approval',
      title: a.title || 'Approval request',
      sub: a.description || 'Needs your sign-off',
      _raw: a,
    }));
    return items;
  }, [agents, tasks, goals, pendingApprovals]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 8);
    return allItems.filter(item =>
      item.title.toLowerCase().includes(q) ||
      (item.sub || '').toLowerCase().includes(q)
    ).slice(0, 10);
  }, [query, allItems]);

  // Reset active index when results change
  useEffect(() => setActiveIdx(0), [results.length]);

  const handleSelect = item => {
    const cfg = TYPE_CONFIG[item.type];
    navigate(cfg.path(item._raw));
    onClose();
  };

  const handleKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[activeIdx]) handleSelect(results[activeIdx]);
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(10,15,30,0.45)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[15vh] left-1/2 z-[201] w-full max-w-xl -translate-x-1/2 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.99)',
              border: '1px solid rgba(91,95,255,0.14)',
              boxShadow: '0 32px 80px rgba(91,95,255,0.18), 0 8px 24px rgba(0,0,0,0.10)',
            }}>

            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-4"
              style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
              <Search size={16} style={{ color: '#94A3B8', flexShrink: 0 }} strokeWidth={2} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Search agents, tasks, projects, approvals…"
                className="flex-1 text-sm outline-none bg-transparent font-medium"
                style={{ color: '#0A0F1E', caretColor: '#5B5FFF' }}
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 rounded-lg transition-colors"
                  style={{ color: '#C7D0E8' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#C7D0E8'}>
                  <X size={13} />
                </button>
              )}
              <kbd className="hidden sm:flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(91,95,255,0.07)', color: '#94A3B8' }}>
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="px-2 py-2 max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <p className="text-sm font-medium" style={{ color: '#CBD5E1' }}>No results for "{query}"</p>
                </div>
              ) : (
                results.map((item, i) => (
                  <ResultRow
                    key={item.id}
                    item={item}
                    active={i === activeIdx}
                    onClick={() => handleSelect(item)}
                  />
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 py-2.5"
              style={{ borderTop: '1px solid rgba(91,95,255,0.06)' }}>
              {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([key, hint]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(91,95,255,0.07)', color: '#94A3B8' }}>{key}</kbd>
                  <span className="text-[10px] font-medium" style={{ color: '#C7D0E8' }}>{hint}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
