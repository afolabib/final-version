import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import {
  CreditCard, TrendingUp, Users, ArrowUpRight,
  DollarSign, BarChart3, Search, ChevronDown,
} from 'lucide-react';

const glassCard = {
  background: 'rgba(255,255,255,0.97)',
  border: '1px solid rgba(91,95,255,0.08)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
};

const PLAN_PRICE  = { starter: 22, growth: 40, business: 75 };
const PLAN_LABELS = { starter: 'Starter', growth: 'Growth', business: 'Business' };
const PLAN_COLOR  = { starter: '#5B5FFF', growth: '#7C3AED', business: '#0EA5E9' };

const MOCK_COMPANIES = [
  { id: '1', name: "Lauren O'Reilly",  email: 'lauren@example.com', planId: 'starter', createdAt: null, status: 'active' },
  { id: '2', name: 'Wellness Script',  email: 'hello@wellness.com', planId: 'growth',  createdAt: null, status: 'active' },
];

function StatCard({ label, value, sub, icon: Icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={glassCard}>
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}14` }}>
          <Icon size={16} strokeWidth={2} style={{ color }} />
        </div>
      </div>
      <p className="text-[28px] font-black leading-none mb-1" style={{ color: '#0A0F1E', letterSpacing: '-0.03em' }}>{value}</p>
      <p className="text-[12px] font-semibold" style={{ color: '#64748B' }}>{label}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: '#CBD5E1' }}>{sub}</p>}
    </motion.div>
  );
}

export default function AdminBilling() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [changingPlan, setChangingPlan] = useState(null); // { userId, newPlan }

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(firestore, 'companies'));
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (docs.length === 0) docs = MOCK_COMPANIES;
        setCompanies(docs);
      } catch (e) {
        console.error('[AdminBilling] error', e);
        setCompanies(MOCK_COMPANIES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePlanChange = async (userId, newPlan) => {
    try {
      await updateDoc(doc(firestore, 'companies', userId), {
        planId: newPlan,
        updatedAt: serverTimestamp(),
      });
      setCompanies(prev => prev.map(c => c.id === userId ? { ...c, planId: newPlan } : c));
      setChangingPlan(null);
    } catch (e) {
      console.error('Plan update failed:', e);
    }
  };

  // Metrics
  const totalMrr = companies.reduce((s, c) => s + (PLAN_PRICE[c.planId] || 22), 0);
  const totalArr  = totalMrr * 12;
  const avgRevPerUser = companies.length > 0 ? (totalMrr / companies.length).toFixed(0) : 0;

  const planDist = {};
  companies.forEach(c => {
    const p = c.planId || 'starter';
    planDist[p] = (planDist[p] || 0) + 1;
  });

  const filtered = companies.filter(c => {
    const matchSearch = !search ||
      (c.name || c.businessName || c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === 'all' || c.planId === filterPlan;
    return matchSearch && matchPlan;
  });

  const timeAgo = (ts) => {
    if (!ts) return '—';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    const days = Math.floor((Date.now() - d) / 86400000);
    if (days < 1) return 'Today';
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  // Next billing date (1st of next month)
  const nextBilling = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  })();

  return (
    <div className="max-w-5xl mx-auto px-6 py-7 space-y-7">

      {/* Header */}
      <div>
        <h1 className="text-xl font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Billing & Revenue</h1>
        <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>
          {companies.length} accounts · next billing cycle {nextBilling}
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(91,95,255,0.04)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Monthly MRR"     value={`€${totalMrr}`}       sub="All active plans"   icon={CreditCard}  color="#5B5FFF" delay={0}    />
          <StatCard label="Annual ARR"      value={`€${totalArr}`}       sub="MRR × 12"           icon={TrendingUp}  color="#7C3AED" delay={0.05} />
          <StatCard label="Avg. Rev / User" value={`€${avgRevPerUser}`}  sub="Per account/mo"     icon={BarChart3}   color="#0EA5E9" delay={0.1}  />
          <StatCard label="Paying accounts" value={companies.length}     sub="Active accounts"    icon={Users}       color="#F59E0B" delay={0.15} />
        </div>
      )}

      {/* Plan breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Object.entries(PLAN_PRICE).map(([planId, price]) => {
          const count = planDist[planId] || 0;
          const rev   = count * price;
          return (
            <motion.div key={planId}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-5" style={glassCard}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-black uppercase tracking-wider" style={{ color: PLAN_COLOR[planId] }}>
                  {PLAN_LABELS[planId]}
                </span>
                <span className="text-[11px]" style={{ color: '#94A3B8' }}>€{price}/mo</span>
              </div>
              <p className="text-[30px] font-black leading-none mb-0.5" style={{ color: '#0A0F1E', letterSpacing: '-0.03em' }}>
                {count}
              </p>
              <p className="text-[11px]" style={{ color: '#94A3B8' }}>accounts</p>
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: '#94A3B8' }}>Monthly revenue</span>
                  <span className="text-[14px] font-black" style={{ color: PLAN_COLOR[planId] }}>€{rev}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px]" style={{ color: '#94A3B8' }}>ARR contribution</span>
                  <span className="text-[12px] font-semibold" style={{ color: '#374151' }}>€{rev * 12}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Per-user billing table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden" style={glassCard}>

        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <span className="text-[12px] font-black uppercase tracking-wider" style={{ color: '#94A3B8' }}>Per-user billing</span>
          <div className="flex items-center gap-2">
            {/* Plan filter */}
            <select
              value={filterPlan}
              onChange={e => setFilterPlan(e.target.value)}
              className="text-[11px] rounded-lg px-2 py-1.5 outline-none"
              style={{ background: 'rgba(91,95,255,0.06)', color: '#374151', border: '1px solid rgba(91,95,255,0.1)' }}>
              <option value="all">All plans</option>
              {Object.keys(PLAN_PRICE).map(p => (
                <option key={p} value={p}>{PLAN_LABELS[p]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#CBD5E1' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-8 pr-4 py-2 rounded-xl text-[11px] outline-none"
              style={{ background: 'rgba(91,95,255,0.04)', color: '#374151', border: '1px solid rgba(91,95,255,0.08)' }} />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(91,95,255,0.04)' }} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  {['Account', 'Plan', 'Monthly', 'ARR', 'Since', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider"
                      style={{ color: '#94A3B8' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((company, i) => {
                  const plan  = company.planId || 'starter';
                  const price = PLAN_PRICE[plan] || 22;
                  return (
                    <tr key={company.id}
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                            {(company.name || company.businessName || company.email || '?')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold" style={{ color: '#0A0F1E' }}>
                              {company.name || company.businessName || '—'}
                            </p>
                            <p className="text-[10px]" style={{ color: '#94A3B8' }}>{company.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${PLAN_COLOR[plan]}14`, color: PLAN_COLOR[plan] }}>
                          {PLAN_LABELS[plan]}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[12px] font-bold" style={{ color: '#0A0F1E' }}>€{price}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[12px] font-semibold" style={{ color: '#374151' }}>€{price * 12}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[11px]" style={{ color: '#94A3B8' }}>{timeAgo(company.createdAt)}</span>
                      </td>
                      <td className="px-5 py-3">
                        {changingPlan?.userId === company.id ? (
                          <div className="flex items-center gap-1.5">
                            {Object.keys(PLAN_PRICE).map(p => (
                              <button key={p}
                                onClick={() => handlePlanChange(company.id, p)}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg transition-colors"
                                style={{
                                  background: p === plan ? PLAN_COLOR[p] : `${PLAN_COLOR[p]}14`,
                                  color: p === plan ? '#fff' : PLAN_COLOR[p],
                                }}>
                                {PLAN_LABELS[p]}
                              </button>
                            ))}
                            <button onClick={() => setChangingPlan(null)}
                              className="text-[10px] px-1.5 py-1 rounded-lg"
                              style={{ color: '#94A3B8' }}>✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setChangingPlan({ userId: company.id })}
                            className="text-[10px] font-semibold flex items-center gap-0.5"
                            style={{ color: '#5B5FFF' }}>
                            Change plan <ChevronDown size={10} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-[12px]" style={{ color: '#CBD5E1' }}>
                      No accounts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer summary */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(0,0,0,0.04)', background: 'rgba(91,95,255,0.02)' }}>
            <span className="text-[11px]" style={{ color: '#94A3B8' }}>
              {filtered.length} account{filtered.length !== 1 ? 's' : ''} shown
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[11px]" style={{ color: '#94A3B8' }}>
                Subtotal: <strong style={{ color: '#0A0F1E' }}>
                  €{filtered.reduce((s, c) => s + (PLAN_PRICE[c.planId] || 22), 0)}/mo
                </strong>
              </span>
              <span className="text-[11px]" style={{ color: '#94A3B8' }}>
                ARR: <strong style={{ color: '#0A0F1E' }}>
                  €{filtered.reduce((s, c) => s + (PLAN_PRICE[c.planId] || 22), 0) * 12}
                </strong>
              </span>
            </div>
          </div>
        )}
      </motion.div>

    </div>
  );
}
