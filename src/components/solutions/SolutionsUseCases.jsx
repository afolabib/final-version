import { motion } from 'framer-motion';
import { Building2, Rocket, ShoppingCart, Briefcase, GraduationCap, UtensilsCrossed } from 'lucide-react';

const industries = [
  {
    icon: Rocket,
    title: 'Startups',
    description: 'Replace 3–5 hires with AI operators that handle sales, support, and ops from day one. Ship faster with a smaller team.',
    operators: ['Sam', 'Echo', 'Rex'],
    color: '#5B5FFF',
  },
  {
    icon: Building2,
    title: 'Agencies',
    description: 'Scale client delivery without scaling headcount. Automate reports, outreach, and project tracking across all accounts.',
    operators: ['Nova', 'Ghost', 'Sam'],
    color: '#E84393',
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce',
    description: 'Handle customer tickets, process orders, manage vendor comms, and drive repeat purchases — all automated.',
    operators: ['Rex', 'Nova', 'Pixel'],
    color: '#00B894',
  },
  {
    icon: Briefcase,
    title: 'Professional Services',
    description: 'Streamline client onboarding, automate follow-ups, and keep every engagement on track without the admin overhead.',
    operators: ['Echo', 'Sam', 'Pixel'],
    color: '#0984E3',
  },
  {
    icon: GraduationCap,
    title: 'SaaS Companies',
    description: 'Qualify inbound leads, onboard users, reduce churn, and scale support — all with AI operators that know your product.',
    operators: ['Sam', 'Rex', 'Pixel'],
    color: '#F39C12',
  },
  {
    icon: UtensilsCrossed,
    title: 'Hospitality',
    description: 'Automate guest communications, manage bookings, handle reviews, and streamline operations — so your team can focus on the experience.',
    operators: ['Rex', 'Echo', 'Nova'],
    color: '#636E72',
  },
];

export default function SolutionsUseCases() {
  return (
    <section className="px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="inline-block text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4"
            style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
            Built for Every Industry
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-2xl md:text-4xl font-extrabold tracking-tight text-surface mb-3">
            Solutions for Your Industry
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-gray-500 max-w-lg mx-auto">
            Whether you're a 2-person startup or a 200-person agency, Freemi operators adapt to your workflow.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {industries.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-6 group hover:shadow-lg transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${ind.color}10` }}>
                  <Icon size={20} style={{ color: ind.color }} />
                </div>
                <h3 className="text-base font-bold text-surface mb-2">{ind.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{ind.description}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Uses:</span>
                  {ind.operators.map(op => (
                    <span key={op} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${ind.color}08`, color: ind.color }}>{op}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}