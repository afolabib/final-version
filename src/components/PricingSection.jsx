import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from './MagneticButton';
import ScrollReveal from './ScrollReveal';

const TIERS = [
  {
    id: 'starter', name: 'Starter', monthly: 49, annual: 39,
    agents: '1 CEO + 2 agents', budget: '$100/mo agent budget',
    description: 'Perfect for solo founders getting started.',
    color: '#6C5CE7',
    features: ['1 CEO agent (Freemi)','Up to 2 specialist agents','$100 monthly agent budget','Goal → task breakdown','Live activity feed','Email + Slack integrations','5 active goals','Community support'],
    cta: 'Get started free',
  },
  {
    id: 'pro', name: 'Pro', monthly: 199, annual: 159,
    agents: '1 CEO + 5 agents', budget: '$500/mo agent budget',
    description: 'For growing startups that need a full AI team.',
    color: '#7C3AED', highlight: true,
    features: ['Everything in Starter','Up to 5 specialist agents','$500 monthly agent budget','Board approval workflows','Budget hard stops & alerts','All integrations','Unlimited active goals','Priority support','Custom agent instructions'],
    cta: 'Start 3-day free trial', badge: 'Most popular',
  },
  {
    id: 'max', name: 'Max', monthly: 499, annual: 399,
    agents: 'Unlimited agents', budget: '$2,000/mo agent budget',
    description: 'For companies running fully on AI operations.',
    color: '#0984E3',
    features: ['Everything in Pro','Unlimited specialist agents','$2,000 monthly agent budget','Custom agent roles & personas','Multi-company support','Dedicated Slack channel','SLA guarantee','White-glove onboarding'],
    cta: 'Talk to us',
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 px-6" style={{ background: 'linear-gradient(180deg,#F8FAFF 0%,#EEF0F8 100%)' }}>
      <div className="max-w-5xl mx-auto">

        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(108,92,231,0.07)', color: '#6C5CE7', border: '1px solid rgba(108,92,231,0.15)' }}>
              Pricing
            </div>
            <h2 className="text-[clamp(1.9rem,4vw,3rem)] font-extrabold tracking-tight mb-4" style={{ color: '#0A0A1A' }}>
              Cheaper than one hire. More powerful than ten.
            </h2>
            <p className="text-base max-w-md mx-auto mb-8" style={{ color: '#64748B' }}>
              A full-time employee costs $70k+/year. FreemiOS starts at $49/month.
            </p>
            <div className="inline-flex items-center gap-1 p-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(108,92,231,0.1)' }}>
              {[false, true].map(a => (
                <button key={String(a)} onClick={() => setAnnual(a)}
                  className="text-sm font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-2"
                  style={{ background: annual === a ? '#6C5CE7' : 'transparent', color: annual === a ? '#fff' : '#94A3B8' }}>
                  {a ? 'Annual' : 'Monthly'}
                  {a && !annual && <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,184,148,0.15)', color: '#00B894' }}>−20%</span>}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map((tier, i) => (
            <ScrollReveal key={tier.id} delay={i * 0.1}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}
                className="rounded-2xl p-7 relative flex flex-col h-full"
                style={{
                  background: tier.highlight ? `linear-gradient(135deg,${tier.color}07,#fff)` : 'rgba(255,255,255,0.9)',
                  border: tier.highlight ? `2px solid ${tier.color}28` : '1px solid rgba(108,92,231,0.08)',
                  boxShadow: tier.highlight ? `0 8px 40px ${tier.color}14` : '0 2px 16px rgba(108,92,231,0.05)',
                }}>
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap"
                    style={{ background: `linear-gradient(135deg,${tier.color},${tier.color}cc)`, boxShadow: `0 4px 12px ${tier.color}40` }}>
                    {tier.badge}
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tier.color }}>{tier.name}</p>
                  <div className="flex items-end gap-1.5 mb-1">
                    <AnimatePresence mode="wait">
                      <motion.span key={annual ? 'a' : 'm'}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="text-4xl font-black" style={{ color: '#0A0A1A' }}>
                        ${annual ? tier.annual : tier.monthly}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-sm mb-1.5" style={{ color: '#94A3B8' }}>/mo</span>
                  </div>
                  {annual && <p className="text-xs mb-2" style={{ color: '#00B894' }}>Billed ${(tier.annual) * 12}/yr</p>}
                  <p className="text-xs font-semibold" style={{ color: tier.color }}>{tier.agents}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{tier.budget}</p>
                </div>
                <p className="text-sm mb-5" style={{ color: '#64748B' }}>{tier.description}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: '#374151' }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${tier.color}12` }}>
                        <span className="text-[8px]" style={{ color: tier.color }}>✓</span>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/dashboard')}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: tier.highlight ? `linear-gradient(135deg,${tier.color},${tier.color}cc)` : `${tier.color}10`,
                    color: tier.highlight ? '#fff' : tier.color,
                    boxShadow: tier.highlight ? `0 4px 20px ${tier.color}30` : 'none',
                  }}
                  onMouseEnter={e => { if (!tier.highlight) e.currentTarget.style.background = `${tier.color}18`; }}
                  onMouseLeave={e => { if (!tier.highlight) e.currentTarget.style.background = `${tier.color}10`; }}>
                  {tier.cta}
                </button>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <p className="text-center text-sm mt-8" style={{ color: '#94A3B8' }}>
            All plans include a 3-day free trial · No credit card required · Cancel anytime
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
