import ProductPageLayout from '../../components/ProductPageLayout';
import { Globe, Palette, Bot, BarChart3, Sparkles, Shield, Zap, Code, Building2, Scissors, Stethoscope, Utensils, Dumbbell, ShoppingBag, MessageSquare, Calendar, Users } from 'lucide-react';

const StudioDemo = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[300px]">
    {/* website preview */}
    <div className="md:col-span-2 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5F3FF, #EEF2FF)', border: '1px solid rgba(123,97,255,0.1)' }}>
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex gap-4 text-[10px] text-gray-400">
          <span className="text-gray-600 border-b border-purple-400 pb-1">Home</span>
          <span>Services</span><span>About</span><span>Contact</span>
        </div>
      </div>
      <div className="p-6">
        <div className="w-20 h-2 rounded-full mb-3" style={{ background: 'rgba(123,97,255,0.15)' }} />
        <div className="w-48 h-3 rounded-full mb-2" style={{ background: 'rgba(0,0,0,0.08)' }} />
        <div className="w-36 h-3 rounded-full mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="w-24 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)' }} />
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-lg" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }} />)}
        </div>
      </div>
    </div>
    {/* chat widget */}
    <div className="rounded-xl overflow-hidden flex flex-col" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(123,97,255,0.1)' }}>
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-6 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)' }} />
        <div>
          <p className="text-[10px] text-gray-600 font-bold">AI Concierge</p>
          <p className="text-[8px] text-emerald-400">Online</p>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-2">
        <div className="bg-purple-50 rounded-xl rounded-bl-sm px-3 py-2 max-w-[85%]">
          <p className="text-[10px] text-gray-600">Hi! How can I help you today?</p>
        </div>
        <div className="bg-purple-100 rounded-xl rounded-br-sm px-3 py-2 max-w-[85%] ml-auto">
          <p className="text-[10px] text-gray-600">I'd like to book an appointment</p>
        </div>
        <div className="bg-purple-50 rounded-xl rounded-bl-sm px-3 py-2 max-w-[85%]">
          <p className="text-[10px] text-gray-600">Sure! I have openings tomorrow at 10am, 2pm, and 4pm. Which works best?</p>
        </div>
      </div>
      <div className="px-3 py-2 border-t border-white/[0.06]">
        <div className="rounded-full px-3 py-1.5 text-[9px] text-white/20" style={{ background: 'rgba(0,0,0,0.03)' }}>Type a message...</div>
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
        { icon: Scissors, title: 'Hair & Beauty', desc: 'Online bookings, service menus, AI answering questions about availability and pricing 24/7.' },
        { icon: Building2, title: 'Professional Services', desc: 'Lead qualification, consultation booking, and client intake — all handled by AI before you even pick up the phone.' },
        { icon: Stethoscope, title: 'Clinics & Healthcare', desc: 'Appointment scheduling, FAQ handling, prescription refill requests — without hiring reception staff.' },
        { icon: Utensils, title: 'Restaurants & Hospitality', desc: 'Reservation management, menu enquiries, event bookings — your AI handles it while you focus on service.' },
        { icon: Dumbbell, title: 'Fitness & Wellness', desc: 'Class bookings, membership enquiries, trainer availability — all automated through your website.' },
        { icon: ShoppingBag, title: 'Retail & E-Commerce', desc: 'Product questions, order tracking, returns handling — AI customer service that never sleeps.' },
      ]}

      price={{
        amount: '€1,500',
        period: 'one-off build',
        setup: '+ €49.99/month for AI agents, hosting & management',
        features: [
          'Professional custom website',
          'AI concierge embedded & configured',
          'Bookings, leads & enquiry handling',
          'Full analytics dashboard',
          'Ongoing hosting & management',
          'Connected to your tools (Gmail, Calendar, etc.)',
          'Unlimited content updates',
          'Mobile responsive design',
        ],
      }}

      ctaHeadline="Get a website that works for you."
      ctaSubtitle="Professional site with AI built in. Live in 48 hours. No technical knowledge needed."
    />
  );
}
