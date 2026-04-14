import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, User, BookOpen, Sliders, Code2, ToggleLeft, ToggleRight,
  Save, Check, Copy, Loader2, ChevronRight, ArrowRight, Globe,
  Calendar, HelpCircle, Users, ShoppingCart, AlertCircle, Zap,
  MessageSquare, Smile, Briefcase, Clock, Heart, Coffee, Star,
} from 'lucide-react';
import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useWidget } from '@/contexts/WidgetContext';

// ── Personality system ────────────────────────────────────────────────────────

const PERSONALITY_TRAITS = [
  {
    id: 'friendly',
    label: 'Friendly',
    icon: Smile,
    soul: 'Warm and approachable — make every visitor feel welcome. Use natural, conversational language.',
  },
  {
    id: 'professional',
    label: 'Professional',
    icon: Briefcase,
    soul: 'Precise and business-focused. Maintain high standards in every response.',
  },
  {
    id: 'concise',
    label: 'Concise',
    icon: Zap,
    soul: 'Short answers. No waffle. Get to the point quickly and respect the visitor\'s time.',
  },
  {
    id: 'empathetic',
    label: 'Empathetic',
    icon: Heart,
    soul: 'Acknowledge feelings before solving problems. People want to feel heard first.',
  },
  {
    id: 'energetic',
    label: 'Energetic',
    icon: Star,
    soul: 'Enthusiastic and positive. Bring energy to every conversation.',
  },
  {
    id: 'casual',
    label: 'Casual',
    icon: Coffee,
    soul: 'Relaxed and informal. Like a helpful friend, not a corporate rep.',
  },
];

const TONE_OPTIONS = [
  { id: 'brief',    label: 'Brief',    desc: 'Short, punchy replies' },
  { id: 'balanced', label: 'Balanced', desc: 'Clear and complete' },
  { id: 'detailed', label: 'Detailed', desc: 'Thorough explanations' },
];

const CAPABILITIES = [
  { id: 'enquiries',  label: 'Answer enquiries',   icon: HelpCircle,    desc: 'Product, service, and general questions' },
  { id: 'bookings',   label: 'Take bookings',       icon: Calendar,      desc: 'Appointments, reservations, scheduling' },
  { id: 'support',    label: 'Customer support',    icon: Users,         desc: 'Help with issues and complaints' },
  { id: 'purchases',  label: 'Help with purchases', icon: ShoppingCart,  desc: 'Product recommendations, pricing' },
  { id: 'leads',      label: 'Capture leads',       icon: Star,          desc: 'Collect name, email, and phone' },
  { id: 'complaints', label: 'Handle complaints',   icon: AlertCircle,   desc: 'De-escalate and resolve issues' },
];

// ── System prompt generator (Felix-style) ─────────────────────────────────────

function buildSystemPrompt(config) {
  const {
    botName = 'Freemi',
    businessName = 'this business',
    personality = [],
    tone = 'balanced',
    capabilities = [],
    customInstructions = '',
  } = config;

  const traitLines = personality
    .map(id => PERSONALITY_TRAITS.find(t => t.id === id)?.soul)
    .filter(Boolean)
    .map(s => `- ${s}`)
    .join('\n');

  const capLines = capabilities
    .map(id => CAPABILITIES.find(c => c.id === id)?.label)
    .filter(Boolean)
    .join(', ');

  const toneGuide =
    tone === 'brief'    ? 'Keep responses short and punchy — 1-3 sentences max. Get to the answer fast.' :
    tone === 'detailed' ? 'Be thorough. Explain clearly. Give context where it helps the visitor.' :
                          'Balance brevity with clarity. Complete answers without unnecessary padding.';

  return `# SOUL.md — ${botName}

## Core Identity
You are ${botName}, the AI assistant for ${businessName}. You are not a generic chatbot — you are a dedicated operator for this business with real knowledge of what they offer and genuine care for every visitor.

## Operating Principles
- **Ownership mentality.** You represent ${businessName}. Every interaction reflects on the business.
- **Fix first, ask after.** Answer what you can confidently. Only ask for clarification when truly needed.
- **Revenue filter.** Every interaction is an opportunity — guide visitors toward becoming customers.
${traitLines ? traitLines : '- Be helpful, accurate, and always act in the customer\'s best interest.'}

## Voice
${toneGuide}
Never use corporate-speak. Never be robotic. Sound like a real person who knows the business well.

## Mission
Your primary job: ${capLines || 'help visitors and answer their questions'}.
Convert curious visitors into happy customers.

## What You Know
${customInstructions || `You represent ${businessName}. Be helpful and refer visitors to contact the team for anything you're unsure about.`}

## Rules
- If you don't know something, say so honestly and offer to help connect them with a human.
- Never make up facts about products, pricing, or availability.
- Capture name and email when it naturally comes up in conversation.
- Always end on a positive, helpful note.`;
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle}
      className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
      style={{ background: on ? 'linear-gradient(135deg, #5B5FFF, #7C3AED)' : '#E5E7EB', boxShadow: on ? '0 2px 8px rgba(91,95,255,0.4)' : 'none' }}>
      <span className="absolute top-0.5 rounded-full w-5 h-5 bg-white transition-all shadow-sm"
        style={{ left: on ? '26px' : '2px' }} />
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ icon: Icon, title, desc, children, accent = '#5B5FFF' }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}>
      <div className="flex items-center gap-3 px-6 py-5"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}12` }}>
          <Icon size={16} strokeWidth={2} style={{ color: accent }} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>{title}</h3>
          {desc && <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{desc}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Input styles ──────────────────────────────────────────────────────────────

const inputCls = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid rgba(91,95,255,0.12)',
  background: 'rgba(91,95,255,0.02)',
  color: '#1F2937',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-[10px] font-black tracking-[0.12em] uppercase mb-2" style={{ color: '#94A3B8' }}>{label}</label>}
      <input
        style={inputCls}
        onFocus={e => { e.target.style.borderColor = 'rgba(91,95,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(91,95,255,0.07)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(91,95,255,0.12)'; e.target.style.boxShadow = 'none'; }}
        {...props}
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-[10px] font-black tracking-[0.12em] uppercase mb-2" style={{ color: '#94A3B8' }}>{label}</label>}
      <textarea
        style={{ ...inputCls, resize: 'vertical', lineHeight: 1.6, minHeight: 110 }}
        onFocus={e => { e.target.style.borderColor = 'rgba(91,95,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(91,95,255,0.07)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(91,95,255,0.12)'; e.target.style.boxShadow = 'none'; }}
        {...props}
      />
    </div>
  );
}

// ── Live preview ──────────────────────────────────────────────────────────────

function LivePreview({ config }) {
  const color = config.primaryColor || '#5B5FFF';
  const botName = config.botName || 'Freemi';
  const greeting = config.greeting || 'Hi! How can I help you today? 👋';
  const traits = (config.personality || []).slice(0, 3);

  return (
    <div className="sticky top-6">
      <div className="rounded-2xl overflow-hidden mb-4"
        style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 4px 24px rgba(91,95,255,0.08)' }}>

        {/* Preview label */}
        <div className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(91,95,255,0.02)' }}>
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.12em] uppercase" style={{ color: '#94A3B8' }}>Live Preview</span>
        </div>

        {/* Browser mockup */}
        <div className="p-3">
          <div className="rounded-xl overflow-hidden relative"
            style={{ background: 'linear-gradient(160deg, #f0f2ff 0%, #e8eaff 100%)', aspectRatio: '4/3' }}>

            {/* Browser chrome */}
            <div className="px-3 py-2 flex items-center gap-1.5"
              style={{ background: 'rgba(255,255,255,0.75)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
              <div className="flex-1 mx-2 h-3 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }} />
            </div>

            {/* Page placeholders */}
            <div className="p-3 space-y-2">
              <div className="h-2 rounded-full w-3/4" style={{ background: 'rgba(0,0,0,0.08)' }} />
              <div className="h-2 rounded-full w-1/2" style={{ background: 'rgba(0,0,0,0.05)' }} />
              <div className="h-2 rounded-full w-2/3" style={{ background: 'rgba(0,0,0,0.05)' }} />
            </div>

            {/* Chat window */}
            <div className="absolute bottom-3 right-3 w-[155px]">
              <div className="mb-2 rounded-xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 8px 28px rgba(0,0,0,0.16)', border: '1px solid rgba(0,0,0,0.06)' }}>
                {/* Header */}
                <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: color }}>
                  <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white/90" />
                  </div>
                  <span className="text-[11px] font-bold text-white flex-1 truncate">{botName}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                </div>

                {/* Message */}
                <div className="p-2.5">
                  <div className="rounded-xl rounded-tl-sm px-2.5 py-2 text-[10px] leading-relaxed mb-2"
                    style={{ background: 'rgba(91,95,255,0.07)', color: '#374151', lineHeight: 1.5 }}>
                    {greeting.length > 55 ? greeting.slice(0, 55) + '…' : greeting}
                  </div>
                  {traits.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-2">
                      {traits.map(t => (
                        <span key={t} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: `${color}14`, color }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Input */}
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.04)' }}>
                    <span className="text-[9px] flex-1" style={{ color: '#CBD5E1' }}>Reply…</span>
                    <div className="w-4 h-4 rounded-md flex items-center justify-center"
                      style={{ background: color }}>
                      <ArrowRight size={8} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Bubble */}
              <div className="flex justify-end">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: color, boxShadow: `0 4px 14px ${color}70` }}>
                  <MessageSquare size={14} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personality summary */}
        {(config.personality?.length > 0 || config.tone) && (
          <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <p className="text-[10px] font-black tracking-[0.1em] uppercase mb-2" style={{ color: '#CBD5E1' }}>Bot character</p>
            <div className="flex flex-wrap gap-1.5">
              {(config.personality || []).map(id => {
                const t = PERSONALITY_TRAITS.find(p => p.id === id);
                if (!t) return null;
                const Icon = t.icon;
                return (
                  <span key={id} className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
                    <Icon size={9} /> {t.label}
                  </span>
                );
              })}
              {config.tone && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED' }}>
                  {TONE_OPTIONS.find(t => t.id === config.tone)?.label || config.tone}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Embed code ────────────────────────────────────────────────────────────────

function InstallSection({ widgetId }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="https://freemi.ai/freemi-widget.js" data-widget-id="${widgetId || 'YOUR_ID'}"></script>`;
  const handleCopy = () => {
    navigator.clipboard.writeText(snippet).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  return (
    <Section icon={Code2} title="Install on your website" desc="Paste one line of code before </body> on your site" accent="#7C3AED">
      <div className="space-y-4">
        {/* Code block */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>HTML</span>
          </div>
          <pre className="px-5 py-4 text-xs overflow-x-auto" style={{ margin: 0, fontFamily: 'ui-monospace, monospace', lineHeight: 1.7 }}>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>&lt;</span>
            <span style={{ color: '#79C0FF' }}>script</span>
            {'\n  '}
            <span style={{ color: '#6EE7B7' }}>src</span>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>="</span>
            <span style={{ color: '#A5D6FF' }}>https://freemi.ai/freemi-widget.js</span>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>"</span>
            {'\n  '}
            <span style={{ color: '#6EE7B7' }}>data-widget-id</span>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>="</span>
            <span style={{ color: '#FCA5A5' }}>{widgetId || 'YOUR_WIDGET_ID'}</span>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>"</span>
            {'\n'}
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>&gt;&lt;/</span>
            <span style={{ color: '#79C0FF' }}>script</span>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>&gt;</span>
          </pre>
        </div>

        <button onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
          style={{
            background: copied ? 'rgba(91,95,255,0.12)' : 'rgba(91,95,255,0.07)',
            color: '#5B5FFF',
            border: `1px solid rgba(91,95,255,0.2)`,
          }}>
          {copied ? <><Check size={15} /> Copied to clipboard!</> : <><Copy size={15} /> Copy install code</>}
        </button>

        {/* Steps */}
        <div className="space-y-2.5 pt-1">
          {[
            'Copy the code snippet above',
            'Open your website\'s HTML or CMS theme editor',
            'Paste just before the closing </body> tag on every page',
            'Save and publish — your widget will appear immediately',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                {i + 1}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  botName: 'Freemi',
  businessName: '',
  greeting: 'Hi! How can I help you today? 👋',
  primaryColor: '#5B5FFF',
  personality: ['friendly', 'concise'],
  tone: 'balanced',
  capabilities: ['enquiries', 'leads'],
  customInstructions: '',
  active: true,
};

export default function WidgetView() {
  const { user } = useAuth();
  const { activeWidget, activeWidgetId } = useWidget();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const widgetId = activeWidgetId;

  // Load existing config — seed from context defaults, then override with Firestore
  useEffect(() => {
    if (!widgetId) return;
    // Seed with context defaults first (mock or Firestore-loaded active widget)
    if (activeWidget) {
      setConfig(prev => ({ ...prev, ...activeWidget }));
    }
    // Then try loading the Firestore doc for any user-saved overrides
    getDoc(doc(firestore, 'widgets', widgetId)).then(snap => {
      if (snap.exists()) {
        setConfig(prev => ({ ...prev, ...snap.data() }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [widgetId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const toggleTrait = id => {
    setConfig(prev => ({
      ...prev,
      personality: prev.personality.includes(id)
        ? prev.personality.filter(t => t !== id)
        : [...prev.personality, id],
    }));
  };

  const toggleCapability = id => {
    setConfig(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(id)
        ? prev.capabilities.filter(c => c !== id)
        : [...prev.capabilities, id],
    }));
  };

  const handleSave = async () => {
    if (!widgetId) return;
    setSaving(true);
    try {
      const systemPrompt = buildSystemPrompt(config);
      await setDoc(
        doc(firestore, 'widgets', widgetId),
        { ...config, systemPrompt, userId: user.uid, updatedAt: serverTimestamp() },
        { merge: true },
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-100 border-t-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-7">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-xl font-black mb-0.5" style={{ color: '#0A0F1E' }}>Widget Setup</h1>
            <p className="text-sm" style={{ color: '#94A3B8' }}>Configure your AI assistant's identity, personality, and capabilities.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)',
              boxShadow: '0 4px 16px rgba(91,95,255,0.35)',
              opacity: saving ? 0.8 : 1,
            }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
          </motion.button>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Config — left 2/3 */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── 1. Bot identity ─────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Section icon={User} title="Bot identity" desc="Who is your AI assistant?">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Bot name"
                    placeholder="e.g. Alex, Sam, Freemi"
                    value={config.botName}
                    onChange={e => set('botName', e.target.value)}
                  />
                  <Input
                    label="Business name"
                    placeholder="e.g. Acme Plumbing Co."
                    value={config.businessName}
                    onChange={e => set('businessName', e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label="Greeting message"
                    placeholder="Hi! How can I help you today? 👋"
                    value={config.greeting}
                    onChange={e => set('greeting', e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-[10px] font-black tracking-[0.12em] uppercase mb-2" style={{ color: '#94A3B8' }}>Brand colour</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={config.primaryColor}
                      onChange={e => set('primaryColor', e.target.value)}
                      style={{ width: 44, height: 44, border: 'none', borderRadius: 10, cursor: 'pointer', padding: 3, background: 'transparent' }} />
                    <div className="flex gap-2">
                      {['#5B5FFF','#7C3AED','#10B981','#F59E0B','#EF4444','#0EA5E9'].map(c => (
                        <button key={c} onClick={() => set('primaryColor', c)}
                          className="w-7 h-7 rounded-full transition-all"
                          style={{
                            background: c,
                            boxShadow: config.primaryColor === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                            transform: config.primaryColor === c ? 'scale(1.15)' : 'scale(1)',
                          }} />
                      ))}
                    </div>
                    <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>{config.primaryColor}</span>
                  </div>
                </div>
              </Section>
            </motion.div>

            {/* ── 2. Personality ──────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Section icon={Sparkles} title="Personality traits" desc="Select the traits that define how your bot communicates" accent="#7C3AED">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
                  {PERSONALITY_TRAITS.map(trait => {
                    const active = config.personality.includes(trait.id);
                    const Icon = trait.icon;
                    return (
                      <button
                        key={trait.id}
                        onClick={() => toggleTrait(trait.id)}
                        className="flex items-start gap-2.5 p-3.5 rounded-xl text-left transition-all"
                        style={{
                          background: active ? 'rgba(91,95,255,0.08)' : 'rgba(0,0,0,0.02)',
                          border: active ? '1.5px solid rgba(91,95,255,0.3)' : '1.5px solid rgba(0,0,0,0.06)',
                        }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(91,95,255,0.15)'; }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: active ? 'rgba(91,95,255,0.15)' : 'rgba(0,0,0,0.05)' }}>
                          <Icon size={13} strokeWidth={2} style={{ color: active ? '#5B5FFF' : '#94A3B8' }} />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold" style={{ color: active ? '#5B5FFF' : '#374151' }}>{trait.label}</p>
                          <p className="text-[11px] mt-0.5 leading-snug" style={{ color: '#94A3B8' }}>{trait.soul.split('.')[0]}.</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-[10px] font-black tracking-[0.12em] uppercase mb-3" style={{ color: '#94A3B8' }}>Response style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TONE_OPTIONS.map(opt => {
                      const active = config.tone === opt.id;
                      return (
                        <button key={opt.id} onClick={() => set('tone', opt.id)}
                          className="py-3 px-3 rounded-xl text-center transition-all"
                          style={{
                            background: active ? 'rgba(124,58,237,0.08)' : 'rgba(0,0,0,0.02)',
                            border: active ? '1.5px solid rgba(124,58,237,0.3)' : '1.5px solid rgba(0,0,0,0.06)',
                          }}>
                          <p className="text-sm font-bold" style={{ color: active ? '#7C3AED' : '#374151' }}>{opt.label}</p>
                          <p className="text-[11px]" style={{ color: '#94A3B8' }}>{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Section>
            </motion.div>

            {/* ── 3. Business knowledge ───────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Section icon={BookOpen} title="Business knowledge" desc="Tell your bot about your business — it will remember this in every conversation" accent="#5B5FFF">
                <Textarea
                  label="About your business"
                  placeholder={`Tell Freemi everything your bot should know:\n\n• What you sell or offer\n• Your opening hours\n• Your location or service area\n• Pricing (if you want to share it)\n• Common FAQs\n• Anything visitors frequently ask about`}
                  value={config.customInstructions}
                  onChange={e => set('customInstructions', e.target.value)}
                  rows={8}
                />
                <p className="text-xs mt-2" style={{ color: '#CBD5E1' }}>
                  The more detail you provide, the better your bot will answer questions.
                </p>
              </Section>
            </motion.div>

            {/* ── 4. Capabilities ─────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Section icon={Zap} title="Capabilities" desc="What can your assistant help visitors with?" accent="#F59E0B">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CAPABILITIES.map(cap => {
                    const active = config.capabilities.includes(cap.id);
                    const Icon = cap.icon;
                    return (
                      <button key={cap.id} onClick={() => toggleCapability(cap.id)}
                        className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                        style={{
                          background: active ? 'rgba(245,158,11,0.06)' : 'rgba(0,0,0,0.02)',
                          border: active ? '1.5px solid rgba(245,158,11,0.3)' : '1.5px solid rgba(0,0,0,0.06)',
                        }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: active ? 'rgba(245,158,11,0.12)' : 'rgba(0,0,0,0.04)' }}>
                          <Icon size={14} strokeWidth={2} style={{ color: active ? '#F59E0B' : '#94A3B8' }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold" style={{ color: active ? '#92400E' : '#374151' }}>{cap.label}</p>
                          <p className="text-[11px]" style={{ color: '#94A3B8' }}>{cap.desc}</p>
                        </div>
                        {active && <Check size={14} className="ml-auto flex-shrink-0" style={{ color: '#F59E0B' }} />}
                      </button>
                    );
                  })}
                </div>
              </Section>
            </motion.div>

            {/* ── 5. Status & install ─────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Section icon={Globe} title="Widget status" desc="Control whether your widget is active on your site" accent="#5B5FFF">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-bold mb-0.5" style={{ color: '#0A0F1E' }}>
                      {config.active ? 'Widget is live' : 'Widget is paused'}
                    </p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>
                      {config.active
                        ? 'Your assistant is visible and answering visitors right now.'
                        : 'Your widget is hidden. Activate it to start receiving conversations.'}
                    </p>
                  </div>
                  <Toggle on={config.active} onToggle={() => set('active', !config.active)} />
                </div>
              </Section>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <InstallSection widgetId={widgetId} />
            </motion.div>

            {/* Save button (bottom) */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="flex justify-end pb-6">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)',
                  boxShadow: '0 4px 20px rgba(91,95,255,0.35)',
                }}>
                {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
                {saving ? 'Saving…' : saved ? 'All changes saved!' : 'Save configuration'}
              </button>
            </motion.div>
          </div>

          {/* Live preview — right 1/3 */}
          <div className="hidden lg:block">
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <LivePreview config={config} />

              {/* Generated prompt preview */}
              <div className="rounded-2xl overflow-hidden mt-4"
                style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)' }}>
                <div className="px-4 py-3 flex items-center gap-2"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(91,95,255,0.02)' }}>
                  <Sparkles size={13} style={{ color: '#7C3AED' }} />
                  <span className="text-[10px] font-black tracking-[0.1em] uppercase" style={{ color: '#94A3B8' }}>
                    Felix system prompt
                  </span>
                </div>
                <div className="p-4">
                  <pre className="text-[10px] leading-relaxed whitespace-pre-wrap break-words max-h-64 overflow-y-auto"
                    style={{ color: '#64748B', fontFamily: 'ui-monospace, monospace' }}>
                    {buildSystemPrompt(config).slice(0, 500)}…
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
