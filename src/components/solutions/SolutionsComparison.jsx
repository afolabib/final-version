import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

const rows = [
  { feature: '24/7 Availability', freemi: true, human: false, chatbot: 'partial' },
  { feature: 'Takes Real Actions', freemi: true, human: true, chatbot: false },
  { feature: 'Learns Your Workflow', freemi: true, human: true, chatbot: false },
  { feature: 'Handles Multiple Tasks', freemi: true, human: 'partial', chatbot: false },
  { feature: 'Integrates With Your Stack', freemi: true, human: 'partial', chatbot: 'partial' },
  { feature: 'Escalates When Needed', freemi: true, human: true, chatbot: false },
  { feature: 'Cost Under $99/mo', freemi: true, human: false, chatbot: true },
  { feature: 'Zero Training Time', freemi: true, human: false, chatbot: true },
  { feature: 'Consistent Quality', freemi: true, human: 'partial', chatbot: 'partial' },
  { feature: 'Scales Instantly', freemi: true, human: false, chatbot: true },
];

function StatusIcon({ value }) {
  if (value === true) return <Check size={16} className="text-green-500" />;
  if (value === false) return <X size={16} className="text-red-400" />;
  return <Minus size={16} className="text-yellow-500" />;
}

export default function SolutionsComparison() {
  return (
    <section className="px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="inline-block text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4"
            style={{ color: '#6C5CE7', background: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.1)' }}>
            Why Freemi
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-2xl md:text-4xl font-extrabold tracking-tight text-surface mb-3">
            Not a Chatbot. Not a VA. An Operator.
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-gray-500 max-w-lg mx-auto">
            See how Freemi operators compare to hiring humans or using basic AI chatbots.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 40px rgba(0,0,0,0.03)' }}>
          {/* Header */}
          <div className="grid grid-cols-4 text-center py-4 px-4 md:px-6"
            style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.04), rgba(108,92,231,0.02))', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Feature</div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6C5CE7' }}>Freemi</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Human Hire</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chatbot</div>
          </div>
          {/* Rows */}
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-4 items-center text-center py-3 px-4 md:px-6"
              style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
              <div className="text-left text-xs md:text-sm text-gray-600 font-medium">{row.feature}</div>
              <div className="flex justify-center"><StatusIcon value={row.freemi} /></div>
              <div className="flex justify-center"><StatusIcon value={row.human} /></div>
              <div className="flex justify-center"><StatusIcon value={row.chatbot} /></div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}