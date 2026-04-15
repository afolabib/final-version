import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Brain, Clock, Paintbrush, BarChart3, Zap, Shield, Globe, ArrowRight, Check,
  Star, Bot, Code, Sparkles, Scissors, Building2, Stethoscope, Utensils, GraduationCap, ShoppingBag, X, Smartphone, Layers
} from 'lucide-react';
import TopNav from '../../components/TopNav';
import SiteFooter from '../../components/SiteFooter';
import ScrollReveal from '../../components/ScrollReveal';

const ORB_COLORS = ['rgba(47,143,255,0.22)', 'rgba(123,97,255,0.16)', 'rgba(39,192,135,0.14)', 'rgba(236,72,153,0.12)'];
const FLOAT_ICONS = [Sparkles, Bot, Zap, Globe, Star, MessageSquare, Brain, Shield];
function seededRandom(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function FloatingBg({ seed = 42 }) {
  const r = seededRandom(seed); const rand = () => r();
  const gen = (n) => Array.from({ length: n }, () => ({ left: `${5 + rand() * 90}%`, top: `${5 + rand() * 90}%`, delay: rand() * 3, duration: 4 + rand() * 6, size: 14 + rand() * 18 }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {gen(5).map((p, i) => <motion.div key={`o${i}`} className="absolute rounded-full" style={{ left: p.left, top: p.top, width: 300 + i * 100, height: 300 + i * 100, background: `radial-gradient(circle, ${ORB_COLORS[i % 4]}, transparent 65%)`, filter: `blur(${50 + i * 12}px)` }} animate={{ x: [0, 30 + i * 10, 0], y: [0, -(20 + i * 10), 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />)}
      {gen(10).map((p, i) => { const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length]; return <motion.div key={`i${i}`} className="absolute text-blue-500/[0.1]" style={{ left: p.left, top: p.top }} animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}><Icon style={{ width: p.size, height: p.size }} /></motion.div>; })}
    </div>
  );
}

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemV = { hidden: { opacity: 0, y: 30, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

const features = [
  { icon: Brain, title: 'Trained on your business', desc: 'Upload your FAQs, services, pricing, policies — your AI learns everything and answers like a team member.', color: '#2F8FFF', span: 'md:col-span-2 md:row-span-2' },
  { icon: Clock, title: 'Works 24/7', desc: 'Never misses a customer. Handles enquiries at 3am just as well as 3pm.', color: '#7B61FF' },
  { icon: Paintbrush, title: 'Matches your brand', desc: 'Fully customisable design, tone, and personality. Feels like part of your site.', color: '#E84393' },
  { icon: Zap, title: 'One-line install', desc: 'Paste one script tag. Works on WordPress, Shopify, Squarespace, custom. 60 seconds.', color: '#27C087' },
  { icon: Shield, title: 'Smart escalation', desc: 'Captures details and escalates to you via email or Slack when it can\'t handle something.', color: '#F59E0B' },
  { icon: BarChart3, title: 'Every lead captured', desc: 'Every conversation, booking request, and lead logged to your dashboard. Nothing falls through.', color: '#0984E3', span: 'md:col-span-2' },
];

const differentiators = [
  { label: 'Trained on YOUR business', us: true, others: false },
  { label: 'Books real appointments', us: true, others: false },
  { label: 'Natural conversation', us: true, others: false },
  { label: 'Captures leads automatically', us: true, others: true },
  { label: 'Available 24/7', us: true, others: true },
  { label: 'One-line install', us: true, others: true },
  { label: 'Smart escalation to humans', us: true, others: false },
  { label: 'Full conversation analytics', us: true, others: false },
];

export default function ProductConcierge() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <TopNav />

      {/* ═══ HERO — two column with widget demo ═══ */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16">
        <FloatingBg seed={77} />
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(47,143,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* left — copy */}
            <motion.div variants={containerV} initial="hidden" animate="visible">
              <motion.div variants={itemV}>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-blue-200/30 shadow-sm mb-8">
                  <MessageSquare className="w-3.5 h-3.5" style={{ color: '#2F8FFF' }} />
                  <span className="text-xs font-semibold text-surface/80 tracking-wide">Freemi | Concierge</span>
                </div>
              </motion.div>
              <motion.h1 variants={itemV} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                An AI That Answers<br />
                <span style={{ color: '#2F8FFF' }}>Your Customers. 24/7.</span>
              </motion.h1>
              <motion.p variants={itemV} className="text-base md:text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
                One line of code. An AI concierge on your website that knows your business, answers every question, captures leads, and books appointments — automatically.
              </motion.p>
              <motion.div variants={itemV} className="flex flex-col sm:flex-row gap-3 mb-8">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')}
                    className="relative px-8 py-4 rounded-full text-white font-semibold text-base overflow-hidden group"
                    style={{ background: 'linear-gradient(135deg, #2F8FFF, #1D6FD3)', boxShadow: '0 8px 32px rgba(47,143,255,0.35)' }}>
                    <span className="relative z-10 flex items-center gap-2">Start free trial <ArrowRight className="w-4 h-4" /></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  </button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <a href="mailto:hello@freemi.ai" className="px-8 py-4 rounded-full font-semibold text-sm bg-white/60 backdrop-blur-sm inline-flex items-center" style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#374151' }}>Talk to us</a>
                </motion.div>
              </motion.div>
              <motion.div variants={itemV} className="flex flex-wrap gap-x-5 gap-y-2">
                {['No credit card', 'Live in 60 seconds', '7-day free trial', 'Any website'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-emerald-600" /></div>
                    {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* right — website with widget mockup */}
            <motion.div className="hidden lg:block relative" style={{ perspective: "1200px" }}
              initial={{ opacity: 0, x: 40, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              {/* website background */}
              <div className="relative rounded-2xl overflow-hidden" style={{ background: '#FAFBFF', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 40px 80px rgba(47,143,255,0.1)' }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
                  <div className="flex-1 mx-8"><div className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-400">yourbusiness.com</div></div>
                </div>
                <div className="p-6 min-h-[360px] relative">
                  {/* fake website content */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100" />
                    <span className="text-xs font-bold text-gray-700">GreenPath Clinic</span>
                    <div className="flex-1" />
                    <div className="hidden md:flex gap-4 text-[10px] text-gray-400"><span>Home</span><span>Services</span><span>Contact</span></div>
                  </div>
                  <div className="h-3 bg-gray-200/40 rounded-full w-2/3 mb-2" />
                  <div className="h-5 bg-emerald-100/60 rounded-lg w-full mb-2" />
                  <div className="h-3 bg-gray-200/30 rounded-full w-4/6 mb-6" />
                  <div className="grid grid-cols-2 gap-3">
                    {[{ c: 'bg-emerald-50' }, { c: 'bg-blue-50' }, { c: 'bg-purple-50' }, { c: 'bg-amber-50' }].map((b, i) => (
                      <div key={i} className={`${b.c} rounded-lg p-3`}>
                        <div className="w-6 h-6 rounded bg-white/60 mb-1.5" />
                        <div className="h-2 bg-white/40 rounded-full w-3/4" />
                      </div>
                    ))}
                  </div>

                  {/* chat widget popup — bottom right */}
                  <div className="absolute bottom-3 right-3 w-64 rounded-2xl overflow-hidden shadow-xl" style={{ border: '1px solid rgba(47,143,255,0.15)', background: 'white' }}>
                    <div className="px-3 py-2 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #2F8FFF, #1D6FD3)' }}>
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><Bot className="w-3 h-3 text-white" /></div>
                      <div><p className="text-[10px] font-bold text-white">AI Concierge</p><p className="text-[7px] text-white/60">Replies instantly</p></div>
                    </div>
                    <div className="p-2.5 space-y-1.5">
                      <div className="rounded-xl px-2.5 py-1.5 text-[9px] text-gray-600 leading-relaxed" style={{ background: 'rgba(0,0,0,0.03)' }}>Hi! 👋 How can I help you today?</div>
                      <div className="rounded-xl px-2.5 py-1.5 text-[9px] leading-relaxed ml-auto max-w-[80%]" style={{ background: 'rgba(47,143,255,0.08)', color: '#1D6FD3' }}>Do you have availability this week?</div>
                      <div className="rounded-xl px-2.5 py-1.5 text-[9px] text-gray-600 leading-relaxed" style={{ background: 'rgba(0,0,0,0.03)', whiteSpace: 'pre-line' }}>Yes! Here's what's free:{'\n'}✅ Wed 10:00 AM{'\n'}✅ Thu 2:30 PM{'\n'}✅ Fri 11:00 AM</div>
                    </div>
                    <div className="px-2.5 py-2 border-t border-gray-100 flex gap-1.5">
                      <div className="flex-1 rounded-full px-2.5 py-1 text-[8px] text-gray-300 bg-gray-50 border border-gray-100">Type a message...</div>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#2F8FFF' }}><ArrowRight className="w-2.5 h-2.5 text-white" /></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* floating badges */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-600" /></div>
                <span className="text-xs font-semibold text-surface">Lead captured</span>
              </motion.div>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-3 -left-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center"><MessageSquare className="w-3 h-3 text-blue-600" /></div>
                <span className="text-xs font-semibold text-surface">73% auto-resolved</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ v: '<8s', l: 'Average response' }, { v: '73%', l: 'Auto-resolved' }, { v: '3×', l: 'More leads' }, { v: '60s', l: 'Setup time' }].map((s, i) => (
            <ScrollReveal key={s.l} delay={i * 0.08}>
              <div className="text-center"><p className="text-3xl md:text-4xl font-extrabold" style={{ color: '#2F8FFF' }}>{s.v}</p><p className="mt-1 text-sm text-gray-500 font-medium">{s.l}</p></div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES — BENTO ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={87} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Everything you need. <span style={{ color: '#2F8FFF' }}>Nothing you don't.</span></h2></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={0.05 + i * 0.06}>
                <motion.div className={`relative h-full rounded-2xl p-7 overflow-hidden group ${f.span || ''}`}
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -6, borderColor: `${f.color}30` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(135deg, ${f.color}06, transparent)` }} />
                  <div className="relative z-10">
                    <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.color}10` }}
                      whileHover={{ scale: 1.1, rotate: -5 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                      <f.icon className="w-6 h-6" style={{ color: f.color }} />
                    </motion.div>
                    <h3 className="text-base font-bold text-surface mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                  <ArrowRight className="absolute top-7 right-7 w-4 h-4 text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(47,143,255,0.03), rgba(123,97,255,0.02))' }}>
        <FloatingBg seed={97} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Live in <span style={{ color: '#2F8FFF' }}>60 seconds.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">Three steps. No technical knowledge needed.</p></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <motion.div className="hidden md:block absolute h-[2px] overflow-hidden" style={{ top: 64, left: '17%', right: '17%' }}
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #2F8FFF, #7B61FF, #27C087)' }} />
            </motion.div>
            {[
              { step: '01', icon: Globe, title: 'Add to your website', desc: 'Paste one line of code. Works on any site — WordPress, Shopify, Wix, custom.', color: '#2F8FFF' },
              { step: '02', icon: Brain, title: 'Train your AI', desc: 'Upload your FAQs, services, and business info. Or we do it for you.', color: '#7B61FF' },
              { step: '03', icon: MessageSquare, title: 'Customers get answered', desc: 'Live 24/7. Answers questions, captures leads, books appointments.', color: '#27C087' },
            ].map((s, i) => (
              <ScrollReveal key={s.step} delay={0.2 + i * 0.15}>
                <div className="text-center relative">
                  <motion.div className="relative inline-flex mb-6" whileHover={{ scale: 1.08, y: -4, rotate: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: `${s.color}08`, border: '4px solid white', boxShadow: `0 0 0 1px ${s.color}15` }}>
                      <s.icon className="w-9 h-9" style={{ color: s.color }} />
                    </div>
                    <motion.div className="absolute -top-2 -right-2 w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg ring-4 ring-white"
                      style={{ background: s.color }} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.5 + i * 0.15 }}>{s.step}</motion.div>
                  </motion.div>
                  <h3 className="text-lg font-bold text-surface mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[220px] mx-auto">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ US VS CHATBOTS ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={107} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Not a chatbot. <span style={{ color: '#2F8FFF' }}>An AI concierge.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-3 text-gray-500">Chatbots follow scripts. Freemi actually thinks.</p></ScrollReveal>
          </div>
          <ScrollReveal delay={0.15}>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 16px 48px rgba(47,143,255,0.06)' }}>
              <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ background: 'linear-gradient(135deg, rgba(47,143,255,0.05), rgba(123,97,255,0.03))' }}>
                <span className="text-gray-400">Capability</span>
                <span className="text-center text-gray-400">Typical Chatbot</span>
                <span className="text-center" style={{ color: '#2F8FFF' }}>Freemi Concierge</span>
              </div>
              {differentiators.map((row, i) => (
                <motion.div key={row.label} className="grid grid-cols-3 px-6 py-3.5 items-center text-sm border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                  <span className="font-medium text-gray-700 text-xs">{row.label}</span>
                  <div className="flex justify-center">{row.others ? <Check className="w-4 h-4 text-gray-300" /> : <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-400 text-[10px] font-bold">✕</span>}</div>
                  <div className="flex justify-center"><div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(47,143,255,0.1)' }}><Check className="w-3 h-3" style={{ color: '#2F8FFF' }} /></div></div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(47,143,255,0.04), rgba(123,97,255,0.02))' }}>
        <FloatingBg seed={117} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Built for <span style={{ color: '#2F8FFF' }}>every industry.</span></h2></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Scissors, title: 'Salons & Spas', desc: 'Instant answers about services, pricing, availability. Books appointments from chat.', color: '#E84393', metric: '89%' },
              { icon: Building2, title: 'Law & Accounting', desc: 'Qualifies clients, answers legal questions, books consultations.', color: '#7B61FF', metric: '3×' },
              { icon: Stethoscope, title: 'Medical Clinics', desc: 'Appointment requests, insurance questions, prescription refills.', color: '#2F8FFF', metric: '73%' },
              { icon: Utensils, title: 'Restaurants', desc: 'Reservations, menu questions, dietary enquiries, event bookings.', color: '#27C087', metric: '24/7' },
              { icon: GraduationCap, title: 'Education', desc: 'Course enquiries, enrollment, schedules — all handled instantly.', color: '#F59E0B', metric: '60%' },
              { icon: ShoppingBag, title: 'E-Commerce', desc: 'Product Q&A, order status, returns — customer service that scales.', color: '#0984E3', metric: '4s' },
            ].map((uc, i) => (
              <ScrollReveal key={uc.title} delay={0.1 + i * 0.06}>
                <motion.div className="rounded-2xl p-6 h-full group relative overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -6, borderColor: `${uc.color}25` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${uc.color}10` }}>
                      <uc.icon className="w-5 h-5" style={{ color: uc.color }} />
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg text-white" style={{ background: uc.color }}>{uc.metric}</span>
                  </div>
                  <h4 className="text-base font-bold text-surface">{uc.title}</h4>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{uc.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="py-20 px-6">
        <ScrollReveal>
          <div className="max-w-lg mx-auto">
            <div className="rounded-3xl p-10 text-center" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 16px 48px rgba(47,143,255,0.08)' }}>
              <h3 className="text-2xl font-extrabold text-surface mb-10">Simple pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                {/* Basic */}
                <div className="rounded-2xl p-7 relative" style={{ background: 'rgba(255,255,255,0.95)', border: '2px solid #2F8FFF30', boxShadow: '0 8px 32px #2F8FFF12' }}>
                  <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: '#2F8FFF' }}>Most Popular</div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Basic</p>
                  <div className="flex items-baseline gap-1 mt-2"><span className="text-4xl font-extrabold" style={{ color: '#2F8FFF' }}>€19.99</span><span className="text-gray-400 text-sm">/month</span></div>
                  <p className="text-xs text-gray-400 mt-2 mb-5">Everything you need to get started.</p>
                  <div className="space-y-2.5">
                    {['AI chat widget', 'Trained on your business', 'Lead capture', 'Booking integration', 'Brand customisation', 'Conversation analytics'].map(f => (
                      <div key={f} className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: '#2F8FFF15' }}><Check className="w-2.5 h-2.5" style={{ color: '#2F8FFF' }} /></div><span className="text-xs text-gray-600">{f}</span></div>
                    ))}
                  </div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6">
                    <button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')} className="w-full py-3.5 rounded-full text-white font-bold text-sm" style={{ background: `linear-gradient(135deg, #2F8FFF, #2F8FFFCC)`, boxShadow: `0 6px 20px #2F8FFF40` }}>Get started →</button>
                  </motion.div>
                </div>
                {/* Custom */}
                <div className="rounded-2xl p-7" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Custom</p>
                  <div className="flex items-baseline gap-1 mt-2"><span className="text-4xl font-extrabold text-surface">Custom</span></div>
                  <p className="text-xs text-gray-400 mt-2 mb-5">For larger projects and enterprise needs.</p>
                  <div className="space-y-2.5">
                    {['Everything in Basic', 'Multi-site deployment', 'Advanced AI training', 'API access', 'Priority support', 'Dedicated account manager'].map(f => (
                      <div key={f} className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(0,0,0,0.04)' }}><Check className="w-2.5 h-2.5 text-gray-400" /></div><span className="text-xs text-gray-600">{f}</span></div>
                    ))}
                  </div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6">
                    <a href="mailto:hello@freemi.ai" className="block w-full py-3.5 rounded-full text-center font-bold text-sm" style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#374151' }}>Talk to us →</a>
                  </motion.div>
                </div>
              </div></div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={127} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Loved by <span style={{ color: '#2F8FFF' }}>businesses.</span></h2></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: 'Our website went from a brochure to a lead machine. The AI handles 80% of enquiries without us lifting a finger.', name: 'Anna Lopez', role: 'Owner, Glow Beauty', gradient: 'linear-gradient(135deg, #2F8FFF, #06B6D4)' },
              { quote: 'Installed it in under a minute. Within an hour it had already booked 3 appointments and answered 12 questions.', name: 'James Wright', role: 'Director, Wright Legal', gradient: 'linear-gradient(135deg, #7B61FF, #2F8FFF)' },
              { quote: 'We used to miss enquiries after 6pm. Now every single one gets answered. Our conversion rate doubled.', name: 'Priya Patel', role: 'Founder, FitSpace Gym', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
            ].map((t, i) => (
              <ScrollReveal key={t.name} delay={0.1 + i * 0.08}>
                <div className="relative rounded-2xl p-6 h-full group"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', transition: 'transform 300ms ease, border-color 300ms ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(47,143,255,0.2)'; }}
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
            style={{ background: 'linear-gradient(135deg, #2F8FFF, #1D6FD3, #7B61FF)', boxShadow: '0 32px 80px rgba(47,143,255,0.3)' }}>
            {[Sparkles, Bot, Zap, Globe, Star, MessageSquare, Brain].map((Icon, i) => (
              <motion.div key={i} className="absolute text-white/[0.08] pointer-events-none" style={{ left: `${8 + i * 13}%`, top: `${15 + (i % 3) * 25}%` }}
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}>
                <Icon style={{ width: 28 + i * 6, height: 28 + i * 6 }} />
              </motion.div>
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.15), transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Stop losing customers to silence.</h2>
              <p className="mt-4 text-base text-white/70 max-w-md mx-auto">An AI concierge on your website — answering, booking, capturing leads — for less than a coffee a day.</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')} className="px-10 py-4 rounded-full font-bold text-base" style={{ background: 'white', color: '#2F8FFF', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    Start free trial <ArrowRight className="inline ml-2 w-4 h-4" />
                  </button>
                </motion.div>
              </div>
              <p className="mt-6 text-xs text-white/40">No credit card · 60 second setup · Cancel anytime</p>
            </div>
          </motion.div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
