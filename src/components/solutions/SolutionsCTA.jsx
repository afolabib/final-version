import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import FreemiAgent from './FreemiAgent';

export default function SolutionsCTA() {
  return (
    <section className="px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-3xl p-8 md:p-14 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)',
            boxShadow: '0 24px 60px rgba(91,95,255,0.3)',
          }}>
          {/* Decorative orbs */}
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(255,255,255,0.05)' }} />

          <div className="relative z-10">
            {/* Mini agents */}
            <div className="flex justify-center gap-2 mb-6">
              {['sam', 'rex', 'nova'].map(a => (
                <div key={a} className="scale-[0.4] origin-center -mx-3">
                  <FreemiAgent agentKey={a} size="sm" animate={false} />
                </div>
              ))}
            </div>

            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
              Ready to Put Your Business on Autopilot?
            </h2>
            <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto mb-8 leading-relaxed">
              Start with one operator, scale to six. No credit card required. Your AI team is 60 seconds away.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all"
                style={{ background: 'white', color: '#5B5FFF', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <Link to="/about"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all text-white/80 hover:text-white"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                Learn More About Freemi
              </Link>
            </div>

            <p className="text-xs text-white/40 mt-5">3-day free trial • Cancel anytime • No credit card</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}