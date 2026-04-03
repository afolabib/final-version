import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Sam booked 47 meetings last month while I slept. Our pipeline has never been this healthy.",
    name: 'Jake M.',
    role: 'VP Sales, CloudSync',
    agent: 'Sam',
    color: '#5B5FFF',
    avatar: '🧑‍💼',
  },
  {
    quote: "Rex resolved 73% of our tier-1 tickets automatically. Our CSAT went from 3.9 to 4.8 stars.",
    name: 'Priya K.',
    role: 'Head of Support, Shipfast',
    agent: 'Rex',
    color: '#E84393',
    avatar: '👩‍💻',
  },
  {
    quote: "Nova processes all our invoices now. We went from 3 days to 3 hours for month-end close.",
    name: 'Marcus D.',
    role: 'COO, Ledgerworks',
    agent: 'Nova',
    color: '#00B894',
    avatar: '👨‍💼',
  },
  {
    quote: "Echo gives me back 3 hours every day. My inbox goes from 200 to 12 before I even start.",
    name: 'Sarah L.',
    role: 'CEO, Foundry Labs',
    agent: 'Echo',
    color: '#0984E3',
    avatar: '👩‍🦰',
  },
];

export default function SolutionsTestimonials() {
  return (
    <section className="px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="inline-block text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4"
            style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
            Loved by Teams
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-2xl md:text-4xl font-extrabold tracking-tight text-surface">
            Real Results From Real Teams
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-6 md:p-7"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} fill="#F59E0B" stroke="#F59E0B" />
                ))}
              </div>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-5 font-medium italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ background: `${t.color}10` }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-surface">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
                <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${t.color}10`, color: t.color }}>
                  Uses {t.agent}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}