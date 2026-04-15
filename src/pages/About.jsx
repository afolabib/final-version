import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Bot, Zap, Globe, Star, Heart, Users,
  Target, Rocket, Shield, Eye, Send, Phone, Calendar,
  MessageSquare, Mail, Check, TrendingUp, Clock, Coffee
} from 'lucide-react';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import ScrollReveal from '../components/ScrollReveal';

const ORB_COLORS = ['rgba(123,97,255,0.22)', 'rgba(47,143,255,0.16)', 'rgba(236,72,153,0.14)', 'rgba(39,192,135,0.12)', 'rgba(168,85,247,0.18)'];
const FLOAT_ICONS = [Sparkles, Bot, Zap, Globe, Star, Heart];
function seededRandom(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function FloatingBg({ seed = 42 }) {
  const r = seededRandom(seed); const rand = () => r();
  const gen = (n) => Array.from({ length: n }, () => ({ left: `${5 + rand() * 90}%`, top: `${5 + rand() * 90}%`, delay: rand() * 3, duration: 4 + rand() * 6, size: 14 + rand() * 18 }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {gen(6).map((p, i) => <motion.div key={`o${i}`} className="absolute rounded-full" style={{ left: p.left, top: p.top, width: 300 + i * 100, height: 300 + i * 100, background: `radial-gradient(circle, ${ORB_COLORS[i % 5]}, transparent 65%)`, filter: `blur(${50 + i * 12}px)` }} animate={{ x: [0, 30 + i * 10, 0], y: [0, -(20 + i * 10), 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />)}
      {gen(10).map((p, i) => { const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length]; return <motion.div key={`i${i}`} className="absolute text-purple-500/[0.12]" style={{ left: p.left, top: p.top }} animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}><Icon style={{ width: p.size, height: p.size }} /></motion.div>; })}
    </div>
  );
}

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemV = { hidden: { opacity: 0, y: 30, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

const timeline = [
  { emoji: '💡', date: 'The Problem', text: 'Small businesses drowning in admin. Missing calls. Losing leads. Spending half their day on work a machine should do.' },
  { emoji: '🔧', date: 'The Idea', text: 'What if every business had an AI employee? Not a chatbot — a real digital worker that connects to tools, takes actions, and runs autonomously.' },
  { emoji: '🚀', date: 'Freemi is Born', text: 'We built it. AI employees that answer calls, handle WhatsApp, manage bookings, follow up leads — 24/7, on autopilot.' },
  { emoji: '📈', date: 'Today', text: 'Businesses across Europe using Freemi to run operations while they focus on what matters. And we\'re just getting started.' },
];

const numbers = [
  { value: '5', label: 'Products', color: '#7B61FF' },
  { value: '6', label: 'Industry verticals', color: '#2F8FFF' },
  { value: '24/7', label: 'AI availability', color: '#27C087' },
  { value: '48hrs', label: 'To go live', color: '#F59E0B' },
];

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <TopNav />

      {/* ── HERO — big bold statement ── */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <FloatingBg seed={400} />
        <div className="absolute inset-0 noise pointer-events-none" />
        <motion.div className="relative z-10 max-w-5xl mx-auto px-6" variants={containerV} initial="hidden" animate="visible">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* left — copy */}
            <div>
              <motion.div variants={itemV}>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-purple-200/30 shadow-sm mb-6">
                  <Heart className="w-3.5 h-3.5" style={{ color: '#7B61FF' }} />
                  <span className="text-xs font-semibold text-surface/80 tracking-wide">About Freemi</span>
                </div>
              </motion.div>
              <motion.h1 variants={itemV} className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-surface">
                We're building the<br />
                <span className="text-gradient">AI workforce.</span>
              </motion.h1>
              <motion.p variants={itemV} className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg">
                Freemi gives every business AI employees that answer calls, handle WhatsApp, manage bookings, and run operations — so humans can focus on what actually matters.
              </motion.p>
              <motion.div variants={itemV} className="mt-8 flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.location.href='/signup'}
                    className="px-8 py-4 rounded-full text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 8px 32px rgba(123,97,255,0.35)' }}>
                    Try Freemi free <ArrowRight className="inline w-4 h-4 ml-1" />
                  </button>
                </motion.div>
                <a href="mailto:hello@freemi.ai" className="text-sm font-semibold" style={{ color: '#7B61FF' }}>
                  hello@freemi.ai
                </a>
              </motion.div>
            </div>

            {/* right — visual: animated counter grid */}
            <motion.div variants={itemV} className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {numbers.map((n, i) => (
                  <motion.div key={n.label}
                    className="rounded-2xl p-6 text-center relative overflow-hidden group"
                    style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${n.color}08, transparent)` }} />
                    <p className="text-4xl font-extrabold relative z-10" style={{ color: n.color }}>{n.value}</p>
                    <p className="text-xs font-semibold text-gray-400 mt-1 relative z-10">{n.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── TIMELINE — our journey ── */}
      <section className="py-16 px-6 relative overflow-hidden">
        <FloatingBg seed={410} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">The <span className="text-gradient-purple">journey.</span></h2>
            </div>
          </ScrollReveal>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2" style={{ background: 'linear-gradient(180deg, #7B61FF, rgba(123,97,255,0.1))' }} />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <ScrollReveal key={item.date} delay={0.1 + i * 0.1}>
                  <div className={`flex items-start gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* content */}
                    <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <motion.div className="rounded-2xl p-6 inline-block max-w-md"
                        style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}
                        whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(123,97,255,0.1)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7B61FF' }}>{item.date}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                      </motion.div>
                    </div>
                    {/* dot */}
                    <div className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl"
                      style={{ background: 'white', border: '2px solid rgba(123,97,255,0.15)', boxShadow: '0 4px 12px rgba(123,97,255,0.1)' }}>
                      {item.emoji}
                    </div>
                    {/* spacer for alternating layout */}
                    <div className="flex-1 hidden md:block" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE BELIEVE — bold statement cards ── */}
      <section className="py-16 px-6 relative overflow-hidden">
        <FloatingBg seed={420} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">What we <span className="text-gradient">believe.</span></h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Eye, title: 'The Vision', quote: 'Freemi becomes the default AI infrastructure for small businesses — like Stripe for payments, Shopify for e-commerce.', color: '#7B61FF', gradient: 'from-purple-500/10 to-blue-500/5' },
              { icon: Target, title: 'The Mission', quote: 'Every small business has an AI team running in the background. Not because they care about AI. Because their business just works.', color: '#2F8FFF', gradient: 'from-blue-500/10 to-cyan-500/5' },
              { icon: Heart, title: 'The Why', quote: 'The best businesses shouldn\'t be held back by admin, missed calls, and repetitive work. Machines should do the boring stuff.', color: '#27C087', gradient: 'from-emerald-500/10 to-teal-500/5' },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={0.1 + i * 0.08}>
                <motion.div className={`rounded-2xl p-7 h-full relative overflow-hidden bg-gradient-to-br ${card.gradient}`}
                  style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="absolute top-5 right-5 text-5xl opacity-[0.06] font-serif">&ldquo;</div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-white"
                    style={{ background: card.color, boxShadow: `0 6px 18px ${card.color}35` }}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: card.color }}>{card.title}</p>
                  <p className="text-base font-semibold text-surface leading-relaxed">&ldquo;{card.quote}&rdquo;</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY WE'RE DIFFERENT — comparison strip ── */}
      <section className="py-16 px-6 relative overflow-hidden">
        <FloatingBg seed={430} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Why we're <span className="text-gradient-purple">not like the rest.</span></h2>
              <p className="mt-3 text-gray-500">Other tools give you features. We give you employees.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 16px 48px rgba(123,97,255,0.06)' }}>
              <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.05), rgba(47,143,255,0.03))' }}>
                <span className="text-gray-400">Feature</span>
                <span className="text-center text-gray-400">Typical SaaS</span>
                <span className="text-center" style={{ color: '#7B61FF' }}>Freemi</span>
              </div>
              {[
                { label: 'Full AI team, not just a tool', them: false, us: true },
                { label: 'Done for you — we set it all up', them: false, us: true },
                { label: 'Live in 48 hours', them: false, us: true },
                { label: 'Works on WhatsApp, phone, web, email', them: false, us: true },
                { label: 'Learns your business automatically', them: false, us: true },
                { label: 'Costs less than one hire', them: true, us: true },
                { label: 'Has a dashboard', them: true, us: true },
              ].map((row, i) => (
                <motion.div key={row.label}
                  className={`grid grid-cols-3 px-6 py-3.5 items-center text-sm border-t ${i % 2 ? '' : ''}`}
                  style={{ borderColor: 'rgba(0,0,0,0.04)' }}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}>
                  <span className="font-medium text-gray-700 text-xs">{row.label}</span>
                  <div className="flex justify-center">
                    {row.them ? <Check className="w-4 h-4 text-gray-300" /> : <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-400 text-[10px] font-bold">✕</span>}
                  </div>
                  <div className="flex justify-center">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(123,97,255,0.1)' }}>
                      <Check className="w-3 h-3" style={{ color: '#7B61FF' }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── PRODUCTS BENTO ── */}
      <section className="py-16 px-6 relative overflow-hidden">
        <FloatingBg seed={420} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">What we <span className="text-gradient-purple">build.</span></h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* big card */}
            <ScrollReveal delay={0.05}>
              <motion.div onClick={() => navigate('/products/studio')}
                className="md:row-span-2 rounded-2xl p-8 h-full cursor-pointer group relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.06), rgba(47,143,255,0.03))', border: '1px solid rgba(123,97,255,0.1)' }}
                whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white" style={{ background: '#7B61FF', boxShadow: '0 8px 24px rgba(123,97,255,0.3)' }}>
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold text-surface mb-2">Studio</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">AI-powered websites built for you. Not just a site — a business with an AI team inside it from day one. We design, build, and manage everything.</p>
                <div className="flex items-center gap-1 text-xs font-bold group-hover:gap-2 transition-all" style={{ color: '#7B61FF' }}>
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            </ScrollReveal>
            {/* smaller cards */}
            {[
              { icon: MessageSquare, title: 'Concierge', desc: 'AI chat widget. 24/7 answers.', link: '/products/concierge', color: '#2F8FFF' },
              { icon: Phone, title: 'Voice', desc: 'AI phone agent. Every call.', link: '/products/voice', color: '#27C087' },
              { icon: Send, title: 'WhatsApp', desc: 'Auto-replies. Orders. Chat.', link: '/products/whatsapp', color: '#25D366' },
              { icon: Calendar, title: 'Bookings', desc: 'AI appointments. Any channel.', link: '/products/bookings', color: '#F59E0B' },
            ].map((p, i) => (
              <ScrollReveal key={p.title} delay={0.1 + i * 0.06}>
                <motion.div onClick={() => navigate(p.link)}
                  className="rounded-2xl p-5 h-full cursor-pointer group flex items-center gap-4"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -3, borderColor: `${p.color}25` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${p.color}12` }}>
                    <p.icon className="w-5 h-5" style={{ color: p.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-surface">{p.title}</h4>
                    <p className="text-xs text-gray-400">{p.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-6">
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
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Let's talk.</h2>
              <p className="mt-4 text-base text-white/70 max-w-md mx-auto">
                Whether you're a one-person business or a growing team — we'd love to hear what you're building.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <a href="mailto:hello@freemi.ai" className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-base"
                    style={{ background: 'white', color: '#7B61FF', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    <Mail className="w-4 h-4" /> hello@freemi.ai
                  </a>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.location.href='/signup'}
                    className="px-10 py-4 rounded-full font-semibold text-base text-white"
                    style={{ border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}>
                    Start free trial
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
