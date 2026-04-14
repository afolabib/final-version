import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopNav from '../../components/TopNav';
import SiteFooter from '../../components/SiteFooter';
import ScrollReveal from '../../components/ScrollReveal';
import FreemiCharacter from '../../components/FreemiCharacter';
import FloatingChatWidget from '../../components/FloatingChatWidget';

const useCases = [
  {
    industry: 'Pharmacy',
    emoji: '💊',
    headline: 'Takes prescription orders and answers medication questions — 24/7',
    desc: "Customers call to order prescriptions, ask about availability, or check opening hours. Freemi Voice handles it all — takes the order, confirms collection time, and logs everything.",
    calls: [
      'Takes repeat prescription requests',
      'Checks and confirms stock availability',
      'Answers opening hours and location questions',
      'Routes urgent queries to the pharmacist on duty',
    ],
    example: [
      { side: 'caller', text: "Hi, I'd like to order my repeat prescription for metformin." },
      { side: 'freemi', text: "Of course — can I take your date of birth to pull up your records?" },
      { side: 'caller', text: "14th March 1978." },
      { side: 'freemi', text: "Got it. Your metformin is ready for collection tomorrow from 10am. Shall I send you a text reminder?" },
    ],
  },
  {
    industry: 'Plumber / Trades',
    emoji: '🔧',
    headline: 'Answers every call while you\'re on the job — qualifies the work, books the slot',
    desc: "You're on site with your hands full. Freemi Voice picks up every call, finds out what the job is, gets their details, and books them in — so you never lose a lead because you were busy.",
    calls: [
      'Qualifies the job (emergency vs. routine)',
      'Takes customer name, address, and job description',
      'Books a site visit at a time that works',
      'Escalates genuine emergencies to your mobile',
    ],
    example: [
      { side: 'caller', text: "Hi, my boiler has stopped working and I've got no heating." },
      { side: 'freemi', text: "Sorry to hear that — I can get someone out to you. Is there any hot water at all, or is everything off?" },
      { side: 'caller', text: "Everything's off, it's urgent." },
      { side: 'freemi', text: "Understood. I'm flagging this as urgent — can I take your address and I'll have the engineer call you back within 20 minutes?" },
    ],
  },
  {
    industry: 'Medical & Clinics',
    emoji: '🏥',
    headline: 'Books appointments, handles repeat requests, screens calls — so your team doesn\'t have to',
    desc: "Patients call to book appointments, request referrals, or ask about wait times. Freemi Voice handles the volume, books them in, and only passes through what genuinely needs a person.",
    calls: [
      'Books and reschedules appointments',
      'Handles repeat prescription requests',
      'Screens and triages incoming calls',
      'Routes urgent medical concerns to staff',
    ],
    example: [
      { side: 'caller', text: "I need to book an appointment with Dr. Murphy." },
      { side: 'freemi', text: "Of course. Is this a new concern or a follow-up from a previous visit?" },
      { side: 'caller', text: "Follow-up, I had bloods done last week." },
      { side: 'freemi', text: "Perfect. Dr. Murphy has availability Thursday at 2pm or Friday at 10am — which works better for you?" },
    ],
  },
  {
    industry: 'Professional Services',
    emoji: '💼',
    headline: 'Never miss a client call — screened, logged, and followed up automatically',
    desc: "Whether you're a solicitor, accountant, or consultant — Freemi Voice screens incoming calls, answers standard questions, books consultations, and ensures every potential client gets a prompt, professional response.",
    calls: [
      'Screens and qualifies new client enquiries',
      'Books initial consultations',
      'Answers pricing and service questions',
      'Takes messages and logs everything',
    ],
    example: [
      { side: 'caller', text: "Hi, I need to speak to someone about a contract dispute." },
      { side: 'freemi', text: "I can help with that. Are you an existing client, or is this a new matter?" },
      { side: 'caller', text: "New matter." },
      { side: 'freemi', text: "Understood. I can book you a 30-minute initial consultation. We have availability Monday at 11am — would that suit you?" },
    ],
  },
  {
    industry: 'Restaurant & Hospitality',
    emoji: '🍽️',
    headline: 'Takes reservations and answers questions — even at midnight',
    desc: "Customers call to book a table, ask about the menu, or check if you're open. Freemi Voice handles it all — reservations confirmed, party sizes taken, dietary requirements noted, confirmation sent.",
    calls: [
      'Takes and confirms table reservations',
      'Answers menu and dietary questions',
      'Handles cancellations and amendments',
      'Takes takeaway and delivery orders',
    ],
    example: [
      { side: 'caller', text: "Hi, can I book a table for Saturday evening?" },
      { side: 'freemi', text: "Of course — how many people, and what time were you thinking?" },
      { side: 'caller', text: "Four people, around 7:30." },
      { side: 'freemi', text: "7:30pm Saturday for four — perfect, that's available. Can I take a name for the booking and a number in case we need to reach you?" },
    ],
  },
];

const features = [
  { emoji: '📞', title: 'Answers every call', desc: 'No more missed calls, no voicemail. Freemi Voice picks up immediately, 24/7.' },
  { emoji: '🗣️', title: 'Speaks in your voice', desc: 'Trained on your business, your services, your tone. Callers feel like they\'re speaking to you.' },
  { emoji: '📋', title: 'Logs every call', desc: 'Every call transcribed, summarised, and logged. Searchable. Accessible from your dashboard.' },
  { emoji: '🚨', title: 'Escalates when needed', desc: 'Genuine emergencies, urgent situations, or complex queries get routed to you immediately.' },
  { emoji: '📅', title: 'Books appointments', desc: 'Checks your calendar and confirms bookings — right on the call. No callbacks needed.' },
  { emoji: '🌍', title: 'Works in any language', desc: 'Serves callers in their preferred language. Ideal for businesses with diverse customers.' },
];

const faqs = [
  { q: 'Does it sound like a real person?', a: 'Yes. Freemi Voice uses natural-sounding speech trained on your specific business. Most callers cannot tell it\'s automated.' },
  { q: 'How does it know about my business?', a: "You tell Freemi what your business does — your services, your hours, your pricing. It's trained on that and handles calls accordingly." },
  { q: 'What happens with calls it can\'t handle?', a: 'It takes a message, tells the caller someone will follow up, and alerts you immediately. You never lose the lead.' },
  { q: 'Can I see what calls came in?', a: 'Yes — every call is transcribed and summarised in your dashboard. You can search, filter, and review any call.' },
  { q: 'Can I keep my existing phone number?', a: 'Yes. We set up call forwarding from your existing number. Nothing changes for your customers.' },
  { q: 'Is this available now?', a: 'Freemi Voice is in early access. Join the waitlist and you\'ll be among the first businesses we set up.' },
];

export default function SolutionPhoneAI() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)', minHeight: '100vh' }}>
      <TopNav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 800px 500px at 50% 0%, rgba(91,95,255,0.07), transparent)' }} />
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold tracking-widest uppercase"
                style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.08)', border: '1px solid rgba(91,95,255,0.15)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Freemi Voice
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[clamp(2.4rem,5vw,3.8rem)] font-extrabold leading-[1.05] tracking-[-0.04em] mb-5"
                style={{ color: '#0A0F1E' }}>
                Your phone answered.<br />
                <span style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Every call. Every time.
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base text-gray-500 mb-8 leading-relaxed">
                Freemi Voice answers your inbound calls 24/7 — taking orders, booking appointments, answering questions, and routing urgent calls to you. Your customers always get a real, professional response. You never miss a call again.
              </motion.p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-3 mb-6">
                <button onClick={() => navigate('/signup')}
                  className="px-8 py-3.5 rounded-full text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 8px 24px rgba(91,95,255,0.3)' }}>
                  Join the waitlist →
                </button>
                <a href="mailto:hello@freemi.ai"
                  className="px-8 py-3.5 rounded-full text-sm font-semibold text-center"
                  style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.2)' }}>
                  Book a demo
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium">
                {['Answers 24/7', 'Keep your number', 'Every call logged'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black text-indigo-500"
                      style={{ background: 'rgba(91,95,255,0.1)' }}>✓</span>
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right — Phone call mockup */}
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
              {/* Phone frame */}
              <div className="mx-auto" style={{ maxWidth: 280 }}>
                <div className="rounded-[2.5rem] overflow-hidden"
                  style={{ background: '#111827', border: '6px solid #1F2937', boxShadow: '0 32px 64px rgba(0,0,0,0.3)' }}>
                  {/* Status bar */}
                  <div className="px-5 py-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-semibold">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-1.5 rounded-sm bg-gray-400" />
                      <div className="w-1 h-1 rounded-full bg-gray-400" />
                    </div>
                  </div>

                  {/* Active call UI */}
                  <div className="px-6 py-6 text-center">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 mb-4">Active call · 1:34</div>

                    {/* Freemi avatar */}
                    <div className="flex justify-center mb-4">
                      <motion.div
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
                        style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 8px 32px rgba(91,95,255,0.5)' }}>
                        {/* Sound waves */}
                        {[1, 2, 3].map(n => (
                          <motion.div key={n}
                            className="absolute rounded-2xl"
                            style={{ inset: -n * 8, border: `1px solid rgba(91,95,255,${0.3 / n})` }}
                            animate={{ scale: [1, 1 + n * 0.06], opacity: [0.5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: n * 0.3, ease: 'easeOut' }}
                          />
                        ))}
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                          <div className="w-4 h-4 rounded-full bg-white" />
                        </div>
                      </motion.div>
                    </div>

                    <div className="text-white font-bold text-base mb-1">Freemi Voice</div>
                    <div className="text-gray-400 text-xs mb-6">Answering for YourBusiness</div>

                    {/* Live transcript */}
                    <div className="rounded-xl p-3 text-left space-y-2 mb-6"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="text-[9px] font-bold tracking-widest uppercase text-gray-500 mb-2">Live transcript</div>
                      {[
                        { who: 'Caller', text: "Hi, I need to order a repeat prescription." },
                        { who: 'Freemi', text: "Of course — can I take your date of birth?" },
                        { who: 'Caller', text: "14th March 1978." },
                      ].map((line, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.4 }}
                          className="flex gap-2">
                          <span className="text-[8px] font-bold flex-shrink-0 mt-0.5"
                            style={{ color: line.who === 'Freemi' ? '#818CF8' : '#94A3B8' }}>
                            {line.who}
                          </span>
                          <span className="text-[9px] text-gray-300 leading-relaxed">{line.text}</span>
                        </motion.div>
                      ))}
                      <motion.div
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="flex gap-1 pt-1">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-1 h-1 rounded-full bg-indigo-400" />
                        ))}
                      </motion.div>
                    </div>

                    {/* Call controls */}
                    <div className="flex justify-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <span className="text-lg">🔇</span>
                      </div>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: '#EF4444', boxShadow: '0 4px 16px rgba(239,68,68,0.4)' }}>
                        <span className="text-xl">📵</span>
                      </div>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <span className="text-lg">🔊</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Label below */}
                <div className="text-center mt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Freemi answered while you were on site
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use cases — industry by industry */}
      <section className="py-20 px-6" style={{ background: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
                style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
                Who it works for
              </span>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold tracking-[-0.03em]" style={{ color: '#0A0F1E' }}>
                Built for businesses that run on phone calls.
              </h2>
              <p className="text-gray-500 mt-3 max-w-lg mx-auto">Every industry has its own call types. Freemi Voice is trained on yours.</p>
            </div>
          </ScrollReveal>

          <div className="space-y-5">
            {useCases.map((uc, i) => (
              <ScrollReveal key={uc.industry} delay={i * 0.05}>
                <div className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(91,95,255,0.08)', background: '#FAFBFF' }}>
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Left */}
                    <div className="p-8 md:border-r" style={{ borderColor: 'rgba(91,95,255,0.06)' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ background: 'rgba(91,95,255,0.08)' }}>
                          {uc.emoji}
                        </div>
                        <div>
                          <h3 className="text-base font-bold" style={{ color: '#0A0F1E' }}>{uc.industry}</h3>
                          <p className="text-xs font-semibold" style={{ color: '#5B5FFF' }}>{uc.headline}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed mb-5">{uc.desc}</p>
                      <div className="space-y-2">
                        {uc.calls.map(c => (
                          <div key={c} className="flex items-center gap-2.5 text-sm text-gray-700">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(91,95,255,0.1)' }}>
                              <span className="text-[8px] font-black" style={{ color: '#5B5FFF' }}>✓</span>
                            </div>
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right — call transcript */}
                    <div className="p-8 flex flex-col justify-center"
                      style={{ background: 'rgba(91,95,255,0.015)' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Live call transcript</span>
                      </div>
                      <div className="space-y-3">
                        {uc.example.map((line, j) => (
                          <div key={j} className={`flex ${line.side === 'caller' ? 'justify-end' : 'justify-start'} items-start gap-2`}>
                            {line.side === 'freemi' && (
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: 'rgba(91,95,255,0.12)' }}>
                                <span className="text-xs">📞</span>
                              </div>
                            )}
                            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed`}
                              style={{
                                background: line.side === 'freemi' ? 'rgba(91,95,255,0.08)' : 'rgba(0,0,0,0.04)',
                                color: '#374151',
                                borderRadius: line.side === 'freemi' ? '12px 12px 12px 3px' : '12px 12px 3px 12px',
                                border: line.side === 'freemi' ? '1px solid rgba(91,95,255,0.1)' : 'none',
                              }}>
                              <span className="text-[8px] font-bold uppercase tracking-wider block mb-1"
                                style={{ color: line.side === 'freemi' ? '#5B5FFF' : '#94A3B8' }}>
                                {line.side === 'freemi' ? 'Freemi Voice' : 'Caller'}
                              </span>
                              {line.text}
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit mt-1"
                          style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-xs font-semibold text-emerald-600">Handled — logged to dashboard</span>
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

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
                style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
                How it works
              </span>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-[-0.03em]" style={{ color: '#0A0F1E' }}>
                Everything a receptionist does. Without the cost.
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.07}>
                <div className="p-6 rounded-2xl h-full"
                  style={{ border: '1px solid rgba(91,95,255,0.08)', background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                  <div className="text-2xl mb-3">{f.emoji}</div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it connects */}
      <section className="py-16 px-6" style={{ background: 'white' }}>
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-xl font-extrabold tracking-tight mb-2" style={{ color: '#0A0F1E' }}>
                Works with your existing number
              </h2>
              <p className="text-sm text-gray-400">No new number. No changes for your customers. Just set up call forwarding and you're live.</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Tell Freemi about your business', desc: "Describe your services, your call types, and how you'd like calls handled. Takes a few minutes." },
              { step: '2', title: 'Set up call forwarding', desc: 'Forward your number to Freemi Voice. Nothing changes for your customers — same number, always answered.' },
              { step: '3', title: 'Every call handled', desc: 'Freemi answers instantly, handles the call, and logs everything to your dashboard. You get notified when needed.' },
            ].map((s, i) => (
              <ScrollReveal key={s.step} delay={i * 0.1}>
                <div className="p-6 rounded-2xl text-center"
                  style={{ border: '1px solid rgba(91,95,255,0.08)', background: '#FAFBFF' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-black text-sm"
                    style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 4px 16px rgba(91,95,255,0.25)' }}>
                    {s.step}
                  </div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: '#0A0F1E' }}>{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <h2 className="text-xl font-extrabold tracking-tight mb-8 text-center" style={{ color: '#0A0F1E' }}>Common questions</h2>
          </ScrollReveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={faq.q} delay={i * 0.04}>
                <div className="p-5 rounded-2xl"
                  style={{ background: 'white', border: '1px solid rgba(91,95,255,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 className="font-bold text-sm mb-1.5" style={{ color: '#0A0F1E' }}>{faq.q}</h3>
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
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 20px 60px rgba(91,95,255,0.28)' }}>
              <div className="flex justify-center mb-4">
                <FreemiCharacter size="sm" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
                Never miss another call.
              </h2>
              <p className="text-purple-100/80 mb-8 text-sm leading-relaxed max-w-md mx-auto">
                Freemi Voice is in early access. Join the waitlist and be among the first businesses we set live.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate('/signup')}
                  className="px-8 py-3 rounded-full bg-white font-bold text-sm hover:scale-105 transition-transform"
                  style={{ color: '#5B5FFF' }}>
                  Join the waitlist →
                </button>
                <button onClick={() => navigate('/solutions/ai-operators')}
                  className="px-8 py-3 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all">
                  See all operators →
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
