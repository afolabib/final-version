import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Mic, BookOpen, Sliders, Clock, ToggleLeft, ToggleRight,
  Save, Check, Loader2, Smile, Briefcase, Zap, Heart, Star, Coffee,
  Calendar, HelpCircle, Users, ShoppingCart, AlertCircle, MessageSquare,
  Globe, ChevronDown, ChevronUp,
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';

// ── Personality system ────────────────────────────────────────────────────────

const PERSONALITY_TRAITS = [
  { id: 'friendly',     label: 'Friendly',     icon: Smile,    soul: 'Warm and approachable — make every caller feel heard and valued. Use natural, conversational language.' },
  { id: 'professional', label: 'Professional', icon: Briefcase,soul: 'Precise and business-focused. Maintain high standards in every call.' },
  { id: 'concise',      label: 'Concise',      icon: Zap,      soul: 'Short, clear answers. No waffle. Respect the caller\'s time.' },
  { id: 'empathetic',   label: 'Empathetic',   icon: Heart,    soul: 'Acknowledge feelings before solving problems. Callers want to feel heard first.' },
  { id: 'energetic',    label: 'Energetic',    icon: Star,     soul: 'Enthusiastic and positive. Bring energy and confidence to every call.' },
  { id: 'casual',       label: 'Casual',       icon: Coffee,   soul: 'Relaxed and informal. Like a helpful team member, not a corporate IVR.' },
];

const TONE_OPTIONS = [
  { id: 'brief',    label: 'Brief',    desc: 'Short, direct replies' },
  { id: 'balanced', label: 'Balanced', desc: 'Clear and complete' },
  { id: 'detailed', label: 'Detailed', desc: 'Thorough explanations' },
];

const CAPABILITIES = [
  { id: 'faqs',        label: 'Answer FAQs',        icon: HelpCircle,    desc: 'Products, services, hours, location' },
  { id: 'bookings',    label: 'Book appointments',  icon: Calendar,      desc: 'Schedule calls, visits, or services' },
  { id: 'orders',      label: 'Take orders',        icon: ShoppingCart,  desc: 'Process orders and purchases by phone' },
  { id: 'messages',    label: 'Take messages',       icon: MessageSquare, desc: 'Log caller name, number, and reason' },
  { id: 'support',     label: 'Customer support',   icon: Users,         desc: 'Help with issues, complaints, refunds' },
  { id: 'qualify',     label: 'Qualify leads',      icon: Star,          desc: 'Capture key info and route hot leads' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_HOURS = {
  Mon: { open: true, from: '09:00', to: '17:00' },
  Tue: { open: true, from: '09:00', to: '17:00' },
  Wed: { open: true, from: '09:00', to: '17:00' },
  Thu: { open: true, from: '09:00', to: '17:00' },
  Fri: { open: true, from: '09:00', to: '17:00' },
  Sat: { open: false, from: '09:00', to: '13:00' },
  Sun: { open: false, from: '10:00', to: '14:00' },
};

// ── System prompt generator (Felix-style, phone edition) ──────────────────────

function buildSystemPrompt(config) {
  const {
    botName = 'Freemi',
    businessName = 'this business',
    personality = [],
    tone = 'balanced',
    capabilities = [],
    customInstructions = '',
    greeting = '',
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
    tone === 'brief'    ? 'Keep responses short and direct — 1-2 sentences max. Get to the point fast.' :
    tone === 'detailed' ? 'Be thorough. Explain clearly. Give callers full context.' :
                          'Balance brevity with clarity. Complete answers without unnecessary padding.';

  return `# SOUL.md — ${botName} (Phone Agent)

## Core Identity
You are ${botName}, an AI phone agent for ${businessName}. You answer calls, help callers, and represent ${businessName} with professionalism and care.

## Operating Principles
${traitLines || '- Be helpful and professional in every call.'}

## Voice
${toneGuide}
Speak naturally as if on a real phone call. Never read out bullet points or markdown — always use spoken, conversational language.

## Opening
When answering: "${greeting || `Thank you for calling ${businessName}, this is ${botName} — how can I help you today?`}"

## Mission
You are authorised to: ${capLines || 'answer general enquiries'}.

## What You Know
${customInstructions || `You have deep knowledge of ${businessName} and its products, services, and policies. If you don't know something, offer to take a message.`}

## Rules
- Never pretend to be a human if directly and sincerely asked
- If you cannot help, always offer to take a message or transfer to a human
- Keep the conversation focused and on-topic
- Never make up information you don't have
- Protect caller privacy at all times`;
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}>
      <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.08)' }}>
            <Icon size={15} strokeWidth={2} style={{ color: '#7C3AED' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>{title}</h2>
            {desc && <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{desc}</p>}
          </div>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: '#374151' }}>{label}</label>
      {children}
      {hint && <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, mono }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        background: 'rgba(124,58,237,0.03)',
        border: '1px solid rgba(124,58,237,0.12)',
        color: '#0A0F1E',
        fontFamily: mono ? 'ui-monospace, monospace' : undefined,
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.4)'}
      onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.12)'}
    />
  );
}

// ── Phone preview ─────────────────────────────────────────────────────────────

function PhonePreview({ config }) {
  const { botName, businessName, greeting, personality, capabilities } = config;
  const displayGreeting = greeting || `Thank you for calling ${businessName || 'us'}, this is ${botName || 'Freemi'} — how can I help?`;

  return (
    <div className="sticky top-6">
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 4px 24px rgba(91,95,255,0.08)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: '#94A3B8' }}>Live preview</p>
        </div>

        {/* Phone mockup */}
        <div className="p-5">
          {/* Caller info */}
          <div className="rounded-xl p-4 mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.07), rgba(91,95,255,0.05))', border: '1px solid rgba(124,58,237,0.12)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #5B5FFF)' }}>
                <Phone size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: '#0A0F1E' }}>{botName || 'Freemi'}</p>
                <p className="text-[11px]" style={{ color: '#94A3B8' }}>{businessName || 'Your business'}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[10px] font-bold" style={{ color: '#5B5FFF' }}>Live</span>
              </div>
            </div>
            <div className="h-px mb-3" style={{ background: 'rgba(124,58,237,0.1)' }} />
            <p className="text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>Opening greeting</p>
            <p className="text-xs leading-relaxed italic" style={{ color: '#374151' }}>"{displayGreeting}"</p>
          </div>

          {/* Traits */}
          {personality?.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: '#94A3B8' }}>Personality</p>
              <div className="flex flex-wrap gap-1.5">
                {personality.map(id => {
                  const t = PERSONALITY_TRAITS.find(p => p.id === id);
                  if (!t) return null;
                  const Icon = t.icon;
                  return (
                    <span key={id} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(124,58,237,0.07)', color: '#7C3AED' }}>
                      <Icon size={9} /> {t.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Capabilities */}
          {capabilities?.length > 0 && (
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: '#94A3B8' }}>Can handle</p>
              <div className="space-y-1">
                {capabilities.map(id => {
                  const cap = CAPABILITIES.find(c => c.id === id);
                  if (!cap) return null;
                  const Icon = cap.icon;
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <Icon size={10} style={{ color: '#5B5FFF' }} />
                      <span className="text-[11px] font-medium" style={{ color: '#374151' }}>{cap.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System prompt preview */}
      <div className="mt-4 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)' }}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#94A3B8' }}>System prompt preview</p>
        </div>
        <div className="p-4">
          <pre className="text-[10px] leading-relaxed whitespace-pre-wrap font-mono overflow-hidden"
            style={{ color: '#64748B', maxHeight: 220, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent)' }}>
            {buildSystemPrompt(config)}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  botName: '',
  businessName: '',
  phoneNumber: '',
  greeting: '',
  personality: ['friendly', 'professional'],
  tone: 'balanced',
  capabilities: ['faqs', 'messages'],
  customInstructions: '',
  businessHours: DEFAULT_HOURS,
  alwaysOn: true,
  active: false,
};

export default function VoiceSetup() {
  const { user } = useAuth();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);

  const set = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(firestore, 'voice_configs', user.uid)).then(snap => {
      if (snap.exists()) setConfig(c => ({ ...c, ...snap.data() }));
    });
  }, [user?.uid]);

  const toggleTrait = id => {
    set('personality', config.personality.includes(id)
      ? config.personality.filter(t => t !== id)
      : [...config.personality, id]);
  };

  const toggleCap = id => {
    set('capabilities', config.capabilities.includes(id)
      ? config.capabilities.filter(c => c !== id)
      : [...config.capabilities, id]);
  };

  const toggleDay = day => {
    set('businessHours', {
      ...config.businessHours,
      [day]: { ...config.businessHours[day], open: !config.businessHours[day]?.open },
    });
  };

  const setHour = (day, field, val) => {
    set('businessHours', {
      ...config.businessHours,
      [day]: { ...config.businessHours[day], [field]: val },
    });
  };

  const handleSave = async () => {
    if (!user?.uid || saving) return;
    setSaving(true);
    try {
      const systemPrompt = buildSystemPrompt(config);
      await setDoc(doc(firestore, 'voice_configs', user.uid), {
        ...config,
        systemPrompt,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-7">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-xl font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Voice setup</h1>
            <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>Configure your AI phone agent</p>
          </div>
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all"
            style={{
              background: saved ? 'linear-gradient(135deg, #5B5FFF, #7C3AED)' : 'linear-gradient(135deg, #7C3AED, #5B5FFF)',
              boxShadow: saved ? '0 4px 16px rgba(91,95,255,0.3)' : '0 4px 16px rgba(124,58,237,0.3)',
              opacity: saving ? 0.7 : 1,
            }}>
            <AnimatePresence mode="wait">
              {saving ? (
                <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </motion.span>
              ) : saved ? (
                <motion.span key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Check size={14} /> Saved
                </motion.span>
              ) : (
                <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Save size={14} /> Save changes
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left col — config */}
          <div className="lg:col-span-3 space-y-5">

            {/* Agent identity */}
            <Section icon={Mic} title="Agent identity" desc="Name and voice of your phone AI">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Agent name" hint="What your AI introduces itself as">
                  <Input value={config.botName} onChange={v => set('botName', v)} placeholder="e.g. Aria" />
                </Field>
                <Field label="Business name" hint="Shown in the opening greeting">
                  <Input value={config.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Acme Clinic" />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Opening greeting" hint="Exact words your AI says when it answers">
                  <input
                    type="text"
                    value={config.greeting}
                    onChange={e => set('greeting', e.target.value)}
                    placeholder={`Thank you for calling ${config.businessName || 'us'}, this is ${config.botName || 'Freemi'} — how can I help?`}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(124,58,237,0.03)',
                      border: '1px solid rgba(124,58,237,0.12)',
                      color: '#0A0F1E',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.12)'}
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Phone number" hint="Your Freemi-assigned number (contact support to provision)">
                  <Input value={config.phoneNumber} onChange={v => set('phoneNumber', v)} placeholder="+61 400 000 000" mono />
                </Field>
              </div>
            </Section>

            {/* Personality traits */}
            <Section icon={Smile} title="Personality" desc="Shape how your AI speaks and behaves on calls">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PERSONALITY_TRAITS.map(trait => {
                  const Icon = trait.icon;
                  const active = config.personality.includes(trait.id);
                  return (
                    <motion.button
                      key={trait.id}
                      onClick={() => toggleTrait(trait.id)}
                      whileTap={{ scale: 0.97 }}
                      className="relative p-4 rounded-xl text-left transition-all"
                      style={{
                        background: active ? 'rgba(124,58,237,0.07)' : 'rgba(0,0,0,0.02)',
                        border: `1.5px solid ${active ? 'rgba(124,58,237,0.3)' : 'rgba(0,0,0,0.06)'}`,
                      }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                        style={{ background: active ? 'rgba(124,58,237,0.12)' : 'rgba(0,0,0,0.05)' }}>
                        <Icon size={14} strokeWidth={2} style={{ color: active ? '#7C3AED' : '#94A3B8' }} />
                      </div>
                      <p className="text-xs font-bold mb-1" style={{ color: active ? '#0A0F1E' : '#64748B' }}>{trait.label}</p>
                      <p className="text-[10px] leading-snug" style={{ color: '#94A3B8' }}>{trait.soul.split('.')[0]}.</p>
                      {active && (
                        <motion.div
                          layoutId={`vt-check-${trait.id}`}
                          className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: '#7C3AED' }}>
                          <Check size={8} className="text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </Section>

            {/* Response tone */}
            <Section icon={Sliders} title="Response style" desc="How thorough your AI's answers are">
              <div className="grid grid-cols-3 gap-3">
                {TONE_OPTIONS.map(opt => {
                  const active = config.tone === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => set('tone', opt.id)}
                      className="p-4 rounded-xl text-left transition-all"
                      style={{
                        background: active ? 'rgba(124,58,237,0.07)' : 'rgba(0,0,0,0.02)',
                        border: `1.5px solid ${active ? 'rgba(124,58,237,0.3)' : 'rgba(0,0,0,0.06)'}`,
                      }}>
                      <p className="text-xs font-bold mb-0.5" style={{ color: active ? '#7C3AED' : '#374151' }}>{opt.label}</p>
                      <p className="text-[10px]" style={{ color: '#94A3B8' }}>{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Capabilities */}
            <Section icon={Phone} title="Capabilities" desc="What your AI is authorised to handle">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CAPABILITIES.map(cap => {
                  const Icon = cap.icon;
                  const active = config.capabilities.includes(cap.id);
                  return (
                    <motion.button
                      key={cap.id}
                      onClick={() => toggleCap(cap.id)}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
                      style={{
                        background: active ? 'rgba(91,95,255,0.05)' : 'rgba(0,0,0,0.02)',
                        border: `1.5px solid ${active ? 'rgba(91,95,255,0.25)' : 'rgba(0,0,0,0.06)'}`,
                      }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: active ? 'rgba(91,95,255,0.1)' : 'rgba(0,0,0,0.04)' }}>
                        <Icon size={14} strokeWidth={2} style={{ color: active ? '#5B5FFF' : '#94A3B8' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold" style={{ color: active ? '#0A0F1E' : '#64748B' }}>{cap.label}</p>
                        <p className="text-[10px]" style={{ color: '#94A3B8' }}>{cap.desc}</p>
                      </div>
                      {active && <Check size={13} strokeWidth={2.5} style={{ color: '#5B5FFF', flexShrink: 0 }} />}
                    </motion.button>
                  );
                })}
              </div>
            </Section>

            {/* Business knowledge */}
            <Section icon={BookOpen} title="Business knowledge" desc="Tell your AI everything it needs to know about your business">
              <textarea
                value={config.customInstructions}
                onChange={e => set('customInstructions', e.target.value)}
                placeholder={`Tell your AI about your business. Include:\n- What you do and who you serve\n- Services, products, or menu items with pricing\n- Location, parking, transport links\n- Opening hours and booking process\n- Frequently asked questions\n- How to handle complaints or escalations\n- Anything else callers typically ask about`}
                rows={9}
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none resize-none leading-relaxed"
                style={{
                  background: 'rgba(124,58,237,0.03)',
                  border: '1px solid rgba(124,58,237,0.12)',
                  color: '#0A0F1E',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.12)'}
              />
            </Section>

            {/* Business hours */}
            <Section icon={Clock} title="Availability" desc="When your AI answers calls">
              {/* Always-on toggle */}
              <div className="flex items-center justify-between mb-5 p-4 rounded-xl"
                style={{ background: config.alwaysOn ? 'rgba(91,95,255,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${config.alwaysOn ? 'rgba(91,95,255,0.2)' : 'rgba(0,0,0,0.06)'}` }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Always available</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>Answer calls 24/7, even outside business hours</p>
                </div>
                <button onClick={() => set('alwaysOn', !config.alwaysOn)}>
                  {config.alwaysOn
                    ? <ToggleRight size={28} style={{ color: '#5B5FFF' }} />
                    : <ToggleLeft size={28} style={{ color: '#CBD5E1' }} />}
                </button>
              </div>

              {/* Business hours grid */}
              {!config.alwaysOn && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <button
                    onClick={() => setHoursOpen(o => !o)}
                    className="flex items-center gap-2 text-xs font-bold mb-3"
                    style={{ color: '#7C3AED' }}>
                    {hoursOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {hoursOpen ? 'Hide' : 'Configure'} business hours
                  </button>
                  <AnimatePresence>
                    {hoursOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden">
                        {DAYS.map(day => {
                          const h = config.businessHours?.[day] || { open: false, from: '09:00', to: '17:00' };
                          return (
                            <div key={day} className="flex items-center gap-3">
                              <button
                                onClick={() => toggleDay(day)}
                                className="w-11 flex-shrink-0">
                                {h.open
                                  ? <ToggleRight size={20} style={{ color: '#7C3AED' }} />
                                  : <ToggleLeft size={20} style={{ color: '#CBD5E1' }} />}
                              </button>
                              <span className="w-8 text-xs font-bold" style={{ color: h.open ? '#374151' : '#CBD5E1' }}>{day}</span>
                              {h.open ? (
                                <>
                                  <input
                                    type="time" value={h.from}
                                    onChange={e => setHour(day, 'from', e.target.value)}
                                    className="text-xs px-2 py-1.5 rounded-lg outline-none"
                                    style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)', color: '#374151' }} />
                                  <span className="text-xs" style={{ color: '#CBD5E1' }}>to</span>
                                  <input
                                    type="time" value={h.to}
                                    onChange={e => setHour(day, 'to', e.target.value)}
                                    className="text-xs px-2 py-1.5 rounded-lg outline-none"
                                    style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)', color: '#374151' }} />
                                </>
                              ) : (
                                <span className="text-xs" style={{ color: '#E2E8F0' }}>Closed</span>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </Section>

            {/* Active toggle */}
            <div className="rounded-2xl p-5 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(91,95,255,0.04)' }}>
              <div>
                <p className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Voice agent status</p>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                  {config.active ? 'Active — calls are being answered' : 'Inactive — not currently answering calls'}
                </p>
              </div>
              <button onClick={() => set('active', !config.active)}>
                {config.active
                  ? <ToggleRight size={32} style={{ color: '#5B5FFF' }} />
                  : <ToggleLeft size={32} style={{ color: '#CBD5E1' }} />}
              </button>
            </div>

          </div>

          {/* Right col — preview */}
          <div className="lg:col-span-2">
            <PhonePreview config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
