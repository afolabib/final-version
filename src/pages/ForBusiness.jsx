import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import ScrollReveal from '../components/ScrollReveal';
import TextReveal from '../components/TextReveal';
import FreemiCharacter from '../components/FreemiCharacter';
import FloatingChatWidget from '../components/FloatingChatWidget';

const steps = [
  {
    num: '01', emoji: '💬',
    title: 'Tell us about your business',
    desc: "Fill in a quick brief — what your business does, what customers ask, what you want automated. No calls, no technical knowledge needed.",
  },
  {
    num: '02', emoji: '🏗️',
    title: 'We build your website and AI in 1–2 days',
    desc: 'Professional site delivered fast, with an AI concierge already embedded, configured, and connected to your calendar. Ready to go live.',
  },
  {
    num: '03', emoji: '💬',
    title: 'Your AI answers customers 24/7',
    desc: 'Enquiries, bookings, complaints, lead capture — handled automatically while you focus on the work only you can do.',
  },
  {
    num: '04', emoji: '📊',
    title: 'You see everything. You stay in control.',
    desc: 'Every conversation, every booking, every lead — logged and visible on your dashboard. Freemi flags anything that genuinely needs your attention.',
  },
];

const includes = [
  { emoji: '🌐', title: 'Professional website', desc: 'Built to convert visitors into customers. Hosted and maintained by us — forever.' },
  { emoji: '💬', title: 'AI concierge on your site', desc: 'Answers every question in your tone, 24/7. Knows your services, your prices, your availability.' },
  { emoji: '📅', title: 'Bookings handled automatically', desc: 'Checks your real calendar, confirms bookings, sends reminders. Zero phone calls needed.' },
  { emoji: '🎯', title: 'Leads captured and followed up', desc: 'Every visitor who enquires gets a personalised follow-up. No lead falls through the gap.' },
  { emoji: '📊', title: 'Dashboard — see everything', desc: "Every conversation, booking, and lead in one place. You're always in the picture." },
  { emoji: '🔧', title: 'We manage it all', desc: "We set it up, host it, maintain it, update it. You never touch the tech side." },
];

const faqs = [
  { q: 'Do I need to know anything about technology?', a: "Not at all. We handle 100% of the setup and maintenance. You tell us about your business — we handle everything else." },
  { q: 'How fast can you build it?', a: 'Typically 1–2 days from our first call to a live website with AI running on it.' },
  { q: 'I already have a website. Can you add the AI to it?', a: "Yes. We can add the AI concierge to your existing site for a €300–500 setup fee. No full rebuild needed." },
  { q: 'What does the monthly fee cover?', a: 'Hosting, AI operator costs, ongoing maintenance, and updates. Everything included — no surprise bills.' },
  { q: "What if the AI can't answer something?", a: "It escalates to you immediately — by email or Slack. You only hear about things that genuinely need you." },
];

export default function ForBusiness() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)', minHeight: '100vh' }}>
      <TopNav />

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 900px 500px at 50% 0%, rgba(91,95,255,0.08), transparent)' }} />

        <div className="max-w-3xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold tracking-widest uppercase"
            style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.08)', border: '1px solid rgba(91,95,255,0.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B5FFF] animate-pulse" />
            Website + AI for your business
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[1.04] tracking-[-0.04em] mb-6"
            style={{ color: '#0A0F1E' }}>
            A website that works<br />
            <span style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              even when you don't.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            We build your website and embed an AI that answers customers, handles bookings, and captures leads — 24/7, automatically. You never touch it.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button onClick={() => window.open('https://studio.freemi.ai', '_blank')}
              className="px-10 py-4 rounded-full text-base font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 8px 28px rgba(91,95,255,0.35)' }}>
              Get started →
            </button>
            <a href="mailto:hello@freemi.ai"
              className="px-8 py-4 rounded-full text-base font-semibold"
              style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.2)' }}>
              Book a call
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-5 text-sm text-gray-400">
            {['From €1,500 one-off build', '€49.99/month after', 'We manage everything'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                  style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF' }}>✓</span>
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Chat demo */}
      <section className="py-4 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="rounded-3xl overflow-hidden"
              style={{ background: '#0A0F1E', border: '1px solid rgba(91,95,255,0.2)', boxShadow: '0 24px 80px rgba(91,95,255,0.15)' }}>
              <div className="p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase block mb-3"
                    style={{ color: '#A5A8FF' }}>Live on your website</span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug mb-4">
                    Customers get answered instantly.<br />You don't lift a finger.
                  </h2>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Your AI knows your services, your availability, and your tone. It handles the conversation start to finish — and only contacts you when it genuinely needs you.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#A5A8FF' }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Running 24/7 on your site
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden"
                  style={{ background: '#111827', border: '1px solid rgba(91,95,255,0.15)' }}>
                  <div className="px-4 py-3 flex items-center gap-2.5"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(91,95,255,0.08)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                      <div className="w-2.5 h-2.5 rounded-full bg-white opacity-90" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Freemi AI</div>
                      <div className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Online now
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2.5">
                    {[
                      { s: 'bot', t: 'Hi! I can help with bookings or any questions. What do you need?' },
                      { s: 'user', t: 'Do you have anything free this Saturday?' },
                      { s: 'bot', t: 'Yes — 10am and 2pm are both open. Which works for you?' },
                      { s: 'user', t: '2pm. Name is Sarah Murphy.' },
                      { s: 'bot', t: "Perfect Sarah — what's your email so I can send a confirmation?" },
                      { s: 'user', t: 'sarah@gmail.com' },
                    ].map((m, i) => (
                      <div key={i} className={`flex ${m.s === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[80%] px-3 py-2 text-xs leading-relaxed"
                          style={{
                            background: m.s === 'bot' ? 'rgba(91,95,255,0.18)' : 'rgba(255,255,255,0.07)',
                            color: m.s === 'bot' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)',
                            borderRadius: m.s === 'bot' ? '12px 12px 12px 3px' : '12px 12px 3px 12px',
                          }}>
                          {m.t}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400"
                      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)' }}>
                      ✓ Booked — Saturday 2pm · Confirmation sent to sarah@gmail.com
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* What's included */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
                style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
                What's included
              </span>
              <TextReveal>
                <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold tracking-[-0.04em] leading-tight" style={{ color: '#0A0F1E' }}>
                  Everything set up for you.<br />Nothing to figure out.
                </h2>
              </TextReveal>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {includes.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.07}>
                <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm h-full"
                  style={{ border: '1px solid rgba(91,95,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                  <div className="text-2xl mb-3">{item.emoji}</div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#0A0F1E' }}>{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
                style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
                How it works
              </span>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.04em]" style={{ color: '#0A0F1E' }}>
                Up and running in 1–2 days.
              </h2>
            </div>
          </ScrollReveal>
          <div className="relative">
            <div className="hidden md:block absolute left-8 top-8 bottom-8 w-px"
              style={{ background: 'linear-gradient(180deg, #5B5FFF, rgba(91,95,255,0.08))' }} />
            <div className="space-y-4">
              {steps.map((step, i) => (
                <ScrollReveal key={step.num} delay={i * 0.09}>
                  <div className="flex gap-5 items-start p-6 md:p-8 rounded-2xl bg-white/80 backdrop-blur-sm"
                    style={{ border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl relative z-10"
                      style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}>
                      {step.emoji}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase block mb-1" style={{ color: '#5B5FFF' }}>
                        Step {step.num}
                      </span>
                      <h3 className="text-base font-bold mb-2" style={{ color: '#0A0F1E' }}>{step.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
              style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
              Pricing
            </span>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.04em] mb-4" style={{ color: '#0A0F1E' }}>
              A fraction of what a receptionist costs.<br />Works 24/7.
            </h2>
            <p className="text-gray-500 mb-12 max-w-md mx-auto">One-off fee to get started. Low monthly to keep it running.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="p-8 rounded-2xl text-left bg-white/80 backdrop-blur-sm"
                style={{ border: '1.5px solid rgba(91,95,255,0.12)', boxShadow: '0 8px 32px rgba(91,95,255,0.08)' }}>
                <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#5B5FFF' }}>New website + AI</div>
                <div className="text-4xl font-black tracking-tight mb-1" style={{ color: '#0A0F1E' }}>€1,500</div>
                <div className="text-sm text-gray-400 mb-5">one-off build</div>
                <div className="text-2xl font-black tracking-tight mb-1" style={{ color: '#5B5FFF' }}>+ €49.99/mo</div>
                <div className="text-sm text-gray-400 mb-7">hosting · AI · maintenance</div>
                <div className="space-y-2.5">
                  {['Professional website built for you', 'AI concierge embedded & configured', 'Bookings, leads, enquiries handled', 'We manage everything forever'].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                        style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF' }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8 rounded-2xl text-left"
                style={{ background: 'linear-gradient(135deg, #0A0F1E, #1a1040)', border: '1.5px solid rgba(91,95,255,0.2)', boxShadow: '0 8px 32px rgba(91,95,255,0.15)' }}>
                <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(165,168,255,0.7)' }}>Add AI to existing site</div>
                <div className="text-4xl font-black tracking-tight mb-1 text-white">€400</div>
                <div className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>one-off setup</div>
                <div className="text-2xl font-black tracking-tight mb-1" style={{ color: '#A5A8FF' }}>+ €49.99/mo</div>
                <div className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.35)' }}>AI operator costs</div>
                <div className="space-y-2.5">
                  {['AI concierge on your existing site', 'Bookings & lead capture', 'Full dashboard access', 'Ongoing support included'].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                        style={{ background: 'rgba(91,95,255,0.2)', color: '#A5A8FF' }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-sm text-gray-400">
              First 3 builds at a discounted rate in exchange for a testimonial.{' '}
              <a href="mailto:hello@freemi.ai" className="font-semibold" style={{ color: '#5B5FFF' }}>Get in touch →</a>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-extrabold tracking-tight mb-10 text-center" style={{ color: '#0A0F1E' }}>
              Common questions
            </h2>
          </ScrollReveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={faq.q} delay={i * 0.06}>
                <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm"
                  style={{ border: '1px solid rgba(91,95,255,0.07)' }}>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#0A0F1E' }}>{faq.q}</h3>
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
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED, #5B5FFF)', boxShadow: '0 20px 60px rgba(91,95,255,0.3)' }}>
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-center mb-5">
                  <FreemiCharacter size="sm" />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
                  Stop missing customers.
                </h2>
                <p className="mb-8 text-sm leading-relaxed max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Get a website with AI built in — live in 1–2 days. We handle everything.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => window.open('https://studio.freemi.ai', '_blank')}
                    className="px-8 py-3 rounded-full bg-white font-bold text-sm hover:scale-105 transition-transform"
                    style={{ color: '#5B5FFF' }}>
                    Get started →
                  </button>
                  <a href="mailto:hello@freemi.ai"
                    className="px-8 py-3 rounded-full border border-white/25 text-white font-semibold text-sm hover:bg-white/10 transition-all">
                    Book a call
                  </a>
                </div>
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
