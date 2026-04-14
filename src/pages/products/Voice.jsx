import ProductPageLayout from '../../components/ProductPageLayout';
import { Phone, Mic, CalendarCheck, FileText, Shield, Clock, Zap, Headphones, Pill, Wrench, Stethoscope, Utensils, Briefcase, Building2 } from 'lucide-react';

const VoiceDemo = () => (
  <div className="flex flex-col md:flex-row gap-4 min-h-[300px]">
    {/* phone UI */}
    <div className="w-full md:w-64 mx-auto rounded-[2rem] p-4 flex flex-col items-center" style={{ background: 'linear-gradient(180deg, #0d1f2d, #0a1520)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-[9px] text-white/30 mb-4">Incoming Call</p>
      <div className="w-16 h-16 rounded-full mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #27C087, #1FA370)', boxShadow: '0 0 30px rgba(39,192,135,0.3)' }}>
        <Phone className="w-7 h-7 text-white" />
      </div>
      <p className="text-white font-bold text-sm">+353 1 234 5678</p>
      <p className="text-emerald-400 text-[10px] mt-1 animate-pulse">AI answering...</p>
      <div className="mt-4 flex gap-6">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"><Phone className="w-4 h-4 text-red-400 rotate-[135deg]" /></div>
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"><Mic className="w-4 h-4 text-emerald-400" /></div>
      </div>
    </div>
    {/* transcript */}
    <div className="flex-1 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-4">Live Transcript</p>
      <div className="space-y-3">
        {[
          { speaker: 'AI', text: 'Good afternoon, thanks for calling Greenfield Dental. How can I help you today?', color: '#27C087' },
          { speaker: 'Caller', text: 'Hi, I\'d like to book a check-up appointment please.', color: '#94A3B8' },
          { speaker: 'AI', text: 'Of course! I can see we have availability this Thursday at 10am or Friday at 2pm. Would either of those work?', color: '#27C087' },
          { speaker: 'Caller', text: 'Thursday at 10 works perfectly.', color: '#94A3B8' },
          { speaker: 'AI', text: 'Great, I\'ve booked you in for Thursday at 10am with Dr. Smith. You\'ll receive a confirmation text shortly. Is there anything else I can help with?', color: '#27C087' },
        ].map((line, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-[10px] font-bold shrink-0 w-12" style={{ color: line.color }}>{line.speaker}</span>
            <span className="text-[11px] text-white/60 leading-relaxed">{line.text}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] text-emerald-400 font-semibold">Booking confirmed → synced to Google Calendar</span>
      </div>
    </div>
  </div>
);

export default function ProductVoice() {
  return (
    <ProductPageLayout
      badge="Freemi Voice"
      badgeIcon={Phone}
      accentColor="#27C087"
      headline="An AI That Answers"
      headlineAccent="Every Call."
      subtitle="AI phone agent that handles enquiries, takes orders, and books appointments — even when you can't pick up. Natural conversation, not a phone tree."
      seed={99}

      demoVisual={<VoiceDemo />}

      stats={[
        { value: '100%', label: 'Calls answered' },
        { value: '<3s', label: 'Pickup time' },
        { value: '4.8/5', label: 'Caller satisfaction' },
        { value: '€0', label: 'Per call cost' },
      ]}

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
