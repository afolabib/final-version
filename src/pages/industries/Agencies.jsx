import ProductPageLayout from '../../components/ProductPageLayout';
import { Briefcase, Users, BarChart3, Clock, Zap, FileText, Calendar, Globe, Mail, MessageSquare, TrendingUp, Target, Palette, Code, Megaphone, PenTool } from 'lucide-react';

export default function Agencies() {
  return (
    <ProductPageLayout badge="Agencies" badgeIcon={Briefcase} accentColor="#7B61FF"
      headline="Scale Client Delivery" headlineAccent="Without Scaling Headcount."
      subtitle="AI agents that handle client communication, project updates, reporting, and lead generation — so your team focuses on creative work that actually matters."
      seed={200}
      stats={[{ value: '3×', label: 'Client capacity' }, { value: '60%', label: 'Less admin time' }, { value: '12hrs', label: 'Saved per week' }, { value: '24/7', label: 'Client support' }]}
      testimonials={[
        { quote: 'We doubled our client roster without hiring. AI handles status updates, meeting prep, and client queries automatically.', name: 'Alex Turner', role: 'Founder, Pixel & Co', gradient: 'linear-gradient(135deg, #7B61FF, #2F8FFF)' },
        { quote: 'Client onboarding that used to take 3 days now takes 3 hours. AI gathers requirements, sets up projects, and sends welcome packs.', name: 'Sarah Lee', role: 'MD, Forge Creative', gradient: 'linear-gradient(135deg, #E84393, #7B61FF)' },
        { quote: 'The weekly client reports write themselves now. AI pulls data from all our tools and sends polished updates every Friday.', name: 'James Chen', role: 'CEO, Launchpad Digital', gradient: 'linear-gradient(135deg, #27C087, #2F8FFF)' },
      ]}
      features={[
        { icon: Users, title: 'Client communication', desc: 'AI handles status updates, meeting scheduling, and client queries. Responses are on-brand and instant.', color: '#7B61FF' },
        { icon: BarChart3, title: 'Automated reporting', desc: 'Weekly and monthly client reports generated automatically from your project tools. Polished and sent on schedule.', color: '#2F8FFF' },
        { icon: FileText, title: 'Client onboarding', desc: 'AI gathers requirements, sets up project spaces, sends welcome packs, and schedules kickoff calls.', color: '#27C087' },
        { icon: TrendingUp, title: 'Lead generation', desc: 'AI qualifies inbound leads, sends case studies, books discovery calls, and updates your pipeline.', color: '#F59E0B' },
        { icon: Calendar, title: 'Meeting management', desc: 'AI schedules across time zones, sends agendas, takes notes, and distributes action items.', color: '#E84393' },
        { icon: Mail, title: 'Email management', desc: 'AI drafts responses, prioritises inbox, flags urgent items, and handles routine client correspondence.', color: '#0984E3' },
      ]}
      steps={[
        { icon: Briefcase, title: 'Tell us about your agency', desc: 'Share your services, client types, and workflows. We configure AI agents for your specific needs.' },
        { icon: Globe, title: 'AI handles the admin', desc: 'Client comms, reporting, scheduling, lead follow-up — all automated across your channels.' },
        { icon: Zap, title: 'Your team does what they\'re best at', desc: 'Creative work, strategy, client relationships — while AI handles everything else.' },
      ]}
      useCases={[
        { icon: Palette, title: 'Design Agencies', desc: 'Client feedback collection, revision tracking, asset delivery, and project status updates.', color: '#E84393', metric: '60%', metricLabel: 'Less admin', features: ['Feedback', 'Revisions', 'Delivery'] },
        { icon: Code, title: 'Dev Agencies', desc: 'Sprint updates, deployment notifications, bug report triage, and client demo scheduling.', color: '#7B61FF', metric: '3×', metricLabel: 'Client capacity', features: ['Sprints', 'Deploys', 'Demos'] },
        { icon: Megaphone, title: 'Marketing Agencies', desc: 'Campaign reporting, lead handoff, content approval workflows, and performance updates.', color: '#2F8FFF', metric: '12hrs', metricLabel: 'Saved weekly', features: ['Campaigns', 'Leads', 'Approvals'] },
        { icon: PenTool, title: 'Content Agencies', desc: 'Brief collection, editorial calendar management, review cycles, and publishing notifications.', color: '#27C087', metric: '89%', metricLabel: 'On-time', features: ['Briefs', 'Calendar', 'Publishing'] },
        { icon: Target, title: 'SEO & PPC', desc: 'Ranking reports, ad performance summaries, budget alerts, and client strategy calls.', color: '#F59E0B', metric: '100%', metricLabel: 'Reports sent', features: ['Rankings', 'Ads', 'Budgets'] },
        { icon: TrendingUp, title: 'Consulting', desc: 'Proposal generation, meeting prep, research briefs, and engagement tracking.', color: '#0984E3', metric: '24/7', metricLabel: 'Availability', features: ['Proposals', 'Research', 'Tracking'] },
      ]}
      ctaHeadline="More clients. Less overhead."
      ctaSubtitle="AI agents that handle the admin so your team can focus on creative work."
    />
  );
}
