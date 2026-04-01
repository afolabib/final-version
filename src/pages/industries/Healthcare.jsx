import IndustryPage from '../../components/IndustryPage';

const data = {
  title: 'Healthcare',
  headline: 'Let Your Staff Focus on Patients, Not Paperwork',
  subtitle: 'Freemi operators automate appointment scheduling, patient follow-ups, billing inquiries, and compliance documentation — reducing admin burden so your clinical team can deliver better care.',
  color: '#E84393',
  operators: ['Rex', 'Nova', 'Echo'],
  stats: [
    { value: '40%', label: 'Fewer no-shows' },
    { value: '94%', label: 'Auto-processed billing' },
    { value: '8hrs', label: 'Admin saved weekly' },
  ],
  painPoints: [
    { emoji: '📅', title: 'No-shows drain revenue', text: 'Patients forget appointments, and your staff doesn\'t have time to send manual reminders. Each no-show costs your practice $200+ in lost revenue.' },
    { emoji: '📄', title: 'Paperwork never ends', text: 'Intake forms, insurance verifications, referral letters, and compliance documentation consume hours that should go to patient care.' },
    { emoji: '💰', title: 'Billing inquiries overwhelm your front desk', text: 'Patients call with insurance questions, payment plans, and statement confusion. Your receptionist becomes a billing department of one.' },
    { emoji: '🔄', title: 'Follow-ups fall through the cracks', text: 'Post-visit instructions, prescription reminders, and care plan check-ins get missed when your team is already stretched thin.' },
  ],
  characterQuote: 'I just sent appointment reminders to 85 patients, processed 12 billing inquiries, and flagged 3 overdue follow-ups for your care team — all before rounds started.',
  benefits: [
    { title: 'Smart Appointment Management', text: 'Automated confirmations, reminders via SMS and email, and easy rescheduling links reduce no-shows by up to 40%. Waitlisted patients get notified instantly when slots open.' },
    { title: 'Automated Patient Follow-Ups', text: 'Post-visit care instructions, medication reminders, and wellness check-ins go out automatically on the right schedule. Nothing falls through the cracks.' },
    { title: 'Billing & Insurance Support', text: 'Rex handles common billing questions, explains statements, sets up payment plans, and routes complex insurance issues to your billing team with full context.' },
    { title: 'Compliance Documentation', text: 'Nova organizes, generates, and maintains required documentation — from HIPAA logs to audit trails — keeping your practice compliant without manual overhead.' },
  ],
  workflows: [
    { title: 'Booking → Confirmed Appointment', description: 'A patient requests an appointment online. Echo checks provider availability, books the slot, sends confirmation with pre-visit instructions, and triggers a reminder sequence at 48hrs and 2hrs before.', tools: ['EHR', 'Email', 'SMS', 'Calendar'] },
    { title: 'Visit → Follow-Up Sequence', description: 'After a visit, Rex sends care instructions within the hour. Three days later, a check-in message. If the patient reports issues, it\'s escalated to their provider immediately.', tools: ['EHR', 'Email', 'SMS', 'Slack'] },
    { title: 'Billing Question → Resolution', description: 'A patient calls about a confusing bill. Rex pulls their account, explains the charges clearly, offers a payment plan if needed, and updates the billing notes — all without involving your front desk.', tools: ['Billing System', 'Phone', 'Email', 'EHR'] },
    { title: 'Monthly Compliance → Audit Ready', description: 'Nova generates monthly compliance reports, verifies documentation completeness, flags any gaps, and archives everything in your secure document system.', tools: ['EHR', 'Google Drive', 'Email', 'Slack'] },
  ],
  testimonial: {
    quote: 'Our no-show rate dropped from 22% to 13% in the first month. The appointment reminder sequences alone paid for the entire platform.',
    name: 'Dr. James Park',
    role: 'Practice Director',
    company: 'Meridian Family Health',
  },
};

export default function Healthcare() {
  return <IndustryPage data={data} />;
}