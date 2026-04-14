import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useWidget } from '@/contexts/WidgetContext';
import {
  BookOpen, Plus, Trash2, Save, X, FileText, Zap, ChevronDown, ChevronUp,
  Loader2, CheckCircle, AlertCircle, Lightbulb,
} from 'lucide-react';

const glassCard = {
  background: 'rgba(255,255,255,0.97)',
  border: '1px solid rgba(91,95,255,0.08)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
};

const ENTRY_TEMPLATES = [
  { title: 'Pricing & Packages', content: 'Describe your pricing structure here. E.g. "Our packages start at €X for Y..."' },
  { title: 'Booking Process', content: 'Explain how bookings work. E.g. "To book, fill out the contact form and we\'ll respond within 24 hours..."' },
  { title: 'Services Offered', content: 'List your main services and what\'s included in each.' },
  { title: 'FAQ', content: 'Q: [Question]?\nA: [Answer]\n\nQ: [Question]?\nA: [Answer]' },
  { title: 'About the Business', content: 'Background, mission, and what makes you different.' },
  { title: 'Contact & Location', content: 'Email, phone, address, hours of operation.' },
];

function EntryCard({ entry, onDelete, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(entry.id, { title, content });
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(entry.title);
    setContent(entry.content);
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="rounded-2xl overflow-hidden"
      style={glassCard}>

      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => !editing && setExpanded(e => !e)}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(91,95,255,0.08)' }}>
            <FileText size={13} style={{ color: '#5B5FFF' }} />
          </div>
          {editing ? (
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onClick={e => e.stopPropagation()}
              className="text-[13px] font-semibold outline-none rounded-lg px-2 py-0.5 flex-1 min-w-0"
              style={{ color: '#0A0F1E', border: '1px solid rgba(91,95,255,0.2)', background: 'rgba(91,95,255,0.03)' }}
            />
          ) : (
            <p className="text-[13px] font-semibold truncate" style={{ color: '#0A0F1E' }}>{entry.title}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {!editing && (
            <button
              onClick={e => { e.stopPropagation(); setExpanded(true); setEditing(true); }}
              className="text-[11px] font-semibold px-2 py-1 rounded-lg"
              style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)' }}>
              Edit
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: '#CBD5E1' }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}>
            <Trash2 size={13} />
          </button>
          <div style={{ color: '#CBD5E1' }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {(expanded || editing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}>
            <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
              <div className="pt-3">
                {editing ? (
                  <>
                    <textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      rows={6}
                      className="w-full rounded-xl px-3 py-2.5 text-[12px] outline-none resize-none"
                      style={{
                        border: '1px solid rgba(91,95,255,0.2)',
                        background: 'rgba(91,95,255,0.02)',
                        color: '#374151',
                        lineHeight: 1.6,
                      }}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white"
                        style={{ background: saving ? 'rgba(91,95,255,0.5)' : '#5B5FFF' }}>
                        {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold"
                        style={{ color: '#94A3B8', background: 'rgba(0,0,0,0.04)' }}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-[12px] whitespace-pre-wrap" style={{ color: '#64748B', lineHeight: 1.6 }}>
                    {entry.content}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function WidgetKnowledge() {
  const { activeWidget } = useWidget();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const widgetId = activeWidget?.id;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!widgetId) { setLoading(false); return; }
    async function load() {
      try {
        const snap = await getDocs(collection(firestore, 'widgets', widgetId, 'knowledge'));
        setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('[Knowledge] load error', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [widgetId]);

  const handleAdd = async () => {
    if (!newTitle.trim() || !newContent.trim() || !widgetId) return;
    setSaving(true);
    try {
      const ref = await addDoc(collection(firestore, 'widgets', widgetId, 'knowledge'), {
        title: newTitle.trim(),
        content: newContent.trim(),
        createdAt: serverTimestamp(),
      });
      setEntries(prev => [...prev, { id: ref.id, title: newTitle.trim(), content: newContent.trim() }]);
      setNewTitle('');
      setNewContent('');
      setAdding(false);
      showToast('Knowledge entry added — concierge will use this immediately');
    } catch (e) {
      showToast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId) => {
    try {
      await deleteDoc(doc(firestore, 'widgets', widgetId, 'knowledge', entryId));
      setEntries(prev => prev.filter(e => e.id !== entryId));
      showToast('Entry removed');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const handleSave = async (entryId, updates) => {
    await updateDoc(doc(firestore, 'widgets', widgetId, 'knowledge', entryId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, ...updates } : e));
    showToast('Saved');
  };

  const useTemplate = (template) => {
    setNewTitle(template.title);
    setNewContent(template.content);
    setAdding(true);
  };

  if (!widgetId) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-[13px]" style={{ color: '#CBD5E1' }}>No widget selected</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg"
            style={{ background: toast.type === 'error' ? '#EF4444' : '#5B5FFF', color: '#fff' }}>
            {toast.type === 'error'
              ? <AlertCircle size={13} />
              : <CheckCircle size={13} />}
            <span className="text-[12px] font-semibold">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[16px] font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>
            Knowledge Base
          </h2>
          <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>
            Everything your concierge knows about your business.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 3px 12px rgba(91,95,255,0.3)' }}>
          <Plus size={13} /> Add entry
        </button>
      </div>

      {/* How it works banner */}
      <div className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.1)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(91,95,255,0.12)' }}>
          <Zap size={14} style={{ color: '#5B5FFF' }} />
        </div>
        <div>
          <p className="text-[12px] font-bold mb-0.5" style={{ color: '#5B5FFF' }}>How this works</p>
          <p className="text-[11px]" style={{ color: '#64748B', lineHeight: 1.5 }}>
            Every entry is injected into the AI's context before each conversation. The concierge uses this to answer questions about pricing, services, FAQs, and anything else you add — accurately and instantly.
          </p>
        </div>
      </div>

      {/* Add entry form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl p-5" style={glassCard}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-black" style={{ color: '#0A0F1E' }}>New entry</p>
              <button onClick={() => { setAdding(false); setNewTitle(''); setNewContent(''); }}>
                <X size={15} style={{ color: '#CBD5E1' }} />
              </button>
            </div>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Title (e.g. Pricing, FAQ, About us…)"
              className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none mb-3"
              style={{ border: '1px solid rgba(91,95,255,0.15)', color: '#374151', background: 'rgba(91,95,255,0.02)' }}
            />
            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={6}
              placeholder="Write everything the AI should know about this topic…"
              className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none resize-none mb-3"
              style={{ border: '1px solid rgba(91,95,255,0.15)', color: '#374151', background: 'rgba(91,95,255,0.02)', lineHeight: 1.6 }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                disabled={saving || !newTitle.trim() || !newContent.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white"
                style={{ background: saving ? 'rgba(91,95,255,0.5)' : '#5B5FFF', opacity: (!newTitle.trim() || !newContent.trim()) ? 0.5 : 1 }}>
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {saving ? 'Saving…' : 'Save entry'}
              </button>
              <button onClick={() => { setAdding(false); setNewTitle(''); setNewContent(''); }}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold"
                style={{ color: '#94A3B8', background: 'rgba(0,0,0,0.04)' }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing entries */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 rounded-2xl animate-pulse" style={{ background: 'rgba(91,95,255,0.04)' }} />
          ))}
        </div>
      ) : entries.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {entries.map(entry => (
              <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} onSave={handleSave} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        !adding && (
          <div className="rounded-2xl p-8 text-center" style={glassCard}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(91,95,255,0.06)' }}>
              <BookOpen size={20} style={{ color: '#CBD5E1' }} />
            </div>
            <p className="text-[13px] font-semibold mb-1" style={{ color: '#374151' }}>No knowledge yet</p>
            <p className="text-[12px] mb-5" style={{ color: '#94A3B8' }}>
              Add what your concierge should know — pricing, services, FAQs, booking process.
            </p>
            {/* Templates */}
            <div className="text-left">
              <p className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: '#CBD5E1' }}>
                Start with a template
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ENTRY_TEMPLATES.map(t => (
                  <button key={t.title} onClick={() => useTemplate(t)}
                    className="text-left px-3 py-2.5 rounded-xl text-[11px] font-semibold transition-colors"
                    style={{ background: 'rgba(91,95,255,0.05)', color: '#5B5FFF', border: '1px solid rgba(91,95,255,0.1)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.05)'}>
                    <Lightbulb size={11} className="inline mr-1" />
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      )}

    </div>
  );
}
