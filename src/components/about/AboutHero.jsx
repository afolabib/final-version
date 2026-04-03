import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FreemiCharacter from '../FreemiCharacter';

const stats = [
  { value: '10x', label: 'Faster execution' },
  { value: '24/7', label: 'Always running' },
  { value: '40+', label: 'Integrations' },
  { value: '<2min', label: 'To deploy' },
];

export default function AboutHero() {
  const navigate = useNavigate();

  return (
    <section className="pt-24 md:pt-36 pb-8 px-4 md:px-6 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-10 left-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(91,95,255,0.07), transparent 70%)' }} />
      <div className="absolute top-20 right-[5%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,108,247,0.05), transparent 70%)' }} />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left — Text */}
          <div className="text-center md:text-left">
            <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="inline-block text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-3 md:px-4 py-1 md:py-1.5 rounded-full mb-4 md:mb-6"
              style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.12)' }}>
              Meet Freemi
            </motion.span>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 md:mb-6"
              style={{ color: '#0A0A1A', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Your Original{' '}
              <span style={{
                background: 'linear-gradient(135deg, #5B5FFF 0%, #7C3AED 50%, #5B5FFF 100%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 4s ease-in-out infinite',
              }}>
                AI Operator
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}
              className="text-sm md:text-lg max-w-lg mx-auto md:mx-0 mb-6 md:mb-8 leading-relaxed" style={{ color: '#64748B' }}>
              Freemi is the flagship AI operator — handling your emails, qualifying leads, scheduling meetings, and running workflows autonomously.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
              className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
              <button onClick={() => navigate('/dashboard')}
                className="px-5 md:px-7 py-2.5 md:py-3 rounded-full text-sm font-bold text-white btn-press"
                style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 8px 24px rgba(91,95,255,0.35)' }}>
                Start Free Trial →
              </button>
              <button onClick={() => navigate('/solutions')}
                className="px-5 md:px-7 py-2.5 md:py-3 rounded-full text-sm font-semibold btn-press"
                style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1.5px solid rgba(91,95,255,0.2)' }}>
                Meet the Team
              </button>
            </motion.div>
          </div>

          {/* Right — Freemi Character showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center relative order-first md:order-last mb-6 md:mb-0"
          >
            {/* Glow ring behind character */}
            <div className="absolute w-48 h-48 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(91,95,255,0.12) 0%, rgba(91,95,255,0.04) 50%, transparent 70%)',
                filter: 'blur(1px)',
              }} />

            {/* Orbiting dots */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute w-40 h-40 md:w-64 md:h-64 lg:w-72 lg:h-72 hidden md:block">
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <motion.div key={deg}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  className="absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
                  style={{
                    background: '#5B5FFF',
                    top: '50%', left: '50%',
                    transform: `rotate(${deg}deg) translateY(-${100}px) translateX(-50%)`,
                  }} />
              ))}
            </motion.div>

            {/* Floating label cards - hidden on small mobile */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 right-0 md:top-2 md:right-0 rounded-xl px-2 md:px-3 py-1.5 md:py-2 z-10 hidden sm:block"
              style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(91,95,255,0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400" />
                <span className="text-[10px] md:text-xs font-bold" style={{ color: '#0A0A1A' }}>Online 24/7</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-2 left-0 md:bottom-4 md:left-0 rounded-xl px-2 md:px-3 py-1.5 md:py-2 z-10 hidden sm:block"
              style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(91,95,255,0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-xs md:text-sm">⚡</span>
                <span className="text-[10px] md:text-xs font-bold" style={{ color: '#0A0A1A' }}>12 tasks done</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-1/2 -left-4 md:-left-8 -translate-y-1/2 rounded-xl px-2 md:px-3 py-1.5 md:py-2 z-10 hidden sm:block"
              style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(91,95,255,0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-xs md:text-sm">📧</span>
                <span className="text-[10px] md:text-xs font-bold" style={{ color: '#0A0A1A' }}>Inbox: 0</span>
              </div>
            </motion.div>

            {/* The character */}
            <div className="relative z-20 scale-75 md:scale-100">
              <FreemiCharacter size="lg" />
            </div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-10 md:mt-20">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.45 + i * 0.06 }}
              className="text-center rounded-xl md:rounded-2xl py-4 md:py-5 px-2 md:px-3"
              style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(91,95,255,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
              <div className="text-xl md:text-3xl font-extrabold tracking-tight" style={{ color: '#5B5FFF' }}>{s.value}</div>
              <div className="text-[10px] md:text-xs font-medium mt-0.5" style={{ color: '#94A3B8' }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}