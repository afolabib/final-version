import { useState } from 'react';
import { Clock, Flag, User, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

const priorityConfig = {
  urgent: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', label: 'Urgent' },
  high: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: 'High' },
  medium: { color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', label: 'Medium' },
  low: { color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: 'Low' },
};

export default function TaskCard({ task, onDelete, onEdit, provided }) {
  const [showMenu, setShowMenu] = useState(false);
  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="rounded-2xl p-4 mb-2.5 cursor-grab active:cursor-grabbing group relative"
      style={{
        background: '#fff',
        border: '1px solid #E8EAFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'box-shadow 200ms, border-color 200ms',
        ...provided.draggableProps.style,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.08)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#E8EAFF'; setShowMenu(false); }}
    >
      {/* Priority + menu */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ color: priority.color, background: priority.bg }}>
          {priority.label}
        </span>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}
            className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <MoreHorizontal size={13} />
          </button>
          {showMenu && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.1 }}
              className="absolute right-0 top-7 z-50 rounded-xl overflow-hidden"
              style={{ background: '#fff', border: '1px solid #E8EAFF', boxShadow: '0 12px 36px rgba(0,0,0,0.1)', minWidth: 130 }}>
              <button onClick={() => { onEdit(task); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors"
                style={{ color: '#374151' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Edit3 size={12} /> Edit
              </button>
              <button onClick={() => { onDelete(task.id); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors"
                style={{ color: '#EF4444' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Trash2 size={12} /> Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold leading-snug mb-2" style={{ color: '#0F172A' }}>{task.title}</p>

      {/* Description */}
      {task.description && (
        <p className="text-xs leading-relaxed mb-3" style={{ color: '#94A3B8' }}>{task.description}</p>
      )}

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.map(tag => (
            <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#F0F1FF', color: '#4A6CF7' }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Bottom meta */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #F4F5FC' }}>
        <div className="flex items-center gap-3">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6B63FF, #8B5CF6)' }}>
                {task.assignee[0]}
              </div>
              <span className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>{task.assignee}</span>
            </div>
          )}
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Clock size={10} style={{ color: '#CBD5E1' }} />
            <span className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>{task.dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}