import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import FreemiAgent from './FreemiAgent';

const agents = ['sam', 'rex', 'nova', 'pixel', 'echo', 'ghost'];

export default function SolutionsHero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-6 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(91,95,255,0.06)' }} />
      <div className="absolute top-40 right-[15%] w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(232,67,147,0.04)' }} />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Agent parade */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex justify-center gap-3 md:gap-5 mb-6 flex-wrap">
          {agents.map((a, i) => (
            <motion.div key={a} initial={{ opacity: 0, y: 20, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="scale-[0.45] md:scale-[0.65] origin-center">
              <FreemiAgent agentKey={a} size="sm" animate={false} />
            </motion.div>
          ))}
        </motion.div>

        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="inline-block text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
          style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
          AI Operators for Every Role
        </motion.span>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="text-[clamp(2rem,6vw,4rem)] font-extrabold tracking-[-0.04em] text-surface leading-[1.05] mb-4">
          One Platform.{' '}
          <span style={{
            background: 'linear-gradient(135deg, #5B5FFF, #E84393)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Six Specialists.
          </span>
          <br className="hidden sm:block" />
          Zero Busywork.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
          className="text-sm md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
          Deploy AI operators that handle sales, support, ops, success, executive tasks, and research — working 24/7 so your team can focus on what actually moves the needle.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link to="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-bold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 8px 24px rgba(91,95,255,0.35)' }}>
            Deploy Your First Operator <ArrowRight size={16} />
          </Link>
          <a href="#agents" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all text-gray-600 hover:text-surface"
            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)' }}>
            See All Operators ↓
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
          {[
            { icon: Zap, text: 'Setup in 60s' },
            { icon: Shield, text: 'SOC 2 Compliant' },
            { icon: Clock, text: '24/7 Autonomous' },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
              <Icon size={14} style={{ color: '#5B5FFF' }} />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}