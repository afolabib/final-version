import { motion } from 'framer-motion';
import {
  Send, MessageCircle, ShoppingBag, Clock, Zap, Users, Bell, Globe, ArrowRight, Check, Star,
  Bot, Sparkles, Pill, Scissors, Stethoscope, Utensils, Building2, GraduationCap, X, Phone, BarChart3
} from 'lucide-react';
import TopNav from '../../components/TopNav';
import SiteFooter from '../../components/SiteFooter';
import ScrollReveal from '../../components/ScrollReveal';

const ORB_COLORS = ['rgba(37,211,102,0.22)', 'rgba(123,97,255,0.16)', 'rgba(47,143,255,0.14)', 'rgba(236,72,153,0.12)'];
const FLOAT_ICONS = [Sparkles, Bot, Zap, Send, Star, MessageCircle, Globe, Bell];
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
const AC = '#25D366';

const features = [
  { icon: MessageCircle, title: 'Natural conversations', desc: 'Replies that feel human. Understands context, handles follow-ups, switches topics naturally.', color: AC, span: 'md:col-span-2 md:row-span-2' },
  { icon: ShoppingBag, title: 'Handles orders', desc: 'Customers place orders, check status, request refunds — all through chat.', color: '#7B61FF' },
  { icon: Clock, title: 'Instant replies 24/7', desc: 'Auto-replies in seconds, any time of day or night. Under 4s average.', color: '#2F8FFF' },
  { icon: Zap, title: 'Connected to everything', desc: 'Syncs with CRM, calendar, inventory, payment system. Real actions.', color: '#F59E0B' },
  { icon: Users, title: 'Broadcast & campaigns', desc: 'Promotions, updates, reminders to segments. AI personalises each message.', color: '#E84393' },
  { icon: Bell, title: 'Smart notifications', desc: 'Appointment reminders, order updates, payment confirmations — all automatic.', color: '#0984E3', span: 'md:col-span-2' },
];

const differentiators = [
  { label: 'Natural conversational AI', us: true, others: false },
  { label: 'Takes orders & processes payments', us: true, others: false },
  { label: 'Handles full booking flows', us: true, others: false },
  { label: 'Connected to CRM & tools', us: true, others: false },
  { label: 'Personalised broadcast campaigns', us: true, others: false },
  { label: 'Auto-replies', us: true, others: true },
  { label: 'Available 24/7', us: true, others: true },
  { label: 'Message templates', us: true, others: true },
];

export default function ProductWhatsApp() {
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <TopNav />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16">
        <FloatingBg seed={111} />
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(37,211,102,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={containerV} initial="hidden" animate="visible">
              <motion.div variants={itemV}>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-emerald-200/30 shadow-sm mb-8">
                  <Send className="w-3.5 h-3.5" style={{ color: AC }} /><span className="text-xs font-semibold text-surface/80 tracking-wide">Freemi | WhatsApp</span>
                </div>
              </motion.div>
              <motion.h1 variants={itemV} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">Your AI Agent<br /><span style={{ color: AC }}>On WhatsApp.</span></motion.h1>
              <motion.p variants={itemV} className="text-base md:text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">AI WhatsApp agent that auto-replies, handles orders, answers questions, and manages full conversations — like texting a real person who never sleeps.</motion.p>
              <motion.div variants={itemV} className="flex flex-col sm:flex-row gap-3 mb-8">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')} className="relative px-8 py-4 rounded-full text-white font-semibold text-base overflow-hidden group" style={{ background: `linear-gradient(135deg, ${AC}, #128C7E)`, boxShadow: `0 8px 32px ${AC}55` }}>
                    <span className="relative z-10 flex items-center gap-2">Start free trial <ArrowRight className="w-4 h-4" /></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  </button>
                </motion.div>
              </motion.div>
              <motion.div variants={itemV} className="flex flex-wrap gap-x-5 gap-y-2">
                {['2B+ users worldwide', '4s avg response', '89% auto-resolved', '24/7 always on'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500"><div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-emerald-600" /></div>{t}</span>
                ))}
              </motion.div>
            </motion.div>

            {/* right — WhatsApp conversation mockup */}
            <motion.div className="hidden lg:block relative" style={{ perspective: "1200px" }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: `0 50px 100px ${AC}30, 0 0 80px ${AC}12`, transform: 'rotateY(-3deg) rotateX(2deg)' }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
                  <div className="flex-1 mx-8"><div className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-400">WhatsApp Business</div></div>
                </div>
                <div className="grid grid-cols-5 gap-0 min-h-[360px]">
                  {/* conversation list */}
                  <div className="col-span-2 border-r border-gray-100">
                    <div className="px-3 py-2 border-b border-gray-50" style={{ background: `${AC}05` }}>
                      <span className="text-[10px] font-bold text-gray-600">Conversations</span>
                    </div>
                    {[
                      { name: 'Sarah M.', msg: '✅ Order confirmed!', time: '2m', unread: 0, active: true },
                      { name: 'Ahmed H.', msg: 'Can I get my usual refill?', time: '8m', unread: 1 },
                      { name: 'Emma J.', msg: 'Thanks for the reminder! 👍', time: '23m', unread: 0 },
                      { name: 'Patrick O.', msg: 'What time do you close?', time: '45m', unread: 1 },
                      { name: 'Lisa C.', msg: 'Can I add vitamin C?', time: '1h', unread: 0 },
                    ].map((c, i) => (
                      <div key={i} className="px-3 py-2.5 flex items-center gap-2 border-b border-gray-50" style={{ background: c.active ? `${AC}04` : 'transparent', borderLeft: c.active ? `2px solid ${AC}` : '2px solid transparent' }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${AC}15` }}><span className="text-[8px] font-bold" style={{ color: AC }}>{c.name.split(' ')[0][0]}{c.name.split(' ')[1]?.[0]}</span></div>
                        <div className="flex-1 min-w-0"><p className="text-[10px] font-bold text-gray-800 truncate">{c.name}</p><p className="text-[8px] text-gray-400 truncate">{c.msg}</p></div>
                        <div className="text-right shrink-0"><span className="text-[7px] text-gray-300 block">{c.time}</span>{c.unread > 0 && <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white mt-0.5 ml-auto" style={{ background: AC }}>{c.unread}</div>}</div>
                      </div>
                    ))}
                  </div>
                  {/* active chat */}
                  <div className="col-span-3 flex flex-col">
                    <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${AC}15` }}><span className="text-[8px] font-bold" style={{ color: AC }}>SM</span></div>
                      <div><p className="text-[10px] font-bold text-gray-800">Sarah Mitchell</p><p className="text-[7px] text-gray-400">+353 87 123 4567</p></div>
                      <div className="ml-auto flex gap-1"><span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${AC}10`, color: AC }}>Order</span><span className="text-[7px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 font-bold">Repeat</span></div>
                    </div>
                    <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                      {[
                        { f: 'ai', t: 'Hi Sarah! 👋 How can I help today?' },
                        { f: 'user', t: 'Reorder my usual please' },
                        { f: 'ai', t: '• Vitamin D3 — €12.50\n• Omega-3 — €18.00\n• Multivitamin — €14.00\n\nTotal: €44.50\nDeliver tomorrow?' },
                        { f: 'user', t: 'Yes please' },
                        { f: 'ai', t: '✅ Order confirmed!\n📦 Tomorrow by 2pm\n💳 Card ending 4821' },
                      ].map((m, i) => (
                        <div key={i} className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-[9px] leading-relaxed ${m.f === 'user' ? 'ml-auto' : ''}`}
                          style={{ background: m.f === 'user' ? `${AC}10` : 'rgba(0,0,0,0.03)', color: '#374151', borderBottomRightRadius: m.f === 'user' ? 4 : 12, borderBottomLeftRadius: m.f === 'ai' ? 4 : 12, whiteSpace: 'pre-line' }}>
                          {m.t}
                        </div>
                      ))}
                    </div>
                    <div className="px-3 py-2 border-t border-gray-100 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-500" /><span className="text-[8px] text-emerald-600 font-semibold">Order synced · Payment processed · Delivery scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${AC}15` }}><Send className="w-3 h-3" style={{ color: AC }} /></div>
                <span className="text-xs font-semibold text-surface">89% auto-resolved</span>
              </motion.div>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-3 -left-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${AC}15` }}><Clock className="w-3 h-3" style={{ color: AC }} /></div>
                <span className="text-xs font-semibold text-surface">4s avg response</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ v: '2B+', l: 'WhatsApp users' }, { v: '4s', l: 'Avg response' }, { v: '89%', l: 'Auto-resolved' }, { v: '24/7', l: 'Always on' }].map((s, i) => (
            <ScrollReveal key={s.l} delay={i * 0.08}><div className="text-center"><p className="text-3xl md:text-4xl font-extrabold" style={{ color: AC }}>{s.v}</p><p className="mt-1 text-sm text-gray-500 font-medium">{s.l}</p></div></ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES BENTO ═══ */}
      <section className="py-20 px-6 relative overflow-hidden"><FloatingBg seed={121} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">More than auto-replies. <span style={{ color: AC }}>Real AI.</span></h2></ScrollReveal></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={0.05 + i * 0.06}>
                <motion.div className={`relative h-full rounded-2xl p-7 overflow-hidden group ${f.span || ''}`} style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -6, borderColor: `${f.color}30` }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(135deg, ${f.color}06, transparent)` }} />
                  <div className="relative z-10">
                    <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.color}10` }} whileHover={{ scale: 1.1, rotate: -5 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
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
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${AC}06, rgba(123,97,255,0.02))` }}><FloatingBg seed={131} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-20"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Live in <span style={{ color: AC }}>minutes.</span></h2></ScrollReveal></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <motion.div className="hidden md:block absolute h-[2px] overflow-hidden" style={{ top: 64, left: '17%', right: '17%' }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${AC}, #7B61FF, #2F8FFF)` }} />
            </motion.div>
            {[
              { step: '01', icon: Send, title: 'Connect WhatsApp', desc: 'Link your WhatsApp Business number. We handle API setup.', color: AC },
              { step: '02', icon: Bot, title: 'Train your AI', desc: 'Configure responses, FAQs, order flows, booking rules.', color: '#7B61FF' },
              { step: '03', icon: Zap, title: 'Instant replies', desc: 'Every message answered. Orders processed. Questions resolved.', color: '#2F8FFF' },
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

      {/* ═══ VS BASIC AUTO-REPLY ═══ */}
      <section className="py-20 px-6 relative overflow-hidden"><FloatingBg seed={141} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Not auto-reply. <span style={{ color: AC }}>AI.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-3 text-gray-500">Basic auto-reply sends templates. Freemi actually thinks.</p></ScrollReveal>
          </div>
          <ScrollReveal delay={0.15}>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: `0 16px 48px ${AC}08` }}>
              <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ background: `linear-gradient(135deg, ${AC}08, rgba(123,97,255,0.03))` }}>
                <span className="text-gray-400">Capability</span><span className="text-center text-gray-400">Basic Auto-Reply</span><span className="text-center" style={{ color: AC }}>Freemi WhatsApp</span>
              </div>
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
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${AC}05, rgba(47,143,255,0.02))` }}><FloatingBg seed={151} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Meet customers <span style={{ color: AC }}>where they are.</span></h2></ScrollReveal></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Pill, title: 'Pharmacy', desc: 'Prescription orders, reminders, refills, delivery tracking.', color: '#E84393', metric: '89%' },
              { icon: Scissors, title: 'Salons & Beauty', desc: 'Booking, rescheduling, promos — direct to phones.', color: '#7B61FF', metric: '3×' },
              { icon: Stethoscope, title: 'Healthcare', desc: 'Confirmations, results, prescription reminders.', color: '#2F8FFF', metric: '95%' },
              { icon: Utensils, title: 'Food & Delivery', desc: 'Orders, tracking, feedback — full experience on WhatsApp.', color: AC, metric: '40%↑' },
              { icon: Building2, title: 'Real Estate', desc: 'Enquiries, viewings, documents, follow-up sequences.', color: '#F59E0B', metric: '24/7' },
              { icon: GraduationCap, title: 'Education', desc: 'Enrollment, schedules, reminders, parent comms.', color: '#0984E3', metric: '60%↓' },
            ].map((uc, i) => (
              <ScrollReveal key={uc.title} delay={0.1 + i * 0.06}>
                <motion.div className="rounded-2xl p-6 h-full group" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)' }} whileHover={{ y: -6, borderColor: `${uc.color}25` }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
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

            {/* ═══ PRICING ═══ */}
      <section className="py-20 px-6">
        <div className="text-center mb-12"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Simple <span style={{ color: '#25D366' }}>pricing.</span></h2></ScrollReveal></div>
        <ScrollReveal delay={0.1}>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Starter */}
            <div className="rounded-2xl p-7 text-left" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Starter</p>
              <div className="flex items-baseline gap-1 mt-2"><span className="text-3xl font-extrabold text-surface">€39.99</span><span className="text-gray-400 text-sm">/month</span></div>
              <p className="text-xs text-gray-400 mt-2 mb-5">For small businesses getting started.</p>
              <div className="space-y-2.5">
                {['AI WhatsApp agent', 'Auto-replies 24/7', 'Basic order handling', 'Analytics dashboard', '1 number'].map(f => (
                  <div key={f} className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(0,0,0,0.04)' }}><Check className="w-2.5 h-2.5 text-gray-400" /></div><span className="text-xs text-gray-600">{f}</span></div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6">
                <button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')} className="w-full py-3.5 rounded-full font-bold text-sm" style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#374151' }}>Get started →</button>
              </motion.div>
            </div>
            {/* Growth */}
            <div className="rounded-2xl p-7 text-left relative" style={{ background: 'rgba(255,255,255,0.95)', border: `2px solid #25D36630`, boxShadow: `0 16px 48px #25D36612`, transform: 'scale(1.02)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: '#25D366' }}>Most Popular</div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Growth</p>
              <div className="flex items-baseline gap-1 mt-2"><span className="text-3xl font-extrabold" style={{ color: '#25D366' }}>€69.99</span><span className="text-gray-400 text-sm">/month</span></div>
              <p className="text-xs text-gray-400 mt-2 mb-5">For growing businesses that need more.</p>
              <div className="space-y-2.5">
                {['Everything in Starter', 'Advanced order flows', 'Booking integration', 'Broadcast campaigns', 'Payment integration', 'Priority support'].map(f => (
                  <div key={f} className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: '#25D36615' }}><Check className="w-2.5 h-2.5" style={{ color: '#25D366' }} /></div><span className="text-xs text-gray-600">{f}</span></div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6">
                <button onClick={() => window.open('https://studio.freemi.ai/signup', '_blank')} className="w-full py-3.5 rounded-full text-white font-bold text-sm" style={{ background: `linear-gradient(135deg, #25D366, #25D366CC)`, boxShadow: `0 6px 20px #25D36640` }}>Get started →</button>
              </motion.div>
            </div>
            {/* Scale */}
            <div className="rounded-2xl p-7 text-left" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Scale</p>
              <div className="flex items-baseline gap-1 mt-2"><span className="text-3xl font-extrabold text-surface">€99.99</span><span className="text-gray-400 text-sm">/month</span></div>
              <p className="text-xs text-gray-400 mt-2 mb-5">For teams that need the full platform.</p>
              <div className="space-y-2.5">
                {['Everything in Growth', 'Multiple numbers', 'Custom AI training', 'Advanced integrations', 'Dedicated manager', 'SLA guarantee'].map(f => (
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
      <section className="py-20 px-6 relative overflow-hidden"><FloatingBg seed={161} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Loved by <span style={{ color: AC }}>businesses.</span></h2></ScrollReveal></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: 'Our customers love ordering through WhatsApp. AI handles 90% of orders. Revenue up 40%.', name: 'Ahmed Hassan', role: 'Owner, Medina Pharmacy', gradient: `linear-gradient(135deg, ${AC}, #128C7E)` },
              { quote: 'WhatsApp reminders dropped no-shows from 25% to 6%. The ROI is insane.', name: 'Lisa Brennan', role: 'Manager, Glow Aesthetics', gradient: 'linear-gradient(135deg, #7B61FF, #E84393)' },
              { quote: 'Every message gets a perfect response in seconds. Before, we missed everything after 6pm.', name: 'David Okoye', role: 'Founder, FreshBox', gradient: 'linear-gradient(135deg, #F59E0B, #27C087)' },
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
          <motion.div className="max-w-4xl mx-auto rounded-3xl relative overflow-hidden py-16 px-8 text-center" style={{ background: `linear-gradient(135deg, ${AC}, #128C7E, #2F8FFF)`, boxShadow: `0 32px 80px ${AC}40` }}>
            {[Sparkles, Send, Zap, Globe, Star, Bot, MessageCircle].map((Icon, i) => (
              <motion.div key={i} className="absolute text-white/[0.08] pointer-events-none" style={{ left: `${8 + i * 13}%`, top: `${15 + (i % 3) * 25}%` }} animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}><Icon style={{ width: 28 + i * 6, height: 28 + i * 6 }} /></motion.div>
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.15), transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Meet your customers where they are.</h2>
              <p className="mt-4 text-base text-white/70 max-w-md mx-auto">2 billion people use WhatsApp. Your AI agent is ready to talk to all of them.</p>
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
