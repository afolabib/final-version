import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import FreemiCharacter from '../components/FreemiCharacter';
import FreemiBurst from '../components/FreemiBurst';
import FloatingChatWidget from '../components/FloatingChatWidget';

const steps = [
  {
    step: '01', emoji: '💬',
    title: 'Tell Freemi what your business needs',
    desc: 'In the app, describe what takes up your day in plain English — customer questions, bookings, follow-ups, emails. No calls, no forms, no technical setup.',
    detail: 'Freemi learns your business, your tone, your services, and what you want automated. Takes a few minutes.',
  },
  {
    step: '02', emoji: '⚙️',
    title: 'Freemi builds your custom operators',
    desc: 'AI operators are built specifically for your business — your tone, your services, your rules. Not generic bots.',
    detail: 'Each operator is configured for a specific job: answering enquiries, handling bookings, following up leads, managing email.',
  },
  {
    step: '03', emoji: '🔗',
    title: 'Connect to your tools',
    desc: 'Operators plug into Gmail, Google Calendar, Slack, HubSpot and more. They start working immediately — no manual setup needed.',
    detail: 'Your operators read emails, check calendars, update CRMs, and send messages — all through integrations you already use.',
  },
  {
    step: '04', emoji: '🚀',
    title: 'Your business runs itself',
    desc: 'Customers get answered 24/7. Meetings get booked. Leads get followed up. Tasks get done — without you being involved.',
    detail: 'You see everything on your dashboard. Every message answered, every booking confirmed, every lead logged.',
  },
];

const capabilities = [
  { icon: '💬', label: 'Customer enquiries answered instantly' },
  { icon: '📅', label: 'Bookings handled automatically' },
  { icon: '🎯', label: 'Leads captured and followed up' },
  { icon: '📧', label: 'Emails drafted and routed' },
  { icon: '📊', label: 'Weekly summaries sent to you' },
  { icon: '🔗', label: 'Connects to Gmail, Slack, Calendar, HubSpot' },
];

const integrations = ['Gmail', 'Google Calendar', 'Slack', 'HubSpot', 'Website Widget', 'Phone Agent'];

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)', minHeight: '100vh' }}>
      <TopNav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 800px 500px at 50% 0%, rgba(91,95,255,0.07), transparent)' }} />

        <div className="max-w-3xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold tracking-widest uppercase"
            style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.08)', border: '1px solid rgba(91,95,255,0.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            How Freemi works
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(2.8rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] mb-6"
            style={{ color: '#0A0F1E' }}>
            Set up once.<br />
            <span style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Works forever.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Tell us what your business needs. We build custom AI operators, connect them to your tools, and they start working — 24/7, automatically.
          </motion.p>

          {/* Freemi burst animation */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center mb-10">
            <FreemiBurst />
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute left-8 top-8 bottom-8 w-px"
              style={{ background: 'linear-gradient(180deg, #5B5FFF, rgba(91,95,255,0.08))' }} />

            <div className="space-y-4">
              {steps.map((item, i) => (
                <motion.div key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="flex gap-5 items-start rounded-2xl p-6 md:p-8"
                  style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', backdropFilter: 'blur(12px)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl relative z-10"
                    style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}>
                    {item.emoji}
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase block mb-1" style={{ color: '#5B5FFF' }}>
                      Step {item.step}
                    </span>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#0A0F1E' }}>{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2">{item.desc}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What operators can do */}
      <section className="py-16 px-6" style={{ background: 'rgba(255,255,255,0.5)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
              style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
              What operators handle
            </span>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold tracking-[-0.03em]" style={{ color: '#0A0F1E' }}>
              Every job. Done automatically.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {capabilities.map((c, i) => (
              <motion.div key={c.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 px-5 py-4 rounded-xl"
                style={{ background: 'white', border: '1px solid rgba(91,95,255,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <span className="text-xl">{c.icon}</span>
                <span className="text-sm font-medium text-gray-700">{c.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
              style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
              Connects to
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight mb-8" style={{ color: '#0A0F1E' }}>
              Your tools. Already.
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {integrations.map((tool, i) => (
                <motion.div key={tool}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold"
                  style={{ background: 'white', border: '1px solid rgba(91,95,255,0.1)', color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  {tool}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center px-8 py-12 rounded-3xl relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 20px 60px rgba(91,95,255,0.28)' }}>
            <div className="flex justify-center mb-4">
              <FreemiCharacter size="sm" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
              Ready to see it running?
            </h2>
            <p className="text-purple-100/80 mb-8 text-sm leading-relaxed max-w-md mx-auto">
              7-day free trial. No credit card needed. Custom operators live in 1–2 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/signup')}
                className="px-8 py-3 rounded-full bg-white font-bold text-sm hover:scale-105 transition-transform"
                style={{ color: '#5B5FFF' }}>
                Start free trial →
              </button>
              <button onClick={() => navigate('/for-business')}
                className="px-8 py-3 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all">
                Building a website?
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
      <FloatingChatWidget />
    </div>
  );
}
