import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const orbs = [
  { size: 500, x: '5%',  y: '10%', color: 'rgba(108,92,231,0.07)', delay: 0 },
  { size: 350, x: '70%', y: '5%',  color: 'rgba(108,92,231,0.05)', delay: 0.4 },
  { size: 280, x: '55%', y: '60%', color: 'rgba(124,58,237,0.04)', delay: 0.9 },
];

export default function HeroSection() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yText   = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [0, 140]);
  const yOrbs   = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], isMobile ? [1, 1] : [1, 0]);
  const scale   = useTransform(scrollYProgress, [0, 0.6], isMobile ? [1, 1] : [1, 0.95]);

  return (
    <section ref={ref} id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden py-24">

      {orbs.map((orb, i) => (
        <motion.div key={i}
          style={{ y: yOrbs, width: orb.size, height: orb.size, left: orb.x, top: orb.y, position: 'absolute' }}
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.2, delay: orb.delay, ease: 'easeOut' }}
          className="rounded-full blur-3xl pointer-events-none">
          <div className="w-full h-full rounded-full" style={{ background: orb.color }} />
        </motion.div>
      ))}

      <motion.div style={{ y: yText, opacity, scale }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
          style={{ background: 'rgba(108,92,231,0.08)', color: '#6C5CE7', border: '1px solid rgba(108,92,231,0.18)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-pulse inline-block" />
          Introducing FreemiOS — Your AI Company
        </motion.div>

        {/* Headline */}
        <h1 className="text-[clamp(2.6rem,7vw,5.4rem)] font-extrabold leading-[1.04] tracking-[-0.04em] mb-6"
          style={{ color: '#0A0A1A', perspective: '800px' }}>
          {[['Run', 0.2], ['Your', 0.28], ['Entire', 0.36], ['Company', 0.44], ['With', 0.52]].map(([w, d]) => (
            <motion.span key={w} initial={{ opacity: 0, y: 40, rotateX: -30 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, delay: d, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block mr-[0.22em]">{w}</motion.span>
          ))}
          <br className="hidden sm:block" />
          <motion.span initial={{ opacity: 0, y: 40, rotateX: -30 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
            style={{
              background: 'linear-gradient(135deg,#6C5CE7 0%,#7C3AED 50%,#6C5CE7 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 4s ease-in-out infinite',
            }}>
            One AI CEO
          </motion.span>
        </h1>

        {/* Sub */}
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: '#64748B' }}>
          Brief Freemi on what to achieve. She hires agents, assigns tasks, manages budgets,
          and runs your operations around the clock — you just stay in command.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.92, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3.5 rounded-full text-base font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#6C5CE7,#7C6CF7)', boxShadow: '0 8px 28px rgba(108,92,231,0.38)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(108,92,231,0.5)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 28px rgba(108,92,231,0.38)'}>
            Launch FreemiOS Free →
          </motion.button>
          <motion.a href="#how-it-works" whileHover={{ scale: 1.02 }}
            className="px-6 py-3.5 rounded-full text-sm font-semibold transition-all cursor-pointer"
            style={{ background: 'rgba(108,92,231,0.07)', color: '#6C5CE7', border: '1px solid rgba(108,92,231,0.15)' }}>
            See how it works
          </motion.a>
        </motion.div>

        {/* Trust badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-wrap items-center justify-center gap-6 text-sm mb-16" style={{ color: '#94A3B8' }}>
          {['No credit card required', 'Deploy in under 2 minutes', '3-day free trial'].map((t, i) => (
            <motion.span key={t} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15 + i * 0.08 }}
              className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(108,92,231,0.1)' }}>
                <span className="text-[8px]" style={{ color: '#6C5CE7' }}>✓</span>
              </span>
              {t}
            </motion.span>
          ))}
        </motion.div>

        {/* Dashboard preview mockup */}
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl">
          <div className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(108,92,231,0.12)', boxShadow: '0 40px 80px rgba(108,92,231,0.14), 0 0 0 1px rgba(108,92,231,0.06)' }}>
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.97)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex gap-1.5">
                {['#FF5F57','#FEBC2E','#28C840'].map(c => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <div className="flex-1 mx-4 px-3 py-1 rounded-md text-xs text-center"
                style={{ background: '#F1F5F9', color: '#94A3B8' }}>
                freemi.ai/dashboard
              </div>
            </div>
            {/* Dashboard chrome */}
            <div className="flex h-72" style={{ background: 'linear-gradient(180deg,#EEF0F8 0%,#F8FAFF 100%)' }}>
              {/* Sidebar */}
              <div className="w-48 flex-shrink-0 p-3"
                style={{ background: 'rgba(255,255,255,0.94)', borderRight: '1px solid rgba(108,92,231,0.07)' }}>
                <div className="flex items-center gap-2 mb-5 px-1">
                  <div className="w-6 h-6 rounded-lg flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6C5CE7,#7C6CF7)' }} />
                  <span className="text-xs font-bold" style={{ color: '#0A0A1A' }}>FreemiOS</span>
                </div>
                {[['Command','#6C5CE7',true],['Team','#94A3B8',false],['Goals','#94A3B8',false],['Tasks','#94A3B8',false],['Inbox','#94A3B8',false],['Budget','#94A3B8',false]].map(([l, c, a]) => (
                  <div key={l} className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5"
                    style={{ background: a ? 'rgba(108,92,231,0.09)' : 'transparent' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                    <span className="text-[10px] font-medium" style={{ color: a ? '#6C5CE7' : '#94A3B8' }}>{l}</span>
                  </div>
                ))}
                <div className="mt-4 px-2">
                  <div className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: '#CBD5E1' }}>Your Team</div>
                  {[['Rex','#E17055'],['Dev','#0984E3'],['Echo','#00B894']].map(([n, c]) => (
                    <div key={n} className="flex items-center gap-2 py-1">
                      <div className="w-4 h-4 rounded-md text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0"
                        style={{ background: c }}>{n[0]}</div>
                      <span className="text-[10px]" style={{ color: '#64748B' }}>{n}</span>
                      <div className="w-1.5 h-1.5 rounded-full ml-auto" style={{ background: '#00B894' }} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Main content */}
              <div className="flex-1 p-5 overflow-hidden">
                <div className="text-sm font-bold mb-4" style={{ color: '#0A0A1A' }}>Good afternoon 👋</div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[['3','Agents','#6C5CE7'],['4','Goals','#00B894'],['12','Tasks','#0984E3'],['$0','Spend','#E17055']].map(([v,l,c]) => (
                    <div key={l} className="rounded-xl px-3 py-2.5"
                      style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div className="text-sm font-black" style={{ color: c }}>{v}</div>
                      <div className="text-[9px] font-medium mt-0.5" style={{ color: '#94A3B8' }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-3 mb-3"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(108,92,231,0.08)' }}>
                  <div className="text-[10px] font-bold mb-2" style={{ color: '#0A0A1A' }}>Brief Freemi</div>
                  <div className="rounded-lg px-3 py-2 text-[10px]"
                    style={{ background: '#F8FAFF', border: '1.5px solid rgba(108,92,231,0.15)', color: '#94A3B8' }}>
                    What should the company focus on?...
                  </div>
                </div>
                <div className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(108,92,231,0.06)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: '#374151' }}>Live Activity</span>
                  </div>
                  {[['Rex','#E17055','Sent follow-up to Acme Corp'],['Echo','#00B894','Resolved 3 support tickets'],['Dev','#0984E3','Opened PR for auth refactor']].map(([n,c,m]) => (
                    <div key={n} className="flex items-center gap-2 py-1">
                      <div className="w-4 h-4 rounded-md text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0"
                        style={{ background: c }}>{n[0]}</div>
                      <span className="text-[9px]" style={{ color: '#64748B' }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to top,#EEF0F8,transparent)' }} />
    </section>
  );
}
