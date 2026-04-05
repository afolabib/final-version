import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useCompany } from '@/contexts/CompanyContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Search, FileText, BarChart2, Calendar,
  ClipboardList, Lightbulb, BookOpen, X, Copy, CheckCheck,
  Bot, Clock,
} from 'lucide-react';

// v2
const TAG_COLORS = {
  sales:       { bg: 'rgba(0,184,148,0.09)',   color: '#00B894', border: 'rgba(0,184,148,0.2)' },
  marketing:   { bg: 'rgba(253,203,110,0.12)', color: '#E67E22', border: 'rgba(253,203,110,0.3)' },
  finance:     { bg: 'rgba(91,95,255,0.09)',   color: '#5B5FFF', border: 'rgba(91,95,255,0.2)' },
  engineering: { bg: 'rgba(9,132,227,0.09)',   color: '#0984E3', border: 'rgba(9,132,227,0.2)' },
  research:    { bg: 'rgba(162,155,254,0.12)', color: '#6C5CE7', border: 'rgba(162,155,254,0.3)' },
  ops:         { bg: 'rgba(108,92,231,0.09)',  color: '#6C5CE7', border: 'rgba(108,92,231,0.2)' },
  support:     { bg: 'rgba(225,112,85,0.09)',  color: '#E17055', border: 'rgba(225,112,85,0.2)' },
  strategy:    { bg: 'rgba(253,203,110,0.09)', color: '#FDCB6E', border: 'rgba(253,203,110,0.25)' },
};

const TYPE_ICONS = {
  report:   BarChart2,
  table:    ClipboardList,
  plan:     ClipboardList,
  calendar: Calendar,
  analysis: Lightbulb,
  brief:    BookOpen,
  other:    FileText,
};


function Tag({ tag }) {
  const c = TAG_COLORS[tag] || { bg: 'rgba(0,0,0,0.05)', color: '#64748B', border: 'rgba(0,0,0,0.1)' };
  return (
    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {tag}
    </span>
  );
}

function DocViewer({ doc, onClose }) {
  const [copied, setCopied] = useState(false);
  const Icon = TYPE_ICONS[doc.type] || FileText;

  function copy() {
    navigator.clipboard.writeText(doc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const date = doc.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,26,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full flex flex-col rounded-2xl overflow-hidden"
        style={{ maxWidth: 720, maxHeight: '88vh', background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #F0F1FF' }}>
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(91,95,255,0.08)' }}>
              <Icon size={16} style={{ color: '#5B5FFF' }} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold leading-snug" style={{ color: '#0A0A1A' }}>{doc.title}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {(doc.tags || []).map(t => <Tag key={t} tag={t} />)}
                <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                  {doc.agentName || 'Agent'} · {date}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <button onClick={copy}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ color: copied ? '#5B5FFF' : '#94A3B8', background: copied ? 'rgba(91,95,255,0.08)' : 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#5B5FFF'; e.currentTarget.style.background = 'rgba(91,95,255,0.08)'; }}
              onMouseLeave={e => { if (!copied) { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; } }}>
              {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <pre className="text-xs leading-relaxed whitespace-pre-wrap rounded-xl p-4"
            style={{
              background: '#F8FAFF',
              border: '1px solid rgba(91,95,255,0.09)',
              color: '#374151',
              fontFamily: 'ui-monospace, monospace',
            }}>
            {doc.content}
          </pre>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DocCard({ doc, onClick }) {
  const Icon = TYPE_ICONS[doc.type] || FileText;
  const date = doc.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '—';
  const preview = doc.content?.slice(0, 120).replace(/[#*`>\-|]/g, '').trim() || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="rounded-2xl p-4 cursor-pointer flex flex-col gap-3 transition-all"
      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(91,95,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(91,95,255,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'; }}>

      {/* Icon + type */}
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(91,95,255,0.08)' }}>
          <Icon size={14} style={{ color: '#5B5FFF' }} />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(91,95,255,0.06)', color: '#5B5FFF' }}>
          {doc.type}
        </span>
      </div>

      {/* Title */}
      <div>
        <p className="text-sm font-bold leading-snug mb-1" style={{ color: '#0A0A1A' }}>{doc.title}</p>
        {preview && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#94A3B8' }}>{preview}</p>
        )}
      </div>

      {/* Tags + meta */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex gap-1 flex-wrap">
          {(doc.tags || []).slice(0, 2).map(t => <Tag key={t} tag={t} />)}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Bot size={10} style={{ color: '#CBD5E1' }} />
          <span className="text-[10px]" style={{ color: '#CBD5E1' }}>{doc.agentName || 'Agent'}</span>
          <span className="text-[10px] ml-1" style={{ color: '#E2E8F0' }}>·</span>
          <Clock size={9} style={{ color: '#CBD5E1' }} />
          <span className="text-[10px]" style={{ color: '#CBD5E1' }}>{date}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function FilesView() {
  const { activeCompanyId } = useCompany();
  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [activeTag, setTag]     = useState('All');
  const [selected, setSelected] = useState(null);

  // Tags derived from actual documents
  const availableTags = ['All', ...Array.from(new Set(docs.flatMap(d => d.tags || []))).sort()];

  useEffect(() => {
    if (!activeCompanyId) { setLoading(false); return; }
    const q = query(
      collection(firestore, 'documents'),
      where('companyId', '==', activeCompanyId),
    );
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setDocs(list);
      setLoading(false);
    });
    return unsub;
  }, [activeCompanyId]);

  const filtered = docs.filter(d => {
    const matchTag = activeTag === 'All' || (d.tags || []).includes(activeTag);
    const matchSearch = !search || d.title?.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F7FF 45%, #FAFCFF 100%)' }}>

      <div className="flex-1 overflow-y-auto px-8 py-7">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0A0A1A' }}>Files</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
              {docs.length} document{docs.length !== 1 ? 's' : ''} saved by your agents
            </p>
          </div>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.08)' }}>
            <Search size={13} style={{ color: '#94A3B8' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="text-sm outline-none bg-transparent w-40"
              style={{ color: '#0A0A1A' }}
            />
          </div>
        </div>

        {/* Tag filters — only shown when docs exist */}
        {availableTags.length > 1 && (
        <div className="flex gap-1.5 flex-wrap mb-6">
          {availableTags.map(t => {
            const isActive = activeTag === t;
            const c = TAG_COLORS[t];
            return (
              <button key={t} onClick={() => setTag(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                style={{
                  background: isActive ? (c ? c.bg : 'rgba(91,95,255,0.1)') : 'rgba(255,255,255,0.8)',
                  color: isActive ? (c ? c.color : '#5B5FFF') : '#6B7280',
                  border: isActive ? `1px solid ${c ? c.border : 'rgba(91,95,255,0.2)'}` : '1px solid rgba(0,0,0,0.06)',
                }}>
                {t}
              </button>
            );
          })}
        </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.6)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(91,95,255,0.06)' }}>
              <FolderOpen size={24} style={{ color: '#CBD5E1' }} />
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: '#374151' }}>
              {docs.length === 0 ? 'No documents yet' : 'No documents match this filter'}
            </p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              {docs.length === 0
                ? 'Ask an agent to create a report, calendar, or analysis — it will appear here.'
                : 'Try a different tag or clear the search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(doc => (
              <DocCard key={doc.id} doc={doc} onClick={() => setSelected(doc)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <DocViewer doc={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
