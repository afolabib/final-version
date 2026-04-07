import { useState } from 'react';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import InteractiveGrid from '../components/InteractiveGrid';
import SolutionsHero from '../components/solutions/SolutionsHero';
import SolutionsAgentGrid from '../components/solutions/SolutionsAgentGrid';
import SolutionsShowcase from '../components/solutions/SolutionsShowcase';
import SolutionsHowItWorks from '../components/solutions/SolutionsHowItWorks';
import SolutionsEmbed from '../components/solutions/SolutionsEmbed';
import SolutionsComparison from '../components/solutions/SolutionsComparison';
import SolutionsUseCases from '../components/solutions/SolutionsUseCases';
import SolutionsTestimonials from '../components/solutions/SolutionsTestimonials';
import SolutionsCTA from '../components/solutions/SolutionsCTA';

const agents = [
  {
    key: 'freemi',
    name: 'Freemi',
    role: 'AI Operator Platform',
    color: '#5B5FFF',
    personality: 'Your always-on AI operator that coordinates the work before specialists take over',
    description: 'Freemi is the front door to your agent workforce — triaging requests, understanding intent, routing work, and making sure every task lands with the right specialist. Start with Freemi, then deploy the agents that fit your workflow.',
    tasks: [
      'Understands requests and routes work to the right agent',
      'Coordinates tasks across sales, support, operations, and success',
      'Keeps your workflows organized and moving automatically',
      'Provides a single AI layer across your tools and systems',
      'Helps you deploy the right specialist for each job',
    ],
    tools: ['Slack', 'Gmail', 'Google Calendar', 'HubSpot', 'Notion', 'Stripe'],
    workstation: 'exec',
    stats: [
      { value: '24/7', label: 'Always available' },
      { value: '1 hub', label: 'For all agents' },
      { value: 'Instant', label: 'Task routing' },
    ],
    useCases: [
      { emoji: '🧠', text: 'Central AI operator for your business' },
      { emoji: '🔀', text: 'Smart routing to specialist agents' },
      { emoji: '⚙️', text: 'Workflow coordination across teams' },
      { emoji: '📡', text: 'Unified control across your tools' },
    ],
    metrics: [
      { value: '24/7', label: 'Availability' },
      { value: '1', label: 'Unified AI Layer' },
      { value: 'Instant', label: 'Work Routing' },
      { value: '∞', label: 'Scalable Specialists' },
    ],
  },
  {
    key: 'sam',
    name: 'Sam',
    role: 'Sales Operator',
    color: '#4A6CF7',
    personality: 'Relentlessly optimistic closer who never misses a follow-up',
    description: 'Sam qualifies leads, enriches contacts, sends personalized outreach, and books meetings — all while you sleep. Every interaction is logged, every lead is scored, and your pipeline grows on autopilot.',
    tasks: [
      'Qualifies inbound leads instantly with scoring',
      'Enriches contacts with company & social data',
      'Sends personalized multi-step follow-up sequences',
      'Books meetings directly on your calendar',
      'Updates CRM with every interaction & next steps',
    ],
    tools: ['HubSpot', 'Salesforce', 'Gmail', 'Calendly', 'LinkedIn', 'Slack'],
    workstation: 'sales',
    stats: [
      { value: '47%', label: 'More meetings booked' },
      { value: '< 2min', label: 'Avg response time' },
      { value: '$2.4M', label: 'Pipeline influenced' },
    ],
    useCases: [
      { emoji: '🎯', text: 'Inbound lead qualification & routing' },
      { emoji: '📧', text: 'Multi-channel outreach sequences' },
      { emoji: '📅', text: 'Automated meeting scheduling' },
      { emoji: '📊', text: 'Pipeline reporting & forecasting' },
    ],
    metrics: [
      { value: '12x', label: 'Faster Lead Response' },
      { value: '340%', label: 'ROI in 90 Days' },
      { value: '2,847', label: 'Meetings Booked' },
      { value: '99.2%', label: 'Uptime' },
    ],
  },
  {
    key: 'rex',
    name: 'Rex',
    role: 'Support Hero',
    color: '#E84393',
    personality: 'Cool under pressure — solves problems before customers even notice',
    description: 'Rex handles tier-1 tickets, finds solutions in your knowledge base, drafts pixel-perfect responses, and escalates only when truly needed. Your customers get instant help, your team stays focused.',
    tasks: [
      'Triages and categorizes incoming tickets by urgency',
      'Searches knowledge base for proven solutions',
      'Drafts and sends helpful, on-brand responses',
      'Escalates complex issues to the right human',
      'Tracks CSAT, resolution time, and team metrics',
    ],
    tools: ['Zendesk', 'Intercom', 'Notion', 'Slack', 'Jira', 'Email'],
    workstation: 'support',
    stats: [
      { value: '73%', label: 'Auto-resolved' },
      { value: '4.8★', label: 'CSAT score' },
      { value: '< 30s', label: 'First response' },
    ],
    useCases: [
      { emoji: '🎫', text: 'Automated ticket triage & routing' },
      { emoji: '💬', text: 'Instant knowledge base lookups' },
      { emoji: '📝', text: 'Response drafting & review' },
      { emoji: '📈', text: 'Support metrics & team reporting' },
    ],
    metrics: [
      { value: '73%', label: 'Auto-Resolution Rate' },
      { value: '< 30s', label: 'First Response Time' },
      { value: '4.8/5', label: 'Customer Satisfaction' },
      { value: '$45K', label: 'Annual Savings' },
    ],
  },
  {
    key: 'nova',
    name: 'Nova',
    role: 'Ops Manager',
    color: '#00B894',
    personality: 'Meticulous organizer who never lets a detail slip through the cracks',
    description: 'Nova processes invoices, reconciles data across systems, generates reports, and keeps your operations running like clockwork. She catches anomalies humans miss and saves your finance team hours every week.',
    tasks: [
      'Processes and validates invoices automatically',
      'Reconciles data across multiple systems',
      'Generates weekly operations & finance reports',
      'Flags anomalies and discrepancies for review',
      'Manages vendor communications & follow-ups',
    ],
    tools: ['QuickBooks', 'Google Sheets', 'Airtable', 'Slack', 'Email', 'Xero'],
    workstation: 'ops',
    stats: [
      { value: '94%', label: 'Auto-processed' },
      { value: '0', label: 'Errors this month' },
      { value: '12hrs', label: 'Saved weekly' },
    ],
    useCases: [
      { emoji: '🧾', text: 'Invoice processing & validation' },
      { emoji: '🔄', text: 'Cross-system data reconciliation' },
      { emoji: '📊', text: 'Automated financial reporting' },
      { emoji: '⚠️', text: 'Anomaly detection & alerts' },
    ],
    metrics: [
      { value: '94%', label: 'Auto-Processed' },
      { value: '12hrs', label: 'Saved Per Week' },
      { value: '$0', label: 'Processing Errors' },
      { value: '3 days→3hrs', label: 'Month-End Close' },
    ],
  },
  {
    key: 'pixel',
    name: 'Pixel',
    role: 'Success Agent',
    color: '#F39C12',
    personality: 'Warm relationship builder who sees churn signals before anyone else',
    description: 'Pixel monitors customer health scores, sends proactive check-ins, identifies upsell opportunities, and prevents churn before it happens. Every account gets white-glove treatment at scale.',
    tasks: [
      'Monitors customer health scores in real-time',
      'Sends proactive check-in & milestone emails',
      'Identifies expansion & upsell opportunities',
      'Alerts your team to at-risk accounts instantly',
      'Schedules QBR meetings & prepares agendas',
    ],
    tools: ['Gainsight', 'Salesforce', 'Intercom', 'Calendly', 'Slack', 'Email'],
    workstation: 'cs',
    stats: [
      { value: '34%', label: 'Churn reduction' },
      { value: '28%', label: 'Upsell increase' },
      { value: '150+', label: 'Accounts managed' },
    ],
    useCases: [
      { emoji: '❤️', text: 'Proactive customer health monitoring' },
      { emoji: '📈', text: 'Expansion revenue identification' },
      { emoji: '🚨', text: 'At-risk account early warning' },
      { emoji: '📅', text: 'Automated QBR scheduling' },
    ],
    metrics: [
      { value: '34%', label: 'Churn Reduction' },
      { value: '28%', label: 'Upsell Increase' },
      { value: '150+', label: 'Accounts at Scale' },
      { value: '< 1hr', label: 'Risk Response Time' },
    ],
  },
  {
    key: 'echo',
    name: 'Echo',
    role: 'Exec Assistant',
    color: '#0984E3',
    personality: 'Always one step ahead — your strategic right hand',
    description: 'Echo manages your inbox, preps for meetings, drafts briefs, resolves calendar conflicts, and ensures you start every day with clarity. She turns chaos into structure before you even log in.',
    tasks: [
      'Triages and prioritizes your inbox by importance',
      'Prepares detailed meeting briefs & agendas',
      'Drafts polished responses ready for your review',
      'Resolves calendar conflicts & optimizes schedule',
      'Creates daily executive summaries & action items',
    ],
    tools: ['Gmail', 'Google Calendar', 'Notion', 'Slack', 'Docs', 'Zoom'],
    workstation: 'exec',
    stats: [
      { value: '3hrs', label: 'Saved daily' },
      { value: '89%', label: 'Emails handled' },
      { value: '100%', label: 'Meetings prepped' },
    ],
    useCases: [
      { emoji: '📬', text: 'Intelligent inbox management' },
      { emoji: '📋', text: 'Meeting prep & follow-up notes' },
      { emoji: '📅', text: 'Calendar optimization & conflict resolution' },
      { emoji: '📊', text: 'Daily executive briefings' },
    ],
    metrics: [
      { value: '3hrs', label: 'Saved Per Day' },
      { value: '89%', label: 'Emails Auto-Handled' },
      { value: '100%', label: 'Meetings Prepped' },
      { value: '200+', label: 'Emails Triaged Daily' },
    ],
  },
  {
    key: 'ghost',
    name: 'Ghost',
    role: 'Research Ops',
    color: '#636E72',
    personality: 'Mysterious data hunter who surfaces insights others miss',
    description: 'Ghost digs deep into the web, compiles detailed research briefs, monitors competitors in real-time, and tracks industry trends — delivering curated intelligence straight to your inbox or Slack.',
    tasks: [
      'Deep-researches prospects, markets, and trends',
      'Monitors competitor launches, pricing, and moves',
      'Compiles executive briefing documents weekly',
      'Tracks breaking industry news & funding rounds',
      'Builds structured databases from unstructured data',
    ],
    tools: ['Web Search', 'LinkedIn', 'Crunchbase', 'Notion', 'Google Sheets', 'Slack'],
    workstation: 'sales',
    stats: [
      { value: '500+', label: 'Profiles researched' },
      { value: '15', label: 'Competitors tracked' },
      { value: '24/7', label: 'Always monitoring' },
    ],
    useCases: [
      { emoji: '🔍', text: 'Prospect & market research' },
      { emoji: '🏁', text: 'Competitive intelligence gathering' },
      { emoji: '📰', text: 'Industry news monitoring' },
      { emoji: '📁', text: 'Data enrichment & structuring' },
    ],
    metrics: [
      { value: '500+', label: 'Profiles Researched' },
      { value: '15', label: 'Competitors Tracked' },
      { value: '24/7', label: 'Monitoring Active' },
      { value: '10hrs', label: 'Research Saved Weekly' },
    ],
  },
];

export default function Solutions() {
  const [selected, setSelected] = useState(agents[0]);

  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(180deg, #EEF0F8 0%, #F8F9FE 30%, #F0F1FF 70%, #EEF0F8 100%)', minHeight: '100vh' }}>
      <InteractiveGrid />
      <TopNav />

      <main className="relative z-10">
        <SolutionsHero />
        <SolutionsAgentGrid agents={agents} selected={selected} onSelect={setSelected} />
        <SolutionsShowcase agent={selected} />
        <SolutionsHowItWorks />
        <SolutionsEmbed />
        <SolutionsComparison />
        <SolutionsUseCases />
        <SolutionsTestimonials />
        <SolutionsCTA />
      </main>

      <SiteFooter />
    </div>
  );
}