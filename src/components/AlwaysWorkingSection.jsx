import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import ScrollReveal from './ScrollReveal';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    n: '01', icon: '💬', color: '#6C5CE7',
    title: 'Brief Freemi',
    body: 'Tell your AI CEO what the company needs to achieve — close 10 deals, ship the feature, grow by 20%. That\'s it.',
  },
  {
    n: '02', icon: '🤝', color: '#00B894',
    title: 'She Builds a Team',
    body: 'Freemi hires the right agents — Rex for sales, Dev for engineering, Echo for support — and breaks your goal into tasks.',
  },
  {
    n: '03', icon: '🚀', color: '#0984E3',
    title: 'Company Runs',
    body: 'Agents work in parallel, 24/7. Tasks get checked out, completed, and reported. You watch from the command center.',
  },
];

const STATS = [
  { value: '24/7', label: 'Continuous operation', color: '#6C5CE7' },
  { value: '10x',  label: 'Faster than hiring',   color: '#00B894' },
  { value: '100%', label: 'Traceable actions',     color: '#0984E3' },
  { value: '<2m',  label: 'Time to first agent',   color: '#E17055' },
];

const ACTIVITY = [
  { agent: 'Rex',  color: '#E17055', msg: 'Sent follow-up to 3 leads from yesterday\'s demo', time: '2m ago' },
  { agent: 'Echo', color: '#00B894', msg: 'Resolved support ticket #4821 — billing question', time: '7m ago' },
  { agent: 'Dev',  color: '#0984E3', msg: 'Opened PR for auth refactor — awaiting review', time: '14m ago' },
  { agent: 'Nova', color: '#A29BFE', msg: 'Drafted 3 LinkedIn posts for this week\'s pipeline', time: '22m ago' },
  { agent: 'Rex',  color: '#E17055', msg: 'Booked discovery call with Acme for Thursday 2pm', time: '38m ago' },
];

export default function AlwaysWorkingSection() {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="py-24 px-6" style={{ background: 'linear-gradient(180deg,#EEF0F8 0%,#F8FAFF 100%)' }}>
      <div className="max-w-6xl mx-auto">

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(108,92,231,0.07)', color: '#6C5CE7', border: '1px solid rgba(108,92,231,0.15)' }}>
              How FreemiOS Works
            </div>
            <h2 className="text-[clamp(1.9rem,4vw,3rem)] font-extrabold tracking-tight mb-4" style={{ color: '#0A0A1A' }}>
              Set a goal. Get a company.
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: '#64748B' }}>
              FreemiOS turns your objectives into an operating company in minutes — with AI agents that actually do the work.
            </p>
          </div>
        </ScrollReveal>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {STEPS.map((s, i) => (
            <ScrollReveal key={s.n} delay={i * 0.1}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(108,92,231,0.08)', boxShadow: '0 4px 24px rgba(108,92,231,0.06)' }}>
                <div className="absolute top-0 right-0 text-7xl font-black opacity-[0.04] leading-none select-none pointer-events-none pr-3 pt-1"
                  style={{ color: s.color }}>{s.n}</div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${s.color}12` }}>
                  {s.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.n}</span>
                <h3 className="text-lg font-bold mt-1 mb-2" style={{ color: '#0A0A1A' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{s.body}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Stats */}
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {STATS.map(s => (
              <div key={s.label} className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(108,92,231,0.07)' }}>
                <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs font-medium" style={{ color: '#94A3B8' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Live activity */}
        <ScrollReveal>
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(108,92,231,0.08)', boxShadow: '0 8px 40px rgba(108,92,231,0.08)' }}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid rgba(108,92,231,0.07)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-bold" style={{ color: '#0A0A1A' }}>Live Agent Activity</span>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,184,148,0.1)', color: '#00B894' }}>5 agents running</span>
            </div>
            {ACTIVITY.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 px-6 py-4"
                style={{ borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(108,92,231,0.05)' : 'none' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: a.color, boxShadow: `0 2px 8px ${a.color}40` }}>
                  {a.agent[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold mr-1.5" style={{ color: a.color }}>{a.agent}</span>
                  <span className="text-sm" style={{ color: '#374151' }}>{a.msg}</span>
                </div>
                <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#CBD5E1' }}>{a.time}</span>
              </motion.div>
            ))}
            <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(108,92,231,0.06)' }}>
              <button onClick={() => navigate('/dashboard')}
                className="text-sm font-semibold transition-colors hover:opacity-80" style={{ color: '#6C5CE7' }}>
                See your live dashboard →
              </button>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
