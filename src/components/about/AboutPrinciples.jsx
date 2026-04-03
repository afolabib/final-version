import { motion } from 'framer-motion';
import { Zap, Shield, Globe, Brain } from 'lucide-react';

const principles = [
  { icon: Zap, title: 'Speed First', desc: 'Operators execute in seconds what takes humans hours. No waiting, no bottlenecks.', gradient: 'linear-gradient(135deg, #F59E0B20, #F59E0B08)' },
  { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2 compliant. Your data never trains models. Full audit trails on every action.', gradient: 'linear-gradient(135deg, #10B98120, #10B98108)' },
  { icon: Globe, title: 'Always On', desc: '24/7/365 across every time zone. Your business never sleeps — and neither does Freemi.', gradient: 'linear-gradient(135deg, #3B82F620, #3B82F608)' },
  { icon: Brain, title: 'Learns & Adapts', desc: 'Every interaction makes your operators smarter. They learn your preferences and processes.', gradient: 'linear-gradient(135deg, #8B5CF620, #8B5CF608)' },
];

export default function AboutPrinciples() {
  return (
    <section className="py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }} className="text-center mb-10 md:mb-14">
          <span className="inline-block text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-3 md:px-4 py-1 md:py-1.5 rounded-full mb-4 md:mb-5"
            style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
            Built Different
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>
            Why teams choose Freemi
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-2 md:gap-4">
          {principles.map((p, i) => (
            <motion.div key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-xl md:rounded-2xl p-4 md:p-7 card-lift"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(91,95,255,0.06)', boxShadow: '0 2px 16px rgba(0,0,0,0.02)' }}>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4"
                style={{ background: p.gradient }}>
                <p.icon size={18} className="md:w-[22px] md:h-[22px]" style={{ color: '#5B5FFF' }} />
              </div>
              <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2" style={{ color: '#0A0A1A' }}>{p.title}</h3>
              <p className="text-xs md:text-sm leading-relaxed line-clamp-3" style={{ color: '#64748B' }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}