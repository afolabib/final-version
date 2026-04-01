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
  { size: 400, x: '10%', y: '20%', color: 'rgba(108,92,231,0.08)', delay: 0 },
  { size: 300, x: '75%', y: '15%', color: 'rgba(108,92,231,0.06)', delay: 0.5 },
  { size: 250, x: '60%', y: '70%', color: 'rgba(108,92,231,0.05)', delay: 1 },
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
    <section ref={ref} id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
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



      <motion.div style={{ y: yText, opacity, scale }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">

        <h1 className="text-[clamp(2.5rem,7vw,5.2rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-surface mb-4"
          style={{ perspective: '800px' }}>
          {word('AI', 0.3)}
          {word('Operators', 0.4)}
          {word('That', 0.5)}
          <br className="hidden sm:block" />
          <motion.span
            initial={{ opacity: 0, y: 50, rotateX: -40 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #7C3AED 50%, #6C5CE7 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 4s ease-in-out infinite',
            }}
          >
            Take Work Off Your Plate
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-base md:text-lg text-gray-500 max-w-xl mx-auto mb-6 leading-relaxed"
        >
          AI operators that take work off your plate — handling your inbox, qualifying leads, booking meetings, and running follow-ups while you focus on what matters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center mb-5"
        >
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 rounded-full text-lg font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', boxShadow: '0 8px 24px rgba(108,92,231,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 36px rgba(108,92,231,0.45)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(108,92,231,0.35)'}>
            Get Started →
          </motion.button>
        </motion.div>



        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="flex items-center justify-center gap-8 text-sm text-gray-400 mt-4"
        >
          {['No Credit Card', 'Setup in 60 Seconds', '3-Day Free Trial'].map((t, i) => (
            <motion.span key={t}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1 }}
              className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(108,92,231,0.1)' }}>
                <span className="text-[8px]" style={{ color: '#6C5CE7' }}>✓</span>
              </span>
              {t}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#EEF0F8] to-transparent pointer-events-none" />
    </section>
  );
}