import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopNav from '../../components/TopNav';
import SiteFooter from '../../components/SiteFooter';
import ScrollReveal from '../../components/ScrollReveal';
import FreemiCharacter from '../../components/FreemiCharacter';
import FloatingChatWidget from '../../components/FloatingChatWidget';

const operators = [
  {
    emoji: '💬',
    name: 'Customer Enquiries',
    tagline: 'Every message answered. Instantly.',
    desc: 'Your operator knows your services, your prices, your FAQs, and your tone. It answers customer questions the moment they arrive — on your website, via email, or by phone. No more missed messages. No more waiting.',
    does: [
      'Answers FAQs in your exact tone',
      'Handles complaints and escalates when needed',
      'Works on website chat, email, and phone',
      'Responds within seconds, 24/7',
    ],
    example: {
      customer: "Hi, do you offer weekend appointments?",
      operator: "Yes! We're open Saturday 9am–4pm. Would you like to book one? I can check availability right now.",
    },
    connects: ['Website Widget', 'Gmail', 'Phone Agent'],
  },
  {
    emoji: '📅',
    name: 'Bookings & Calendar',
    tagline: 'Bookings handled. Reminders sent. No calls needed.',
    desc: "Your operator checks your real calendar, confirms bookings, sends invites, and follows up with reminders — all automatically. Customers book themselves. You show up. That's it.",
    does: [
      'Checks live availability and confirms bookings',
      'Sends calendar invites and reminders',
      'Handles reschedules and cancellations',
      'Syncs with Google Calendar in real time',
    ],
    example: {
      customer: "3pm Thursday works. I'm Sarah Murphy, sarah@example.com",
      operator: "Perfect Sarah — you're booked for Thursday 3pm. Confirmation and calendar invite sent to sarah@example.com. See you then!",
    },
    connects: ['Google Calendar', 'Gmail', 'Website Widget'],
  },
  {
    emoji: '🎯',
    name: 'Lead Follow-up',
    tagline: 'No lead goes cold. Ever.',
    desc: 'Every person who enquires — whether through your site, email, or phone — gets followed up automatically with personalised messages. Your CRM updates itself. Hot leads get flagged. You only get involved when it matters.',
    does: [
      'Captures leads from every channel',
      'Sends personalised follow-up sequences',
      'Updates your CRM automatically',
      'Flags hot leads so you can close them',
    ],
    example: {
      customer: "Interested in your services — can you send more info?",
      operator: "Hi Tom — great to hear from you! I've sent over our full guide. Are you free for a quick call this week? I can book you in now.",
    },
    connects: ['Gmail', 'HubSpot', 'Website Widget'],
  },
  {
    emoji: '📧',
    name: 'Email & Inbox',
    tagline: 'Your inbox managed. Without you in it.',
    desc: 'Your operator reads incoming emails, drafts replies, routes messages to the right person, and handles the routine stuff automatically. Urgent items get flagged. Everything else gets handled.',
    does: [
      'Drafts replies to routine emails',
      'Routes messages to the right person',
      'Flags urgent items for your review',
      'Handles standard requests automatically',
    ],
    example: {
      customer: "Can we push our meeting to Thursday?",
      operator: "Of course — moved to Thursday at the same time. Updated calendar invite sent to both of you.",
    },
    connects: ['Gmail', 'Slack', 'Google Calendar'],
  },
  {
    emoji: '⚙️',
    name: 'Operations & Tasks',
    tagline: 'The admin that eats your day. Done automatically.',
    desc: 'Weekly summaries, task tracking, reminders, data entry, report generation — handled in the background while you focus on work that matters. Your tools stay in sync. Nothing slips.',
    does: [
      'Sends weekly business summaries to you',
      'Tracks tasks and flags missed deadlines',
      'Automates routine workflows',
      'Keeps your tools in sync',
    ],
    example: {
      customer: "Weekly summary:",
      operator: "Week of 7 Apr: 14 enquiries answered · 6 bookings confirmed · 4 leads in follow-up · £2,140 confirmed revenue. Nothing needs your attention.",
    },
    connects: ['Slack', 'Gmail', 'Google Calendar'],
  },
];

const integrations = [
  { name: 'Gmail', icon: '📧' },
  { name: 'Google Calendar', icon: '📅' },
  { name: 'Slack', icon: '💬' },
  { name: 'HubSpot', icon: '🎯' },
  { name: 'Website Widget', icon: '🌐' },
  { name: 'Phone Agent', icon: '📞' },
];

const timeline = [
  { day: 'Step 1', title: 'Tell Freemi what your business needs', desc: 'In the app, describe what takes up your day — customer questions, bookings, follow-ups, emails. No forms, no technical setup.' },
  { day: 'Step 2', title: 'Freemi builds your custom operators', desc: 'AI operators are configured specifically for your business — your tone, your services, your rules. Built and tested automatically.' },
  { day: 'Step 3', title: 'Connect your tools', desc: 'Your operators plug into Gmail, Google Calendar, Slack, your CRM — wherever you already work. One-click connections.' },
  { day: 'Step 4', title: 'They start working', desc: 'Customers get answered. Bookings get confirmed. Leads get followed up. You only hear about things that genuinely need you.' },
];

const faqs = [
  { q: 'How long does setup take?', a: 'Tell Freemi what your business needs and your operators are live in minutes. No calls, no technical setup required.' },
  { q: 'Do I need to know anything about AI?', a: "Not at all. You describe what you need in plain English. Freemi builds and configures everything — you just use it." },
  { q: 'What tools do operators connect to?', a: 'Gmail, Google Calendar, Slack, HubSpot, your website, and phone. More integrations added regularly.' },
  { q: "What if the operator can't handle something?", a: "It escalates to you immediately — by email or Slack. You only get involved in things that genuinely need you." },
  { q: 'Can I change what the operators do?', a: "Yes. You can update their instructions, tone, and workflows any time. We handle the changes for you." },
  { q: 'Is there a free trial?', a: '7-day free trial. No credit card required. Your operators are live and working before you pay anything.' },
];

export default function SolutionAIOperators() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #F8F9FE 50%, #F0F1FF 100%)', minHeight: '100vh' }}>
      <TopNav />

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 800px 500px at 50% 0%, rgba(123,97,255,0.07), transparent)' }} />
        <div className="max-w-3xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold tracking-widest uppercase"
            style={{ color: '#7B61FF', background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7B61FF] animate-pulse" />
            AI Operators
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(2.8rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] mb-6"
            style={{ color: '#0A0F1E' }}>
            An AI team that handles<br />
            <span style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              the work that fills your day.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Custom AI operators built specifically for your business. They answer customers, handle bookings, follow up leads, and manage your inbox — 24/7, without you being involved.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button onClick={() => window.open('https://studio.freemi.ai', '_blank')}
              className="px-10 py-4 rounded-full text-base font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 8px 28px rgba(123,97,255,0.35)' }}>
              Start free trial →
            </button>
            <a href="mailto:hello@freemi.ai"
              className="px-8 py-4 rounded-full text-base font-semibold text-center"
              style={{ color: '#7B61FF', background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.2)' }}>
              Book a demo
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-5 text-sm text-gray-400 font-medium">
            {['7-day free trial', 'Live in 1–2 days', 'No technical setup'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black text-indigo-500"
                  style={{ background: 'rgba(123,97,255,0.1)' }}>✓</span>
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What operators handle — detailed cards */}
      <section className="py-20 px-6" style={{ background: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
                style={{ color: '#7B61FF', background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.1)' }}>
                What your operators do
              </span>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold tracking-[-0.03em]" style={{ color: '#0A0F1E' }}>
                Every job. Done automatically.
              </h2>
              <p className="text-gray-500 mt-3 max-w-lg mx-auto">Each operator handles a specific part of your business — configured around how you actually work.</p>
            </div>
          </ScrollReveal>

          <div className="space-y-5">
            {operators.map((op, i) => (
              <ScrollReveal key={op.name} delay={i * 0.05}>
                <div className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(123,97,255,0.08)', background: '#FAFBFF', boxShadow: '0 2px 16px rgba(0,0,0,0.03)' }}>
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Left */}
                    <div className="p-8 md:border-r" style={{ borderColor: 'rgba(123,97,255,0.06)' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ background: 'rgba(123,97,255,0.08)' }}>
                          {op.emoji}
                        </div>
                        <div>
                          <h3 className="text-base font-bold" style={{ color: '#0A0F1E' }}>{op.name}</h3>
                          <p className="text-xs font-semibold" style={{ color: '#7B61FF' }}>{op.tagline}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed mb-5">{op.desc}</p>
                      <div className="space-y-2 mb-5">
                        {op.does.map(d => (
                          <div key={d} className="flex items-center gap-2.5 text-sm text-gray-700">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(123,97,255,0.1)' }}>
                              <span className="text-[8px] font-black" style={{ color: '#7B61FF' }}>✓</span>
                            </div>
                            {d}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {op.connects.map(c => (
                          <span key={c} className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ background: 'rgba(123,97,255,0.06)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.12)' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right — live example */}
                    <div className="p-8 flex flex-col justify-center"
                      style={{ background: 'rgba(123,97,255,0.015)' }}>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block mb-4">Live example</span>
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed text-gray-600"
                            style={{ background: 'rgba(0,0,0,0.04)' }}>
                            {op.example.customer}
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(123,97,255,0.12)' }}>
                            <span className="text-sm">{op.emoji}</span>
                          </div>
                          <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed text-gray-700"
                            style={{ background: 'rgba(123,97,255,0.07)', border: '1px solid rgba(123,97,255,0.1)' }}>
                            {op.example.operator}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit"
                          style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-xs font-semibold text-emerald-600">Handled automatically</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works timeline */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
                style={{ color: '#7B61FF', background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.1)' }}>
                How it works
              </span>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-[-0.03em]" style={{ color: '#0A0F1E' }}>
                Live in 2 days. No setup from you.
              </h2>
            </div>
          </ScrollReveal>
          <div className="relative">
            <div className="hidden md:block absolute left-[72px] top-4 bottom-4 w-px"
              style={{ background: 'linear-gradient(180deg, #7B61FF, rgba(123,97,255,0.05))' }} />
            <div className="space-y-4">
              {timeline.map((t, i) => (
                <ScrollReveal key={t.day} delay={i * 0.1}>
                  <div className="flex gap-5 items-start p-6 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(123,97,255,0.07)', boxShadow: '0 2px 16px rgba(0,0,0,0.03)' }}>
                    <div className="flex-shrink-0 text-center relative z-10" style={{ minWidth: 90 }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1"
                        style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 4px 16px rgba(123,97,255,0.25)' }}>
                        <span className="text-white text-xs font-black">{i + 1}</span>
                      </div>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-indigo-400">{t.day}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1" style={{ color: '#0A0F1E' }}>{t.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-6" style={{ background: 'white' }}>
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-xl font-extrabold tracking-tight mb-2" style={{ color: '#0A0F1E' }}>
              Connects to your tools — immediately
            </h2>
            <p className="text-sm text-gray-400 mb-8">Your operators plug in and start working. No configuration needed from you.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {integrations.map((tool, i) => (
                <motion.div key={tool.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
                  style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151' }}>
                  <span>{tool.icon}</span>
                  {tool.name}
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-[-0.03em]" style={{ color: '#0A0F1E' }}>
                Common questions
              </h2>
            </div>
          </ScrollReveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={faq.q} delay={i * 0.04}>
                <div className="p-6 rounded-2xl" style={{ background: 'white', border: '1px solid rgba(123,97,255,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                  <h3 className="font-bold text-sm mb-2" style={{ color: '#0A0F1E' }}>{faq.q}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <div className="text-center px-8 py-12 rounded-3xl relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 20px 60px rgba(123,97,255,0.28)' }}>
              <div className="flex justify-center mb-4">
                <FreemiCharacter size="sm" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
                Your business on autopilot. Today.
              </h2>
              <p className="text-purple-100/80 mb-8 text-sm leading-relaxed max-w-md mx-auto">
                7-day free trial. No credit card needed. Operators live and working in 1–2 days.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => window.open('https://studio.freemi.ai', '_blank')}
                  className="px-8 py-3 rounded-full bg-white font-bold text-sm hover:scale-105 transition-transform"
                  style={{ color: '#7B61FF' }}>
                  Start free trial →
                </button>
                <button onClick={() => navigate('/for-business')}
                  className="px-8 py-3 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all">
                  Need a website too?
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter />
      <FloatingChatWidget />
    </div>
  );
}
