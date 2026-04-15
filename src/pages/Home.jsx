import { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import InteractiveGrid from '../components/InteractiveGrid';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import PricingSection from '../components/PricingSection';
import FAQSection from '../components/FAQSection';
import FloatingChatWidget from '../components/FloatingChatWidget';
import ScrollReveal from '../components/ScrollReveal';
import CountUp from '../components/CountUp';
import MiniFreemi from '../components/MiniFreemi';
import {
  MessageSquare, Phone, Mail, Globe, Calendar, Zap, ArrowRight, Check,
  Users, BarChart3, Bot, Plug, Clock, Shield, Sparkles, ChevronRight,
  Search, FileText, Headphones, TrendingUp, Send, Star
} from 'lucide-react';
import {
  SiWhatsapp, SiGmail, SiSlack, SiHubspot, SiSalesforce,
  SiGooglecalendar, SiStripe, SiCalendly, SiNotion, SiZapier,
  SiGooglesheets
} from 'react-icons/si';

/* ─── floating elements (studio-style) ────────────────── */

const ORB_COLORS = [
  'rgba(123,97,255,0.22)', 'rgba(47,143,255,0.16)',
  'rgba(236,72,153,0.14)', 'rgba(39,192,135,0.12)', 'rgba(168,85,247,0.18)',
];

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const FLOAT_ICONS = [Sparkles, Bot, Zap, Globe, Star, MessageSquare, Calendar, Send];

function FloatingBg({ darkBg = false, seed = 42, density = 'normal', icons = FLOAT_ICONS }) {
  const counts = { sparse: { orbs: 3, dots: 5, rings: 0, icons: 4 }, normal: { orbs: 4, dots: 10, rings: 2, icons: 8 }, dense: { orbs: 5, dots: 15, rings: 3, icons: 12 } };
  const d = counts[density] || counts.normal;
  const r = seededRandom(seed);
  const rand = () => r();
  const gen = (n) => Array.from({ length: n }, () => ({ left: `${5 + rand() * 90}%`, top: `${5 + rand() * 90}%`, delay: rand() * 3, duration: 4 + rand() * 6, size: 14 + rand() * 18 }));
  const orbs = gen(d.orbs);
  const dots = gen(d.dots);
  const rings = gen(d.rings);
  const iconItems = gen(d.icons);
  const dotBg = darkBg ? 'bg-white/[0.15]' : 'bg-purple-500/[0.25]';
  const ringBorder = darkBg ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(123,97,255,0.1)';
  const iconColor = darkBg ? 'text-white/[0.12]' : 'text-purple-500/[0.12]';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* gradient orbs */}
      {orbs.map((p, i) => (
        <motion.div key={`o${i}`} className="absolute rounded-full"
          style={{ left: p.left, top: p.top, width: 300 + i * 100, height: 300 + i * 100,
            background: `radial-gradient(circle, ${ORB_COLORS[i % ORB_COLORS.length]}, transparent 65%)`,
            filter: `blur(${50 + i * 12}px)` }}
          animate={{ x: [0, 30 + i * 10, 0], y: [0, -(20 + i * 10), 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />
      ))}
      {/* expanding rings */}
      {rings.map((p, i) => (
        <motion.div key={`r${i}`} className="absolute rounded-full"
          style={{ left: p.left, top: p.top, width: 100 + i * 50, height: 100 + i * 50, border: ringBorder, transform: 'translate(-50%,-50%)' }}
          animate={{ scale: [1, 2.5], opacity: [0.15, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeOut', delay: i * 1.5 }} />
      ))}
      {/* floating icons */}
      {iconItems.map((p, i) => {
        const Icon = icons[i % icons.length];
        return (
          <motion.div key={`i${i}`} className={`absolute ${iconColor}`}
            style={{ left: p.left, top: p.top }}
            animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}>
            <Icon style={{ width: p.size, height: p.size }} />
          </motion.div>
        );
      })}
      {/* particle dots */}
      {dots.map((p, i) => (
        <motion.div key={`d${i}`} className={`absolute rounded-full ${dotBg}`}
          style={{ left: p.left, top: p.top, width: 3 + (i % 4) * 3, height: 3 + (i % 4) * 3 }}
          animate={{ opacity: [0.1, 0.7, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5 + (i % 4) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />
      ))}
    </div>
  );
}

/* ─── data ────────────────────────────────────────────────── */

const products = [
  { icon: Globe, title: 'Studio', desc: 'AI-powered websites. Not just a site — a business with an AI team inside it from day one.', color: '#7B61FF', link: '/products/studio' },
  { icon: MessageSquare, title: 'Concierge', desc: 'AI chat widget on your site. Answers questions, captures leads, books appointments — 24/7.', color: '#2F8FFF', link: '/products/concierge' },
  { icon: Phone, title: 'Voice', desc: 'AI phone agent. Answers every call, takes orders, books appointments — even when you can\'t.', color: '#27C087', link: '/products/voice' },
  { icon: Send, title: 'WhatsApp', desc: 'AI WhatsApp agent. Auto-replies, handles orders, answers questions — like texting a real person.', color: '#25D366', link: '/products/whatsapp' },
  { icon: Calendar, title: 'Bookings', desc: 'AI-powered appointments. Customers book, reschedule, cancel — your calendar stays perfect.', color: '#F59E0B', link: '/products/bookings' },
];

const agents = [
  { key: 'sales', name: 'Sales Agent', role: 'Sales', color: '#4A6CF7', desc: 'Qualifies leads, follows up prospects, books meetings, updates your CRM. Never lets a lead go cold.', channels: ['WhatsApp', 'Email', 'CRM'] },
  { key: 'support', name: 'Support Agent', role: 'Support', color: '#E84393', desc: 'Resolves tickets in seconds. Handles complaints, processes refunds, keeps customers happy.', channels: ['WhatsApp', 'Email', 'Phone'] },
  { key: 'accounting', name: 'Accounting Agent', role: 'Accounting', color: '#00B894', desc: 'Invoicing, expense tracking, reconciliation, financial reports. Your books, on autopilot.', channels: ['Email', 'Stripe', 'Xero'] },
  { key: 'booking', name: 'Booking Agent', role: 'Bookings', color: '#F59E0B', desc: 'Manages your calendar, confirms appointments, sends reminders, handles reschedules.', channels: ['Calendar', 'WhatsApp', 'Phone'] },
  { key: 'admin', name: 'Admin Agent', role: 'Admin', color: '#0984E3', desc: 'Email triage, document management, data entry, scheduling. Your right hand.', channels: ['Gmail', 'Calendar', 'Slack'] },
  { key: 'marketing', name: 'Marketing Agent', role: 'Marketing', color: '#8B5CF6', desc: 'Content creation, social posting, campaign tracking, audience insights. Growth on autopilot.', channels: ['Social', 'Email', 'Analytics'] },
];

const channels = [
  { icon: Send, label: 'WhatsApp', desc: 'Auto-replies. Orders. Full conversations.', color: '#25D366' },
  { icon: Phone, label: 'Phone', desc: 'Every call answered. Appointments booked.', color: '#7B61FF' },
  { icon: Mail, label: 'Email', desc: 'Inbox managed. Replies drafted. Follow-ups sent.', color: '#2F8FFF' },
  { icon: Globe, label: 'Website', desc: 'Live chat. Lead capture. Bookings.', color: '#27C087' },
  { icon: Calendar, label: 'Calendar', desc: 'Appointments, availability, reminders.', color: '#F59E0B' },
];

const integrations = [
  'WhatsApp', 'Gmail', 'Slack', 'HubSpot', 'Salesforce',
  'Google Calendar', 'Stripe', 'Calendly', 'Notion', 'Zapier',
  'Microsoft Teams', 'Pipedrive', 'Google Sheets', 'Outlook', 'Make',
];

const steps = [
  { num: '01', icon: MessageSquare, title: 'Tell us about your business', desc: 'A 15-minute call. Share your goals, workflows, and tools. That\'s all we need.' },
  { num: '02', icon: Bot, title: 'We build your AI team', desc: 'Custom agents configured for your business. Website included. Ready in 1–2 days.' },
  { num: '03', icon: Zap, title: 'Your agents go live', desc: 'They start handling calls, messages, bookings, and operations. You watch from your dashboard.' },
];

const stats = [
  { value: '24/7', label: 'Always on. Never sleeps.' },
  { value: '<8s', label: 'Average response time' },
  { value: '97', suffix: '%', label: 'Customer satisfaction' },
  { value: '10', suffix: '×', label: 'Faster than hiring' },
];

const whatsappConvo = [
  { from: 'user', text: 'How did we do today?' },
  { from: 'freemi', text: '12 bookings confirmed. 4 new leads qualified. 8 support tickets resolved. Revenue: €2,340.\n\nYour sales agent is following up 3 warm leads tonight.' },
  { from: 'user', text: 'I need an accounting agent to handle invoices' },
  { from: 'freemi', text: 'Done. Accounting agent is live — connected to Stripe and your email. First invoices going out now. ✓' },
];

/* ─── section components ──────────────────────────────────── */

function SectionBadge({ children }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase"
      style={{ background: 'rgba(123,97,255,0.08)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.15)' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      {children}
    </div>
  );
}

function SectionHeader({ badge, title, subtitle }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <ScrollReveal>
        <SectionBadge>{badge}</SectionBadge>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-surface leading-[1.1]">
          {title}
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.15}>
        <p className="mt-5 text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">{subtitle}</p>
      </ScrollReveal>
    </div>
  );
}

/* ── TYPEWRITER ───────────────────────────────────────── */

const typingLines = ['On Autopilot', 'While You Sleep', '24/7', 'Without Hiring'];

function TypewriterCycle() {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState('typing');

  useEffect(() => {
    const target = typingLines[lineIndex];
    if (phase === 'typing') {
      if (displayed.length < target.length) {
        const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('pause'), 2000);
      return () => clearTimeout(t);
    }
    if (phase === 'pause') {
      const t = setTimeout(() => setPhase('erasing'), 200);
      return () => clearTimeout(t);
    }
    if (phase === 'erasing') {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
        return () => clearTimeout(t);
      }
      setLineIndex((i) => (i + 1) % typingLines.length);
      setPhase('typing');
    }
  }, [displayed, phase, lineIndex]);

  return (
    <span className="relative inline-block">
      <span className="text-gradient">{displayed}</span>
      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }}
        className="inline-block w-[3px] h-[0.8em] ml-0.5 align-middle rounded-full" style={{ background: '#7B61FF' }} />
    </span>
  );
}

/* ── HERO ─────────────────────────────────────────────── */

const heroBadges = [
  { icon: MessageSquare, label: 'Customer query answered', side: 'left', top: '16%', delay: 0.8, dot: 'bg-green-500' },
  { icon: Send, label: 'Follow-up sent via WhatsApp', side: 'left', top: '72%', delay: 2.0, dot: 'bg-purple-500' },
  { icon: Calendar, label: 'Booking confirmed', side: 'right', top: '14%', delay: 1.2, dot: 'bg-blue-500' },
  { icon: Phone, label: 'Call answered by AI', side: 'right', top: '70%', delay: 1.6, dot: 'bg-emerald-500' },
];

function HeroSection() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const navigate = useNavigate();

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12">
      {/* mesh gradient bg */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(123,97,255,0.22) 0%, transparent 50%), radial-gradient(ellipse 40% 60% at 60% 30%, rgba(168,85,247,0.12) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(47,143,255,0.10) 0%, transparent 50%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(39,192,135,0.08) 0%, transparent 50%)' }} />

      {/* floating elements */}
      <FloatingBg seed={7} density="dense" />

      {/* noise texture */}
      <div className="absolute inset-0 noise pointer-events-none" />

      {/* subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: 'radial-gradient(rgba(123,97,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* large glow */}
      <motion.div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(123,97,255,0.12) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />

      {/* floating notification badges (desktop only) */}
      <div className="pointer-events-none absolute inset-0 hidden xl:block">
        <div className="relative mx-auto h-full max-w-[90rem]">
          {heroBadges.map((b, i) => (
            <motion.div key={b.label}
              className="absolute z-0"
              style={{ top: b.top, ...(b.side === 'left' ? { left: 32 } : { right: 32 }) }}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: b.delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <motion.div animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/75 backdrop-blur-xl border border-white/50 shadow-lg"
                style={{ boxShadow: '0 8px 24px rgba(123,97,255,0.1)' }}>
                <div className="relative w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(123,97,255,0.1)' }}>
                  <b.icon className="w-3.5 h-3.5" style={{ color: '#7B61FF' }} />
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${b.dot} animate-pulse ring-2 ring-white`} />
                </div>
                <span className="text-xs font-semibold text-surface/85 whitespace-nowrap">{b.label}</span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div style={{ y, opacity, scale }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

          {/* badge */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="badge-shimmer inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-purple-200/30 shadow-sm overflow-hidden relative">
              <span className="flex items-center justify-center w-5 h-5 rounded-full" style={{ background: 'rgba(123,97,255,0.15)' }}>
                <Sparkles className="w-3 h-3" style={{ color: '#7B61FF' }} />
              </span>
              <span className="text-xs font-semibold text-surface/80 tracking-wide">AI Agents For Every Business</span>
              <span className="text-xs font-bold" style={{ color: '#7B61FF' }}>New</span>
            </div>
          </motion.div>

          {/* headline */}
          <div>
            {['One Agent Runs', 'Your Entire Business'].map((line, i) => (
              <motion.div key={i} variants={itemVariants} className="overflow-hidden">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.15] text-surface">{line}</h1>
              </motion.div>
            ))}
            <motion.div variants={itemVariants} className="overflow-hidden">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.15] min-h-[1.2em]">
                <TypewriterCycle />
              </h1>
            </motion.div>
          </div>

          {/* subtitle */}
          <motion.p variants={itemVariants} className="text-base md:text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Freemi is an AI agent that hires other agents, connects to your tools,
            and lets you control your whole business from WhatsApp.
            Calls, bookings, emails, sales, support — all on autopilot.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button onClick={() => window.open('https://freemi-studio.web.app', '_blank')}
                className="relative px-10 py-4 rounded-full text-white font-semibold text-base overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 8px 32px rgba(123,97,255,0.35)' }}>
                <span className="relative z-10 flex items-center gap-2">
                  Start free trial
                  <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 rounded-full font-semibold text-base bg-white/60 backdrop-blur-sm"
                style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#374151' }}>
                See how it works
              </button>
            </motion.div>
          </motion.div>

          {/* trust badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {['No credit card needed', 'Live in 48 hours', '7-day free trial'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">{t}</span>
              </span>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* scroll indicator */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-gray-400/40 font-medium">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-gray-300/40 flex items-start justify-center p-1">
            <motion.div className="w-1 h-2 rounded-full" style={{ background: 'rgba(123,97,255,0.4)' }}
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── DASHBOARD PREVIEW ────────────────────────────────── */

function DashboardPreviewSection() {
  return (
    <section className="relative -mt-8 pb-16 px-6 z-20">
      <ScrollReveal direction="none">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="relative rounded-2xl overflow-hidden"
            style={{ background: '#0A0F1E', boxShadow: '0 40px 100px rgba(0,0,0,0.25), 0 0 60px rgba(123,97,255,0.12)', border: '1px solid rgba(255,255,255,0.08)' }}
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>

            {/* browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-lg text-[11px] text-white/30 font-mono" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  app.freemi.ai/dashboard
                </div>
              </div>
            </div>

            {/* dashboard body */}
            <div className="flex min-h-[420px]">
              {/* sidebar */}
              <div className="hidden md:flex flex-col w-52 p-4 border-r border-white/[0.06] gap-1">
                <div className="flex items-center gap-2.5 px-3 py-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)' }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
                  </div>
                  <span className="text-white/90 text-sm font-bold">Freemi</span>
                </div>
                {[
                  { label: 'Dashboard', active: true },
                  { label: 'Agents' },
                  { label: 'Inbox' },
                  { label: 'Bookings' },
                  { label: 'Analytics' },
                  { label: 'Integrations' },
                  { label: 'Settings' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium"
                    style={{ background: item.active ? 'rgba(123,97,255,0.12)' : 'transparent', color: item.active ? '#A78BFA' : 'rgba(255,255,255,0.35)' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.active ? '#7B61FF' : 'rgba(255,255,255,0.15)' }} />
                    {item.label}
                  </div>
                ))}
              </div>

              {/* main content */}
              <div className="flex-1 p-6">
                {/* top stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Active Agents', value: '4', change: '+1 today', color: '#7B61FF' },
                    { label: 'Conversations', value: '127', change: '+23 today', color: '#2F8FFF' },
                    { label: 'Bookings', value: '34', change: '+8 today', color: '#27C087' },
                    { label: 'Revenue', value: '€4,280', change: '+€840', color: '#F59E0B' },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{stat.label}</p>
                      <p className="mt-1 text-xl font-extrabold text-white">{stat.value}</p>
                      <p className="mt-0.5 text-[10px] font-semibold" style={{ color: stat.color }}>{stat.change}</p>
                    </div>
                  ))}
                </div>

                {/* activity feed */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-3">Live Activity</p>
                  <div className="space-y-2.5">
                    {[
                      { agent: 'Sales Agent', action: 'Qualified lead from WhatsApp', time: '2m ago', color: '#4A6CF7', dot: 'bg-blue-400' },
                      { agent: 'Support Agent', action: 'Resolved ticket #847 — refund processed', time: '5m ago', color: '#E84393', dot: 'bg-pink-400' },
                      { agent: 'Booking Agent', action: 'Confirmed appointment — Dr. Smith, 3pm', time: '8m ago', color: '#F59E0B', dot: 'bg-amber-400' },
                      { agent: 'Accounting Agent', action: 'Invoice #312 sent — €1,200', time: '12m ago', color: '#00B894', dot: 'bg-emerald-400' },
                      { agent: 'Sales Agent', action: 'Follow-up email sent to 3 prospects', time: '15m ago', color: '#4A6CF7', dot: 'bg-blue-400' },
                    ].map((item, i) => (
                      <motion.div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.02)' }}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                        <span className={`w-2 h-2 rounded-full ${item.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold" style={{ color: item.color }}>{item.agent}</span>
                          <span className="text-xs text-white/50 ml-2">{item.action}</span>
                        </div>
                        <span className="text-[10px] text-white/25 shrink-0">{item.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ── LOGO CLOUD ───────────────────────────────────────── */

function LogoCloudSection() {
  const names = ['Founder AI', 'Scale XYZ', 'ActivePath', 'Avo HRIS', 'TechVault', 'Meridian Labs', 'Cloudline', 'Apex Digital'];
  return (
    <section className="py-16 md:py-20">
      <ScrollReveal>
        <p className="text-center text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold mb-8">Trusted by growing businesses</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 max-w-4xl mx-auto px-6">
          {names.map((n, i) => (
            <span key={i}
              className="text-base md:text-lg font-bold tracking-tight"
              style={{ color: 'rgba(0,0,0,0.22)' }}>
              {n}
            </span>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ── PRODUCTS OVERVIEW ────────────────────────────────── */

function ProductsSection() {
  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden">
      <FloatingBg seed={88} density="sparse" />
      <div className="relative z-10">
        <SectionHeader
          badge="The platform"
          title="Five products. One AI brain."
          subtitle="Everything your business needs to run on autopilot."
        />
        <div className="max-w-6xl mx-auto">
          {/* top row: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {products.slice(0, 3).map((p, i) => (
              <ScrollReveal key={p.title} delay={0.05 + i * 0.08}>
                <Link to={p.link} className="group block h-full">
                  <div className="relative h-full rounded-2xl p-7 overflow-hidden noise"
                    style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)', transition: 'transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease-out, border-color 300ms ease' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${p.color}18, 0 4px 12px rgba(0,0,0,0.03)`; e.currentTarget.style.borderColor = `${p.color}25`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                      style={{ background: `linear-gradient(135deg, ${p.color}18, ${p.color}08)`, border: `1px solid ${p.color}15` }}>
                      <p.icon className="w-5 h-5" style={{ color: p.color }} />
                    </div>
                    <h3 className="text-xl font-extrabold text-surface tracking-tight">{p.title}</h3>
                    <p className="mt-2.5 text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                    <div className="mt-5 flex items-center gap-1.5 text-xs font-bold group-hover:gap-3 transition-all duration-300" style={{ color: p.color }}>
                      Learn more <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
          {/* bottom row: 2 wider cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {products.slice(3).map((p, i) => (
              <ScrollReveal key={p.title} delay={0.3 + i * 0.08}>
                <Link to={p.link} className="group block h-full">
                  <div className="relative h-full rounded-2xl p-7 overflow-hidden noise flex gap-5 items-start"
                    style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)', transition: 'transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease-out, border-color 300ms ease' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${p.color}18, 0 4px 12px rgba(0,0,0,0.03)`; e.currentTarget.style.borderColor = `${p.color}25`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg, ${p.color}18, ${p.color}08)`, border: `1px solid ${p.color}15` }}>
                      <p.icon className="w-5 h-5" style={{ color: p.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-surface tracking-tight">{p.title}</h3>
                      <p className="mt-2 text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                      <div className="mt-4 flex items-center gap-1.5 text-xs font-bold group-hover:gap-3 transition-all duration-300" style={{ color: p.color }}>
                        Learn more <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FREEMI AGENT (WhatsApp Control) ──────────────────── */

function FreemiAgentSection() {
  const [visibleMsgs, setVisibleMsgs] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;
    const timers = whatsappConvo.map((_, i) =>
      setTimeout(() => setVisibleMsgs(i + 1), 600 + i * 1200)
    );
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* left: copy */}
        <div>
          <ScrollReveal>
            <SectionBadge>The Freemi Agent</SectionBadge>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight text-surface leading-[1.1]">
              Run your business<br />
              <span className="text-gradient-purple">from WhatsApp.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="mt-5 text-lg text-gray-500 leading-relaxed">
              Freemi is your AI chief of staff. Tell it what you need — it hires specialist agents,
              connects your tools, and reports back. Ask it anything. From anywhere.
            </p>
          </ScrollReveal>
          <div className="mt-8 space-y-4">
            {[
              { icon: Bot, text: 'Hire agents', sub: 'Spin up sales, support, or ops agents on demand' },
              { icon: Plug, text: 'Connect tools', sub: 'Gmail, Slack, Calendar, Stripe, HubSpot — wired up automatically' },
              { icon: Send, text: 'Control from WhatsApp', sub: 'Check bookings, review leads, approve actions — all via chat' },
              { icon: Sparkles, text: 'Always learning', sub: 'Gets smarter about your business every day' },
            ].map((f, i) => (
              <ScrollReveal key={i} delay={0.2 + i * 0.06}>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(123,97,255,0.08)' }}>
                    <f.icon className="w-4 h-4" style={{ color: '#7B61FF' }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface">{f.text}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{f.sub}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* right: phone mockup */}
        <ScrollReveal delay={0.2} direction="right">
          <div className="relative mx-auto" style={{ maxWidth: 320, perspective: '1200px' }}>
            <div className="relative rounded-[2.5rem] p-3 overflow-hidden"
              style={{ background: '#0A0F1E', transform: 'rotateY(-5deg) rotateX(2deg)', boxShadow: '0 40px 80px rgba(0,0,0,0.25), 0 0 60px rgba(123,97,255,0.15)' }}>
              {/* phone status bar */}
              <div className="flex items-center justify-between px-4 py-2 text-white/50 text-[10px]">
                <span>9:41</span>
                <span className="flex gap-1">
                  <span className="w-3 h-2 rounded-sm bg-white/30" />
                  <span className="w-3 h-2 rounded-sm bg-white/30" />
                  <span className="w-4 h-2 rounded-sm bg-emerald-400/60" />
                </span>
              </div>
              {/* whatsapp header */}
              <div className="flex items-center gap-3 px-3 py-3" style={{ background: 'rgba(37,211,102,0.1)', borderRadius: '1rem 1rem 0 0' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold">Freemi</p>
                  <p className="text-emerald-400 text-[9px]">online</p>
                </div>
              </div>
              {/* messages */}
              <div className="px-3 py-4 space-y-3 min-h-[320px]" style={{ background: '#0B1520' }}>
                {whatsappConvo.slice(0, visibleMsgs).map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${msg.from === 'user' ? 'ml-auto bg-emerald-600/90 text-white' : 'bg-white/10 text-white/90'}`}
                    style={{ borderBottomRightRadius: msg.from === 'user' ? 4 : 16, borderBottomLeftRadius: msg.from === 'freemi' ? 4 : 16 }}>
                    <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                  </motion.div>
                ))}
                {visibleMsgs < whatsappConvo.length && visibleMsgs > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 px-3 py-2">
                    {[0, 1, 2].map(d => (
                      <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-white/30"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />
                    ))}
                  </motion.div>
                )}
              </div>
              {/* input bar */}
              <div className="flex items-center gap-2 px-3 py-3" style={{ background: '#0B1520', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex-1 rounded-full px-4 py-2 text-[10px] text-white/30" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  Type a message...
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#25D366' }}>
                  <Send className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── AGENT TEAM SHOWCASE ──────────────────────────────── */

function AgentShowcaseSection() {
  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden">
      <FloatingBg seed={123} density="normal" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <SectionHeader
          badge="Your AI workforce"
          title={<>Need an agent?<br /><span className="text-gradient">Freemi hires one.</span></>}
          subtitle="Sales, support, accounting, bookings, admin, marketing — tell Freemi what you need and it spins up a specialist AI agent. No hiring. No training. Just results."
        />

        {/* Freemi boss card — full width */}
        <ScrollReveal delay={0.1}>
          <div className="mb-5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(123,97,255,0.15)' }}>
            <div className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 8px 24px rgba(123,97,255,0.4)' }}>
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h3 className="text-xl font-extrabold text-surface">Freemi</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(123,97,255,0.1)', color: '#7B61FF' }}>The Boss</span>
              </div>
              <p className="mt-2 text-sm text-gray-500 max-w-xl">
                Tell Freemi what you need — it hires the right agent, connects your tools, and reports back. Your AI chief of staff that orchestrates everything.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                  style={{ background: 'rgba(123,97,255,0.08)', color: '#7B61FF' }}>All Channels</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* other agents grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((a, i) => (
            <ScrollReveal key={a.key} delay={0.15 + i * 0.06}>
              <div className="rounded-2xl p-5 h-full"
                style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)', borderTop: `2px solid ${a.color}`, transition: 'transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease-out, border-color 300ms ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${a.color}15, 0 4px 12px rgba(0,0,0,0.03)`; e.currentTarget.style.borderColor = `${a.color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${a.color}12` }}>
                    <Bot className="w-4 h-4" style={{ color: a.color }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-surface">{a.name}</h4>
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: a.color }}>{a.role}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {a.channels.map(ch => (
                    <span key={ch} className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                      style={{ background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.35)' }}>{ch}</span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CHANNELS ─────────────────────────────────────────── */

function ChannelsSection() {
  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden">
      <FloatingBg seed={200} density="sparse" />
      <div className="relative z-10">
      <SectionHeader
        badge="Channels"
        title={<>Every channel. Every tool. <span className="text-gradient">One brain.</span></>}
        subtitle="Your agents work wherever your customers are — and connect to whatever tools you use."
      />
      <div className="max-w-5xl mx-auto">
        {/* channel row */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          {/* connecting line */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 -translate-y-1/2 z-0"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(123,97,255,0.2), rgba(47,143,255,0.2), rgba(39,192,135,0.2), transparent)' }}>
            {/* pulse dot */}
            <motion.div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400"
              animate={{ left: ['0%', '100%', '0%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
          {channels.map((ch, i) => (
            <ScrollReveal key={ch.label} delay={0.1 + i * 0.08}>
              <div className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl card-lift"
                style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', minWidth: 160 }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: `${ch.color}12` }}>
                  <ch.icon className="w-6 h-6" style={{ color: ch.color }} />
                </div>
                <h4 className="text-sm font-bold text-surface">{ch.label}</h4>
                <p className="mt-1 text-xs text-gray-400 leading-relaxed">{ch.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}

/* ── HOW IT WORKS ─────────────────────────────────────── */

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6">
      <SectionHeader
        badge="How it works"
        title={<>Live in 48 hours. <span className="text-gradient">Seriously.</span></>}
        subtitle="From first conversation to your AI team running operations — we move fast."
      />
      <div className="max-w-5xl mx-auto">
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* connecting line */}
          <div className="hidden md:block absolute top-[60px] left-[17%] right-[17%] h-0.5 z-0"
            style={{ background: 'linear-gradient(90deg, #7B61FF, rgba(123,97,255,0.2))' }} />
          {steps.map((s, i) => (
            <ScrollReveal key={s.num} delay={0.1 + i * 0.1}>
              <div className="relative text-center">
                <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 8px 24px rgba(123,97,255,0.3)' }}>
                  <span className="text-white font-extrabold text-sm">{s.num}</span>
                </div>
                <div className="rounded-2xl p-6"
                  style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <s.icon className="w-5 h-5 mx-auto mb-3" style={{ color: '#7B61FF' }} />
                  <h4 className="text-base font-bold text-surface">{s.title}</h4>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── STATS ────────────────────────────────────────────── */

function StatsSection() {
  return (
    <section className="py-20 px-6">
      <ScrollReveal direction="none">
        <div className="max-w-5xl mx-auto rounded-3xl py-16 px-8 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(123,97,255,0.1)', boxShadow: '0 16px 48px rgba(123,97,255,0.08)' }}>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-extrabold" style={{ color: '#7B61FF' }}>
                  {s.suffix ? <><CountUp end={parseInt(s.value)} style={{ color: '#7B61FF' }} />{s.suffix}</> : s.value}
                </div>
                <p className="mt-2 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ── INTEGRATIONS ─────────────────────────────────────── */

function IntegrationsSection() {
  const integrationData = [
    { name: 'WhatsApp', Icon: SiWhatsapp, color: '#25D366' },
    { name: 'Gmail', Icon: SiGmail, color: '#EA4335' },
    { name: 'Slack', Icon: SiSlack, color: '#4A154B' },
    { name: 'HubSpot', Icon: SiHubspot, color: '#FF7A59' },
    { name: 'Salesforce', Icon: SiSalesforce, color: '#00A1E0' },
    { name: 'Google Calendar', Icon: SiGooglecalendar, color: '#4285F4' },
    { name: 'Stripe', Icon: SiStripe, color: '#635BFF' },
    { name: 'Calendly', Icon: SiCalendly, color: '#006BFF' },
    { name: 'Notion', Icon: SiNotion, color: '#000000' },
    { name: 'Zapier', Icon: SiZapier, color: '#FF4A00' },
    { name: 'Microsoft Teams', Icon: null, color: '#6264A7', emoji: '👥' },
    { name: 'Pipedrive', Icon: null, color: '#1A1A1A', emoji: '🔵' },
    { name: 'Google Sheets', Icon: SiGooglesheets, color: '#34A853' },
    { name: 'Outlook', Icon: null, color: '#0078D4', emoji: '📨' },
    { name: 'Make', Icon: null, color: '#6D00CC', emoji: '⚡' },
  ];

  return (
    <section className="py-24 md:py-32 px-6">
      <SectionHeader
        badge="Integrations"
        title="Connects to the tools you already use."
        subtitle="40+ integrations out of the box. Your agents work where your business works."
      />
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3">
          {integrationData.map((item, i) => (
            <ScrollReveal key={item.name} delay={i * 0.03}>
              <div className="card-hover flex items-center gap-2.5 px-5 py-3.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.06)' }}>
                {item.Icon ? <item.Icon className="w-4 h-4" style={{ color: item.color }} /> : <span className="text-sm">{item.emoji}</span>}
                <span className="text-sm font-semibold text-surface">{item.name}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={0.5}>
          <p className="text-center mt-8 text-sm font-semibold" style={{ color: '#7B61FF' }}>
            And 30+ more <ArrowRight className="inline w-3 h-3 ml-1" />
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── CTA ──────────────────────────────────────────────── */

function CTAFinalSection() {
  const navigate = useNavigate();
  return (
    <section className="py-20 px-6">
      <ScrollReveal direction="none">
        <div className="max-w-3xl mx-auto rounded-[1.5rem] relative overflow-hidden py-16 px-8 text-center"
          style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8, #2F8FFF)', boxShadow: '0 32px 80px rgba(123,97,255,0.3)' }}>
          {/* dot grid */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          {/* orbs */}
          <motion.div className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent 60%)', top: '-30%', left: '-10%' }}
            animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />

          <div className="relative z-10">
            {/* mini freemi */}
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
              className="mx-auto mb-6 relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)' }} />
              <MiniFreemi color="#ffffff" size={40} />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Your AI workforce is waiting.
            </h2>
            <p className="mt-4 text-base text-white/80 max-w-lg mx-auto">
              7-day free trial. No credit card. Custom agents built for your business — live in 48 hours.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => window.open('https://freemi-studio.web.app', '_blank')}
                className="btn-press px-8 py-4 rounded-2xl font-bold text-sm"
                style={{ background: 'white', color: '#7B61FF', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                Start free trial <ArrowRight className="inline ml-2 w-4 h-4" />
              </button>
              <button onClick={() => navigate('/about')}
                className="btn-press px-8 py-4 rounded-2xl font-semibold text-sm text-white"
                style={{ border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}>
                Talk to us
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ─── main page export ────────────────────────────────── */

export default function Home() {
  return (
    <div className="relative w-full text-surface" style={{
      background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)',
      minHeight: '100vh',
      overflowX: 'clip',
    }}>
      <InteractiveGrid />
      <TopNav />

      <main className="relative z-10">
        <HeroSection />
        <LogoCloudSection />
        <ProductsSection />
        <FreemiAgentSection />
        <AgentShowcaseSection />
        <ChannelsSection />
        <HowItWorksSection />
        <StatsSection />
        <IntegrationsSection />
        <PricingSection />
        <FAQSection />
        <CTAFinalSection />
      </main>

      <SiteFooter />
      <FloatingChatWidget />
    </div>
  );
}
