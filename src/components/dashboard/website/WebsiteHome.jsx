import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, ExternalLink, Settings, Copy, Check,
  TrendingUp, Users, Star, Zap, ArrowUpRight,
  FileText, Search, Gauge, Clock, Mail, X, Send,
  CheckCircle, PenSquare, Rss, BarChart2, Edit3, Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWebsite } from '@/contexts/WebsiteContext';
import {
  MOCK_SITES, MOCK_STATS_BY_SITE, MOCK_TRAFFIC_BY_SITE,
  MOCK_LEADS_BY_SITE, MOCK_UPDATES_BY_SITE, MOCK_PAGES_BY_SITE,
} from './mockWebsite';
import WebsiteVisualEditor from './WebsiteVisualEditor';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDate(d) {
  if (!d) return null;
  if (d?.toDate) return d.toDate();     // Firestore Timestamp
  if (d instanceof Date) return d;
  const parsed = new Date(d);
  return isNaN(parsed) ? null : parsed;
}

function timeAgo(d) {
  const date = toDate(d);
  if (!date) return '';
  const m = Math.floor((Date.now() - date) / 60000);
  if (m < 60)   return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  const days = Math.floor(m / 1440);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

const UPDATE_META = {
  update:  { icon: PenSquare,   color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)' },
  publish: { icon: Rss,         color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)' },
  seo:     { icon: Search,      color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  speed:   { icon: Zap,         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  launch:  { icon: Globe,       color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)' },
};

// ── Browser mockup ────────────────────────────────────────────────────────────

function BrowserMockup({ site }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.08)' }}>
      {/* Chrome bar */}
      <div className="flex items-center gap-2.5 px-3 py-2.5"
        style={{ background: '#F1F5F9', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px]"
          style={{ background: 'white', color: '#64748B', border: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'rgba(91,95,255,0.6)' }} />
          {site.domain}
        </div>
        <ExternalLink size={10} style={{ color: '#94A3B8' }} />
      </div>

      {/* Live site screenshot */}
      <div className="relative overflow-hidden" style={{ height: 180, background: '#F8FAFC' }}>
        <img
          src={`https://api.microlink.io?url=https%3A%2F%2F${site.domain}&screenshot=true&meta=false&embed=screenshot.url`}
          alt={`${site.name} preview`}
          className="w-full h-full object-cover object-top"
          style={{ display: 'block' }}
          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
        />
        {/* Fallback if screenshot fails */}
        <div className="absolute inset-0 items-center justify-center" style={{ display: 'none', background: '#F1F5F9' }}>
          <Globe size={28} strokeWidth={1.3} style={{ color: '#CBD5E1' }} />
        </div>
        {/* Live badge overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full"
          style={{ background: 'rgba(91,95,255,0.9)', backdropFilter: 'blur(8px)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[9px] font-black text-white">LIVE</span>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function Stat({ label, value, delta, icon: Icon, color, delay, suffix = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}>
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={16} strokeWidth={2} style={{ color }} />
        </div>
        {delta != null && (
          <span className="flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
            <ArrowUpRight size={9} strokeWidth={3} />+{delta}%
          </span>
        )}
      </div>
      <div>
        <div className="text-[26px] font-black leading-none mb-1" style={{ color: '#0A0F1E', letterSpacing: '-0.03em' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        <div className="text-xs font-semibold" style={{ color: '#64748B' }}>{label}</div>
      </div>
    </motion.div>
  );
}

// ── Traffic chart ─────────────────────────────────────────────────────────────

function TrafficChart({ data }) {
  const max = Math.max(...data.map(d => d.visitors));
  return (
    <div>
      <div className="flex items-end justify-between gap-1.5 h-24 mb-2">
        {data.map((d, i) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.visitors / max) * 100}%` }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full rounded-t-lg"
              style={{
                background: i === data.length - 1
                  ? 'linear-gradient(180deg, #5B5FFF, #7C3AED)'
                  : 'rgba(91,95,255,0.15)',
                minHeight: 4,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {data.map(d => (
          <span key={d.day} className="flex-1 text-center text-[9px] font-semibold" style={{ color: '#CBD5E1' }}>{d.day}</span>
        ))}
      </div>
    </div>
  );
}

// ── Top pages ─────────────────────────────────────────────────────────────────

function TopPages({ pages, navigate }) {
  const sorted = [...pages].filter(p => p.views > 0).sort((a, b) => b.views - a.views).slice(0, 4);
  const maxViews = sorted[0]?.views || 1;
  return (
    <div className="space-y-3">
      {sorted.map((p, i) => (
        <div key={p.id} className="flex items-center gap-3">
          <span className="text-[10px] font-black w-3 flex-shrink-0" style={{ color: '#CBD5E1' }}>{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold truncate" style={{ color: '#374151' }}>{p.title}</span>
              <span className="text-[11px] font-bold ml-2 flex-shrink-0" style={{ color: '#0A0F1E' }}>{p.views.toLocaleString()}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(p.views / maxViews) * 100}%` }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #5B5FFF, #7C3AED)' }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Lead card ─────────────────────────────────────────────────────────────────

function LeadCard({ lead, index }) {
  const initial = lead.name[0].toUpperCase();
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.06 }}
      className="flex items-start gap-3 py-3.5"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-bold leading-tight" style={{ color: '#0A0F1E' }}>{lead.name}</p>
            <p className="text-[11px]" style={{ color: '#94A3B8' }}>{lead.email}</p>
          </div>
          <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: '#CBD5E1' }}>{timeAgo(lead.time)}</span>
        </div>
        <p className="text-xs mt-1 line-clamp-1 italic" style={{ color: '#94A3B8' }}>"{lead.message}"</p>
        <span className="inline-block mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
          via {lead.page}
        </span>
      </div>
    </motion.div>
  );
}

// ── Updates timeline ──────────────────────────────────────────────────────────

function UpdateRow({ item, index }) {
  const meta = UPDATE_META[item.type] || UPDATE_META.update;
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06 }}
      className="flex items-start gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: meta.bg }}>
        <Icon size={12} strokeWidth={2} style={{ color: meta.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold leading-snug" style={{ color: '#0A0F1E' }}>{item.title}</p>
        <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{item.desc}</p>
      </div>
      <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: '#CBD5E1' }}>{timeAgo(item.time)}</span>
    </motion.div>
  );
}

// ── Request changes modal ─────────────────────────────────────────────────────

function RequestModal({ site, onClose }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handle = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      const { firestore } = await import('@/lib/firebaseClient');
      await addDoc(collection(firestore, 'site_requests'), {
        siteId: site.id,
        siteDomain: site.domain,
        siteName: site.name,
        request: text.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSent(true);
      setTimeout(onClose, 1800);
    } catch {
      setSending(false);
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
        transition={{ duration: 0.18 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ maxWidth: 480, background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.16)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #F0F1FF' }}>
          <div>
            <h3 className="text-base font-black" style={{ color: '#0A0F1E' }}>Request a change</h3>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{site.domain}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {sent ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(91,95,255,0.1)' }}>
                <Check size={22} style={{ color: '#7C3AED' }} />
              </div>
              <p className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Request sent!</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>We'll get back to you shortly.</p>
            </div>
          ) : (
            <>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Describe what you'd like changed — e.g. update the hero headline, add a new section, change the contact form..."
                rows={5}
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4"
                style={{ border: '1.5px solid rgba(91,95,255,0.15)', background: 'rgba(91,95,255,0.02)', color: '#1F2937', lineHeight: 1.6 }}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handle(); }}
              />
              <button
                onClick={handle}
                disabled={!text.trim() || sending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}>
                {sending ? <Loader2 size={15} className="animate-spin" /> : <><Send size={14} /> Send request</>}
              </button>
              <p className="text-[10px] text-center mt-2" style={{ color: '#CBD5E1' }}>⌘ + Enter to send</p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function WebsiteHome() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { activeSite, pages: livePages } = useWebsite();

  // Use real site or fall back to first mock
  const siteId = activeSite?.id || MOCK_SITES[0].id;
  const site   = activeSite || MOCK_SITES[0];
  const stats  = MOCK_STATS_BY_SITE[siteId]   || MOCK_STATS_BY_SITE[MOCK_SITES[0].id];
  const traffic = MOCK_TRAFFIC_BY_SITE[siteId] || MOCK_TRAFFIC_BY_SITE[MOCK_SITES[0].id];
  const leads   = MOCK_LEADS_BY_SITE[siteId]   || MOCK_LEADS_BY_SITE[MOCK_SITES[0].id];
  const updates = MOCK_UPDATES_BY_SITE[siteId] || MOCK_UPDATES_BY_SITE[MOCK_SITES[0].id];
  const pages   = MOCK_PAGES_BY_SITE[siteId]   || MOCK_PAGES_BY_SITE[MOCK_SITES[0].id];

  const copyDomain = () => {
    navigator.clipboard.writeText(site.domain);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-7 space-y-6">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Site info — 3/5 */}
          <div className="lg:col-span-3 rounded-2xl p-6 flex flex-col justify-between gap-5"
            style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.1)', boxShadow: '0 4px 24px rgba(91,95,255,0.06)' }}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 14px rgba(91,95,255,0.3)' }}>
                  <Globe size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>{site.name}</h1>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF' }}>LIVE</span>
                  </div>
                  <button onClick={copyDomain}
                    className="flex items-center gap-1.5 text-[12px] font-medium mt-0.5 transition-all"
                    style={{ color: '#64748B' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#5B5FFF'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748B'}>
                    {site.domain}
                    {copied ? <Check size={10} style={{ color: '#5B5FFF' }} /> : <Copy size={10} />}
                  </button>
                </div>
              </div>

              {/* Health metrics inline */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'PageSpeed',   value: `${site.pagespeed}/100`, icon: Zap,    color: '#F59E0B' },
                  { label: 'SEO score',   value: `${site.seoScore}/100`,  icon: Search, color: '#7C3AED' },
                  { label: 'Uptime',      value: `${stats.uptime}%`,      icon: Gauge,  color: '#5B5FFF' },
                ].map(m => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className="rounded-xl p-3"
                      style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={10} strokeWidth={2} style={{ color: m.color }} />
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>{m.label}</span>
                      </div>
                      <p className="text-sm font-black" style={{ color: '#0A0F1E' }}>{m.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Traffic chart */}
              <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: '#94A3B8' }}>7-day visitors</p>
              <TrafficChart data={traffic} />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all text-white"
                style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 3px 12px rgba(91,95,255,0.3)' }}>
                <ExternalLink size={11} /> View live site
              </a>
              <button
                onClick={() => {
                  const homePage = livePages.find(p => p.slug === '/') ||
                    MOCK_PAGES_BY_SITE[siteId]?.find(p => p.slug === '/') ||
                    MOCK_PAGES_BY_SITE[MOCK_SITES[0].id][0];
                  setEditingPage(homePage);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all text-white"
                style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 3px 12px rgba(91,95,255,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,95,255,0.45)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 3px 12px rgba(91,95,255,0.3)'}>
                <Edit3 size={11} /> Edit site
              </button>
              <button onClick={() => navigate('/dashboard/website-pages')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all"
                style={{ background: 'rgba(91,95,255,0.07)', color: '#5B5FFF', border: '1px solid rgba(91,95,255,0.15)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.13)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.07)'}>
                <FileText size={11} /> Manage pages
              </button>
              <button onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all"
                style={{ background: 'rgba(0,0,0,0.03)', color: '#64748B', border: '1px solid rgba(0,0,0,0.07)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}>
                <PenSquare size={11} /> Request changes
              </button>
            </div>
          </div>

          {/* Browser mockup — 2/5 */}
          <div className="lg:col-span-2">
            <BrowserMockup site={site} />
            {/* Published info below mockup */}
            <div className="mt-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Clock size={11} style={{ color: '#CBD5E1' }} />
                <span className="text-[11px]" style={{ color: '#94A3B8' }}>
                  Published {timeAgo(site.publishedAt)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText size={11} style={{ color: '#CBD5E1' }} />
                <span className="text-[11px]" style={{ color: '#94A3B8' }}>{site.pageCount} pages</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Visitors this month" value={stats.visitorsMonth}   delta={stats.visitorsMonthDelta} icon={Users}      color="#5B5FFF" delay={0.07} />
          <Stat label="Page views"           value={stats.pageViewsMonth} icon={BarChart2}                                  color="#5B5FFF" delay={0.12} />
          <Stat label="Leads captured"       value={stats.leadsMonth}     delta={stats.leadsDelta}         icon={Star}       color="#F59E0B" delay={0.17} />
          <Stat label="Avg session"          value={`${Math.floor(stats.avgSessionSec / 60)}m ${stats.avgSessionSec % 60}s`} icon={Clock} color="#7C3AED" delay={0.22} />
        </div>

        {/* ── Bottom grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Top pages — 2/5 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="lg:col-span-2 rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Top pages</h3>
              <button onClick={() => navigate('/dashboard/website-pages')}
                className="text-[11px] font-bold" style={{ color: '#5B5FFF' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                View all
              </button>
            </div>
            <TopPages pages={pages} navigate={navigate} />
          </motion.div>

          {/* Recent leads — 3/5 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="lg:col-span-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Recent leads</h3>
                <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                  {stats.leadsMonth} captured this month · +{stats.leadsDelta}% vs last
                </p>
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(91,95,255,0.1)' }}>
                <Mail size={12} strokeWidth={2} style={{ color: '#5B5FFF' }} />
              </div>
            </div>
            <div className="px-5 pb-2">
              {leads.map((lead, i) => <LeadCard key={lead.id} lead={lead} index={i} />)}
            </div>
          </motion.div>
        </div>

        {/* ── Updates from Freemi ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}>
          <div className="flex items-center justify-between px-5 pt-5 pb-4"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <div>
              <h3 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Updates from Freemi</h3>
              <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>Everything we've done on your site</p>
            </div>
            <button onClick={() => navigate('/dashboard/website-settings')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
              style={{ background: 'rgba(91,95,255,0.07)', color: '#5B5FFF', border: '1px solid rgba(91,95,255,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.13)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.07)'}>
              <PenSquare size={10} /> Request a change
            </button>
          </div>
          <div className="px-5 pb-2">
            {updates.map((item, i) => <UpdateRow key={item.id} item={item} index={i} />)}
          </div>
        </motion.div>

      </div>
    </div>

    <AnimatePresence>
      {editingPage && (
        <WebsiteVisualEditor
          page={editingPage}
          onClose={() => setEditingPage(null)}
        />
      )}
      {showRequestModal && (
        <RequestModal site={site} onClose={() => setShowRequestModal(false)} />
      )}
    </AnimatePresence>
    </>
  );
}
