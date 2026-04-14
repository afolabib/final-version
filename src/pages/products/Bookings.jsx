import ProductPageLayout from '../../components/ProductPageLayout';
import { Calendar, Clock, RefreshCw, Bell, Smartphone, Globe, Zap, BarChart3, Scissors, Stethoscope, Dumbbell, GraduationCap, Wrench, Building2, Check, User, ChevronLeft, ChevronRight } from 'lucide-react';

const BookingsDemo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[400px] rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
    {/* calendar view — 2 cols */}
    <div className="lg:col-span-2 bg-white border-r border-gray-100">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-gray-800">Bookings</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(245,158,11,0.1)', color: '#D97706' }}>This Week</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center cursor-pointer"><ChevronLeft className="w-3 h-3 text-gray-400" /></div>
          <span className="text-xs font-semibold text-gray-700 px-2">14 – 20 Apr 2026</span>
          <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center cursor-pointer"><ChevronRight className="w-3 h-3 text-gray-400" /></div>
        </div>
      </div>
      {/* day headers */}
      <div className="grid grid-cols-7 border-b border-gray-50">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
          <div key={d} className="text-center py-2 border-r border-gray-50 last:border-r-0">
            <p className="text-[9px] text-gray-400 uppercase font-semibold">{d}</p>
            <p className={`text-xs font-bold mt-0.5 ${i === 1 ? 'w-5 h-5 rounded-full flex items-center justify-center mx-auto text-white' : 'text-gray-600'}`}
              style={i === 1 ? { background: '#F59E0B' } : {}}>
              {14 + i}
            </p>
          </div>
        ))}
      </div>
      {/* time slots */}
      <div className="divide-y divide-gray-50">
        {[
          { time: '09:00', slots: [{ name: 'Sarah M.', service: 'Check-up', color: '#7B61FF' }, null, { name: 'David K.', service: 'Consultation', color: '#2F8FFF' }, null, { name: 'Lisa B.', service: 'Follow-up', color: '#27C087' }, null, null] },
          { time: '10:30', slots: [null, { name: 'James L.', service: 'Haircut', color: '#E84393' }, null, { name: 'Emma J.', service: 'Dental', color: '#7B61FF' }, null, null, null] },
          { time: '13:00', slots: [{ name: 'Priya K.', service: 'PT Session', color: '#F59E0B' }, null, null, { name: 'Carlos B.', service: 'Massage', color: '#27C087' }, { name: 'Anna R.', service: 'Facial', color: '#E84393' }, null, null] },
          { time: '14:30', slots: [null, { name: 'Tom M.', service: 'Review', color: '#2F8FFF' }, null, null, null, null, null] },
          { time: '16:00', slots: [{ name: 'Aoife R.', service: 'Styling', color: '#E84393' }, null, { name: 'Niamh F.', service: 'Colour', color: '#7B61FF' }, null, { name: 'Mark S.', service: 'Trim', color: '#F59E0B' }, null, null] },
        ].map((row) => (
          <div key={row.time} className="grid grid-cols-7">
            {row.slots.map((slot, j) => (
              <div key={j} className="h-14 border-r border-gray-50 last:border-r-0 relative p-0.5">
                {j === 0 && <span className="absolute -left-0 top-1 text-[8px] text-gray-300 font-mono pl-1">{row.time}</span>}
                {slot ? (
                  <div className="h-full rounded-md px-1.5 py-1 overflow-hidden" style={{ background: `${slot.color}08`, borderLeft: `2px solid ${slot.color}` }}>
                    <p className="text-[8px] font-bold text-gray-700 truncate">{slot.name}</p>
                    <p className="text-[7px] text-gray-400 truncate">{slot.service}</p>
                  </div>
                ) : (
                  <div className="h-full" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>

    {/* right: new booking + today stats */}
    <div className="bg-gray-50/50 p-4 flex flex-col gap-3">
      <div className="rounded-xl p-4 bg-white border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">New Booking</p>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
            <span className="text-xs font-bold text-amber-600">EJ</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Emma Johnson</p>
            <p className="text-[10px] text-gray-400">via WhatsApp · just now</p>
          </div>
        </div>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex justify-between"><span className="text-gray-400">Service</span><span className="font-semibold text-gray-700">Dental Check-up</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="font-semibold text-gray-700">45 min</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="font-semibold text-gray-700">Thu 17 Apr, 2:30 PM</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Provider</span><span className="font-semibold text-gray-700">Dr. Smith</span></div>
        </div>
        <div className="mt-3 space-y-1.5">
          {['Confirmation sent', 'Calendar synced', 'Reminder set (24h)', 'Reminder set (1h)'].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] text-gray-500">{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-4 bg-white border border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Today</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: '12', label: 'Bookings', color: '#F59E0B' },
            { value: '2', label: 'Cancellations', color: '#EF4444' },
            { value: '94%', label: 'Show rate', color: '#27C087' },
            { value: '€840', label: 'Revenue', color: '#7B61FF' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-4 bg-white border border-gray-100 flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Upcoming</p>
        <div className="space-y-2">
          {[
            { time: '2:30 PM', name: 'Emma J.', service: 'Check-up' },
            { time: '3:15 PM', name: 'Carlos B.', service: 'Massage' },
            { time: '4:00 PM', name: 'Mark S.', service: 'Trim' },
          ].map(a => (
            <div key={a.time} className="flex items-center gap-2">
              <span className="text-[9px] text-gray-400 font-mono w-12">{a.time}</span>
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-gray-700">{a.name}</p>
                <p className="text-[8px] text-gray-400">{a.service}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function ProductBookings() {
  return (
    <ProductPageLayout
      badge="Freemi Bookings" badgeIcon={Calendar} accentColor="#F59E0B"
      headline="AI-Powered" headlineAccent="Appointments."
      subtitle="Customers book, reschedule, and cancel from any channel — website, WhatsApp, or phone. Your calendar stays perfect. No admin required."
      seed={133}
      demoVisual={<BookingsDemo />}
      stats={[{ value: '60%', label: 'Reduction in no-shows' }, { value: '3×', label: 'More bookings captured' }, { value: '0', label: 'Double-bookings' }, { value: '24/7', label: 'Booking availability' }]}
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
      price={{ amount: '€49.99', period: 'month', setup: 'Included with Starter plan. AI bookings across all channels.', features: ['AI-powered booking across all channels', 'Real-time calendar sync', 'Automated confirmations & reminders', 'Self-service reschedule & cancel', 'Multi-service & multi-staff support', 'No-show reduction (WhatsApp reminders)', 'Booking analytics dashboard', 'Custom availability rules'] }}
      ctaHeadline="Your calendar, on autopilot."
      ctaSubtitle="AI handles bookings from every channel. No double-bookings. No no-shows. No admin."
    />
  );
}
