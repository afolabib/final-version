import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ArrowLeft, Mail, User as UserIcon, Phone,
  MessageSquare, Calendar, Building2, DollarSign,
  CheckCircle2, Clock, AlertCircle, ChevronRight,
  Briefcase, HelpCircle, HeadphonesIcon, Star, Tag,
} from 'lucide-react';
import { collection, query, where, limit, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useWidget } from '@/contexts/WidgetContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const m = Math.floor((Date.now() - d) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  const days = Math.floor(m / 1440);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
}

function fullDate(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Extract lead data from either leadData.data or leadData directly
function extractLead(conv) {
  const ld = conv.leadData || conv.lead || {};
  return ld.data || ld;
}

function extractType(conv) {
  const ld = conv.leadData || {};
  return (ld.type || conv.intent || conv.type || '').toLowerCase();
}

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',      label: 'All',       icon: MessageSquare, color: '#5B5FFF' },
  { id: 'booking',  label: 'Bookings',  icon: Calendar,      color: '#10B981' },
  { id: 'lead',     label: 'Leads',     icon: Star,          color: '#F59E0B' },
  { id: 'enquiry',  label: 'Enquiries', icon: HelpCircle,    color: '#6366F1' },
  { id: 'support',  label: 'Support',   icon: HeadphonesIcon, color: '#EF4444' },
];

const TYPE_META = {
  booking:  { label: 'Booking',  color: '#10B981', bg: 'rgba(16,185,129,0.1)',  icon: Calendar },
  lead:     { label: 'Lead',     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  icon: Star },
  enquiry:  { label: 'Enquiry',  color: '#6366F1', bg: 'rgba(99,102,241,0.1)',  icon: HelpCircle },
  support:  { label: 'Support',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   icon: HeadphonesIcon },
  complaint:{ label: 'Complaint',color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   icon: AlertCircle },
};

const STATUS_META = {
  new:        { label: 'New',         color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)',  icon: AlertCircle },
  actioned:   { label: 'Actioned',    color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
  follow_up:  { label: 'Follow up',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock },
};

// ── Conversation list item ────────────────────────────────────────────────────

function ConvoItem({ conv, isSelected, onClick }) {
  const lead = extractLead(conv);
  const type = extractType(conv);
  const typeMeta = TYPE_META[type];
  const status = conv.status || 'new';
  const statusMeta = STATUS_META[status] || STATUS_META.new;
  const lastMsg = conv.messages?.[conv.messages.length - 1]?.content || '';
  const initial = lead.name ? lead.name[0].toUpperCase() : '?';
  const hasLead = !!(lead.name || lead.email);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all duration-150 border-b"
      style={{
        background: isSelected ? 'rgba(91,95,255,0.06)' : 'transparent',
        borderColor: 'rgba(0,0,0,0.05)',
        borderLeft: `2px solid ${isSelected ? '#5B5FFF' : 'transparent'}`,
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(91,95,255,0.03)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
        style={{
          background: hasLead
            ? `linear-gradient(135deg, ${typeMeta?.color || '#5B5FFF'}, #7C3AED)`
            : 'linear-gradient(135deg, #E2E8F0, #CBD5E1)',
          color: hasLead ? 'white' : '#94A3B8',
        }}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-semibold truncate" style={{ color: '#0A0F1E' }}>
            {lead.name || 'Anonymous visitor'}
          </span>
          <span className="text-[11px] flex-shrink-0" style={{ color: '#CBD5E1' }}>
            {timeAgo(conv.updatedAt || conv.createdAt)}
          </span>
        </div>
        {lead.email && (
          <p className="text-xs truncate mb-1" style={{ color: '#94A3B8' }}>{lead.email}</p>
        )}
        {!lead.email && lastMsg && (
          <p className="text-xs truncate mb-1" style={{ color: '#94A3B8' }}>{lastMsg}</p>
        )}
        <div className="flex items-center gap-1.5 flex-wrap">
          {typeMeta && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: typeMeta.bg, color: typeMeta.color }}>
              {typeMeta.label}
            </span>
          )}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: statusMeta.bg, color: statusMeta.color }}>
            {statusMeta.label}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Lead data card ────────────────────────────────────────────────────────────

function LeadCard({ conv }) {
  const lead = extractLead(conv);
  const type = extractType(conv);
  const typeMeta = TYPE_META[type];

  const fields = [
    lead.name        && { icon: UserIcon,    label: 'Name',        value: lead.name },
    lead.email       && { icon: Mail,        label: 'Email',       value: lead.email, href: `mailto:${lead.email}` },
    lead.phone       && { icon: Phone,       label: 'Phone',       value: lead.phone, href: `tel:${lead.phone}` },
    lead.company     && { icon: Building2,   label: 'Company',     value: lead.company },
    lead.requestType && { icon: Briefcase,   label: 'Type',        value: lead.requestType },
    lead.date        && { icon: Calendar,    label: 'Date',        value: lead.date },
    lead.budget      && { icon: DollarSign,  label: 'Budget',      value: lead.budget },
    lead.details     && { icon: Tag,         label: 'Details',     value: lead.details },
  ].filter(Boolean);

  if (fields.length === 0) return null;

  return (
    <div className="mx-4 mt-4 mb-2 rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${typeMeta?.color || '#5B5FFF'}22`, background: `${typeMeta?.color || '#5B5FFF'}06` }}>
      <div className="flex items-center gap-2 px-4 py-2.5"
        style={{ background: `${typeMeta?.color || '#5B5FFF'}10`, borderBottom: `1px solid ${typeMeta?.color || '#5B5FFF'}18` }}>
        {typeMeta && <typeMeta.icon size={13} style={{ color: typeMeta.color }} />}
        <span className="text-[11px] font-black tracking-widest uppercase" style={{ color: typeMeta?.color || '#5B5FFF' }}>
          {typeMeta?.label || 'Captured'} details
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-3">
        {fields.map(({ icon: Icon, label, value, href }) => (
          <div key={label} className={label === 'Details' ? 'col-span-2' : ''}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#94A3B8' }}>{label}</p>
            {href ? (
              <a href={href} className="text-xs font-semibold underline" style={{ color: typeMeta?.color || '#5B5FFF' }}>
                {value}
              </a>
            ) : (
              <p className="text-xs font-semibold" style={{ color: '#0A0F1E' }}>{value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Action buttons ────────────────────────────────────────────────────────────

function ActionBar({ conv, onStatusChange }) {
  const lead = extractLead(conv);
  const status = conv.status || 'new';
  const [saving, setSaving] = useState(false);

  const setStatus = async (newStatus) => {
    setSaving(true);
    try {
      await updateDoc(doc(firestore, 'widget_conversations', conv.id), {
        status: newStatus,
        statusUpdatedAt: serverTimestamp(),
      });
      onStatusChange?.(newStatus);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0 flex-wrap"
      style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.95)' }}>
      {status !== 'actioned' && (
        <button
          onClick={() => setStatus('actioned')}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80 disabled:opacity-40"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
          <CheckCircle2 size={12} />
          Mark actioned
        </button>
      )}
      {status !== 'follow_up' && (
        <button
          onClick={() => setStatus('follow_up')}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80 disabled:opacity-40"
          style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
          <Clock size={12} />
          Follow up
        </button>
      )}
      {status !== 'new' && (
        <button
          onClick={() => setStatus('new')}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80 disabled:opacity-40"
          style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
          <AlertCircle size={12} />
          Reopen
        </button>
      )}
      {lead.email && (
        <a
          href={`mailto:${lead.email}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80 ml-auto"
          style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
          <Mail size={12} />
          Email {lead.name?.split(' ')[0] || 'visitor'}
        </a>
      )}
    </div>
  );
}

// ── Conversation detail ───────────────────────────────────────────────────────

function ConvoDetail({ conv, onBack, onStatusChange }) {
  const lead = extractLead(conv);
  const type = extractType(conv);
  const typeMeta = TYPE_META[type];
  const status = conv.status || 'new';
  const statusMeta = STATUS_META[status] || STATUS_META.new;
  const messages = conv.messages || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={onBack}
          className="p-1.5 rounded-lg -ml-1 transition-colors md:hidden"
          style={{ color: '#94A3B8' }}>
          <ArrowLeft size={16} />
        </button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: lead.name
              ? `linear-gradient(135deg, ${typeMeta?.color || '#5B5FFF'}, #7C3AED)`
              : 'linear-gradient(135deg, #E2E8F0, #CBD5E1)',
            color: lead.name ? 'white' : '#94A3B8',
          }}>
          {lead.name ? lead.name[0].toUpperCase() : '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold" style={{ color: '#0A0F1E' }}>
              {lead.name || 'Anonymous visitor'}
            </p>
            {typeMeta && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: typeMeta.bg, color: typeMeta.color }}>
                {typeMeta.label}
              </span>
            )}
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: statusMeta.bg, color: statusMeta.color }}>
              {statusMeta.label}
            </span>
          </div>
          <p className="text-[11px]" style={{ color: '#94A3B8' }}>{fullDate(conv.createdAt)}</p>
        </div>
      </div>

      {/* Lead card */}
      <div className="flex-shrink-0 overflow-y-auto" style={{ maxHeight: '45%' }}>
        <LeadCard conv={conv} />
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0"
        style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#CBD5E1' }}>Conversation transcript</p>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare size={20} strokeWidth={1.5} style={{ color: '#E2E8F0' }} />
            <p className="text-xs mt-2" style={{ color: '#CBD5E1' }}>No transcript available</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isBot = msg.role === 'assistant' || msg.sender === 'bot' || msg.sender === 'assistant';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}
              >
                {isBot && (
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                    <div className="w-2 h-2 rounded-full bg-white/90" />
                  </div>
                )}
                <div className="max-w-[78%]">
                  <div className="px-3.5 py-2 text-xs leading-relaxed"
                    style={{
                      background: isBot ? 'white' : '#5B5FFF',
                      color: isBot ? '#374151' : 'white',
                      borderRadius: isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      boxShadow: isBot ? '0 1px 6px rgba(0,0,0,0.06)' : '0 2px 10px rgba(91,95,255,0.3)',
                      border: isBot ? '1px solid rgba(0,0,0,0.06)' : 'none',
                    }}>
                    {msg.content || msg.text}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Actions */}
      <ActionBar conv={conv} onStatusChange={onStatusChange} />
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function WidgetConversations() {
  const { user } = useAuth();
  const { widgets } = useWidget();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!user?.uid || widgets.length === 0) return;
    const widgetIds = widgets.map(w => w.id);
    const q = query(
      collection(firestore, 'widget_conversations'),
      where('widgetId', 'in', widgetIds),
      limit(200),
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
  }, [user?.uid, widgets]);

  // Category counts
  const counts = CATEGORIES.reduce((acc, cat) => {
    if (cat.id === 'all') { acc[cat.id] = conversations.length; return acc; }
    acc[cat.id] = conversations.filter(c => extractType(c) === cat.id).length;
    return acc;
  }, {});

  const filtered = conversations.filter(c => {
    if (category !== 'all' && extractType(c) !== category) return false;
    if (search) {
      const lead = extractLead(c);
      const q = search.toLowerCase();
      if (
        !lead.name?.toLowerCase().includes(q) &&
        !lead.email?.toLowerCase().includes(q) &&
        !lead.company?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const selectedConv = selectedId ? conversations.find(c => c.id === selectedId) : null;
  const showDetail = !!selectedConv;

  const handleStatusChange = (newStatus) => {
    // Update local state optimistically
    setConversations(prev =>
      prev.map(c => c.id === selectedId ? { ...c, status: newStatus } : c)
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Category tabs */}
      <div className="flex-shrink-0 flex items-center gap-1 px-4 pt-4 pb-0 overflow-x-auto"
        style={{ background: 'rgba(255,255,255,0.97)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = category === cat.id;
          const count = counts[cat.id] || 0;
          return (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setSelectedId(null); }}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-all relative"
              style={{ color: isActive ? cat.color : '#94A3B8' }}>
              <Icon size={12} />
              {cat.label}
              {count > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? `${cat.color}18` : 'rgba(0,0,0,0.05)',
                    color: isActive ? cat.color : '#94A3B8',
                  }}>
                  {count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="cat-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: cat.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* List panel */}
        <div
          className={`flex flex-col overflow-hidden ${showDetail ? 'hidden md:flex' : 'flex'}`}
          style={{
            width: showDetail ? '38%' : '100%',
            minWidth: showDetail ? 260 : 'auto',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            background: 'rgba(255,255,255,0.97)',
          }}
        >
          {/* Search */}
          <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search name, email, company…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-2 rounded-xl text-[13px] outline-none"
                style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.1)', color: '#0A0F1E' }}
                onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.35)'}
                onBlur={e => e.target.style.borderColor = 'rgba(91,95,255,0.1)'}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Count */}
          <div className="px-4 py-2 flex-shrink-0">
            <p className="text-[11px]" style={{ color: '#94A3B8' }}>
              {filtered.length} conversation{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 rounded-full border-2 border-indigo-100 border-t-indigo-400 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(91,95,255,0.06)' }}>
                  <MessageSquare size={20} strokeWidth={1.5} style={{ color: '#C7D2FE' }} />
                </div>
                <p className="text-sm font-bold mb-1" style={{ color: '#CBD5E1' }}>
                  {search ? 'No results' : `No ${category === 'all' ? '' : category + ' '}conversations yet`}
                </p>
              </div>
            ) : (
              filtered.map(conv => (
                <ConvoItem
                  key={conv.id}
                  conv={conv}
                  isSelected={selectedId === conv.id}
                  onClick={() => setSelectedId(selectedId === conv.id ? null : conv.id)}
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
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col overflow-hidden"
              style={{ background: '#FAFBFF', minWidth: 0 }}
            >
              <ConvoDetail
                conv={selectedConv}
                onBack={() => setSelectedId(null)}
                onStatusChange={handleStatusChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state desktop */}
        {!showDetail && (
          <div className="hidden md:flex flex-1 items-center justify-center" style={{ background: '#FAFBFF' }}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(91,95,255,0.06)' }}>
                <MessageSquare size={22} strokeWidth={1.5} style={{ color: '#C7D2FE' }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#CBD5E1' }}>Select a conversation</p>
              <p className="text-xs" style={{ color: '#E2E8F0' }}>Click any conversation to view details & transcript</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
