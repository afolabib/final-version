import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Settings2, MessageSquare, Copy, Check, Save,
  ToggleLeft, ToggleRight, Globe, Users, Calendar, HelpCircle,
  ShoppingCart, AlertCircle, Loader2, MessageCircle, Clock, Mail, User as UserIcon,
} from 'lucide-react';
import { doc, getDoc, setDoc, collection, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';

// ─── Shared styles ───────────────────────────────────────────────────────────

const glassCard = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(91,95,255,0.10)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(91,95,255,0.15)',
  background: 'rgba(91,95,255,0.02)',
  color: '#1F2937',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#6B7280',
  marginBottom: '6px',
};

const CAPABILITIES = [
  { id: 'bookings',   label: 'Bookings',   icon: Calendar },
  { id: 'enquiries',  label: 'Enquiries',  icon: HelpCircle },
  { id: 'support',    label: 'Support',    icon: Users },
  { id: 'complaints', label: 'Complaints', icon: AlertCircle },
  { id: 'purchases',  label: 'Purchases',  icon: ShoppingCart },
];

const TABS = [
  { id: 'configure',    label: 'Configure',    icon: Settings2 },
  { id: 'embed',        label: 'Embed Code',   icon: Code2 },
  { id: 'conversations',label: 'Conversations',icon: MessageSquare },
];

// ─── Toggle component ────────────────────────────────────────────────────────

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-11 h-6 rounded-full transition-all flex-shrink-0 relative"
      style={{
        background: on ? 'linear-gradient(135deg, #5B5FFF, #6B63FF)' : '#E5E7EB',
        boxShadow: on ? '0 2px 8px rgba(91,95,255,0.30)' : 'none',
      }}
    >
      <span
        className="absolute top-0.5 rounded-full w-5 h-5 bg-white transition-all"
        style={{ left: on ? '22px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
      />
    </button>
  );
}

// ─── Configure Tab ───────────────────────────────────────────────────────────

function ConfigureTab({ config, setConfig, saving, saved, onSave }) {
  const toggleCapability = (id) => {
    setConfig(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(id)
        ? prev.capabilities.filter(c => c !== id)
        : [...prev.capabilities, id],
    }));
  };

  return (
    <motion.div
      key="configure"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Business Name */}
      <div className="rounded-2xl p-6" style={glassCard}>
        <h3 className="text-base font-extrabold mb-4" style={{ color: '#0A0F1E' }}>Widget Identity</h3>

        <div className="mb-4">
          <label style={labelStyle}>Business Name</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g. Acme Corp"
            value={config.businessName}
            onChange={e => setConfig(p => ({ ...p, businessName: e.target.value }))}
            onFocus={e => { e.target.style.borderColor = 'rgba(91,95,255,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(91,95,255,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(91,95,255,0.15)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div className="mb-4">
          <label style={labelStyle}>Greeting Message</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="Hi! How can I help you today?"
            value={config.greeting}
            onChange={e => setConfig(p => ({ ...p, greeting: e.target.value }))}
            onFocus={e => { e.target.style.borderColor = 'rgba(91,95,255,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(91,95,255,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(91,95,255,0.15)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div>
          <label style={labelStyle}>Primary Colour</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.primaryColor}
              onChange={e => setConfig(p => ({ ...p, primaryColor: e.target.value }))}
              style={{
                width: '42px', height: '42px', border: 'none', borderRadius: '10px',
                cursor: 'pointer', padding: '2px', background: 'transparent',
              }}
            />
            <span style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'monospace' }}>{config.primaryColor}</span>
          </div>
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="rounded-2xl p-6" style={glassCard}>
        <h3 className="text-base font-extrabold mb-1" style={{ color: '#0A0F1E' }}>Custom Instructions</h3>
        <p className="text-xs mb-4" style={{ color: '#6B7280' }}>Tell Freemi about your business — hours, products, FAQs, tone, anything important.</p>
        <textarea
          rows={5}
          placeholder="e.g. We are a Sydney-based plumbing company. Our hours are Mon–Fri 8am–6pm. We offer free quotes. Always be warm and professional."
          value={config.customInstructions}
          onChange={e => setConfig(p => ({ ...p, customInstructions: e.target.value }))}
          style={{
            ...inputStyle,
            resize: 'vertical',
            lineHeight: '1.6',
            minHeight: '110px',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(91,95,255,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(91,95,255,0.08)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(91,95,255,0.15)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Capabilities */}
      <div className="rounded-2xl p-6" style={glassCard}>
        <h3 className="text-base font-extrabold mb-1" style={{ color: '#0A0F1E' }}>Capabilities</h3>
        <p className="text-xs mb-4" style={{ color: '#6B7280' }}>Choose what your widget can help visitors with.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CAPABILITIES.map(cap => {
            const active = config.capabilities.includes(cap.id);
            const Icon = cap.icon;
            return (
              <button
                key={cap.id}
                onClick={() => toggleCapability(cap.id)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  border: active ? '1.5px solid rgba(91,95,255,0.40)' : '1.5px solid rgba(0,0,0,0.07)',
                  background: active ? 'rgba(91,95,255,0.08)' : 'rgba(0,0,0,0.01)',
                  color: active ? '#5B5FFF' : '#6B7280',
                }}
              >
                <Icon size={14} />
                {cap.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active toggle + save */}
      <div className="rounded-2xl p-6 flex items-center justify-between" style={glassCard}>
        <div>
          <p className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Widget Status</p>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
            {config.active ? 'Your widget is live and accepting visitors.' : 'Your widget is paused and hidden.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: config.active ? '#10B981' : '#9CA3AF' }}>
            {config.active ? 'Active' : 'Inactive'}
          </span>
          <Toggle on={config.active} onToggle={() => setConfig(p => ({ ...p, active: !p.active }))} />
        </div>
      </div>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
          style={{
            background: saved
              ? 'linear-gradient(135deg, #10B981, #059669)'
              : 'linear-gradient(135deg, #5B5FFF, #6B63FF)',
            boxShadow: saved
              ? '0 4px 16px rgba(16,185,129,0.30)'
              : '0 4px 16px rgba(91,95,255,0.30)',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : saved ? (
            <Check size={15} />
          ) : (
            <Save size={15} />
          )}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Configuration'}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Embed Code Tab ──────────────────────────────────────────────────────────

function EmbedTab({ widgetId }) {
  const [copied, setCopied] = useState(false);
  const snippet = widgetId
    ? `<script src="https://freemi.ai/freemi-widget.js" data-widget-id="${widgetId}"></script>`
    : '<script src="https://freemi.ai/freemi-widget.js" data-widget-id="LOADING…"></script>';

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      key="embed"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Embed snippet */}
      <div className="rounded-2xl p-6" style={glassCard}>
        <h3 className="text-base font-extrabold mb-1" style={{ color: '#0A0F1E' }}>Your Embed Snippet</h3>
        <p className="text-xs mb-5" style={{ color: '#6B7280' }}>
          Paste this before the closing <code style={{ color: '#5B5FFF', fontFamily: 'monospace' }}>&lt;/body&gt;</code> tag on your website.
        </p>

        <div
          className="relative rounded-xl overflow-hidden"
          style={{ background: '#0A0F1E', border: '1px solid rgba(91,95,255,0.20)' }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.30)' }}>HTML</span>
          </div>

          {/* Code */}
          <pre
            className="px-5 py-5 text-xs leading-relaxed overflow-x-auto"
            style={{ color: '#A5B4FC', fontFamily: 'ui-monospace, SFMono-Regular, monospace', margin: 0 }}
          >
            <span style={{ color: 'rgba(255,255,255,0.40)' }}>&lt;</span>
            <span style={{ color: '#93C5FD' }}>script</span>
            {' '}
            <span style={{ color: '#6EE7B7' }}>src</span>
            <span style={{ color: 'rgba(255,255,255,0.40)' }}>=</span>
            <span style={{ color: '#FCA5A5' }}>"https://freemi.ai/freemi-widget.js"</span>
            {' '}
            <span style={{ color: '#6EE7B7' }}>data-widget-id</span>
            <span style={{ color: 'rgba(255,255,255,0.40)' }}>=</span>
            <span style={{ color: '#FCA5A5' }}>"{widgetId || 'LOADING…'}"</span>
            <span style={{ color: 'rgba(255,255,255,0.40)' }}>&gt;&lt;/</span>
            <span style={{ color: '#93C5FD' }}>script</span>
            <span style={{ color: 'rgba(255,255,255,0.40)' }}>&gt;</span>
          </pre>
        </div>

        <div className="flex justify-end mt-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{
              background: copied ? 'rgba(16,185,129,0.10)' : 'rgba(91,95,255,0.08)',
              color: copied ? '#10B981' : '#5B5FFF',
              border: copied ? '1.5px solid rgba(16,185,129,0.30)' : '1.5px solid rgba(91,95,255,0.20)',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Snippet'}
          </motion.button>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-2xl p-6" style={glassCard}>
        <h3 className="text-base font-extrabold mb-3" style={{ color: '#0A0F1E' }}>Installation Steps</h3>
        <ol className="space-y-3">
          {[
            { n: '1', text: 'Copy the snippet above using the button.' },
            { n: '2', text: 'Open your website\'s HTML file or your CMS theme editor.' },
            { n: '3', text: 'Paste the snippet just before the closing </body> tag.' },
            { n: '4', text: 'Save and publish. The widget will appear on every page.' },
          ].map(step => (
            <li key={step.n} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', marginTop: '1px' }}
              >
                {step.n}
              </span>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Live preview info */}
      <div
        className="rounded-2xl p-6"
        style={{ ...glassCard, background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.15)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 4px 12px rgba(91,95,255,0.30)' }}
          >
            <Globe size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: '#0A0F1E' }}>What your visitors will see</p>
            <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
              A floating chat button will appear in the bottom-right corner of every page on your website.
              Visitors can click it to start a conversation with your Freemi AI assistant — powered by the capabilities
              and instructions you configured. Leads captured via the widget are logged automatically in the Conversations tab.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Conversations Tab ───────────────────────────────────────────────────────

function ConversationsTab({ conversations }) {
  if (conversations.length === 0) {
    return (
      <motion.div
        key="conversations"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        <div
          className="rounded-2xl p-12 flex flex-col items-center justify-center text-center"
          style={glassCard}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(91,95,255,0.08)' }}
          >
            <MessageCircle size={26} style={{ color: '#5B5FFF' }} />
          </div>
          <p className="text-base font-extrabold mb-1" style={{ color: '#0A0F1E' }}>No conversations yet</p>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#6B7280' }}>
            Once you embed the widget on your website, visitor conversations will appear here in real time.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="conversations"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      {conversations.map((conv, i) => {
        const startedAt = conv.createdAt?.toDate ? conv.createdAt.toDate() : new Date(conv.createdAt || Date.now());
        const updatedAt = conv.updatedAt?.toDate ? conv.updatedAt.toDate() : null;
        const displayTime = updatedAt || startedAt;
        const relativeTime = formatRelative(displayTime);
        const lead = conv.lead || {};
        const msgCount = conv.messageCount || conv.messages?.length || 0;
        const intentBadge = conv.intent || conv.type || null;

        return (
          <motion.div
            key={conv.id || i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className="rounded-2xl p-5"
            style={glassCard}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(91,95,255,0.09)' }}
                >
                  <MessageCircle size={16} style={{ color: '#5B5FFF' }} />
                </div>
                <div className="min-w-0">
                  {lead.name ? (
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <UserIcon size={11} style={{ color: '#9CA3AF' }} />
                      <p className="text-sm font-bold truncate" style={{ color: '#0A0F1E' }}>{lead.name}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-bold mb-0.5" style={{ color: '#9CA3AF' }}>Anonymous visitor</p>
                  )}
                  {lead.email && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <Mail size={11} style={{ color: '#9CA3AF' }} />
                      <p className="text-xs truncate" style={{ color: '#6B7280' }}>{lead.email}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span
                      className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(91,95,255,0.07)', color: '#5B5FFF' }}
                    >
                      <MessageSquare size={9} />
                      {msgCount} {msgCount === 1 ? 'message' : 'messages'}
                    </span>
                    {intentBadge && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: 'rgba(124,58,237,0.07)', color: '#7C3AED' }}
                      >
                        {intentBadge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" style={{ color: '#9CA3AF' }}>
                <Clock size={11} />
                <span className="text-xs whitespace-nowrap">{relativeTime}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function formatRelative(date) {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

// ─── Main View ───────────────────────────────────────────────────────────────

export default function WidgetView() {
  const { user } = useAuth();
  const [tab, setTab] = useState('configure');
  const [config, setConfig] = useState({
    businessName: '',
    greeting: 'Hi! How can I help you today?',
    primaryColor: '#5B5FFF',
    capabilities: ['bookings', 'enquiries', 'support'],
    customInstructions: '',
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [widgetId, setWidgetId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Load config on mount
  useEffect(() => {
    if (!user?.uid) return;

    const uid = user.uid;
    setWidgetId(uid);

    getDoc(doc(firestore, 'widgets', uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setConfig(prev => ({
          ...prev,
          businessName: data.businessName ?? prev.businessName,
          greeting: data.greeting ?? prev.greeting,
          primaryColor: data.primaryColor ?? prev.primaryColor,
          capabilities: data.capabilities ?? prev.capabilities,
          customInstructions: data.customInstructions ?? prev.customInstructions,
          active: data.active ?? prev.active,
        }));
      }
      setLoadingConfig(false);
    }).catch(() => setLoadingConfig(false));

    // Subscribe to conversations
    const q = query(
      collection(firestore, 'widget_conversations'),
      where('widgetId', '==', uid),
      orderBy('updatedAt', 'desc'),
      limit(20),
    );
    const unsub = onSnapshot(q, snap => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await setDoc(
        doc(firestore, 'widgets', user.uid),
        { ...config, userId: user.uid, updatedAt: serverTimestamp() },
        { merge: true },
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8"
      style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}
    >
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>
          FreemiWidget
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Add an AI chat widget to your website and capture leads automatically.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-2xl w-fit"
        style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(91,95,255,0.10)', backdropFilter: 'blur(12px)' }}
      >
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: isActive ? 'rgba(91,95,255,0.10)' : 'transparent',
                color: isActive ? '#5B5FFF' : '#6B7280',
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <Icon size={14} />
              {t.label}
              {t.id === 'conversations' && conversations.length > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(91,95,255,0.12)', color: '#5B5FFF', lineHeight: 1 }}
                >
                  {conversations.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === 'configure' && !loadingConfig && (
          <ConfigureTab
            key="configure"
            config={config}
            setConfig={setConfig}
            saving={saving}
            saved={saved}
            onSave={handleSave}
          />
        )}
        {tab === 'configure' && loadingConfig && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <Loader2 size={24} className="animate-spin" style={{ color: '#5B5FFF' }} />
          </motion.div>
        )}
        {tab === 'embed' && (
          <EmbedTab key="embed" widgetId={widgetId} />
        )}
        {tab === 'conversations' && (
          <ConversationsTab key="conversations" conversations={conversations} />
        )}
      </AnimatePresence>
    </div>
  );
}
