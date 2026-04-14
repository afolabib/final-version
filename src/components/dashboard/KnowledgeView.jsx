import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, deleteDoc, doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useWidget } from '@/contexts/WidgetContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Upload, Globe, FileText, Plus, X, Search,
  Trash2, Download, Link2, CheckCircle2, Clock, AlertCircle,
  File, Image, FileSpreadsheet, BookOpen, Loader2, Check,
  ChevronRight, Sparkles, Building2, Bot, Zap, Lock,
} from 'lucide-react';
import WidgetKnowledge from './widget/WidgetKnowledge';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(b) {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const m = Math.floor((Date.now() - d) / 60000);
  if (m < 2) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function fileIcon(mime = '') {
  if (mime.startsWith('image/')) return Image;
  if (mime === 'application/pdf') return FileText;
  if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv')) return FileSpreadsheet;
  if (mime.includes('word') || mime.includes('document')) return BookOpen;
  return File;
}

// ── Source type meta ──────────────────────────────────────────────────────────

const SOURCE_META = {
  file:    { label: 'File',    color: '#5B5FFF', bg: 'rgba(91,95,255,0.08)',   icon: File },
  website: { label: 'Website', color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)',  icon: Globe },
  text:    { label: 'Text',    color: '#5B5FFF', bg: 'rgba(91,95,255,0.08)',  icon: BookOpen },
};

const STATUS_META = {
  active:     { label: 'Indexed',    color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)',  icon: CheckCircle2 },
  processing: { label: 'Processing', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  icon: Clock },
  error:      { label: 'Error',      color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   icon: AlertCircle },
};

// ── Source card ───────────────────────────────────────────────────────────────

function SourceCard({ source, onDelete, index }) {
  const [hover, setHover] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const sm = SOURCE_META[source.sourceType] || SOURCE_META.file;
  const st = STATUS_META[source.status || 'active'];
  const StatusIcon = st.icon;
  const TypeIcon = source.sourceType === 'file'
    ? fileIcon(source.fileMime)
    : sm.icon;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    onDelete(source.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setConfirmDelete(false); }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-150"
      style={{
        background: hover ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(91,95,255,0.07)',
        boxShadow: hover ? '0 4px 20px rgba(91,95,255,0.08)' : '0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: sm.bg }}>
        <TypeIcon size={18} strokeWidth={1.8} style={{ color: sm.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-semibold truncate" style={{ color: '#0A0F1E' }}>
            {source.title || source.fileName || source.url || 'Untitled'}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: sm.bg, color: sm.color }}>
            {sm.label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]" style={{ color: '#94A3B8' }}>
          {source.sourceType === 'website' && source.url && (
            <span className="truncate max-w-[260px]">{source.url.replace(/^https?:\/\//, '')}</span>
          )}
          {source.sourceType === 'file' && source.fileSize && (
            <span>{formatBytes(source.fileSize)}</span>
          )}
          {source.sourceType === 'text' && source.content && (
            <span className="truncate max-w-[260px]">{source.content.slice(0, 80)}…</span>
          )}
          <span className="flex-shrink-0">·</span>
          <span className="flex-shrink-0">{timeAgo(source.createdAt)}</span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5 flex-shrink-0 px-2 py-1 rounded-full"
        style={{ background: st.bg }}>
        <StatusIcon size={11} style={{ color: st.color }} />
        <span className="text-[10px] font-bold" style={{ color: st.color }}>{st.label}</span>
      </div>

      {/* Actions */}
      <div className={`flex items-center gap-1 flex-shrink-0 transition-opacity ${hover ? 'opacity-100' : 'opacity-0'}`}>
        {source.downloadUrl && (
          <a href={source.downloadUrl} download target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.08)'; e.currentTarget.style.color = '#5B5FFF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
            <Download size={13} />
          </a>
        )}
        {source.sourceType === 'website' && source.url && (
          <a href={source.url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.08)'; e.currentTarget.style.color = '#0EA5E9'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
            <Link2 size={13} />
          </a>
        )}
        <button
          onClick={handleDelete}
          className="h-7 rounded-lg flex items-center justify-center gap-1 px-2 transition-all text-[11px] font-semibold"
          style={{
            background: confirmDelete ? 'rgba(239,68,68,0.1)' : 'transparent',
            color: confirmDelete ? '#EF4444' : '#94A3B8',
          }}
          onMouseEnter={e => { if (!confirmDelete) { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.color = '#EF4444'; } }}
          onMouseLeave={e => { if (!confirmDelete) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}>
          <Trash2 size={13} />
          {confirmDelete && <span>Confirm</span>}
        </button>
      </div>
    </motion.div>
  );
}

// ── Upload modal ──────────────────────────────────────────────────────────────

function UploadModal({ onClose, onUpload, uploading, progress }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    if (files?.length) onUpload(files[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,15,30,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ maxWidth: 480, background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.16)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #F0F1FF' }}>
          <div>
            <h3 className="text-base font-black" style={{ color: '#0A0F1E' }}>Upload a file</h3>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>PDF, Word, Excel, images — up to 25 MB</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          <div
            className="relative rounded-2xl flex flex-col items-center justify-center gap-3 py-12 cursor-pointer transition-all"
            style={{
              border: `2px dashed ${dragOver ? '#5B5FFF' : 'rgba(91,95,255,0.2)'}`,
              background: dragOver ? 'rgba(91,95,255,0.04)' : 'rgba(91,95,255,0.02)',
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp"
              onChange={e => handleFiles(e.target.files)} />

            {uploading ? (
              <>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(91,95,255,0.1)' }}>
                  <Loader2 size={22} className="animate-spin" style={{ color: '#5B5FFF' }} />
                </div>
                <div className="w-full px-8">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(91,95,255,0.1)' }}>
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #5B5FFF, #7C3AED)' }} />
                  </div>
                  <p className="text-xs text-center mt-2 font-medium" style={{ color: '#5B5FFF' }}>
                    Uploading… {Math.round(progress)}%
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(91,95,255,0.08)' }}>
                  <Upload size={22} strokeWidth={1.8} style={{ color: '#5B5FFF' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold" style={{ color: '#0A0F1E' }}>
                    Drop your file here
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                    or click to browse
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Website modal ─────────────────────────────────────────────────────────────

function WebsiteModal({ onClose, onAdd }) {
  const [url, setUrl] = useState('https://');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const isValid = url.startsWith('http') && url.length > 10;

  const handle = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      const parsedTitle = title || new URL(url).hostname.replace('www.', '');
      await onAdd({ url: url.trim(), title: parsedTitle });
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,15,30,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ maxWidth: 460, background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.16)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #F0F1FF' }}>
          <div>
            <h3 className="text-base font-black" style={{ color: '#0A0F1E' }}>Add a website</h3>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Your AI will read this page for answers</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black tracking-[0.12em] uppercase mb-2" style={{ color: '#94A3B8' }}>URL</label>
            <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1.5px solid rgba(91,95,255,0.15)', background: 'rgba(91,95,255,0.02)' }}>
              <div className="px-3 flex items-center" style={{ color: '#0EA5E9' }}>
                <Globe size={15} />
              </div>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handle()}
                placeholder="https://example.com/about"
                className="flex-1 px-2 py-3 text-sm outline-none bg-transparent"
                style={{ color: '#1F2937' }}
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black tracking-[0.12em] uppercase mb-2" style={{ color: '#94A3B8' }}>Label (optional)</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. About page, Pricing, FAQ"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid rgba(91,95,255,0.12)', background: 'rgba(91,95,255,0.02)', color: '#1F2937' }}
            />
          </div>

          <button
            onClick={handle}
            disabled={!isValid || saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <><Globe size={15} /> Add website</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Text / snippet modal ──────────────────────────────────────────────────────

function TextModal({ onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handle = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await onAdd({ title: title.trim(), content: content.trim() });
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,15,30,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ maxWidth: 520, background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.16)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #F0F1FF' }}>
          <div>
            <h3 className="text-base font-black" style={{ color: '#0A0F1E' }}>Add text knowledge</h3>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>FAQs, pricing, policies — anything your AI should know</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black tracking-[0.12em] uppercase mb-2" style={{ color: '#94A3B8' }}>Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Pricing, FAQ, Opening hours"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid rgba(91,95,255,0.12)', background: 'rgba(91,95,255,0.02)', color: '#1F2937' }}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] font-black tracking-[0.12em] uppercase mb-2" style={{ color: '#94A3B8' }}>Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write anything your AI should know. FAQ answers, service details, policies, prices…"
              rows={6}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ border: '1.5px solid rgba(91,95,255,0.12)', background: 'rgba(91,95,255,0.02)', color: '#1F2937', lineHeight: 1.6 }}
            />
            <p className="text-[10px] mt-1.5" style={{ color: '#CBD5E1' }}>{content.length} characters</p>
          </div>

          <button
            onClick={handle}
            disabled={!isValid || saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 16px rgba(91,95,255,0.25)' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <><BookOpen size={15} /> Save knowledge</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Company knowledge card (pinned, editable, synced with widget doc) ─────────

const TONE_OPTIONS = ['friendly', 'professional', 'balanced', 'casual', 'formal'];
const PERSONALITY_OPTIONS = ['friendly', 'professional', 'helpful', 'energetic', 'empathetic', 'concise'];
const CAPABILITY_OPTIONS  = ['bookings', 'enquiries', 'leads', 'support', 'sales', 'faqs'];

function TagPicker({ options, value = [], onChange, color }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {options.map(opt => {
        const on = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(on ? value.filter(v => v !== opt) : [...value, opt])}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all capitalize"
            style={{
              background: on ? `${color}18` : 'rgba(0,0,0,0.04)',
              color: on ? color : '#94A3B8',
              border: `1px solid ${on ? color + '30' : 'transparent'}`,
            }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function CompanyKnowledgeCard({ widget, company, widgetId }) {
  const [expanded, setExpanded] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  const color = widget?.primaryColor || '#5B5FFF';

  const [form, setForm] = useState({
    businessName: '',
    botName:      '',
    greeting:     '',
    tone:         '',
    personality:  [],
    capabilities: [],
    site:         '',
  });

  // Sync form when widget changes
  useEffect(() => {
    setForm({
      businessName: widget?.businessName || company?.name || '',
      botName:      widget?.botName      || '',
      greeting:     widget?.greeting     || '',
      tone:         widget?.tone         || '',
      personality:  widget?.personality  || [],
      capabilities: widget?.capabilities || [],
      site:         widget?.site         || '',
    });
  }, [widget, company]);

  const handleSave = async () => {
    if (!widgetId) return;
    setSaving(true);
    try {
      await updateDoc(doc(firestore, 'widgets', widgetId), {
        businessName: form.businessName,
        botName:      form.botName,
        greeting:     form.greeting,
        tone:         form.tone,
        personality:  form.personality,
        capabilities: form.capabilities,
        site:         form.site,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, placeholder) => (
    <div>
      <label className="block text-[9px] font-black tracking-[0.12em] uppercase mb-1.5" style={{ color: '#CBD5E1' }}>
        {label}
      </label>
      {key === 'greeting' ? (
        <textarea
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          rows={2}
          className="w-full px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
          style={{ border: `1.5px solid ${color}20`, background: `${color}06`, color: '#374151', lineHeight: 1.5 }}
        />
      ) : (
        <input
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
          style={{ border: `1.5px solid ${color}20`, background: `${color}06`, color: '#374151' }}
        />
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        border: `1px solid ${color}22`,
        background: `linear-gradient(135deg, ${color}08, ${color}04)`,
        boxShadow: `0 2px 12px ${color}0f`,
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-4">
        <button
          onClick={() => { if (!editing) setExpanded(e => !e); }}
          className="flex items-center gap-4 flex-1 min-w-0 text-left"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}18` }}>
            <Building2 size={18} strokeWidth={1.8} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[13px] font-semibold truncate" style={{ color: '#0A0F1E' }}>
                {form.businessName || 'Company'} — Company Profile
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                style={{ background: `${color}14`, color }}>
                <Lock size={8} strokeWidth={2.5} /> Auto
              </span>
            </div>
            <p className="text-[11px] truncate" style={{ color: '#94A3B8' }}>
              Bot: {form.botName || '—'}{form.site ? ` · ${form.site}` : ''}{form.tone ? ` · ${form.tone} tone` : ''}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: 'rgba(91,95,255,0.1)' }}>
            <CheckCircle2 size={11} style={{ color: '#5B5FFF' }} />
            <span className="text-[10px] font-bold" style={{ color: '#5B5FFF' }}>Active</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setEditing(v => !v); setExpanded(true); }}
            className="h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
            style={{
              background: editing ? `${color}14` : 'rgba(0,0,0,0.04)',
              color: editing ? color : '#94A3B8',
            }}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
          {!editing && (
            <ChevronRight size={13} style={{
              color: '#CBD5E1',
              transform: expanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 150ms',
              cursor: 'pointer',
            }} onClick={() => setExpanded(e => !e)} />
          )}
        </div>
      </div>

      {/* Expanded: view or edit */}
      <AnimatePresence>
        {(expanded || editing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden', borderTop: `1px solid ${color}14` }}
          >
            {editing ? (
              <div className="px-5 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {field('Business name', 'businessName', 'e.g. Lauren O\'Reilly')}
                  {field('Bot name', 'botName', 'e.g. Freemi')}
                </div>
                {field('Greeting', 'greeting', 'e.g. Hi! I\'m here to help...')}
                {field('Website', 'site', 'e.g. example.com')}

                <div>
                  <label className="block text-[9px] font-black tracking-[0.12em] uppercase mb-1" style={{ color: '#CBD5E1' }}>Tone</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {TONE_OPTIONS.map(t => (
                      <button key={t} type="button"
                        onClick={() => setForm(f => ({ ...f, tone: t }))}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all capitalize"
                        style={{
                          background: form.tone === t ? `${color}18` : 'rgba(0,0,0,0.04)',
                          color: form.tone === t ? color : '#94A3B8',
                          border: `1px solid ${form.tone === t ? color + '30' : 'transparent'}`,
                        }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black tracking-[0.12em] uppercase mb-1" style={{ color: '#CBD5E1' }}>Personality</label>
                  <TagPicker options={PERSONALITY_OPTIONS} value={form.personality} onChange={v => setForm(f => ({ ...f, personality: v }))} color={color} />
                </div>

                <div>
                  <label className="block text-[9px] font-black tracking-[0.12em] uppercase mb-1" style={{ color: '#CBD5E1' }}>Capabilities</label>
                  <TagPicker options={CAPABILITY_OPTIONS} value={form.capabilities} onChange={v => setForm(f => ({ ...f, capabilities: v }))} color={color} />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 14px ${color}40` }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} /> Saved!</> : 'Save changes'}
                </button>
              </div>
            ) : (
              <div className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  form.greeting     && { label: 'Greeting',     value: form.greeting },
                  form.tone         && { label: 'Tone',         value: form.tone.charAt(0).toUpperCase() + form.tone.slice(1) },
                  form.personality?.length && { label: 'Personality',  value: form.personality.join(', ') },
                  form.capabilities?.length && { label: 'Capabilities', value: form.capabilities.join(', ') },
                  form.site         && { label: 'Website',      value: form.site },
                ].filter(Boolean).map(row => (
                  <div key={row.label}>
                    <p className="text-[9px] font-black tracking-[0.12em] uppercase mb-0.5" style={{ color: '#CBD5E1' }}>{row.label}</p>
                    <p className="text-[12px] font-medium leading-snug" style={{ color: '#374151' }}>{row.value}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ tab, onUpload, onWebsite, onText }) {
  const configs = {
    all:     { icon: Brain,   color: '#5B5FFF', title: 'No knowledge sources yet', sub: 'Add files, websites, or text to teach your AI assistant.', actions: true },
    file:    { icon: File,    color: '#5B5FFF', title: 'No files uploaded',         sub: 'Upload PDFs, documents, or images for your AI to reference.' },
    website: { icon: Globe,   color: '#0EA5E9', title: 'No websites added',         sub: 'Add your website pages so your AI can answer from them.' },
    text:    { icon: BookOpen, color: '#5B5FFF', title: 'No text entries',          sub: 'Write FAQs, pricing info, or policies directly.' },
  };
  const c = configs[tab] || configs.all;
  const Icon = c.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
        style={{ background: `${c.color}12` }}>
        <Icon size={28} strokeWidth={1.5} style={{ color: `${c.color}99` }} />
      </div>
      <p className="text-sm font-bold mb-1" style={{ color: '#CBD5E1' }}>{c.title}</p>
      <p className="text-xs max-w-[260px] leading-relaxed mb-6" style={{ color: '#E2E8F0' }}>{c.sub}</p>
      {c.actions && (
        <div className="flex items-center gap-2">
          <button onClick={onUpload}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all"
            style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
            <Upload size={13} /> Upload file
          </button>
          <button onClick={onWebsite}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all"
            style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}>
            <Globe size={13} /> Add website
          </button>
          <button onClick={onText}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all"
            style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
            <BookOpen size={13} /> Add text
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function KnowledgeView() {
  const { user } = useAuth();
  const { activeCompany } = useCompany();
  const { activeWidget, activeWidgetId } = useWidget();
  // Prefer widget-scoped knowledge; fall back to company/user scope
  const activeCompanyId = activeWidgetId || activeCompany?.id || user?.uid;

  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'upload' | 'website' | 'text'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load knowledge sources from Firestore
  useEffect(() => {
    if (!activeCompanyId) return;
    const q = query(
      collection(firestore, 'documents'),
      where('companyId', '==', activeCompanyId),
    );
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.createdAt?.toDate?.() || new Date(0);
          const tb = b.createdAt?.toDate?.() || new Date(0);
          return tb - ta;
        });
      setSources(docs);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [activeCompanyId]);

  // Filtered sources
  const filtered = sources.filter(s => {
    if (tab !== 'all' && (s.sourceType || 'file') !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (s.title || s.fileName || s.url || '').toLowerCase().includes(q)
        || (s.content || '').toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all:     sources.length,
    file:    sources.filter(s => !s.sourceType || s.sourceType === 'file').length,
    website: sources.filter(s => s.sourceType === 'website').length,
    text:    sources.filter(s => s.sourceType === 'text').length,
  };

  // Handlers
  const handleUpload = useCallback(async (file) => {
    if (!file || !activeCompanyId) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const path = `documents/${activeCompanyId}/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, path);
      const task = uploadBytesResumable(sRef, file);
      task.on('state_changed', snap => {
        setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100);
      });
      await task;
      const downloadUrl = await getDownloadURL(sRef);
      await addDoc(collection(firestore, 'documents'), {
        companyId: activeCompanyId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileMime: file.type,
        fileSize: file.size,
        downloadUrl,
        sourceType: 'file',
        status: 'active',
        createdAt: serverTimestamp(),
      });
      setModal(null);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [activeCompanyId]);

  const handleAddWebsite = useCallback(async ({ url, title }) => {
    if (!activeCompanyId) return;
    await addDoc(collection(firestore, 'documents'), {
      companyId: activeCompanyId,
      title,
      url,
      sourceType: 'website',
      status: 'active',
      createdAt: serverTimestamp(),
    });
  }, [activeCompanyId]);

  const handleAddText = useCallback(async ({ title, content }) => {
    if (!activeCompanyId) return;
    await addDoc(collection(firestore, 'documents'), {
      companyId: activeCompanyId,
      title,
      content,
      sourceType: 'text',
      status: 'active',
      createdAt: serverTimestamp(),
    });
  }, [activeCompanyId]);

  const handleDelete = useCallback(async (id) => {
    await deleteDoc(doc(firestore, 'documents', id));
  }, []);

  const TABS = [
    { id: 'all',     label: 'All sources' },
    { id: 'file',    label: 'Files' },
    { id: 'website', label: 'Websites' },
    { id: 'text',    label: 'Text' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-7 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-xl font-black" style={{ color: '#0A0F1E' }}>Business Knowledge</h1>
              {sources.length > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(91,95,255,0.1)' }}>
                  <Sparkles size={11} style={{ color: '#5B5FFF' }} />
                  <span className="text-[10px] font-bold" style={{ color: '#5B5FFF' }}>AI connected</span>
                </div>
              )}
            </div>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {sources.length === 0
                ? 'Everything your AI knows about your business lives here.'
                : `${sources.length} source${sources.length !== 1 ? 's' : ''} · your AI reads all of these when answering visitors`}
            </p>
          </div>

          {/* Add buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setModal('upload')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all"
              style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF', border: '1px solid rgba(91,95,255,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.08)'}>
              <Upload size={13} /> Upload
            </button>
            <button
              onClick={() => setModal('website')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all"
              style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(14,165,233,0.08)'}>
              <Globe size={13} /> Add site
            </button>
            <button
              onClick={() => setModal('text')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all"
              style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF', border: '1px solid rgba(91,95,255,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.08)'}>
              <BookOpen size={13} /> Add text
            </button>
          </div>
        </div>

        {/* Tabs + search */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(91,95,255,0.07)' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: tab === t.id ? 'white' : 'transparent',
                  color: tab === t.id ? '#0A0F1E' : '#94A3B8',
                  boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}>
                {t.label}
                {counts[t.id] > 0 && (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
                    style={{ background: tab === t.id ? 'rgba(91,95,255,0.1)' : 'rgba(0,0,0,0.05)', color: tab === t.id ? '#5B5FFF' : '#94A3B8' }}>
                    {counts[t.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {sources.length > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(91,95,255,0.07)' }}>
              <Search size={13} style={{ color: '#94A3B8' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search sources…"
                className="bg-transparent outline-none text-xs w-36"
                style={{ color: '#374151' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ color: '#CBD5E1' }}>
                  <X size={11} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Concierge knowledge base — widget-specific FAQ/text entries */}
        {tab === 'all' && activeWidgetId && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(91,95,255,0.1)', background: 'rgba(255,255,255,0.97)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <p className="text-[12px] font-black uppercase tracking-wider" style={{ color: '#94A3B8' }}>Concierge Knowledge</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#CBD5E1' }}>Text entries injected directly into every conversation</p>
            </div>
            <div className="p-5">
              <WidgetKnowledge />
            </div>
          </div>
        )}

        {/* Company profile card — always first */}
        {tab === 'all' && (
          <CompanyKnowledgeCard widget={activeWidget} company={activeCompany} widgetId={activeWidgetId} />
        )}

        {/* Source list */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 rounded-full border-2 border-indigo-100 border-t-indigo-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              tab={tab}
              onUpload={() => setModal('upload')}
              onWebsite={() => setModal('website')}
              onText={() => setModal('text')}
            />
          ) : (
            <AnimatePresence>
              {filtered.map((source, i) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  onDelete={handleDelete}
                  index={i}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* AI tip banner */}
        {sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(91,95,255,0.06), rgba(124,58,237,0.04))', border: '1px solid rgba(91,95,255,0.1)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(91,95,255,0.1)' }}>
              <Brain size={15} style={{ color: '#5B5FFF' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: '#5B5FFF' }}>
                Your AI reads all {sources.length} source{sources.length !== 1 ? 's' : ''} when answering visitors.
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                Add more to improve accuracy — the more you add, the better the answers.
              </p>
            </div>
            <ChevronRight size={14} style={{ color: '#C7D2FE', flexShrink: 0 }} />
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'upload' && (
          <UploadModal
            onClose={() => !uploading && setModal(null)}
            onUpload={handleUpload}
            uploading={uploading}
            progress={uploadProgress}
          />
        )}
        {modal === 'website' && (
          <WebsiteModal onClose={() => setModal(null)} onAdd={handleAddWebsite} />
        )}
        {modal === 'text' && (
          <TextModal onClose={() => setModal(null)} onAdd={handleAddText} />
        )}
      </AnimatePresence>
    </div>
  );
}
