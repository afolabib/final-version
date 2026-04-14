import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ExternalLink, CheckCircle, Eye, EyeOff,
  Search, Zap, Plus, Trash2, Save, AlertCircle,
  FileText, Home, Info, Briefcase, Phone, BookOpen,
  ChevronDown, ChevronRight, Settings, PenLine,
} from 'lucide-react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useWebsite } from '@/contexts/WebsiteContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PAGE_META = {
  home:     { icon: Home,      color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)' },
  about:    { icon: Info,      color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)' },
  services: { icon: Briefcase, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  contact:  { icon: Phone,     color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  blog:     { icon: BookOpen,  color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)' },
  other:    { icon: FileText,  color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' },
};

// Normalise section name to a stable key: "About Snapshot" → "aboutSnapshot"
function toKey(name) {
  return name
    .split(/\s+/)
    .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function SeoScoreRing({ score }) {
  if (score == null) return null;
  const color = score >= 90 ? '#7C3AED' : score >= 70 ? '#F59E0B' : '#EF4444';
  const r = 20, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="4" />
        <motion.circle
          cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute text-[13px] font-black" style={{ color }}>{score}</span>
    </div>
  );
}

// ── Section content editor ────────────────────────────────────────────────────

function SectionEditor({ name, value = {}, onChange }) {
  const [open, setOpen] = useState(false);
  const key = toKey(name);

  const update = (field, val) => onChange(key, { ...value, [field]: val });

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(91,95,255,0.1)', background: open ? 'rgba(91,95,255,0.02)' : 'white' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'rgba(91,95,255,0.03)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(91,95,255,0.1)' }}>
          <Zap size={11} style={{ color: '#5B5FFF' }} />
        </div>
        <span className="flex-1 text-[13px] font-semibold" style={{ color: '#0A0F1E' }}>{name}</span>
        {(value.heading || value.body) && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF' }}>Edited</span>
        )}
        {open ? <ChevronDown size={13} style={{ color: '#94A3B8' }} /> : <ChevronRight size={13} style={{ color: '#CBD5E1' }} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
            <div className="px-4 pb-4 space-y-3"
              style={{ borderTop: '1px solid rgba(91,95,255,0.08)' }}>

              <div className="pt-3">
                <label className="block text-[10px] font-semibold mb-1" style={{ color: '#94A3B8' }}>Heading</label>
                <input
                  value={value.heading || ''}
                  onChange={e => update('heading', e.target.value)}
                  placeholder="Section heading…"
                  className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                  style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold mb-1" style={{ color: '#94A3B8' }}>Body copy</label>
                <textarea
                  value={value.body || ''}
                  onChange={e => update('body', e.target.value)}
                  placeholder="Main paragraph text…"
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
                  style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: '#94A3B8' }}>Primary CTA</label>
                  <input
                    value={value.cta || ''}
                    onChange={e => update('cta', e.target.value)}
                    placeholder="Button text…"
                    className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                    style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: '#94A3B8' }}>Secondary CTA</label>
                  <input
                    value={value.ctaSecondary || ''}
                    onChange={e => update('ctaSecondary', e.target.value)}
                    placeholder="Button text…"
                    className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                    style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                  />
                </div>
              </div>

              {/* Extra custom fields */}
              {value.extra && Object.entries(value.extra).map(([k, v]) => (
                <div key={k}>
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: '#94A3B8' }}>{k}</label>
                  <div className="flex gap-2">
                    <input
                      value={v}
                      onChange={e => update('extra', { ...value.extra, [k]: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl text-[12px] outline-none"
                      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                    />
                    <button
                      onClick={() => {
                        const next = { ...value.extra };
                        delete next[k];
                        update('extra', next);
                      }}
                      className="px-2 py-2 rounded-xl"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'content', label: 'Content', icon: PenLine },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ── Main ──────────────────────────────────────────────────────────────────────

export default function WebsitePageEditor({ page, onClose }) {
  const { activeSite } = useWebsite();

  const [tab, setTab] = useState('content');

  // Settings state
  const [title, setTitle]         = useState(page.title || '');
  const [seoTitle, setSeoTitle]   = useState(page.seoTitle || page.title || '');
  const [seoDesc, setSeoDesc]     = useState(page.seoDesc || '');
  const [status, setStatus]       = useState(page.status || 'published');
  const [sections, setSections]   = useState(page.sections || []);
  const [newSection, setNewSection] = useState('');

  // Content state — keyed by toKey(sectionName)
  const [content, setContent]     = useState({});
  const [contentLoaded, setContentLoaded] = useState(false);

  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState(null);

  const meta = PAGE_META[page.type] || PAGE_META.other;
  const Icon = meta.icon;
  const siteUrl = activeSite?.domain ? `https://${activeSite.domain}` : '#';
  const pageUrl = `${siteUrl}${page.slug === '/' ? '' : page.slug}`;

  // Load existing content from Firestore
  useEffect(() => {
    if (!activeSite?.id) return;
    getDoc(doc(firestore, 'websites', activeSite.id, 'pages', page.id))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.content) setContent(data.content);
          if (data.seoTitle) setSeoTitle(data.seoTitle);
          if (data.seoDesc)  setSeoDesc(data.seoDesc);
          if (data.status)   setStatus(data.status);
          if (data.title)    setTitle(data.title);
          if (data.sections) setSections(data.sections);
        }
      })
      .finally(() => setContentLoaded(true));
  }, [activeSite?.id, page.id]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const updateSection = (key, val) =>
    setContent(c => ({ ...c, [key]: val }));

  const addSection = () => {
    const trimmed = newSection.trim();
    if (!trimmed) return;
    setSections(s => [...s, trimmed]);
    setNewSection('');
  };

  const handleSave = async () => {
    if (!activeSite?.id) return;
    setSaving(true);
    setError(null);
    try {
      await setDoc(
        doc(firestore, 'websites', activeSite.id, 'pages', page.id),
        {
          title,
          seoTitle,
          seoDesc,
          status,
          sections,
          slug: page.slug,
          type: page.type,
          views: page.views || 0,
          seo: page.seo || null,
          content,
          lastEdited: serverTimestamp(),
        },
        { merge: true },
      );
      setSaved(true);
    } catch (e) {
      setError('Save failed — ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 right-0 bottom-0 z-50 flex flex-col overflow-hidden"
      style={{
        width: 500,
        background: 'rgba(255,255,255,0.99)',
        backdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(91,95,255,0.1)',
        boxShadow: '-8px 0 40px rgba(91,95,255,0.08), -2px 0 12px rgba(0,0,0,0.06)',
      }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: meta.bg }}>
          <Icon size={16} strokeWidth={1.8} style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-black truncate" style={{ color: '#0A0F1E' }}>{page.title}</p>
          <p className="text-[11px] font-mono" style={{ color: '#94A3B8' }}>{page.slug}</p>
        </div>
        <a href={pageUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
          style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.08)'}>
          <ExternalLink size={11} /> View live
        </a>
        <button onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(0,0,0,0.04)', color: '#94A3B8' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}>
          <X size={15} />
        </button>
      </div>

      {/* SEO score + status strip */}
      <div className="flex items-center gap-4 px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: 'rgba(91,95,255,0.02)' }}>
        <SeoScoreRing score={page.seo} />
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>Status</p>
          <div className="flex gap-2">
            {[
              { id: 'published', label: 'Live',  icon: Eye,    color: '#5B5FFF', bg: 'rgba(91,95,255,0.08)' },
              { id: 'draft',     label: 'Draft', icon: EyeOff, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            ].map(opt => {
              const Ico = opt.icon;
              const active = status === opt.id;
              return (
                <button key={opt.id} onClick={() => setStatus(opt.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                  style={{
                    background: active ? opt.bg : 'rgba(0,0,0,0.03)',
                    color: active ? opt.color : '#94A3B8',
                    border: active ? `1px solid ${opt.color}30` : '1px solid transparent',
                  }}>
                  <Ico size={10} strokeWidth={2.2} />{opt.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px]" style={{ color: '#CBD5E1' }}>Views</p>
          <p className="text-[18px] font-black" style={{ color: '#0A0F1E' }}>
            {(page.views || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        {TABS.map(t => {
          const Ico = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-3 text-[12px] font-bold relative transition-colors"
              style={{ color: active ? '#5B5FFF' : '#94A3B8' }}>
              <Ico size={12} />{t.label}
              {active && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: '#5B5FFF' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Content tab ── */}
        {tab === 'content' && (
          <div className="px-5 py-5 space-y-3">
            <p className="text-[11px]" style={{ color: '#94A3B8' }}>
              Changes save to Firestore and are reflected on the live site in real time.
            </p>
            {sections.length === 0 && (
              <p className="text-[12px] text-center py-8" style={{ color: '#CBD5E1' }}>
                No sections — add them in the Settings tab
              </p>
            )}
            {sections.map(name => (
              <SectionEditor
                key={name}
                name={name}
                value={content[toKey(name)]}
                onChange={updateSection}
              />
            ))}
          </div>
        )}

        {/* ── Settings tab ── */}
        {tab === 'settings' && (
          <div className="px-5 py-5 space-y-6">

            {/* Page title */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
                Page title
              </label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold outline-none"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
            </div>

            {/* SEO */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Search size={12} style={{ color: '#CBD5E1' }} />
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#CBD5E1' }}>SEO metadata</span>
              </div>
              <div className="space-y-3 p-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div>
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: '#94A3B8' }}>
                    Title tag <span style={{ color: '#CBD5E1' }}>({seoTitle.length}/60)</span>
                  </label>
                  <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} maxLength={60}
                    placeholder="e.g. Home | Lauren O'Reilly"
                    className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                    style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: '#94A3B8' }}>
                    Meta description <span style={{ color: '#CBD5E1' }}>({seoDesc.length}/155)</span>
                  </label>
                  <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} maxLength={155} rows={3}
                    placeholder="Appears in Google search results…"
                    className="w-full px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
                    style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                </div>
                <div className="px-3 py-2.5 rounded-xl" style={{ background: 'white', border: '1px dashed rgba(0,0,0,0.08)' }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>Google preview</p>
                  <p className="text-[13px] font-medium leading-tight" style={{ color: '#1a0dab' }}>{seoTitle || title || 'Page title'}</p>
                  <p className="text-[11px]" style={{ color: '#006621' }}>{activeSite?.domain || 'yoursite.com'}{page.slug === '/' ? '' : page.slug}</p>
                  <p className="text-[11px] leading-snug mt-0.5" style={{ color: '#545454' }}>{seoDesc || 'Add a meta description…'}</p>
                </div>
              </div>
            </div>

            {/* Sections list */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={12} style={{ color: '#CBD5E1' }} />
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#CBD5E1' }}>Page sections</span>
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>{sections.length}</span>
              </div>
              <div className="space-y-2 mb-3">
                {sections.map((s, i) => (
                  <div key={s + i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.1)' }}>
                    <span className="flex-1 text-[12px] font-semibold" style={{ color: '#374151' }}>{s}</span>
                    <button onClick={() => setSections(ss => ss.filter((_, j) => j !== i))}
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                      <X size={9} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newSection} onChange={e => setNewSection(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSection()}
                  placeholder="Add section…"
                  className="flex-1 px-3 py-2 rounded-xl text-[12px] outline-none"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                <button onClick={addSection}
                  className="px-3 py-2 rounded-xl text-[12px] font-bold"
                  style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF' }}>
                  <Plus size={13} />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.98)' }}>
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-[12px] font-bold" style={{ color: '#5B5FFF' }}>
              <CheckCircle size={14} /> Saved to Firestore
            </motion.div>
          ) : error ? (
            <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-[11px]" style={{ color: '#EF4444' }}>
              <AlertCircle size={13} /> {error}
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className="flex-1" />
        <button onClick={onClose}
          className="px-4 py-2 rounded-full text-[12px] font-semibold transition-all"
          style={{ background: 'rgba(0,0,0,0.04)', color: '#64748B' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-bold text-white transition-all"
          style={{
            background: saving ? 'rgba(91,95,255,0.5)' : 'linear-gradient(135deg, #5B5FFF, #7C3AED)',
            boxShadow: saving ? 'none' : '0 4px 14px rgba(91,95,255,0.35)',
          }}>
          <Save size={12} />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </motion.div>
  );
}
