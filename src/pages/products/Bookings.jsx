import ProductPageLayout from '../../components/ProductPageLayout';
import { Calendar, Clock, RefreshCw, Bell, Smartphone, Globe, Zap, BarChart3, Scissors, Stethoscope, Dumbbell, GraduationCap, Wrench, Building2, Check, User } from 'lucide-react';

const BookingsDemo = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dates = [14, 15, 16, 17, 18, 19, 20];
  const slots = [
    { time: '9:00', name: 'Sarah M.', service: 'Haircut', color: '#7B61FF' },
    { time: '10:30', name: 'James L.', service: 'Consultation', color: '#2F8FFF' },
    { time: '11:00', name: '', service: '', color: '' },
    { time: '13:00', name: 'Priya K.', service: 'Check-up', color: '#27C087' },
    { time: '14:30', name: '', service: '', color: '' },
    { time: '16:00', name: 'Carlos B.', service: 'Follow-up', color: '#F59E0B' },
  ];
  return (
    <div className="flex flex-col md:flex-row gap-4 min-h-[300px]">
      {/* calendar view */}
      <div className="flex-1 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <p className="text-xs text-white/70 font-bold">April 2026</p>
          <div className="flex gap-2">
            <span className="text-[10px] px-2 py-1 rounded-md text-amber-400 font-bold" style={{ background: 'rgba(245,158,11,0.12)' }}>This week</span>
          </div>
        </div>
        <div className="px-4 py-2 grid grid-cols-7 gap-1 border-b border-white/[0.04]">
          {days.map((d, i) => (
            <div key={d} className="text-center">
              <p className="text-[9px] text-white/30 uppercase">{d}</p>
              <p className={`text-xs mt-0.5 font-bold ${i === 1 ? 'text-amber-400' : 'text-white/60'}`}>{dates[i]}</p>
            </div>
          ))}
        </div>
        <div className="p-3 space-y-1.5">
          {slots.map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: s.name ? 'rgba(255,255,255,0.03)' : 'transparent', border: s.name ? '1px solid rgba(255,255,255,0.04)' : '1px dashed rgba(255,255,255,0.06)' }}>
              <span className="text-[10px] text-white/40 w-10 shrink-0 font-mono">{s.time}</span>
              {s.name ? (
                <>
                  <div className="w-1.5 h-6 rounded-full shrink-0" style={{ background: s.color }} />
                  <div>
                    <p className="text-[11px] text-white/70 font-semibold">{s.name}</p>
                    <p className="text-[9px] text-white/30">{s.service}</p>
                  </div>
                </>
              ) : (
                <span className="text-[10px] text-white/15 italic">Available</span>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* booking confirmation */}
      <div className="w-full md:w-64 rounded-xl p-4 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">New Booking</p>
        <div className="flex-1 space-y-3">
          <div className="rounded-lg p-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-[10px] text-amber-400 font-bold">Confirmed via WhatsApp</p>
            <p className="text-white/70 text-xs font-semibold mt-1">Emma Johnson</p>
            <p className="text-white/40 text-[10px] mt-0.5">Dental Check-up • 45 min</p>
            <p className="text-white/40 text-[10px]">Thu 17 Apr • 2:30 PM</p>
          </div>
          <div className="space-y-2">
            {['Confirmation sent', 'Calendar synced', 'Reminder scheduled (24h)', 'Reminder scheduled (1h)'].map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-[10px] text-white/50">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[10px] text-white/30">Today's bookings</p>
          <p className="text-2xl font-extrabold text-amber-400">8</p>
          <p className="text-[9px] text-emerald-400">+3 vs yesterday</p>
        </div>
      </div>
    </div>
  );
};

export default function ProductBookings() {
  return (
    <ProductPageLayout
      badge="Freemi Bookings"
      badgeIcon={Calendar}
      accentColor="#F59E0B"
      headline="AI-Powered"
      headlineAccent="Appointments."
      subtitle="Customers book, reschedule, and cancel from any channel — website, WhatsApp, or phone. Your calendar stays perfect. No admin required."
      seed={133}

      demoVisual={<BookingsDemo />}

      stats={[
        { value: '60%', label: 'Reduction in no-shows' },
        { value: '3×', label: 'More bookings captured' },
        { value: '0', label: 'Double-bookings' },
        { value: '24/7', label: 'Booking availability' },
      ]}

      testimonials={[
        { quote: 'We used to spend 2 hours a day on phone bookings. Now the AI handles it all and our calendar is always full.', name: 'Fiona O\'Brien', role: 'Owner, Serenity Spa', gradient: 'linear-gradient(135deg, #F59E0B, #E84393)' },
        { quote: 'No-shows were killing us. Since adding WhatsApp reminders through Freemi, they dropped from 20% to under 5%.', name: 'Dr. Ravi Sharma', role: 'Sharma Dental Practice', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
        { quote: 'Customers can book at midnight, reschedule at 6am, and I never have to touch a thing. It just works.', name: 'Laura Finnegan', role: 'Founder, FlexFit Studio', gradient: 'linear-gradient(135deg, #7B61FF, #F59E0B)' },
      ]}

      features={[
        { icon: Clock, title: 'Real-time availability', desc: 'Syncs with your Google Calendar, Outlook, or any calendar. Customers only see slots you actually have free. Always accurate.', color: '#F59E0B' },
        { icon: RefreshCw, title: 'Self-service management', desc: 'Customers reschedule, cancel, or modify their own bookings via AI. No phone calls, no admin time, no back-and-forth.', color: '#7B61FF' },
        { icon: Bell, title: 'Smart reminders', desc: 'Automated confirmations and reminders via WhatsApp and email. Reduces no-shows by up to 60%. Customisable timing.', color: '#2F8FFF' },
        { icon: Smartphone, title: 'Every channel', desc: 'Customers book from your website chat, WhatsApp, or phone call. All synced to one calendar. One source of truth.', color: '#27C087' },
        { icon: Globe, title: 'Multi-service support', desc: 'Multiple service types, durations, staff members, and locations. Each with their own availability and rules.', color: '#E84393' },
        { icon: BarChart3, title: 'Booking analytics', desc: 'Track booking volume, no-show rates, popular time slots, and revenue. Data-driven decisions about your schedule.', color: '#0984E3' },
      ]}

      steps={[
        { icon: Calendar, title: 'Connect your calendar', desc: 'Link Google Calendar, Outlook, or any calendar system. We sync your existing availability automatically.' },
        { icon: Zap, title: 'Set your rules', desc: 'Define services, durations, buffer times, and availability windows. We configure your booking AI to match.' },
        { icon: Globe, title: 'Customers book anywhere', desc: 'From your website, WhatsApp, or phone call — AI handles the entire booking flow and sends confirmations.' },
      ]}

      useCases={[
        { icon: Scissors, title: 'Salons & Spas', desc: 'Service selection, stylist preference, duration-based availability — customers book their perfect appointment in seconds.' },
        { icon: Stethoscope, title: 'Medical & Dental', desc: 'Patient intake, appointment type selection, doctor availability, insurance verification — all before they walk in.' },
        { icon: Dumbbell, title: 'Fitness & PT', desc: 'Class bookings, personal training sessions, membership trials — your schedule fills itself.' },
        { icon: GraduationCap, title: 'Tutoring & Coaching', desc: 'Session booking, subject matching, recurring appointments — students and parents book without calling.' },
        { icon: Wrench, title: 'Trades & Services', desc: 'Job type selection, availability by area, estimated duration — qualified bookings before you leave the van.' },
        { icon: Building2, title: 'Consulting', desc: 'Discovery call booking, meeting type selection, timezone handling — your pipeline fills automatically.' },
      ]}

      price={{
        amount: '€49.99',
        period: 'month',
        setup: 'Included with Starter plan. AI bookings across all channels.',
        features: [
          'AI-powered booking across all channels',
          'Real-time calendar sync',
          'Automated confirmations & reminders',
          'Self-service reschedule & cancel',
          'Multi-service & multi-staff support',
          'No-show reduction (WhatsApp reminders)',
          'Booking analytics dashboard',
          'Custom availability rules',
        ],
      }}

      ctaHeadline="Your calendar, on autopilot."
      ctaSubtitle="AI handles bookings from every channel. No double-bookings. No no-shows. No admin."
    />
  );
}
