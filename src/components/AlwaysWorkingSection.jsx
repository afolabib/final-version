import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import ActivityPanel from './ActivityPanel';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';
import CountUp from './CountUp';
import FreemiCharacter from './FreemiCharacter';


const stats = [
  { value: 24, suffix: '/7', label: 'Always on' },
  { value: 6, suffix: '', label: 'Threads handled overnight' },
  { value: 98, suffix: '%', label: 'Auto-resolution rate' },
];

export default function AlwaysWorkingSection() {
  const ref = useRef(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [60, -60]);

  return (
    <section ref={ref} id="always-working" className="relative py-32 px-6 overflow-hidden">
      {/* Ambient background glow */}
      <motion.div style={{ y }} className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl pointer-events-none"
        >
        <div className="w-full h-full rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(108,92,231,0.06) 0%, transparent 70%)' }} />
      </motion.div>

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-20">
          <ScrollReveal>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
              style={{ color: '#6C5CE7', background: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.1)' }}>
              Always Working
            </span>
          </ScrollReveal>
          <TextReveal delay={0.1}>
            <h2 className="text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold tracking-[-0.03em] text-surface leading-[1.08]">
              You sleep. Freemi doesn't.
            </h2>
          </TextReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-lg text-gray-500 mt-5 max-w-xl mx-auto leading-relaxed">
              While you're off the clock, Freemi is triaging your inbox, updating your CRM, drafting follow-ups, and prepping your morning. No micro-management needed.
            </p>
          </ScrollReveal>
        </div>

        {/* Stats row */}
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-3 gap-6 mb-16 max-w-lg mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-extrabold text-surface tracking-tight">
                  <CountUp end={s.value} duration={1500} />{s.suffix}
                </div>
                <div className="text-xs text-gray-400 font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <ActivityPanel />
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-5 mt-14">
          <ScrollReveal delay={0.1} direction="left">
            <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-sm group hover:shadow-xl transition-all duration-500"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(108,92,231,0.08))' }}>
                <span className="text-xl">📋</span>
              </div>
              <h3 className="text-lg font-bold text-surface mb-1.5">☕ Morning Briefing</h3>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase mb-5">What Freemi did while you slept</p>
              <div className="space-y-3">
                {[
                  { label: 'Conversations', value: '6 Threads Handled' },
                  { label: 'Updates', value: 'Context and Notes Logged' },
                  { label: 'Follow-Ups Ready', value: 'Next Actions Prepared' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-gray-100/80 last:border-0">
                    <span className="text-xs font-bold" style={{ color: '#6C5CE7' }}>{item.label}</span>
                    <span className="text-sm text-gray-500">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.25} direction="right">
            <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-sm group hover:shadow-xl transition-all duration-500"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,191,36,0.08))' }}>
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="text-lg font-bold text-surface mb-1.5">🔥 Overnight Hustle</h3>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase mb-5">Freemi was busy</p>
              <div className="space-y-4">
                {[
                  { metric: '12 Emails Processed', desc: 'Sorted, Replied, or Archived Automatically' },
                  { metric: '3 CRM Records Updated', desc: 'Pipeline Stages, Notes, and Tags Refreshed' },
                  { metric: '2 Follow-Ups Scheduled', desc: 'Queued for 9am Delivery' },
                ].map((item, i) => (
                  <div key={item.metric} className="flex gap-3 group/item">
                    <div className="w-1 rounded-full flex-shrink-0 transition-all duration-300 group-hover/item:w-1.5"
                      style={{ background: 'linear-gradient(180deg, #6C5CE7, #A78BFA)', minHeight: '100%' }} />
                    <div>
                      <span className="text-sm font-semibold text-surface">{item.metric}</span>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.3}>
          <div className="text-center mt-12">
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3.5 rounded-full text-white font-semibold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', boxShadow: '0 4px 20px rgba(108,92,231,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(108,92,231,0.45)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(108,92,231,0.3)'}>
              Start Your First Operator →
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}