import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from './MagneticButton';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';
import CountUp from './CountUp';
import FreemiCharacter from './FreemiCharacter';

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative py-32 px-6 overflow-hidden">
      {/* Background orb */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.05), transparent 70%)' }} />

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-16">
          <ScrollReveal>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
              style={{ color: '#6C5CE7', background: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.1)' }}>
              Cost Comparison
            </span>
          </ScrollReveal>
          <TextReveal delay={0.1}>
            <h2 className="text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold tracking-[-0.03em] text-surface leading-[1.08]">
              One Freemi vs. One Full-Time Hire
            </h2>
          </TextReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-gray-500 mt-5 max-w-lg mx-auto leading-relaxed text-lg">
              Salary, benefits, recruiting, ramp time, sick days. Or — an operator that starts working tonight for less than your team's coffee budget.
            </p>
          </ScrollReveal>
        </div>

        {/* Cost comparison cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-24">
          <ScrollReveal delay={0.1} direction="left">
            <div className="p-8 rounded-3xl bg-white/60 backdrop-blur-sm relative overflow-hidden"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">Traditional Hire</div>
              <div className="text-4xl font-extrabold text-gray-300 mb-6">
                $<CountUp end={59200} duration={2000} /><span className="text-lg font-bold"> / year</span>
              </div>
              <div className="space-y-3">
                {['Salary, benefits, recruiting', '3–6 month ramp-up', 'Ongoing management and training'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,0,0,0.03)' }}>
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} direction="right">
            <div className="p-8 rounded-3xl relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(108,92,231,0.03), rgba(108,92,231,0.01))',
                border: '2px solid #6C5CE7',
                boxShadow: '0 8px 40px rgba(108,92,231,0.12)',
              }}>
              <div className="absolute top-0 right-0 px-4 py-1.5 text-white text-[10px] font-bold rounded-bl-2xl"
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)' }}>RECOMMENDED</div>
              <div className="absolute -top-6 -left-4 opacity-80">
                <motion.div animate={{ y: [0, -4, 0], rotate: [0, 5, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <FreemiCharacter size="sm" />
                </motion.div>
              </div>
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#6C5CE7' }}>Pro Operator</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-surface">$<CountUp end={299} duration={1500} /></span>
                <span className="text-gray-400 text-sm font-semibold"> / month</span>
              </div>
              <div className="text-xs text-gray-400 mb-6">$2,868/year with annual — saves $55,000+</div>
              <div className="space-y-3">
                {['Works 24/7', 'Handles real work across your tools', 'Executes follow-ups and workflows', 'Setup help included', 'No downtime, no overhead'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(108,92,231,0.08)' }}>
                       <span className="text-[8px]" style={{ color: '#6C5CE7' }}>✓</span>
                    </div>
                    {item}
                    </div>
                    ))}
                    </div>
                    </div>
                    </ScrollReveal>
                    </div>

                    {/* Plans */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold tracking-[-0.03em] text-surface">Choose Your Plan</h2>
            <p className="text-gray-400 mt-2 text-sm">Start with one operator. Expand as you grow.</p>
            <div className="flex items-center justify-center gap-1 mt-6 p-1.5 rounded-full w-fit mx-auto"
              style={{ background: 'rgba(0,0,0,0.04)' }}>
              <button onClick={() => setAnnual(false)} className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: !annual ? '#fff' : 'transparent',
                  color: !annual ? '#0F172A' : '#9CA3AF',
                  boxShadow: !annual ? '0 2px 10px rgba(0,0,0,0.08), 0 0 0 2px rgba(108,92,231,0.35)' : 'none',
                }}>
                Monthly
              </button>
              <button onClick={() => setAnnual(true)} className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: annual ? '#fff' : 'transparent',
                  color: annual ? '#0F172A' : '#9CA3AF',
                  boxShadow: annual ? '0 2px 10px rgba(0,0,0,0.08), 0 0 0 2px rgba(108,92,231,0.35)' : 'none',
                }}>
                Annual
                <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}>– 20%</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Starter */}
          <ScrollReveal delay={0.05}>
            <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-sm"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">Starter</div>
              <p className="text-sm text-gray-500 mb-5">For individuals and lighter workflows.</p>
              <div className="flex items-baseline gap-1 mb-1">
                <AnimatePresence mode="wait">
                  <motion.span key={annual ? 'sa' : 'sm'}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="text-5xl font-extrabold text-surface">${annual ? '39' : '49'}</motion.span>
                </AnimatePresence>
                <span className="text-gray-400 text-sm font-semibold">/mo</span>
                {annual && <span className="ml-2 text-xs text-gray-300 line-through">$49</span>}
              </div>
              <div className="text-xs text-gray-400 mb-7">{annual ? 'Billed annually at $468. Save 20%.' : 'Billed monthly.'}</div>
              <button onClick={() => navigate('/dashboard')} className="w-full px-6 py-3 rounded-full text-white font-bold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(91,95,255,0.45)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,95,255,0.3)'}>Start Free Trial</button>
              <div className="mt-7 space-y-3">
                {['1 Operator', 'Limited usage', 'Basic tools', 'Email and task support'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,0,0,0.03)' }}>
                      <span className="text-[8px] text-gray-400">✓</span>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Business Operator */}
          <ScrollReveal delay={0.1}>
            <div className="p-8 rounded-3xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(108,92,231,0.02), #fff)',
                border: '2px solid #6C5CE7',
                boxShadow: '0 8px 40px rgba(108,92,231,0.1)',
              }}>
              <div className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">Pro</div>
              <p className="text-sm text-gray-500 mb-5">One production-ready operator for your core workflow.</p>
              <div className="flex items-baseline gap-1 mb-1">
                <AnimatePresence mode="wait">
                  <motion.span key={annual ? 'a' : 'm'}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="text-5xl font-extrabold text-surface">${annual ? '239' : '299'}</motion.span>
                </AnimatePresence>
                <span className="text-gray-400 text-sm font-semibold">/mo</span>
                {annual && <span className="ml-2 text-xs text-gray-300 line-through">$299</span>}
              </div>
              <div className="text-xs text-gray-400 mb-7">{annual ? 'Billed annually at $2,868. Save 20%.' : 'Billed monthly. Includes a 3-day free trial.'}</div>
              <button onClick={() => navigate('/dashboard')} className="w-full px-6 py-3 rounded-full text-white font-bold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(91,95,255,0.45)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,95,255,0.3)'}>Start Free Trial</button>
              <div className="mt-7 space-y-3">
                {['1 Full Operator', 'Works across email, CRM, docs, browser', 'Handles messages, follow-ups, and execution', 'Memory and context included', 'Live oversight and control'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(108,92,231,0.08)' }}>
                      <span className="text-[8px]" style={{ color: '#6C5CE7' }}>✓</span>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-sm"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">Max</div>
              <p className="text-sm text-gray-500 mb-5">Run multiple operators across functions.</p>
              <div className="flex items-baseline gap-1 mb-1">
                <AnimatePresence mode="wait">
                  <motion.span key={annual ? 'ma' : 'mm'}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="text-5xl font-extrabold text-surface">${annual ? '479' : '599'}</motion.span>
                </AnimatePresence>
                <span className="text-gray-400 text-sm font-semibold">/mo</span>
                {annual && <span className="ml-2 text-xs text-gray-300 line-through">$599</span>}
              </div>
              <div className="text-xs text-gray-400 mb-7">{annual ? 'Billed annually at $5,748. Save 20%.' : 'Billed monthly.'}</div>
              <button onClick={() => navigate('/dashboard')} className="w-full px-6 py-3 rounded-full text-white font-bold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(91,95,255,0.45)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,95,255,0.3)'}>Start Free Trial</button>
              <div className="mt-7 space-y-3">
                {['Multiple operators', 'Shared workflows', 'Cross-functional automation', 'Custom integrations', 'Deployment support'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,0,0,0.03)' }}>
                      <span className="text-[8px] text-gray-400">✓</span>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}