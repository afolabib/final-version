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
  const rotate = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [-2, 2]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], isMobile ? [1, 1, 1] : [0.92, 1, 0.98]);

  return (
    <section ref={ref} id="cta" className="relative py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div style={{ scale }}>
          <ScrollReveal direction="none">
            <div className="text-center px-8 py-10 md:px-12 md:py-12 rounded-[1.5rem] relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #5B5FFF, #7C3AED, #5B5FFF)',
                boxShadow: '0 20px 60px rgba(91,95,255,0.28), 0 8px 24px rgba(91,95,255,0.14)',
              }}>
              {/* Floating orbs */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-20 -left-20 w-60 h-60 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }} />
              </div>

              <div className="relative z-10">
                {/* Freemi character */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="flex justify-center mb-4">
                  <div className="relative scale-90">
                    <div className="absolute -inset-3 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', filter: 'blur(16px)' }} />
                    <FreemiCharacter size="sm" />
                  </div>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold text-white leading-[1.12] tracking-tight">
                  Your business on autopilot.<br />Starting today.
                </motion.h2>
                <motion.p
                 initial={{ opacity: 0, y: 15 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2, duration: 0.6 }}
                 className="text-purple-100/90 mt-4 max-w-md mx-auto leading-relaxed text-sm md:text-base">
                 7-day free trial. No credit card needed. Custom operators built for your business — live in 1–2 days.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-3 items-center justify-center mt-8">
                  <button onClick={() => window.open('https://freemi-studio.web.app', '_blank')} className="px-8 py-3 rounded-full bg-white text-[#1F2937] font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105">
                    Start free trial →
                  </button>
                  <a href="/for-business"
                    className="px-8 py-3 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all backdrop-blur-sm inline-block">
                    Building a website?
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