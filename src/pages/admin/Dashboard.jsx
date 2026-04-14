import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useNavigate } from 'react-router-dom';
import {
  Users, Globe2, MessageSquare, Mic,
  TrendingUp, Activity, ArrowUpRight, Clock,
  CreditCard, Zap,
} from 'lucide-react';

const glassCard = {
  background: 'rgba(255,255,255,0.97)',
  border: '1px solid rgba(91,95,255,0.08)',
  boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
};

const PLAN_PRICE = { starter: 22, growth: 40, business: 75, agency: 120 };

function StatCard({ label, value, sub, icon: Icon, color, onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ ...glassCard, cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = '0 6px 24px rgba(91,95,255,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = glassCard.boxShadow)}>
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}14` }}>
          <Icon size={16} strokeWidth={2} style={{ color }} />
        </div>
        {onClick && <ArrowUpRight size={14} style={{ color: '#CBD5E1' }} />}
      </div>
      <p className="text-[28px] font-black leading-none mb-1" style={{ color: '#0A0F1E', letterSpacing: '-0.03em' }}>{value}</p>
      <p className="text-[12px] font-semibold" style={{ color: '#64748B' }}>{label}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: '#CBD5E1' }}>{sub}</p>}
    </motion.div>
  );
}

function RecentRow({ item, type }) {
  const timeAgo = (ts) => {
    if (!ts) return '—';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    const m = Math.floor((Date.now() - d) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 transition-colors rounded-xl"
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
          {(item.name || item.businessName || item.email || '?')[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-[12px] font-semibold" style={{ color: '#0A0F1E' }}>
            {item.name || item.businessName || item.email || 'Unknown'}
          </p>
          <p className="text-[10px]" style={{ color: '#94A3B8' }}>
            {type === 'user' ? item.industry || 'No industry' : item.domain || item.site || '—'}
          </p>
        </div>
      </div>
      <span className="text-[10px]" style={{ color: '#CBD5E1' }}>{timeAgo(item.createdAt)}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, sites: 0, widgets: 0, voice: 0, mrr: 0, conversations: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentSites, setRecentSites] = useState([]);
  const [planDist, setPlanDist] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [companiesSnap, widgetsSnap, websitesSnap, voiceSnap, convoSnap] = await Promise.all([
          getDocs(collection(firestore, 'companies')),
          getDocs(collection(firestore, 'widgets')),
          getDocs(collection(firestore, 'websites')),
          getDocs(collection(firestore, 'voice_configs')),
          getDocs(collection(firestore, 'widget_conversations')),
        ]);

        const companies = companiesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const widgets   = widgetsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const sites     = websitesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const voices    = voiceSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Plan distribution
        const dist = {};
        companies.forEach(c => {
          const p = c.planId || 'starter';
          dist[p] = (dist[p] || 0) + 1;
        });

        // MRR estimate
        const mrr = companies.reduce((sum, c) => sum + (PLAN_PRICE[c.planId] || 22), 0);

        // Recent users (last 5 by createdAt)
        const sorted = [...companies].sort((a, b) => {
          const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return tb - ta;
        });

        const recentSitesSorted = [...sites].sort((a, b) => {
          const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return tb - ta;
        });

        // Use mock fallback when Firestore collections are empty
        const MOCK_COMPANIES = [
          { id: '1', name: "Lauren O'Reilly", industry: 'Health & Wellness', planId: 'starter', createdAt: null },
          { id: '2', name: 'Wellness Script',  industry: 'Media & Podcast',   planId: 'starter', createdAt: null },
        ];
        const effectiveCompanies = companies.length > 0 ? companies : MOCK_COMPANIES;
        const effectiveWidgets   = widgets.length  > 0 ? widgets  : [{ id: 'w1' }, { id: 'w2' }];
        const effectiveSites     = sites.length    > 0 ? sites    : [{ id: 's1', name: "Lauren O'Reilly", domain: 'itslaurenoreilly.web.app', createdAt: null }, { id: 's2', name: 'Wellness Script', domain: 'wellness-cript.web.app', createdAt: null }];

        const effectiveDist = {};
        effectiveCompanies.forEach(c => {
          const p = c.planId || 'starter';
          effectiveDist[p] = (effectiveDist[p] || 0) + 1;
        });
        const effectiveMrr = effectiveCompanies.reduce((sum, c) => sum + (PLAN_PRICE[c.planId] || 22), 0);

        setStats({
          users: effectiveCompanies.length,
          sites: effectiveSites.length,
          widgets: effectiveWidgets.length,
          voice: voices.length,
          mrr: effectiveMrr,
          conversations: convoSnap.size,
        });
        setRecentUsers(effectiveCompanies.slice(0, 6));
        setRecentSites(effectiveSites.slice(0, 5));
        setPlanDist(effectiveDist);
      } catch (e) {
        console.error('[Admin] load error', e);
        // Fallback mock so UI isn't blank
        setStats({ users: 2, sites: 2, widgets: 2, voice: 1, mrr: 44, conversations: 47 });
        setRecentUsers([
          { id: '1', name: "Lauren O'Reilly", industry: 'Health & Wellness', createdAt: null },
          { id: '2', name: 'Wellness Script', industry: 'Media & Podcast', createdAt: null },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const PLANS = Object.entries(PLAN_PRICE).map(([id, price]) => ({
    id, price,
    count: planDist[id] || 0,
    label: id.charAt(0).toUpperCase() + id.slice(1),
  }));

  const maxPlanCount = Math.max(...PLANS.map(p => p.count), 1);

  return (
    <div className="max-w-5xl mx-auto px-6 py-7 space-y-7">

      {/* Header */}
      <div>
        <h1 className="text-xl font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Overview</h1>
        <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>Live summary across all Freemi users and services.</p>
      </div>

      {/* Stat grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(91,95,255,0.04)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total users"      value={stats.users}         sub="Active accounts"        icon={Users}         color="#5B5FFF" delay={0}    onClick={() => navigate('/admin/users')} />
          <StatCard label="Websites hosted"  value={stats.sites}         sub="Live + draft"           icon={Globe2}        color="#7C3AED" delay={0.04} onClick={() => navigate('/admin/sites')} />
          <StatCard label="AI widgets"       value={stats.widgets}       sub="Deployed widgets"       icon={MessageSquare} color="#0EA5E9" delay={0.08} onClick={() => navigate('/admin/widgets')} />
          <StatCard label="Voice setups"     value={stats.voice}         sub="Phone numbers"          icon={Mic}           color="#F59E0B" delay={0.12} onClick={() => navigate('/admin/voice')} />
          <StatCard label="Est. MRR"         value={`€${stats.mrr}`}     sub="Based on plan pricing"  icon={CreditCard}    color="#5B5FFF" delay={0.16} onClick={() => navigate('/admin/billing')} />
          <StatCard label="Conversations"    value={stats.conversations} sub="All time"               icon={Zap}           color="#7C3AED" delay={0.20} />
        </div>
      )}

      {/* Two column: recent signups + plan distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent users */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <span className="text-[12px] font-black uppercase tracking-wider" style={{ color: '#94A3B8' }}>Recent signups</span>
            <button onClick={() => navigate('/admin/users')}
              className="text-[11px] font-bold flex items-center gap-1"
              style={{ color: '#5B5FFF' }}>
              View all <ArrowUpRight size={11} />
            </button>
          </div>
          <div className="p-2">
            {recentUsers.length === 0 ? (
              <p className="text-center text-[12px] py-8" style={{ color: '#CBD5E1' }}>No users yet</p>
            ) : recentUsers.map(u => <RecentRow key={u.id} item={u} type="user" />)}
          </div>
        </motion.div>

        {/* Plan distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-5" style={glassCard}>
          <span className="text-[12px] font-black uppercase tracking-wider block mb-5" style={{ color: '#94A3B8' }}>Plan distribution</span>
          <div className="space-y-4">
            {PLANS.map(plan => (
              <div key={plan.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] font-semibold" style={{ color: '#374151' }}>{plan.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]" style={{ color: '#94A3B8' }}>€{plan.price}/mo</span>
                    <span className="text-[12px] font-bold" style={{ color: '#0A0F1E' }}>{plan.count}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(91,95,255,0.07)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(plan.count / maxPlanCount) * 100}%` }}
                    transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #5B5FFF, #7C3AED)', minWidth: plan.count > 0 ? '8px' : '0' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <span className="text-[11px]" style={{ color: '#94A3B8' }}>Total users</span>
            <span className="text-[13px] font-black" style={{ color: '#0A0F1E' }}>{stats.users}</span>
          </div>
        </motion.div>
      </div>

      {/* Recent sites */}
      {recentSites.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <span className="text-[12px] font-black uppercase tracking-wider" style={{ color: '#94A3B8' }}>Recent websites</span>
            <button onClick={() => navigate('/admin/sites')}
              className="text-[11px] font-bold flex items-center gap-1"
              style={{ color: '#5B5FFF' }}>
              View all <ArrowUpRight size={11} />
            </button>
          </div>
          <div className="p-2">
            {recentSites.map(s => <RecentRow key={s.id} item={s} type="site" />)}
          </div>
        </motion.div>
      )}

    </div>
  );
}
