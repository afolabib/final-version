import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';
import FreemiEntrance from './FreemiEntrance';
import WorkingFreemi from './WorkingFreemi';

const operators = [
  {
    key: 'enquiries',
    label: 'Customer Enquiries',
    emoji: '💬',
    color: '#5B5FFF',
    title: 'Answers every customer message instantly — on your website, via email, or phone',
    description: 'No more missed messages. Your operator knows your business, speaks your tone, and handles questions 24/7 without you.',
    what: [
      'Answers FAQs instantly',
      'Handles complaints and refund requests',
      'Escalates to you when needed',
      'Works on website chat, email, and phone',
    ],
    tools: ['Website Widget', 'Gmail', 'Phone Agent'],
    example: { customer: 'Do you have any availability this Saturday?', operator: 'Yes! We have 10am and 2pm available this Saturday. Which works better for you?' },
  },
  {
    key: 'bookings',
    label: 'Bookings & Calendar',
    emoji: '📅',
    color: '#5B5FFF',
    title: 'Takes bookings, manages your calendar, sends reminders — without lifting a finger',
    description: 'Your operator checks availability, confirms bookings, sends calendar invites, and follows up with reminders. Fully automated.',
    what: [
      'Checks real-time calendar availability',
      'Confirms and manages bookings',
      'Sends automated reminders',
      'Cancels and reschedules on request',
    ],
    tools: ['Google Calendar', 'Gmail', 'Website Widget'],
    example: { customer: '2pm works great. Name is Sarah Murphy, sarah@gmail.com', operator: 'Perfect Sarah — booked for Saturday 2pm. Confirmation sent to sarah@gmail.com. See you then!' },
  },
  {
    key: 'leads',
    label: 'Lead Follow-up',
    emoji: '🎯',
    color: '#5B5FFF',
    title: 'Captures leads from your website and follows up before they go cold',
    description: 'Every lead that fills in a form or asks a question gets followed up automatically — personalised emails, timed follow-ups, CRM updated.',
    what: [
      'Captures leads from website and email',
      'Sends personalised follow-up sequences',
      'Logs everything to your CRM',
      'Flags hot leads for your attention',
    ],
    tools: ['Gmail', 'HubSpot', 'Website Widget'],
    example: { customer: 'Interested in your services, can you send more info?', operator: 'Hi Tom — great to hear from you! I\'ve sent over our full service guide. Are you free for a quick call this week?' },
  },
  {
    key: 'email',
    label: 'Email & Inbox',
    emoji: '📧',
    color: '#5B5FFF',
    title: 'Manages your inbox — drafts replies, routes messages, keeps you out of the weeds',
    description: 'Your operator reads incoming emails, drafts replies for your approval, routes to the right person, and handles the routine stuff automatically.',
    what: [
      'Drafts replies to routine emails',
      'Routes messages to the right person',
      'Flags urgent items for your review',
      'Handles standard requests automatically',
    ],
    tools: ['Gmail', 'Slack', 'Google Calendar'],
    example: { customer: 'Can we push our meeting to Thursday?', operator: 'Of course — moved to Thursday at the same time. Updated invite sent.' },
  },
  {
    key: 'operations',
    label: 'Operations & Tasks',
    emoji: '⚙️',
    color: '#5B5FFF',
    title: 'Runs the background work — reports, reminders, routine tasks — so nothing slips',
    description: 'Your operator handles the admin that eats your day. Weekly summaries, reminders, data entry, report generation — all done automatically.',
    what: [
      'Sends weekly business summaries',
      'Tracks tasks and deadlines',
      'Automates routine workflows',
      'Keeps your tools in sync',
    ],
    tools: ['Slack', 'Gmail', 'Google Calendar'],
    example: { customer: 'Weekly summary:', operator: '7 enquiries this week · 5 bookings confirmed · 2 leads in follow-up · £1,240 in confirmed revenue. No action needed.' },
  },
];

export default function UseCasesSection() {
  const [active, setActive] = useState('enquiries');
  const op = operators.find(o => o.key === active);

  return (
    <section id="use-cases" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
              style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
              What your operators do
            </span>
          </ScrollReveal>
          <TextReveal delay={0.1}>
            <h2 className="text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold tracking-[-0.03em] text-surface leading-[1.08]">
              Every job your business needs done.<br />Without hiring.
            </h2>
          </TextReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-lg text-gray-500 mt-5 max-w-xl mx-auto leading-relaxed">
              Describe what your business needs. Freemi builds custom operators and connects them to your tools — they start working immediately.
            </p>
          </ScrollReveal>
        </div>

        {/* Freemi entrance animation */}
        <ScrollReveal delay={0.1}>
          <FreemiEntrance />
        </ScrollReveal>

        {/* Operator tabs */}
        <ScrollReveal delay={0.15}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {operators.map(o => {
              const isActive = active === o.key;
              return (
                <motion.button key={o.key}
                  onClick={() => setActive(o.key)}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
                  style={{
                    background: isActive ? `linear-gradient(135deg, ${o.color}, ${o.color}CC)` : '#fff',
                    color: isActive ? '#fff' : '#6B7280',
                    border: isActive ? 'none' : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: isActive ? `0 4px 16px ${o.color}40` : '0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                  <span className="mr-1.5">{o.emoji}</span>
                  {o.label}
                </motion.button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Active operator panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl bg-white/80 backdrop-blur-sm overflow-hidden relative"
            style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 40px rgba(0,0,0,0.05)' }}
          >
            {/* Colour accent */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
              style={{ background: `linear-gradient(90deg, ${op.color}, ${op.color}88)` }} />
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30"
              style={{ background: `radial-gradient(circle, ${op.color}20, transparent 70%)` }} />

            {/* Running Freemi along the bottom */}
            <WorkingFreemi key={active} roleKey={active} />

            <div className="grid md:grid-cols-2 gap-0 relative">
              {/* Left — info */}
              <div className="p-8 md:p-10 md:border-r" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${op.color}10` }}>
                    {op.emoji}
                  </div>
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: op.color }}>
                    AI Operator
                  </span>
                </div>

                <motion.h3
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold text-surface mb-3 leading-snug"
                >
                  {op.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.08 }}
                  className="text-sm text-gray-500 mb-6 leading-relaxed"
                >
                  {op.description}
                </motion.p>

                <div className="mb-6">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase block mb-2">What it does</span>
                  <div className="space-y-2">
                    {op.what.map((item, i) => (
                      <motion.div key={item}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-2.5 text-sm text-gray-700">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${op.color}12` }}>
                          <span className="text-[8px] font-black" style={{ color: op.color }}>✓</span>
                        </div>
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase block mb-2">Connects to</span>
                  <div className="flex flex-wrap gap-2">
                    {op.tools.map(tool => (
                      <span key={tool} className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: `${op.color}08`, color: op.color, border: `1px solid ${op.color}15` }}>
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — live example */}
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase block mb-4">Live example</span>

                <div className="space-y-3">
                  {/* Customer message */}
                  <motion.div
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-xs px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
                      style={{ background: 'rgba(0,0,0,0.04)', color: '#374151' }}>
                      {op.example.customer}
                    </div>
                  </motion.div>

                  {/* Operator reply */}
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${op.color}15` }}>
                      <span className="text-sm">{op.emoji}</span>
                    </div>
                    <div className="max-w-xs px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
                      style={{ background: `${op.color}0E`, color: '#1F2937', border: `1px solid ${op.color}18` }}>
                      {op.example.operator}
                    </div>
                  </motion.div>

                  {/* Done state */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl w-fit"
                    style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-600">Handled automatically — no action needed</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
