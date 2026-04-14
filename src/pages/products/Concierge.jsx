import ProductPageLayout from '../../components/ProductPageLayout';
import { MessageSquare, Brain, Clock, Paintbrush, BarChart3, Zap, Shield, Globe, Scissors, Building2, Stethoscope, Utensils, GraduationCap, ShoppingBag } from 'lucide-react';

const ConciergeDemo = () => (
  <div className="flex gap-4 min-h-[320px]">
    {/* website with widget */}
    <div className="flex-1 rounded-xl overflow-hidden hidden md:block" style={{ background: '#f8f9fe', border: '1px solid rgba(0,0,0,0.08)' }}>
      <div className="px-4 py-2 bg-white border-b border-gray-100 flex gap-3 text-[10px] text-gray-400">
        <span className="text-gray-700 font-medium">yourbusiness.com</span>
      </div>
      <div className="p-6 relative">
        <div className="w-32 h-3 rounded bg-gray-200 mb-3" />
        <div className="w-48 h-4 rounded bg-gray-300 mb-2" />
        <div className="w-40 h-4 rounded bg-gray-200 mb-8" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-lg bg-gray-100 border border-gray-200" />)}
        </div>
        {/* floating widget bubble */}
        <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2F8FFF, #1D6FD3)' }}>
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
    {/* chat window */}
    <div className="w-full md:w-80 rounded-xl overflow-hidden flex flex-col" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(47,143,255,0.12)' }}>
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2" style={{ background: 'rgba(47,143,255,0.06)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2F8FFF, #1D6FD3)' }}>
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs text-surface font-bold">AI Concierge</p>
          <p className="text-[9px] text-emerald-400">Typically replies instantly</p>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
        {[
          { from: 'ai', text: 'Hi there! 👋 Welcome to Bloom Studio. How can I help you today?' },
          { from: 'user', text: 'What are your prices for a haircut?' },
          { from: 'ai', text: 'Great question! Our haircuts start at €35 for a standard cut. We also offer:\n\n• Wash & cut — €45\n• Cut & style — €55\n• Premium experience — €75\n\nWould you like to book an appointment?' },
          { from: 'user', text: 'Yes, tomorrow afternoon if possible' },
          { from: 'ai', text: 'I have these slots available tomorrow:\n\n✅ 1:30 PM — Sarah\n✅ 3:00 PM — James\n✅ 4:30 PM — Sarah\n\nWhich would you prefer?' },
        ].map((msg, i) => (
          <div key={i} className={`max-w-[85%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed ${msg.from === 'user' ? 'ml-auto text-white' : 'text-gray-700'}`}
            style={{ background: msg.from === 'user' ? 'rgba(47,143,255,0.85)' : 'rgba(0,0,0,0.03)', borderBottomRightRadius: msg.from === 'user' ? 4 : 16, borderBottomLeftRadius: msg.from === 'ai' ? 4 : 16, whiteSpace: 'pre-line' }}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="px-3 py-2.5 border-t border-gray-100">
        <div className="rounded-full px-3 py-2 text-[10px] text-gray-300 flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.03)' }}>
          <span>Type a message...</span>
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#2F8FFF' }}>
            <span className="text-white text-[10px]">→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ProductConcierge() {
  return (
    <ProductPageLayout
      badge="Freemi Concierge"
      badgeIcon={MessageSquare}
      accentColor="#2F8FFF"
      headline="An AI That Answers"
      headlineAccent="Your Customers. 24/7."
      subtitle="One line of code. An AI concierge on your website that knows your business, answers every question, captures leads, and books appointments — automatically."
      seed={77}

      demoVisual={<ConciergeDemo />}

      stats={[
        { value: '<8s', label: 'Average response time' },
        { value: '73%', label: 'Queries auto-resolved' },
        { value: '3×', label: 'More leads captured' },
        { value: '60s', label: 'Setup time' },
      ]}

      testimonials={[
        { quote: 'Our website went from a brochure to a lead machine. The AI handles 80% of enquiries without us lifting a finger.', name: 'Anna Lopez', role: 'Owner, Glow Beauty', gradient: 'linear-gradient(135deg, #2F8FFF, #06B6D4)' },
        { quote: 'Installed it in under a minute. Within an hour it had already booked 3 appointments and answered 12 customer questions.', name: 'James Wright', role: 'Director, Wright Legal', gradient: 'linear-gradient(135deg, #7B61FF, #2F8FFF)' },
        { quote: 'We used to miss enquiries after 6pm. Now every single one gets answered. Our conversion rate doubled.', name: 'Priya Patel', role: 'Founder, FitSpace Gym', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
      ]}

      features={[
        { icon: Brain, title: 'Trained on your business', desc: 'Upload your FAQs, services, pricing, policies — your AI learns everything and answers like a team member who knows it all.', color: '#2F8FFF' },
        { icon: Clock, title: 'Works around the clock', desc: 'Never misses a customer. Handles enquiries at 3am just as well as 3pm. No shifts, no holidays, no sick days.', color: '#7B61FF' },
        { icon: Paintbrush, title: 'Matches your brand', desc: 'Fully customisable design, tone, and personality. Choose colours, avatar, greeting style — it feels like part of your site.', color: '#E84393' },
        { icon: BarChart3, title: 'Every lead captured', desc: 'Every conversation, booking request, and lead logged to your dashboard. Nothing falls through the cracks. Ever.', color: '#27C087' },
        { icon: Zap, title: 'One-line install', desc: 'Paste one script tag into your site. Works on any platform — WordPress, Shopify, Squarespace, custom builds. Done in 60 seconds.', color: '#F59E0B' },
        { icon: Shield, title: 'Smart escalation', desc: 'When the AI can\'t handle something, it captures details and escalates to you via email or Slack. You never lose a customer.', color: '#0984E3' },
      ]}

      steps={[
        { icon: Globe, title: 'Add to your website', desc: 'Paste one line of code. Works on any site — WordPress, Shopify, Wix, custom. Takes 60 seconds.' },
        { icon: Brain, title: 'Train your AI', desc: 'Upload your FAQs, services, and business info. Or we do it for you. Your AI becomes an expert on your business.' },
        { icon: MessageSquare, title: 'Customers get answered', desc: 'Live on your site 24/7. Answers questions, captures leads, books appointments. You see everything in your dashboard.' },
      ]}

      useCases={[
        { icon: Scissors, title: 'Salons & Spas', desc: 'Instant answers about services, pricing, and availability. Books appointments directly from the chat.' },
        { icon: Building2, title: 'Law & Accounting', desc: 'Qualifies potential clients, answers common legal questions, and books initial consultations.' },
        { icon: Stethoscope, title: 'Medical Clinics', desc: 'Handles appointment requests, answers insurance questions, and manages prescription refill enquiries.' },
        { icon: Utensils, title: 'Restaurants', desc: 'Takes reservation requests, answers menu questions, handles dietary enquiry and event bookings.' },
        { icon: GraduationCap, title: 'Education & Coaching', desc: 'Course enquiries, enrollment questions, schedule information — all handled instantly by AI.' },
        { icon: ShoppingBag, title: 'E-Commerce', desc: 'Product recommendations, order status, returns policy — customer service that scales with your store.' },
      ]}

      price={{
        amount: '€19.99',
        period: 'month',
        setup: 'Widget-only plan. Upgrade anytime for full AI operators.',
        features: [
          'AI chat widget on your website',
          'Trained on your business',
          'Lead capture & notification',
          'Booking integration',
          'Customisable design & tone',
          'Conversation analytics dashboard',
          'Email escalation',
          'Works on any website platform',
        ],
      }}

      ctaHeadline="Stop losing customers to silence."
      ctaSubtitle="An AI concierge on your website — answering, booking, capturing leads — all for less than a coffee a day."
    />
  );
}
