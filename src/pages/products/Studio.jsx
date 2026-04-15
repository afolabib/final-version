import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Palette, Bot, BarChart3, Sparkles, Shield, Zap, Code, ArrowRight, Check,
  Star, Phone, Mail, MessageSquare, Calendar, Users, Smartphone, Search, Lock,
  Layers, Monitor, Gauge, Scissors, Building2, Stethoscope, Utensils, Dumbbell, ShoppingBag, X
} from 'lucide-react';
import TopNav from '../../components/TopNav';
import SiteFooter from '../../components/SiteFooter';
import ScrollReveal from '../../components/ScrollReveal';

const ORB_COLORS = ['rgba(123,97,255,0.22)', 'rgba(47,143,255,0.16)', 'rgba(236,72,153,0.14)', 'rgba(39,192,135,0.12)', 'rgba(168,85,247,0.18)'];
const FLOAT_ICONS = [Sparkles, Bot, Zap, Globe, Star, Palette, Code, Monitor];
function seededRandom(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function FloatingBg({ seed = 42 }) {
  const r = seededRandom(seed); const rand = () => r();
  const gen = (n) => Array.from({ length: n }, () => ({ left: `${5 + rand() * 90}%`, top: `${5 + rand() * 90}%`, delay: rand() * 3, duration: 4 + rand() * 6, size: 14 + rand() * 18 }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {gen(5).map((p, i) => <motion.div key={`o${i}`} className="absolute rounded-full" style={{ left: p.left, top: p.top, width: 300 + i * 100, height: 300 + i * 100, background: `radial-gradient(circle, ${ORB_COLORS[i % 5]}, transparent 65%)`, filter: `blur(${50 + i * 12}px)` }} animate={{ x: [0, 30 + i * 10, 0], y: [0, -(20 + i * 10), 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />)}
      {gen(10).map((p, i) => { const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length]; return <motion.div key={`i${i}`} className="absolute text-purple-500/[0.12]" style={{ left: p.left, top: p.top }} animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}><Icon style={{ width: p.size, height: p.size }} /></motion.div>; })}
    </div>
  );
}

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemV = { hidden: { opacity: 0, y: 30, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

const features = [
  { icon: Palette, title: 'Bespoke Design', desc: 'Designed from scratch to match your brand — no templates, no cookie-cutter layouts.', color: '#7B61FF', span: 'md:col-span-2 md:row-span-2' },
  { icon: Smartphone, title: 'Fully Responsive', desc: 'Flawless on every device — desktop, tablet, and mobile.', color: '#2F8FFF' },
  { icon: Gauge, title: 'Blazing Performance', desc: 'Sub-second load times and optimised assets.', color: '#27C087' },
  { icon: Search, title: 'SEO-First', desc: 'Clean markup, semantic HTML, meta tags, and structured data baked in.', color: '#F59E0B' },
  { icon: Lock, title: 'Secure & Reliable', desc: 'SSL, secure hosting, regular backups included.', color: '#E84393' },
  { icon: Layers, title: 'AI-Ready', desc: 'Built to integrate with AI Concierge, smart chat, and analytics from day one.', color: '#0984E3', span: 'md:col-span-2' },
];

const process = [
  { step: '01', icon: MessageSquare, title: 'Discovery', desc: 'We learn your business, audience, and goals. Map out sitemap and conversion strategy.', color: '#7B61FF', ring: 'rgba(123,97,255,0.1)', lightBg: 'rgba(123,97,255,0.06)' },
  { step: '02', icon: Palette, title: 'Design', desc: 'Full interactive prototype. We iterate until every interaction feels right.', color: '#2F8FFF', ring: 'rgba(47,143,255,0.1)', lightBg: 'rgba(47,143,255,0.06)' },
  { step: '03', icon: Code, title: 'Build', desc: 'Hand-coded with modern frameworks, optimised for speed and SEO.', color: '#27C087', ring: 'rgba(39,192,135,0.1)', lightBg: 'rgba(39,192,135,0.06)' },
  { step: '04', icon: Zap, title: 'Launch', desc: "We deploy, monitor, and fine-tune. Support included — we don't disappear.", color: '#F59E0B', ring: 'rgba(245,158,11,0.1)', lightBg: 'rgba(245,158,11,0.06)' },
];

const differentiators = [
  { label: 'Custom design, not templates', us: true, others: false },
  { label: 'Hand-coded for performance', us: true, others: false },
  { label: 'AI features built in', us: true, others: false },
  { label: 'SEO optimised from day one', us: true, others: true },
  { label: 'Mobile responsive', us: true, others: true },
  { label: 'Ongoing support included', us: true, others: false },
  { label: 'Conversion strategy built in', us: true, others: false },
  { label: 'Sub-second load times', us: true, others: false },
];

export default function ProductStudio() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <TopNav />

      {/* ═══ HERO — two column with browser mockup ═══ */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16">
        <FloatingBg seed={42} />
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(123,97,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* left — copy */}
            <motion.div variants={containerV} initial="hidden" animate="visible">
              <motion.div variants={itemV}>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-purple-200/30 shadow-sm mb-8">
                  <Globe className="w-3.5 h-3.5" style={{ color: '#7B61FF' }} />
                  <span className="text-xs font-semibold text-surface/80 tracking-wide">Freemi | Studio</span>
                </div>
              </motion.div>
              <motion.h1 variants={itemV} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                World-Class Websites.<br />
                <span className="text-gradient-purple">Built to Convert.</span>
              </motion.h1>
              <motion.p variants={itemV} className="text-base md:text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
                We design and build stunning, high-performance websites from scratch — no templates, no page builders. Every site ships with AI built in from day one.
              </motion.p>
              <motion.div variants={itemV} className="flex flex-col sm:flex-row gap-3 mb-8">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.open('https://studio.freemi.ai', '_blank')}
                    className="relative px-8 py-4 rounded-full text-white font-semibold text-base overflow-hidden group"
                    style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 8px 32px rgba(123,97,255,0.35)' }}>
                    <span className="relative z-10 flex items-center gap-2">Start Your Project <ArrowRight className="w-4 h-4" /></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  </button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <a href="mailto:hello@freemi.ai" className="px-8 py-4 rounded-full font-semibold text-sm bg-white/60 backdrop-blur-sm inline-flex items-center" style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#374151' }}>Talk to us</a>
                </motion.div>
              </motion.div>
              <motion.div variants={itemV} className="flex flex-wrap gap-x-5 gap-y-2">
                {['Custom design', 'Blazing fast', 'SEO optimised', 'AI-ready'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-emerald-600" /></div>
                    {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* right — browser mockup */}
            <motion.div className="hidden lg:block relative"
              initial={{ opacity: 0, x: 40, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 40px 80px rgba(123,97,255,0.12)' }}>
                {/* chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
                  <div className="flex-1 mx-8"><div className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-400">yourbusiness.com</div></div>
                </div>
                {/* page content */}
                <div className="p-6 space-y-4">
                  <div className="h-3 bg-purple-200/40 rounded-full w-2/3" />
                  <div className="h-8 bg-gradient-to-r from-purple-100/60 to-blue-100/40 rounded-xl w-full" />
                  <div className="h-3 bg-gray-200/40 rounded-full w-5/6" />
                  <div className="h-3 bg-gray-200/30 rounded-full w-4/6" />
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {[{ c: 'bg-purple-50' }, { c: 'bg-blue-50' }, { c: 'bg-emerald-50' }].map((b, i) => (
                      <div key={i} className={`${b.c} rounded-xl p-4 space-y-2`}>
                        <div className="w-8 h-8 rounded-lg bg-white/60" />
                        <div className="h-2 bg-white/40 rounded-full w-3/4" />
                        <div className="h-2 bg-white/30 rounded-full w-1/2" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <div className="h-10 bg-purple-200/30 rounded-full flex-1" />
                    <div className="h-10 bg-gray-100 rounded-full w-32" />
                  </div>
                </div>
              </div>
              {/* floating badges */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center"><Zap className="w-3 h-3 text-emerald-600" /></div>
                <span className="text-xs font-semibold text-surface">0.8s load time</span>
              </motion.div>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-3 -left-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-purple-500/15 flex items-center justify-center"><Bot className="w-3 h-3 text-purple-600" /></div>
                <span className="text-xs font-semibold text-surface">AI Concierge active</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ v: '100%', l: 'Custom designed' }, { v: '<1s', l: 'Average load time' }, { v: '48hrs', l: 'Delivery time' }, { v: '24/7', l: 'AI Always On' }].map((s, i) => (
            <ScrollReveal key={s.l} delay={i * 0.08}>
              <div className="text-center"><p className="text-3xl md:text-4xl font-extrabold" style={{ color: '#7B61FF' }}>{s.v}</p><p className="mt-1 text-sm text-gray-500 font-medium">{s.l}</p></div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES — BENTO GRID ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={52} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Every detail, <span className="text-gradient-purple">obsessively crafted.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">We don't cut corners. Every site is designed, coded, and optimised to the highest standard.</p></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={0.05 + i * 0.06}>
                <motion.div className={`relative h-full rounded-2xl p-7 overflow-hidden group ${f.span || ''}`}
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -6, borderColor: `${f.color}30` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${f.color}06, transparent)` }} />
                  <div className="relative z-10">
                    <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: `${f.color}10` }}
                      whileHover={{ scale: 1.1, rotate: -5 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                      <f.icon className="w-6 h-6" style={{ color: f.color }} />
                    </motion.div>
                    <h3 className="text-base font-bold text-surface mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                  <ArrowRight className="absolute top-7 right-7 w-4 h-4 text-gray-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROCESS — 4 STEPS ═══ */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(123,97,255,0.03), rgba(47,143,255,0.02))' }}>
        <FloatingBg seed={62} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Our <span className="text-gradient-purple">Process.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">From first call to live site — transparent, collaborative, built around you.</p></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
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
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[200px] mx-auto">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ US VS OTHERS ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={72} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Why we're <span className="text-gradient-purple">not like the rest.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-3 text-gray-500">Template agencies deliver templates. We deliver results.</p></ScrollReveal>
          </div>
          <ScrollReveal delay={0.15}>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 16px 48px rgba(123,97,255,0.06)' }}>
              <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.05), rgba(47,143,255,0.03))' }}>
                <span className="text-gray-400">Feature</span>
                <span className="text-center text-gray-400">Typical Agency</span>
                <span className="text-center" style={{ color: '#7B61FF' }}>Freemi Studio</span>
              </div>
              {differentiators.map((row, i) => (
                <motion.div key={row.label} className="grid grid-cols-3 px-6 py-3.5 items-center text-sm border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                  <span className="font-medium text-gray-700 text-xs">{row.label}</span>
                  <div className="flex justify-center">
                    {row.others ? <Check className="w-4 h-4 text-gray-300" /> : <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-400 text-[10px] font-bold">✕</span>}
                  </div>
                  <div className="flex justify-center">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(123,97,255,0.1)' }}><Check className="w-3 h-3" style={{ color: '#7B61FF' }} /></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="py-20 px-6">
        <ScrollReveal>
          <div className="max-w-lg mx-auto">
            <div className="rounded-3xl p-10 text-center relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 16px 48px rgba(123,97,255,0.08)' }}>
              <h3 className="text-2xl font-extrabold text-surface">Simple pricing</h3>
              <div className="mt-6 flex items-baseline justify-center gap-1.5">
                <span className="text-5xl font-extrabold" style={{ color: '#7B61FF' }}>€1,500</span>
                <span className="text-gray-400 text-base font-medium">/one-off</span>
              </div>
              <p className="mt-2 text-sm text-gray-400">+ €49.99/month for AI agents, hosting & management</p>
              <div className="mt-6 space-y-3 text-left">
                {['Professional custom website', 'AI concierge embedded', 'Bookings & lead capture', 'Full analytics dashboard', 'Ongoing hosting & management', 'Connected to your tools', 'Mobile responsive', 'SEO optimised'].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(123,97,255,0.1)' }}><Check className="w-3 h-3" style={{ color: '#7B61FF' }} /></div>
                    <span className="text-sm text-gray-600">{f}</span>
                  </div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-8">
                <button onClick={() => window.open('https://studio.freemi.ai', '_blank')}
                  className="w-full py-4 rounded-full text-white font-bold text-base relative overflow-hidden group"
                  style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 8px 24px rgba(123,97,255,0.3)' }}>
                  <span className="relative z-10">Start your project →</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                </button>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={82} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Loved by <span className="text-gradient">businesses.</span></h2></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: 'They built our site in 2 days and the AI was answering customers before we even announced the launch.', name: 'Sarah Chen', role: 'Founder, Bloom Studio', gradient: 'linear-gradient(135deg, #7B61FF, #2F8FFF)' },
              { quote: 'We went from missing 30 enquiries a week to zero. The AI handles everything — bookings, questions, follow-ups.', name: 'Marcus Rivera', role: 'Owner, GreenPath Clinic', gradient: 'linear-gradient(135deg, #2F8FFF, #06B6D4)' },
              { quote: 'The dashboard alone is worth it. Full visibility into every conversation, every lead, every booking.', name: 'Emily Okafor', role: 'Director, Rivera Consulting', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
            ].map((t, i) => (
              <ScrollReveal key={t.name} delay={0.1 + i * 0.08}>
                <div className="relative rounded-2xl p-6 h-full group"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', transition: 'transform 300ms ease, border-color 300ms ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(123,97,255,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}>
                  <div className="absolute top-4 right-4 text-6xl text-gray-200/50 font-serif leading-none">&ldquo;</div>
                  <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
                  <blockquote className="text-sm text-gray-600 leading-relaxed relative z-10">&ldquo;{t.quote}&rdquo;</blockquote>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: t.gradient }}>{t.name.split(' ').map(n => n[0]).join('')}</div>
                    <div><p className="text-sm font-bold text-surface">{t.name}</p><p className="text-xs text-gray-400">{t.role}</p></div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 px-6">
        <ScrollReveal direction="none">
          <motion.div className="max-w-4xl mx-auto rounded-3xl relative overflow-hidden py-16 px-8 text-center"
            style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8, #2F8FFF)', boxShadow: '0 32px 80px rgba(123,97,255,0.3)' }}>
            {[Sparkles, Globe, Code, Palette, Zap, Bot, Star].map((Icon, i) => (
              <motion.div key={i} className="absolute text-white/[0.08] pointer-events-none" style={{ left: `${10 + i * 13}%`, top: `${15 + (i % 3) * 25}%` }}
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}>
                <Icon style={{ width: 28 + i * 6, height: 28 + i * 6 }} />
              </motion.div>
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.15), transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Ready for a Website That<br />Actually Works?</h2>
              <p className="mt-4 text-base text-white/70 max-w-md mx-auto">Every project comes with AI built in from day one. Custom design. Live in 48 hours.</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.open('https://studio.freemi.ai', '_blank')}
                    className="px-10 py-4 rounded-full font-bold text-base" style={{ background: 'white', color: '#7B61FF', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    Start Your Project <ArrowRight className="inline ml-2 w-4 h-4" />
                  </button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <a href="mailto:hello@freemi.ai" className="px-10 py-4 rounded-full font-semibold text-base text-white inline-block" style={{ border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}>Talk to us</a>
                </motion.div>
              </div>
              <p className="mt-6 text-xs text-white/40">No setup fees · 3-month kickoff · Cancel anytime</p>
            </div>
          </motion.div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
