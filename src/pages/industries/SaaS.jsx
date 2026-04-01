import IndustryPage from '../../components/IndustryPage';

const data = {
  title: 'SaaS',
  headline: 'Scale Your SaaS Without Scaling Your Team',
  subtitle: 'Freemi operators qualify leads, onboard users, prevent churn, and handle tier-1 support — running 24/7 so your team can focus on building product, not managing busywork.',
  color: '#6C5CE7',
  operators: ['Sam', 'Rex', 'Pixel'],
  stats: [
    { value: '47%', label: 'More demos booked' },
    { value: '< 2min', label: 'Avg lead response' },
    { value: '34%', label: 'Churn reduction' },
  ],
  painPoints: [
    { emoji: '😩', title: 'Leads go cold while you sleep', text: 'Inbound leads wait hours or days for a response. By the time your team follows up, they\'ve already moved on to a competitor.' },
    { emoji: '🔥', title: 'Support tickets pile up', text: 'Your growing user base means a growing support queue. Simple questions bury your team, and complex issues get delayed.' },
    { emoji: '📉', title: 'Churn sneaks up on you', text: 'Users disengage silently. Without proactive outreach, you only find out when they cancel — and by then it\'s too late.' },
    { emoji: '⏳', title: 'Onboarding is manual & inconsistent', text: 'Every new user needs hand-holding. Your team repeats the same steps, and some users fall through the cracks entirely.' },
  ],
  characterQuote: 'I just booked 12 demos while your team was in a sprint planning meeting. Want me to prep the call briefs too?',
  benefits: [
    { title: 'Instant Lead Qualification', text: 'Every inbound lead is scored, enriched, and routed in under 60 seconds. Hot leads go straight to your reps with full context — company size, tech stack, buying signals.' },
    { title: 'Self-Serve Onboarding at Scale', text: 'New signups get personalized welcome sequences, feature walkthroughs, and milestone check-ins. Adoption rates climb while your CS team focuses on enterprise accounts.' },
    { title: 'Proactive Churn Prevention', text: 'Health scores are monitored in real-time. At-risk accounts get intervention sequences before they even think about canceling — saving revenue while you sleep.' },
    { title: 'Tier-1 Support on Autopilot', text: 'Common questions are resolved instantly from your docs and knowledge base. Complex issues are escalated with full context so your engineers spend zero time on repetitive tickets.' },
  ],
  workflows: [
    { title: 'Inbound Lead → Qualified Meeting', description: 'A visitor fills out your demo form. Sam instantly enriches the lead, scores it, sends a personalized email, and books a meeting on your rep\'s calendar — all within 90 seconds.', tools: ['HubSpot', 'Gmail', 'Calendly', 'LinkedIn'] },
    { title: 'New Signup → Activated User', description: 'A user signs up for your trial. Pixel sends a welcome sequence, tracks feature adoption, nudges them toward key milestones, and flags disengaged users for your CS team.', tools: ['Intercom', 'Slack', 'Analytics', 'Email'] },
    { title: 'Support Ticket → Resolution', description: 'A user submits a ticket. Rex categorizes it, searches your knowledge base, drafts a response, and either resolves it automatically or escalates with full context to the right engineer.', tools: ['Zendesk', 'Notion', 'Jira', 'Slack'] },
    { title: 'At-Risk Account → Saved Customer', description: 'Pixel detects declining usage. An automated check-in email goes out, a QBR is scheduled, and your CS manager gets a brief with health trends and recommended actions.', tools: ['Gainsight', 'Salesforce', 'Calendly', 'Email'] },
  ],
  testimonial: {
    quote: 'We deployed Sam and Rex on a Monday. By Friday, we had 3x more qualified demos and our ticket backlog was down 60%. It felt like hiring a whole team overnight.',
    name: 'Sarah Chen',
    role: 'Head of Growth',
    company: 'Launchpad (Series A SaaS)',
  },
};

export default function SaaS() {
  return <IndustryPage data={data} />;
}