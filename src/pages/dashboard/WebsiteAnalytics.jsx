import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Eye, Star, Clock, TrendingUp, TrendingDown,
  Globe, Search, Zap, ArrowUpRight, Loader2,
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useWebsite } from '@/contexts/WebsiteContext';
import {
  MOCK_SITES, MOCK_STATS_BY_SITE, MOCK_TRAFFIC_BY_SITE,
  MOCK_LEADS_BY_SITE, MOCK_PAGES_BY_SITE,
} from '@/components/dashboard/website/mockWebsite';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtSec(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function startOf(range) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (range === '7d')  d.setDate(d.getDate() - 6);
  if (range === '30d') d.setDate(d.getDate() - 29);
  if (range === '90d') d.setDate(d.getDate() - 89);
  return d;
}

function dayLabel(date) {
  return date.toLocaleDateString('en-AU', { weekday: 'short' }).slice(0, 3);
}

function buildDailyBuckets(range) {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: d, label: range === '7d' ? dayLabel(d) : `${d.getDate()}/${d.getMonth() + 1}`, visitors: 0 };
  });
}

function aggregate(docs, range) {
  const buckets = buildDailyBuckets(range);
  const sessionsByBucket = buckets.map(() => new Set());

  docs.forEach(d => {
    const ts = d.timestamp?.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
    const dayStr = ts.toDateString();
    const idx = buckets.findIndex(b => b.date.toDateString() === dayStr);
    if (idx >= 0) sessionsByBucket[idx].add(d.sessionId || '?');
  });

  const traffic = buckets.map((b, i) => ({ day: b.label, visitors: sessionsByBucket[i].size }));

  const uniqueSessions = new Set(docs.map(d => d.sessionId)).size;
  const pageViews      = docs.length;

  // Top paths
  const pathCounts = {};
  docs.forEach(d => { pathCounts[d.path] = (pathCounts[d.path] || 0) + 1; });
  const topPages = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, views]) => ({ id: path, title: path === '/' ? 'Home' : path.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug: path, views }));

  // Referrers
  const refCounts = {};
  docs.forEach(d => {
    const r = d.referrer || 'Direct';
    refCounts[r] = (refCounts[r] || 0) + 1;
  });
  const totalRefs = docs.length || 1;
  const sources = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count], i) => ({
      label: label === '' ? 'Direct' : label,
      pct: Math.round((count / totalRefs) * 100),
      color: ['#5B5FFF', '#0EA5E9', '#8B5CF6', '#F59E0B'][i] || '#CBD5E1',
    }));

  return { traffic, uniqueSessions, pageViews, topPages, sources };
}

// ── Bar chart ─────────────────────────────────────────────────────────────────

function BarChart({ data, color = '#5B5FFF' }) {
  const max = Math.max(...data.map(d => d.visitors), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => {
        const pct = (d.visitors / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
              style={{ background: color, boxShadow: `0 4px 12px ${color}50` }}>
              {d.visitors}
            </div>
            <div className="w-full rounded-t-md transition-all duration-300"
              style={{ height: `${Math.max(pct, 4)}%`, background: `linear-gradient(to top, ${color}, ${color}99)`, opacity: 0.85 }} />
            {data.length <= 14 && (
              <span className="text-[9px] font-semibold" style={{ color: '#CBD5E1' }}>{d.day}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, delta, color = '#5B5FFF', delay = 0 }) {
  const positive = delta > 0;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-2xl p-5"
      style={{ background: 'white', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon size={16} strokeWidth={1.8} style={{ color }} />
        </div>
        {delta !== undefined && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)', color: positive ? '#10B981' : '#EF4444' }}>
            {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-black mb-0.5" style={{ color: '#0A0F1E' }}>{value}</p>
      <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>{label}</p>
    </motion.div>
  );
}

// ── Source row ────────────────────────────────────────────────────────────────

function SourceRow({ label, pct, color, delay }) {
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
      className="flex items-center gap-3">
      <span className="text-[12px] font-medium w-28 flex-shrink-0 truncate" style={{ color: '#374151' }}>{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
      <span className="text-[11px] font-bold w-8 text-right" style={{ color: '#94A3B8' }}>{pct}%</span>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DashboardWebsiteAnalytics() {
  const { sites, activeSite } = useWebsite();
  const [range, setRange]     = useState('7d');
  const [docs,  setDocs]      = useState(null); // null = loading, [] = no real data yet
  const [fetching, setFetching] = useState(true);

  const displaySite = (sites.length > 0 ? activeSite : null) || MOCK_SITES[0];
  const siteId      = displaySite?.domain || displaySite?.id;

  // Fetch real pageviews from Firestore
  useEffect(() => {
    if (!siteId) return;
    setFetching(true);
    const start = Timestamp.fromDate(startOf(range));
    const q = query(
      collection(firestore, 'pageviews'),
      where('siteId', '==', siteId),
      where('timestamp', '>=', start),
      orderBy('timestamp', 'asc'),
    );
    getDocs(q).then(snap => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setFetching(false);
    }).catch(() => {
      setDocs([]);
      setFetching(false);
    });
  }, [siteId, range]);

  // Decide whether to show real or mock data
  const usingReal  = docs !== null && docs.length > 0;
  const mockSiteId = displaySite?.id;
  const mockStats  = MOCK_STATS_BY_SITE[mockSiteId] || Object.values(MOCK_STATS_BY_SITE)[0];
  const mockPages  = MOCK_PAGES_BY_SITE[mockSiteId] || [];
  const mockLeads  = MOCK_LEADS_BY_SITE[mockSiteId] || [];

  const real = useMemo(() => docs && docs.length > 0 ? aggregate(docs, range) : null, [docs, range]);

  const traffic   = usingReal ? real.traffic   : (MOCK_TRAFFIC_BY_SITE[mockSiteId] || Object.values(MOCK_TRAFFIC_BY_SITE)[0]);
  const topPages  = usingReal ? real.topPages  : mockPages;
  const sources   = usingReal ? real.sources   : [
    { label: 'Direct', pct: 38, color: '#5B5FFF' }, { label: 'Google Search', pct: 29, color: '#0EA5E9' },
    { label: 'Social media', pct: 19, color: '#8B5CF6' }, { label: 'Referral', pct: 14, color: '#F59E0B' },
  ];

  const visitors  = usingReal ? real.uniqueSessions : mockStats.visitorsMonth;
  const pageViews = usingReal ? real.pageViews       : mockStats.pageViewsMonth;
  const totalWeek = traffic.reduce((s, d) => s + d.visitors, 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-7 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black" style={{ color: '#0A0F1E' }}>Analytics</h1>
              {!usingReal && !fetching && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                  Sample data — visits will appear once the site is live
                </span>
              )}
              {usingReal && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                  Live data
                </span>
              )}
            </div>
            <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>{displaySite?.domain}</p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(91,95,255,0.08)' }}>
            {['7d', '30d', '90d'].map(r => (
              <button key={r} onClick={() => setRange(r)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: range === r ? 'white' : 'transparent', color: range === r ? '#0A0F1E' : '#94A3B8', boxShadow: range === r ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {fetching ? (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin" style={{ color: '#5B5FFF' }} />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard icon={Users}  label={`Visitors (${range})`}   value={visitors.toLocaleString()}   delta={usingReal ? undefined : mockStats.visitorsMonthDelta} color="#5B5FFF" delay={0} />
              <StatCard icon={Eye}    label={`Page views (${range})`}  value={pageViews.toLocaleString()}  color="#0EA5E9" delay={0.04} />
              <StatCard icon={Star}   label="Leads captured"           value={mockStats.leadsMonth}        delta={usingReal ? undefined : mockStats.leadsDelta} color="#10B981" delay={0.08} />
              <StatCard icon={Clock}  label="Avg session"              value={fmtSec(mockStats.avgSessionSec)} color="#F59E0B" delay={0.12} />
            </div>

            {/* Chart + performance */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                className="col-span-2 rounded-2xl p-5"
                style={{ background: 'white', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-black" style={{ color: '#0A0F1E' }}>Visitors — {range}</p>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(91,95,255,0.08)' }}>
                    <TrendingUp size={11} style={{ color: '#5B5FFF' }} />
                    <span className="text-[10px] font-bold" style={{ color: '#5B5FFF' }}>{totalWeek} total</span>
                  </div>
                </div>
                <BarChart data={traffic} color="#5B5FFF" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl p-5 space-y-4"
                style={{ background: 'white', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <p className="text-sm font-black" style={{ color: '#0A0F1E' }}>Performance</p>
                {[
                  { label: 'PageSpeed', value: mockStats.pagespeed, suffix: '/100', icon: Zap,    color: '#F59E0B' },
                  { label: 'SEO Score', value: mockStats.seoScore,  suffix: '/100', icon: Search, color: '#5B5FFF' },
                  { label: 'Uptime',    value: mockStats.uptime,    suffix: '%',    icon: Globe,  color: '#10B981' },
                ].map(({ label, value, suffix, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}12` }}>
                      <Icon size={14} strokeWidth={1.8} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold mb-1" style={{ color: '#94A3B8' }}>{label}</p>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
                          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full" style={{ background: color }} />
                      </div>
                    </div>
                    <span className="text-xs font-black flex-shrink-0" style={{ color: '#0A0F1E' }}>{value}{suffix}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Sources + top pages */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
                className="rounded-2xl p-5"
                style={{ background: 'white', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <p className="text-sm font-black mb-4" style={{ color: '#0A0F1E' }}>Traffic sources</p>
                <div className="space-y-3">
                  {sources.map((s, i) => <SourceRow key={s.label} {...s} delay={0.28 + i * 0.04} />)}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                className="rounded-2xl p-5"
                style={{ background: 'white', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <p className="text-sm font-black mb-4" style={{ color: '#0A0F1E' }}>Top pages</p>
                <div className="space-y-2">
                  {topPages.slice(0, 5).map((page, i) => (
                    <div key={page.id} className="flex items-center gap-3">
                      <span className="text-[11px] font-black w-4 flex-shrink-0 text-right" style={{ color: '#CBD5E1' }}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold truncate" style={{ color: '#374151' }}>{page.title}</p>
                        <p className="text-[10px] truncate" style={{ color: '#CBD5E1' }}>{page.slug}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold flex-shrink-0" style={{ color: '#94A3B8' }}>
                        <Eye size={10} />{(page.views || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent leads */}
            {mockLeads.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
                className="rounded-2xl p-5"
                style={{ background: 'white', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-black" style={{ color: '#0A0F1E' }}>Recent leads</p>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.08)' }}>
                    <ArrowUpRight size={11} style={{ color: '#10B981' }} />
                    <span className="text-[10px] font-bold" style={{ color: '#10B981' }}>+{mockStats.leadsDelta}% vs last month</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {mockLeads.map((lead, i) => {
                    const colors = ['#5B5FFF', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6'];
                    const c = colors[i % colors.length];
                    const hoursAgo = Math.floor((Date.now() - lead.time) / 3600000);
                    return (
                      <div key={lead.id} className="flex items-center gap-3 py-2 rounded-xl px-3 -mx-3 transition-colors"
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${c}, ${c}aa)` }}>
                          {lead.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold truncate" style={{ color: '#0A0F1E' }}>{lead.name}</p>
                          <p className="text-[11px] truncate" style={{ color: '#94A3B8' }}>{lead.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] font-semibold" style={{ color: '#CBD5E1' }}>via {lead.page}</p>
                          <p className="text-[10px]" style={{ color: '#E2E8F0' }}>
                            {hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
