import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopNav from '../../components/TopNav';
import SiteFooter from '../../components/SiteFooter';
import ScrollReveal from '../../components/ScrollReveal';
import FreemiCharacter from '../../components/FreemiCharacter';
import FloatingChatWidget from '../../components/FloatingChatWidget';

const features = [
  {
    emoji: '💬',
    title: 'Answers every question',
    desc: 'Knows your business, your services, your prices, your FAQs. Responds in seconds — not hours — in your tone.',
    detail: 'Trained on your actual business. Customers get accurate answers immediately, no matter what time it is.'
  },
  {
    emoji: '📅',
    title: 'Takes bookings',
    desc: 'Checks your live calendar and confirms bookings right in the chat. No phone calls. No back and forth.',
    detail: 'Connects to Google Calendar. Sends confirmation emails and reminders automatically.'
  },
  {
    emoji: '🎯',
    title: 'Captures and follows up leads',
    desc: 'Collects name, email, and intent from every visitor — then follows up automatically so nothing falls through.',
    detail: 'Every lead logged to your dashboard. Follow-up sequences sent automatically. You close the ones that matter.'
  },
  {
    emoji: '🎨',
    title: 'Matches your brand',
    desc: 'Customise the colours, name, and tone. It looks and sounds like part of your site — not a bolt-on chatbot.',
    detail: 'Your logo, your colours, your name. Customers trust it because it feels like you.'
  },
  {
    emoji: '📱',
    title: 'Works on any website',
    desc: 'One line of code on any website. Works perfectly on mobile, tablet, and desktop. No developer needed.',
    detail: 'Paste one script tag. That\'s it. Works on WordPress, Squarespace, Webflow, or any custom site.'
  },
  {
    emoji: '📊',
    title: 'Full dashboard included',
    desc: 'See every conversation, every lead, every booking — all in one place. Know exactly what\'s happening.',
    detail: 'Real-time activity feed. Export leads. Review conversations. See what customers are asking most.'
  },
];

const chatMessages = [
  { side: 'bot', text: "Hi! I'm here to help with questions, bookings, or anything else. What can I do for you?" },
  { side: 'user', text: 'Do you do evening appointments?' },
  { side: 'bot', text: "Yes — we have slots available on weekday evenings from 5pm. Would you like to book one?" },
  { side: 'user', text: 'Yes please. Do you have anything this Thursday evening?' },
  { side: 'bot', text: 'Thursday the 10th — 5pm, 6pm and 7pm are all available. Which works best for you?' },
  { side: 'user', text: '6pm. My name is James Kelly.' },
  { side: 'bot', text: "Perfect James — booked for Thursday 6pm. What's your email address so I can send you the confirmation?" },
  { side: 'user', text: 'james@example.com' },
  { side: 'bot', text: "Done! Confirmation and calendar invite sent to james@example.com. See you Thursday at 6pm 👍" },
];

const useCases = [
  { industry: 'Hair & Beauty', example: 'Books appointments, answers product questions, handles cancellations — all without picking up the phone.' },
  { industry: 'Trades & Services', example: 'Qualifies enquiries, books site visits, sends quotes — while you\'re on the job.' },
  { industry: 'Clinics & Therapists', example: 'Screens new patients, books consultations, sends intake forms — 24/7.' },
  { industry: 'Restaurants & Hospitality', example: 'Takes reservations, answers menu questions, handles special requests — even at midnight.' },
  { industry: 'Fitness & Coaching', example: 'Books sessions, answers pricing questions, follows up on trial enquiries automatically.' },
  { industry: 'Retail & E-commerce', example: 'Answers product questions, helps customers track orders, handles returns queries instantly.' },
];

const faqs = [
  { q: 'How do I add it to my website?', a: 'Paste one line of code just before the closing </body> tag. That\'s it. Works on any website platform.' },
  { q: 'How does it know about my business?', a: 'During setup, we train it on your services, prices, FAQs, policies, and tone. You review it before it goes live.' },
  { q: 'Can I see what customers are asking?', a: 'Yes — every conversation is logged in your dashboard. You can review, search, and export at any time.' },
  { q: 'What if a customer asks something it doesn\'t know?', a: "It tells the customer it will follow up, and alerts you. It never makes things up or gives wrong answers." },
  { q: 'Can I change the name and colours?', a: 'Yes — fully customisable. Name, colours, avatar, greeting message. It can look exactly like your brand.' },
  { q: 'Does it work on mobile?', a: 'Perfectly. Responsive on all devices. Most customer enquiries come from mobile, so we built for that first.' },
];

export default function SolutionWidget() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)', minHeight: '100vh' }}>
      <TopNav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 800px 500px at 50% 0%, rgba(91,95,255,0.06), transparent)' }} />
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold tracking-widest uppercase"
                style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.08)', border: '1px solid rgba(91,95,255,0.15)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Website Widget
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[clamp(2.4rem,5vw,3.8rem)] font-extrabold leading-[1.05] tracking-[-0.04em] mb-5"
                style={{ color: '#0A0F1E' }}>
                Your website answers customers.<br />
                <span style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  While you sleep.
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base text-gray-500 mb-8 leading-relaxed">
                Add one line of code to any website. Your AI concierge handles enquiries, bookings, and lead capture — 24/7, automatically, in your tone. Customers get instant answers. You get fewer interruptions.
              </motion.p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-3 mb-6">
                <button onClick={() => window.open('https://freemi-studio.web.app', '_blank')}
                  className="px-8 py-3.5 rounded-full text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 8px 24px rgba(91,95,255,0.3)' }}>
                  Start free trial →
                </button>
                <a href="mailto:hello@freemi.ai"
                  className="px-8 py-3.5 rounded-full text-sm font-semibold text-center"
                  style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.2)' }}>
                  Book a demo
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium">
                {['€19.99/month', 'One line of code', 'Live in 24 hours'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black text-indigo-500"
                      style={{ background: 'rgba(91,95,255,0.1)' }}>✓</span>
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right — Website preview with widget */}
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="relative">
              {/* Browser chrome */}
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.15)', border: '1px solid rgba(91,95,255,0.1)' }}>
                {/* Browser bar */}
                <div className="h-9 flex items-center gap-2 px-4" style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-3 h-5 rounded bg-white flex items-center px-2 text-[10px] text-gray-400"
                    style={{ border: '1px solid #E5E7EB' }}>
                    www.yourbusiness.com
                  </div>
                </div>
                {/* Mock website */}
                <div className="relative" style={{ background: '#FFFFFF', minHeight: 380 }}>
                  {/* Fake website header */}
                  <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md" style={{ background: '#5B5FFF' }} />
                      <span className="text-xs font-bold text-gray-700">YourBusiness</span>
                    </div>
                    <div className="flex gap-4">
                      {['Services', 'About', 'Contact'].map(l => (
                        <span key={l} className="text-[10px] text-gray-400">{l}</span>
                      ))}
                    </div>
                  </div>
                  {/* Fake website hero */}
                  <div className="px-6 py-8">
                    <div className="w-48 h-3 rounded-full bg-gray-100 mb-2" />
                    <div className="w-36 h-3 rounded-full bg-gray-100 mb-4" />
                    <div className="w-56 h-2 rounded-full bg-gray-100 mb-1.5" />
                    <div className="w-44 h-2 rounded-full bg-gray-100 mb-1.5" />
                    <div className="w-40 h-2 rounded-full bg-gray-100 mb-6" />
                    <div className="w-24 h-7 rounded-full" style={{ background: 'rgba(91,95,255,0.12)' }} />
                  </div>
                  {/* Fake services row */}
                  <div className="px-6 flex gap-3">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="flex-1 rounded-xl p-3" style={{ background: '#F9FAFB' }}>
                        <div className="w-6 h-6 rounded-lg bg-gray-200 mb-2" />
                        <div className="w-full h-2 rounded bg-gray-100 mb-1" />
                        <div className="w-3/4 h-2 rounded bg-gray-100" />
                      </div>
                    ))}
                  </div>

                  {/* Widget button — bottom right */}
                  <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
                    {/* Speech bubble */}
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 1.8, duration: 0.4, type: 'spring' }}
                      className="relative px-3 py-2 rounded-xl text-xs font-semibold shadow-lg"
                      style={{ background: 'white', color: '#5B5FFF', border: '1px solid rgba(91,95,255,0.15)', boxShadow: '0 4px 16px rgba(91,95,255,0.12)', whiteSpace: 'nowrap' }}>
                      Hi! Can I help? 👋
                      <div className="absolute -bottom-1 right-5 w-2 h-2 rotate-45" style={{ background: 'white', borderRight: '1px solid rgba(91,95,255,0.15)', borderBottom: '1px solid rgba(91,95,255,0.15)' }} />
                    </motion.div>
                    {/* The widget button itself */}
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 8px 24px rgba(91,95,255,0.4)' }}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
              {/* Chat panel floating beside */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -right-4 bottom-16 w-60 rounded-2xl overflow-hidden shadow-2xl hidden lg:block"
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="px-3 py-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)' }}>
                    <div className="w-2 h-2 rounded-full bg-white/90" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white">YourBusiness AI</div>
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      <span className="text-[8px] text-gray-500">Online</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {chatMessages.slice(0, 4).map((m, i) => (
                    <div key={i} className={`flex ${m.side === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[85%] px-2.5 py-1.5 rounded-lg text-[9px] leading-relaxed"
                        style={{
                          background: m.side === 'bot' ? 'rgba(91,95,255,0.2)' : 'rgba(255,255,255,0.07)',
                          color: m.side === 'bot' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
                          borderRadius: m.side === 'bot' ? '8px 8px 8px 2px' : '8px 8px 2px 8px',
                        }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" style={{ background: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
                style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
                What it handles
              </span>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-[-0.03em]" style={{ color: '#0A0F1E' }}>
                Everything your customers need. Nothing for you to do.
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.07}>
                <div className="p-6 rounded-2xl h-full" style={{ border: '1px solid rgba(91,95,255,0.08)', background: '#FAFBFF' }}>
                  <div className="text-2xl mb-3">{f.emoji}</div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">{f.desc}</p>
                  <p className="text-xs text-indigo-400 leading-relaxed">{f.detail}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Works for every business type */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
                style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
                Who uses it
              </span>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-[-0.03em]" style={{ color: '#0A0F1E' }}>
                Works for any service business
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <ScrollReveal key={uc.industry} delay={i * 0.06}>
                <div className="p-5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(91,95,255,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#0A0F1E' }}>{uc.industry}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{uc.example}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Embed code */}
      <section className="py-16 px-6" style={{ background: 'white' }}>
        <div className="max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-xl font-extrabold tracking-tight mb-2" style={{ color: '#0A0F1E' }}>
              One line of code. That's it.
            </h2>
            <p className="text-sm text-gray-400 mb-6">Paste this anywhere on your website. Your AI concierge goes live immediately.</p>
            <div className="rounded-xl p-5 text-left text-xs font-mono mb-4"
              style={{ background: '#0A0F1E', color: '#A5B4FC', border: '1px solid rgba(91,95,255,0.15)' }}>
              <span style={{ color: '#6B7280' }}>&lt;script</span>
              <span style={{ color: '#FCA5A5' }}> src</span>
              <span style={{ color: '#6B7280' }}>=</span>
              <span style={{ color: '#86EFAC' }}>"https://freemi.ai/widget.js"</span>
              <span style={{ color: '#FCA5A5' }}> data-widget-id</span>
              <span style={{ color: '#6B7280' }}>=</span>
              <span style={{ color: '#86EFAC' }}>"your-id"</span>
              <span style={{ color: '#6B7280' }}>&gt;&lt;/script&gt;</span>
            </div>
            <p className="text-xs text-gray-400">Works on WordPress, Squarespace, Webflow, Wix, Shopify, or any custom-built site.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-sm mx-auto text-center">
          <ScrollReveal>
            <div className="p-8 rounded-2xl bg-white" style={{ border: '1.5px solid rgba(91,95,255,0.12)', boxShadow: '0 8px 40px rgba(91,95,255,0.08)' }}>
              <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Widget plan</div>
              <div className="text-5xl font-black tracking-tight mb-1" style={{ color: '#0A0F1E' }}>€19.99</div>
              <div className="text-sm text-gray-400 mb-6">/month — cancel anytime</div>
              <div className="space-y-2.5 mb-6 text-left">
                {[
                  'AI concierge on your website',
                  'Unlimited conversations',
                  'Bookings & lead capture',
                  'Full dashboard access',
                  'Custom branding',
                  'Email support',
                  '7-day free trial',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-indigo-500"
                      style={{ background: 'rgba(91,95,255,0.1)' }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <button onClick={() => window.open('https://freemi-studio.web.app', '_blank')}
                className="w-full py-3 rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)' }}>
                Start free trial →
              </button>
              <p className="text-xs text-gray-400 mt-3">No credit card required to start</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-6" style={{ background: 'white' }}>
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <h2 className="text-xl font-extrabold tracking-tight mb-8 text-center" style={{ color: '#0A0F1E' }}>Common questions</h2>
          </ScrollReveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={faq.q} delay={i * 0.04}>
                <div className="p-5 rounded-2xl" style={{ border: '1px solid rgba(91,95,255,0.08)', background: '#FAFBFF' }}>
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
            <div className="text-center px-8 py-12 rounded-3xl"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 20px 60px rgba(91,95,255,0.28)' }}>
              <div className="flex justify-center mb-4">
                <FreemiCharacter size="sm" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
                Your website, working 24/7.
              </h2>
              <p className="text-purple-100/80 mb-8 text-sm leading-relaxed max-w-md mx-auto">
                Set up in under 24 hours. €19.99/month. Start your 7-day free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => window.open('https://freemi-studio.web.app', '_blank')}
                  className="px-8 py-3 rounded-full bg-white font-bold text-sm hover:scale-105 transition-transform"
                  style={{ color: '#5B5FFF' }}>
                  Start free trial →
                </button>
                <button onClick={() => navigate('/solutions/ai-operators')}
                  className="px-8 py-3 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all">
                  See AI Operators →
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
