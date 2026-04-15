import ProductPageLayout from '../../components/ProductPageLayout';
import { Globe, Palette, Bot, BarChart3, Sparkles, Shield, Zap, Code, Building2, Scissors, Stethoscope, Utensils, Dumbbell, ShoppingBag, MessageSquare, Calendar, Users, Check, ArrowRight, Star, Phone, Mail } from 'lucide-react';

const StudioDemo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[380px]">
    {/* website preview — 3 cols */}
    <div className="lg:col-span-3 rounded-xl overflow-hidden" style={{ background: '#FAFBFF', border: '1px solid rgba(0,0,0,0.06)' }}>
      {/* nav */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg" style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)' }} />
          <span className="text-xs font-bold text-gray-800">Bloom Studio</span>
        </div>
        <div className="hidden md:flex gap-5 text-[11px] text-gray-400 font-medium">
          <span className="text-gray-700">Home</span><span>Services</span><span>About</span><span>Contact</span>
        </div>
        <div className="px-3 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: '#7B61FF' }}>Book Now</div>
      </div>
      {/* hero area */}
      <div className="p-5">
        <div className="rounded-xl p-6" style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.06), rgba(47,143,255,0.04))' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500 mb-2">Hair & Beauty</p>
          <p className="text-lg font-extrabold text-gray-900 leading-tight mb-1">Look your best.</p>
          <p className="text-lg font-extrabold leading-tight" style={{ color: '#7B61FF' }}>Feel your best.</p>
          <p className="text-[11px] text-gray-500 mt-2 max-w-xs">Expert stylists and AI-powered booking. Walk in or book online — we're ready.</p>
          <div className="flex gap-2 mt-3">
            <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white" style={{ background: '#7B61FF' }}>Book Appointment</div>
            <div className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-gray-500 border border-gray-200">Our Services</div>
          </div>
        </div>
        {/* services grid */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { name: 'Haircut', price: '€35', color: 'bg-purple-50', icon: '✂️' },
            { name: 'Color', price: '€75', color: 'bg-blue-50', icon: '🎨' },
            { name: 'Styling', price: '€55', color: 'bg-emerald-50', icon: '💇' },
          ].map(s => (
            <div key={s.name} className={`${s.color} rounded-lg p-3 text-center`}>
              <span className="text-lg">{s.icon}</span>
              <p className="text-[10px] font-bold text-gray-800 mt-1">{s.name}</p>
              <p className="text-[10px] text-gray-500">{s.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* AI chat widget — 2 cols */}
    <div className="lg:col-span-2 rounded-xl overflow-hidden flex flex-col" style={{ background: 'white', border: '1px solid rgba(123,97,255,0.12)' }}>
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5" style={{ background: 'rgba(123,97,255,0.03)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)' }}>
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">AI Concierge</p>
          <p className="text-[9px] text-emerald-500 font-medium">Online now</p>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
        {[
          { from: 'ai', text: 'Hi! 👋 Welcome to Bloom Studio. I can help with bookings, services, or any questions.' },
          { from: 'user', text: 'Do you have availability tomorrow afternoon?' },
          { from: 'ai', text: 'Yes! Here\'s what\'s free tomorrow:\n\n✅ 1:30 PM — Sarah\n✅ 3:00 PM — James\n✅ 4:30 PM — Sarah\n\nWhat service are you looking for?' },
          { from: 'user', text: 'Wash & cut at 3pm please' },
          { from: 'ai', text: '✅ Booked! Wash & cut with James at 3:00 PM tomorrow.\n\nConfirmation sent to your email. See you then!' },
        ].map((msg, i) => (
          <div key={i} className={`max-w-[88%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed ${msg.from === 'user' ? 'ml-auto' : ''}`}
            style={{ background: msg.from === 'user' ? 'rgba(123,97,255,0.08)' : 'rgba(0,0,0,0.03)', color: msg.from === 'user' ? '#5B3DD1' : '#374151',
              borderBottomRightRadius: msg.from === 'user' ? 4 : 16, borderBottomLeftRadius: msg.from === 'ai' ? 4 : 16, whiteSpace: 'pre-line' }}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="px-3 py-2.5 border-t border-gray-100 flex items-center gap-2">
        <div className="flex-1 rounded-full px-3 py-2 text-[10px] text-gray-300 bg-gray-50 border border-gray-100">Type a message...</div>
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#7B61FF' }}>
          <ArrowRight className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  </div>
);

export default function ProductStudio() {
  return (
    <ProductPageLayout
      badge="Freemi Studio"
      badgeIcon={Globe}
      accentColor="#7B61FF"
      headline="We Build Websites"
      headlineAccent="That Work For You."
      subtitle="Not just a website — a business with an AI team inside it from day one. We design, build, and manage everything. You just watch the customers come in."
      seed={42}
      demoVisual={<StudioDemo />}
      stats={[
        { value: '48hrs', label: 'Average delivery time' },
        { value: '97%', label: 'Client satisfaction' },
        { value: '24/7', label: 'AI availability' },
        { value: '€0', label: 'Maintenance cost' },
      ]}
      testimonials={[
        { quote: 'They built our site in 2 days and the AI was answering customers before we even announced the launch. Incredible.', name: 'Sarah Chen', role: 'Founder, Bloom Studio', gradient: 'linear-gradient(135deg, #7B61FF, #2F8FFF)' },
        { quote: 'We went from missing 30 enquiries a week to zero. The AI handles everything — bookings, questions, follow-ups.', name: 'Marcus Rivera', role: 'Owner, GreenPath Clinic', gradient: 'linear-gradient(135deg, #2F8FFF, #06B6D4)' },
        { quote: 'The dashboard alone is worth it. I can see exactly what my AI is doing, every conversation, every lead. Full visibility.', name: 'Emily Okafor', role: 'Director, Rivera Consulting', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
      ]}
      features={[
        { icon: Palette, title: 'Custom designed for you', desc: 'No templates. Every site is professionally designed to match your brand, your industry, and your goals. Mobile-first, fast, and beautiful.', color: '#7B61FF' },
        { icon: Bot, title: 'AI concierge built in', desc: 'Every site ships with an AI agent that answers customer questions, captures leads, and books appointments — 24/7, automatically.', color: '#2F8FFF' },
        { icon: Zap, title: 'Delivered in days', desc: 'From first call to live website with AI running — 1 to 2 business days. Not weeks. Not months. Days.', color: '#27C087' },
        { icon: BarChart3, title: 'Full dashboard included', desc: 'See every lead, booking, conversation, and metric from one place. Real-time visibility into how your AI is performing.', color: '#F59E0B' },
        { icon: Shield, title: 'We manage everything', desc: 'Hosting, updates, security, AI training — we handle it all forever. You never touch the tech. Just focus on your business.', color: '#E84393' },
        { icon: Code, title: 'Connected to your tools', desc: 'Gmail, Google Calendar, Slack, HubSpot, Stripe — your site connects to whatever you already use. One unified workflow.', color: '#0984E3' },
      ]}
      steps={[
        { icon: Sparkles, title: 'Tell us about your business', desc: 'A 15-minute call. Share your brand, services, and goals. We handle everything from there.' },
        { icon: Palette, title: 'We design & build your site', desc: 'Custom design, AI configuration, integrations — all done for you in 1–2 business days.' },
        { icon: Zap, title: 'Your site goes live with AI', desc: 'Professional website with AI concierge running. Customers get answered. Leads get captured. You watch from the dashboard.' },
      ]}
      useCases={[
        { icon: Scissors, title: 'Hair & Beauty', desc: 'Online bookings, service menus, AI answering questions about availability and pricing 24/7.', color: '#E84393', metric: '3× bookings', metricLabel: '24/7 AI', features: ['Online booking', 'Service menu', 'Availability checker'] },
        { icon: Building2, title: 'Professional Services', desc: 'Lead qualification, consultation booking, and client intake — all handled by AI.', color: '#7B61FF', metric: '47% more leads', metricLabel: 'Auto-qualify', features: ['Lead capture', 'Intake forms', 'Consultation booking'] },
        { icon: Stethoscope, title: 'Clinics & Healthcare', desc: 'Appointment scheduling, FAQ handling, prescription refills — without hiring reception staff.', color: '#2F8FFF', metric: '40% fewer no-shows', metricLabel: 'AI reminders', features: ['Appointments', 'Reminders', 'Patient FAQs'] },
        { icon: Utensils, title: 'Restaurants & Hospitality', desc: 'Reservation management, menu enquiries, event bookings — AI handles it while you serve.', color: '#F59E0B', metric: '100% answered', metricLabel: 'Reservations', features: ['Table booking', 'Menu queries', 'Events'] },
        { icon: Dumbbell, title: 'Fitness & Wellness', desc: 'Class bookings, membership enquiries, trainer availability — all automated through your site.', color: '#27C087', metric: '2× sign-ups', metricLabel: 'Class booking', features: ['Class schedule', 'Membership', 'Trainer booking'] },
        { icon: ShoppingBag, title: 'Retail & E-Commerce', desc: 'Product questions, order tracking, returns handling — AI customer service that never sleeps.', color: '#0984E3', metric: '80% auto-resolved', metricLabel: 'Support', features: ['Product Q&A', 'Order tracking', 'Returns'] },
      ]}
      price={{ amount: '€1,500', period: 'one-off build', setup: '+ €49.99/month for AI agents, hosting & management', features: ['Professional custom website', 'AI concierge embedded & configured', 'Bookings, leads & enquiry handling', 'Full analytics dashboard', 'Ongoing hosting & management', 'Connected to your tools (Gmail, Calendar, etc.)', 'Unlimited content updates', 'Mobile responsive design'] }}
      ctaHeadline="Get a website that works for you."
      ctaSubtitle="Professional site with AI built in. Live in 48 hours. No technical knowledge needed."
    />
  );
}
