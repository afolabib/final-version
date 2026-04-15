import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, BarChart3, Calendar, FileText, Mail, Zap, ArrowRight, Check,
  Star, Bot, Sparkles, Globe, TrendingUp, Target, Palette, Code, Megaphone, PenTool, X
} from 'lucide-react';
import TopNav from '../../components/TopNav';
import SiteFooter from '../../components/SiteFooter';
import ScrollReveal from '../../components/ScrollReveal';

const ORB_COLORS = ['rgba(123,97,255,0.22)', 'rgba(123,97,255,0.16)', 'rgba(47,143,255,0.14)', 'rgba(39,192,135,0.12)', 'rgba(168,85,247,0.18)'];
const FLOAT_ICONS = [Sparkles, Bot, Zap, Briefcase, Star, Palette, Code, Target];
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

const AC = '#7B61FF';

const features = [
  { icon: Users, title: 'Client communication', desc: 'Automated confirmations, reminders via WhatsApp/SMS, waitlist notifications, and easy rescheduling. No-shows drop by 3×.', color: '#7B61FF', span: 'md:col-span-2 md:row-span-2' },
  { icon: BarChart3, title: 'Automated reporting', desc: 'Weekly and monthly client reports generated automatically from your project tools. Polished and sent on schedule.', color: '#7B61FF' },
  { icon: FileText, title: 'Client onboarding', desc: 'AI gathers requirements, sets up project spaces, sends welcome packs, and schedules kickoff calls.', color: '#2F8FFF' },
  { icon: Shield, title: 'Lead generation', desc: 'Maintains required documentation -- from audit trails to regulatory logs -- keeping your practice compliant without manual work.', color: '#27C087' },
  { icon: Calendar, title: 'Meeting management', desc: 'AI schedules across time zones, sends agendas, takes notes, and distributes action items.', color: '#F59E0B' },
  { icon: TrendingUp, title: 'Email management', desc: 'AI drafts responses, prioritises inbox, flags urgent items, and handles routine client correspondence.', color: '#0984E3', span: 'md:col-span-2' },
];

const differentiators = [
  { label: 'AI appointment scheduling', us: true, others: false },
  { label: 'WhatsApp & SMS reminders', us: true, others: false },
  { label: 'Automated reporting', us: true, others: false },
  { label: 'Billing query handling', us: true, others: false },
  { label: 'Calendar answering & triage', us: true, others: false },
  { label: 'Lead generation', us: true, others: false },
  { label: 'Online booking', us: true, others: true },
  { label: 'Basic patient records', us: true, others: true },
];

export default function Agencies() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #FFF0F6 0%, #F8F9FE 30%, #FFF5F8 60%, #F8F9FE 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <TopNav />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16">
        <FloatingBg seed={240} />
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(123,97,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* left -- copy */}
            <motion.div variants={containerV} initial="hidden" animate="visible">
              <motion.div variants={itemV}>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-pink-200/30 shadow-sm mb-8">
                  <Briefcase className="w-3.5 h-3.5" style={{ color: AC }} />
                  <span className="text-xs font-semibold text-surface/80 tracking-wide">Freemi | Agencies</span>
                </div>
              </motion.div>
              <motion.h1 variants={itemV} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                Scale Client Delivery<br />
                <span style={{ color: AC }}>Without Scaling Headcount.</span>
              </motion.h1>
              <motion.p variants={itemV} className="text-base md:text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
                AI agents that handle client communication, project updates, reporting, and lead generation — so your team focuses on creative work that actually matters.
              </motion.p>
              <motion.div variants={itemV} className="flex flex-col sm:flex-row gap-3 mb-8">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => navigate('/contact')}
                    className="relative px-8 py-4 rounded-full text-white font-semibold text-base overflow-hidden group"
                    style={{ background: `linear-gradient(135deg, ${AC}, #C2185B)`, boxShadow: `0 8px 32px rgba(123,97,255,0.35)` }}>
                    <span className="relative z-10 flex items-center gap-2">Get Started <ArrowRight className="w-4 h-4" /></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  </button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <a href="mailto:hello@freemi.ai" className="px-8 py-4 rounded-full font-semibold text-sm bg-white/60 backdrop-blur-sm inline-flex items-center" style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#374151' }}>Talk to us</a>
                </motion.div>
              </motion.div>
              <motion.div variants={itemV} className="flex flex-wrap gap-x-5 gap-y-2">
                {['Smart scheduling', 'Client onboarding', 'Lead qualification', 'HIPAA aware'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-emerald-600" /></div>
                    {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* right -- browser mockup */}
            <motion.div className="hidden lg:block relative" style={{ perspective: '1200px' }}
              initial={{ opacity: 0, x: 40, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: `0 50px 100px rgba(123,97,255,0.2), 0 0 80px rgba(123,97,255,0.08)`, transform: 'rotateY(-3deg) rotateX(2deg)' }}>
                {/* chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
                  <div className="flex-1 mx-8"><div className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-400">clinic-dashboard.freemi.ai</div></div>
                </div>
                {/* dashboard content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-purple-500" /><span className="text-[11px] font-bold text-gray-800">Client Dashboard</span></div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">AI Active</span>
                  </div>
                  {/* stats row */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[{ label: 'Active Projects', val: '18', color: '#7B61FF' }, { label: 'No-Shows', val: '47', color: '#27C087' }, { label: 'Reports Sent', val: '60%', color: '#7B61FF' }, { label: 'Reminders', val: '94', color: '#2F8FFF' }].map(s => (
                      <div key={s.label} className="rounded-lg p-2.5 text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                        <p className="text-sm font-extrabold" style={{ color: s.color }}>{s.val}</p>
                        <p className="text-[7px] text-gray-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* appointment list */}
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Active Clients</p>
                  <div className="space-y-1.5">
                    {[
                      { time: '09:00', patient: "Mary O'Brien", type: 'Brand Refresh', status: 'In Progress', sc: 'bg-emerald-50 text-emerald-600' },
                      { time: '09:45', patient: 'TechVault Inc', type: 'SEO Campaign', status: 'In Progress', sc: 'bg-emerald-50 text-emerald-600' },
                      { time: '10:30', patient: 'Rivera Legal', type: 'Website Build', status: 'On Track', sc: 'bg-blue-50 text-blue-600' },
                      { time: '11:15', patient: 'StartupXYZ', type: 'Social Media', status: 'Review', sc: 'bg-amber-50 text-amber-600' },
                      { time: '14:00', patient: 'GreenPath Co', type: 'Content Plan', status: 'In Progress', sc: 'bg-emerald-50 text-emerald-600' },
                    ].map(a => (
                      <div key={a.time} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-gray-50">
                        <span className="text-[10px] text-gray-400 font-mono w-9 shrink-0">{a.time}</span>
                        <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center shrink-0"><span className="text-[8px] font-bold text-pink-600">{a.patient.split(' ').map(n => n[0]).join('')}</span></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-gray-800 truncate">{a.patient}</p>
                          <p className="text-[8px] text-gray-400">{a.type}</p>
                        </div>
                        <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold ${a.sc}`}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* floating badges */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-purple-500/15 flex items-center justify-center"><Briefcase className="w-3 h-3 text-pink-600" /></div>
                <span className="text-xs font-semibold text-surface">3× client capacity</span>
              </motion.div>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-3 -left-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-purple-500/15 flex items-center justify-center"><Bot className="w-3 h-3 text-purple-600" /></div>
                <span className="text-xs font-semibold text-surface">60% less admin</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ v: '3×', l: 'Fewer no-shows' }, { v: '60%', l: 'less admin enquiries' }, { v: '12hrs', l: 'Admin saved weekly' }, { v: '24/7', l: 'Patient support' }].map((s, i) => (
            <ScrollReveal key={s.l} delay={i * 0.08}>
              <div className="text-center"><p className="text-3xl md:text-4xl font-extrabold" style={{ color: AC }}>{s.v}</p><p className="mt-1 text-sm text-gray-500 font-medium">{s.l}</p></div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES — BENTO GRID ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={182} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Everything your practice needs, <span style={{ color: AC }}>automated.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">AI agents that handle the admin so your clinical team can focus on patients.</p></ScrollReveal>
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

      {/* ═══ 3-STEP PROCESS ═══ */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: `linear-gradient(180deg, rgba(123,97,255,0.03), rgba(123,97,255,0.02))` }}>
        <FloatingBg seed={184} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">How it <span style={{ color: AC }}>works.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">Live in days, not months. Three simple steps to a smarter practice.</p></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <motion.div className="hidden md:block absolute h-[2px] overflow-hidden" style={{ top: 64, left: '16%', right: '16%' }}
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${AC}, #7B61FF, #2F8FFF)` }} />
            </motion.div>
            {[
              { step: '01', icon: Briefcase, title: 'Tell us about your agency', desc: 'Share your services, client types, and workflows. We configure AI agents for your specific needs.', color: AC, ring: 'rgba(123,97,255,0.1)', lightBg: 'rgba(123,97,255,0.06)' },
              { step: '02', icon: Globe, title: 'AI handles the admin', desc: 'Client comms, reporting, scheduling, lead follow-up — all automated across your channels.', color: '#7B61FF', ring: 'rgba(123,97,255,0.1)', lightBg: 'rgba(123,97,255,0.06)' },
              { step: '03', icon: Zap, title: 'Your team does creative work', desc: 'Staff focus on care, not admin. Patients get instant responses. No-shows plummet.', color: '#2F8FFF', ring: 'rgba(47,143,255,0.1)', lightBg: 'rgba(47,143,255,0.06)' },
            ].map((p, i) => (
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

      {/* ═══ US VS OTHERS ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <FloatingBg seed={186} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Freemi vs <span style={{ color: AC }}>Typical Agency.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-3 text-gray-500">Manual scheduling, phone-only bookings, paper records. Sound familiar?</p></ScrollReveal>
          </div>
          <ScrollReveal delay={0.15}>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: `0 16px 48px rgba(123,97,255,0.06)` }}>
              <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ background: `linear-gradient(135deg, rgba(123,97,255,0.05), rgba(123,97,255,0.03))` }}>
                <span className="text-gray-400">Capability</span>
                <span className="text-center text-gray-400">Typical Agency</span>
                <span className="text-center" style={{ color: AC }}>Freemi Agencies</span>
              </div>
              {differentiators.map((row, i) => (
                <motion.div key={row.label} className="grid grid-cols-3 px-6 py-3.5 items-center text-sm border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                  <span className="font-medium text-gray-700 text-xs">{row.label}</span>
                  <div className="flex justify-center">
                    {row.others ? <Check className="w-4 h-4 text-gray-300" /> : <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-400 text-[10px] font-bold">&times;</span>}
                  </div>
                  <div className="flex justify-center">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${AC}15` }}><Check className="w-3 h-3" style={{ color: AC }} /></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: `linear-gradient(180deg, rgba(123,97,255,0.04), rgba(123,97,255,0.02))` }}>
        <FloatingBg seed={188} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Built for <span style={{ color: AC }}>every practice.</span></h2></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Briefcase, title: 'Design Agencies', desc: 'Appointment booking, repeat prescriptions, test results notifications, and health check reminders.', color: '#7B61FF', metric: '60%', metricLabel: 'less admin' },
              { icon: Briefcase, title: 'Dev Agencies', desc: 'Cleaning reminders, check-up scheduling, treatment plan follow-ups, and insurance queries.', color: '#7B61FF', metric: '3× fewer', metricLabel: 'No-shows' },
              { icon: TrendingUp, title: 'Marketing Agencies', desc: 'Campaign reporting, lead handoff, content approval workflows, and performance updates.', color: '#2F8FFF', metric: '3x', metricLabel: 'Efficiency' },
              { icon: PenTool, title: 'Content Agencies', desc: 'Brief collection, editorial calendar management, review cycles, and publishing notifications.', color: '#27C087', metric: '92%', metricLabel: 'Auto-resolved' },
              { icon: Users, title: 'SEO & PPC', desc: 'Ranking reports, ad performance summaries, budget alerts, and client strategy calls.', color: '#F59E0B', metric: '24/7', metricLabel: 'Support' },
              { icon: Megaphone, title: 'Consulting', desc: 'Referral processing, pre-appointment preparation, post-procedure follow-ups, and results.', color: '#0984E3', metric: '12hrs', metricLabel: 'Saved weekly' },
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
                    <div className="text-right">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg text-white" style={{ background: uc.color }}>{uc.metric}</span>
                      <p className="text-[8px] text-gray-400 mt-0.5">{uc.metricLabel}</p>
                    </div>
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
        <FloatingBg seed={230} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface">Trusted by <span style={{ color: AC }}>healthcare professionals.</span></h2></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: 'We doubled our client roster without hiring. AI handles status updates, meeting prep, and client queries automatically.', name: 'Alex Turner', role: 'Founder, Pixel & Co', gradient: `linear-gradient(135deg, ${AC}, #7B61FF)` },
              { quote: 'Client onboarding that used to take 3 days now takes 3 hours. AI gathers requirements, sets up projects, and sends welcome packs.', name: 'Sarah Lee', role: 'MD, Forge Creative', gradient: 'linear-gradient(135deg, #2F8FFF, #27C087)' },
              { quote: 'The weekly client reports write themselves now. AI pulls data from all our tools and sends polished updates every Friday.', name: 'James Chen', role: 'CEO, Launchpad Digital', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
            ].map((t, i) => (
              <ScrollReveal key={t.name} delay={0.1 + i * 0.08}>
                <div className="relative rounded-2xl p-6 h-full group"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', transition: 'transform 300ms ease, border-color 300ms ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = `${AC}30`; }}
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

      {/* ═══ GRADIENT CTA ═══ */}
      <section className="py-16 px-6">
        <ScrollReveal direction="none">
          <motion.div className="max-w-4xl mx-auto rounded-3xl relative overflow-hidden py-16 px-8 text-center"
            style={{ background: `linear-gradient(135deg, ${AC}, #C2185B, #7B61FF)`, boxShadow: `0 32px 80px rgba(123,97,255,0.3)` }}>
            {[Sparkles, Briefcase, Briefcase, Globe, Zap, Bot, Star].map((Icon, i) => (
              <motion.div key={i} className="absolute text-white/[0.08] pointer-events-none" style={{ left: `${10 + i * 13}%`, top: `${15 + (i % 3) * 25}%` }}
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}>
                <Icon style={{ width: 28 + i * 6, height: 28 + i * 6 }} />
              </motion.div>
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.15), transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Better Care. Less Admin.</h2>
              <p className="mt-4 text-base text-white/70 max-w-md mx-auto">AI agents that handle the admin so your team can focus on creative work.</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => navigate('/contact')}
                    className="px-10 py-4 rounded-full font-bold text-base" style={{ background: 'white', color: AC, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    Get Started <ArrowRight className="inline ml-2 w-4 h-4" />
                  </button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <a href="mailto:hello@freemi.ai" className="px-10 py-4 rounded-full font-semibold text-base text-white inline-block" style={{ border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}>Talk to us</a>
                </motion.div>
              </div>
              <p className="mt-6 text-xs text-white/40">No setup fees · Live in days · Cancel anytime</p>
            </div>
          </motion.div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
