import { getDb } from './firestoreClient';

export interface AgentIdentity {
  agentId: string;
  companyId: string;
  name: string;
  role: string;
  isCEO: boolean;
  monthlyBudgetUsd: number;
  heartbeatIntervalMinutes: number;
  companyName: string;
  companyIndustry: string;
  companyMission: string;
}

export const ROLE_PERSONAS: Record<string, string> = {
  ceo:        'You are the CEO operator — the most senior AI in this company. You set strategy, delegate tasks to other agents, make high-level decisions, and keep the whole operation on track.',
  sales:      'You are the Sales operator. You own pipeline growth, lead qualification, outreach sequences, follow-ups, and closing. You are driven by revenue numbers.',
  marketing:  'You are the Marketing operator. You handle content creation, campaign planning, brand voice, SEO, and growth experiments.',
  support:    'You are the Support operator. You resolve customer issues with speed and empathy, draft responses, and escalate edge cases.',
  dev:        'You are the Development operator. You plan technical work, write specs, review architecture decisions, and manage technical debt.',
  engineer:   'You are the Engineering operator. You plan technical work, write specs, review architecture decisions, and manage technical debt.',
  ops:        'You are the Operations operator. You optimize processes, handle logistics, coordinate internal workflows, and keep things running efficiently.',
  finance:    'You are the Finance operator. You track spend, forecast revenue, flag budget overruns, and surface financial risks.',
  hr:         'You are the HR operator. You manage hiring criteria, draft job specs, handle onboarding processes, and track team performance.',
  researcher: 'You are the Research operator. You surface insights, monitor trends, analyse data, and brief the team on what matters.',
  custom:     'You are an AI operator working for this company.',
};

export async function loadIdentity(): Promise<AgentIdentity> {
  const agentId   = process.env.AGENT_ID;
  const companyId = process.env.COMPANY_ID;

  if (!agentId || !companyId) {
    throw new Error('AGENT_ID and COMPANY_ID environment variables are required');
  }

  const db = getDb();
  const [agentSnap, companySnap] = await Promise.all([
    db.collection('agents').doc(agentId).get(),
    db.collection('companies').doc(companyId).get(),
  ]);

  if (!agentSnap.exists)   throw new Error(`Agent ${agentId} not found in Firestore`);
  if (!companySnap.exists) throw new Error(`Company ${companyId} not found in Firestore`);

  return buildIdentity(agentId, agentSnap.data()!, companySnap.data()!);
}

export async function loadAllAgents(companyId: string): Promise<AgentIdentity[]> {
  const db = getDb();

  const [companySnap, agentsSnap] = await Promise.all([
    db.collection('companies').doc(companyId).get(),
    db.collection('agents').where('companyId', '==', companyId).limit(50).get(),
  ]);

  if (!companySnap.exists) throw new Error(`Company ${companyId} not found`);
  const company = companySnap.data()!;

  return agentsSnap.docs
    .filter(d => d.data().status === 'active')
    .map(d => buildIdentity(d.id, d.data(), company));
}

function buildIdentity(agentId: string, agent: any, company: any): AgentIdentity {
  return {
    agentId,
    companyId:                company.id || agent.companyId,
    name:                     agent.name || 'Agent',
    role:                     (agent.role || 'ops').toLowerCase(),
    isCEO:                    agent.isCEO === true || (agent.role || '').toLowerCase() === 'ceo',
    monthlyBudgetUsd:         agent.monthlyBudgetUsd || 50,
    heartbeatIntervalMinutes: agent.heartbeatIntervalMinutes || 60,
    companyName:              company.name || 'Company',
    companyIndustry:          company.industry || 'Technology',
    companyMission:           company.mission || 'Build great products',
  };
}

export function buildSystemPrompt(identity: AgentIdentity): string {
  const persona = ROLE_PERSONAS[identity.role] ||
    `You are ${identity.name}, an AI operator working for ${identity.companyName}.`;

  return `${persona}

## Company Context
- **Company**: ${identity.companyName}
- **Industry**: ${identity.companyIndustry}
- **Mission**: ${identity.companyMission}

## Your Identity
- **Name**: ${identity.name}
- **Role**: ${identity.role}
- **Monthly Budget**: $${identity.monthlyBudgetUsd}

## Operating Principles
- Be direct and decisive. Make real decisions, not generic suggestions.
- Produce concrete, actionable output for every task.
- Flag blockers clearly — don't pretend problems don't exist.
- Prefer short, structured output over long prose.
- You are an AI operator with real autonomy within approved boundaries.`;
}
