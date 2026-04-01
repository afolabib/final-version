import { useState, useEffect } from 'react';
import { Plus, Zap, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';

const columns = [
  { id: 'todo', label: 'To Do', color: '#94A3B8', icon: '○' },
  { id: 'in_progress', label: 'In Progress', color: '#2563EB', icon: '◉' },
  { id: 'needs_review', label: 'Needs Review', color: '#F59E0B', icon: '◐' },
  { id: 'completed', label: 'Completed', color: '#10B981', icon: '◉' },
];

const initialTasks = [];

export default function TasksView() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await base44.entities.Task.list();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  const getColumnTasks = (colId) => filteredTasks.filter(t => t.status === colId);
  const totalDone = tasks.filter(t => t.status === 'completed').length;

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const task = tasks.find(t => t.id === draggableId);
    if (task) {
      try {
        await base44.entities.Task.update(task.id, { ...task, status: destination.droppableId });
        setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: destination.droppableId } : t));
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  };

  const handleSave = async (task) => {
    try {
      if (task.id) {
        const { id, ...updateData } = task;
        await base44.entities.Task.update(id, updateData);
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updateData } : t));
      } else {
        const { id, ...createData } = task;
        const created = await base44.entities.Task.create(createData);
        setTasks(prev => [...prev, created]);
      }
      setShowModal(false);
      setEditTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.Task.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setShowModal(true);
  };

  const openCreate = (colId) => {
    setEditTask({ status: colId, id: null });
    setShowModal(true);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#F4F5FC' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 md:px-8 py-4 flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E8EAFF' }}>
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>Tasks</h1>
          <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(37,99,235,0.06)', color: '#2563EB' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2563EB' }} />
            {tasks.length} total
          </div>
          <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(16,185,129,0.06)', color: '#10B981' }}>
            {totalDone}/{tasks.length} done
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-2.5 w-full sm:w-auto">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 sm:flex-initial"
            style={{ background: '#F8F9FE', border: '1.5px solid #E8EAFF' }}>
            <Search size={13} style={{ color: '#94A3B8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="text-xs font-medium outline-none bg-transparent w-full sm:w-40"
              style={{ color: '#374151' }} />
          </div>
          <button
            onClick={() => { setEditTask(null); setShowModal(true); }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all btn-press"
            style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)', boxShadow: '0 4px 16px rgba(37,99,235,0.30)' }}>
            <Plus size={14} strokeWidth={2.5} /> New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-auto p-3 md:p-6">
          <div className="flex gap-4 h-fit md:grid md:grid-cols-2 lg:grid-cols-4">
            {/* On mobile: horizontal scroll kanban */}
            {columns.map(col => {
              const colTasks = getColumnTasks(col.id);
              return (
                <div key={col.id} className="flex flex-col h-full min-w-[260px] md:min-w-0">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                      <span className="text-sm font-bold" style={{ color: '#374151' }}>{col.label}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: colTasks.length > 0 ? col.color + '14' : '#F3F4F6', color: colTasks.length > 0 ? col.color : '#94A3B8' }}>
                        {colTasks.length}
                      </span>
                    </div>
                    <button onClick={() => openCreate(col.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                      style={{ color: '#CBD5E1' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = 'rgba(37,99,235,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#CBD5E1'; e.currentTarget.style.background = 'transparent'; }}>
                      <Plus size={13} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Droppable area */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 rounded-2xl p-2 overflow-y-auto transition-colors"
                        style={{
                          background: snapshot.isDraggingOver ? 'rgba(37,99,235,0.04)' : 'rgba(244,245,252,0.5)',
                          border: snapshot.isDraggingOver ? '1.5px dashed rgba(37,99,235,0.3)' : '1.5px dashed transparent',
                          minHeight: 120,
                        }}>
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2"
                              style={{ background: '#F0F1FF' }}>
                              <span style={{ color: '#CBD5E1', fontSize: 16 }}>{col.icon}</span>
                            </div>
                            <p className="text-xs font-medium" style={{ color: '#CBD5E1' }}>No tasks yet</p>
                            <button onClick={() => openCreate(col.id)}
                              className="mt-2 text-[10px] font-bold px-3 py-1 rounded-full transition-all"
                              style={{ color: '#2563EB', background: 'rgba(37,99,235,0.06)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.12)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,99,235,0.06)'}>
                              + Add task
                            </button>
                          </div>
                        )}
                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(dragProvided) => (
                              <TaskCard
                                task={task}
                                provided={dragProvided}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* Create/Edit Modal */}
      {showModal && (
        <CreateTaskModal
          columns={columns}
          editTask={editTask?.id ? editTask : editTask?.column ? { column: editTask.column } : null}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}