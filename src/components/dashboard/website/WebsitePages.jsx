import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Home, Info, Briefcase, Phone, BookOpen,
  ExternalLink, Eye, Clock, Search, Plus, Edit3,
  CheckCircle, AlertCircle, ChevronRight, ArrowUpRight,
  LayoutGrid, List,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWebsite } from '@/contexts/WebsiteContext';
import { MOCK_PAGES_BY_SITE, MOCK_SITES } from './mockWebsite';
import WebsiteVisualEditor from './WebsiteVisualEditor';

function coerceTimestamp(val) {
  if (!val) return null;
  if (val?.toDate) return val.toDate();
  return new Date(val);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(d) {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 60)   return `${Math.floor(m) || 1}h ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  const days = Math.floor(m / 1440);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

const PAGE_META = {
  home:     { icon: Home,      color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)',  label: 'Home' },
  about:    { icon: Info,      color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)',  label: 'About' },
  services: { icon: Briefcase, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Services' },
  contact:  { icon: Phone,     color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', label: 'Contact' },
  blog:     { icon: BookOpen,  color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)', label: 'Blog' },
  other:    { icon: FileText,  color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', label: 'Page' },
};

function SeoBar({ score }) {
  if (score == null) return <span className="text-[11px]" style={{ color: '#CBD5E1' }}>—</span>;
  const color = score >= 90 ? '#7C3AED' : score >= 70 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-[11px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

// ── List row ──────────────────────────────────────────────────────────────────

function PageRow({ page, index, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const meta = PAGE_META[page.type] || PAGE_META.other;
  const Icon = meta.icon;
  const isLive = page.status === 'published';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="grid items-center gap-4 px-5 py-4 transition-all duration-150"
      style={{
        gridTemplateColumns: '2fr 1fr 80px 80px 100px 80px',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
        background: hovered ? 'rgba(91,95,255,0.025)' : 'transparent',
      }}>

      {/* Page identity */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: meta.bg }}>
          <Icon size={14} strokeWidth={1.8} style={{ color: meta.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold leading-tight truncate" style={{ color: '#0A0F1E' }}>{page.title}</p>
          <p className="text-[11px] font-mono truncate" style={{ color: '#94A3B8' }}>{page.slug}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-wrap gap-1">
        {(page.sections || []).slice(0, 2).map(s => (
          <span key={s} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: 'rgba(0,0,0,0.04)', color: '#94A3B8' }}>
            {s}
          </span>
        ))}
        {(page.sections || []).length > 2 && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.04)', color: '#CBD5E1' }}>
            +{(page.sections || []).length - 2}
          </span>
        )}
      </div>

      {/* Views */}
      <div className="flex items-center gap-1.5">
        <Eye size={11} style={{ color: '#CBD5E1' }} />
        <span className="text-[12px] font-semibold" style={{ color: '#374151' }}>
          {page.views > 0 ? page.views.toLocaleString() : '—'}
        </span>
      </div>

      {/* SEO */}
      <SeoBar score={page.seo} />

      {/* Status */}
      <div>
        {isLive ? (
          <span className="flex items-center gap-1.5 text-[11px] font-bold"
            style={{ color: '#5B5FFF' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Live
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] font-bold"
            style={{ color: '#F59E0B' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Draft
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 justify-end">
        <button
          onClick={() => onEdit(page)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
          style={{
            background: hovered ? 'rgba(91,95,255,0.12)' : 'rgba(91,95,255,0.05)',
            color: hovered ? '#5B5FFF' : '#A7F3D0',
          }}>
          <Edit3 size={10} /> Edit
        </button>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function WebsitePages() {
  const navigate = useNavigate();
  const { activeSite, pages: livePages, pagesLoading } = useWebsite();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingPage, setEditingPage] = useState(null);

  const siteId = activeSite?.id || MOCK_SITES[0].id;
  const site   = activeSite     || MOCK_SITES[0];

  // Use live Firestore pages when available, otherwise fall back to mock
  const fallbackPages = MOCK_PAGES_BY_SITE[siteId] || MOCK_PAGES_BY_SITE[MOCK_SITES[0].id];
  const MOCK_PAGES = livePages.length > 0 ? livePages : fallbackPages;

  const filtered = MOCK_PAGES.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'live'  && p.status !== 'published') return false;
    if (filter === 'draft' && p.status !== 'draft')     return false;
    return true;
  });

  const liveCount  = MOCK_PAGES.filter(p => p.status === 'published').length;
  const draftCount = MOCK_PAGES.filter(p => p.status === 'draft').length;
  const totalViews = MOCK_PAGES.reduce((s, p) => s + p.views, 0);

  return (
    <>
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-7">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Pages</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[12px]" style={{ color: '#94A3B8' }}>
                <span className="font-bold" style={{ color: '#5B5FFF' }}>{liveCount} live</span>
                {' · '}
                <span className="font-bold" style={{ color: '#F59E0B' }}>{draftCount} draft</span>
                {' · '}
                {totalViews.toLocaleString()} total views
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/website-settings')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 14px rgba(91,95,255,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(91,95,255,0.45)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(91,95,255,0.3)'}>
            <Plus size={14} /> Request new page
          </button>
        </div>

        {/* Domain chip */}
        <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl w-fit"
          style={{ background: 'rgba(91,95,255,0.05)', border: '1px solid rgba(91,95,255,0.12)' }}>
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[12px] font-bold" style={{ color: '#5B5FFF' }}>{site.domain}</span>
          <span className="text-[11px]" style={{ color: '#94A3B8' }}>· {MOCK_PAGES.length} pages</span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-0">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search pages…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-xl text-[13px] outline-none"
              style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.12)', color: '#0A0F1E' }}
              onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(91,95,255,0.12)'}
            />
          </div>
          <div className="flex gap-1.5">
            {[{ id: 'all', label: 'All' }, { id: 'live', label: 'Live' }, { id: 'draft', label: 'Draft' }].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className="px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: filter === f.id ? '#5B5FFF' : 'rgba(91,95,255,0.06)',
                  color: filter === f.id ? 'white' : '#94A3B8',
                }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.08)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}>

          {/* Table header */}
          <div className="grid px-5 py-3"
            style={{
              gridTemplateColumns: '2fr 1fr 80px 80px 100px 80px',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              background: 'rgba(0,0,0,0.015)',
            }}>
            {['Page', 'Sections', 'Views', 'SEO', 'Status', 'Updated'].map(h => (
              <span key={h} className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: '#CBD5E1' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(91,95,255,0.06)' }}>
                <FileText size={20} strokeWidth={1.5} style={{ color: '#A7F3D0' }} />
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: '#CBD5E1' }}>No pages found</p>
            </div>
          ) : (
            filtered.map((page, i) => <PageRow key={page.id} page={page} index={i} onEdit={setEditingPage} />)
          )}
        </div>

        {/* Freemi note */}
        <div className="mt-5 flex items-start gap-3 px-4 py-3.5 rounded-xl"
          style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.1)' }}>
          <CheckCircle size={14} strokeWidth={2} className="flex-shrink-0 mt-0.5" style={{ color: '#5B5FFF' }} />
          <div>
            <p className="text-[12px] font-bold" style={{ color: '#5B5FFF' }}>All pages built and managed by Freemi</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
              Need to add a page, update content, or change something? Use "Request new page" or message us directly — we'll handle it.
            </p>
          </div>
        </div>

      </div>
    </div>

    {/* Full-screen visual editor */}
    <AnimatePresence>
      {editingPage && (
        <WebsiteVisualEditor
          page={editingPage}
          onClose={() => setEditingPage(null)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
