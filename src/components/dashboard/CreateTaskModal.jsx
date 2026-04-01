import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Flag } from 'lucide-react';

const priorities = [
  { id: 'urgent', label: 'Urgent', color: '#EF4444' },
  { id: 'high', label: 'High', color: '#F59E0B' },
  { id: 'medium', label: 'Medium', color: '#3B82F6' },
  { id: 'low', label: 'Low', color: '#10B981' },
];

export default function CreateTaskModal({ onClose, onSave, columns, editTask }) {
  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [priority, setPriority] = useState(editTask?.priority || 'medium');
  const [column, setColumn] = useState(editTask?.column || columns[0]?.id || 'todo');
  const [assignee, setAssignee] = useState(editTask?.assignee || '');
  const [tagsStr, setTagsStr] = useState(editTask?.tags?.join(', ') || '');

  const handleSave = () => {
    if (!title.trim()) return;
    const data = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status: column,
      assignee: assignee.trim() || null,
      tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean),
      dueDate: editTask?.dueDate || null,
    };
    if (editTask?.id) {
      data.id = editTask.id;
    }
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg mx-4 md:mx-0 rounded-2xl md:rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: '#fff', boxShadow: '0 25px 60px rgba(0,0,0,0.15)', border: '1px solid #E8EAFF' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F0F1FF' }}>
          <h2 className="text-base font-extrabold" style={{ color: '#0F172A' }}>
            {editTask ? 'Edit Task' : 'Create Task'}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#94A3B8' }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
              style={{ background: '#F8F9FE', border: '1.5px solid #E8EAFF', color: '#0F172A' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E8EAFF'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#94A3B8' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
              style={{ background: '#F8F9FE', border: '1.5px solid #E8EAFF', color: '#0F172A' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E8EAFF'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Priority + Column row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#94A3B8' }}>Priority</label>
              <div className="flex gap-1.5">
                {priorities.map(p => (
                  <button key={p.id} onClick={() => setPriority(p.id)}
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all"
                    style={{
                      background: priority === p.id ? p.color + '14' : '#F8F9FE',
                      border: priority === p.id ? `1.5px solid ${p.color}40` : '1.5px solid #E8EAFF',
                      color: priority === p.id ? p.color : '#94A3B8',
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#94A3B8' }}>Status</label>
              <select value={column} onChange={e => setColumn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none"
                style={{ background: '#F8F9FE', border: '1.5px solid #E8EAFF', color: '#0F172A' }}>
                {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Assignee + Tags row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#94A3B8' }}>Assignee</label>
              <input value={assignee} onChange={e => setAssignee(e.target.value)}
                placeholder="Name..."
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: '#F8F9FE', border: '1.5px solid #E8EAFF', color: '#0F172A' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#94A3B8' }}>Tags</label>
              <input value={tagsStr} onChange={e => setTagsStr(e.target.value)}
                placeholder="design, bug, ..."
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: '#F8F9FE', border: '1.5px solid #E8EAFF', color: '#0F172A' }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4" style={{ borderTop: '1px solid #F0F1FF' }}>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ color: '#6B7280', background: '#F3F4F6' }}
            onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
            onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}>
            Cancel
          </button>
          <button onClick={handleSave}
            disabled={!title.trim()}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: title.trim() ? 'linear-gradient(135deg, #2563EB, #3B82F6)' : '#E8EAFF',
              color: title.trim() ? '#fff' : '#A0AEC0',
              boxShadow: title.trim() ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
              cursor: title.trim() ? 'pointer' : 'not-allowed',
            }}>
            {editTask ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}