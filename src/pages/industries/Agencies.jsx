import IndustryPage from '../../components/IndustryPage';

const data = {
  title: 'Agencies',
  headline: 'Scale Client Delivery Without Scaling Headcount',
  subtitle: 'Freemi operators handle client reporting, prospecting, project tracking, and internal ops — letting your agency take on more clients without hiring more people.',
  color: '#F39C12',
  operators: ['Nova', 'Ghost', 'Sam'],
  stats: [
    { value: '3x', label: 'More clients managed' },
    { value: '15hrs', label: 'Saved per week' },
    { value: '100%', label: 'Reports on time' },
  ],
  painPoints: [
    { emoji: '📊', title: 'Client reports eat up Fridays', text: 'Your team spends an entire day every week pulling data from 5 platforms, building decks, and sending reports. It\'s the least favorite part of the job.' },
    { emoji: '🏃', title: 'New business pipeline is inconsistent', text: 'When you\'re busy delivering, prospecting stops. When projects end, you scramble. The feast-or-famine cycle never breaks.' },
    { emoji: '🔥', title: 'Projects slip without anyone noticing', text: 'Tasks go overdue, deadlines shift silently, and clients find out about delays before your PM does. It erodes trust slowly.' },
    { emoji: '🧑‍🤝‍🧑', title: 'Hiring for growth is expensive and slow', text: 'Each new client needs more hands, but recruiting, onboarding, and training takes months. Meanwhile, your team burns out.' },
  ],
  characterQuote: 'I just compiled performance reports for all 12 of your clients, researched 50 new prospects, and flagged 2 projects that are at risk of missing deadlines. Your Monday morning is going to be smooth.',
  benefits: [
    { title: 'Automated Client Reporting', text: 'Nova pulls data from Google Analytics, ad platforms, and CRMs, builds clean reports, and delivers them on schedule. Your team reviews and approves instead of building from scratch.' },
    { title: 'Always-On Prospecting', text: 'Ghost researches ideal prospects, enriches contacts, and Sam sends personalized outreach sequences. Your pipeline stays full even during your busiest delivery months.' },
    { title: 'Proactive Project Tracking', text: 'Nova monitors task deadlines, flags at-risk deliverables, sends status updates to clients, and escalates blockers to PMs before they become problems.' },
    { title: 'Scalable Operations', text: 'From invoicing and time tracking to resource allocation and vendor management — your back-office runs itself, freeing you to focus on creative strategy.' },
  ],
  workflows: [
    { title: 'Data → Client Report → Delivered', description: 'Every Friday, Nova pulls metrics from Google Analytics, Meta Ads, and your CRM. A formatted report is generated, reviewed by your account manager, and sent to the client by 5pm.', tools: ['Google Analytics', 'Meta Ads', 'HubSpot', 'Email'] },
    { title: 'ICP → Research → Outreach Sequence', description: 'Ghost identifies 50 companies matching your ICP weekly. Sam enriches contacts, personalizes messaging, and launches a 5-step email sequence. Interested replies get routed to your BD team.', tools: ['LinkedIn', 'Crunchbase', 'Gmail', 'Calendly'] },
    { title: 'Task Overdue → PM Alert → Client Update', description: 'A task misses its deadline. Nova alerts the PM immediately, suggests a revised timeline, and drafts a proactive client update so the conversation happens before the client asks.', tools: ['Asana', 'Slack', 'Email', 'Calendar'] },
    { title: 'New Client → Onboarding Complete', description: 'A new client signs. Nova sets up their project workspace, sends the onboarding questionnaire, schedules the kickoff call, and creates the initial task timeline — all within an hour.', tools: ['Asana', 'Google Drive', 'Calendly', 'Slack'] },
  ],
  testimonial: {
    quote: 'We went from 8 clients to 22 in six months without hiring a single person. Freemi handles the operational load that used to require 3 full-time coordinators.',
    name: 'David Kim',
    role: 'Founder',
    company: 'Momentum Digital (Growth Agency)',
  },
};

export default function Agencies() {
  return <IndustryPage data={data} />;
}