import ProductPageLayout from '../../components/ProductPageLayout';
import { Building2, Calendar, Utensils, Star, Clock, Zap, Bell, Phone, Globe, Check, Wine, Bed, MapPin, CreditCard, Coffee, Users } from 'lucide-react';

const Demo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[360px] rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
    <div className="lg:col-span-2 bg-white border-r border-gray-100">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-gray-800">Reservations</span></div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold">Tonight: 42 covers</span>
      </div>
      <div className="p-4 space-y-2">
        {[
          { time: '18:00', name: 'Johnson Party', guests: 4, notes: 'Anniversary — window table' },
          { time: '18:30', name: 'Chen Family', guests: 6, notes: 'Gluten-free' },
          { time: '19:00', name: 'O\'Brien', guests: 2, notes: 'First visit' },
          { time: '19:30', name: 'Rivera Ltd', guests: 12, notes: 'Corporate set menu' },
          { time: '20:00', name: 'Murphy', guests: 3, notes: 'Regular — usual table' },
        ].map(r => (
          <div key={r.time} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-50">
            <span className="text-[10px] text-gray-400 font-mono w-10 shrink-0">{r.time}</span>
            <div className="flex-1"><p className="text-[11px] font-semibold text-gray-800">{r.name} <span className="text-gray-400">· {r.guests}p</span></p><p className="text-[9px] text-gray-400">{r.notes}</p></div>
            <span className="text-[8px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-600">Confirmed</span>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-gray-50/50 p-4 flex flex-col gap-3">
      <div className="rounded-xl p-3 bg-white border border-gray-100">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">WhatsApp Booking</p>
        <div className="rounded-lg p-2.5 text-[10px] text-gray-600 mb-2" style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.1)' }}>"Table for 4 Saturday 7:30pm?"</div>
        <div className="rounded-lg p-2.5 text-[10px]" style={{ background: 'rgba(123,97,255,0.04)', border: '1px solid rgba(123,97,255,0.08)' }}><span className="text-[8px] font-bold text-purple-500">AI:</span><p className="text-gray-600 mt-0.5">Reserved! Table for 4, Sat 7:30 PM. Confirmation sent. Dietary needs? ✓</p></div>
      </div>
      <div className="rounded-xl p-3 bg-white border border-gray-100 flex-1">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Today's AI activity</p>
        {['12 reservations booked', '8 menu enquiries answered', '4 event bookings', '3 dietary questions handled'].map(t => (
          <div key={t} className="flex items-center gap-2 py-1"><Check className="w-3 h-3 text-emerald-500 shrink-0" /><span className="text-[9px] text-gray-600">{t}</span></div>
        ))}
      </div>
    </div>
  </div>
);

export default function Hospitality() {
  return (
    <ProductPageLayout badge="Hospitality" badgeIcon={Building2} accentColor="#F59E0B"
      headline="Your Restaurant" headlineAccent="On Autopilot."
      subtitle="AI agents that handle reservations, menu enquiries, event bookings, and guest communication — so your team focuses on delivering exceptional experiences."
      seed={190} demoVisual={<Demo />}
      stats={[{ value: '3×', label: 'More bookings' }, { value: '45%', label: 'Fewer phone calls' }, { value: '4.8★', label: 'Guest satisfaction' }, { value: '24/7', label: 'Booking availability' }]}
      testimonials={[
        { quote: 'We missed 30% of calls during service. Now every reservation request is handled instantly by AI.', name: 'Carlo Bianchi', role: 'Owner, Bella Vista', gradient: 'linear-gradient(135deg, #F59E0B, #E84393)' },
        { quote: 'Event bookings tripled since we added WhatsApp. Customers love booking a table at midnight.', name: 'Sophie Laurent', role: 'Manager, Le Petit Bistro', gradient: 'linear-gradient(135deg, #7B61FF, #2F8FFF)' },
        { quote: 'The AI knows our menu better than half the staff. Dietary questions, recommendations, bookings — all handled.', name: 'David Kim', role: 'GM, Seoul Kitchen', gradient: 'linear-gradient(135deg, #27C087, #F59E0B)' },
      ]}
      features={[
        { icon: Calendar, title: 'Smart reservations', desc: 'Real-time table availability, party size management, and automated confirmations across website, WhatsApp, and phone.', color: '#F59E0B' },
        { icon: Utensils, title: 'Menu & dietary handling', desc: 'AI answers menu questions, handles allergies, recommends dishes, and shares daily specials automatically.', color: '#E84393' },
        { icon: Wine, title: 'Events & private dining', desc: 'Group bookings, set menus, event enquiries — AI qualifies, sends options, confirms. No email ping-pong.', color: '#7B61FF' },
        { icon: Star, title: 'Guest recognition', desc: 'Remember regulars, preferences, special occasions. AI personalises every interaction based on visit history.', color: '#27C087' },
        { icon: Phone, title: 'Every call answered', desc: 'AI picks up during service, takes reservations, answers questions. Only escalates when truly needed.', color: '#2F8FFF' },
        { icon: Bell, title: 'Reminder system', desc: 'Confirmations and reminders via WhatsApp reduce no-shows by 50%. Waitlisted guests notified instantly.', color: '#0984E3' },
      ]}
      steps={[
        { icon: Building2, title: 'Tell us about your venue', desc: 'Share your table layout, hours, menu, and booking preferences.' },
        { icon: Globe, title: 'AI goes live everywhere', desc: 'Website, WhatsApp, phone — AI handles reservations and guest enquiries on all channels.' },
        { icon: Zap, title: 'Focus on your guests', desc: 'AI manages bookings. Your team delivers unforgettable experiences.' },
      ]}
      useCases={[
        { icon: Utensils, title: 'Fine Dining', desc: 'Reservation management, wine pairing suggestions, special occasions, VIP recognition.', color: '#E84393', metric: '3×', metricLabel: 'Bookings', features: ['Reservations', 'Wine Pairing', 'VIP'] },
        { icon: Coffee, title: 'Cafés', desc: 'Table bookings, daily specials, loyalty programmes, takeaway orders.', color: '#7B61FF', metric: '45%', metricLabel: 'Fewer calls', features: ['Specials', 'Loyalty', 'Takeaway'] },
        { icon: Wine, title: 'Bars & Nightlife', desc: 'Table reservations, event promotion, guest lists, bottle service.', color: '#2F8FFF', metric: '24/7', metricLabel: 'Booking', features: ['Guest Lists', 'Events', 'Bottle Service'] },
        { icon: Bed, title: 'Hotels & B&Bs', desc: 'Room availability, concierge services, check-in instructions, local tips.', color: '#27C087', metric: '89%', metricLabel: 'Auto-resolved', features: ['Rooms', 'Concierge', 'Check-in'] },
        { icon: MapPin, title: 'Tourist Attractions', desc: 'Ticket enquiries, group bookings, accessibility info, multi-language support.', color: '#F59E0B', metric: '4s', metricLabel: 'Response', features: ['Tickets', 'Groups', 'Multi-lang'] },
        { icon: CreditCard, title: 'Catering', desc: 'Quote requests, menu selection, capacity planning, event coordination.', color: '#0984E3', metric: '60%', metricLabel: 'Less admin', features: ['Quotes', 'Menus', 'Events'] },
      ]}
      ctaHeadline="Fill every table. Answer every call."
      ctaSubtitle="AI agents for hospitality — reservations, events, and guest service on autopilot."
    />
  );
}
