import { motion } from 'framer-motion';
import {
  Calendar, Clock, RefreshCw, Bell, Smartphone, Globe, Zap, BarChart3, ArrowRight, Check, Star,
  Bot, Sparkles, Scissors, Stethoscope, Dumbbell, GraduationCap, Wrench, Building2, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import TopNav from '../../components/TopNav';
import SiteFooter from '../../components/SiteFooter';
import ScrollReveal from '../../components/ScrollReveal';

const ORB_COLORS = ['rgba(245,158,11,0.22)', 'rgba(123,97,255,0.16)', 'rgba(47,143,255,0.14)', 'rgba(39,192,135,0.12)'];
const FLOAT_ICONS = [Sparkles, Bot, Zap, Calendar, Star, Clock, Globe, Bell];
function seededRandom(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function FloatingBg({ seed = 42 }) {
  const r = seededRandom(seed); const rand = () => r();
  const gen = (n) => Array.from({ length: n }, () => ({ left: `${5 + rand() * 90}%`, top: `${5 + rand() * 90}%`, delay: rand() * 3, duration: 4 + rand() * 6, size: 14 + rand() * 18 }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {gen(5).map((p, i) => <motion.div key={`o${i}`} className="absolute rounded-full" style={{ left: p.left, top: p.top, width: 300 + i * 100, height: 300 + i * 100, background: `radial-gradient(circle, ${ORB_COLORS[i % 4]}, transparent 65%)`, filter: `blur(${50 + i * 12}px)` }} animate={{ x: [0, 30 + i * 10, 0], y: [0, -(20 + i * 10), 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />)}
      {gen(10).map((p, i) => { const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length]; return <motion.div key={`i${i}`} className="absolute text-amber-500/[0.1]" style={{ left: p.left, top: p.top }} animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}><Icon style={{ width: p.size, height: p.size }} /></motion.div>; })}
    </div>
  );
}
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemV = { hidden: { opacity: 0, y: 30, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };
const AC = '#F59E0B';

const features = [
  { icon: Clock, title: 'Real-time availability', desc: 'Syncs with Google Calendar, Outlook, or any calendar. Customers only see free slots. Always accurate.', color: AC, span: 'md:col-span-2 md:row-span-2' },
  { icon: RefreshCw, title: 'Self-service', desc: 'Customers reschedule, cancel, or modify their own bookings via AI.', color: '#7B61FF' },
  { icon: Bell, title: 'Smart reminders', desc: 'WhatsApp and email reminders. Reduces no-shows by 60%.', color: '#2F8FFF' },
  { icon: Smartphone, title: 'Every channel', desc: 'Book from website, WhatsApp, or phone. All synced to one calendar.', color: '#27C087' },
  { icon: Globe, title: 'Multi-service', desc: 'Multiple services, durations, staff, and locations. Each with own rules.', color: '#E84393' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track volume, no-shows, popular slots, and revenue.', color: '#0984E3', span: 'md:col-span-2' },
];

const differentiators = [
  { label: 'AI-powered booking conversations', us: true, others: false },
  { label: 'Books from WhatsApp & phone', us: true, others: false },
  { label: 'Automated no-show prevention', us: true, others: false },
  { label: 'Self-service reschedule/cancel', us: true, others: true },
  { label: 'Calendar sync', us: true, others: true },
  { label: 'Multi-staff support', us: true, others: true },
  { label: 'Connected to CRM & tools', us: true, others: false },
  { label: 'Revenue tracking', us: true, others: false },
];

export default function ProductBookings() {
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <TopNav />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16">
        <FloatingBg seed={133} />
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(245,158,11,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={containerV} initial="hidden" animate="visible">
              <motion.div variants={itemV}>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-amber-200/30 shadow-sm mb-8">
                  <Calendar className="w-3.5 h-3.5" style={{ color: AC }} /><span className="text-xs font-semibold text-surface/80 tracking-wide">Freemi | Bookings</span>
                </div>
              </motion.div>
              <motion.h1 variants={itemV} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">AI-Powered<br /><span style={{ color: AC }}>Appointments.</span></motion.h1>
              <motion.p variants={itemV} className="text-base md:text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">Customers book, reschedule, and cancel from any channel — website, WhatsApp, or phone. Your calendar stays perfect. No admin required.</motion.p>
              <motion.div variants={itemV} className="flex flex-col sm:flex-row gap-3 mb-8">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')} className="relative px-8 py-4 rounded-full text-white font-semibold text-base overflow-hidden group" style={{ background: `linear-gradient(135deg, ${AC}, #D97706)`, boxShadow: `0 8px 32px ${AC}55` }}>
                    <span className="relative z-10 flex items-center gap-2">Start free trial <ArrowRight className="w-4 h-4" /></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  </button>
                </motion.div>
              </motion.div>
              <motion.div variants={itemV} className="flex flex-wrap gap-x-5 gap-y-2">
                {['60% fewer no-shows', '3× more bookings', 'Zero double-bookings', '24/7 booking'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500"><div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-emerald-600" /></div>{t}</span>
                ))}
              </motion.div>
            </motion.div>

            {/* right — calendar mockup */}
            <motion.div className="hidden lg:block relative" style={{ perspective: "1200px" }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: `0 50px 100px ${AC}30, 0 0 80px ${AC}12`, transform: 'rotateY(-3deg) rotateX(2deg)' }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
                  <div className="flex-1 mx-8"><div className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-400">app.freemi.ai/bookings</div></div>
                </div>
                {/* calendar header */}
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" style={{ color: AC }} /><span className="text-xs font-bold text-gray-800">Bookings</span></div>
                  <div className="flex items-center gap-1"><div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center"><ChevronLeft className="w-3 h-3 text-gray-400" /></div><span className="text-[10px] font-semibold text-gray-700 px-2">14 – 20 Apr</span><div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center"><ChevronRight className="w-3 h-3 text-gray-400" /></div></div>
                </div>
                {/* day headers */}
                <div className="grid grid-cols-5 border-b border-gray-50">
                  {['Mon 14', 'Tue 15', 'Wed 16', 'Thu 17', 'Fri 18'].map((d, i) => (
                    <div key={d} className="text-center py-1.5 border-r border-gray-50 last:border-r-0">
                      <p className={`text-[9px] font-bold ${i === 1 ? 'text-amber-600' : 'text-gray-500'}`}>{d}</p>
                    </div>
                  ))}
                </div>
                {/* slots */}
                <div className="min-h-[240px]">
                  {[
                    { time: '09:00', slots: [{ n: 'Sarah M.', s: 'Check-up', c: '#7B61FF' }, null, { n: 'David K.', s: 'Consult', c: '#2F8FFF' }, null, { n: 'Lisa B.', s: 'Follow-up', c: '#27C087' }] },
                    { time: '10:30', slots: [null, { n: 'James L.', s: 'Haircut', c: '#E84393' }, null, { n: 'Emma J.', s: 'Dental', c: '#7B61FF' }, null] },
                    { time: '13:00', slots: [{ n: 'Priya K.', s: 'PT', c: AC }, null, null, { n: 'Carlos B.', s: 'Massage', c: '#27C087' }, { n: 'Anna R.', s: 'Facial', c: '#E84393' }] },
                    { time: '14:30', slots: [null, { n: 'Tom M.', s: 'Review', c: '#2F8FFF' }, null, null, null] },
                    { time: '16:00', slots: [{ n: 'Aoife R.', s: 'Styling', c: '#E84393' }, null, { n: 'Niamh F.', s: 'Colour', c: '#7B61FF' }, null, { n: 'Mark S.', s: 'Trim', c: AC }] },
                  ].map(row => (
                    <div key={row.time} className="grid grid-cols-5 border-b border-gray-50 last:border-0">
                      {row.slots.map((slot, j) => (
                        <div key={j} className="h-12 border-r border-gray-50 last:border-r-0 relative p-0.5">
                          {j === 0 && <span className="absolute left-0.5 top-0.5 text-[7px] text-gray-300 font-mono">{row.time}</span>}
                          {slot && <div className="h-full rounded-md px-1 py-0.5 overflow-hidden" style={{ background: `${slot.c}08`, borderLeft: `2px solid ${slot.c}` }}><p className="text-[7px] font-bold text-gray-700 truncate">{slot.n}</p><p className="text-[6px] text-gray-400">{slot.s}</p></div>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${AC}15` }}><Calendar className="w-3 h-3" style={{ color: AC }} /></div>
                <span className="text-xs font-semibold text-surface">12 bookings today</span>
              </motion.div>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-3 -left-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-600" /></div>
                <span className="text-xs font-semibold text-surface">94% show rate</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ v: '60%', l: 'Fewer no-shows' }, { v: '3×', l: 'More bookings' }, { v: '0', l: 'Double-bookings' }, { v: '24/7', l: 'Booking availability' }].map((s, i) => (
            <ScrollReveal key={s.l} delay={i * 0.08}><div className="text-center"><p className="text-3xl md:text-4xl font-extrabold" style={{ color: AC }}>{s.v}</p><p className="mt-1 text-sm text-gray-500 font-medium">{s.l}</p></div></ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-20 px-6 relative overflow-hidden"><FloatingBg seed={143} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Your calendar, <span style={{ color: AC }}>on autopilot.</span></h2></ScrollReveal></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={0.05 + i * 0.06}>
                <motion.div className={`relative h-full rounded-2xl p-7 overflow-hidden group ${f.span || ''}`} style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }} whileHover={{ y: -6, borderColor: `${f.color}30` }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(135deg, ${f.color}06, transparent)` }} />
                  <div className="relative z-10"><motion.div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.color}10` }} whileHover={{ scale: 1.1, rotate: -5 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}><f.icon className="w-6 h-6" style={{ color: f.color }} /></motion.div><h3 className="text-base font-bold text-surface mb-2">{f.title}</h3><p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p></div>
                  <ArrowRight className="absolute top-7 right-7 w-4 h-4 text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${AC}06, rgba(123,97,255,0.02))` }}><FloatingBg seed={153} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-20"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Three steps. <span style={{ color: AC }}>Zero admin.</span></h2></ScrollReveal></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <motion.div className="hidden md:block absolute h-[2px] overflow-hidden" style={{ top: 64, left: '17%', right: '17%' }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}><div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${AC}, #7B61FF, #27C087)` }} /></motion.div>
            {[
              { step: '01', icon: Calendar, title: 'Connect calendar', desc: 'Link Google Calendar, Outlook, or any system. We sync automatically.', color: AC },
              { step: '02', icon: Zap, title: 'Set your rules', desc: 'Services, durations, buffers, availability. We configure your booking AI.', color: '#7B61FF' },
              { step: '03', icon: Globe, title: 'Customers book anywhere', desc: 'Website, WhatsApp, phone — AI handles the flow and sends confirmations.', color: '#27C087' },
            ].map((s, i) => (
              <ScrollReveal key={s.step} delay={0.2 + i * 0.15}>
                <div className="text-center relative">
                  <motion.div className="relative inline-flex mb-6" whileHover={{ scale: 1.08, y: -4, rotate: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: `${s.color}08`, border: '4px solid white', boxShadow: `0 0 0 1px ${s.color}15` }}><s.icon className="w-9 h-9" style={{ color: s.color }} /></div>
                    <motion.div className="absolute -top-2 -right-2 w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg ring-4 ring-white" style={{ background: s.color }} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.5 + i * 0.15 }}>{s.step}</motion.div>
                  </motion.div>
                  <h3 className="text-lg font-bold text-surface mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[220px] mx-auto">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VS OLD BOOKING ═══ */}
      <section className="py-20 px-6 relative overflow-hidden"><FloatingBg seed={163} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center mb-12"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Not a form. <span style={{ color: AC }}>An AI booker.</span></h2></ScrollReveal></div>
          <ScrollReveal delay={0.15}>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: `0 16px 48px ${AC}08` }}>
              <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ background: `linear-gradient(135deg, ${AC}08, rgba(123,97,255,0.03))` }}><span className="text-gray-400">Capability</span><span className="text-center text-gray-400">Online Form</span><span className="text-center" style={{ color: AC }}>Freemi Bookings</span></div>
              {differentiators.map((row, i) => (
                <motion.div key={row.label} className="grid grid-cols-3 px-6 py-3.5 items-center text-sm border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
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
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${AC}05, rgba(47,143,255,0.02))` }}><FloatingBg seed={173} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Built for <span style={{ color: AC }}>every business.</span></h2></ScrollReveal></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Scissors, title: 'Salons & Spas', desc: 'Service, stylist, duration — perfect appointments in seconds.', color: '#E84393', metric: '3×' },
              { icon: Stethoscope, title: 'Medical & Dental', desc: 'Intake, doctor availability, insurance — before they walk in.', color: '#7B61FF', metric: '40%↓' },
              { icon: Dumbbell, title: 'Fitness & PT', desc: 'Classes, PT sessions, membership trials — schedule fills itself.', color: '#2F8FFF', metric: '94%' },
              { icon: GraduationCap, title: 'Tutoring', desc: 'Sessions, subject matching, recurring — no calling needed.', color: '#27C087', metric: '24/7' },
              { icon: Wrench, title: 'Trades', desc: 'Job type, area, estimate — qualified bookings from the van.', color: AC, metric: '68%' },
              { icon: Building2, title: 'Consulting', desc: 'Discovery calls, timezones, pipeline — fills automatically.', color: '#0984E3', metric: '100%' },
            ].map((uc, i) => (
              <ScrollReveal key={uc.title} delay={0.1 + i * 0.06}>
                <motion.div className="rounded-2xl p-6 h-full group" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)' }} whileHover={{ y: -6, borderColor: `${uc.color}25` }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="flex items-center justify-between mb-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${uc.color}10` }}><uc.icon className="w-5 h-5" style={{ color: uc.color }} /></div><span className="text-xs font-bold px-2 py-0.5 rounded-lg text-white" style={{ background: uc.color }}>{uc.metric}</span></div>
                  <h4 className="text-base font-bold text-surface">{uc.title}</h4><p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{uc.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

            {/* ═══ PRICING ═══ */}
      <section className="py-20 px-6">
        <div className="text-center mb-12"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Simple <span style={{ color: '#F59E0B' }}>pricing.</span></h2></ScrollReveal></div>
        <ScrollReveal delay={0.1}>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Starter */}
            <div className="rounded-2xl p-7 text-left" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Starter</p>
              <div className="flex items-baseline gap-1 mt-2"><span className="text-3xl font-extrabold text-surface">€29.99</span><span className="text-gray-400 text-sm">/month</span></div>
              <p className="text-xs text-gray-400 mt-2 mb-5">For small businesses getting started.</p>
              <div className="space-y-2.5">
                {['AI booking system', 'Calendar sync', 'Automated reminders', 'Self-service reschedule', '1 service type'].map(f => (
                  <div key={f} className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(0,0,0,0.04)' }}><Check className="w-2.5 h-2.5 text-gray-400" /></div><span className="text-xs text-gray-600">{f}</span></div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6">
                <button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')} className="w-full py-3.5 rounded-full font-bold text-sm" style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#374151' }}>Get started →</button>
              </motion.div>
            </div>
            {/* Growth */}
            <div className="rounded-2xl p-7 text-left relative" style={{ background: 'rgba(255,255,255,0.95)', border: `2px solid #F59E0B30`, boxShadow: `0 16px 48px #F59E0B12`, transform: 'scale(1.02)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: '#F59E0B' }}>Most Popular</div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Growth</p>
              <div className="flex items-baseline gap-1 mt-2"><span className="text-3xl font-extrabold" style={{ color: '#F59E0B' }}>€49.99</span><span className="text-gray-400 text-sm">/month</span></div>
              <p className="text-xs text-gray-400 mt-2 mb-5">For growing businesses that need more.</p>
              <div className="space-y-2.5">
                {['Everything in Starter', 'Multi-service support', 'Multi-staff', 'WhatsApp reminders', 'Booking analytics', 'Priority support'].map(f => (
                  <div key={f} className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: '#F59E0B15' }}><Check className="w-2.5 h-2.5" style={{ color: '#F59E0B' }} /></div><span className="text-xs text-gray-600">{f}</span></div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6">
                <button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')} className="w-full py-3.5 rounded-full text-white font-bold text-sm" style={{ background: `linear-gradient(135deg, #F59E0B, #F59E0BCC)`, boxShadow: `0 6px 20px #F59E0B40` }}>Get started →</button>
              </motion.div>
            </div>
            {/* Scale */}
            <div className="rounded-2xl p-7 text-left" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Scale</p>
              <div className="flex items-baseline gap-1 mt-2"><span className="text-3xl font-extrabold text-surface">€99.99</span><span className="text-gray-400 text-sm">/month</span></div>
              <p className="text-xs text-gray-400 mt-2 mb-5">For teams that need the full platform.</p>
              <div className="space-y-2.5">
                {['Everything in Growth', 'Multi-location', 'Custom booking flows', 'Payment collection', 'Dedicated manager', 'SLA guarantee'].map(f => (
                  <div key={f} className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(0,0,0,0.04)' }}><Check className="w-2.5 h-2.5 text-gray-400" /></div><span className="text-xs text-gray-600">{f}</span></div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6">
                <button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')} className="w-full py-3.5 rounded-full font-bold text-sm" style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#374151' }}>Get started →</button>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </section>

{/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 px-6 relative overflow-hidden"><FloatingBg seed={183} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Calendar on <span style={{ color: AC }}>autopilot.</span></h2></ScrollReveal></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: 'We used to spend 2 hours a day on phone bookings. Now the AI handles it all and our calendar is always full.', name: 'Fiona O\'Brien', role: 'Owner, Serenity Spa', gradient: `linear-gradient(135deg, ${AC}, #E84393)` },
              { quote: 'No-shows dropped from 20% to under 5% with WhatsApp reminders. That\'s thousands in saved revenue.', name: 'Dr. Ravi Sharma', role: 'Sharma Dental', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
              { quote: 'Customers book at midnight, reschedule at 6am, and I never touch a thing. It just works.', name: 'Laura Finnegan', role: 'FlexFit Studio', gradient: `linear-gradient(135deg, #7B61FF, ${AC})` },
            ].map((t, i) => (
              <ScrollReveal key={t.name} delay={0.1 + i * 0.08}>
                <div className="relative rounded-2xl p-6 h-full" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', transition: 'transform 300ms ease, border-color 300ms ease' }}
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
          <motion.div className="max-w-4xl mx-auto rounded-3xl relative overflow-hidden py-16 px-8 text-center" style={{ background: `linear-gradient(135deg, ${AC}, #D97706, #7B61FF)`, boxShadow: `0 32px 80px ${AC}40` }}>
            {[Sparkles, Calendar, Zap, Globe, Star, Clock, Bot].map((Icon, i) => (
              <motion.div key={i} className="absolute text-white/[0.08] pointer-events-none" style={{ left: `${8 + i * 13}%`, top: `${15 + (i % 3) * 25}%` }} animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}><Icon style={{ width: 28 + i * 6, height: 28 + i * 6 }} /></motion.div>
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.15), transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Your calendar, on autopilot.</h2>
              <p className="mt-4 text-base text-white/70 max-w-md mx-auto">AI handles bookings from every channel. No double-bookings. No no-shows. No admin.</p>
              <div className="mt-8"><motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}><button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')} className="px-10 py-4 rounded-full font-bold text-base" style={{ background: 'white', color: AC, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>Start free trial <ArrowRight className="inline ml-2 w-4 h-4" /></button></motion.div></div>
              <p className="mt-6 text-xs text-white/40">No credit card · Live in minutes · Cancel anytime</p>
            </div>
          </motion.div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
