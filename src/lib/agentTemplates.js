export const AGENT_TEMPLATES = [
  {
    id: 'freemi_operator',
    name: 'Freemi',
    subtitle: 'The Operator Agent',
    description: 'Your all-in-one business operator — handles tasks, delegates to other agents, and keeps everything running.',
    category: 'Productivity',
    popular: true,
    color: '#4A6CF7',
    questions: [
      { id: 'business_goal', label: 'What should Freemi primarily own for you?', type: 'multi', options: ['Task delegation', 'Daily scheduling', 'Progress tracking', 'Reminders & alerts', 'Team updates'], required: true },
      { id: 'task_volume', label: 'How many tasks do you manage daily?', type: 'single', options: ['1–5', '6–15', '16–30', '30+'], required: true },
      { id: 'tool_stack', label: 'Which tools do you use for tasks?', type: 'multi', options: ['Notion', 'Asana', 'Jira', 'Linear', 'Trello', 'Other'], required: true },
      { id: 'update_channel', label: 'How should Freemi communicate updates?', type: 'single', options: ['Slack', 'Email', 'Dashboard only', 'WhatsApp'], required: true },
      { id: 'role', label: 'What is your primary role?', type: 'single', options: ['Founder / CEO', 'Manager', 'Team Lead', 'Individual Contributor'], required: true },
      { id: 'checkin_frequency', label: 'How often should Freemi check in?', type: 'single', options: ['Every hour', 'Twice a day', 'Daily', 'Weekly'], required: true },
      { id: 'delegation_mode', label: 'Should Freemi delegate to other agents?', type: 'single', options: ['Yes, autonomously', 'Yes, with approval', 'No, handle everything'], required: true },
      { id: 'top_priority', label: 'What is your top priority right now?', type: 'single', options: ['Growing revenue', 'Reducing costs', 'Shipping faster', 'Hiring & team', 'Customer success'], required: true },
    ],
  },
  {
    id: 'dev_operator',
    name: 'Dev',
    subtitle: 'Web Development Agent',
    description: 'Full-stack web development — HTML, CSS, JS, React, backend, debugging, and deployment.',
    category: 'Development',
    popular: true,
    color: '#8B5CF6',
    questions: [
      { id: 'project_type', label: 'What are you building?', type: 'text', placeholder: 'Describe the app, site, or feature...', required: true },
      { id: 'stack', label: 'What stack should Dev work in?', type: 'multi', options: ['React', 'Next.js', 'Node.js', 'Firebase', 'Tailwind', 'Other'], required: true },
      { id: 'goal', label: 'What is the main goal right now?', type: 'single', options: ['Build new feature', 'Fix bugs', 'Ship MVP', 'Refactor', 'Deploy'], required: true },
      { id: 'deployment_target', label: 'Where should it deploy?', type: 'single', options: ['Vercel', 'Firebase', 'Fly.io', 'Local only', 'Other'], required: false },
      { id: 'autonomy', label: 'How autonomous should Dev be?', type: 'single', options: ['Fully autonomous', 'Ask before major changes', 'Draft only'], required: true },
    ],
  },
  {
    id: 'sales_operator',
    name: 'Rex',
    subtitle: 'Sales SDR',
    description: 'Qualify leads, send follow-ups, and book demos on autopilot.',
    category: 'Sales',
    color: '#EC4899',
    questions: [
      { id: 'lead_type', label: 'What type of leads should Rex target?', type: 'single', options: ['SMBs', 'Mid-market', 'Enterprise', 'Consumers'], required: true },
      { id: 'industry', label: 'What industry are you selling to?', type: 'single', options: ['SaaS', 'E-commerce', 'Agencies', 'Healthcare', 'Finance', 'Other'], required: true },
      { id: 'outreach_channel', label: 'What does your outreach look like?', type: 'single', options: ['Cold email', 'LinkedIn DM', 'Both', 'Phone calls'], required: true },
      { id: 'followups', label: 'How many follow-ups should Rex send?', type: 'single', options: ['1', '2', '3', '5+'], required: true },
      { id: 'deal_size', label: 'What is your average deal size?', type: 'single', options: ['< $1k', '$1k–$10k', '$10k–$100k', '$100k+'], required: true },
      { id: 'crm', label: 'What CRM do you use?', type: 'single', options: ['HubSpot', 'Salesforce', 'Pipedrive', 'Notion', 'None'], required: true },
      { id: 'offer', label: 'What do you sell?', type: 'text', placeholder: 'Describe the product, service, or offer...', required: true },
    ],
  },
  {
    id: 'support_operator',
    name: 'Triager',
    subtitle: 'Support Ticket Triager',
    description: 'Auto-prioritize support tickets and draft responses instantly.',
    category: 'Support',
    color: '#10B981',
    questions: [
      { id: 'ticket_source', label: 'Where do support tickets come from?', type: 'single', options: ['Email', 'Intercom', 'Zendesk', 'Slack', 'Custom form'], required: true },
      { id: 'sla', label: 'How urgent is your response SLA?', type: 'single', options: ['< 1 hour', '< 4 hours', '< 24 hours', 'No SLA'], required: true },
      { id: 'ticket_types', label: 'What type of tickets does Triager handle?', type: 'multi', options: ['Bug reports', 'Billing questions', 'Feature requests', 'General enquiries', 'All of the above'], required: true },
      { id: 'auto_response', label: 'Should Triager auto-respond to simple tickets?', type: 'single', options: ['Yes', 'Draft only, I review', 'No'], required: true },
      { id: 'knowledge_base', label: 'Do you have a knowledge base?', type: 'single', options: ['Yes, link it', 'No, not yet'], required: true },
      { id: 'escalation', label: 'Who should receive escalation alerts?', type: 'single', options: ['Me', 'Team lead', 'Whole team', 'Slack channel'], required: true },
    ],
  },
  {
    id: 'custom_operator',
    name: 'Custom Agent',
    subtitle: 'Build your own',
    description: 'Design an agent from scratch with your own personality, tools, and workflows.',
    category: 'Productivity',
    color: '#F59E0B',
    questions: [
      { id: 'purpose', label: 'What should this agent do?', type: 'text', placeholder: 'Describe the job this agent should own...', required: true },
      { id: 'primary_user', label: 'Who is the primary user?', type: 'single', options: ['Just me', 'My team', 'My customers'], required: true },
      { id: 'tone', label: 'What tone should it have?', type: 'single', options: ['Professional', 'Casual', 'Friendly', 'Direct'], required: true },
      { id: 'tools', label: 'What tools should it connect to?', type: 'multi', options: ['Email', 'Slack', 'Notion', 'CRM', 'Calendar', 'Other'], required: true },
      { id: 'autonomy', label: 'How autonomous should it be?', type: 'single', options: ['Fully autonomous', 'Ask before acting', 'Draft only'], required: true },
      { id: 'success_metric', label: 'What is the main success metric?', type: 'single', options: ['Time saved', 'Revenue generated', 'Issues resolved', 'Tasks completed'], required: true },
    ],
  },
];

export const PLAN_OPTIONS = [
  { id: 'starter', name: 'Starter', price: 49, features: ['1 Operator', 'Limited usage', 'Basic tools', 'Email & task support'] },
  { id: 'pro', name: 'Pro', price: 299, features: ['1 Full Operator', 'Email, CRM, docs, browser', 'Follow-ups & execution', 'Memory & context', 'Live oversight'], popular: true },
  { id: 'max', name: 'Max', price: 599, features: ['Multiple operators', 'Shared workflows', 'Cross-functional automation', 'Custom integrations', 'Deployment support'] },
];

export function getAgentTemplateById(id) {
  return AGENT_TEMPLATES.find((agent) => agent.id === id) || null;
}
