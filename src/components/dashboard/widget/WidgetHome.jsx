import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Zap, Users, Clock, ArrowRight,
  Copy, Check, ChevronRight, Globe, Settings,
  TrendingUp, Sparkles, AlertCircle,
} from 'lucide-react';
import { collection, query, where, limit, onSnapshot, doc } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useWidget } from '@/contexts/WidgetContext';
import { useNavigate } from 'react-router-dom';

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const m = Math.floor((Date.now() - d) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

const INTENT_META = {
  booking:   { label: 'Booking',   color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)' },
  enquiry:   { label: 'Enquiry',   color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)' },
  support:   { label: 'Support',   color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  complaint: { label: 'Complaint', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  purchase:  { label: 'Purchase',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function Stat({ label, value, sub, icon: Icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
      className="flex flex-col gap-3 rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.97)',
        border: '1px solid rgba(91,95,255,0.07)',
        boxShadow: '0 2px 12px rgba(91,95,255,0.04)',
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}14` }}>
        <Icon size={16} strokeWidth={2} style={{ color }} />
      </div>
      <div>
        <div className="text-[28px] font-black leading-none mb-1" style={{ color: '#0A0F1E', letterSpacing: '-0.03em' }}>
          {value}
        </div>
        <div className="text-xs font-semibold" style={{ color: '#64748B' }}>{label}</div>
        {sub && <div className="text-[11px] mt-0.5" style={{ color: '#CBD5E1' }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

// ── Conversation row ──────────────────────────────────────────────────────────

function ConvoRow({ conv, index, onClick }) {
  const lead = conv.lead || {};
  const intent = INTENT_META[(conv.intent || conv.type)?.toLowerCase()];
  const lastMsg = conv.lastMessage
    || conv.messages?.[conv.messages.length - 1]?.content
    || conv.messages?.[conv.messages.length - 1]?.text
    || null;
  const initial = lead.name ? lead.name[0].toUpperCase() : '?';

  return (
    <motion.button
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="w-full flex items-start gap-3 py-3.5 px-1 text-left rounded-xl transition-all duration-150 group"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
        style={{ background: lead.name ? 'linear-gradient(135deg, #5B5FFF, #7C3AED)' : 'linear-gradient(135deg, #E2E8F0, #CBD5E1)', color: lead.name ? 'white' : '#94A3B8' }}>
        {initial}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-semibold truncate" style={{ color: '#0A0F1E' }}>
            {lead.name || 'Anonymous visitor'}
          </span>
          {intent && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: intent.bg, color: intent.color }}>
              {intent.label}
            </span>
          )}
        </div>
        {lastMsg ? (
          <p className="text-xs truncate leading-relaxed" style={{ color: '#94A3B8' }}>
            {lastMsg}
          </p>
        ) : (
          <p className="text-xs" style={{ color: '#CBD5E1' }}>
            {conv.messageCount || 0} messages
          </p>
        )}
      </div>

      {/* Time + arrow */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span className="text-[11px]" style={{ color: '#CBD5E1' }}>
          {timeAgo(conv.updatedAt || conv.createdAt)}
        </span>
        <ChevronRight size={12} style={{ color: '#E2E8F0' }}
          className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.button>
  );
}

// ── Widget preview ────────────────────────────────────────────────────────────

function WidgetPreview({ config }) {
  const color = config?.primaryColor || '#5B5FFF';
  const greeting = config?.greeting || 'Hi! How can I help you today? 👋';
  const name = config?.businessName || 'Freemi';

  return (
    <div className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #f0f2ff 0%, #e8eaff 100%)',
        border: '1px solid rgba(91,95,255,0.1)',
        aspectRatio: '4/3',
      }}>
      {/* Fake browser chrome */}
      <div className="px-3 py-2 flex items-center gap-1.5"
        style={{ background: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
        <div className="flex-1 mx-2 h-3.5 rounded-full" style={{ background: 'rgba(0,0,0,0.07)' }} />
      </div>

      {/* Page content placeholder */}
      <div className="p-3 space-y-2">
        <div className="h-2 rounded-full w-3/4" style={{ background: 'rgba(0,0,0,0.07)' }} />
        <div className="h-2 rounded-full w-1/2" style={{ background: 'rgba(0,0,0,0.05)' }} />
        <div className="h-2 rounded-full w-2/3" style={{ background: 'rgba(0,0,0,0.05)' }} />
      </div>

      {/* Floating chat panel — bottom right */}
      <div className="absolute bottom-3 right-3 w-[160px]">
        {/* Chat window */}
        <div className="mb-2 rounded-xl overflow-hidden"
          style={{
            background: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
          {/* Header */}
          <div className="px-3 py-2 flex items-center gap-2"
            style={{ background: color }}>
            <div className="w-5 h-5 rounded-lg flex items-center justify-center bg-white/20">
              <div className="w-2 h-2 rounded-full bg-white/90" />
            </div>
            <span className="text-[11px] font-bold text-white truncate">{name}</span>
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
          </div>
          {/* Message bubble */}
          <div className="p-2.5">
            <div className="text-[10px] leading-relaxed rounded-lg rounded-tl-sm px-2.5 py-2"
              style={{ background: 'rgba(91,95,255,0.07)', color: '#374151', lineHeight: 1.5 }}>
              {greeting.length > 50 ? greeting.slice(0, 50) + '…' : greeting}
            </div>
            <div className="mt-2 flex items-center gap-1.5 px-1 py-1.5 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.04)' }}>
              <span className="text-[9px] flex-1" style={{ color: '#CBD5E1' }}>Reply…</span>
              <div className="w-4 h-4 rounded-md flex items-center justify-center"
                style={{ background: color }}>
                <ArrowRight size={8} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Bubble button */}
        <div className="flex justify-end">
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: color, boxShadow: `0 4px 14px ${color}60` }}>
            <MessageSquare size={14} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WidgetHome() {
  const { user } = useAuth();
  const { company } = useCompany();
  const { activeWidget, activeWidgetId } = useWidget();
  const navigate = useNavigate();
  const widgetId = activeWidgetId;
  const widgetConfig = activeWidget;

  const [conversations, setConversations] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [widgetUsage, setWidgetUsage] = useState(null); // { used, total, pct }

  // Load this widget's monthly usage from the atomic usage doc
  useEffect(() => {
    if (!user?.uid || !widgetId) return;
    const d = new Date();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const planLimits = { starter: 500, growth: 1500, business: 5000 };
    const planId = company?.planId || 'starter';
    const total = planLimits[planId] || 500;

    const ref = doc(firestore, 'usage', user.uid, 'monthly', monthKey);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const used = snap.data()?.widgets?.[widgetId] || 0;
        setWidgetUsage({ used, total, pct: Math.min(100, Math.round((used / total) * 100)) });
      } else {
        setWidgetUsage({ used: 0, total, pct: 0 });
      }
    });
    return () => unsub();
  }, [user?.uid, widgetId, company?.planId]);

  useEffect(() => {
    if (!widgetId) return;
    setLoading(true);
    const q = query(
      collection(firestore, 'widget_conversations'),
      where('widgetId', '==', widgetId),
      limit(100),
    );
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt || a.createdAt || 0);
          const tb = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt || b.createdAt || 0);
          return tb - ta;
        });
      setConversations(docs);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [widgetId]);

  const today = new Date().toDateString();
  const todayCount = conversations.filter(c => {
    const d = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt || 0);
    return d.toDateString() === today;
  }).length;
  const leadsCount = conversations.filter(c => c.lead?.email || c.lead?.name).length;
  const isConfigured = !!widgetConfig;
  const isLive = widgetConfig?.active !== false && isConfigured;

  const snippet = `<script src="https://freemi.ai/freemi-widget.js" data-widget-id="${widgetId}"></script>`;
  const handleCopy = () => {
    navigator.clipboard.writeText(snippet).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-7 space-y-6">

        {/* ── Status hero ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {!isConfigured ? (
            /* Not set up yet */
            <div className="rounded-2xl p-6 flex items-center justify-between gap-4"
              style={{
                background: 'linear-gradient(135deg, rgba(91,95,255,0.07) 0%, rgba(124,58,237,0.05) 100%)',
                border: '1.5px solid rgba(91,95,255,0.18)',
              }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 6px 20px rgba(91,95,255,0.35)' }}>
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-base font-black mb-0.5" style={{ color: '#0A0F1E' }}>Set up your widget</p>
                  <p className="text-sm" style={{ color: '#64748B' }}>Configure your AI assistant and add it to your website in 2 minutes.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard/widget')}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-white flex-shrink-0 transition-all"
                style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 16px rgba(91,95,255,0.35)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(91,95,255,0.5)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,95,255,0.35)'}>
                Get started <ArrowRight size={14} />
              </button>
            </div>
          ) : isLive ? (
            /* Live */
            <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
              style={{
                background: 'rgba(91,95,255,0.05)',
                border: '1px solid rgba(91,95,255,0.18)',
              }}>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(91,95,255,0.15)' }}>
                    <MessageSquare size={18} strokeWidth={2} style={{ color: '#5B5FFF' }} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-indigo-400 border-2 border-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-black" style={{ color: '#0A0F1E' }}>Widget is live</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(91,95,255,0.12)', color: '#5B5FFF' }}>ACTIVE</span>
                  </div>
                  <p className="text-xs" style={{ color: '#64748B' }}>
                    {widgetConfig.businessName || 'Your assistant'} is answering visitors 24/7
                    {company?.website ? ` on ${company.website.replace(/^https?:\/\//, '')}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard/widget')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0"
                style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF', border: '1px solid rgba(91,95,255,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.1)'}>
                <Settings size={12} /> Manage
              </button>
            </div>
          ) : (
            /* Configured but paused */
            <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
              style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.18)' }}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.12)' }}>
                  <AlertCircle size={18} strokeWidth={2} style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p className="text-sm font-black mb-0.5" style={{ color: '#0A0F1E' }}>Widget is paused</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>Activate it in Widget Setup to start receiving conversations.</p>
                </div>
              </div>
              <button onClick={() => navigate('/dashboard/widget')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                Activate <ArrowRight size={12} />
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Stats row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Today" value={loading ? '—' : todayCount} sub="Conversations" icon={MessageSquare} color="#5B5FFF" delay={0.08} />
          <Stat label="All time" value={loading ? '—' : conversations.length} sub="Total conversations" icon={TrendingUp} color="#7C3AED" delay={0.13} />
          <Stat label="Leads" value={loading ? '—' : leadsCount} sub="Names or emails captured" icon={Users} color="#5B5FFF" delay={0.18} />
          <Stat label="Response" value="< 2s" sub="Always instant" icon={Zap} color="#F59E0B" delay={0.23} />
        </div>

        {/* ── Monthly credit usage bar ──────────────────────────────── */}
        {widgetUsage !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl px-5 py-4"
            style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#94A3B8' }}>
                Monthly conversations
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold" style={{ color: widgetUsage.pct >= 80 ? '#F59E0B' : '#5B5FFF' }}>
                  {widgetUsage.used}
                </span>
                <span className="text-[11px]" style={{ color: '#CBD5E1' }}>/ {widgetUsage.total}</span>
                {widgetUsage.pct >= 80 && (
                  <AlertCircle size={13} style={{ color: '#F59E0B' }} />
                )}
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(91,95,255,0.07)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widgetUsage.pct}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{
                  background: widgetUsage.pct >= 80
                    ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                    : 'linear-gradient(90deg, #5B5FFF, #7C3AED)',
                  minWidth: widgetUsage.used > 0 ? 6 : 0,
                }}
              />
            </div>
            {widgetUsage.pct >= 80 && (
              <p className="text-[10px] mt-1.5" style={{ color: '#F59E0B' }}>
                {widgetUsage.pct >= 100
                  ? 'Limit reached — upgrade to restore conversations'
                  : `${100 - widgetUsage.pct}% remaining — consider upgrading`}
              </p>
            )}
          </motion.div>
        )}

        {/* ── Main grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Conversations — 3/5 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.97)',
              border: '1px solid rgba(91,95,255,0.07)',
              boxShadow: '0 2px 12px rgba(91,95,255,0.04)',
            }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <div>
                <h2 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Recent conversations</h2>
                {conversations.length > 0 && (
                  <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                    {conversations.length} total · {todayCount} today
                  </p>
                )}
              </div>
              {conversations.length > 0 && (
                <button
                  onClick={() => navigate('/dashboard/conversations')}
                  className="flex items-center gap-1 text-xs font-bold transition-all"
                  style={{ color: '#5B5FFF' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  View all <ChevronRight size={12} />
                </button>
              )}
            </div>

            <div className="px-4 py-2 pb-4">
              {loading ? (
                <div className="py-10 flex justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-indigo-100 border-t-indigo-400 animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(91,95,255,0.06)' }}>
                    <MessageSquare size={22} strokeWidth={1.5} style={{ color: '#C7D2FE' }} />
                  </div>
                  <p className="text-sm font-bold mb-1" style={{ color: '#CBD5E1' }}>No conversations yet</p>
                  <p className="text-xs max-w-[200px]" style={{ color: '#E2E8F0' }}>
                    Once your widget is installed, visitor conversations appear here instantly.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard/widget')}
                    className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
                    Install widget <ArrowRight size={11} />
                  </button>
                </div>
              ) : (
                conversations.slice(0, 6).map((conv, i) => (
                  <ConvoRow
                    key={conv.id}
                    conv={conv}
                    index={i}
                    onClick={() => navigate('/dashboard/conversations')}
                  />
                ))
              )}
            </div>
          </motion.div>

          {/* Right column — 2/5 */}
          <div className="lg:col-span-2 space-y-4">

            {/* Widget preview */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.97)',
                border: '1px solid rgba(91,95,255,0.07)',
                boxShadow: '0 2px 12px rgba(91,95,255,0.04)',
              }}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <h3 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Widget preview</h3>
                <button
                  onClick={() => navigate('/dashboard/widget')}
                  className="flex items-center gap-1 text-[11px] font-bold"
                  style={{ color: '#5B5FFF' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <Settings size={11} /> Customise
                </button>
              </div>
              <div className="px-3 pb-4">
                <WidgetPreview config={widgetConfig} />
              </div>
            </motion.div>

            {/* Install code */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-4"
              style={{
                background: 'rgba(255,255,255,0.97)',
                border: '1px solid rgba(91,95,255,0.07)',
                boxShadow: '0 2px 12px rgba(91,95,255,0.04)',
              }}
            >
              <h3 className="text-sm font-bold mb-3" style={{ color: '#0A0F1E' }}>Install code</h3>
              <div className="rounded-xl px-3.5 py-3 mb-3 font-mono text-[11px] leading-relaxed overflow-hidden"
                style={{ background: '#0D1117', color: '#7DD3FC' }}>
                <span style={{ color: '#6B7280' }}>&lt;</span>
                <span style={{ color: '#79C0FF' }}>script</span>
                <span style={{ color: '#6B7280' }}> src=</span>
                <span style={{ color: '#A5D6FF' }}>"freemi.ai/…"</span>
                <br />
                <span style={{ color: '#6B7280' }}>  data-widget-id=</span>
                <span style={{ color: '#A5D6FF' }}>"{widgetId?.slice(0, 8)}…"</span>
                <span style={{ color: '#6B7280' }}>&gt;</span>
              </div>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: copied ? 'rgba(91,95,255,0.08)' : 'rgba(91,95,255,0.07)',
                  color: copied ? '#5B5FFF' : '#5B5FFF',
                  border: `1px solid ${copied ? 'rgba(91,95,255,0.2)' : 'rgba(91,95,255,0.12)'}`,
                }}>
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy install code</>}
              </button>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
