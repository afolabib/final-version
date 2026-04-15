import { motion } from 'framer-motion';
import {
  Phone, Mic, CalendarCheck, FileText, Shield, Clock, Zap, Headphones, ArrowRight, Check, Star,
  Bot, Sparkles, Globe, Pill, Wrench, Stethoscope, Utensils, Briefcase, Building2,
  ShoppingCart, AlertCircle, Info, X, PhoneCall, BarChart3
} from 'lucide-react';
import TopNav from '../../components/TopNav';
import SiteFooter from '../../components/SiteFooter';
import ScrollReveal from '../../components/ScrollReveal';

const ORB_COLORS = ['rgba(39,192,135,0.22)', 'rgba(123,97,255,0.16)', 'rgba(47,143,255,0.14)', 'rgba(236,72,153,0.12)'];
const FLOAT_ICONS = [Sparkles, Bot, Zap, Phone, Star, Mic, Headphones, Globe];
function seededRandom(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function FloatingBg({ seed = 42 }) {
  const r = seededRandom(seed); const rand = () => r();
  const gen = (n) => Array.from({ length: n }, () => ({ left: `${5 + rand() * 90}%`, top: `${5 + rand() * 90}%`, delay: rand() * 3, duration: 4 + rand() * 6, size: 14 + rand() * 18 }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {gen(5).map((p, i) => <motion.div key={`o${i}`} className="absolute rounded-full" style={{ left: p.left, top: p.top, width: 300 + i * 100, height: 300 + i * 100, background: `radial-gradient(circle, ${ORB_COLORS[i % 4]}, transparent 65%)`, filter: `blur(${50 + i * 12}px)` }} animate={{ x: [0, 30 + i * 10, 0], y: [0, -(20 + i * 10), 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />)}
      {gen(10).map((p, i) => { const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length]; return <motion.div key={`i${i}`} className="absolute text-emerald-500/[0.1]" style={{ left: p.left, top: p.top }} animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}><Icon style={{ width: p.size, height: p.size }} /></motion.div>; })}
    </div>
  );
}
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemV = { hidden: { opacity: 0, y: 30, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };
const AC = '#27C087';

const features = [
  { icon: Mic, title: 'Natural conversation', desc: 'Not a robotic IVR. Real conversational AI that sounds human, understands context, and handles multi-turn dialogue.', color: AC, span: 'md:col-span-2 md:row-span-2' },
  { icon: CalendarCheck, title: 'Books appointments live', desc: 'Checks your real-time calendar and confirms bookings on the spot.', color: '#7B61FF' },
  { icon: FileText, title: 'Takes orders & requests', desc: 'Prescription refills, service bookings, product orders — handled over the phone.', color: '#2F8FFF' },
  { icon: Shield, title: 'Never misses a call', desc: 'Every inbound call answered instantly. After hours, weekends, holidays.', color: '#E84393' },
  { icon: Clock, title: 'Instant summaries', desc: 'Every call transcribed, summarised, and logged. Action items flagged automatically.', color: '#F59E0B' },
  { icon: Zap, title: 'Smart routing', desc: 'When a human is needed, the AI routes with full context. No cold transfers.', color: '#0984E3', span: 'md:col-span-2' },
];

const differentiators = [
  { label: 'Natural conversational AI', us: true, others: false },
  { label: 'Books real appointments', us: true, others: false },
  { label: 'Takes orders over the phone', us: true, others: false },
  { label: 'Full call transcripts', us: true, others: false },
  { label: 'Extracts data (names, orders, dates)', us: true, others: false },
  { label: 'Available 24/7', us: true, others: true },
  { label: 'Routes to humans when needed', us: true, others: true },
  { label: 'No hardware required', us: true, others: true },
];

export default function ProductVoice() {
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <TopNav />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16">
        <FloatingBg seed={99} />
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(39,192,135,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={containerV} initial="hidden" animate="visible">
              <motion.div variants={itemV}>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-emerald-200/30 shadow-sm mb-8">
                  <Phone className="w-3.5 h-3.5" style={{ color: AC }} />
                  <span className="text-xs font-semibold text-surface/80 tracking-wide">Freemi | Voice</span>
                </div>
              </motion.div>
              <motion.h1 variants={itemV} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                An AI That Answers<br /><span style={{ color: AC }}>Every Call.</span>
              </motion.h1>
              <motion.p variants={itemV} className="text-base md:text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
                AI phone agent that handles enquiries, takes orders, and books appointments — even when you can't pick up. Natural conversation, not a phone tree.
              </motion.p>
              <motion.div variants={itemV} className="flex flex-col sm:flex-row gap-3 mb-8">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')} className="relative px-8 py-4 rounded-full text-white font-semibold text-base overflow-hidden group" style={{ background: `linear-gradient(135deg, ${AC}, #1FA370)`, boxShadow: `0 8px 32px ${AC}55` }}>
                    <span className="relative z-10 flex items-center gap-2">Start free trial <ArrowRight className="w-4 h-4" /></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  </button>
                </motion.div>
              </motion.div>
              <motion.div variants={itemV} className="flex flex-wrap gap-x-5 gap-y-2">
                {['100% calls answered', 'No hardware needed', '<3s pickup time', 'Natural voice AI'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-emerald-600" /></div>{t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* right — call log + transcript mockup */}
            <motion.div className="hidden lg:block relative" style={{ perspective: "1200px" }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: `0 50px 100px ${AC}30, 0 0 80px ${AC}12`, transform: 'rotateY(-3deg) rotateX(2deg)' }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
                  <div className="flex-1 mx-8"><div className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-400">app.freemi.ai/voice</div></div>
                </div>
                <div className="grid grid-cols-5 gap-0 min-h-[340px]">
                  {/* call list */}
                  <div className="col-span-2 border-r border-gray-100">
                    <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-600">Recent Calls</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">Live</span>
                    </div>
                    {[
                      { name: 'Mary O\'Brien', time: '2m', outcome: 'Order', color: 'bg-emerald-50 text-emerald-700', active: true },
                      { name: 'Patrick Kelly', time: '18m', outcome: 'Booking', color: 'bg-blue-50 text-blue-700' },
                      { name: 'Siobhan Walsh', time: '34m', outcome: 'Info', color: 'bg-gray-100 text-gray-600' },
                      { name: 'Declan Murphy', time: '1h', outcome: 'Escalated', color: 'bg-red-50 text-red-600' },
                    ].map((c, i) => (
                      <div key={i} className="px-3 py-2.5 flex items-center gap-2 border-b border-gray-50" style={{ background: c.active ? 'rgba(39,192,135,0.03)' : 'transparent', borderLeft: c.active ? `2px solid ${AC}` : '2px solid transparent' }}>
                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0"><span className="text-[8px] font-bold text-emerald-600">{c.name.split(' ').map(n => n[0]).join('')}</span></div>
                        <div className="flex-1 min-w-0"><p className="text-[10px] font-bold text-gray-800 truncate">{c.name}</p><span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${c.color}`}>{c.outcome}</span></div>
                        <span className="text-[8px] text-gray-300">{c.time}</span>
                      </div>
                    ))}
                  </div>
                  {/* transcript */}
                  <div className="col-span-3 flex flex-col">
                    <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                      <div><p className="text-[10px] font-bold text-gray-800">Mary O'Brien</p><p className="text-[8px] text-gray-400">3:24 · Just now</p></div>
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">Order Created</span>
                    </div>
                    <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                      {[
                        { r: 'ai', t: 'Good afternoon, thanks for calling. How can I help?' },
                        { r: 'caller', t: 'I\'d like to reorder my usual vitamins.' },
                        { r: 'ai', t: 'Of course! Vitamin D3 and Omega-3 — same as last time?' },
                        { r: 'caller', t: 'Yes please, delivery tomorrow.' },
                        { r: 'ai', t: 'Done! Delivery confirmed for tomorrow by 2pm. ✓' },
                      ].map((m, i) => (
                        <div key={i} className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-[9px] leading-relaxed ${m.r === 'caller' ? 'ml-auto bg-gray-100 text-gray-700' : 'text-gray-700'}`}
                          style={m.r === 'ai' ? { background: `${AC}08` } : {}}>
                          <span className="text-[7px] font-bold block mb-0.5" style={{ color: m.r === 'ai' ? AC : '#94A3B8' }}>{m.r === 'ai' ? 'AI' : 'Caller'}</span>{m.t}
                        </div>
                      ))}
                    </div>
                    <div className="px-3 py-2 border-t border-gray-100 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-500" /><span className="text-[8px] text-emerald-600 font-semibold">Order synced · Calendar updated · SMS sent</span>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center"><Phone className="w-3 h-3 text-emerald-600" /></div>
                <span className="text-xs font-semibold text-surface">100% answered</span>
              </motion.div>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-3 -left-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center"><Clock className="w-3 h-3 text-emerald-600" /></div>
                <span className="text-xs font-semibold text-surface">{"<3s pickup"}</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ v: '100%', l: 'Calls answered' }, { v: '<3s', l: 'Pickup time' }, { v: '4.8/5', l: 'Caller satisfaction' }, { v: '€0', l: 'Per call cost' }].map((s, i) => (
            <ScrollReveal key={s.l} delay={i * 0.08}><div className="text-center"><p className="text-3xl md:text-4xl font-extrabold" style={{ color: AC }}>{s.v}</p><p className="mt-1 text-sm text-gray-500 font-medium">{s.l}</p></div></ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES BENTO ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={109} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Not a phone tree. <span style={{ color: AC }}>A real conversation.</span></h2></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={0.05 + i * 0.06}>
                <motion.div className={`relative h-full rounded-2xl p-7 overflow-hidden group ${f.span || ''}`}
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -6, borderColor: `${f.color}30` }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
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
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${AC}06, rgba(123,97,255,0.02))` }}>
        <FloatingBg seed={119} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Live in <span style={{ color: AC }}>under an hour.</span></h2></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <motion.div className="hidden md:block absolute h-[2px] overflow-hidden" style={{ top: 64, left: '17%', right: '17%' }}
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${AC}, #7B61FF, #2F8FFF)` }} />
            </motion.div>
            {[
              { step: '01', icon: Phone, title: 'Get your AI number', desc: 'We assign a local number or forward your existing one. Under an hour.', color: AC },
              { step: '02', icon: Headphones, title: 'Train your voice agent', desc: 'Services, FAQs, booking rules, tone — we configure everything.', color: '#7B61FF' },
              { step: '03', icon: Zap, title: 'Every call answered', desc: 'AI handles calls 24/7. Books, orders, and sends you summaries.', color: '#2F8FFF' },
            ].map((s, i) => (
              <ScrollReveal key={s.step} delay={0.2 + i * 0.15}>
                <div className="text-center relative">
                  <motion.div className="relative inline-flex mb-6" whileHover={{ scale: 1.08, y: -4, rotate: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: `${s.color}08`, border: '4px solid white', boxShadow: `0 0 0 1px ${s.color}15` }}>
                      <s.icon className="w-9 h-9" style={{ color: s.color }} />
                    </div>
                    <motion.div className="absolute -top-2 -right-2 w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg ring-4 ring-white" style={{ background: s.color }}
                      initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.5 + i * 0.15 }}>{s.step}</motion.div>
                  </motion.div>
                  <h3 className="text-lg font-bold text-surface mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[220px] mx-auto">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VS IVR ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={129} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Not an IVR. <span style={{ color: AC }}>A real AI.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-3 text-gray-500">Phone trees frustrate customers. Freemi actually helps them.</p></ScrollReveal>
          </div>
          <ScrollReveal delay={0.15}>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: `0 16px 48px ${AC}08` }}>
              <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ background: `linear-gradient(135deg, ${AC}08, rgba(123,97,255,0.03))` }}>
                <span className="text-gray-400">Capability</span><span className="text-center text-gray-400">Typical IVR</span><span className="text-center" style={{ color: AC }}>Freemi Voice</span>
              </div>
              {differentiators.map((row, i) => (
                <motion.div key={row.label} className="grid grid-cols-3 px-6 py-3.5 items-center text-sm border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                  <span className="font-medium text-gray-700 text-xs">{row.label}</span>
                  <div className="flex justify-center">{row.others ? <Check className="w-4 h-4 text-gray-300" /> : <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-400 text-[10px] font-bold">✕</span>}</div>
                  <div className="flex justify-center"><div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${AC}15` }}><Check className="w-3 h-3" style={{ color: AC }} /></div></div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${AC}05, rgba(47,143,255,0.02))` }}>
        <FloatingBg seed={139} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Built for <span style={{ color: AC }}>businesses that get calls.</span></h2></ScrollReveal></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Pill, title: 'Pharmacy', desc: 'Prescription refills, medication questions, delivery scheduling.', color: '#E84393', metric: '92%' },
              { icon: Wrench, title: 'Trades & Plumbing', desc: 'Job qualification, emergency handling, appointment booking.', color: '#7B61FF', metric: '100%' },
              { icon: Stethoscope, title: 'Medical & Clinics', desc: 'Appointment booking, triage, repeat prescriptions.', color: '#2F8FFF', metric: '40%↓' },
              { icon: Briefcase, title: 'Professional Services', desc: 'Client screening, consultation scheduling, availability.', color: AC, metric: '3×' },
              { icon: Utensils, title: 'Restaurants', desc: 'Reservations, menu enquiries, catering, event bookings.', color: '#F59E0B', metric: '24/7' },
              { icon: Building2, title: 'Real Estate', desc: 'Viewing requests, availability, tenant enquiries.', color: '#0984E3', metric: '68%' },
            ].map((uc, i) => (
              <ScrollReveal key={uc.title} delay={0.1 + i * 0.06}>
                <motion.div className="rounded-2xl p-6 h-full group" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -6, borderColor: `${uc.color}25` }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${uc.color}10` }}><uc.icon className="w-5 h-5" style={{ color: uc.color }} /></div>
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

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={149} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Never miss a call <span style={{ color: AC }}>again.</span></h2></ScrollReveal></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: 'We were missing 40% of calls while on the job. Now every single one gets answered and I get a summary text.', name: 'Tom Murphy', role: 'Owner, Murphy Plumbing', gradient: `linear-gradient(135deg, ${AC}, #2F8FFF)` },
              { quote: 'Our patients love it. The AI sounds natural, books appointments perfectly, and handles prescription refills.', name: 'Dr. Rachel Kim', role: 'Greenfield Dental', gradient: 'linear-gradient(135deg, #2F8FFF, #7B61FF)' },
              { quote: 'We went from 2 receptionists to zero. The AI handles it all and costs a fraction of what we were paying.', name: 'Carlo Bianchi', role: 'Bella Vista Restaurant', gradient: 'linear-gradient(135deg, #7B61FF, #E84393)' },
            ].map((t, i) => (
              <ScrollReveal key={t.name} delay={0.1 + i * 0.08}>
                <div className="relative rounded-2xl p-6 h-full group" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', transition: 'transform 300ms ease, border-color 300ms ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = `${AC}25`; }}
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
            style={{ background: `linear-gradient(135deg, ${AC}, #1FA370, #2F8FFF)`, boxShadow: `0 32px 80px ${AC}40` }}>
            {[Sparkles, Phone, Zap, Globe, Star, Mic, Bot].map((Icon, i) => (
              <motion.div key={i} className="absolute text-white/[0.08] pointer-events-none" style={{ left: `${8 + i * 13}%`, top: `${15 + (i % 3) * 25}%` }}
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}>
                <Icon style={{ width: 28 + i * 6, height: 28 + i * 6 }} />
              </motion.div>
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.15), transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Never miss a call again.</h2>
              <p className="mt-4 text-base text-white/70 max-w-md mx-auto">AI phone agent that answers, books, and reports — 24/7. No hardware needed.</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')} className="px-10 py-4 rounded-full font-bold text-base" style={{ background: 'white', color: AC, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    Start free trial <ArrowRight className="inline ml-2 w-4 h-4" />
                  </button>
                </motion.div>
              </div>
              <p className="mt-6 text-xs text-white/40">No credit card · Setup in under an hour · Cancel anytime</p>
            </div>
          </motion.div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
