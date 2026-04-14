import ProductPageLayout from '../../components/ProductPageLayout';
import { Code, Users, TrendingUp, Clock, Zap, BarChart3, MessageSquare, Globe, Shield, Headphones, Mail, Target, Rocket, Bug, BookOpen, Cpu } from 'lucide-react';

export default function SaaS() {
  return (
    <ProductPageLayout badge="SaaS" badgeIcon={Code} accentColor="#0984E3"
      headline="Scale Your SaaS" headlineAccent="Without Scaling Your Team."
      subtitle="AI agents that handle customer onboarding, support tickets, churn prevention, and lead qualification — so your team focuses on building product."
      seed={230}
      stats={[{ value: '34%', label: 'Churn reduction' }, { value: '73%', label: 'Auto-resolved tickets' }, { value: '3×', label: 'Trial conversions' }, { value: '24/7', label: 'User support' }]}
      testimonials={[
        { quote: 'Trial-to-paid conversion went from 8% to 24% when AI started onboarding new users with personalised walkthroughs.', name: 'Jake Morrison', role: 'CEO, CloudSync', gradient: 'linear-gradient(135deg, #0984E3, #7B61FF)' },
        { quote: 'Support tickets dropped 60%. The AI resolves most issues before they even become tickets. Users love it.', name: 'Maria Santos', role: 'CTO, DataFlow', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
        { quote: 'We detected 15 at-risk accounts last month and saved 12 of them with proactive AI outreach. That\'s €180k in saved ARR.', name: 'Tom Chen', role: 'VP Success, LaunchPad', gradient: 'linear-gradient(135deg, #E84393, #7B61FF)' },
      ]}
      features={[
        { icon: Rocket, title: 'Automated onboarding', desc: 'AI guides new users through setup, sends walkthroughs, answers questions, and ensures activation milestones are hit.', color: '#0984E3' },
        { icon: Headphones, title: 'Tier-1 support', desc: 'AI resolves common issues, searches your knowledge base, drafts responses, and escalates complex tickets with full context.', color: '#7B61FF' },
        { icon: TrendingUp, title: 'Churn prevention', desc: 'Monitors usage patterns, detects at-risk accounts, triggers proactive outreach, and routes save opportunities to your team.', color: '#27C087' },
        { icon: Target, title: 'Lead qualification', desc: 'AI qualifies inbound leads, enriches contact data, scores buying intent, and books demos with your sales team.', color: '#F59E0B' },
        { icon: Mail, title: 'Customer communication', desc: 'Automated check-ins, feature announcements, usage reports, and NPS surveys — personalised per account.', color: '#E84393' },
        { icon: BarChart3, title: 'Revenue intelligence', desc: 'Track MRR, churn, expansion revenue, support load, and customer health scores. Data-driven growth.', color: '#2F8FFF' },
      ]}
      steps={[
        { icon: Code, title: 'Connect your SaaS', desc: 'Integrate your product, CRM, support tools, and billing. We wire up everything in one day.' },
        { icon: Globe, title: 'AI agents start working', desc: 'Onboarding, support, churn prevention, lead qualification — all running across your channels.' },
        { icon: Zap, title: 'Scale without hiring', desc: 'Handle 10x the users with the same team. AI does the repetitive work. You build the product.' },
      ]}
      useCases={[
        { icon: Rocket, title: 'PLG / Self-Serve', desc: 'Trial onboarding, activation nudges, upgrade prompts, and usage-based outreach — all automated.' },
        { icon: Users, title: 'Sales-Led', desc: 'Lead qualification, demo booking, proposal follow-ups, and deal acceleration.' },
        { icon: Bug, title: 'Developer Tools', desc: 'API question answering, code examples, integration support, and documentation search.' },
        { icon: BookOpen, title: 'EdTech', desc: 'Student onboarding, course recommendations, progress tracking, and instructor support.' },
        { icon: Shield, title: 'Security & Compliance', desc: 'Compliance queries, audit documentation, security questionnaire responses, and certification guidance.' },
        { icon: Cpu, title: 'Infrastructure', desc: 'Status page updates, incident communication, capacity alerts, and migration support.' },
      ]}
      ctaHeadline="Grow faster. Support better."
      ctaSubtitle="AI agents that scale your SaaS without scaling your team."
    />
  );
}
