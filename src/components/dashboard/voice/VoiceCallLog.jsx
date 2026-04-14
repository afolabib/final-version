import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ArrowLeft, Phone, PhoneIncoming, PhoneMissed,
  Clock, User as UserIcon, Mail, Mic, FileText,
} from 'lucide-react';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';
import { MOCK_CALLS } from './mockCalls';

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const m = Math.floor((Date.now() - d) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  const days = Math.floor(m / 1440);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function fullDate(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatDuration(secs) {
  if (!secs) return '—';
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

const STATUS_META = {
  answered:  { icon: PhoneIncoming, color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)',  label: 'Answered' },
  missed:    { icon: PhoneMissed,   color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   label: 'Missed' },
  voicemail: { icon: Phone,         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Voicemail' },
};

const INTENT_META = {
  booking:   { label: 'Booking',   color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)' },
  enquiry:   { label: 'Enquiry',   color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)' },
  order:     { label: 'Order',     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  support:   { label: 'Support',   color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  complaint: { label: 'Complaint', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

const FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'today',     label: 'Today' },
  { id: 'week',      label: 'This week' },
  { id: 'answered',  label: 'Answered' },
  { id: 'missed',    label: 'Missed' },
];

// ── Call list item ─────────────────────────────────────────────────────────────

function CallItem({ call, isSelected, onClick }) {
  const status = STATUS_META[call.status] || STATUS_META.answered;
  const StatusIcon = status.icon;
  const intent = INTENT_META[(call.intent)?.toLowerCase()];
  const callerDisplay = call.callerName || call.callerNumber || 'Unknown caller';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all duration-150 border-b"
      style={{
        background: isSelected ? 'rgba(91,95,255,0.07)' : 'transparent',
        borderColor: 'rgba(0,0,0,0.05)',
        borderLeftWidth: 2,
        borderLeftColor: isSelected ? '#5B5FFF' : 'transparent',
        borderLeftStyle: 'solid',
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(91,95,255,0.03)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: status.bg }}>
        <StatusIcon size={15} strokeWidth={2} style={{ color: status.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-semibold truncate" style={{ color: '#0A0F1E' }}>
            {callerDisplay}
          </span>
          <span className="text-[11px] flex-shrink-0" style={{ color: '#CBD5E1' }}>
            {timeAgo(call.createdAt)}
          </span>
        </div>
        {call.summary ? (
          <p className="text-xs truncate mb-1.5" style={{ color: '#94A3B8', lineHeight: 1.4 }}>{call.summary}</p>
        ) : (
          <p className="text-xs mb-1.5" style={{ color: '#CBD5E1' }}>{status.label} · {formatDuration(call.duration)}</p>
        )}
        <div className="flex items-center gap-1.5">
          {intent && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: intent.bg, color: intent.color }}>
              {intent.label}
            </span>
          )}
          {call.duration > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(91,95,255,0.06)', color: '#64748B' }}>
              <Clock size={9} className="inline mr-0.5" />{formatDuration(call.duration)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Call detail ───────────────────────────────────────────────────────────────

function CallDetail({ call, onBack }) {
  const status = STATUS_META[call.status] || STATUS_META.answered;
  const StatusIcon = status.icon;
  const intent = INTENT_META[(call.intent)?.toLowerCase()];
  const transcript = call.transcript || call.messages || [];
  const callerDisplay = call.callerName || call.callerNumber || 'Unknown caller';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={onBack}
          className="p-1.5 rounded-lg -ml-1 transition-colors md:hidden"
          style={{ color: '#94A3B8' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.07)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <ArrowLeft size={16} />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: status.bg }}>
          <StatusIcon size={16} strokeWidth={2} style={{ color: status.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-bold truncate" style={{ color: '#0A0F1E' }}>{callerDisplay}</p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: status.bg, color: status.color }}>
              {status.label}
            </span>
            {intent && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: intent.bg, color: intent.color }}>
                {intent.label}
              </span>
            )}
          </div>
          <p className="text-[11px]" style={{ color: '#94A3B8' }}>
            {fullDate(call.createdAt)}{call.duration > 0 ? ` · ${formatDuration(call.duration)}` : ''}
          </p>
        </div>
      </div>

      {/* Caller info bar */}
      {(call.callerName || call.callerNumber || call.callerEmail) && (
        <div className="flex items-center gap-4 px-5 py-2.5 flex-shrink-0"
          style={{ background: 'rgba(91,95,255,0.03)', borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
          {call.callerName && (
            <div className="flex items-center gap-1.5">
              <UserIcon size={11} style={{ color: '#7C3AED' }} />
              <span className="text-xs font-semibold" style={{ color: '#374151' }}>{call.callerName}</span>
            </div>
          )}
          {call.callerNumber && (
            <div className="flex items-center gap-1.5">
              <Phone size={11} style={{ color: '#7C3AED' }} />
              <span className="text-xs font-semibold" style={{ color: '#374151' }}>{call.callerNumber}</span>
            </div>
          )}
          {call.callerEmail && (
            <div className="flex items-center gap-1.5">
              <Mail size={11} style={{ color: '#7C3AED' }} />
              <span className="text-xs font-semibold" style={{ color: '#374151' }}>{call.callerEmail}</span>
            </div>
          )}
        </div>
      )}

      {/* AI Summary */}
      {call.summary && (
        <div className="mx-5 mt-4 p-4 rounded-xl flex-shrink-0"
          style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <FileText size={12} style={{ color: '#7C3AED' }} />
            <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#7C3AED' }}>AI Summary</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#374151' }}>{call.summary}</p>
        </div>
      )}

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 mt-2">
        {transcript.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,58,237,0.06)' }}>
              <Mic size={20} strokeWidth={1.5} style={{ color: '#DDD6FE' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#CBD5E1' }}>No transcript available</p>
            <p className="text-xs mt-1" style={{ color: '#E2E8F0' }}>Full call transcript will appear here</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Mic size={11} style={{ color: '#94A3B8' }} />
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#94A3B8' }}>Transcript</span>
            </div>
            {transcript.map((line, i) => {
              const isAI = line.role === 'assistant' || line.speaker === 'ai' || line.speaker === 'assistant';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
                >
                  {isAI && (
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #5B5FFF)' }}>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
                    </div>
                  )}
                  <div className="max-w-[75%]">
                    <div className="px-4 py-2.5 text-sm leading-relaxed"
                      style={{
                        background: isAI ? 'white' : '#7C3AED',
                        color: isAI ? '#374151' : 'white',
                        borderRadius: isAI ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                        boxShadow: isAI ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 12px rgba(124,58,237,0.3)',
                        border: isAI ? '1px solid rgba(0,0,0,0.06)' : 'none',
                      }}>
                      {line.content || line.text || line.message}
                    </div>
                    {line.timestamp && (
                      <p className={`text-[10px] mt-1 ${isAI ? 'pl-2' : 'pr-2 text-right'}`}
                        style={{ color: '#CBD5E1' }}>
                        {typeof line.timestamp === 'number' ? `${line.timestamp}s` : line.timestamp}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function VoiceCallLog() {
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(firestore, 'voice_calls'),
      where('phoneId', '==', user.uid),
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
  }, [user?.uid]);

  const filtered = calls.filter(c => {
    if (search) {
      const sq = search.toLowerCase();
      if (
        !c.callerName?.toLowerCase().includes(sq) &&
        !c.callerNumber?.toLowerCase().includes(sq) &&
        !c.summary?.toLowerCase().includes(sq)
      ) return false;
    }
    if (filter === 'today') {
      const d = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt || 0);
      if (d.toDateString() !== new Date().toDateString()) return false;
    }
    if (filter === 'week') {
      const d = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt || 0);
      if (Date.now() - d > 7 * 86400000) return false;
    }
    if (filter === 'answered' && c.status !== 'answered') return false;
    if (filter === 'missed' && c.status !== 'missed') return false;
    return true;
  });

  const selectedCall = selectedId ? calls.find(c => c.id === selectedId) : null;
  const showDetail = !!selectedCall;

  return (
    <div className="h-full flex overflow-hidden">

      {/* List panel */}
      <div
        className={`flex flex-col border-r overflow-hidden ${showDetail ? 'hidden md:flex' : 'flex'}`}
        style={{
          width: showDetail ? '38%' : '100%',
          minWidth: showDetail ? 280 : 'auto',
          borderColor: 'rgba(0,0,0,0.06)',
          background: 'rgba(255,255,255,0.97)',
        }}
      >
        {/* Toolbar */}
        <div className="flex-shrink-0 px-4 pt-5 pb-3 space-y-3"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-black" style={{ color: '#0A0F1E' }}>Call log</h1>
              <p className="text-[11px]" style={{ color: '#94A3B8' }}>
                {filtered.length} of {calls.length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by caller or summary…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 rounded-xl text-[13px] outline-none"
              style={{
                background: 'rgba(124,58,237,0.04)',
                border: '1px solid rgba(124,58,237,0.1)',
                color: '#0A0F1E',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.35)'}
              onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.1)'}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#94A3B8' }}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all"
                style={{
                  background: filter === f.id ? '#7C3AED' : 'rgba(124,58,237,0.06)',
                  color: filter === f.id ? 'white' : '#94A3B8',
                }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-purple-100 border-t-purple-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(124,58,237,0.06)' }}>
                <Phone size={20} strokeWidth={1.5} style={{ color: '#DDD6FE' }} />
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: '#CBD5E1' }}>
                {search ? 'No results' : 'No calls yet'}
              </p>
              <p className="text-xs" style={{ color: '#E2E8F0' }}>
                {search ? 'Try a different search' : 'Calls will appear here once your number is active'}
              </p>
            </div>
          ) : (
            filtered.map(call => (
              <CallItem
                key={call.id}
                call={call}
                isSelected={selectedId === call.id}
                onClick={() => setSelectedId(selectedId === call.id ? null : call.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col overflow-hidden"
            style={{ background: '#FAFBFF', minWidth: 0 }}
          >
            <CallDetail call={selectedCall} onBack={() => setSelectedId(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state desktop */}
      {!showDetail && (
        <div className="hidden md:flex flex-1 items-center justify-center"
          style={{ background: '#FAFBFF' }}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(124,58,237,0.06)' }}>
              <Phone size={22} strokeWidth={1.5} style={{ color: '#DDD6FE' }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#CBD5E1' }}>Select a call</p>
            <p className="text-xs" style={{ color: '#E2E8F0' }}>Click any call to view the transcript</p>
          </div>
        </div>
      )}

    </div>
  );
}
