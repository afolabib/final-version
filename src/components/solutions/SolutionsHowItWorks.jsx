import { motion } from 'framer-motion';
import { MousePointerClick, Settings2, Rocket, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: MousePointerClick,
    number: '01',
    title: 'Pick Your Operator',
    description: 'Choose from six specialized AI operators — each built for a specific business function with domain expertise.',
    color: '#6C5CE7',
  },
  {
    icon: Settings2,
    number: '02',
    title: 'Configure in 60 Seconds',
    description: 'Answer a few questions about your workflow, connect your tools, and your operator learns your preferences instantly.',
    color: '#E84393',
  },
  {
    icon: Rocket,
    number: '03',
    title: 'Deploy & Go Live',
    description: 'Your operator starts working immediately — via web dashboard, Slack, WhatsApp, or email. No code required.',
    color: '#00B894',
  },
  {
    icon: BarChart3,
    number: '04',
    title: 'Monitor & Scale',
    description: 'Track performance metrics, review completed tasks, and scale your AI workforce as your business grows.',
    color: '#0984E3',
  },
];

export default function SolutionsHowItWorks() {
  return (
    <section className="px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="inline-block text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4"
            style={{ color: '#6C5CE7', background: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.1)' }}>
            How It Works
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-2xl md:text-4xl font-extrabold tracking-tight text-surface mb-3">
            From Zero to Autonomous in Minutes
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-gray-500 max-w-lg mx-auto">
            No engineers, no complex setup. Just pick, configure, and let your AI operator handle the rest.
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
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}