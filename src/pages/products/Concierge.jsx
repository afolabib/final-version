import ProductPageLayout from '../../components/ProductPageLayout';
import { MessageSquare, Brain, Clock, Paintbrush, BarChart3, Zap, Shield, Globe, Scissors, Building2, Stethoscope, Utensils, GraduationCap, ShoppingBag, ArrowRight, Bot, Star, Phone, Mail, Calendar, Check } from 'lucide-react';

const ConciergeDemo = () => (
  <div className="relative min-h-[420px] rounded-xl overflow-hidden" style={{ background: '#FAFBFF', border: '1px solid rgba(0,0,0,0.06)' }}>
    {/* browser chrome */}
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-100">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
      </div>
      <div className="flex-1 flex justify-center">
        <div className="px-4 py-1 rounded-md text-[10px] text-gray-400 bg-gray-50 border border-gray-100 font-mono">yourbusiness.com</div>
      </div>
    </div>

    {/* website content */}
    <div className="p-6">
      {/* nav */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500" />
          <span className="text-xs font-bold text-gray-800">GreenPath Clinic</span>
        </div>
        <div className="hidden md:flex gap-5 text-[10px] text-gray-400 font-medium">
          <span className="text-gray-700">Home</span><span>Services</span><span>Team</span><span>Contact</span>
        </div>
        <div className="px-3 py-1 rounded-full text-[9px] font-bold text-white bg-emerald-500">Book Now</div>
      </div>

      {/* hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 mb-2">Healthcare & Wellness</p>
          <p className="text-xl font-extrabold text-gray-900 leading-tight">Your health,</p>
          <p className="text-xl font-extrabold text-emerald-500 leading-tight">our priority.</p>
          <p className="text-[11px] text-gray-500 mt-3 leading-relaxed max-w-xs">Expert care with AI-powered booking and instant answers. Open 24/7 online.</p>
          <div className="flex gap-2 mt-4">
            <div className="px-3 py-1.5 rounded-lg text-[9px] font-bold text-white bg-emerald-500">Book Consultation</div>
            <div className="px-3 py-1.5 rounded-lg text-[9px] font-medium text-gray-500 border border-gray-200">Our Services</div>
          </div>
        </div>
        <div className="hidden md:block">
          {/* services cards */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'General Check-up', time: '30 min', price: '€60', color: 'bg-emerald-50', border: 'border-emerald-100' },
              { name: 'Dental Cleaning', time: '45 min', price: '€85', color: 'bg-blue-50', border: 'border-blue-100' },
              { name: 'Physio Session', time: '60 min', price: '€75', color: 'bg-purple-50', border: 'border-purple-100' },
              { name: 'Skin Consultation', time: '20 min', price: '€45', color: 'bg-amber-50', border: 'border-amber-100' },
            ].map(s => (
              <div key={s.name} className={`${s.color} ${s.border} border rounded-lg p-2.5`}>
                <p className="text-[10px] font-bold text-gray-800">{s.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[8px] text-gray-400">{s.time}</span>
                  <span className="text-[9px] font-bold text-gray-600">{s.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* trust strip */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100">
        {['4.9★ Google Reviews', '2,400+ patients', 'AI-powered booking'].map(t => (
          <span key={t} className="text-[9px] text-gray-400 font-medium">{t}</span>
        ))}
      </div>
    </div>

    {/* Freemi character widget — bottom right */}
    <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
      {/* chat popup */}
      <div className="w-72 rounded-2xl overflow-hidden shadow-xl" style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'white' }}>
        <div className="px-4 py-2.5 flex items-center gap-2.5" style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)' }}>
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white">AI Concierge</p>
            <p className="text-[8px] text-white/60">Typically replies instantly</p>
          </div>
        </div>
        <div className="p-3 space-y-2 max-h-[180px] overflow-y-auto">
          {[
            { from: 'ai', text: 'Hi! 👋 I can help you book an appointment, check availability, or answer any questions.' },
            { from: 'user', text: 'Is Dr. Smith available this week?' },
            { from: 'ai', text: 'Yes! Dr. Smith has these slots:\n\n✅ Wed 16 Apr — 10:00 AM\n✅ Thu 17 Apr — 2:30 PM\n✅ Fri 18 Apr — 11:00 AM\n\nWould you like to book one?' },
          ].map((msg, i) => (
            <div key={i} className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-[10px] leading-relaxed ${msg.from === 'user' ? 'ml-auto' : ''}`}
              style={{ background: msg.from === 'user' ? 'rgba(123,97,255,0.08)' : 'rgba(0,0,0,0.03)', color: msg.from === 'user' ? '#5B3DD1' : '#374151',
                borderBottomRightRadius: msg.from === 'user' ? 4 : 12, borderBottomLeftRadius: msg.from === 'ai' ? 4 : 12, whiteSpace: 'pre-line' }}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="px-3 py-2 border-t border-gray-100 flex items-center gap-2">
          <div className="flex-1 rounded-full px-3 py-1.5 text-[9px] text-gray-300 bg-gray-50 border border-gray-100">Type a message...</div>
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#7B61FF' }}>
            <ArrowRight className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>

      {/* Freemi character bubble */}
      <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 8px 24px rgba(123,97,255,0.4)' }}>
        <div className="relative">
          {/* simple freemi face */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div className="w-2 h-2 rounded-full bg-white/90" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ProductConcierge() {
  return (
    <ProductPageLayout
      badge="Freemi Concierge" badgeIcon={MessageSquare} accentColor="#2F8FFF"
      headline="An AI That Answers" headlineAccent="Your Customers. 24/7."
      subtitle="One line of code. An AI concierge on your website that knows your business, answers every question, captures leads, and books appointments — automatically."
      seed={77}
      demoVisual={<ConciergeDemo />}
      stats={[{ value: '<8s', label: 'Average response time' }, { value: '73%', label: 'Queries auto-resolved' }, { value: '3×', label: 'More leads captured' }, { value: '60s', label: 'Setup time' }]}
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
      price={{ amount: '€19.99', period: 'month', setup: 'Widget-only plan. Upgrade anytime for full AI operators.', features: ['AI chat widget on your website', 'Trained on your business', 'Lead capture & notification', 'Booking integration', 'Customisable design & tone', 'Conversation analytics dashboard', 'Email escalation', 'Works on any website platform'] }}
      ctaHeadline="Stop losing customers to silence."
      ctaSubtitle="An AI concierge on your website — answering, booking, capturing leads — all for less than a coffee a day."
    />
  );
}
