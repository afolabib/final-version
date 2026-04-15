import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';

const PLANS = [
  {
    key: 'widget',
    name: 'Widget',
    tagline: 'AI concierge for your website',
    monthly: 19.99,
    annual: 16.99,
    color: '#00B894',
    highlight: false,
    cta: 'Get Started',
    operatorStat: null,
    features: [
      { label: 'Embeddable concierge widget', included: true },
      { label: 'Lead capture & conversations', included: true },
      { label: 'Custom branding & instructions', included: true },
      { label: 'Bookings, enquiries, complaints', included: true },
      { label: '1 company', included: true },
      { label: '1 seat', included: true },
      { label: 'AI Operators', included: false },
      { label: 'Automations', included: false },
      { label: 'Integrations', included: false },
      { label: 'Approval workflows', included: false },
      { label: 'Priority support', included: false },
      { label: 'White-label widget', included: false },
      { label: 'API access', included: false },
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'Your first AI workforce',
    monthly: 49.99,
    annual: 39.99,
    color: '#5B5FFF',
    highlight: false,
    cta: 'Start Free Trial',
    operatorStat: { count: '3', label: 'custom AI operators' },
    features: [
      { label: 'Embeddable concierge widget', included: true },
      { label: 'Lead capture & conversations', included: true },
      { label: 'Custom branding & instructions', included: true },
      { label: 'Bookings, enquiries, complaints', included: true },
      { label: '1 company', included: true },
      { label: '2 seats', included: true },
      { label: '3 AI Operators', included: true },
      { label: '5 Automations', included: true },
      { label: '3 core integrations', included: true },
      { label: 'Approval workflows', included: false },
      { label: 'Priority support', included: false },
      { label: 'White-label widget', included: false },
      { label: 'API access', included: false },
    ],
  },
  {
    key: 'growth',
    name: 'Growth',
    tagline: 'Scale across multiple businesses',
    monthly: 299,
    annual: 239,
    color: '#5B5FFF',
    highlight: true,
    cta: 'Start Free Trial',
    badge: 'Most Popular',
    operatorStat: { count: '18', label: 'custom AI operators' },
    features: [
      { label: 'Embeddable concierge widget', included: true },
      { label: 'Lead capture & conversations', included: true },
      { label: 'Custom branding & instructions', included: true },
      { label: 'Bookings, enquiries, complaints', included: true },
      { label: '3 companies', included: true },
      { label: '12 seats', included: true },
      { label: '18 AI Operators', included: true },
      { label: '30 Automations', included: true },
      { label: 'All integrations', included: true },
      { label: 'Approval workflows', included: true },
      { label: 'Priority support', included: false },
      { label: 'White-label widget', included: false },
      { label: 'API access', included: false },
    ],
  },
  {
    key: 'scale',
    name: 'Scale',
    tagline: 'Unlimited everything',
    monthly: 599,
    annual: 479,
    color: '#7C3AED',
    highlight: false,
    cta: 'Start Free Trial',
    operatorStat: { count: '60', label: 'custom AI operators' },
    features: [
      { label: 'Embeddable concierge widget', included: true },
      { label: 'Lead capture & conversations', included: true },
      { label: 'Custom branding & instructions', included: true },
      { label: 'Bookings, enquiries, complaints', included: true },
      { label: 'Unlimited companies', included: true },
      { label: '40 seats', included: true },
      { label: '60 AI Operators', included: true },
      { label: '100 Automations', included: true },
      { label: 'All integrations', included: true },
      { label: 'Approval workflows', included: true },
      { label: 'Priority support', included: true },
      { label: 'White-label widget', included: true },
      { label: 'API access', included: true },
    ],
  },
];

const COMPARISON_ROWS = [
  { label: 'Companies', values: ['1', '1', '3', 'Unlimited'] },
  { label: 'Team seats', values: ['1', '2', '12', '40'] },
  { label: 'AI Operators', values: ['—', '3', '18', '60'] },
  { label: 'Automations', values: ['—', '5', '30', '100'] },
  { label: 'Active routines', values: ['—', '3', '18', '60'] },
  { label: 'Integrations', values: ['—', '3 core', 'All', 'All'] },
  { label: 'File storage', values: ['500MB', '2GB', '12GB', '40GB'] },
  { label: 'Embeddable widget', values: [true, true, true, true] },
  { label: 'Lead capture', values: [true, true, true, true] },
  { label: 'Approval workflows', values: [false, false, true, true] },
  { label: 'White-label widget', values: [false, false, false, true] },
  { label: 'API access', values: [false, false, false, true] },
  { label: 'Priority support', values: [false, false, false, true] },
];

function FeatureValue({ value, color }) {
  if (value === true) return (
    <div className="w-5 h-5 rounded-full flex items-center justify-center mx-auto"
      style={{ background: `${color}15` }}>
      <Check size={11} style={{ color }} strokeWidth={3} />
    </div>
  );
  if (value === false) return <Minus size={14} className="mx-auto" style={{ color: '#CBD5E1' }} />;
  return <span className="text-sm font-semibold" style={{ color: '#0A0F1E' }}>{value}</span>;
}

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative py-24 px-4 md:px-6 overflow-hidden">
      <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(91,95,255,0.05), transparent 70%)' }} />

      <div className="max-w-7xl mx-auto relative">

        {/* Header */}
        <div className="text-center mb-12">
          <ScrollReveal>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
              style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
              Pricing
            </span>
          </ScrollReveal>
          <TextReveal delay={0.1}>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-[-0.03em] text-surface leading-[1.08] mb-4">
              Simple, transparent pricing
            </h2>
          </TextReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-gray-500 max-w-lg mx-auto text-base leading-relaxed mb-8">
              Start with a widget. Build a full AI workforce. Scale without limits.
            </p>
          </ScrollReveal>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-1 p-1.5 rounded-full w-fit mx-auto"
            style={{ background: 'rgba(0,0,0,0.04)' }}>
            <button onClick={() => setAnnual(false)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: !annual ? '#fff' : 'transparent',
                color: !annual ? '#0F172A' : '#9CA3AF',
                boxShadow: !annual ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
              }}>Monthly</button>
            <button onClick={() => setAnnual(true)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: annual ? '#fff' : 'transparent',
                color: annual ? '#0F172A' : '#9CA3AF',
                boxShadow: annual ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
              }}>
              Annual
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}>–20%</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PLANS.map((plan, i) => (
            <ScrollReveal key={plan.key} delay={i * 0.07}>
              <div className="relative rounded-3xl p-6 flex flex-col h-full transition-all duration-300"
                style={{
                  background: plan.highlight ? 'linear-gradient(135deg, #5B5FFF, #7C3AED)' : 'rgba(255,255,255,0.9)',
                  border: plan.highlight ? 'none' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: plan.highlight ? '0 20px 60px rgba(91,95,255,0.35)' : '0 4px 20px rgba(0,0,0,0.03)',
                }}>

                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
                    {plan.badge}
                  </div>
                )}

                <div className="mb-5">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1"
                    style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#94A3B8' }}>
                    {plan.name}
                  </p>
                  <p className="text-sm font-medium mb-4"
                    style={{ color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#64748B' }}>
                    {plan.tagline}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span key={annual ? 'a' : 'm'}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="text-4xl font-extrabold"
                        style={{ color: plan.highlight ? '#fff' : '#0A0F1E' }}>
                        ${annual ? plan.annual : plan.monthly}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-sm font-medium"
                      style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#94A3B8' }}>/mo</span>
                  </div>
                  {annual && (
                    <p className="text-xs mt-1"
                      style={{ color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#94A3B8' }}>
                      Billed annually · Save 20%
                    </p>
                  )}
                </div>

                {plan.operatorStat && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
                    style={{ background: plan.highlight ? 'rgba(255,255,255,0.15)' : `${plan.color}08`, border: `1px solid ${plan.highlight ? 'rgba(255,255,255,0.2)' : `${plan.color}20`}` }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: plan.highlight ? 'rgba(255,255,255,0.2)' : `${plan.color}15` }}>
                      <span className="text-sm font-extrabold" style={{ color: plan.highlight ? '#fff' : plan.color }}>
                        {plan.operatorStat.count}
                      </span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: plan.highlight ? 'rgba(255,255,255,0.85)' : '#374151' }}>
                      {plan.operatorStat.label}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => window.location.href = '/signup'}
                  className="w-full py-3 rounded-2xl text-sm font-bold mb-6 transition-all"
                  style={{
                    background: plan.highlight ? '#fff' : 'linear-gradient(135deg, #5B5FFF, #7C3AED)',
                    color: plan.highlight ? '#5B5FFF' : '#fff',
                    boxShadow: plan.highlight ? '0 4px 16px rgba(255,255,255,0.2)' : '0 4px 16px rgba(91,95,255,0.3)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  {plan.cta}
                </button>

                <div className="space-y-2.5 flex-1">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      {f.included ? (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: plan.highlight ? 'rgba(255,255,255,0.2)' : `${plan.color}15` }}>
                          <Check size={9} style={{ color: plan.highlight ? '#fff' : plan.color }} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                          <Minus size={10} style={{ color: plan.highlight ? 'rgba(255,255,255,0.25)' : '#CBD5E1' }} />
                        </div>
                      )}
                      <span className="text-xs"
                        style={{ color: plan.highlight ? (f.included ? '#fff' : 'rgba(255,255,255,0.4)') : (f.included ? '#374151' : '#94A3B8') }}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Compare toggle */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowComparison(s => !s)}
            className="text-sm font-semibold transition-colors"
            style={{ color: '#5B5FFF' }}>
            {showComparison ? 'Hide comparison ↑' : 'Compare all plans ↓'}
          </button>
        </div>

        {/* Full comparison table */}
        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden">
              <div className="rounded-3xl overflow-hidden"
                style={{ border: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.9)' }}>

                {/* Table header */}
                <div className="grid grid-cols-5 gap-0"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(248,250,255,0.8)' }}>
                  <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Feature</div>
                  {PLANS.map(p => (
                    <div key={p.key} className="p-4 text-center">
                      <p className="text-sm font-extrabold" style={{ color: p.highlight ? '#5B5FFF' : '#0A0F1E' }}>{p.name}</p>
                      <p className="text-xs font-bold" style={{ color: '#94A3B8' }}>
                        ${p.monthly}/mo
                      </p>
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {COMPARISON_ROWS.map((row, i) => (
                  <div key={i} className="grid grid-cols-5 gap-0"
                    style={{ borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(248,250,255,0.4)' }}>
                    <div className="p-4 text-sm font-medium" style={{ color: '#374151' }}>{row.label}</div>
                    {row.values.map((val, j) => (
                      <div key={j} className="p-4 text-center flex items-center justify-center">
                        <FeatureValue value={val} color={PLANS[j].color} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          All plans include a 7-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  );
}
