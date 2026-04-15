import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';


const word = (text, delay) => (
  <motion.span
    key={text}
    initial={{ opacity: 0, y: 50, rotateX: -40 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    className="inline-block"
  >
    {text}&nbsp;
  </motion.span>
);

const orbs = [
  { size: 400, x: '10%', y: '20%', color: 'rgba(91,95,255,0.08)', delay: 0 },
  { size: 300, x: '75%', y: '15%', color: 'rgba(91,95,255,0.06)', delay: 0.5 },
  { size: 250, x: '60%', y: '70%', color: 'rgba(91,95,255,0.05)', delay: 1 },
];

export default function HeroSection() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yText = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [0, 150]);
  const yOrbs = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], isMobile ? [1, 1] : [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], isMobile ? [1, 1] : [1, 0.95]);

  return (
    <section ref={ref} id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Floating gradient orbs */}
      {orbs.map((orb, i) => (
        <motion.div key={i}
          style={{ y: yOrbs, width: orb.size, height: orb.size, left: orb.x, top: orb.y }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: orb.delay, ease: 'easeOut' }}
          className="absolute rounded-full blur-3xl pointer-events-none"
          >
          <div className="w-full h-full rounded-full" style={{ background: orb.color }} />
        </motion.div>
      ))}



      <motion.div style={{ y: yText, opacity, scale }} className="relative z-10 text-center px-6 max-w-6xl mx-auto w-full">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold tracking-widest uppercase"
          style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.08)', border: '1px solid rgba(91,95,255,0.15)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI operators for your business
        </motion.div>

        <h1 className="text-[clamp(3.2rem,8vw,6.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-surface mb-6"
          style={{ perspective: '800px' }}>
          {word('Your', 0.3)}
          {word('business,', 0.4)}
          <br className="hidden sm:block" />
          <motion.span
            initial={{ opacity: 0, y: 50, rotateX: -40 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
            style={{
              background: 'linear-gradient(135deg, #5B5FFF 0%, #7C3AED 50%, #5B5FFF 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 4s ease-in-out infinite',
            }}
          >
            running itself.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Custom AI operators built for your business — answering customers, booking meetings, following up leads, and connecting to your tools. 24/7, automatically.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 mb-5"
        >
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href='/signup'}
            className="px-10 py-4 rounded-full text-lg font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 8px 32px rgba(91,95,255,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(91,95,255,0.55)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(91,95,255,0.4)'}>
            Start free trial →
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/how-it-works')}
            className="px-8 py-4 rounded-full text-lg font-semibold transition-all"
            style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.2)' }}>
            See how it works
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex items-center justify-center gap-6 text-sm text-gray-400 mb-10"
        >
          {['No credit card needed', 'Set up in 1–2 days', '7-day free trial'].map((t, i) => (
            <motion.span key={t}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + i * 0.1 }}
              className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(91,95,255,0.1)' }}>
                <span className="text-[8px]" style={{ color: '#5B5FFF' }}>✓</span>
              </span>
              {t}
            </motion.span>
          ))}
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-4xl"
          style={{ perspective: '1200px' }}
        >
          <motion.div
            animate={{ rotateX: [2, 0, 2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="rounded-2xl overflow-hidden"
          >
            {/* Browser chrome */}
            <div className="h-9 flex items-center gap-2 px-4 rounded-t-2xl"
              style={{ background: 'rgba(240,241,255,0.95)', border: '1px solid rgba(91,95,255,0.12)', borderBottom: 'none', backdropFilter: 'blur(20px)' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
              </div>
              <div className="flex-1 mx-4 h-5 rounded-md flex items-center px-3 text-[10px] text-gray-400"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}>
                app.freemi.ai/dashboard
              </div>
            </div>
            {/* Dashboard UI mockup */}
            <div className="grid grid-cols-12 gap-0 rounded-b-2xl overflow-hidden"
              style={{ background: 'rgba(248,249,254,0.98)', border: '1px solid rgba(91,95,255,0.12)', borderTop: 'none', boxShadow: '0 32px 80px rgba(91,95,255,0.18), 0 8px 24px rgba(0,0,0,0.06)', minHeight: '200px' }}>
              {/* Sidebar */}
              <div className="col-span-2 border-r p-3 space-y-1" style={{ borderColor: 'rgba(91,95,255,0.08)', background: 'rgba(255,255,255,0.6)' }}>
                {['Freemi', 'Goals', 'Tasks', 'Agents', 'Files'].map((item, i) => (
                  <div key={item} className={`px-2 py-1.5 rounded-lg text-[10px] font-medium ${i === 0 ? 'text-white' : 'text-gray-500'}`}
                    style={i === 0 ? { background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)' } : {}}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="col-span-10 p-4 space-y-3">
                {/* Operator row */}
                <div className="flex gap-2">
                  {[
                    { name: 'Enquiries', role: 'Active', color: '#5B5FFF', active: true },
                    { name: 'Bookings', role: 'Active', color: '#5B5FFF', active: true },
                    { name: 'Lead Follow-up', role: 'Active', color: '#5B5FFF', active: true },
                  ].map(a => (
                    <div key={a.name} className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px]"
                      style={{ background: 'rgba(91,95,255,0.08)', border: '1px solid rgba(91,95,255,0.16)' }}>
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-semibold text-gray-700">{a.name}</span>
                      <span className="text-gray-400">{a.role}</span>
                    </div>
                  ))}
                </div>
                {/* Activity list */}
                <div className="space-y-1.5">
                  {[
                    { text: '12 customer enquiries answered', status: 'done', agent: 'Enquiries' },
                    { text: '4 bookings confirmed for today', status: 'active', agent: 'Bookings' },
                    { text: '3 leads followed up automatically', status: 'done', agent: 'Leads' },
                  ].map((t, i) => (
                    <motion.div key={t.text}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.8 + i * 0.15 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: t.status === 'done' ? '#10B981' : t.status === 'active' ? '#5B5FFF' : '#E5E7EB', boxShadow: t.status === 'active' ? '0 0 6px rgba(91,95,255,0.4)' : 'none' }} />
                      <span className="text-[11px] text-gray-700 flex-1 font-medium">{t.text}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: t.status === 'done' ? 'rgba(16,185,129,0.1)' : t.status === 'active' ? 'rgba(91,95,255,0.1)' : 'rgba(0,0,0,0.05)', color: t.status === 'done' ? '#10B981' : t.status === 'active' ? '#5B5FFF' : '#9CA3AF' }}>
                        {t.agent}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#EEF0F8] to-transparent pointer-events-none" />
    </section>
  );
}