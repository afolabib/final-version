import ProductPageLayout from '../../components/ProductPageLayout';
import { HeartPulse, Calendar, FileText, Shield, Clock, Zap, Bell, Users, Stethoscope, Brain, Pill, Activity, ClipboardList, Phone, Check, AlertCircle, User } from 'lucide-react';

const HealthcareDemo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[380px] rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
    <div className="lg:col-span-2 bg-white border-r border-gray-100">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2"><HeartPulse className="w-4 h-4 text-pink-500" /><span className="text-xs font-bold text-gray-800">Patient Dashboard</span></div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">AI Active</span>
      </div>
      <div className="grid grid-cols-4 gap-3 p-4 border-b border-gray-50">
        {[{ label: 'Appointments Today', val: '24', color: '#E84393' }, { label: 'No-Show Rate', val: '6%', color: '#27C087' }, { label: 'AI Handled', val: '87%', color: '#7B61FF' }, { label: 'Reminders Sent', val: '156', color: '#2F8FFF' }].map(s => (
          <div key={s.label} className="rounded-lg p-3 text-center" style={{ background: `${s.color}06`, border: `1px solid ${s.color}12` }}>
            <p className="text-lg font-extrabold" style={{ color: s.color }}>{s.val}</p>
            <p className="text-[8px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="p-4 space-y-2">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Today's Schedule</p>
        {[
          { time: '09:00', patient: 'Mary O\'Brien', type: 'Check-up', status: 'Confirmed', statusColor: 'bg-emerald-50 text-emerald-600', doctor: 'Dr. Smith' },
          { time: '09:45', patient: 'James Kelly', type: 'Follow-up', status: 'Confirmed', statusColor: 'bg-emerald-50 text-emerald-600', doctor: 'Dr. Smith' },
          { time: '10:30', patient: 'Priya Patel', type: 'Consultation', status: 'Reminder Sent', statusColor: 'bg-blue-50 text-blue-600', doctor: 'Dr. Kim' },
          { time: '11:15', patient: 'Patrick Murphy', type: 'Prescription Review', status: 'Pending', statusColor: 'bg-amber-50 text-amber-600', doctor: 'Dr. Kim' },
          { time: '14:00', patient: 'Sarah Chen', type: 'Dental Clean', status: 'Confirmed', statusColor: 'bg-emerald-50 text-emerald-600', doctor: 'Dr. Park' },
        ].map(a => (
          <div key={a.time} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50/50 transition-colors border border-gray-50">
            <span className="text-[10px] text-gray-400 font-mono w-10 shrink-0">{a.time}</span>
            <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center shrink-0"><span className="text-[9px] font-bold text-pink-600">{a.patient.split(' ').map(n=>n[0]).join('')}</span></div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-gray-800 truncate">{a.patient}</p>
              <p className="text-[9px] text-gray-400">{a.type} · {a.doctor}</p>
            </div>
            <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${a.statusColor}`}>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-gray-50/50 p-4 flex flex-col gap-3">
      <div className="rounded-xl p-3 bg-white border border-gray-100">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">AI Activity</p>
        <div className="space-y-2">
          {['Sent 45 appointment reminders', 'Processed 8 billing enquiries', 'Rescheduled 3 appointments', 'Flagged 2 follow-ups for Dr. Kim', 'Updated 12 patient records'].map(t => (
            <div key={t} className="flex items-center gap-2"><Check className="w-3 h-3 text-emerald-500 shrink-0" /><span className="text-[9px] text-gray-600">{t}</span></div>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-3 bg-white border border-gray-100 flex-1">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Patient Message</p>
        <div className="space-y-2">
          <div className="rounded-lg p-2.5 text-[10px] text-gray-600 leading-relaxed" style={{ background: 'rgba(232,67,147,0.04)', border: '1px solid rgba(232,67,147,0.1)' }}>
            "Can I reschedule my Thursday appointment to Friday morning?"
            <p className="text-[8px] text-gray-400 mt-1">— Aoife Ryan, 10 min ago</p>
          </div>
          <div className="rounded-lg p-2.5 text-[10px] leading-relaxed" style={{ background: 'rgba(123,97,255,0.04)', border: '1px solid rgba(123,97,255,0.08)' }}>
            <span className="text-[8px] font-bold text-purple-500">AI Response:</span>
            <p className="text-gray-600 mt-0.5">Done! Moved to Friday 18 Apr at 9:30 AM with Dr. Smith. Confirmation sent. ✓</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function Healthcare() {
  return (
    <ProductPageLayout badge="Healthcare" badgeIcon={HeartPulse} accentColor="#E84393"
      headline="Let Your Staff Focus" headlineAccent="On Patients, Not Paperwork."
      subtitle="AI agents that automate appointment scheduling, patient follow-ups, billing enquiries, and compliance documentation — so your clinical team delivers better care."
      seed={180}
      demoVisual={<HealthcareDemo />}
      stats={[{ value: '40%', label: 'Fewer no-shows' }, { value: '87%', label: 'AI-handled enquiries' }, { value: '8hrs', label: 'Admin saved weekly' }, { value: '24/7', label: 'Patient support' }]}
      testimonials={[
        { quote: 'Our no-show rate dropped from 22% to 6% in the first month. The reminder sequences alone paid for the platform.', name: 'Dr. James Park', role: 'Practice Director, Meridian Health', gradient: 'linear-gradient(135deg, #E84393, #7B61FF)' },
        { quote: 'Patients can reschedule via WhatsApp now. Our reception staff went from drowning in calls to actually helping people in the clinic.', name: 'Dr. Rachel Kim', role: 'Greenfield Medical', gradient: 'linear-gradient(135deg, #2F8FFF, #27C087)' },
        { quote: 'The AI handles billing questions better than most humans. It pulls up accounts, explains charges clearly, and offers payment plans automatically.', name: 'Fiona Walsh', role: 'Practice Manager', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
      ]}
      features={[
        { icon: Calendar, title: 'Smart appointment management', desc: 'Automated confirmations, reminders via WhatsApp/SMS, waitlist notifications, and easy rescheduling. No-shows drop by 40%.', color: '#E84393' },
        { icon: Bell, title: 'Automated patient follow-ups', desc: 'Post-visit care instructions, medication reminders, and wellness check-ins sent automatically on the right schedule.', color: '#7B61FF' },
        { icon: FileText, title: 'Billing & insurance support', desc: 'AI handles common billing questions, explains statements, sets up payment plans, and routes complex issues with full context.', color: '#2F8FFF' },
        { icon: Shield, title: 'Compliance documentation', desc: 'Maintains required documentation — from audit trails to regulatory logs — keeping your practice compliant without manual work.', color: '#27C087' },
        { icon: Phone, title: 'Phone & WhatsApp triage', desc: 'Patients call or message for appointments, refills, and questions. AI handles it all and escalates urgent cases immediately.', color: '#F59E0B' },
        { icon: Activity, title: 'Patient insights', desc: 'Track appointment volume, no-show rates, common enquiries, and patient satisfaction. Data-driven practice management.', color: '#0984E3' },
      ]}
      steps={[
        { icon: Stethoscope, title: 'Tell us about your practice', desc: 'Share your services, scheduling rules, and patient communication preferences. We configure everything.' },
        { icon: Brain, title: 'AI agents go live', desc: 'Custom-trained agents handle appointments, follow-ups, billing, and patient messages across all channels.' },
        { icon: Zap, title: 'Your practice runs smoother', desc: 'Staff focus on care, not admin. Patients get instant responses. No-shows plummet. Everyone wins.' },
      ]}
      useCases={[
        { icon: Stethoscope, title: 'General Practice', desc: 'Appointment booking, repeat prescriptions, test results notifications, and health check reminders — all automated.' },
        { icon: HeartPulse, title: 'Dental Clinics', desc: 'Cleaning reminders, check-up scheduling, treatment plan follow-ups, and insurance pre-authorisation queries.' },
        { icon: Activity, title: 'Physiotherapy', desc: 'Session bookings, exercise plan reminders, progress check-ins, and referral management.' },
        { icon: Pill, title: 'Pharmacy', desc: 'Prescription refills, medication reminders, delivery scheduling, and drug interaction queries.' },
        { icon: Users, title: 'Mental Health', desc: 'Session scheduling, mood check-ins, resource sharing, and crisis protocol escalation.' },
        { icon: ClipboardList, title: 'Specialist Clinics', desc: 'Referral processing, pre-appointment preparation, post-procedure follow-ups, and results communication.' },
      ]}
      ctaHeadline="Better care. Less admin."
      ctaSubtitle="AI agents that handle the paperwork so your team can focus on patients."
    />
  );
}
