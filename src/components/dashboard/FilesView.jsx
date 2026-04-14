import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '@/lib/firebaseClient';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Search, FileText, BarChart2, Calendar,
  ClipboardList, Lightbulb, BookOpen, X, Copy, CheckCheck,
  Bot, Clock, Plus, Upload, Download, File, Image, FileSpreadsheet,
} from 'lucide-react';

// ── Tag colours ───────────────────────────────────────────────────────────────
const TAG_COLORS = {
  sales:       { bg: 'rgba(0,184,148,0.09)',   color: '#00B894', border: 'rgba(0,184,148,0.2)' },
  marketing:   { bg: 'rgba(253,203,110,0.12)', color: '#E67E22', border: 'rgba(253,203,110,0.3)' },
  finance:     { bg: 'rgba(91,95,255,0.09)',   color: '#5B5FFF', border: 'rgba(91,95,255,0.2)' },
  engineering: { bg: 'rgba(9,132,227,0.09)',   color: '#0984E3', border: 'rgba(9,132,227,0.2)' },
  research:    { bg: 'rgba(162,155,254,0.12)', color: '#6C5CE7', border: 'rgba(162,155,254,0.3)' },
  ops:         { bg: 'rgba(108,92,231,0.09)',  color: '#6C5CE7', border: 'rgba(108,92,231,0.2)' },
  support:     { bg: 'rgba(225,112,85,0.09)',  color: '#E17055', border: 'rgba(225,112,85,0.2)' },
  strategy:    { bg: 'rgba(253,203,110,0.09)', color: '#FDCB6E', border: 'rgba(253,203,110,0.25)' },
  design:      { bg: 'rgba(253,121,168,0.09)', color: '#FD79A8', border: 'rgba(253,121,168,0.2)' },
  legal:       { bg: 'rgba(99,110,114,0.09)',  color: '#636E72', border: 'rgba(99,110,114,0.2)' },
  hr:          { bg: 'rgba(0,206,201,0.09)',   color: '#00CEC9', border: 'rgba(0,206,201,0.2)' },
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

const DOC_TYPES = ['report', 'plan', 'analysis', 'brief', 'table', 'calendar', 'other'];

// ── Auto-tagger ───────────────────────────────────────────────────────────────
const TAG_KEYWORDS = {
  marketing:   ['marketing', 'campaign', 'brand', 'social', 'ads', 'email', 'content', 'seo', 'growth', 'launch'],
  sales:       ['sales', 'crm', 'pipeline', 'deal', 'prospect', 'lead', 'revenue', 'quota', 'customer'],
  finance:     ['finance', 'budget', 'invoice', 'payment', 'accounting', 'p&l', 'revenue', 'cost', 'forecast', 'expense'],
  engineering: ['engineering', 'code', 'api', 'backend', 'frontend', 'deploy', 'github', 'technical', 'architecture', 'database'],
  research:    ['research', 'analysis', 'study', 'report', 'insight', 'data', 'survey', 'findings'],
  strategy:    ['strategy', 'roadmap', 'plan', 'objective', 'okr', 'goal', 'vision', 'mission'],
  design:      ['design', 'ui', 'ux', 'figma', 'wireframe', 'prototype', 'mockup', 'brand'],
  hr:          ['hr', 'hiring', 'recruit', 'onboarding', 'employee', 'team', 'culture', 'policy'],
  legal:       ['legal', 'contract', 'agreement', 'terms', 'compliance', 'gdpr', 'privacy'],
  ops:         ['ops', 'operations', 'process', 'workflow', 'sop', 'logistics', 'supply'],
  support:     ['support', 'ticket', 'customer', 'help', 'faq', 'docs'],
};

function autoTag(name = '', content = '') {
  const text = (name + ' ' + content).toLowerCase();
  return Object.entries(TAG_KEYWORDS)
    .filter(([, kws]) => kws.some(kw => text.includes(kw)))
    .map(([tag]) => tag);
}

function fileTypeFromMime(mime = '') {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv')) return 'table';
  if (mime.includes('presentation') || mime.includes('powerpoint')) return 'presentation';
  if (mime.includes('word') || mime.includes('document')) return 'brief';
  return 'other';
}

function FileTypeIcon({ mime, size = 16 }) {
  if (mime?.startsWith('image/')) return <Image size={size} />;
  if (mime === 'application/pdf') return <FileText size={size} />;
  if (mime?.includes('spreadsheet') || mime?.includes('excel') || mime?.includes('csv')) return <FileSpreadsheet size={size} />;
  return <File size={size} />;
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Tag pill ──────────────────────────────────────────────────────────────────
function Tag({ tag }) {
  const c = TAG_COLORS[tag] || { bg: 'rgba(0,0,0,0.05)', color: '#64748B', border: 'rgba(0,0,0,0.1)' };
  return (
    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {tag}
    </span>
  );
}

// ── Doc viewer modal ──────────────────────────────────────────────────────────
function DocViewer({ doc, onClose }) {
  const [copied, setCopied] = useState(false);
  const Icon = doc.fileType ? FileTypeIcon : (TYPE_ICONS[doc.type] || FileText);
  const isFile = !!doc.downloadUrl;

  function copy() {
    navigator.clipboard.writeText(doc.content || '');
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
              {isFile
                ? <FileTypeIcon mime={doc.fileMime} size={16} />
                : (() => { const I = TYPE_ICONS[doc.type] || FileText; return <I size={16} style={{ color: '#5B5FFF' }} />; })()
              }
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold leading-snug" style={{ color: '#0A0A1A' }}>{doc.title}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {(doc.tags || []).map(t => <Tag key={t} tag={t} />)}
                <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                  {doc.agentName || 'Agent'} · {date}
                  {doc.fileSize ? ` · ${formatBytes(doc.fileSize)}` : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {isFile ? (
              <a
                href={doc.downloadUrl}
                download={doc.fileName || doc.title}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.08)' }}
                onClick={e => e.stopPropagation()}>
                <Download size={12} /> Download
              </a>
            ) : (
              <button onClick={copy}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ color: copied ? '#5B5FFF' : '#94A3B8', background: copied ? 'rgba(91,95,255,0.08)' : 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#5B5FFF'; e.currentTarget.style.background = 'rgba(91,95,255,0.08)'; }}
                onMouseLeave={e => { if (!copied) { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; } }}>
                {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
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
          {isFile && doc.fileMime?.startsWith('image/') ? (
            <img src={doc.downloadUrl} alt={doc.title} className="max-w-full rounded-xl" />
          ) : isFile ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(91,95,255,0.06)' }}>
                <FileTypeIcon mime={doc.fileMime} size={28} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#374151' }}>{doc.fileName}</p>
              <a
                href={doc.downloadUrl}
                download={doc.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: '#5B5FFF', color: '#fff' }}>
                <Download size={14} /> Download file
              </a>
            </div>
          ) : (
            <pre className="text-xs leading-relaxed whitespace-pre-wrap rounded-xl p-4"
              style={{
                background: '#F8FAFF',
                border: '1px solid rgba(91,95,255,0.09)',
                color: '#374151',
                fontFamily: 'ui-monospace, monospace',
              }}>
              {doc.content}
            </pre>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── New / upload modal ────────────────────────────────────────────────────────
function NewDocModal({ companyId, userId, onClose }) {
  const [tab, setTab] = useState('write'); // 'write' | 'upload'
  // Write tab
  const [title, setTitle]       = useState('');
  const [type, setType]         = useState('report');
  const [content, setContent]   = useState('');
  const [tagInput, setTagInput] = useState('');
  // Upload tab
  const [file, setFile]         = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const fileRef = useRef();

  // Auto-suggest tags when title/content changes (write tab)
  const suggestedTags = tab === 'write' ? autoTag(title, content) : [];
  const manualTags = tagInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  const allTags = [...new Set([...manualTags, ...suggestedTags])];

  async function handleSaveDoc() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    await addDoc(collection(firestore, 'documents'), {
      companyId,
      title: title.trim(),
      type,
      content: content.trim(),
      tags: allTags,
      agentName: 'You',
      actorType: 'human',
      createdBy: userId || 'user',
      createdAt: serverTimestamp(),
    });
    onClose();
  }

  function handleFileSelect(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    // Auto-fill title from filename (strip extension)
    setTitle(f.name.replace(/\.[^/.]+$/, ''));
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    const path = `companies/${companyId}/files/${Date.now()}_${file.name}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, file);

    task.on('state_changed',
      snap => setProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
      err => { console.error(err); setUploading(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        const detectedTags = autoTag(file.name);
        await addDoc(collection(firestore, 'documents'), {
          companyId,
          title: title.trim() || file.name,
          type: fileTypeFromMime(file.type),
          fileType: 'uploaded',
          fileName: file.name,
          fileMime: file.type,
          fileSize: file.size,
          storagePath: path,
          downloadUrl: url,
          tags: detectedTags,
          agentName: 'You',
          actorType: 'human',
          createdBy: userId || 'user',
          createdAt: serverTimestamp(),
        });
        onClose();
      }
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,26,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full flex flex-col rounded-2xl overflow-hidden"
        style={{ maxWidth: 540, maxHeight: '88vh', background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header + tabs */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #F0F1FF' }}>
          <div className="flex gap-1">
            {[['write', 'Write'], ['upload', 'Upload file']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: tab === id ? 'rgba(91,95,255,0.1)' : 'transparent',
                  color: tab === id ? '#5B5FFF' : '#94A3B8',
                }}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={14} />
          </button>
        </div>

        {tab === 'write' ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: '#94A3B8' }}>Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Q2 Marketing Plan"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#F8FAFF', border: '1px solid rgba(91,95,255,0.12)', color: '#0A0A1A' }}
                  autoFocus />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: '#94A3B8' }}>Type</label>
                <select value={type} onChange={e => setType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none capitalize"
                  style={{ background: '#F8FAFF', border: '1px solid rgba(91,95,255,0.12)', color: '#0A0A1A' }}>
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: '#94A3B8' }}>Content</label>
                <textarea value={content} onChange={e => setContent(e.target.value)}
                  placeholder="Write your document content here…"
                  rows={7}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: '#F8FAFF', border: '1px solid rgba(91,95,255,0.12)', color: '#0A0A1A', lineHeight: 1.6 }} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: '#94A3B8' }}>
                  Tags <span style={{ color: '#CBD5E1', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(comma-separated)</span>
                </label>
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  placeholder="e.g. marketing, sales"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#F8FAFF', border: '1px solid rgba(91,95,255,0.12)', color: '#0A0A1A' }} />
                {suggestedTags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px]" style={{ color: '#CBD5E1' }}>Auto-detected:</span>
                    {suggestedTags.map(t => <Tag key={t} tag={t} />)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid #F0F1FF' }}>
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ color: '#64748B', background: 'rgba(0,0,0,0.04)' }}>Cancel</button>
              <button onClick={handleSaveDoc} disabled={!title.trim() || !content.trim() || saving}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: !title.trim() || !content.trim() ? 'rgba(91,95,255,0.3)' : '#5B5FFF', color: '#fff', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save Document'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-all py-12"
                style={{
                  background: file ? 'rgba(91,95,255,0.04)' : 'rgba(91,95,255,0.03)',
                  border: `2px dashed ${file ? 'rgba(91,95,255,0.3)' : 'rgba(91,95,255,0.15)'}`,
                }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(91,95,255,0.5)'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = file ? 'rgba(91,95,255,0.3)' : 'rgba(91,95,255,0.15)'; }}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) { setFile(f); setTitle(f.name.replace(/\.[^/.]+$/, '')); } }}>
                <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} />
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(91,95,255,0.08)' }}>
                  {file ? <FileTypeIcon mime={file.type} size={22} /> : <Upload size={22} style={{ color: '#5B5FFF' }} />}
                </div>
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold" style={{ color: '#0A0A1A' }}>{file.name}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{formatBytes(file.size)}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-semibold" style={{ color: '#374151' }}>Click to browse or drag & drop</p>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>PDF, images, spreadsheets, Word docs…</p>
                  </div>
                )}
              </div>

              {file && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: '#94A3B8' }}>Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#F8FAFF', border: '1px solid rgba(91,95,255,0.12)', color: '#0A0A1A' }} />
                  </div>

                  {/* Auto-tags preview */}
                  {autoTag(file.name).length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: '#94A3B8' }}>Auto-detected tags</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {autoTag(file.name).map(t => <Tag key={t} tag={t} />)}
                      </div>
                    </div>
                  )}

                  {/* Upload progress */}
                  {uploading && (
                    <div>
                      <div className="flex justify-between text-xs mb-1" style={{ color: '#94A3B8' }}>
                        <span>Uploading…</span><span>{progress}%</span>
                      </div>
                      <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(91,95,255,0.1)' }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, background: '#5B5FFF' }} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid #F0F1FF' }}>
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ color: '#64748B', background: 'rgba(0,0,0,0.04)' }}>Cancel</button>
              <button onClick={handleUpload} disabled={!file || uploading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: !file ? 'rgba(91,95,255,0.3)' : '#5B5FFF', color: '#fff', opacity: uploading ? 0.8 : 1 }}>
                <Upload size={13} /> {uploading ? `Uploading ${progress}%…` : 'Upload'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Doc card ──────────────────────────────────────────────────────────────────
function DocCard({ doc, onClick }) {
  const isFile = !!doc.downloadUrl;
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

      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(91,95,255,0.08)' }}>
          {isFile
            ? <FileTypeIcon mime={doc.fileMime} size={14} />
            : (() => { const I = TYPE_ICONS[doc.type] || FileText; return <I size={14} style={{ color: '#5B5FFF' }} />; })()
          }
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(91,95,255,0.06)', color: '#5B5FFF' }}>
          {isFile ? (doc.fileMime?.split('/')[1]?.toUpperCase() || 'FILE') : doc.type}
        </span>
      </div>

      <div>
        <p className="text-sm font-bold leading-snug mb-1" style={{ color: '#0A0A1A' }}>{doc.title}</p>
        {isFile ? (
          <p className="text-xs" style={{ color: '#CBD5E1' }}>{formatBytes(doc.fileSize)}</p>
        ) : preview ? (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#94A3B8' }}>{preview}</p>
        ) : null}
      </div>

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

// ── Main view ─────────────────────────────────────────────────────────────────
export default function FilesView() {
  const { activeCompanyId } = useCompany();
  const { user } = useAuth();
  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [activeTag, setTag]     = useState('All');
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew]   = useState(false);

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
      style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>

      <div className="flex-1 overflow-y-auto px-8 py-7">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-serif text-2xl font-bold" style={{ color: '#0A0F1E' }}>Files</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
              {docs.length} document{docs.length !== 1 ? 's' : ''} · smart auto-tagged
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.08)' }}>
              <Search size={13} style={{ color: '#94A3B8' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search documents…"
                className="text-sm outline-none bg-transparent w-40"
                style={{ color: '#0A0A1A' }} />
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#5B5FFF', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#4A4EE0'}
              onMouseLeave={e => e.currentTarget.style.background = '#5B5FFF'}>
              <Plus size={14} /> New
            </button>
          </div>
        </div>

        {/* Tag filters */}
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
            <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>
              {docs.length === 0
                ? 'Upload a file or write a document — it will be auto-tagged.'
                : 'Try a different tag or clear the search.'}
            </p>
            {docs.length === 0 && (
              <button onClick={() => setShowNew(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#5B5FFF', color: '#fff' }}>
                <Plus size={14} /> Add first document
              </button>
            )}
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
        {showNew && (
          <NewDocModal
            companyId={activeCompanyId}
            userId={user?.uid}
            onClose={() => setShowNew(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
