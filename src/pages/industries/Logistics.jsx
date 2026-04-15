import { motion } from 'framer-motion';
import {
  Package, Truck, MapPin, Clock, Zap, BarChart3, Phone, Globe, Bell, AlertTriangle,
  ClipboardList, Warehouse, Navigation, Shield, Fuel, Container, ArrowRight, Check,
  Star, Bot, Sparkles
} from 'lucide-react';
import TopNav from '../../components/TopNav';
import SiteFooter from '../../components/SiteFooter';
import ScrollReveal from '../../components/ScrollReveal';

const ORB_COLORS = ['rgba(47,143,255,0.22)', 'rgba(123,97,255,0.16)', 'rgba(39,192,135,0.14)', 'rgba(236,72,153,0.12)', 'rgba(245,158,11,0.18)'];
const FLOAT_ICONS = [Sparkles, Bot, Zap, Truck, Star, MapPin, Package, Globe];
function seededRandom(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function FloatingBg({ seed = 42 }) {
  const r = seededRandom(seed); const rand = () => r();
  const gen = (n) => Array.from({ length: n }, () => ({ left: `${5 + rand() * 90}%`, top: `${5 + rand() * 90}%`, delay: rand() * 3, duration: 4 + rand() * 6, size: 14 + rand() * 18 }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {gen(5).map((p, i) => <motion.div key={`o${i}`} className="absolute rounded-full" style={{ left: p.left, top: p.top, width: 300 + i * 100, height: 300 + i * 100, background: `radial-gradient(circle, ${ORB_COLORS[i % 5]}, transparent 65%)`, filter: `blur(${50 + i * 12}px)` }} animate={{ x: [0, 30 + i * 10, 0], y: [0, -(20 + i * 10), 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />)}
      {gen(10).map((p, i) => { const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length]; return <motion.div key={`i${i}`} className="absolute text-blue-500/[0.1]" style={{ left: p.left, top: p.top }} animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}><Icon style={{ width: p.size, height: p.size }} /></motion.div>; })}
    </div>
  );
}

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemV = { hidden: { opacity: 0, y: 30, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

const AC = '#2F8FFF';

const features = [
  { icon: MapPin, title: 'Real-time tracking updates', desc: 'Automated delivery status updates via WhatsApp, SMS, and email. Customers always know where their order is.', color: AC, span: 'md:col-span-2 md:row-span-2' },
  { icon: Truck, title: 'Driver coordination', desc: 'AI assigns routes, sends delivery instructions, and manages driver communications.', color: '#7B61FF' },
  { icon: Phone, title: 'Customer enquiry handling', desc: 'AI answers tracking questions, handles complaints, and escalates urgent issues.', color: '#27C087' },
  { icon: AlertTriangle, title: 'Exception management', desc: 'Delayed deliveries, failed attempts, address issues — AI notifies and offers solutions.', color: '#F59E0B' },
  { icon: BarChart3, title: 'Delivery analytics', desc: 'Track on-time rates, delivery volumes, common issues, and satisfaction scores.', color: '#E84393' },
  { icon: Bell, title: 'Proactive notifications', desc: 'Dispatch confirmations, ETA updates, delivery confirmations, and feedback requests — all automated.', color: '#0984E3', span: 'md:col-span-2' },
];

const differentiators = [
  { label: 'AI-powered tracking updates', us: true, others: false },
  { label: 'Automated driver coordination', us: true, others: false },
  { label: 'Proactive exception handling', us: true, others: false },
  { label: 'Multi-channel notifications', us: true, others: false },
  { label: 'Real-time delivery analytics', us: true, others: false },
  { label: 'Customer self-service tracking', us: true, others: true },
  { label: '24/7 dispatch support', us: true, others: false },
  { label: 'Automated feedback collection', us: true, others: true },
];

export default function Logistics() {
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <TopNav />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16">
        <FloatingBg seed={210} />
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: `radial-gradient(${AC}0F 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* left — copy */}
            <motion.div variants={containerV} initial="hidden" animate="visible">
              <motion.div variants={itemV}>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-blue-200/30 shadow-sm mb-8">
                  <Package className="w-3.5 h-3.5" style={{ color: AC }} />
                  <span className="text-xs font-semibold text-surface/80 tracking-wide">Freemi | Logistics</span>
                </div>
              </motion.div>
              <motion.h1 variants={itemV} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                Keep Your Supply Chain<br />
                <span style={{ color: AC }}>Moving. Automatically.</span>
              </motion.h1>
              <motion.p variants={itemV} className="text-base md:text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
                AI agents that handle order tracking, delivery updates, driver communication, and customer enquiries — keeping your operations smooth without the manual overhead.
              </motion.p>
              <motion.div variants={itemV} className="flex flex-col sm:flex-row gap-3 mb-8">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.location.href = '/signup'}
                    className="relative px-8 py-4 rounded-full text-white font-semibold text-base overflow-hidden group"
                    style={{ background: `linear-gradient(135deg, ${AC}, #1A6FD4)`, boxShadow: `0 8px 32px ${AC}55` }}>
                    <span className="relative z-10 flex items-center gap-2">Start free trial <ArrowRight className="w-4 h-4" /></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  </button>
                </motion.div>
              </motion.div>
              <motion.div variants={itemV} className="flex flex-wrap gap-x-5 gap-y-2">
                {['Real-time tracking', '99.2% on-time', '24/7 dispatch', 'Multi-channel'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <div className="w-4 h-4 rounded-full bg-blue-500/15 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-blue-600" /></div>{t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* right — delivery dashboard mockup */}
            <motion.div className="hidden lg:block relative" style={{ perspective: '1200px' }}
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: `0 50px 100px ${AC}30, 0 0 80px ${AC}12`, transform: 'rotateY(-3deg) rotateX(2deg)' }}>
                {/* chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
                  <div className="flex-1 mx-8"><div className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-400">app.freemi.ai/logistics</div></div>
                </div>
                {/* dashboard content */}
                <div className="p-5">
                  {/* stats row */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Active Shipments', value: '47', color: AC },
                      { label: 'On-Time', value: '99.2%', color: '#27C087' },
                      { label: 'Tracking Queries', value: '128', color: '#7B61FF' },
                      { label: 'Driver Updates', value: '34', color: '#F59E0B' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                        <p className="text-sm font-extrabold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[8px] text-gray-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* shipment tracking list */}
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-700">Shipment Tracking</span>
                      <span className="text-[8px] text-gray-400">Live</span>
                    </div>
                    {[
                      { id: 'FRE-4821', dest: 'London, UK', status: 'In Transit', statusColor: AC },
                      { id: 'FRE-4819', dest: 'Manchester, UK', status: 'Delivered', statusColor: '#27C087' },
                      { id: 'FRE-4817', dest: 'Birmingham, UK', status: 'Out for Delivery', statusColor: '#F59E0B' },
                      { id: 'FRE-4815', dest: 'Leeds, UK', status: 'In Transit', statusColor: AC },
                      { id: 'FRE-4812', dest: 'Bristol, UK', status: 'Delivered', statusColor: '#27C087' },
                    ].map((s, i) => (
                      <div key={s.id} className="px-3 py-2 flex items-center justify-between border-b border-gray-50 last:border-0" style={{ background: i === 0 ? `${AC}04` : 'transparent' }}>
                        <div className="flex items-center gap-2">
                          <Package className="w-3 h-3 text-gray-300" />
                          <div>
                            <p className="text-[10px] font-bold text-gray-700">{s.id}</p>
                            <p className="text-[8px] text-gray-400">{s.dest}</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: s.statusColor }}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* floating badges */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center"><Zap className="w-3 h-3 text-emerald-600" /></div>
                <span className="text-xs font-semibold text-surface">99.2% on-time</span>
              </motion.div>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-3 -left-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center"><Truck className="w-3 h-3 text-blue-600" /></div>
                <span className="text-xs font-semibold text-surface">47 active shipments</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ v: '70%', l: 'Fewer tracking calls' }, { v: '99.2%', l: 'On-time updates' }, { v: '5hrs', l: 'Saved daily' }, { v: '24/7', l: 'Dispatch support' }].map((s, i) => (
            <ScrollReveal key={s.l} delay={i * 0.08}>
              <div className="text-center"><p className="text-3xl md:text-4xl font-extrabold" style={{ color: AC }}>{s.v}</p><p className="mt-1 text-sm text-gray-500 font-medium">{s.l}</p></div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES — BENTO GRID ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={212} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Every shipment, <span style={{ color: AC }}>tracked and managed.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">AI handles tracking, coordination, and communication so your team focuses on operations.</p></ScrollReveal>
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

      {/* ═══ HOW IT WORKS — 3 STEPS ═══ */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${AC}06, rgba(123,97,255,0.02))` }}>
        <FloatingBg seed={214} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Live in <span style={{ color: AC }}>under a day.</span></h2></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <motion.div className="hidden md:block absolute h-[2px] overflow-hidden" style={{ top: 64, left: '17%', right: '17%' }}
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${AC}, #7B61FF, #27C087)` }} />
            </motion.div>
            {[
              { step: '01', icon: Package, title: 'Connect your systems', desc: 'Link your order management, fleet tracking, and customer database. We integrate with your existing tools.', color: AC },
              { step: '02', icon: Globe, title: 'AI handles communications', desc: 'Tracking updates, customer queries, driver coordination — all automated across every channel.', color: '#7B61FF' },
              { step: '03', icon: Zap, title: 'Operations run themselves', desc: 'Fewer calls, faster responses, happier customers. Your team focuses on what matters.', color: '#27C087' },
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

      {/* ═══ COMPARISON TABLE ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={216} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Not manual dispatch. <span style={{ color: AC }}>AI-powered ops.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-3 text-gray-500">Manual dispatch can't keep up. Freemi handles it all automatically.</p></ScrollReveal>
          </div>
          <ScrollReveal delay={0.15}>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: `0 16px 48px ${AC}08` }}>
              <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ background: `linear-gradient(135deg, ${AC}08, rgba(123,97,255,0.03))` }}>
                <span className="text-gray-400">Capability</span><span className="text-center text-gray-400">Manual Dispatch</span><span className="text-center" style={{ color: AC }}>Freemi Logistics</span>
              </div>
              {differentiators.map((row, i) => (
                <motion.div key={row.label} className="grid grid-cols-3 px-6 py-3.5 items-center text-sm border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                  <span className="font-medium text-gray-700 text-xs">{row.label}</span>
                  <div className="flex justify-center">{row.others ? <Check className="w-4 h-4 text-gray-300" /> : <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-400 text-[10px] font-bold">&times;</span>}</div>
                  <div className="flex justify-center"><div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${AC}15` }}><Check className="w-3 h-3" style={{ color: AC }} /></div></div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${AC}05, rgba(47,143,255,0.02))` }}>
        <FloatingBg seed={218} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Built for <span style={{ color: AC }}>every logistics operation.</span></h2></ScrollReveal></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Truck, title: 'Last-Mile Delivery', desc: 'ETA updates, delivery instructions, failed delivery rebooking, and proof of delivery notifications.', color: '#E84393', metric: '99.2%', metricLabel: 'On-time' },
              { icon: Warehouse, title: 'Warehouse & Fulfilment', desc: 'Order status updates, stock alerts, pick-pack notifications, and dispatch confirmations.', color: '#7B61FF', metric: '70%', metricLabel: 'Fewer calls' },
              { icon: Container, title: 'Freight & Shipping', desc: 'Shipment tracking, customs documentation queries, arrival notifications, and cargo status updates.', color: AC, metric: '24/7', metricLabel: 'Tracking' },
              { icon: Navigation, title: 'Fleet Management', desc: 'Route assignment, driver communication, maintenance scheduling, and incident reporting.', color: '#27C087', metric: '5hrs', metricLabel: 'Saved daily' },
              { icon: Shield, title: 'Cold Chain', desc: 'Temperature alerts, compliance documentation, delivery window management, and quality assurance tracking.', color: '#F59E0B', metric: '100%', metricLabel: 'Compliance' },
              { icon: Fuel, title: 'Field Services', desc: 'Job assignment, customer scheduling, completion updates, and invoicing triggers.', color: '#0984E3', metric: '3\u00d7', metricLabel: 'Efficiency' },
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
        <FloatingBg seed={220} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12"><ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Smoother operations, <span style={{ color: AC }}>happier customers.</span></h2></ScrollReveal></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: 'Tracking enquiries used to consume our entire customer service team. Now AI handles 70% of them instantly via WhatsApp.', name: 'Mark Sullivan', role: 'Operations Director, FastTrack Logistics', gradient: `linear-gradient(135deg, ${AC}, #7B61FF)` },
              { quote: "Delivery ETAs are sent automatically. Customers stopped calling to ask where their order is — because they already know.", name: 'Lisa Ng', role: 'CEO, Pacific Express', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
              { quote: 'Driver coordination is seamless now. AI assigns routes, sends instructions, and handles schedule changes without a dispatcher.', name: 'Tom Brady', role: 'Fleet Manager, Metro Couriers', gradient: 'linear-gradient(135deg, #F59E0B, #E84393)' },
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
            style={{ background: `linear-gradient(135deg, ${AC}, #1A6FD4, #7B61FF)`, boxShadow: `0 32px 80px ${AC}40` }}>
            {[Sparkles, Truck, Zap, Globe, Star, MapPin, Bot].map((Icon, i) => (
              <motion.div key={i} className="absolute text-white/[0.08] pointer-events-none" style={{ left: `${8 + i * 13}%`, top: `${15 + (i % 3) * 25}%` }}
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}>
                <Icon style={{ width: 28 + i * 6, height: 28 + i * 6 }} />
              </motion.div>
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.15), transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Smoother operations.<br />Happier customers.</h2>
              <p className="mt-4 text-base text-white/70 max-w-md mx-auto">AI agents that keep your supply chain moving — without the manual overhead.</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.location.href = '/signup'} className="px-10 py-4 rounded-full font-bold text-base" style={{ background: 'white', color: AC, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    Start free trial <ArrowRight className="inline ml-2 w-4 h-4" />
                  </button>
                </motion.div>
              </div>
              <p className="mt-6 text-xs text-white/40">No credit card · Setup in one day · Cancel anytime</p>
            </div>
          </motion.div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
