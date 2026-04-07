import { motion } from 'framer-motion';
import { Globe, Users, Code2, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: Globe,
    number: '01',
    title: 'Tell Freemi About Your Business',
    description: 'Enter your website URL and mission. Freemi reads your site, understands your context, and recommends the right AI team for you.',
    color: '#5B5FFF',
    tag: 'Takes 2 minutes',
  },
  {
    icon: Users,
    number: '02',
    title: 'Deploy Your AI Operators',
    description: 'Hire specialists for sales, support, ops, success, and research. Each operator knows your business and gets to work immediately.',
    color: '#E84393',
    tag: 'No engineers needed',
  },
  {
    icon: Code2,
    number: '03',
    title: 'Embed a Concierge on Your Site',
    description: 'Drop one line of code into your website. Your customers get an AI front desk that answers questions, handles bookings, and takes real action — 24/7.',
    color: '#00B894',
    tag: 'One line of code',
  },
  {
    icon: BarChart3,
    number: '04',
    title: 'Your Business Runs Itself',
    description: 'Monitor every task, conversation, and outcome from one dashboard. Add more operators as you grow. The work never stops.',
    color: '#0984E3',
    tag: 'Full visibility',
  },
];

export default function SolutionsHowItWorks() {
  return (
    <section className="px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="inline-block text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4"
            style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
            How It Works
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-2xl md:text-4xl font-extrabold tracking-tight text-surface mb-3">
            Up and Running in Minutes
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-gray-500 max-w-lg mx-auto">
            From your website URL to a fully staffed AI team — with a concierge live on your site.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 md:gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl p-6 md:p-7 group"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 md:-right-3 w-6 h-px" style={{ background: `${step.color}30` }} />
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${step.color}10` }}>
                    <Icon size={18} style={{ color: step.color }} />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: step.color }}>{step.number}</span>
                </div>
                <h3 className="text-base font-bold text-surface mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{step.description}</p>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${step.color}10`, color: step.color }}>{step.tag}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}