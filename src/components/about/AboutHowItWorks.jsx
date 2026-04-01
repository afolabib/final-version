import { motion } from 'framer-motion';

const steps = [
  { step: '01', title: 'Pick an Operator Template', desc: 'Choose from Sam (Sales), Rex (Support), Ghost (Ops), or build custom from scratch.', emoji: '🎯' },
  { step: '02', title: 'Connect Your Tools', desc: 'Link Gmail, Slack, HubSpot, Salesforce, calendars — 40+ integrations out of the box.', emoji: '🔗' },
  { step: '03', title: 'Set the Rules', desc: 'Tell your operator what to prioritize, how to respond, and when to escalate. It learns fast.', emoji: '⚙️' },
  { step: '04', title: 'Let It Run', desc: 'Your operator works 24/7 — triaging, responding, scheduling, and reporting. You review and refine.', emoji: '🚀' },
];

export default function AboutHowItWorks() {
  return (
    <section className="py-12 md:py-20 px-4 md:px-6" style={{ background: 'rgba(108,92,231,0.025)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }} className="text-center mb-10 md:mb-14">
          <span className="inline-block text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-3 md:px-4 py-1 md:py-1.5 rounded-full mb-4 md:mb-5"
            style={{ color: '#6C5CE7', background: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.1)' }}>
            How It Works
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>
            Deploy in minutes. Not months.
          </h2>
        </motion.div>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="hidden md:block absolute left-8 top-8 bottom-8 w-px" style={{ background: 'linear-gradient(180deg, #6C5CE7, rgba(108,92,231,0.1))' }} />

          <div className="space-y-3 md:space-y-5">
            {steps.map((item, i) => (
              <motion.div key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-3 md:gap-5 items-start rounded-xl md:rounded-2xl p-4 md:p-6"
                style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(108,92,231,0.06)', boxShadow: '0 2px 16px rgba(0,0,0,0.02)' }}>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 text-base md:text-lg font-extrabold relative z-10"
                  style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', color: '#fff', boxShadow: '0 4px 16px rgba(108,92,231,0.3)' }}>
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                    <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase" style={{ color: '#6C5CE7' }}>Step {item.step}</span>
                  </div>
                  <h3 className="text-sm md:text-lg font-bold mb-0.5 md:mb-1" style={{ color: '#0A0A1A' }}>{item.title}</h3>
                  <p className="text-xs md:text-sm leading-relaxed" style={{ color: '#64748B' }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}