import { motion } from 'framer-motion';
import { Mail, Users, Calendar, MessageSquare, BarChart3, Cpu } from 'lucide-react';

const capabilities = [
  { icon: Mail, title: 'Email Triage', desc: 'Reads, classifies, and responds to emails before you even open your inbox.', color: '#6C5CE7' },
  { icon: Users, title: 'Lead Qualification', desc: 'Scores inbound leads, sends personalized follow-ups, and books calls automatically.', color: '#7C3AED' },
  { icon: Calendar, title: 'Smart Scheduling', desc: 'Coordinates meetings across time zones — zero back-and-forth.', color: '#6C5CE7' },
  { icon: MessageSquare, title: 'Customer Support', desc: 'Resolves tickets, escalates edge cases, and keeps CSAT scores high.', color: '#7C3AED' },
  { icon: BarChart3, title: 'Reporting & Insights', desc: 'Synthesizes data from your tools into daily briefings and dashboards.', color: '#6C5CE7' },
  { icon: Cpu, title: 'Workflow Automation', desc: 'Connects your stack and runs multi-step processes end-to-end.', color: '#7C3AED' },
];

export default function AboutCapabilities() {
  return (
    <section className="py-12 md:py-20 px-4 md:px-6 relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(108,92,231,0.04), transparent 60%)' }} />

      <div className="max-w-5xl mx-auto relative">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }} className="text-center mb-10 md:mb-14">
          <span className="inline-block text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-3 md:px-4 py-1 md:py-1.5 rounded-full mb-4 md:mb-5"
            style={{ color: '#6C5CE7', background: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.1)' }}>
            What Freemi Does
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3 md:mb-4" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>
            Not a tool. Not a bot.{' '}
            <span style={{ color: '#6C5CE7' }}>An operator.</span>
          </h2>
          <p className="text-sm md:text-base max-w-xl mx-auto leading-relaxed px-2" style={{ color: '#64748B' }}>
            Freemi takes initiative — monitoring your tools, making decisions, and executing tasks autonomously.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {capabilities.map((cap, i) => (
            <motion.div key={cap.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group rounded-xl md:rounded-2xl p-4 md:p-6 card-lift cursor-default"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(108,92,231,0.06)', boxShadow: '0 2px 16px rgba(0,0,0,0.02)' }}>
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${cap.color}15, ${cap.color}08)` }}>
                <cap.icon size={18} className="md:w-5 md:h-5" style={{ color: cap.color }} />
              </div>
              <h3 className="text-sm md:text-base font-bold mb-1" style={{ color: '#0A0A1A' }}>{cap.title}</h3>
              <p className="text-xs md:text-sm leading-relaxed line-clamp-3" style={{ color: '#64748B' }}>{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}