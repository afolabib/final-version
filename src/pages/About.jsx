import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, Sparkles, Bot, Zap, Globe, Star, Heart,
  Users, Target, Rocket, Shield, Eye, Lightbulb, Send, Phone,
  Calendar, MessageSquare, Mail
} from 'lucide-react';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import ScrollReveal from '../components/ScrollReveal';

/* floating bg */
const ORB_COLORS = ['rgba(123,97,255,0.22)', 'rgba(47,143,255,0.16)', 'rgba(236,72,153,0.14)', 'rgba(39,192,135,0.12)', 'rgba(168,85,247,0.18)'];
const FLOAT_ICONS = [Sparkles, Bot, Zap, Globe, Star, Heart];
function seededRandom(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function FloatingBg({ seed = 42 }) {
  const r = seededRandom(seed); const rand = () => r();
  const gen = (n) => Array.from({ length: n }, () => ({ left: `${5 + rand() * 90}%`, top: `${5 + rand() * 90}%`, delay: rand() * 3, duration: 4 + rand() * 6, size: 14 + rand() * 18 }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {gen(4).map((p, i) => <motion.div key={`o${i}`} className="absolute rounded-full" style={{ left: p.left, top: p.top, width: 300 + i * 100, height: 300 + i * 100, background: `radial-gradient(circle, ${ORB_COLORS[i % 5]}, transparent 65%)`, filter: `blur(${50 + i * 12}px)` }} animate={{ x: [0, 30 + i * 10, 0], y: [0, -(20 + i * 10), 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />)}
      {gen(6).map((p, i) => { const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length]; return <motion.div key={`i${i}`} className="absolute text-purple-500/[0.12]" style={{ left: p.left, top: p.top }} animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}><Icon style={{ width: p.size, height: p.size }} /></motion.div>; })}
      {gen(8).map((p, i) => <motion.div key={`d${i}`} className="absolute rounded-full bg-purple-500/[0.25]" style={{ left: p.left, top: p.top, width: 3 + (i % 4) * 3, height: 3 + (i % 4) * 3 }} animate={{ opacity: [0.1, 0.7, 0.1], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 1.5 + (i % 4) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />)}
    </div>
  );
}

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemV = { hidden: { opacity: 0, y: 30, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <TopNav />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(123,97,255,0.18) 0%, transparent 50%)' }} />
        <FloatingBg seed={400} />
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(123,97,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <motion.div className="relative z-10 max-w-4xl mx-auto px-6 text-center" variants={containerV} initial="hidden" animate="visible">
          <motion.div variants={itemV} className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-purple-200/30 shadow-sm">
              <Heart className="w-3.5 h-3.5" style={{ color: '#7B61FF' }} />
              <span className="text-xs font-semibold text-surface/80 tracking-wide">About Freemi</span>
            </div>
          </motion.div>
          <motion.div variants={itemV}><h1 className="mt-8 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.15] text-surface">We believe every business</h1></motion.div>
          <motion.div variants={itemV}><h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.15] text-gradient">deserves an AI team.</h1></motion.div>
          <motion.p variants={itemV} className="mt-7 text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Freemi gives small businesses and solo operators an AI workforce — without hiring. Not a chatbot. Not a widget. A full AI team that connects to your tools, answers your customers, does real work, and runs autonomously.
          </motion.p>
        </motion.div>
      </section>

      {/* ── THE STORY ── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase mb-8" style={{ background: 'rgba(123,97,255,0.08)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.15)' }}>
              <Lightbulb className="w-3 h-3" /> Our Story
            </div>
          </ScrollReveal>
          <div className="space-y-6">
            <ScrollReveal delay={0.05}>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-surface leading-[1.2]">Small businesses are the engine of the economy.</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-base md:text-lg text-gray-500 leading-relaxed">
                They're talented, driven, and completely overwhelmed. They can't afford to hire. They miss calls, lose leads, and spend half their day on work that shouldn't need a human.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-base md:text-lg text-gray-500 leading-relaxed">
                For salons, clinics, restaurants, solicitors, pharmacies, and local services — the same problem exists at scale. Staff spend all day answering the same questions. The phone never stops. Leads fall through the gaps. Nobody has time to fix it.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-base md:text-lg font-semibold text-surface leading-relaxed">
                Freemi fixes it.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <p className="text-base md:text-lg text-gray-500 leading-relaxed">
                We give every business an AI workforce that answers calls, handles WhatsApp, manages bookings, follows up leads, and runs operations — 24/7, without hiring. Tell Freemi what you need and it hires the right agent, connects your tools, and reports back.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(123,97,255,0.03), rgba(47,143,255,0.02))' }}>
        <FloatingBg seed={410} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase" style={{ background: 'rgba(123,97,255,0.08)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.15)' }}>
                <Target className="w-3 h-3" /> What We Stand For
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight text-surface leading-[1.15]">Our <span className="text-gradient-purple">north star.</span></h2>
            </ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Eye, title: 'The Vision', desc: 'In 3 years, Freemi is the default AI infrastructure for small businesses — the same way Stripe is for payments or Shopify is for e-commerce.', color: '#7B61FF' },
              { icon: Target, title: 'The Mission', desc: 'Every small business has an AI team running in the background. Not because they care about AI. Because their business just works.', color: '#2F8FFF' },
              { icon: Heart, title: 'The Why', desc: 'We believe the best businesses shouldn\'t be held back by admin, missed calls, and repetitive work. Technology should do the boring stuff so humans can do the meaningful stuff.', color: '#27C087' },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={0.1 + i * 0.08}>
                <motion.div className="rounded-2xl p-7 h-full"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -6, borderColor: `${card.color}25` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `linear-gradient(135deg, ${card.color}15, ${card.color}08)`, border: `1px solid ${card.color}15` }}>
                    <card.icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <h3 className="text-lg font-extrabold text-surface tracking-tight">{card.title}</h3>
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT MAKES US DIFFERENT ── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface leading-[1.15]">Why we're <span className="text-gradient">different.</span></h2></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: Rocket, title: 'Full stack, not a feature', desc: 'Widget + agents + phone + WhatsApp + bookings + website — all in one platform. No stitching 5 tools together.', color: '#7B61FF' },
              { icon: Users, title: 'Done for you', desc: 'We build it, set it up, manage it. You never touch the tech. Direct relationships, not just a SaaS signup.', color: '#2F8FFF' },
              { icon: Zap, title: 'Speed', desc: 'Live in 48 hours. Not weeks. Not months. From first call to AI team running your business — in days.', color: '#27C087' },
              { icon: Shield, title: 'Price', desc: 'An AI team for less than minimum wage. Life-changing ROI versus hiring staff. 95%+ gross margins.', color: '#F59E0B' },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={0.1 + i * 0.06}>
                <motion.div className="rounded-2xl p-7 h-full flex gap-5"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -4, borderColor: `${card.color}25` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${card.color}12` }}>
                    <card.icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-surface">{card.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE PRODUCTS ── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface leading-[1.15]">What we <span className="text-gradient-purple">build.</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}><p className="mt-4 text-lg text-gray-500">Five products. One AI brain. Everything your business needs.</p></ScrollReveal>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Globe, title: 'Studio', desc: 'AI-powered websites built for you — with agents embedded from day one.', link: '/products/studio', color: '#7B61FF' },
              { icon: MessageSquare, title: 'Concierge', desc: 'AI chat widget on your website. Answers questions, captures leads, books appointments.', link: '/products/concierge', color: '#2F8FFF' },
              { icon: Phone, title: 'Voice', desc: 'AI phone agent. Answers every call, takes orders, books appointments.', link: '/products/voice', color: '#27C087' },
              { icon: Send, title: 'WhatsApp', desc: 'AI WhatsApp agent. Auto-replies, handles orders, full conversations.', link: '/products/whatsapp', color: '#25D366' },
              { icon: Calendar, title: 'Bookings', desc: 'AI-powered appointments from any channel. Calendar stays perfect.', link: '/products/bookings', color: '#F59E0B' },
            ].map((p, i) => (
              <ScrollReveal key={p.title} delay={0.05 + i * 0.06}>
                <motion.div onClick={() => navigate(p.link)} className="rounded-2xl p-6 h-full cursor-pointer group"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(0,0,0,0.06)', borderLeft: `3px solid ${p.color}` }}
                  whileHover={{ y: -4, borderColor: `${p.color}25` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${p.color}12` }}>
                    <p.icon className="w-5 h-5" style={{ color: p.color }} />
                  </div>
                  <h3 className="text-base font-bold text-surface">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold group-hover:gap-2 transition-all" style={{ color: p.color }}>
                    Learn more <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT CTA ── */}
      <section className="py-20 px-6">
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
                Whether you're a one-person business or a growing team — we'd love to hear from you.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <a href="mailto:hello@freemi.ai"
                    className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-base"
                    style={{ background: 'white', color: '#7B61FF', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    <Mail className="w-4 h-4" /> hello@freemi.ai
                  </a>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => window.open('https://studio.freemi.ai', '_blank')}
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
