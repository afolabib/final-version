import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, Bot, Zap, Globe, MessageSquare, Star, Send, CalendarCheck, Calendar, Phone } from 'lucide-react';

const FLOAT_ICONS = [Sparkles, Bot, Zap, Globe, Star, MessageSquare, Calendar, Send, Phone];
import TopNav from './TopNav';
import SiteFooter from './SiteFooter';
import ScrollReveal from './ScrollReveal';

/* ── Floating background (same as Home) ─────────────── */
const ORB_COLORS = ['rgba(123,97,255,0.22)', 'rgba(47,143,255,0.16)', 'rgba(236,72,153,0.14)', 'rgba(39,192,135,0.12)', 'rgba(168,85,247,0.18)'];

function seededRandom(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

function FloatingBg({ seed = 42, darkBg = false }) {
  const r = seededRandom(seed);
  const rand = () => r();
  const gen = (n) => Array.from({ length: n }, () => ({ left: `${5 + rand() * 90}%`, top: `${5 + rand() * 90}%`, delay: rand() * 3, duration: 4 + rand() * 6, size: 14 + rand() * 18 }));
  const orbs = gen(4); const dots = gen(10); const rings = gen(2); const iconItems = gen(8);
  const dotBg = darkBg ? 'bg-white/[0.15]' : 'bg-purple-500/[0.25]';
  const ringBorder = darkBg ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(123,97,255,0.1)';
  const iconColor = darkBg ? 'text-white/[0.12]' : 'text-purple-500/[0.12]';
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((p, i) => (
        <motion.div key={`o${i}`} className="absolute rounded-full"
          style={{ left: p.left, top: p.top, width: 300 + i * 100, height: 300 + i * 100, background: `radial-gradient(circle, ${ORB_COLORS[i % ORB_COLORS.length]}, transparent 65%)`, filter: `blur(${50 + i * 12}px)` }}
          animate={{ x: [0, 30 + i * 10, 0], y: [0, -(20 + i * 10), 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />
      ))}
      {rings.map((p, i) => (
        <motion.div key={`r${i}`} className="absolute rounded-full"
          style={{ left: p.left, top: p.top, width: 100 + i * 50, height: 100 + i * 50, border: ringBorder, transform: 'translate(-50%,-50%)' }}
          animate={{ scale: [1, 2.5], opacity: [0.15, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeOut', delay: i * 1.5 }} />
      ))}
      {iconItems.map((p, i) => {
        const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length];
        return (
          <motion.div key={`i${i}`} className={`absolute ${iconColor}`}
            style={{ left: p.left, top: p.top }}
            animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}>
            <Icon style={{ width: p.size, height: p.size }} />
          </motion.div>
        );
      })}
      {dots.map((p, i) => (
        <motion.div key={`d${i}`} className={`absolute rounded-full ${dotBg}`}
          style={{ left: p.left, top: p.top, width: 3 + (i % 4) * 3, height: 3 + (i % 4) * 3 }}
          animate={{ opacity: [0.1, 0.7, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5 + (i % 4) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />
      ))}
    </div>
  );
}

/* ── Shared section components ───────────────────────── */

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

function PurpleWash() {
  return (
    <div className="flex justify-center py-1">
      <div className="h-px w-full max-w-3xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(123,97,255,0.15), transparent)' }} />
    </div>
  );
}

/* ─── MAIN LAYOUT ───────────────────────────────────── */

export default function ProductPageLayout({
  // Hero
  badge,
  badgeIcon: BadgeIcon,
  accentColor = '#7B61FF',
  headline,       // string or JSX
  headlineAccent,  // gradient colored line
  subtitle,
  seed = 42,

  // Features (bento grid)
  features = [],   // [{ icon, title, desc, color }]

  // How it works
  steps = [],      // [{ icon, title, desc }]

  // Use cases
  useCases = [],   // [{ icon, title, desc }]

  // Pricing (optional)
  price,           // { amount, period, setup, features: [] }

  // Demo visual (JSX rendered after hero)
  demoVisual,

  // Stats strip
  stats = [],      // [{ value, label }]

  // Testimonials
  testimonials = [], // [{ quote, name, role, gradient }]

  // CTA
  ctaHeadline = 'Ready to get started?',
  ctaSubtitle = '7-day free trial. No credit card. Live in 48 hours.',
}) {
  const navigate = useNavigate();

  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <TopNav />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(123,97,255,0.18) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(47,143,255,0.08) 0%, transparent 50%)' }} />
        <FloatingBg seed={seed} />
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(123,97,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <motion.div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${accentColor}18, transparent 70%)` }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />

        <motion.div className="relative z-10 max-w-4xl mx-auto px-6 text-center"
          variants={containerVariants} initial="hidden" animate="visible">

          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border shadow-sm overflow-hidden relative"
              style={{ borderColor: `${accentColor}20` }}>
              {BadgeIcon && <span className="flex items-center justify-center w-5 h-5 rounded-full" style={{ background: `${accentColor}15` }}>
                <BadgeIcon className="w-3 h-3" style={{ color: accentColor }} />
              </span>}
              <span className="text-xs font-semibold text-surface/80 tracking-wide">{badge}</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-surface">{headline}</h1>
          </motion.div>
          {headlineAccent && (
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]"
                style={{ color: accentColor }}>{headlineAccent}</h1>
            </motion.div>
          )}

          <motion.p variants={itemVariants} className="mt-7 text-base md:text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">{subtitle}</motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button onClick={() => window.location.href = '/signup'}
                className="relative px-10 py-4 rounded-full text-white font-semibold text-base overflow-hidden group"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`, boxShadow: `0 8px 32px ${accentColor}40` }}>
                <span className="relative z-10 flex items-center gap-2">
                  Start free trial
                  <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button onClick={() => navigate('/about')}
                className="px-10 py-4 rounded-full font-semibold text-base bg-white/60 backdrop-blur-sm"
                style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#374151' }}>
                Talk to us
              </button>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {['No credit card', 'Live in 48 hours', '7-day free trial'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">{t}</span>
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── DEMO VISUAL ────────────────────────────── */}
      {demoVisual && (
        <section className="relative -mt-8 pb-16 px-6 z-20">
          <ScrollReveal direction="none">
            <div className="max-w-4xl mx-auto">
              <motion.div className="relative rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(24px) saturate(180%)', boxShadow: `0 40px 100px rgba(0,0,0,0.08), 0 0 60px ${accentColor}08`, border: '1px solid rgba(0,0,0,0.08)' }}
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
                {/* browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-lg text-[11px] text-gray-400 font-mono" style={{ background: 'rgba(0,0,0,0.03)' }}>
                      app.freemi.ai
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {demoVisual}
                </div>
              </motion.div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* ── STATS STRIP ──────────────────────────────── */}
      {stats.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 0.08}>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-extrabold" style={{ color: accentColor }}>{s.value}</p>
                  <p className="mt-1 text-sm text-gray-500 font-medium">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      <PurpleWash />

      {/* ── FEATURES (Bento Grid) ────────────────────── */}
      {features.length > 0 && (
        <section className="relative py-24 md:py-32 px-6 overflow-hidden">
          <FloatingBg seed={seed + 50} />
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <ScrollReveal><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase" style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}18` }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Features
              </div></ScrollReveal>
              <ScrollReveal delay={0.1}><h2 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight text-surface leading-[1.1]">Everything you need.<br /><span style={{ color: accentColor }}>Nothing you don't.</span></h2></ScrollReveal>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {features.map((f, i) => {
                const span = i === 0 || i === features.length - 1 ? 'md:col-span-2' : '';
                return (
                  <ScrollReveal key={f.title} delay={0.05 + i * 0.06}>
                    <motion.div className={`relative h-full rounded-2xl p-7 overflow-hidden group ${span}`}
                      style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }}
                      whileHover={{ y: -6, borderColor: `${f.color || accentColor}30` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                      {/* hover gradient */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `linear-gradient(135deg, ${f.color || accentColor}06, ${f.color || accentColor}02)` }} />
                      <div className="relative z-10">
                        <motion.div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                          style={{ background: `${f.color || accentColor}10` }}
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                          <f.icon className="w-5 h-5" style={{ color: f.color || accentColor }} />
                        </motion.div>
                        <h3 className="text-base font-bold text-surface">{f.title}</h3>
                        <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                      </div>
                      {/* hover arrow */}
                      <ArrowRight className="absolute top-6 right-6 w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-300" />
                    </motion.div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      {steps.length > 0 && (
        <>
          <PurpleWash />
          <section className="py-24 md:py-32 px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <ScrollReveal><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase" style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}18` }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> How it works
              </div></ScrollReveal>
              <ScrollReveal delay={0.1}><h2 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight text-surface leading-[1.1]">Simple setup.<br /><span style={{ color: accentColor }}>Instant results.</span></h2></ScrollReveal>
            </div>
            <div className="max-w-5xl mx-auto relative">
              {/* connecting line desktop */}
              <motion.div className="hidden md:block absolute h-0.5 z-0"
                style={{ top: 72, left: '17%', right: '17%', background: `linear-gradient(90deg, ${accentColor}, ${accentColor}30)` }}
                initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
                viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((s, i) => {
                  const stepColors = [
                    { bg: 'rgba(123,97,255,0.06)', ring: 'rgba(123,97,255,0.1)', num: '#7B61FF', icon: '#7B61FF' },
                    { bg: 'rgba(47,143,255,0.06)', ring: 'rgba(47,143,255,0.1)', num: '#2F8FFF', icon: '#2F8FFF' },
                    { bg: 'rgba(39,192,135,0.06)', ring: 'rgba(39,192,135,0.1)', num: '#27C087', icon: '#27C087' },
                  ][i] || { bg: `${accentColor}08`, ring: `${accentColor}12`, num: accentColor, icon: accentColor };
                  return (
                    <ScrollReveal key={s.title} delay={0.1 + i * 0.15}>
                      <div className="relative text-center">
                        <motion.div className="relative z-10 w-[112px] h-[112px] rounded-3xl mx-auto mb-6 flex items-center justify-center"
                          style={{ background: stepColors.bg, border: `4px solid white`, boxShadow: `0 0 0 1px ${stepColors.ring}` }}
                          whileHover={{ scale: 1.08, y: -4, rotate: -3 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                          <s.icon className="w-10 h-10" style={{ color: stepColors.icon }} />
                          {/* number badge */}
                          <motion.div className="absolute -top-2.5 -right-2.5 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                            style={{ background: stepColors.num }}
                            initial={{ scale: 0 }} whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 + i * 0.2 }}>
                            {i + 1}
                          </motion.div>
                        </motion.div>
                        <h4 className="text-lg font-bold text-surface">{s.title}</h4>
                        <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-[280px] mx-auto">{s.desc}</p>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── USE CASES ────────────────────────────────── */}
      {useCases.length > 0 && (
        <>
          <PurpleWash />
          <section className="relative py-24 md:py-32 px-6 overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(123,97,255,0.04) 0%, rgba(47,143,255,0.03) 100%)' }}>
            <FloatingBg seed={seed + 100} />
            <div className="relative z-10 max-w-6xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <ScrollReveal><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase"
                  style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}18` }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Use Cases
                </div></ScrollReveal>
                <ScrollReveal delay={0.1}><h2 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight text-surface leading-[1.15]">Built for real businesses.</h2></ScrollReveal>
                <ScrollReveal delay={0.15}><p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">See how different industries use this to grow.</p></ScrollReveal>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {useCases.map((uc, i) => {
                  const color = uc.color || accentColor;
                  // Generate mini mockup data rows from title hash
                  const widths = [75, 55, 85, 45, 65];
                  return (
                    <ScrollReveal key={uc.title} delay={0.1 + i * 0.06}>
                      <motion.div className="rounded-2xl overflow-hidden h-full group"
                        style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }}
                        whileHover={{ y: -6, borderColor: `${color}30` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}>

                        {/* mini mockup area */}
                        <div className="relative h-36 overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}08, ${color}04)` }}>
                          {/* mini dashboard preview */}
                          <div className="absolute inset-3 flex gap-2">
                            {/* mini sidebar */}
                            <div className="w-10 rounded-lg flex flex-col gap-1.5 p-1.5" style={{ background: `${color}08` }}>
                              <div className="w-full h-1.5 rounded-full" style={{ background: `${color}25` }} />
                              <div className="w-3/4 h-1.5 rounded-full" style={{ background: `${color}15` }} />
                              <div className="w-full h-1.5 rounded-full" style={{ background: `${color}20` }} />
                              <div className="w-2/3 h-1.5 rounded-full" style={{ background: `${color}12` }} />
                            </div>
                            {/* mini content */}
                            <div className="flex-1 flex flex-col gap-2">
                              {/* mini stat cards */}
                              <div className="flex gap-1.5">
                                {[uc.metric || '89%', uc.metricLabel || 'Auto'].map((s, j) => (
                                  <div key={j} className="flex-1 rounded-md p-1.5" style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${color}10` }}>
                                    <p className="text-[8px] font-extrabold" style={{ color }}>{s}</p>
                                    <div className="w-2/3 h-1 rounded-full mt-0.5" style={{ background: `${color}15` }} />
                                  </div>
                                ))}
                              </div>
                              {/* mini data rows */}
                              <div className="flex-1 rounded-md p-1.5 space-y-1.5" style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${color}08` }}>
                                {widths.slice(0, 3).map((w, j) => (
                                  <div key={j} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ background: `${color}${30 + j * 10}` }} />
                                    <div className="h-1.5 rounded-full" style={{ width: `${w}%`, background: `${color}${15 + j * 5}` }} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* metric badge */}
                          {uc.metric && (
                            <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg text-[9px] font-bold text-white" style={{ background: color, boxShadow: `0 4px 12px ${color}40` }}>
                              {uc.metric}
                            </div>
                          )}
                          {/* icon badge */}
                          <div className="absolute bottom-2.5 left-2.5 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <uc.icon className="w-3.5 h-3.5" style={{ color }} />
                          </div>
                        </div>

                        {/* content */}
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-base font-bold text-surface">{uc.title}</h4>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-300" />
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed">{uc.desc}</p>
                          {/* feature bullets */}
                          {uc.features && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {uc.features.map(f => (
                                <span key={f} className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}08`, color }}>
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── PRICING ──────────────────────────────────── */}
      {price && (
        <>
          <PurpleWash />
          <section className="py-24 md:py-32 px-6">
            <ScrollReveal>
              <div className="max-w-lg mx-auto">
                <div className="rounded-3xl p-10 text-center relative overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 16px 48px rgba(123,97,255,0.08)' }}>
                  <h3 className="text-2xl font-extrabold text-surface">Simple pricing</h3>
                  <div className="mt-6 flex items-baseline justify-center gap-1.5">
                    <span className="text-5xl font-extrabold" style={{ color: accentColor }}>{price.amount}</span>
                    <span className="text-gray-400 text-base font-medium">/{price.period}</span>
                  </div>
                  {price.setup && <p className="mt-2 text-sm text-gray-400">{price.setup}</p>}
                  <div className="mt-6 space-y-3 text-left">
                    {price.features.map(f => (
                      <div key={f} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${accentColor}12` }}>
                          <Check className="w-3 h-3" style={{ color: accentColor }} />
                        </div>
                        <span className="text-sm text-gray-600">{f}</span>
                      </div>
                    ))}
                  </div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-8">
                    <button onClick={() => window.location.href = '/signup'}
                      className="w-full py-4 rounded-full text-white font-bold text-base relative overflow-hidden group"
                      style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`, boxShadow: `0 8px 24px ${accentColor}30` }}>
                      <span className="relative z-10">Start free trial →</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    </button>
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>
          </section>
        </>
      )}

      {/* ── TESTIMONIALS ────────────────────────────── */}
      {testimonials.length > 0 && (
        <>
          <PurpleWash />
          <section className="py-24 md:py-32 px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <ScrollReveal><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase" style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}18` }}>
                <Star className="w-3 h-3" /> What people say
              </div></ScrollReveal>
              <ScrollReveal delay={0.1}><h2 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight text-surface leading-[1.1]">Loved by businesses.</h2></ScrollReveal>
            </div>
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <ScrollReveal key={t.name} delay={0.1 + i * 0.08}>
                  <div className="relative rounded-2xl p-6 h-full group"
                    style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,0,0,0.06)', transition: 'transform 300ms ease, border-color 300ms ease' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = `${accentColor}25`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}>
                    {/* quote icon */}
                    <div className="absolute top-4 right-4 text-6xl text-gray-200/50 group-hover:text-gray-200 transition-colors font-serif leading-none">&ldquo;</div>
                    {/* stars */}
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <blockquote className="text-sm text-gray-600 leading-relaxed relative z-10">&ldquo;{t.quote}&rdquo;</blockquote>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: t.gradient || `linear-gradient(135deg, ${accentColor}, #2F8FFF)` }}>
                        {t.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-surface">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── CTA BANNER ───────────────────────────────── */}
      <section className="py-20 px-6">
        <ScrollReveal direction="none">
          <motion.div className="max-w-3xl mx-auto rounded-3xl relative overflow-hidden py-16 px-8 text-center"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}BB, #2F8FFF)`, boxShadow: `0 32px 80px ${accentColor}30` }}>
            {/* bg icons */}
            {[Sparkles, Bot, Zap, Globe, Star].map((Icon, i) => (
              <motion.div key={i} className="absolute text-white/[0.08] pointer-events-none"
                style={{ left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%` }}
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}>
                <Icon style={{ width: 28 + i * 6, height: 28 + i * 6 }} />
              </motion.div>
            ))}
            {/* radial overlays */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.15), transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{ctaHeadline}</h2>
              <p className="mt-4 text-base text-white/70 max-w-md mx-auto">{ctaSubtitle}</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.location.href = '/signup'}
                    className="px-10 py-4 rounded-full font-bold text-base"
                    style={{ background: 'white', color: accentColor, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    Start free trial <ArrowRight className="inline ml-2 w-4 h-4" />
                  </button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => navigate('/about')}
                    className="px-10 py-4 rounded-full font-semibold text-base text-white"
                    style={{ border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}>
                    Talk to us
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
