import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useCompany } from '@/contexts/CompanyContext';
import { useWidget } from '@/contexts/WidgetContext';
import {
  CreditCard, Check, Zap, Globe, MessageSquare, Mic,
  Users, ChevronRight, AlertCircle, Download, Clock,
  Star, Shield, ArrowUpRight, X,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useProduct } from '@/contexts/ProductContext';

// ── Pricing data ───────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 22,
    currency: '€',
    period: 'mo',
    tagline: '1 site · widget + hosting included',
    color: '#5B5FFF',
    features: [
      { text: '1 website hosted', icon: Globe },
      { text: '1 AI chat widget', icon: MessageSquare },
      { text: '500 conversations / mo', icon: Zap },
      { text: 'Knowledge base', icon: Shield },
      { text: 'Analytics', icon: ArrowUpRight },
    ],
    cta: 'Get started',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 40,
    currency: '€',
    period: 'mo',
    tagline: '2 sites · everything in Starter',
    color: '#7C3AED',
    popular: true,
    features: [
      { text: '2 websites hosted', icon: Globe },
      { text: '2 AI chat widgets', icon: MessageSquare },
      { text: '1,500 conversations / mo', icon: Zap },
      { text: 'Unlimited knowledge sources', icon: Shield },
      { text: 'Full analytics + insights', icon: ArrowUpRight },
      { text: 'Custom branding', icon: Star },
    ],
    cta: 'Upgrade to Growth',
  },
  {
    id: 'business',
    name: 'Business',
    price: 75,
    currency: '€',
    period: 'mo',
    tagline: '5 sites · priority support',
    color: '#0EA5E9',
    features: [
      { text: '5 websites hosted', icon: Globe },
      { text: '5 AI chat widgets', icon: MessageSquare },
      { text: '5,000 conversations / mo', icon: Zap },
      { text: 'Voice AI agent', icon: Mic },
      { text: 'Custom branding + domain', icon: Star },
      { text: 'Priority support', icon: Shield },
    ],
    cta: 'Upgrade to Business',
  },
];

const VOICE_PLANS = [
  {
    id: 'voice-starter',
    name: 'Starter',
    price: 49,
    currency: '€',
    period: 'mo',
    tagline: '1 number · 500 call minutes',
    color: '#5B5FFF',
    features: [
      { text: '1 phone number', icon: Mic },
      { text: '500 call minutes / mo', icon: Zap },
      { text: 'AI voice receptionist', icon: MessageSquare },
      { text: 'Call transcripts', icon: Shield },
      { text: 'Basic call analytics', icon: ArrowUpRight },
    ],
    cta: 'Get started',
  },
  {
    id: 'voice-growth',
    name: 'Growth',
    price: 89,
    currency: '€',
    period: 'mo',
    tagline: '2 numbers · 2,000 call minutes',
    color: '#7C3AED',
    popular: true,
    features: [
      { text: '2 phone numbers', icon: Mic },
      { text: '2,000 call minutes / mo', icon: Zap },
      { text: 'AI voice receptionist', icon: MessageSquare },
      { text: 'Call transcripts + summaries', icon: Shield },
      { text: 'Full call analytics', icon: ArrowUpRight },
      { text: 'Custom voice & persona', icon: Star },
    ],
    cta: 'Upgrade to Growth',
  },
  {
    id: 'voice-business',
    name: 'Business',
    price: 159,
    currency: '€',
    period: 'mo',
    tagline: '5 numbers · 10,000 call minutes',
    color: '#0EA5E9',
    features: [
      { text: '5 phone numbers', icon: Mic },
      { text: '10,000 call minutes / mo', icon: Zap },
      { text: 'Multi-agent call routing', icon: Users },
      { text: 'CRM integrations', icon: Shield },
      { text: 'Priority support', icon: Star },
    ],
    cta: 'Upgrade to Business',
  },
];

const INVOICES = [
  { id: 'INV-2024-04', date: 'Apr 1, 2025', amount: '€22.00', plan: 'Starter', status: 'paid' },
  { id: 'INV-2024-03', date: 'Mar 1, 2025', amount: '€22.00', plan: 'Starter', status: 'paid' },
  { id: 'INV-2024-02', date: 'Feb 1, 2025', amount: '€22.00', plan: 'Starter', status: 'paid' },
  { id: 'INV-2024-01', date: 'Jan 1, 2025', amount: '€22.00', plan: 'Starter', status: 'paid' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function UsageBar({ label, used, total, color = '#5B5FFF' }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const warn = pct > 80;
  const barColor = warn ? '#F59E0B' : color;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-semibold" style={{ color: '#6B7280' }}>{label}</span>
        <span className="text-[11px] font-bold" style={{ color: warn ? '#F59E0B' : '#374151' }}>
          {used.toLocaleString()} / {total === Infinity ? '∞' : total.toLocaleString()}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: barColor }}
        />
      </div>
    </div>
  );
}

function PlanCard({ plan, isCurrent, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl p-6 flex flex-col transition-all duration-200"
      style={{
        background: isCurrent ? `rgba(91,95,255,0.05)` : 'rgba(255,255,255,0.9)',
        border: isCurrent ? `2px solid ${plan.color}` : '1.5px solid rgba(0,0,0,0.06)',
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.08)`
          : isCurrent
            ? `0 4px 20px rgba(91,95,255,0.1)`
            : '0 2px 12px rgba(0,0,0,0.03)',
      }}>

      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black text-white whitespace-nowrap"
          style={{ background: `linear-gradient(135deg, ${plan.color}, #5B5FFF)`, boxShadow: `0 3px 10px ${plan.color}50` }}>
          MOST POPULAR
        </div>
      )}

      {/* Current badge */}
      {isCurrent && (
        <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: `rgba(91,95,255,0.12)`, color: '#5B5FFF' }}>
          Current
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-base font-black mb-0.5" style={{ color: '#0A0F1E' }}>{plan.name}</h3>
        <p className="text-[11px]" style={{ color: '#94A3B8' }}>{plan.tagline}</p>
      </div>

      <div className="mb-5">
        <span className="text-[13px] font-bold" style={{ color: '#6B7280' }}>{plan.currency}</span>
        <span className="text-3xl font-black mx-0.5" style={{ color: '#0A0F1E' }}>{plan.price}</span>
        <span className="text-[12px]" style={{ color: '#94A3B8' }}>/{plan.period}</span>
      </div>

      <div className="flex-1 space-y-2.5 mb-6">
        {plan.features.map(({ text, icon: Icon }) => (
          <div key={text} className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: `rgba(91,95,255,0.08)` }}>
              <Check size={10} strokeWidth={3} style={{ color: plan.color }} />
            </div>
            <span className="text-[12px] font-medium" style={{ color: '#374151' }}>{text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => !isCurrent && onSelect(plan)}
        disabled={isCurrent}
        className="w-full py-2.5 rounded-xl text-[12px] font-black transition-all"
        style={{
          background: isCurrent
            ? 'rgba(91,95,255,0.08)'
            : `linear-gradient(135deg, ${plan.color}, #5B5FFF)`,
          color: isCurrent ? '#5B5FFF' : 'white',
          boxShadow: isCurrent ? 'none' : `0 4px 14px ${plan.color}40`,
          cursor: isCurrent ? 'default' : 'pointer',
        }}>
        {isCurrent ? '✓ Active plan' : plan.cta}
      </button>
    </motion.div>
  );
}

function ConfirmModal({ plan, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-lg opacity-40 hover:opacity-70">
          <X size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(91,95,255,0.08)' }}>
          <CreditCard size={22} style={{ color: '#5B5FFF' }} />
        </div>
        <h3 className="text-base font-black mb-1" style={{ color: '#0A0F1E' }}>Upgrade to {plan.name}</h3>
        <p className="text-[12px] mb-5" style={{ color: '#6B7280' }}>
          You'll be charged {plan.currency}{plan.price}/mo starting today. You can cancel anytime.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-[12px] font-bold"
            style={{ background: 'rgba(0,0,0,0.05)', color: '#374151' }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(plan)} className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 14px rgba(91,95,255,0.35)' }}>
            Confirm upgrade
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

const PLAN_LIMITS = {
  starter:  { conversations: 500,  sites: 1, widgets: 1 },
  growth:   { conversations: 1500, sites: 2, widgets: 2 },
  business: { conversations: 5000, sites: 5, widgets: 5 },
};

export default function CreditsView() {
  const { user } = useAuth();
  const { activeProduct } = useProduct();
  const { company } = useCompany();
  const { widgets } = useWidget();
  const [confirmPlan, setConfirmPlan] = useState(null);
  const [usageData, setUsageData] = useState(null);

  const isVoice = activeProduct === 'voice';
  const activePlans = isVoice ? VOICE_PLANS : PLANS;

  const planId = company?.planId || user?.plan || (isVoice ? 'voice-starter' : 'starter');
  const currentPlanId = isVoice ? 'voice-starter' : planId;
  const currentPlan = activePlans.find(p => p.id === currentPlanId) || activePlans[0];
  const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.starter;

  const [widgetBreakdown, setWidgetBreakdown] = useState({});

  // Month key matches Cloud Function: YYYY-MM
  const monthKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();

  // Load real usage from the atomic usage doc
  useEffect(() => {
    if (!user?.uid) return;
    let unsub = () => {};
    import('firebase/firestore').then(({ doc: fsDoc, onSnapshot }) => {
      const ref = fsDoc(firestore, 'usage', user.uid, 'monthly', monthKey);
      unsub = onSnapshot(ref, snap => {
        if (snap.exists()) {
          const d = snap.data();
          const total = d.total || 0;
          const widgetsMap = d.widgets || {};
          setWidgetBreakdown(widgetsMap);
          setUsageData(prev => ({
            ...prev,
            conversations: { used: total, total: limits.conversations },
          }));
        }
      });
    });

    // Count sites and widgets (not usage-critical, one-shot)
    async function loadCounts() {
      try {
        const [sitesSnap, widgetsSnap] = await Promise.all([
          getDocs(query(collection(firestore, 'websites'), where('userId', '==', user.uid))),
          getDocs(query(collection(firestore, 'widgets'),  where('userId', '==', user.uid))),
        ]);
        setUsageData(prev => ({
          conversations: prev?.conversations || { used: 0, total: limits.conversations },
          sites:   { used: sitesSnap.size  || 1, total: limits.sites },
          widgets: { used: widgetsSnap.size || 1, total: limits.widgets },
        }));
      } catch (e) { console.error('[CreditsView]', e); }
    }
    loadCounts();
    return () => unsub();
  }, [user?.uid, monthKey, planId]);

  const usage = usageData || {
    conversations: { used: 0, total: limits.conversations },
    sites:         { used: 1, total: limits.sites },
    widgets:       { used: 1, total: limits.widgets },
  };

  const handleConfirm = (plan) => {
    setConfirmPlan(null);
    // Billing integration placeholder
    alert(`Upgrade to ${plan.name} — billing integration coming soon.`);
  };

  return (
    <>
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-7 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Billing & Plan</h1>
          <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>Manage your subscription, usage, and payment details.</p>
        </div>

        {/* Current plan + usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Plan card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(91,95,255,0.12)',
              boxShadow: '0 4px 20px rgba(91,95,255,0.06)',
            }}>
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(91,95,255,0.12) 0%, transparent 70%)' }} />
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#94A3B8' }}>Current Plan</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF' }}>
                Active
              </span>
            </div>
            <h2 className="text-xl font-black mb-0.5" style={{ color: '#0A0F1E' }}>{currentPlan.name}</h2>
            <p className="text-[11px] mb-3" style={{ color: '#94A3B8' }}>{currentPlan.tagline}</p>
            <p className="text-2xl font-black" style={{ color: '#0A0F1E' }}>
              {currentPlan.currency}{currentPlan.price}
              <span className="text-sm font-normal ml-0.5" style={{ color: '#94A3B8' }}>/{currentPlan.period}</span>
            </p>
            <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>
              Next invoice: <span className="font-bold" style={{ color: '#374151' }}>May 1, 2025</span>
            </p>
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-5 rounded-sm flex items-center justify-center text-[8px] font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #1a1a2e, #374151)' }}>
                  VISA
                </div>
                <span className="text-[12px]" style={{ color: '#6B7280' }}>•••• •••• •••• 4242</span>
              </div>
            </div>
          </motion.div>

          {/* Usage card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(91,95,255,0.08)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#94A3B8' }}>This month's usage</span>
              <span className="text-[10px]" style={{ color: '#CBD5E1' }}>resets May 1</span>
            </div>
            {isVoice ? (
              <>
                <UsageBar label="Call minutes" used={312} total={500} />
                <UsageBar label="Phone numbers" used={1} total={1} />
              </>
            ) : (
              <>
                <UsageBar label="Conversations" used={usage.conversations.used} total={usage.conversations.total} />
                <UsageBar label="Websites hosted" used={usage.sites.used} total={usage.sites.total} />
                <UsageBar label="AI widgets" used={usage.widgets.used} total={usage.widgets.total} />
              </>
            )}
            {usage.conversations.used / usage.conversations.total > 0.8 && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <AlertCircle size={13} style={{ color: '#F59E0B' }} />
                <p className="text-[11px] font-semibold" style={{ color: '#92400E' }}>
                  Approaching conversation limit — consider upgrading.
                </p>
              </div>
            )}

            {/* Per-widget breakdown */}
            {!isVoice && Object.keys(widgetBreakdown).length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#CBD5E1' }}>
                  By widget
                </p>
                {Object.entries(widgetBreakdown).map(([wId, count]) => {
                  const w = widgets.find(x => x.id === wId);
                  const name = w?.businessName || w?.botName || wId;
                  const pct = Math.min(100, Math.round((count / usage.conversations.total) * 100));
                  return (
                    <div key={wId} className="mb-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold truncate" style={{ color: '#374151', maxWidth: '70%' }}>{name}</span>
                        <span className="text-[11px] font-bold" style={{ color: '#5B5FFF' }}>{count} conv.</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(91,95,255,0.07)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #5B5FFF, #7C3AED)', minWidth: count > 0 ? 6 : 0 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Plan comparison */}
        <div>
          <h2 className="text-base font-black mb-4" style={{ color: '#0A0F1E', letterSpacing: '-0.01em' }}>Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePlans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={plan.id === currentPlanId}
                onSelect={setConfirmPlan}
              />
            ))}
          </div>

          {/* Contact us for 5+ sites */}
          <div className="mt-4 flex items-center justify-between px-5 py-4 rounded-2xl"
            style={{ background: 'rgba(91,95,255,0.04)', border: '1px dashed rgba(91,95,255,0.2)' }}>
            <div>
              <p className="text-[13px] font-bold" style={{ color: '#0A0F1E' }}>{isVoice ? 'Need more than 5 numbers?' : 'Need more than 5 sites?'}</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{isVoice ? 'Custom plans for high call volumes, multi-location, and enterprise use.' : 'Custom plans with white-label and dedicated support.'}</p>
            </div>
            <a href="mailto:hello@freemi.io"
              className="flex-shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold transition-all"
              style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.1)'}>
              Contact us →
            </a>
          </div>

          <p className="text-[11px] mt-2 text-center" style={{ color: '#CBD5E1' }}>
            All plans include hosting, SSL, and AI widget. No setup fees. Cancel anytime.
          </p>
        </div>

        {/* Billing history */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.01em' }}>Billing history</h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(91,95,255,0.08)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            }}>
            {/* Header row */}
            <div className="grid px-5 py-3"
              style={{
                gridTemplateColumns: '1fr 1fr 100px 80px 40px',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                background: 'rgba(0,0,0,0.015)',
              }}>
              {['Invoice', 'Date', 'Amount', 'Status', ''].map(h => (
                <span key={h} className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#CBD5E1' }}>{h}</span>
              ))}
            </div>

            {INVOICES.map((inv, i) => (
              <div key={inv.id}
                className="grid items-center px-5 py-3.5 transition-colors"
                style={{
                  gridTemplateColumns: '1fr 1fr 100px 80px 40px',
                  borderBottom: i < INVOICES.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.015)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <p className="text-[12px] font-bold" style={{ color: '#374151' }}>{inv.id}</p>
                  <p className="text-[10px]" style={{ color: '#CBD5E1' }}>{inv.plan}</p>
                </div>
                <span className="text-[12px]" style={{ color: '#6B7280' }}>{inv.date}</span>
                <span className="text-[12px] font-bold" style={{ color: '#0A0F1E' }}>{inv.amount}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full w-fit"
                  style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
                  {inv.status}
                </span>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}>
                  <Download size={11} style={{ color: '#94A3B8' }} />
                </button>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer note */}
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
          style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.1)' }}>
          <Shield size={14} strokeWidth={2} className="flex-shrink-0 mt-0.5" style={{ color: '#5B5FFF' }} />
          <p className="text-[11px]" style={{ color: '#6B7280' }}>
            Payments are processed securely. Need help with billing? Email{' '}
            <a href="mailto:billing@freemi.io" className="font-bold" style={{ color: '#5B5FFF' }}>billing@freemi.io</a>
          </p>
        </div>

      </div>
    </div>

    <AnimatePresence>
      {confirmPlan && (
        <ConfirmModal
          plan={confirmPlan}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmPlan(null)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
