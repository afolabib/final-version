import ProductPageLayout from '../../components/ProductPageLayout';
import { Send, MessageCircle, ShoppingBag, Clock, Zap, Users, Bell, Globe, Pill, Scissors, Stethoscope, Utensils, Building2, GraduationCap, Bot, Check } from 'lucide-react';

const WhatsAppDemo = () => (
  <div className="flex flex-col md:flex-row gap-4 min-h-[340px]">
    {/* WhatsApp phone */}
    <div className="w-full md:w-72 mx-auto rounded-[2rem] overflow-hidden flex flex-col" style={{ background: '#0B1520', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-4 py-2 flex items-center justify-between text-[10px] text-white/40">
        <span>9:41</span><span className="flex gap-1"><span className="w-3 h-2 rounded-sm bg-white/20" /><span className="w-4 h-2 rounded-sm bg-emerald-400/50" /></span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(37,211,102,0.08)' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}>
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div><p className="text-white text-[11px] font-bold">Your Business</p><p className="text-[8px] text-emerald-400">AI Agent • online</p></div>
      </div>
      <div className="flex-1 p-2.5 space-y-2 overflow-y-auto" style={{ background: '#0a1118' }}>
        {[
          { from: 'ai', text: 'Hi! 👋 Welcome. I can help with:\n\n📦 Place an order\n📅 Book an appointment\n❓ Ask a question\n\nWhat would you like to do?' },
          { from: 'user', text: 'I want to order the usual please' },
          { from: 'ai', text: 'Sure! I found your last order:\n\n• Vitamin D3 (60 caps)\n• Omega-3 Fish Oil\n• Multivitamin Pack\n\nTotal: €42.50\n\nShall I place this order for delivery?' },
          { from: 'user', text: 'Yes please' },
          { from: 'ai', text: '✅ Order confirmed!\n\nDelivery: Tomorrow by 2pm\nPayment: Card ending 4821\n\nYou\'ll get a tracking link when it ships.' },
        ].map((msg, i) => (
          <div key={i} className={`max-w-[88%] px-2.5 py-1.5 rounded-xl text-[10px] leading-relaxed ${msg.from === 'user' ? 'ml-auto text-white' : 'text-white/80'}`}
            style={{ background: msg.from === 'user' ? 'rgba(37,211,102,0.4)' : 'rgba(255,255,255,0.06)', whiteSpace: 'pre-line',
              borderBottomRightRadius: msg.from === 'user' ? 4 : 12, borderBottomLeftRadius: msg.from === 'ai' ? 4 : 12 }}>
            {msg.text}
          </div>
        ))}
      </div>
    </div>
    {/* analytics panel */}
    <div className="flex-1 rounded-xl p-4 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">WhatsApp Performance</p>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {[
          { label: 'Messages Today', value: '247', color: '#25D366' },
          { label: 'Auto-Resolved', value: '89%', color: '#2F8FFF' },
          { label: 'Orders Placed', value: '18', color: '#F59E0B' },
          { label: 'Avg Response', value: '4s', color: '#7B61FF' },
        ].map(s => (
          <div key={s.label} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-[9px] text-white/30 uppercase">{s.label}</p>
            <p className="text-xl font-extrabold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg p-3 flex items-center gap-2" style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.15)' }}>
        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-[10px] text-emerald-400 font-semibold">All conversations synced to CRM</span>
      </div>
    </div>
  </div>
);

export default function ProductWhatsApp() {
  return (
    <ProductPageLayout
      badge="Freemi WhatsApp"
      badgeIcon={Send}
      accentColor="#25D366"
      headline="Your AI Agent"
      headlineAccent="On WhatsApp."
      subtitle="AI WhatsApp agent that auto-replies, handles orders, answers questions, and manages full conversations — like texting a real person who never sleeps."
      seed={111}

      demoVisual={<WhatsAppDemo />}

      stats={[
        { value: '2B+', label: 'WhatsApp users worldwide' },
        { value: '4s', label: 'Average response time' },
        { value: '89%', label: 'Auto-resolution rate' },
        { value: '24/7', label: 'Always available' },
      ]}

      testimonials={[
        { quote: 'Our customers love ordering through WhatsApp. The AI handles 90% of orders without any human involvement. Revenue up 40%.', name: 'Ahmed Hassan', role: 'Owner, Medina Pharmacy', gradient: 'linear-gradient(135deg, #25D366, #128C7E)' },
        { quote: 'We send appointment reminders via WhatsApp now. No-shows dropped from 25% to 6%. The ROI is insane.', name: 'Lisa Brennan', role: 'Manager, Glow Aesthetics', gradient: 'linear-gradient(135deg, #7B61FF, #E84393)' },
        { quote: 'Customers text us at all hours. Before, we missed everything after 6pm. Now every message gets a perfect response in seconds.', name: 'David Okoye', role: 'Founder, FreshBox Delivery', gradient: 'linear-gradient(135deg, #F59E0B, #27C087)' },
      ]}

      features={[
        { icon: MessageCircle, title: 'Natural conversations', desc: 'Replies that feel human. Understands context, handles follow-ups, switches topics naturally. Your customers won\'t know it\'s AI.', color: '#25D366' },
        { icon: ShoppingBag, title: 'Handles orders & requests', desc: 'Customers place orders, check status, request refunds, and manage their account — all through WhatsApp chat.', color: '#7B61FF' },
        { icon: Clock, title: 'Instant replies 24/7', desc: 'No customer left waiting. Auto-replies in seconds, any time of day or night. Average response time under 8 seconds.', color: '#2F8FFF' },
        { icon: Zap, title: 'Connected to everything', desc: 'Syncs with your CRM, calendar, inventory, and payment system. Real actions, not just answers.', color: '#F59E0B' },
        { icon: Users, title: 'Broadcast & campaigns', desc: 'Send promotions, updates, and reminders to customer segments. AI personalises each message based on history.', color: '#E84393' },
        { icon: Bell, title: 'Smart notifications', desc: 'Appointment reminders, order updates, payment confirmations — all sent automatically via WhatsApp.', color: '#0984E3' },
      ]}

      steps={[
        { icon: Send, title: 'Connect your WhatsApp', desc: 'Link your WhatsApp Business number. We handle the API setup and verification for you.' },
        { icon: Globe, title: 'Train your AI agent', desc: 'Configure responses, FAQs, order flows, and booking rules. Your AI learns your business inside and out.' },
        { icon: Zap, title: 'Customers get instant replies', desc: 'Every WhatsApp message answered automatically. Orders processed, bookings confirmed, questions resolved.' },
      ]}

      useCases={[
        { icon: Pill, title: 'Pharmacy', desc: 'Prescription orders via WhatsApp, medication reminders, refill requests, delivery tracking — all automated.' },
        { icon: Scissors, title: 'Salons & Beauty', desc: 'Appointment booking, rescheduling, service enquiries, and promotional offers — direct to customers\' phones.' },
        { icon: Stethoscope, title: 'Healthcare', desc: 'Appointment confirmations, test result notifications, prescription reminders — HIPAA-aware responses.' },
        { icon: Utensils, title: 'Food & Delivery', desc: 'Order taking, delivery updates, menu sharing, and customer feedback — the full ordering experience on WhatsApp.' },
        { icon: Building2, title: 'Real Estate', desc: 'Property enquiries, viewing bookings, document sharing, and follow-up sequences — all via chat.' },
        { icon: GraduationCap, title: 'Education', desc: 'Enrollment enquiries, class schedules, assignment reminders, and parent communication — automated.' },
      ]}

      ctaHeadline="Meet your customers where they are."
      ctaSubtitle="2 billion people use WhatsApp. Your AI agent is ready to talk to all of them."
    />
  );
}
