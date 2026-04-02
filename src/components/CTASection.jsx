import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import ScrollReveal from './ScrollReveal';
import FreemiCharacter from './FreemiCharacter';

export default function CTASection() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], isMobile ? [1, 1, 1] : [0.93, 1, 0.98]);

  return (
    <section ref={ref} className="relative py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div style={{ scale }}>
          <ScrollReveal direction="none">
            <div className="text-center px-8 py-14 md:px-14 md:py-16 rounded-[2rem] relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg,#6C5CE7,#7C3AED,#6C5CE7)',
                boxShadow: '0 24px 64px rgba(108,92,231,0.32), 0 8px 24px rgba(108,92,231,0.16)',
              }}>
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-20 -left-20 w-60 h-60 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '44px 44px' }} />
              </div>

              <div className="relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, type: 'spring' }}
                  className="flex justify-center mb-5">
                  <div className="relative scale-90">
                    <div className="absolute -inset-3 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', filter: 'blur(16px)' }} />
                    <FreemiCharacter size="sm" />
                  </div>
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }}
                  className="text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold text-white leading-[1.12] tracking-tight">
                  Freemi is ready to run your company.
                </motion.h2>

                <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-purple-100/85 mt-4 max-w-md mx-auto leading-relaxed text-sm md:text-base">
                  3-day free trial. No credit card. Your first AI CEO is live in under 2 minutes.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-3 items-center justify-center mt-9">
                  <button onClick={() => navigate('/dashboard')}
                    className="px-9 py-3.5 rounded-full bg-white font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    style={{ color: '#6C5CE7' }}>
                    Launch FreemiOS Free →
                  </button>
                  <a href="/about"
                    className="px-7 py-3.5 rounded-full border border-white/25 text-white font-semibold text-sm hover:bg-white/10 transition-all inline-block">
                    Learn more
                  </a>
                </motion.div>
              </div>
            </div>
          </ScrollReveal>
        </motion.div>
      </div>
    </section>
  );
}
