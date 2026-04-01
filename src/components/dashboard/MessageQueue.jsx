import { useState } from 'react';
import { Clock, Trash2, Pause, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageQueue({ queue, onClear, onRemove, onPause }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!queue || queue.length < 2) return null;

  return (
    <div className="mx-4 mb-2 rounded-2xl overflow-hidden"
      style={{ background: '#fff', border: '1px solid #E8EAFF', boxShadow: '0 2px 12px rgba(74,108,247,0.06)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: collapsed ? 'none' : '1px solid #F0F1FF' }}>
        <div className="flex items-center gap-2">
          <Clock size={14} style={{ color: '#6B7280' }} strokeWidth={1.8} />
          <span className="text-sm font-semibold" style={{ color: '#374151' }}>
            {queue.length} message{queue.length > 1 ? 's' : ''} queued
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            title="Clear all"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#C5C9E0' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#C5C9E0'; e.currentTarget.style.background = 'transparent'; }}>
            <Trash2 size={14} strokeWidth={1.8} />
          </button>
          <button
            onClick={onPause}
            title="Pause queue"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#C5C9E0' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F59E0B'; e.currentTarget.style.background = '#FFFBEB'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#C5C9E0'; e.currentTarget.style.background = 'transparent'; }}>
            <Pause size={14} strokeWidth={1.8} />
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#C5C9E0' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = '#F4F5FC'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#C5C9E0'; e.currentTarget.style.background = 'transparent'; }}>
            {collapsed ? <ChevronDown size={14} strokeWidth={1.8} /> : <ChevronUp size={14} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {/* Queue items */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <div className="px-3 py-2 space-y-1.5">
              {queue.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15, delay: i * 0.04 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl group"
                  style={{ background: '#F8F9FF', border: '1px solid #F0F1FF' }}>
                  <GripVertical size={13} style={{ color: '#D1D5DB', flexShrink: 0 }} />
                  <span className="flex-1 text-sm truncate" style={{ color: '#6B7280' }}>
                    {item.text}
                    {item.hasFile && (
                      <span className="ml-1.5 text-xs font-semibold" style={{ color: '#4A6CF7' }}>+ File</span>
                    )}
                  </span>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all"
                    style={{ color: '#C5C9E0' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#C5C9E0'}>
                    <Trash2 size={11} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}