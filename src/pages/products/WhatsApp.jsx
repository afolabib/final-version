import ProductPageLayout from '../../components/ProductPageLayout';
import { Send, MessageCircle, ShoppingBag, Clock, Zap, Users, Bell, Globe, Pill, Scissors, Stethoscope, Utensils, Building2, GraduationCap, Bot, Check, ArrowRight, Phone, Star, Package, RefreshCw } from 'lucide-react';

const WhatsAppDemo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 min-h-[420px] rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
    {/* left: WhatsApp conversation list */}
    <div className="lg:col-span-2 bg-white border-r border-gray-100">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between" style={{ background: 'rgba(37,211,102,0.04)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#25D366' }}>
            <Send className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-gray-800">WhatsApp Business</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">AI Active</span>
      </div>
      <div className="divide-y divide-gray-50">
        {[
          { name: 'Sarah Mitchell', msg: '✅ Order confirmed! Delivery tomorrow by 2pm.', time: '2m', unread: 0, avatar: 'SM', color: 'bg-purple-100 text-purple-600' },
          { name: 'Ahmed Hassan', msg: 'Can I get my usual prescription refill?', time: '8m', unread: 1, avatar: 'AH', color: 'bg-blue-100 text-blue-600' },
          { name: 'Emma Johnson', msg: 'Thanks for the appointment reminder! 👍', time: '23m', unread: 0, avatar: 'EJ', color: 'bg-emerald-100 text-emerald-600' },
          { name: 'Patrick O\'Brien', msg: 'What time do you close today?', time: '45m', unread: 1, avatar: 'PO', color: 'bg-amber-100 text-amber-600' },
          { name: 'Lisa Chen', msg: 'Order #847 — can I add vitamin C?', time: '1h', unread: 0, avatar: 'LC', color: 'bg-pink-100 text-pink-600' },
          { name: 'David Kelly', msg: '📦 Tracking: Your order is on the way!', time: '2h', unread: 0, avatar: 'DK', color: 'bg-gray-100 text-gray-600' },
        ].map((c, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
            style={i === 0 ? { background: 'rgba(37,211,102,0.03)', borderLeft: '2px solid #25D366' } : { borderLeft: '2px solid transparent' }}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${c.color}`}>
              <span className="text-[10px] font-bold">{c.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-gray-800 truncate">{c.name}</p>
                <span className="text-[9px] text-gray-300 shrink-0">{c.time}</span>
              </div>
              <p className="text-[10px] text-gray-400 truncate mt-0.5">{c.msg}</p>
            </div>
            {c.unread > 0 && <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0" style={{ background: '#25D366' }}>{c.unread}</div>}
          </div>
        ))}
      </div>
    </div>

    {/* right: active conversation */}
    <div className="lg:col-span-3 bg-gray-50/30 flex flex-col">
      <div className="px-5 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="text-[10px] font-bold text-purple-600">SM</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-800">Sarah Mitchell</p>
          <p className="text-[9px] text-gray-400">+353 87 123 4567</p>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">Order Created</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-bold">Repeat Customer</span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-2.5 overflow-y-auto">
        {[
          { from: 'ai', text: 'Hi Sarah! 👋 Welcome back to Greenfield Pharmacy. How can I help you today?' },
          { from: 'user', text: 'I\'d like to reorder my usual please' },
          { from: 'ai', text: 'Of course! I found your last order:\n\n• Vitamin D3 (60 caps) — €12.50\n• Omega-3 Fish Oil — €18.00\n• Multivitamin Pack — €14.00\n\nTotal: €44.50\n\nShall I place this for delivery?' },
          { from: 'user', text: 'Yes, tomorrow delivery please' },
          { from: 'ai', text: '✅ Order confirmed!\n\n📦 Delivery: Tomorrow by 2pm\n💳 Payment: Card ending 4821\n\nYou\'ll get a tracking link when it ships. Anything else I can help with?' },
          { from: 'user', text: 'That\'s perfect, thanks!' },
          { from: 'ai', text: 'You\'re welcome, Sarah! Have a great day 😊' },
        ].map((msg, i) => (
          <div key={i} className={`max-w-[80%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${msg.from === 'user' ? 'ml-auto' : ''}`}
            style={{ background: msg.from === 'user' ? 'rgba(37,211,102,0.1)' : 'white', color: '#374151', border: msg.from === 'ai' ? '1px solid rgba(0,0,0,0.04)' : 'none',
              borderBottomRightRadius: msg.from === 'user' ? 4 : 12, borderBottomLeftRadius: msg.from === 'ai' ? 4 : 12, whiteSpace: 'pre-line' }}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="px-4 py-2.5 bg-white border-t border-gray-100 flex items-center gap-2">
        <Check className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] text-emerald-600 font-semibold">Order synced · Payment processed · Delivery scheduled · Customer updated</span>
      </div>
    </div>
  </div>
);

export default function ProductWhatsApp() {
  return (
    <ProductPageLayout
      badge="Freemi WhatsApp" badgeIcon={Send} accentColor="#25D366"
      headline="Your AI Agent" headlineAccent="On WhatsApp."
      subtitle="AI WhatsApp agent that auto-replies, handles orders, answers questions, and manages full conversations — like texting a real person who never sleeps."
      seed={111}
      demoVisual={<WhatsAppDemo />}
      stats={[{ value: '2B+', label: 'WhatsApp users worldwide' }, { value: '4s', label: 'Average response time' }, { value: '89%', label: 'Auto-resolution rate' }, { value: '24/7', label: 'Always available' }]}
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
