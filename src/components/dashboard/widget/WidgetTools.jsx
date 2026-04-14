import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Webhook, Mail, FileSpreadsheet, Plus, Trash2,
  CheckCircle2, Copy, ChevronDown, ChevronUp, Zap, Globe,
  MessageSquare, Database, Play, X, AlertCircle, User,
  Phone, Building2, CalendarDays, DollarSign, ChevronRight,
  Tag, Clock, ExternalLink,
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useWidget } from '@/contexts/WidgetContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractLead(conv) {
  const ld = conv.leadData || conv.lead || {};
  return ld.data || ld;
}

function extractType(conv) {
  const ld = conv.leadData || {};
  return (ld.type || conv.intent || conv.type || '').toLowerCase();
}

function toCSV(rows, columns) {
  const header = columns.join(',');
  const lines = rows.map(r =>
    columns.map(col => {
      const val = String(r[col] || '').replace(/"/g, '""');
      return `"${val}"`;
    }).join(',')
  );
  return [header, ...lines].join('\n');
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Export section ────────────────────────────────────────────────────────────

function ExportCard({ title, description, icon: Icon, color, onExport, loading }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: '#0A0F1E' }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{description}</p>
      </div>
      <button
        onClick={onExport}
        disabled={loading}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80 disabled:opacity-40"
        style={{ background: `${color}12`, color }}>
        {loading ? (
          <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <Download size={13} />
        )}
        Export CSV
      </button>
    </div>
  );
}

// ── Webhook tool ──────────────────────────────────────────────────────────────

const TRIGGER_OPTIONS = [
  { id: 'all',      label: 'Every conversation' },
  { id: 'booking',  label: 'Booking captured' },
  { id: 'lead',     label: 'Lead captured' },
  { id: 'enquiry',  label: 'Enquiry received' },
  { id: 'support',  label: 'Support request' },
];

function WebhookForm({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [trigger, setTrigger] = useState('all');

  const valid = name.trim() && url.trim().startsWith('http');

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(91,95,255,0.2)', background: 'rgba(91,95,255,0.03)' }}>
      <div className="px-5 py-3.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.1)', background: 'rgba(91,95,255,0.06)' }}>
        <span className="text-sm font-bold" style={{ color: '#5B5FFF' }}>New webhook</span>
        <button onClick={onCancel} style={{ color: '#94A3B8' }}><X size={14} /></button>
      </div>
      <div className="px-5 py-4 space-y-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#94A3B8' }}>Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Notify team on booking"
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: '1px solid rgba(91,95,255,0.15)', background: 'white', color: '#0A0F1E' }}
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#94A3B8' }}>Webhook URL</label>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://hooks.zapier.com/..."
            className="w-full px-3 py-2 rounded-xl text-sm outline-none font-mono"
            style={{ border: '1px solid rgba(91,95,255,0.15)', background: 'white', color: '#0A0F1E' }}
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#94A3B8' }}>Trigger</label>
          <select
            value={trigger}
            onChange={e => setTrigger(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: '1px solid rgba(91,95,255,0.15)', background: 'white', color: '#0A0F1E' }}>
            {TRIGGER_OPTIONS.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => valid && onSave({ name, url, trigger })}
            disabled={!valid}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: '#5B5FFF', color: 'white' }}>
            Save webhook
          </button>
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(0,0,0,0.05)', color: '#64748B' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function WebhookRow({ tool, onDelete, onTest }) {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await fetch(tool.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          test: true,
          source: 'freemi',
          trigger: tool.trigger,
          timestamp: new Date().toISOString(),
          sample: { name: 'Test User', email: 'test@example.com', type: tool.trigger },
        }),
      });
      setTestResult('sent');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(tool.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 px-5 py-3.5"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(91,95,255,0.08)' }}>
        <Webhook size={14} style={{ color: '#5B5FFF' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: '#0A0F1E' }}>{tool.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-[11px] truncate font-mono" style={{ color: '#94A3B8', maxWidth: 200 }}>{tool.url}</p>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
            {TRIGGER_OPTIONS.find(t => t.id === tool.trigger)?.label || tool.trigger}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {testResult === 'sent' && <CheckCircle2 size={13} style={{ color: '#10B981' }} />}
        {testResult === 'error' && <AlertCircle size={13} style={{ color: '#EF4444' }} />}
        <button onClick={handleTest} disabled={testing}
          className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
          style={{ color: '#5B5FFF' }}
          title="Send test payload">
          {testing ? <div className="w-3 h-3 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" /> : <Play size={13} />}
        </button>
        <button onClick={copyUrl}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: copied ? '#10B981' : '#94A3B8' }}
          title="Copy URL">
          {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
        </button>
        <button onClick={() => onDelete(tool.id)}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: '#EF4444' }}
          title="Delete">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Lead drawer ───────────────────────────────────────────────────────────────

const TYPE_COLORS = {
  booking:  { bg: '#FEF3C7', text: '#D97706' },
  lead:     { bg: '#DCFCE7', text: '#16A34A' },
  enquiry:  { bg: '#EDE9FE', text: '#7C3AED' },
  support:  { bg: '#FEE2E2', text: '#DC2626' },
};

function TypeBadge({ type }) {
  const c = TYPE_COLORS[type?.toLowerCase()] || { bg: 'rgba(91,95,255,0.08)', text: '#5B5FFF' };
  return (
    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text }}>
      {type || 'conversation'}
    </span>
  );
}

function StatusDot({ status }) {
  const map = { new: '#5B5FFF', follow_up: '#F59E0B', actioned: '#10B981' };
  const label = { new: 'New', follow_up: 'Follow up', actioned: 'Actioned' };
  const color = map[status] || map.new;
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold"
      style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
      {label[status] || 'New'}
    </span>
  );
}

function LeadDrawer({ lead, conv, onClose }) {
  if (!lead && !conv) return null;
  const type = extractType(conv);
  const ts = conv?.createdAt?.toDate ? conv.createdAt.toDate() : new Date(conv?.createdAt || 0);

  const fields = [
    { icon: User,         label: 'Name',         value: lead.name },
    { icon: Mail,         label: 'Email',         value: lead.email },
    { icon: Phone,        label: 'Phone',         value: lead.phone },
    { icon: Building2,    label: 'Company',       value: lead.company },
    { icon: Tag,          label: 'Request type',  value: lead.requestType },
    { icon: CalendarDays, label: 'Date requested',value: lead.date },
    { icon: DollarSign,   label: 'Budget',        value: lead.budget },
  ].filter(f => f.value);

  const details = lead.details || lead.message || lead.notes;
  const messages = conv?.messages || [];

  return (
    <motion.div
      key="drawer-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(10,15,30,0.35)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md h-full overflow-y-auto flex flex-col"
        style={{ background: '#FAFBFF', boxShadow: '-8px 0 40px rgba(91,95,255,0.12)' }}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'white' }}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <TypeBadge type={type} />
              <StatusDot status={conv?.status} />
            </div>
            <h2 className="text-lg font-black" style={{ color: '#0A0F1E' }}>
              {lead.name || lead.email || 'Anonymous'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock size={11} style={{ color: '#94A3B8' }} />
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                {ts.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}
                {ts.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={16} />
          </button>
        </div>

        {/* Lead fields */}
        {fields.length > 0 && (
          <div className="mx-6 mt-5 rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="px-4 py-2.5 flex items-center gap-2"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: 'rgba(91,95,255,0.03)' }}>
              <Database size={12} style={{ color: '#5B5FFF' }} />
              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#5B5FFF' }}>Contact info</span>
            </div>
            {fields.map((f, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3"
                style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(91,95,255,0.07)' }}>
                  <f.icon size={11} style={{ color: '#5B5FFF' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#CBD5E1' }}>{f.label}</p>
                  <p className="text-sm font-semibold break-all" style={{ color: '#0A0F1E' }}>{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details / notes */}
        {details && (
          <div className="mx-6 mt-4 rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="px-4 py-2.5"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: 'rgba(91,95,255,0.03)' }}>
              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#5B5FFF' }}>Details</span>
            </div>
            <p className="px-4 py-3 text-sm leading-relaxed" style={{ color: '#374151' }}>{details}</p>
          </div>
        )}

        {/* Conversation transcript */}
        {messages.length > 0 && (
          <div className="mx-6 mt-4 mb-6 rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="px-4 py-2.5"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: 'rgba(91,95,255,0.03)' }}>
              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#5B5FFF' }}>
                Conversation ({messages.length} messages)
              </span>
            </div>
            <div className="px-4 py-3 space-y-3 max-h-64 overflow-y-auto">
              {messages.map((msg, i) => {
                const isBot = msg.role === 'assistant' || msg.sender === 'bot';
                return (
                  <div key={i} className={`flex gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: isBot ? 'rgba(91,95,255,0.12)' : 'rgba(16,185,129,0.12)' }}>
                      <span className="text-[9px] font-black" style={{ color: isBot ? '#5B5FFF' : '#10B981' }}>
                        {isBot ? 'AI' : 'U'}
                      </span>
                    </div>
                    <div className="flex-1 max-w-[85%]">
                      <p className="text-[12px] leading-relaxed px-3 py-2 rounded-xl"
                        style={{
                          background: isBot ? 'rgba(91,95,255,0.06)' : 'rgba(16,185,129,0.06)',
                          color: '#374151',
                        }}>
                        {msg.content || msg.text || msg.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Email action */}
        {lead.email && (
          <div className="px-6 pb-6 flex-shrink-0">
            <a href={`mailto:${lead.email}`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-80"
              style={{ background: '#5B5FFF', color: 'white' }}>
              <Mail size={14} />
              Send email to {lead.name || lead.email}
            </a>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Leads database section ────────────────────────────────────────────────────

function LeadRow({ conv, onClick }) {
  const lead = extractLead(conv);
  const type = extractType(conv);
  const ts = conv.createdAt?.toDate ? conv.createdAt.toDate() : new Date(conv.createdAt || 0);
  const hasContact = lead.email || lead.phone;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all group"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(91,95,255,0.15), rgba(124,58,237,0.15))', color: '#5B5FFF' }}>
        {(lead.name || lead.email || '?')[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold truncate" style={{ color: '#0A0F1E' }}>
            {lead.name || lead.email || 'Anonymous visitor'}
          </p>
          <TypeBadge type={type} />
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {lead.email && <p className="text-[11px] truncate" style={{ color: '#94A3B8' }}>{lead.email}</p>}
          {lead.phone && !lead.email && <p className="text-[11px] truncate" style={{ color: '#94A3B8' }}>{lead.phone}</p>}
          {!hasContact && <p className="text-[11px]" style={{ color: '#CBD5E1' }}>No contact info</p>}
        </div>
      </div>

      {/* Date + arrow */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-[11px]" style={{ color: '#CBD5E1' }}>
          {ts.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
        </p>
        <ChevronRight size={13} style={{ color: '#CBD5E1' }}
          className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}

function LeadsDatabase({ conversations }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedConv, setSelectedConv] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const allLeads = conversations.filter(c => {
    const lead = extractLead(c);
    return lead.email || lead.name || lead.phone;
  });

  const filtered = allLeads.filter(c => {
    const lead = extractLead(c);
    const matchSearch = !search || [lead.name, lead.email, lead.phone, lead.company]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchType = filterType === 'all' || extractType(c) === filterType;
    return matchSearch && matchType;
  });

  const typeCount = (t) => allLeads.filter(c => extractType(c) === t).length;

  return (
    <section>
      {/* Section header */}
      <button
        className="w-full flex items-center justify-between mb-4"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="text-left">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-black" style={{ color: '#0A0F1E' }}>Leads database</h2>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF' }}>
              {allLeads.length}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>All captured contacts — click any row to open full details.</p>
        </div>
        <div className="p-1.5 rounded-lg" style={{ color: '#94A3B8' }}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {expanded && (
        <>
          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="flex-1 min-w-[180px] px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: '1px solid rgba(91,95,255,0.12)', background: 'white', color: '#0A0F1E' }}
            />
            {['all', 'booking', 'lead', 'enquiry', 'support'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: filterType === t ? '#5B5FFF' : 'white',
                  color: filterType === t ? 'white' : '#94A3B8',
                  border: `1px solid ${filterType === t ? '#5B5FFF' : 'rgba(0,0,0,0.08)'}`,
                }}>
                {t === 'all' ? `All (${allLeads.length})` : `${t[0].toUpperCase() + t.slice(1)} (${typeCount(t)})`}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(91,95,255,0.06)' }}>
                  <User size={20} strokeWidth={1.5} style={{ color: '#C7D2FE' }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#CBD5E1' }}>
                  {search || filterType !== 'all' ? 'No matches found' : 'No leads yet'}
                </p>
                <p className="text-xs" style={{ color: '#E2E8F0' }}>
                  {search || filterType !== 'all' ? 'Try a different search or filter.' : 'When Sally captures a name or contact, they\'ll appear here.'}
                </p>
              </div>
            ) : (
              filtered.map(conv => (
                <LeadRow
                  key={conv.id}
                  conv={conv}
                  onClick={() => setSelectedConv(conv)}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {selectedConv && (
          <LeadDrawer
            conv={selectedConv}
            lead={extractLead(selectedConv)}
            onClose={() => setSelectedConv(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function WidgetTools() {
  const { user } = useAuth();
  const { widgets } = useWidget();
  const [conversations, setConversations] = useState([]);
  const [tools, setTools] = useState([]);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [exporting, setExporting] = useState({});
  const [toast, setToast] = useState(null);

  // Load conversations
  useEffect(() => {
    if (!user?.uid || widgets.length === 0) return;
    const widgetIds = widgets.map(w => w.id);
    const q = query(
      collection(firestore, 'widget_conversations'),
      where('widgetId', 'in', widgetIds)
    );
    getDocs(q).then(snap => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user?.uid, widgets]);

  // Load tools
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(firestore, 'widget_tools'), where('ownerId', '==', user.uid));
    getDocs(q).then(snap => {
      setTools(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user?.uid]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Exports ──────────────────────────────────────────────────────────────

  const exportAll = async () => {
    setExporting(e => ({ ...e, all: true }));
    const rows = conversations.map(c => {
      const lead = extractLead(c);
      const ts = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt || 0);
      return {
        date: ts.toLocaleDateString('en-IE'),
        type: extractType(c) || '',
        status: c.status || 'new',
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        request: lead.requestType || '',
        date_requested: lead.date || '',
        budget: lead.budget || '',
        details: lead.details || '',
        messages: (c.messages || []).length,
        widget: c.widgetId || '',
      };
    });
    const csv = toCSV(rows, ['date','type','status','name','email','phone','company','request','date_requested','budget','details','messages','widget']);
    downloadCSV(csv, `freemi-conversations-${new Date().toISOString().slice(0,10)}.csv`);
    setExporting(e => ({ ...e, all: false }));
    showToast(`Exported ${rows.length} conversations`);
  };

  const exportLeads = async () => {
    setExporting(e => ({ ...e, leads: true }));
    const leads = conversations.filter(c => {
      const lead = extractLead(c);
      return lead.email || lead.name;
    });
    const rows = leads.map(c => {
      const lead = extractLead(c);
      const ts = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt || 0);
      return {
        date: ts.toLocaleDateString('en-IE'),
        type: extractType(c) || '',
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        request: lead.requestType || '',
        date_requested: lead.date || '',
        budget: lead.budget || '',
        details: lead.details || '',
      };
    });
    const csv = toCSV(rows, ['date','type','name','email','phone','company','request','date_requested','budget','details']);
    downloadCSV(csv, `freemi-leads-${new Date().toISOString().slice(0,10)}.csv`);
    setExporting(e => ({ ...e, leads: false }));
    showToast(`Exported ${rows.length} leads`);
  };

  const exportBookings = async () => {
    setExporting(e => ({ ...e, bookings: true }));
    const bookings = conversations.filter(c => extractType(c) === 'booking');
    const rows = bookings.map(c => {
      const lead = extractLead(c);
      const ts = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt || 0);
      return {
        date_received: ts.toLocaleDateString('en-IE'),
        status: c.status || 'new',
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        request_type: lead.requestType || '',
        event_date: lead.date || '',
        budget: lead.budget || '',
        details: lead.details || '',
      };
    });
    const csv = toCSV(rows, ['date_received','status','name','email','phone','company','request_type','event_date','budget','details']);
    downloadCSV(csv, `freemi-bookings-${new Date().toISOString().slice(0,10)}.csv`);
    setExporting(e => ({ ...e, bookings: false }));
    showToast(`Exported ${rows.length} bookings`);
  };

  // ── Webhooks ─────────────────────────────────────────────────────────────

  const saveTool = async ({ name, url, trigger }) => {
    const ref = await addDoc(collection(firestore, 'widget_tools'), {
      ownerId: user.uid,
      type: 'webhook',
      name, url, trigger,
      active: true,
      createdAt: serverTimestamp(),
    });
    setTools(prev => [...prev, { id: ref.id, type: 'webhook', name, url, trigger, active: true }]);
    setShowWebhookForm(false);
    showToast('Webhook saved');
  };

  const deleteTool = async (id) => {
    await deleteDoc(doc(firestore, 'widget_tools', id));
    setTools(prev => prev.filter(t => t.id !== id));
    showToast('Webhook deleted');
  };

  const leadCount = conversations.filter(c => { const l = extractLead(c); return l.email || l.name; }).length;
  const bookingCount = conversations.filter(c => extractType(c) === 'booking').length;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8" style={{ background: '#FAFBFF' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold shadow-lg"
            style={{ background: '#0A0F1E', color: 'white' }}>
            <CheckCircle2 size={14} style={{ color: '#10B981' }} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leads database */}
      <LeadsDatabase conversations={conversations} />

      {/* Exports */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-black" style={{ color: '#0A0F1E' }}>Export data</h2>
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Download your captured data as CSV — open in Excel, Google Sheets, or import to your CRM.</p>
        </div>
        <div className="space-y-3">
          <ExportCard
            title={`All conversations (${conversations.length})`}
            description="Full export — every conversation with lead data, type, status, and transcript length"
            icon={Database}
            color="#5B5FFF"
            onExport={exportAll}
            loading={exporting.all}
          />
          <ExportCard
            title={`Leads & contacts (${leadCount})`}
            description="Only conversations where a name or email was captured — ready for your CRM"
            icon={Mail}
            color="#10B981"
            onExport={exportLeads}
            loading={exporting.leads}
          />
          <ExportCard
            title={`Booking requests (${bookingCount})`}
            description="All booking enquiries with event details, dates, and budgets"
            icon={FileSpreadsheet}
            color="#F59E0B"
            onExport={exportBookings}
            loading={exporting.bookings}
          />
        </div>
      </section>

      {/* Webhooks / Tools */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black" style={{ color: '#0A0F1E' }}>Webhooks & automations</h2>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Send conversation data to Zapier, Make, Slack, your CRM — automatically when Sally captures a lead.</p>
          </div>
          {!showWebhookForm && (
            <button
              onClick={() => setShowWebhookForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
              style={{ background: '#5B5FFF', color: 'white' }}>
              <Plus size={13} />
              Add webhook
            </button>
          )}
        </div>

        {showWebhookForm && (
          <div className="mb-4">
            <WebhookForm onSave={saveTool} onCancel={() => setShowWebhookForm(false)} />
          </div>
        )}

        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          {tools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(91,95,255,0.06)' }}>
                <Webhook size={20} strokeWidth={1.5} style={{ color: '#C7D2FE' }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#CBD5E1' }}>No webhooks yet</p>
              <p className="text-xs" style={{ color: '#E2E8F0' }}>Add a webhook to push lead data to Zapier, Slack, or your CRM the moment Sally captures it.</p>
            </div>
          ) : (
            tools.map(tool => (
              <WebhookRow key={tool.id} tool={tool} onDelete={deleteTool} />
            ))
          )}
        </div>

        {/* Popular integrations hint */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <p className="text-[11px] font-semibold" style={{ color: '#CBD5E1' }}>Works with:</p>
          {['Zapier', 'Make', 'Slack', 'HubSpot', 'Mailchimp', 'Notion'].map(name => (
            <span key={name} className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(91,95,255,0.06)', color: '#94A3B8' }}>
              {name}
            </span>
          ))}
        </div>
      </section>

    </div>
  );
}
