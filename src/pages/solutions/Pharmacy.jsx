import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Pill, Phone, Globe, MessageCircle, ClipboardList, Users, BarChart3, Bot,
  ArrowRight, Check, Sparkles, Zap, Shield, Clock, Bell, Send, Star,
  Truck, FileText, Calendar, Heart, ShoppingCart, Package
} from 'lucide-react';
import TopNav from '../../components/TopNav';
import SiteFooter from '../../components/SiteFooter';
import ScrollReveal from '../../components/ScrollReveal';
import { SiWhatsapp } from 'react-icons/si';

/* floating bg */
const ORB_COLORS = ['rgba(123,97,255,0.22)', 'rgba(47,143,255,0.16)', 'rgba(236,72,153,0.14)', 'rgba(39,192,135,0.12)', 'rgba(168,85,247,0.18)'];
const FLOAT_ICONS = [Sparkles, Bot, Zap, Pill, Star, Phone, Globe, Send];
function seededRandom(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function FloatingBg({ seed = 42 }) {
  const r = seededRandom(seed); const rand = () => r();
  const gen = (n) => Array.from({ length: n }, () => ({ left: `${5 + rand() * 90}%`, top: `${5 + rand() * 90}%`, delay: rand() * 3, duration: 4 + rand() * 6, size: 14 + rand() * 18 }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {gen(4).map((p, i) => <motion.div key={`o${i}`} className="absolute rounded-full" style={{ left: p.left, top: p.top, width: 300 + i * 100, height: 300 + i * 100, background: `radial-gradient(circle, ${ORB_COLORS[i % 5]}, transparent 65%)`, filter: `blur(${50 + i * 12}px)` }} animate={{ x: [0, 30 + i * 10, 0], y: [0, -(20 + i * 10), 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />)}
      {gen(8).map((p, i) => { const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length]; return <motion.div key={`i${i}`} className="absolute text-purple-500/[0.12]" style={{ left: p.left, top: p.top }} animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}><Icon style={{ width: p.size, height: p.size }} /></motion.div>; })}
      {gen(10).map((p, i) => <motion.div key={`d${i}`} className="absolute rounded-full bg-purple-500/[0.25]" style={{ left: p.left, top: p.top, width: 3 + (i % 4) * 3, height: 3 + (i % 4) * 3 }} animate={{ opacity: [0.1, 0.7, 0.1], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 1.5 + (i % 4) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />)}
    </div>
  );
}

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemV = { hidden: { opacity: 0, y: 30, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

const PHARMACY_URL = 'https://freemipharmacy.web.app';

const features = [
  { icon: Phone, title: 'AI Phone Assistant', desc: 'Handles inbound calls, captures prescription orders, answers medication queries, and routes exceptions to your team.', color: '#7B61FF' },
  { icon: Globe, title: 'Website Ordering', desc: 'Patients upload scripts or request repeats online. Orders flow straight into your unified queue.', color: '#2F8FFF' },
  { icon: SiWhatsapp, title: 'WhatsApp Ordering', desc: 'Patients order in the app they already use. Photo prescriptions, repeat requests, delivery scheduling — all via chat.', color: '#25D366' },
  { icon: ClipboardList, title: 'Unified Order Queue', desc: 'All orders from every channel — phone, web, WhatsApp, walk-in — in one view. Prioritise, process, dispatch.', color: '#27C087' },
  { icon: Users, title: 'Patient Profiles', desc: 'Complete history across every interaction. Medications, preferences, delivery addresses, communication history.', color: '#FF8A2F' },
  { icon: Bell, title: 'Automated Reminders', desc: 'Prescription refill reminders, collection notifications, and delivery updates sent automatically via WhatsApp.', color: '#EC4899' },
  { icon: Truck, title: 'Delivery Management', desc: 'Schedule deliveries, track drivers, send ETAs to patients, and confirm drop-offs — all from one dashboard.', color: '#F59E0B' },
  { icon: BarChart3, title: 'Analytics & Insights', desc: 'Understand demand patterns, peak hours, popular medications, and operational bottlenecks. Data-driven pharmacy.', color: '#6366F1' },
];

export default function Pharmacy() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <TopNav />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(123,97,255,0.18) 0%, transparent 50%)' }} />
        <FloatingBg seed={300} />
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(123,97,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <motion.div className="relative z-10 max-w-5xl mx-auto px-6 text-center" variants={containerV} initial="hidden" animate="visible">
          <motion.div variants={itemV} className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-purple-200/30 shadow-sm">
              <Pill className="w-3.5 h-3.5" style={{ color: '#7B61FF' }} />
              <span className="text-xs font-semibold text-surface/80 tracking-wide">AI for Pharmacy</span>
            </div>
          </motion.div>
          <motion.div variants={itemV}><h1 className="mt-8 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.15] text-surface">Your Pharmacy.</h1></motion.div>
          <motion.div variants={itemV}><h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.15] text-gradient">Powered by AI.</h1></motion.div>
          <motion.p variants={itemV} className="mt-7 text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            AI-powered ordering via phone, WhatsApp, and web. Unified queue, patient profiles, delivery management, and automated reminders — built specifically for community pharmacies.
          </motion.p>
          <motion.div variants={itemV} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <a href={PHARMACY_URL} target="_blank" rel="noopener noreferrer"
                className="relative px-10 py-4 rounded-full text-white font-semibold text-base overflow-hidden group inline-flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 8px 32px rgba(123,97,255,0.35)' }}>
                Get started <ArrowRight className="w-4 h-4" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </a>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button onClick={() => navigate('/about')} className="px-10 py-4 rounded-full font-semibold text-base bg-white/60 backdrop-blur-sm" style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#374151' }}>Talk to us</button>
            </motion.div>
          </motion.div>
          <motion.div variants={itemV} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {['Built for Irish pharmacies', 'Live in 48 hours', 'Free trial'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}><Check className="w-2.5 h-2.5 text-emerald-600" /></div><span className="text-xs font-medium text-gray-500">{t}</span></span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* DASHBOARD MOCKUP */}
      <section className="relative -mt-8 pb-16 px-6 z-20">
        <ScrollReveal direction="none">
          <div className="max-w-5xl mx-auto">
            <motion.div className="relative rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 40px 100px rgba(0,0,0,0.08), 0 0 60px rgba(123,97,255,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}
              initial={{ opacity: 0, y: 60, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
              {/* browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-300" /><div className="w-3 h-3 rounded-full bg-amber-300" /><div className="w-3 h-3 rounded-full bg-emerald-300" /></div>
                <div className="flex-1 flex justify-center"><div className="px-4 py-1 rounded-md text-[10px] text-gray-400 bg-gray-50 border border-gray-100 font-mono">freemipharmacy.web.app</div></div>
              </div>
              {/* dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 min-h-[380px]">
                {/* sidebar */}
                <div className="hidden lg:flex flex-col border-r border-gray-100 p-4 gap-1">
                  <div className="flex items-center gap-2 px-3 py-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)' }}><Pill className="w-3.5 h-3.5 text-white" /></div>
                    <div><span className="text-xs font-bold text-gray-800">Freemi</span><p className="text-[8px] text-purple-500 font-medium">Pharmacy</p></div>
                  </div>
                  {[{ l: 'Dashboard', active: true }, { l: 'Orders Queue' }, { l: 'Patients' }, { l: 'Bookings' }, { l: 'Messages' }, { l: 'Voice & Calls' }, { l: 'Billing' }, { l: 'Analytics' }].map(n => (
                    <div key={n.l} className="px-3 py-2 rounded-lg text-[10px] font-medium" style={{ background: n.active ? 'rgba(123,97,255,0.08)' : 'transparent', color: n.active ? '#7B61FF' : 'rgba(0,0,0,0.4)' }}>{n.l}</div>
                  ))}
                </div>
                {/* main */}
                <div className="lg:col-span-3 p-5">
                  {/* stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {[{ l: 'Orders Today', v: '47', c: '#7B61FF', ch: '+12' }, { l: 'AI Handled', v: '89%', c: '#27C087', ch: '+3%' }, { l: 'Deliveries', v: '18', c: '#2F8FFF', ch: '+5' }, { l: 'Revenue', v: '€2,840', c: '#F59E0B', ch: '+€620' }].map(s => (
                      <div key={s.l} className="rounded-xl p-3" style={{ background: `${s.c}06`, border: `1px solid ${s.c}12` }}>
                        <p className="text-[8px] text-gray-400 uppercase font-semibold">{s.l}</p>
                        <p className="text-xl font-extrabold mt-0.5" style={{ color: s.c }}>{s.v}</p>
                        <p className="text-[9px] font-semibold mt-0.5" style={{ color: s.c }}>{s.ch}</p>
                      </div>
                    ))}
                  </div>
                  {/* orders queue */}
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Orders Queue</p>
                      <div className="flex gap-2">
                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold">8 pending</span>
                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">39 completed</span>
                      </div>
                    </div>
                    {[
                      { name: 'Mary O\'Brien', items: 'Vitamin D3, Omega-3', channel: 'Phone', channelColor: '#7B61FF', status: 'Processing', statusColor: 'bg-blue-50 text-blue-600' },
                      { name: 'Patrick Kelly', items: 'Metformin 500mg (repeat)', channel: 'WhatsApp', channelColor: '#25D366', status: 'Ready', statusColor: 'bg-emerald-50 text-emerald-600' },
                      { name: 'Siobhan Walsh', items: 'Flu Vaccine booking', channel: 'Website', channelColor: '#2F8FFF', status: 'Pending', statusColor: 'bg-amber-50 text-amber-600' },
                      { name: 'Declan Murphy', items: 'Salbutamol inhaler', channel: 'Walk-in', channelColor: '#94A3B8', status: 'Dispensed', statusColor: 'bg-gray-100 text-gray-600' },
                      { name: 'Aoife Ryan', items: 'Monthly prescription pack', channel: 'WhatsApp', channelColor: '#25D366', status: 'Out for delivery', statusColor: 'bg-purple-50 text-purple-600' },
                    ].map((o, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
                        <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center shrink-0"><span className="text-[9px] font-bold text-purple-600">{o.name.split(' ').map(n=>n[0]).join('')}</span></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-gray-800 truncate">{o.name}</p>
                          <p className="text-[9px] text-gray-400 truncate">{o.items}</p>
                        </div>
                        <span className="text-[8px] px-2 py-0.5 rounded-full font-bold shrink-0" style={{ background: `${o.channelColor}10`, color: o.channelColor }}>{o.channel}</span>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold shrink-0 ${o.statusColor}`}>{o.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>
      </section>

      {/* STATS */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ v: '89%', l: 'Orders handled by AI' }, { v: '<8s', l: 'Average response time' }, { v: '60%', l: 'Fewer phone calls' }, { v: '24/7', l: 'Patient support' }].map((s, i) => (
            <ScrollReveal key={s.l} delay={i * 0.08}>
              <div className="text-center"><p className="text-3xl md:text-4xl font-extrabold" style={{ color: '#7B61FF' }}>{s.v}</p><p className="mt-1 text-sm text-gray-500 font-medium">{s.l}</p></div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        <FloatingBg seed={310} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase" style={{ background: 'rgba(123,97,255,0.08)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.15)' }}><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Features</div></ScrollReveal>
            <ScrollReveal delay={0.1}><h2 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight text-surface leading-[1.15]">Built for <span className="text-gradient-purple">real pharmacy</span> workflows.</h2></ScrollReveal>
            <ScrollReveal delay={0.15}><p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">Every feature designed specifically for community pharmacies.</p></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={0.05 + i * 0.06}>
                <motion.div className="relative h-full rounded-2xl p-6 overflow-hidden group"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -6, borderColor: `${f.color}30` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(135deg, ${f.color}06, transparent)` }} />
                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-white" style={{ background: f.color, boxShadow: `0 6px 18px ${f.color}35` }}>
                      <f.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-surface">{f.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 md:py-32 px-6" style={{ background: 'linear-gradient(180deg, rgba(123,97,255,0.03), rgba(47,143,255,0.02))' }}>
        <div className="text-center mb-16">
          <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">How it works for <span className="text-gradient-purple">your pharmacy.</span></h2></ScrollReveal>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <motion.div className="hidden md:block absolute h-[2px]" style={{ top: 64, left: '17%', right: '17%', background: 'linear-gradient(90deg, #7B61FF, #2F8FFF, #27C087)' }}
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
          {[
            { icon: Pill, title: 'Connect your pharmacy', desc: 'We set up ordering channels — phone, WhatsApp, website. Link your patient database and dispensing system.', color: '#7B61FF', step: '01' },
            { icon: Bot, title: 'AI handles orders', desc: 'Patients call, text, or order online. AI captures prescriptions, processes repeats, and queues everything for you.', color: '#2F8FFF', step: '02' },
            { icon: Zap, title: 'You dispense & deliver', desc: 'Review orders in one queue. Dispense, schedule deliveries, and let AI send patients their updates.', color: '#27C087', step: '03' },
          ].map((s, i) => (
            <ScrollReveal key={s.title} delay={0.2 + i * 0.15}>
              <div className="text-center relative">
                <motion.div className="relative inline-flex mb-6" whileHover={{ scale: 1.08, y: -4, rotate: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: `${s.color}08`, border: '4px solid white', boxShadow: `0 0 0 1px ${s.color}15` }}>
                    <s.icon className="w-9 h-9" style={{ color: s.color }} />
                  </div>
                  <motion.div className="absolute -top-2 -right-2 w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg ring-4 ring-white" style={{ background: s.color }}
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.5 + i * 0.15 }}>{s.step}</motion.div>
                </motion.div>
                <h3 className="text-lg font-bold text-surface mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[250px] mx-auto">{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 px-6">
        <div className="text-center mb-16">
          <ScrollReveal><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase mb-6" style={{ background: 'rgba(123,97,255,0.08)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.15)' }}><Star className="w-3 h-3" /> What pharmacies say</div></ScrollReveal>
          <ScrollReveal delay={0.1}><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Loved by pharmacies.</h2></ScrollReveal>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { quote: 'Phone orders that used to take 5 minutes now take 0. The AI captures everything and queues it perfectly. My team dispenses 30% more scripts per day.', name: 'Ciaran O\'Dowd', role: 'Owner, O\'Dowd Pharmacy', gradient: 'linear-gradient(135deg, #7B61FF, #2F8FFF)' },
            { quote: 'WhatsApp ordering changed everything. Patients love sending a photo of their prescription and getting a "ready for collection" text 20 minutes later.', name: 'Niamh Brennan', role: 'Superintendent, HealthFirst', gradient: 'linear-gradient(135deg, #25D366, #27C087)' },
            { quote: 'The delivery management alone saved us a full staff member. Routes planned, patients notified, confirmations sent — all automatically.', name: 'Dr. Aoife Kelly', role: 'Pharmacy Manager, MediCare+', gradient: 'linear-gradient(135deg, #E84393, #7B61FF)' },
          ].map((t, i) => (
            <ScrollReveal key={t.name} delay={0.1 + i * 0.08}>
              <div className="relative rounded-2xl p-6 h-full group" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', transition: 'transform 300ms ease, border-color 300ms ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(123,97,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}>
                <div className="absolute top-4 right-4 text-6xl text-gray-200/50 group-hover:text-gray-200 transition-colors font-serif leading-none">&ldquo;</div>
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
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <ScrollReveal direction="none">
          <motion.div className="max-w-3xl mx-auto rounded-3xl relative overflow-hidden py-16 px-8 text-center"
            style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8, #2F8FFF)', boxShadow: '0 32px 80px rgba(123,97,255,0.3)' }}>
            {[Sparkles, Pill, Zap, Globe, Star].map((Icon, i) => (
              <motion.div key={i} className="absolute text-white/[0.08] pointer-events-none" style={{ left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%` }}
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}>
                <Icon style={{ width: 28 + i * 6, height: 28 + i * 6 }} />
              </motion.div>
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.15), transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Ready to modernise your pharmacy?</h2>
              <p className="mt-4 text-base text-white/70 max-w-md mx-auto">AI-powered ordering, patient management, and delivery — live in 48 hours.</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <a href={PHARMACY_URL} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-base"
                    style={{ background: 'white', color: '#7B61FF', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    Get started <ArrowRight className="w-4 h-4" />
                  </a>
                </motion.div>
              </div>
              <p className="mt-6 text-xs text-white/40">Free trial · No credit card · Cancel anytime</p>
            </div>
          </motion.div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
