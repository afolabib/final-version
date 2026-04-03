import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FreemiCharacter from '../FreemiCharacter';

export default function AboutCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl md:rounded-3xl px-6 py-10 md:px-16 md:py-14 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)',
            boxShadow: '0 20px 60px rgba(91,95,255,0.3)',
          }}>
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div className="w-6 h-6 rounded-full bg-white/90" />
                </div>
              </motion.div>
            </div>

            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3 md:mb-4 text-white" style={{ letterSpacing: '-0.02em' }}>
              Ready to put Freemi to work?
            </h2>
            <p className="text-sm md:text-base mb-6 md:mb-8 leading-relaxed max-w-lg mx-auto px-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
              3-day free trial. No credit card required. Deploy your AI operator in under 2 minutes.
            </p>
            <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              <button onClick={() => navigate('/dashboard')}
                className="px-6 md:px-10 py-3 md:py-3.5 rounded-full text-sm md:text-base font-bold btn-press"
                style={{ background: '#fff', color: '#5B5FFF', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                Get Started Free →
              </button>
              <button onClick={() => navigate('/solutions')}
                className="px-5 md:px-8 py-3 md:py-3.5 rounded-full text-sm md:text-base font-semibold btn-press"
                style={{ color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}>
                Meet the Team
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}