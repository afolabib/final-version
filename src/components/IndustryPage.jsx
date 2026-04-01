import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Clock, TrendingUp } from 'lucide-react';
import FreemiCharacter from './FreemiCharacter';
import InteractiveGrid from './InteractiveGrid';
import TopNav from './TopNav';
import SiteFooter from './SiteFooter';

const BRAND = '#6C5CE7';

function HeroSection({ data }) {
  const { title, subtitle, headline, color, operators } = data;
  return (
    <section className="pt-28 md:pt-36 pb-14 px-4 md:px-6 text-center relative overflow-hidden">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ background: BRAND }} />
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="inline-block text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
          style={{ color: BRAND, background: `${BRAND}0F`, border: `1px solid ${BRAND}1A` }}>
          {title}
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-surface leading-tight mb-5">
          {headline}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
          {subtitle}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Link to="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-bold text-sm transition-all"
            style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND}CC)`, boxShadow: `0 8px 24px ${BRAND}40` }}>
            Deploy Your Operator <ArrowRight size={16} />
          </Link>
          <Link to="/solutions" className="text-sm font-semibold text-gray-500 hover:text-surface transition-colors px-4 py-3">
            Explore All Solutions →
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex justify-center gap-2">
          {operators.map(op => (
            <span key={op} className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: `${BRAND}0F`, color: BRAND }}>{op}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection({ data }) {
  const { stats } = data;
  return (
    <section className="px-4 md:px-6 pb-16">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="text-center p-6 md:p-8 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div className="text-3xl md:text-4xl font-extrabold mb-1" style={{ color: BRAND }}>{s.value}</div>
            <div className="text-xs md:text-sm text-gray-400 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ProblemSection({ data }) {
  const { painPoints } = data;
  return (
    <section className="px-4 md:px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-surface mb-3">Sound Familiar?</h2>
          <p className="text-sm md:text-base text-gray-500 max-w-lg mx-auto">These are the challenges we hear from teams like yours every day.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-4">
          {painPoints.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl flex items-start gap-4"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <span className="text-xl flex-shrink-0 mt-0.5">{p.emoji}</span>
              <div>
                <h3 className="text-sm font-bold text-surface mb-1">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CharacterSection({ data }) {
  const { characterQuote, color } = data;
  return (
    <section className="px-4 md:px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${BRAND}08, ${BRAND}15)`, border: `1px solid ${BRAND}1A` }}>
          <div className="flex justify-center mb-6">
            <div className="transform scale-150">
              <FreemiCharacter size="sm" color={color} />
            </div>
          </div>
          <p className="text-lg md:text-xl font-bold text-surface mb-2 italic">"{characterQuote}"</p>
          <p className="text-sm text-gray-400">— Your Freemi Operator</p>
        </motion.div>
      </div>
    </section>
  );
}

function BenefitsSection({ data }) {
  const { benefits } = data;
  const icons = [Zap, Clock, TrendingUp, CheckCircle];
  return (
    <section className="px-4 md:px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-surface mb-3">How Freemi Transforms Your Workflow</h2>
          <p className="text-sm md:text-base text-gray-500 max-w-lg mx-auto">Deploy in minutes, see results in hours, scale without limits.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-5">
          {benefits.map((b, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl group hover:shadow-lg transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${BRAND}10` }}>
                  <Icon size={18} style={{ color: BRAND }} />
                </div>
                <h3 className="text-base font-bold text-surface mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection({ data }) {
  const { workflows } = data;
  return (
    <section className="px-4 md:px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-surface mb-3">Workflows That Run Themselves</h2>
          <p className="text-sm md:text-base text-gray-500 max-w-lg mx-auto">Here's exactly what your Freemi operators handle, end to end.</p>
        </motion.div>
        <div className="space-y-4">
          {workflows.map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-extrabold text-white"
                  style={{ background: BRAND }}>{i + 1}</div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-surface mb-1">{w.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{w.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {w.tools.map(t => (
                      <span key={t} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: `${BRAND}08`, color: BRAND, border: `1px solid ${BRAND}12` }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialSection({ data }) {
  const { testimonial } = data;
  if (!testimonial) return null;
  return (
    <section className="px-4 md:px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="p-8 md:p-10 rounded-3xl text-center"
          style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 40px rgba(0,0,0,0.04)' }}>
          <div className="flex justify-center mb-4">
            {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-lg">★</span>)}
          </div>
          <p className="text-base md:text-lg text-surface font-medium leading-relaxed mb-5 italic">"{testimonial.quote}"</p>
          <div>
            <div className="text-sm font-bold text-surface">{testimonial.name}</div>
            <div className="text-xs text-gray-400">{testimonial.role}, {testimonial.company}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection({ data }) {
  const { title } = data;
  return (
    <section className="px-4 md:px-6 py-20">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-3xl p-10 md:p-14 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND}DD)`, boxShadow: `0 20px 60px ${BRAND}30` }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4), transparent 60%)' }} />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              Ready to Transform Your {title}?
            </h2>
            <p className="text-sm md:text-base text-white/80 mb-8 max-w-md mx-auto">
              Deploy your first AI operator in under 5 minutes. No code required. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/dashboard"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white font-bold text-sm transition-all hover:shadow-lg"
                style={{ color: BRAND }}>
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <Link to="/solutions" className="text-sm font-semibold text-white/80 hover:text-white transition-colors px-4 py-3">
                See All Solutions
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function IndustryPage({ data }) {
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)', minHeight: '100vh' }}>
      <InteractiveGrid />
      <TopNav />
      <main className="relative z-10">
        <HeroSection data={data} />
        <StatsSection data={data} />
        <ProblemSection data={data} />
        <CharacterSection data={data} />
        <BenefitsSection data={data} />
        <WorkflowSection data={data} />
        <TestimonialSection data={data} />
        <CTASection data={data} />
      </main>
      <SiteFooter />
    </div>
  );
}