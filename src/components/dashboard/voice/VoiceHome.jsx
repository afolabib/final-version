import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, PhoneIncoming, PhoneMissed, Clock,
  ChevronRight, TrendingUp, Settings, Sparkles,
  ArrowRight, Users, CheckCircle, AlertCircle,
} from 'lucide-react';
import { doc, getDoc, collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MOCK_CALLS, MOCK_VOICE_CONFIG } from './mockCalls';

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

function formatDuration(secs) {
  if (!secs) return '—';
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

const INTENT_META = {
  booking:   { label: 'Booking',   color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)' },
  enquiry:   { label: 'Enquiry',   color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)' },
  order:     { label: 'Order',     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  support:   { label: 'Support',   color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  complaint: { label: 'Complaint', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

const STATUS_META = {
  answered:  { icon: PhoneIncoming, color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)', label: 'Answered' },
  missed:    { icon: PhoneMissed,   color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  label: 'Missed' },
  voicemail: { icon: Phone,         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Voicemail' },
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function Stat({ label, value, sub, icon: Icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}14` }}>
        <Icon size={16} strokeWidth={2} style={{ color }} />
      </div>
      <div>
        <div className="text-[28px] font-black leading-none mb-1" style={{ color: '#0A0F1E', letterSpacing: '-0.03em' }}>{value}</div>
        <div className="text-xs font-semibold" style={{ color: '#64748B' }}>{label}</div>
        {sub && <div className="text-[11px] mt-0.5" style={{ color: '#CBD5E1' }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

// ── Call row ──────────────────────────────────────────────────────────────────

function CallRow({ call, index, onClick }) {
  const status = STATUS_META[call.status] || STATUS_META.answered;
  const StatusIcon = status.icon;
  const intent = INTENT_META[(call.intent)?.toLowerCase()];
  const callerDisplay = call.callerName || call.callerNumber || 'Unknown caller';

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3.5 px-1 text-left rounded-xl transition-all group"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Status icon */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: status.bg }}>
        <StatusIcon size={15} strokeWidth={2} style={{ color: status.color }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-semibold truncate" style={{ color: '#0A0F1E' }}>
            {callerDisplay}
          </span>
          {intent && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: intent.bg, color: intent.color }}>
              {intent.label}
            </span>
          )}
        </div>
        <p className="text-xs truncate" style={{ color: '#94A3B8' }}>
          {call.summary || `${status.label} · ${formatDuration(call.duration)}`}
        </p>
      </div>

      {/* Time + duration */}
      <div className="flex-shrink-0 text-right">
        <p className="text-[11px]" style={{ color: '#CBD5E1' }}>{timeAgo(call.createdAt)}</p>
        {call.duration > 0 && (
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: '#94A3B8' }}>
            {formatDuration(call.duration)}
          </p>
        )}
      </div>
    </motion.button>
  );
}

// ── Phone number display ──────────────────────────────────────────────────────

function PhoneCard({ config, navigate }) {
  const hasNumber = !!config?.phoneNumber;

  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Your number</h3>
        <button onClick={() => navigate('/dashboard/voice-setup')}
          className="text-[11px] font-bold flex items-center gap-1"
          style={{ color: '#5B5FFF' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <Settings size={11} /> Manage
        </button>
      </div>

      {hasNumber ? (
        <div>
          <div className="text-2xl font-black tracking-wider mb-2" style={{ color: '#0A0F1E', fontFamily: 'ui-monospace, monospace' }}>
            {config.phoneNumber}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold" style={{ color: '#5B5FFF' }}>Active — answering 24/7</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(91,95,255,0.07)' }}>
            <Phone size={20} strokeWidth={1.5} style={{ color: '#C7D2FE' }} />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: '#CBD5E1' }}>No number assigned</p>
          <button onClick={() => navigate('/dashboard/voice-setup')}
            className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold mx-auto"
            style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
            Set up now <ArrowRight size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Call breakdown ────────────────────────────────────────────────────────────

function CallBreakdown({ calls }) {
  const answered = calls.filter(c => c.status === 'answered').length;
  const missed = calls.filter(c => c.status === 'missed').length;
  const voicemail = calls.filter(c => c.status === 'voicemail').length;
  const total = calls.length;

  const items = [
    { label: 'Answered', count: answered, color: '#5B5FFF' },
    { label: 'Missed',   count: missed,   color: '#EF4444' },
    { label: 'Voicemail',count: voicemail, color: '#F59E0B' },
  ];

  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: '#0A0F1E' }}>Call breakdown</h3>
      {total === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: '#CBD5E1' }}>No call data yet</p>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{item.label}</span>
                <span className="text-xs font-bold" style={{ color: '#0A0F1E' }}>
                  {item.count} <span style={{ color: '#CBD5E1' }}>/ {total}</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                  transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function VoiceHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);
  const [voiceConfig, setVoiceConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const phoneId = user?.uid;

  useEffect(() => {
    if (!phoneId) return;

    getDoc(doc(firestore, 'voice_configs', phoneId)).then(snap => {
      setVoiceConfig(snap.exists() ? snap.data() : MOCK_VOICE_CONFIG);
    });

    const q = query(
      collection(firestore, 'voice_calls'),
      where('phoneId', '==', phoneId),
      limit(100),
    );
    const unsub = onSnapshot(q, snap => {
      const real = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return tb - ta;
        });
      setCalls(real.length > 0 ? real : MOCK_CALLS);
      setLoading(false);
    }, () => { setCalls(MOCK_CALLS); setLoading(false); });

    return () => unsub();
  }, [phoneId]);

  const today = new Date().toDateString();
  const todayCalls = calls.filter(c => {
    const d = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt || 0);
    return d.toDateString() === today;
  });

  const answeredCalls = calls.filter(c => c.status === 'answered');
  const avgDuration = answeredCalls.length > 0
    ? Math.round(answeredCalls.reduce((s, c) => s + (c.duration || 0), 0) / answeredCalls.length)
    : null;

  const isConfigured = !!voiceConfig;
  const isActive = voiceConfig?.active !== false && isConfigured;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-7 space-y-6">

        {/* ── Status hero ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          {!isConfigured ? (
            <div className="rounded-2xl p-6 flex items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.07) 0%, rgba(91,95,255,0.05) 100%)', border: '1.5px solid rgba(124,58,237,0.18)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #5B5FFF)', boxShadow: '0 6px 20px rgba(124,58,237,0.35)' }}>
                  <Phone size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-base font-black mb-0.5" style={{ color: '#0A0F1E' }}>Set up Freemi Voice</p>
                  <p className="text-sm" style={{ color: '#64748B' }}>Get a phone number and start answering calls with AI — 24 hours a day.</p>
                </div>
              </div>
              <button onClick={() => navigate('/dashboard/voice-setup')}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-white flex-shrink-0 transition-all"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #5B5FFF)', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)'}>
                Get started <ArrowRight size={14} />
              </button>
            </div>
          ) : isActive ? (
            <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
              style={{ background: 'rgba(91,95,255,0.05)', border: '1px solid rgba(91,95,255,0.18)' }}>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(91,95,255,0.15)' }}>
                    <Phone size={18} strokeWidth={2} style={{ color: '#5B5FFF' }} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-indigo-400 border-2 border-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-black" style={{ color: '#0A0F1E' }}>Freemi Voice is active</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(91,95,255,0.12)', color: '#5B5FFF' }}>LIVE</span>
                  </div>
                  <p className="text-xs" style={{ color: '#64748B' }}>
                    {voiceConfig.botName || 'Your AI'} is answering calls to {voiceConfig.phoneNumber || 'your number'} 24/7
                  </p>
                </div>
              </div>
              <button onClick={() => navigate('/dashboard/voice-setup')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0"
                style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF', border: '1px solid rgba(91,95,255,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.1)'}>
                <Settings size={12} /> Configure
              </button>
            </div>
          ) : (
            <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
              style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.18)' }}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.12)' }}>
                  <AlertCircle size={18} strokeWidth={2} style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p className="text-sm font-black mb-0.5" style={{ color: '#0A0F1E' }}>Voice AI is paused</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>Activate it to start answering calls automatically.</p>
                </div>
              </div>
              <button onClick={() => navigate('/dashboard/voice-setup')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                Activate <ArrowRight size={12} />
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Today" value={loading ? '—' : todayCalls.length} sub="Calls handled" icon={Phone} color="#7C3AED" delay={0.08} />
          <Stat label="All time" value={loading ? '—' : calls.length} sub="Total calls" icon={TrendingUp} color="#5B5FFF" delay={0.13} />
          <Stat label="Answered" value={loading ? '—' : answeredCalls.length} sub="Calls completed" icon={CheckCircle} color="#5B5FFF" delay={0.18} />
          <Stat label="Avg duration" value={avgDuration ? formatDuration(avgDuration) : '—'} sub="Per call" icon={Clock} color="#F59E0B" delay={0.23} />
        </div>

        {/* ── Main grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Recent calls — 3/5 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <div>
                <h2 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Recent calls</h2>
                {calls.length > 0 && (
                  <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                    {calls.length} total · {todayCalls.length} today
                  </p>
                )}
              </div>
              {calls.length > 0 && (
                <button onClick={() => navigate('/dashboard/call-log')}
                  className="flex items-center gap-1 text-xs font-bold"
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
                  <div className="w-6 h-6 rounded-full border-2 border-purple-100 border-t-purple-400 animate-spin" />
                </div>
              ) : calls.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(124,58,237,0.06)' }}>
                    <Phone size={22} strokeWidth={1.5} style={{ color: '#DDD6FE' }} />
                  </div>
                  <p className="text-sm font-bold mb-1" style={{ color: '#CBD5E1' }}>No calls yet</p>
                  <p className="text-xs max-w-[200px]" style={{ color: '#E2E8F0' }}>
                    Once your number is active, incoming calls will appear here.
                  </p>
                  <button onClick={() => navigate('/dashboard/voice-setup')}
                    className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED' }}>
                    Set up voice <ArrowRight size={11} />
                  </button>
                </div>
              ) : (
                calls.slice(0, 6).map((call, i) => (
                  <CallRow key={call.id} call={call} index={i} onClick={() => navigate('/dashboard/call-log')} />
                ))
              )}
            </div>
          </motion.div>

          {/* Right — 2/5 */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
              <PhoneCard config={voiceConfig} navigate={navigate} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
              <CallBreakdown calls={calls} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
