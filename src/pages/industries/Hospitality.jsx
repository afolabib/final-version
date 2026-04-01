import IndustryPage from '../../components/IndustryPage';

const data = {
  title: 'Hospitality',
  headline: 'Deliver Five-Star Service Without Five-Star Overhead',
  subtitle: 'Freemi operators manage guest communications, coordinate bookings, handle reviews, and streamline back-of-house operations — so your team can focus entirely on the guest experience.',
  color: '#636E72',
  operators: ['Rex', 'Echo', 'Nova'],
  stats: [
    { value: '4.8★', label: 'Avg review score' },
    { value: '< 3min', label: 'Guest response time' },
    { value: '15hrs', label: 'Saved per week' },
  ],
  painPoints: [
    { emoji: '📞', title: 'Guests wait too long for answers', text: 'Booking questions, amenity requests, and check-in details sit unanswered for hours. In hospitality, every minute of delay impacts the experience.' },
    { emoji: '⭐', title: 'Reviews pile up without responses', text: 'Negative reviews on Google, TripAdvisor, and Booking.com go unanswered for days, hurting your reputation and future bookings.' },
    { emoji: '📋', title: 'Booking coordination is chaos', text: 'Between OTAs, direct bookings, group reservations, and cancellations, your front desk is juggling too many systems manually.' },
    { emoji: '📊', title: 'Operations reporting is an afterthought', text: 'Daily occupancy reports, revenue tracking, and maintenance logs are done by hand — if they get done at all.' },
  ],
  characterQuote: 'I just confirmed 23 reservations, responded to 8 guest inquiries, and replied to every new review on Google — your front desk hasn\'t even opened yet.',
  benefits: [
    { title: 'Instant Guest Communications', text: 'Every inquiry — booking questions, special requests, check-in details — gets a warm, professional response in minutes. Pre-arrival emails go out automatically with directions, amenities, and local tips.' },
    { title: 'Review Management on Autopilot', text: 'Rex monitors reviews across Google, TripAdvisor, Booking.com, and Yelp. Positive reviews get thank-you responses. Negative reviews get thoughtful, brand-appropriate replies with escalation to management.' },
    { title: 'Seamless Booking Coordination', text: 'Echo syncs across OTAs, your PMS, and direct channels. Confirmations, reminders, and follow-ups happen automatically. Group bookings get dedicated coordination workflows.' },
    { title: 'Daily Operations Intelligence', text: 'Nova generates morning briefings with occupancy rates, revenue summaries, maintenance flags, and staffing recommendations. Your GM starts every day with clarity.' },
  ],
  workflows: [
    { title: 'Inquiry → Confirmed Booking', description: 'A guest messages asking about availability. Rex checks your PMS, sends a personalized response with rates and photos, and if they book, sends a confirmation with pre-arrival details.', tools: ['PMS', 'Email', 'WhatsApp', 'Calendar'] },
    { title: 'Check-Out → Review Request', description: 'The day after check-out, Rex sends a warm thank-you email with a review link. If a review appears, it\'s automatically categorized and responded to within hours.', tools: ['Google', 'TripAdvisor', 'Email', 'Slack'] },
    { title: 'Daily Ops → Morning Briefing', description: 'Every morning at 7am, Nova compiles occupancy, revenue, arrivals, departures, maintenance requests, and staffing levels into a clean dashboard delivered to your inbox.', tools: ['PMS', 'Google Sheets', 'Email', 'Slack'] },
    { title: 'Guest Request → Fulfilled', description: 'A guest texts asking for extra towels and a late check-out. Echo routes the towel request to housekeeping and checks availability for the late check-out, responding to the guest within minutes.', tools: ['WhatsApp', 'Slack', 'PMS', 'Email'] },
  ],
  testimonial: {
    quote: 'Our review response rate went from 30% to 100% overnight. Guests noticed immediately — our Google rating jumped from 4.3 to 4.8 in three months.',
    name: 'Isabella Torres',
    role: 'General Manager',
    company: 'Coastal Boutique Hotels',
  },
};

export default function Hospitality() {
  return <IndustryPage data={data} />;
}