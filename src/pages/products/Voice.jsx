import ProductPageLayout from '../../components/ProductPageLayout';
import { Phone, Mic, CalendarCheck, FileText, Shield, Clock, Zap, Headphones, Pill, Wrench, Stethoscope, Utensils, Briefcase, Building2, Check, PhoneCall, PhoneOff, ArrowRight, User, ShoppingCart, AlertCircle, Info } from 'lucide-react';

const VoiceDemo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 min-h-[400px] rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
    {/* left: call list */}
    <div className="lg:col-span-2 border-r border-gray-100 bg-white">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <p className="text-xs font-bold text-gray-800">Recent Calls</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">Live</span>
      </div>
      <div className="divide-y divide-gray-50">
        {[
          { name: 'Mary O\'Brien', phone: '+353 87 123 4567', time: '2m ago', duration: '3:24', outcome: 'Order Created', outcomeColor: 'bg-emerald-50 text-emerald-700', icon: ShoppingCart, active: true },
          { name: 'Patrick Kelly', phone: '+353 86 234 5678', time: '18m ago', duration: '1:47', outcome: 'Booking', outcomeColor: 'bg-blue-50 text-blue-700', icon: CalendarCheck },
          { name: 'Siobhan Walsh', phone: '+353 85 345 6789', time: '34m ago', duration: '0:52', outcome: 'Info Only', outcomeColor: 'bg-gray-100 text-gray-600', icon: Info },
          { name: 'Declan Murphy', phone: '+353 87 456 7890', time: '1h ago', duration: '2:15', outcome: 'Escalated', outcomeColor: 'bg-red-50 text-red-600', icon: AlertCircle },
          { name: 'Aoife Ryan', phone: '+353 86 567 8901', time: '1h ago', duration: '4:02', outcome: 'Order Created', outcomeColor: 'bg-emerald-50 text-emerald-700', icon: ShoppingCart },
        ].map((call, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors"
            style={{ background: call.active ? 'rgba(123,97,255,0.04)' : 'transparent', borderLeft: call.active ? '2px solid #7B61FF' : '2px solid transparent' }}>
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-purple-600">{call.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{call.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-gray-400">{call.duration}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${call.outcomeColor}`}>{call.outcome}</span>
              </div>
            </div>
            <span className="text-[9px] text-gray-300 shrink-0">{call.time}</span>
          </div>
        ))}
      </div>
    </div>

    {/* right: transcript */}
    <div className="lg:col-span-3 bg-gray-50/50 flex flex-col">
      <div className="px-5 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-800">Mary O'Brien</p>
          <p className="text-[10px] text-gray-400">+353 87 123 4567 · 3:24 · Just now</p>
        </div>
        <div className="flex gap-2">
          <span className="text-[9px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1"><ShoppingCart className="w-2.5 h-2.5" /> Order Created</span>
          <span className="text-[9px] px-2 py-1 rounded-full bg-purple-50 text-purple-700 font-bold">Confidence: 94%</span>
        </div>
      </div>
      {/* extracted order */}
      <div className="mx-4 mt-3 rounded-lg p-3 bg-white border border-gray-100">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Extracted Order</p>
        <div className="grid grid-cols-4 gap-2 text-[10px]">
          <div><p className="text-gray-400 mb-0.5">Items</p><p className="font-semibold text-gray-700">Vitamin D3, Omega-3</p></div>
          <div><p className="text-gray-400 mb-0.5">Type</p><p className="font-semibold text-gray-700">Repeat</p></div>
          <div><p className="text-gray-400 mb-0.5">Provider</p><p className="font-semibold text-gray-700">Dr. Smith</p></div>
          <div><p className="text-gray-400 mb-0.5">Delivery</p><p className="font-semibold text-gray-700">Tomorrow</p></div>
        </div>
      </div>
      {/* transcript bubbles */}
      <div className="flex-1 p-4 space-y-2.5 overflow-y-auto">
        {[
          { role: 'ai', text: 'Good afternoon, thanks for calling Greenfield Pharmacy. How can I help you today?' },
          { role: 'caller', text: 'Hi, I\'d like to reorder my usual vitamins please.' },
          { role: 'ai', text: 'Of course, Mary! I can see your previous order — Vitamin D3 and Omega-3 Fish Oil. Shall I place the same order?' },
          { role: 'caller', text: 'Yes please, and can you deliver it tomorrow?' },
          { role: 'ai', text: 'Done! Your order is confirmed for delivery tomorrow by 2pm. You\'ll get a text when it\'s on the way. Anything else?' },
          { role: 'caller', text: 'No, that\'s perfect. Thanks!' },
        ].map((msg, i) => (
          <div key={i} className={`max-w-[80%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${msg.role === 'caller' ? 'ml-auto bg-gray-100 text-gray-700' : 'text-gray-700'}`}
            style={{ background: msg.role === 'ai' ? 'rgba(123,97,255,0.06)' : undefined, borderBottomRightRadius: msg.role === 'caller' ? 4 : 12, borderBottomLeftRadius: msg.role === 'ai' ? 4 : 12 }}>
            <span className="text-[9px] font-bold block mb-0.5" style={{ color: msg.role === 'ai' ? '#7B61FF' : '#94A3B8' }}>{msg.role === 'ai' ? 'AI Agent' : 'Caller'}</span>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-gray-100 bg-white flex items-center gap-2">
        <Check className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] text-emerald-600 font-semibold">Order synced to system · Calendar updated · Confirmation SMS sent</span>
      </div>
    </div>
  </div>
);

export default function ProductVoice() {
  return (
    <ProductPageLayout
      badge="Freemi Voice" badgeIcon={Phone} accentColor="#27C087"
      headline="An AI That Answers" headlineAccent="Every Call."
      subtitle="AI phone agent that handles enquiries, takes orders, and books appointments — even when you can't pick up. Natural conversation, not a phone tree."
      seed={99}
      demoVisual={<VoiceDemo />}
      stats={[{ value: '100%', label: 'Calls answered' }, { value: '<3s', label: 'Pickup time' }, { value: '4.8/5', label: 'Caller satisfaction' }, { value: '€0', label: 'Per call cost' }]}
      testimonials={[
        { quote: 'We were missing 40% of calls while on the job. Now every single one gets answered and I get a summary text. Game changer.', name: 'Tom Murphy', role: 'Owner, Murphy Plumbing', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
        { quote: 'Our patients love it. The AI sounds natural, books appointments perfectly, and even handles prescription refill requests.', name: 'Dr. Rachel Kim', role: 'Greenfield Dental', gradient: 'linear-gradient(135deg, #2F8FFF, #7B61FF)' },
        { quote: 'We went from 2 receptionists answering phones to zero. The AI handles it all and costs a fraction of what we were paying.', name: 'Carlo Bianchi', role: 'Manager, Bella Vista Restaurant', gradient: 'linear-gradient(135deg, #7B61FF, #E84393)' },
      ]}
      features={[
        { icon: Mic, title: 'Natural conversation', desc: 'Not a robotic IVR. Real conversational AI that sounds human, understands context, and handles multi-turn dialogue naturally.', color: '#27C087' },
        { icon: CalendarCheck, title: 'Books appointments live', desc: 'Checks your real-time calendar availability and confirms bookings on the spot. No back-and-forth needed.', color: '#7B61FF' },
        { icon: FileText, title: 'Takes orders & requests', desc: 'Prescription refills, service bookings, product orders — whatever your business needs, the AI handles it over the phone.', color: '#2F8FFF' },
        { icon: Shield, title: 'Never misses a call', desc: 'Every inbound call answered instantly. After hours, weekends, holidays — your business is always available.', color: '#E84393' },
        { icon: Clock, title: 'Instant call summaries', desc: 'Every call transcribed, summarised, and logged to your dashboard. Action items flagged automatically.', color: '#F59E0B' },
        { icon: Zap, title: 'Smart routing', desc: 'When a human is needed, the AI routes the call to the right person with full context. No cold transfers.', color: '#0984E3' },
      ]}
      steps={[
        { icon: Phone, title: 'Get your AI number', desc: 'We assign a local phone number or forward your existing one. Setup takes less than an hour.' },
        { icon: Headphones, title: 'Train your voice agent', desc: 'Tell it about your services, FAQs, booking rules, and tone. We configure everything for you.' },
        { icon: Zap, title: 'Every call answered', desc: 'Your AI handles inbound calls 24/7. Books appointments, takes orders, and sends you summaries after every call.' },
      ]}
      useCases={[
        { icon: Pill, title: 'Pharmacy', desc: 'Prescription refill requests, medication questions, delivery scheduling — all handled automatically over the phone.' },
        { icon: Wrench, title: 'Trades & Plumbing', desc: 'Job qualification, emergency call handling, appointment booking — your AI picks up while you\'re on site.' },
        { icon: Stethoscope, title: 'Medical & Clinics', desc: 'Appointment booking, triage questions, repeat prescription requests — without overloading reception.' },
        { icon: Briefcase, title: 'Professional Services', desc: 'Client screening, consultation scheduling, availability checks — first impressions handled perfectly.' },
        { icon: Utensils, title: 'Restaurants', desc: 'Reservations, menu enquiries, catering requests, event bookings — the phone never goes unanswered.' },
        { icon: Building2, title: 'Property & Real Estate', desc: 'Viewing requests, availability queries, tenant enquiries — your AI qualifies and books automatically.' },
      ]}
      ctaHeadline="Never miss a call again."
      ctaSubtitle="AI phone agent that answers, books, and reports — 24/7. No hardware needed."
    />
  );
}
