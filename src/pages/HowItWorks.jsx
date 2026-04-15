import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  SiWhatsapp, SiGmail, SiSlack, SiGooglecalendar, SiHubspot, SiStripe,
  SiSalesforce, SiNotion, SiZapier,
} from 'react-icons/si';
import {
  MessageSquare, Bot, Zap, Sparkles, Globe, ArrowRight, Check,
  Plug, BarChart3, Phone, Send, Calendar, Mail, Star, Shield,
  Palette, Code, Rocket
} from 'lucide-react';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import ScrollReveal from '../components/ScrollReveal';

/* floating bg (shared pattern) */
const ORB_COLORS = ['rgba(123,97,255,0.22)', 'rgba(47,143,255,0.16)', 'rgba(236,72,153,0.14)', 'rgba(39,192,135,0.12)', 'rgba(168,85,247,0.18)'];
const FLOAT_ICONS = [Sparkles, Bot, Zap, Globe, Star, MessageSquare, Calendar, Send, Phone];
function seededRandom(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function FloatingBg({ seed = 42 }) {
  const r = seededRandom(seed); const rand = () => r();
  const gen = (n) => Array.from({ length: n }, () => ({ left: `${5 + rand() * 90}%`, top: `${5 + rand() * 90}%`, delay: rand() * 3, duration: 4 + rand() * 6, size: 14 + rand() * 18 }));
  const orbs = gen(4); const dots = gen(10); const rings = gen(2); const iconItems = gen(8);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((p, i) => <motion.div key={`o${i}`} className="absolute rounded-full" style={{ left: p.left, top: p.top, width: 300 + i * 100, height: 300 + i * 100, background: `radial-gradient(circle, ${ORB_COLORS[i % ORB_COLORS.length]}, transparent 65%)`, filter: `blur(${50 + i * 12}px)` }} animate={{ x: [0, 30 + i * 10, 0], y: [0, -(20 + i * 10), 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />)}
      {rings.map((p, i) => <motion.div key={`r${i}`} className="absolute rounded-full" style={{ left: p.left, top: p.top, width: 100 + i * 50, height: 100 + i * 50, border: '1.5px solid rgba(123,97,255,0.1)', transform: 'translate(-50%,-50%)' }} animate={{ scale: [1, 2.5], opacity: [0.15, 0] }} transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeOut', delay: i * 1.5 }} />)}
      {iconItems.map((p, i) => { const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length]; return <motion.div key={`i${i}`} className="absolute text-purple-500/[0.12]" style={{ left: p.left, top: p.top }} animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}><Icon style={{ width: p.size, height: p.size }} /></motion.div>; })}
      {dots.map((p, i) => <motion.div key={`d${i}`} className="absolute rounded-full bg-purple-500/[0.25]" style={{ left: p.left, top: p.top, width: 3 + (i % 4) * 3, height: 3 + (i % 4) * 3 }} animate={{ opacity: [0.1, 0.7, 0.1], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 1.5 + (i % 4) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />)}
    </div>
  );
}

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemV = { hidden: { opacity: 0, y: 30, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

const process = [
  { step: '01', icon: MessageSquare, title: 'Tell us about your business', desc: 'A quick call or form — share your goals, tools, and what you want automated. Takes 15 minutes.', color: '#7B61FF', lightBg: 'rgba(123,97,255,0.06)', ring: 'rgba(123,97,255,0.1)' },
  { step: '02', icon: Bot, title: 'We build your AI team', desc: 'Custom agents configured for your business — your tone, your rules, your integrations. Ready in 1–2 days.', color: '#2F8FFF', lightBg: 'rgba(47,143,255,0.06)', ring: 'rgba(47,143,255,0.1)' },
  { step: '03', icon: Plug, title: 'Connect your tools', desc: 'Gmail, Calendar, Slack, HubSpot, Stripe, WhatsApp — your agents plug in and start working immediately.', color: '#27C087', lightBg: 'rgba(39,192,135,0.06)', ring: 'rgba(39,192,135,0.1)' },
  { step: '04', icon: Rocket, title: 'Your business runs itself', desc: 'Customers answered 24/7. Bookings confirmed. Leads followed up. Tasks done. You monitor from your dashboard.', color: '#F59E0B', lightBg: 'rgba(245,158,11,0.06)', ring: 'rgba(245,158,11,0.1)' },
];

const capabilities = [
  { icon: MessageSquare, label: 'Customer enquiries answered instantly', color: '#7B61FF' },
  { icon: Calendar, label: 'Bookings handled automatically', color: '#2F8FFF' },
  { icon: Send, label: 'Leads captured and followed up', color: '#27C087' },
  { icon: Mail, label: 'Emails drafted and routed', color: '#E84393' },
  { icon: BarChart3, label: 'Weekly performance reports', color: '#F59E0B' },
  { icon: Plug, label: 'Connected to Gmail, Slack, Calendar, HubSpot', color: '#0984E3' },
];

const integrations = [
  { name: 'WhatsApp', Icon: SiWhatsapp, color: '#25D366' },
  { name: 'Gmail', Icon: SiGmail, color: '#EA4335' },
  { name: 'Slack', Icon: SiSlack, color: '#4A154B' },
  { name: 'Google Calendar', Icon: SiGooglecalendar, color: '#4285F4' },
  { name: 'HubSpot', Icon: SiHubspot, color: '#FF7A59' },
  { name: 'Stripe', Icon: SiStripe, color: '#635BFF' },
  { name: 'Salesforce', Icon: SiSalesforce, color: '#00A1E0' },
  { name: 'Notion', Icon: SiNotion, color: '#000' },
  { name: 'Zapier', Icon: SiZapier, color: '#FF4A00' },
  { name: 'Phone AI', Icon: null, color: '#7B61FF' },
  { name: 'Website Widget', Icon: null, color: '#2F8FFF' },
  { name: 'Make', Icon: null, color: '#6D00CC' },
];

export default function HowItWorks() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <TopNav />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(123,97,255,0.18) 0%, transparent 50%)' }} />
        <FloatingBg seed={55} />
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(123,97,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <motion.div className="relative z-10 max-w-4xl mx-auto px-6 text-center" variants={containerV} initial="hidden" animate="visible">
          <motion.div variants={itemV} className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-purple-200/30 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#7B61FF' }} />
              <span className="text-xs font-semibold text-surface/80 tracking-wide">How Freemi Works</span>
            </div>
          </motion.div>
          <motion.div variants={itemV}><h1 className="mt-8 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-surface">Set up once.</h1></motion.div>
          <motion.div variants={itemV}><h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-gradient">Works forever.</h1></motion.div>
          <motion.p variants={itemV} className="mt-7 text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">Tell us what your business needs. We build custom AI agents, connect them to your tools, and they start working — 24/7, automatically.</motion.p>
          <motion.div variants={itemV} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button onClick={() => window.open('https://studio.freemi.ai', '_blank')} className="relative px-10 py-4 rounded-full text-white font-semibold text-base overflow-hidden group" style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 8px 32px rgba(123,97,255,0.35)' }}>
                <span className="relative z-10 flex items-center gap-2">Start free trial <ArrowRight className="w-4 h-4" /></span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── PROCESS TIMELINE ── */}
      <section className="relative py-28 md:py-36 px-6 overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(123,97,255,0.03) 0%, rgba(47,143,255,0.02) 100%)' }}>
        <FloatingBg seed={66} />
        <div className="flex justify-center mb-1"><div className="h-px w-full max-w-3xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(123,97,255,0.15), transparent)' }} /></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Four steps to <span className="text-gradient-purple">autopilot.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">From first call to AI team running — transparent, fast, built around you.</p></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* connecting line */}
            <motion.div className="hidden md:block absolute h-[2px] overflow-hidden" style={{ top: 64, left: '12%', right: '12%' }}
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #7B61FF, #2F8FFF, #27C087, #F59E0B)' }} />
            </motion.div>
            {process.map((p, i) => (
              <ScrollReveal key={p.step} delay={0.2 + i * 0.15}>
                <div className="text-center relative">
                  <motion.div className="relative inline-flex mb-6"
                    whileHover={{ scale: 1.08, y: -4, rotate: -3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-sm"
                      style={{ background: p.lightBg, border: '4px solid white', boxShadow: `0 0 0 1px ${p.ring}` }}>
                      <p.icon className="w-9 h-9" style={{ color: p.color }} />
                    </div>
                    <motion.div className="absolute -top-2 -right-2 w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg ring-4 ring-white"
                      style={{ background: p.color }}
                      initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.5 + i * 0.15 }}>
                      {p.step}
                    </motion.div>
                  </motion.div>
                  <h3 className="text-lg font-bold text-surface mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[220px] mx-auto">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <ScrollReveal><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase" style={{ background: 'rgba(123,97,255,0.08)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.15)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> What agents handle
            </div></ScrollReveal>
            <ScrollReveal delay={0.1}><h2 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Every job. <span className="text-gradient">Done automatically.</span></h2></ScrollReveal>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {capabilities.map((c, i) => (
              <ScrollReveal key={c.label} delay={0.05 + i * 0.06}>
                <motion.div className="flex items-center gap-4 px-6 py-5 rounded-2xl group"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -4, borderColor: `${c.color}25` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${c.color}10` }}>
                    <c.icon className="w-5 h-5" style={{ color: c.color }} />
                  </div>
                  <span className="text-sm font-semibold text-surface">{c.label}</span>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase mb-6" style={{ background: 'rgba(123,97,255,0.08)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.15)' }}>
            <Plug className="w-3 h-3" /> Integrations
          </div></ScrollReveal>
          <ScrollReveal delay={0.1}><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface mb-4">Connects to <span className="text-gradient">everything.</span></h2></ScrollReveal>
          <ScrollReveal delay={0.15}><p className="text-lg text-gray-500 mb-12 max-w-xl mx-auto">Your agents work where your business works. 40+ integrations out of the box.</p></ScrollReveal>
          <div className="flex flex-wrap justify-center gap-3">
            {integrations.map((tool, i) => (
              <ScrollReveal key={tool.name} delay={i * 0.03}>
                <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.06)', transition: 'transform 200ms ease, box-shadow 200ms ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(123,97,255,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  {tool.Icon ? <tool.Icon className="w-4 h-4" style={{ color: tool.color }} /> : <Phone className="w-4 h-4" style={{ color: tool.color }} />}
                  <span className="text-sm font-semibold text-surface">{tool.name}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <ScrollReveal direction="none">
          <motion.div className="max-w-3xl mx-auto rounded-3xl relative overflow-hidden py-16 px-8 text-center"
            style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8, #2F8FFF)', boxShadow: '0 32px 80px rgba(123,97,255,0.3)' }}>
            {[Sparkles, Bot, Zap, Globe, Star].map((Icon, i) => (
              <motion.div key={i} className="absolute text-white/[0.08] pointer-events-none" style={{ left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%` }}
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}>
                <Icon style={{ width: 28 + i * 6, height: 28 + i * 6 }} />
              </motion.div>
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.15), transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Ready to see it running?</h2>
              <p className="mt-4 text-base text-white/70 max-w-md mx-auto">7-day free trial. No credit card. Custom AI agents live in 48 hours.</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.open('https://studio.freemi.ai', '_blank')} className="px-10 py-4 rounded-full font-bold text-base" style={{ background: 'white', color: '#7B61FF', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    Start free trial <ArrowRight className="inline ml-2 w-4 h-4" />
                  </button>
                </motion.div>
              </div>
              <p className="mt-6 text-xs text-white/40">No credit card required · Cancel anytime</p>
            </div>
          </motion.div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
