import { motion } from 'framer-motion';
import { Code2, CalendarCheck, MessageSquare, ShieldCheck, Zap, Globe } from 'lucide-react';

const capabilities = [
  { icon: MessageSquare, text: 'Answers customer questions instantly', color: '#5B5FFF' },
  { icon: CalendarCheck, text: 'Handles bookings & reservations', color: '#E84393' },
  { icon: Zap, text: 'Qualifies and routes enquiries', color: '#F39C12' },
  { icon: ShieldCheck, text: 'Knows your business, your rules', color: '#00B894' },
];

export default function SolutionsEmbed() {
  return (
    <section className="px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">

        <div className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1040 100%)',
            border: '1px solid rgba(91,95,255,0.2)',
            boxShadow: '0 24px 80px rgba(91,95,255,0.15)',
          }}>

          <div className="grid md:grid-cols-2 gap-0">

            {/* Left: copy */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-6 w-fit"
                style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.12)', border: '1px solid rgba(91,95,255,0.25)' }}>
                <Globe size={10} />
                Embed on your site
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
                style={{ color: '#fff', lineHeight: 1.15 }}>
                Your AI concierge,<br />
                <span style={{ background: 'linear-gradient(135deg, #5B5FFF, #E84393)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  not a chatbot.
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-sm md:text-base mb-8 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.6)' }}>
                Drop Freemi into your website and give every visitor a front desk. It answers questions, handles bookings, and takes real action — all on-brand, all instant, all without a human in the loop.
              </motion.p>

              <div className="space-y-3 mb-8">
                {capabilities.map((cap, i) => {
                  const Icon = cap.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cap.color}20` }}>
                        <Icon size={14} style={{ color: cap.color }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{cap.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 text-xs font-medium"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                <Code2 size={13} />
                One line of code. Works on any site.
              </motion.div>
            </div>

            {/* Right: visual */}
            <div className="relative p-8 md:p-10 flex items-center justify-center"
              style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>

              {/* Glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 60% 50%, rgba(91,95,255,0.12) 0%, transparent 70%)' }} />

              <div className="relative w-full max-w-xs">

                {/* Mock website header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl p-4 mb-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#FF5F56' }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: '#27C93F' }} />
                    <div className="flex-1 h-4 rounded ml-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 rounded w-3/4" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="h-3 rounded w-1/2" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                </motion.div>

                {/* Freemi chat bubble — embedded */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(91,95,255,0.3)',
                    boxShadow: '0 8px 32px rgba(91,95,255,0.2)',
                  }}>

                  {/* Chat header */}
                  <div className="flex items-center gap-2.5 px-4 py-3"
                    style={{ background: 'linear-gradient(135deg, rgba(91,95,255,0.3), rgba(124,58,237,0.2))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                      <div className="w-2.5 h-2.5 rounded-full bg-white opacity-95" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold" style={{ color: '#fff' }}>Freemi</p>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Online now</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-3 space-y-2.5">
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5"
                        style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                        <div className="w-2 h-2 rounded-full bg-white opacity-90" />
                      </div>
                      <div className="px-3 py-2 rounded-xl rounded-tl-sm text-[11px] leading-relaxed max-w-[85%]"
                        style={{ background: 'rgba(91,95,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
                        Hi! I can help with bookings, questions, or anything else. What do you need?
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="px-3 py-2 rounded-xl rounded-tr-sm text-[11px] leading-relaxed max-w-[80%]"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                        Do you have availability this Friday?
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5"
                        style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                        <div className="w-2 h-2 rounded-full bg-white opacity-90" />
                      </div>
                      <div className="px-3 py-2 rounded-xl rounded-tl-sm text-[11px] leading-relaxed max-w-[85%]"
                        style={{ background: 'rgba(91,95,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
                        Yes — 2pm and 4pm are open. Want me to book one for you?
                      </div>
                    </div>

                    {/* Typing indicator */}
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex gap-2">
                      <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                        <div className="w-2 h-2 rounded-full bg-white opacity-90" />
                      </div>
                      <div className="flex items-center gap-1 px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(91,95,255,0.10)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Embed badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live on your site
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
