import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Check, Loader2, Building2, Users,
  Zap, Plus, Target, MessageSquare, ChevronRight, Sparkles,
  Pencil, X, Save, ExternalLink, Brain, Code2, Megaphone,
  Headphones, FlaskConical, BarChart3, ShoppingCart, Globe, Link, Trash2
} from 'lucide-react';
import { updateCompany, createCompany, markBootstrapped } from '@/lib/companyService';
import { deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { httpsCallable } from 'firebase/functions';
import { functions as firebaseFunctions } from '@/lib/firebaseClient';

const readWebsiteFn = httpsCallable(firebaseFunctions, 'readWebsite');

const chatProxyFn = httpsCallable(firebaseFunctions, 'chatProxy');
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { createCEOAgent } from '@/lib/agentService';
import { createApproval, approveRequest } from '@/lib/approvalService';
import FreemiCharacter from '@/components/FreemiCharacter';

const INDUSTRIES = ['SaaS', 'E-Commerce', 'Agency', 'Healthcare', 'Logistics', 'Finance', 'Retail', 'Other'];

// ── Board recommendations by industry ─────────────────────────────────────────
const BOARD_TEMPLATES = {
  SaaS: [
    { id: 'sales', name: 'Alex', role: 'sales', emoji: '📈', subtitle: 'Sales Operator', description: 'Handles outreach, qualifies leads, and tracks pipeline to close deals faster.' },
    { id: 'engineer', name: 'Dev', role: 'engineer', emoji: '⚙️', subtitle: 'Engineering Operator', description: 'Manages tech tasks, monitors bugs, and coordinates dev sprints autonomously.' },
    { id: 'support', name: 'Casey', role: 'support', emoji: '🎧', subtitle: 'Support Operator', description: 'Triages tickets, drafts responses, and keeps NPS high around the clock.' },
    { id: 'marketing', name: 'Max', role: 'marketing', emoji: '📣', subtitle: 'Marketing Operator', description: 'Plans content, tracks competitors, and grows brand presence across channels.' },
  ],
  'E-Commerce': [
    { id: 'marketing', name: 'Max', role: 'marketing', emoji: '📣', subtitle: 'Marketing Operator', description: 'Runs ad campaigns, writes product copy, and tracks conversion metrics.' },
    { id: 'support', name: 'Casey', role: 'support', emoji: '🎧', subtitle: 'Support Operator', description: 'Handles returns, order issues, and customer questions 24/7.' },
    { id: 'sales', name: 'Alex', role: 'sales', emoji: '📈', subtitle: 'Sales Operator', description: 'Optimises pricing, tracks top SKUs, and drives upsell opportunities.' },
    { id: 'researcher', name: 'Iris', role: 'researcher', emoji: '🔬', subtitle: 'Research Operator', description: 'Monitors market trends, competitor products, and sourcing opportunities.' },
  ],
  Agency: [
    { id: 'sales', name: 'Alex', role: 'sales', emoji: '📈', subtitle: 'Sales Operator', description: 'Manages proposals, follows up on leads, and tracks deal flow.' },
    { id: 'marketing', name: 'Max', role: 'marketing', emoji: '📣', subtitle: 'Marketing Operator', description: 'Creates case studies, manages social, and drives inbound leads.' },
    { id: 'researcher', name: 'Iris', role: 'researcher', emoji: '🔬', subtitle: 'Research Operator', description: 'Audits client needs and benchmarks against industry standards.' },
    { id: 'support', name: 'Casey', role: 'support', emoji: '🎧', subtitle: 'Support Operator', description: 'Keeps clients updated and manages communication threads.' },
  ],
  Healthcare: [
    { id: 'researcher', name: 'Iris', role: 'researcher', emoji: '🔬', subtitle: 'Research Operator', description: 'Synthesises clinical research, monitors compliance changes, and tracks outcomes.' },
    { id: 'support', name: 'Casey', role: 'support', emoji: '🎧', subtitle: 'Support Operator', description: 'Handles patient inquiries, scheduling reminders, and FAQ responses.' },
    { id: 'engineer', name: 'Dev', role: 'engineer', emoji: '⚙️', subtitle: 'Engineering Operator', description: 'Manages data pipelines, EHR integrations, and technical infrastructure.' },
    { id: 'marketing', name: 'Max', role: 'marketing', emoji: '📣', subtitle: 'Marketing Operator', description: 'Handles patient education content and brand communications.' },
  ],
  Logistics: [
    { id: 'engineer', name: 'Dev', role: 'engineer', emoji: '⚙️', subtitle: 'Engineering Operator', description: 'Manages routing algorithms, fleet data, and system integrations.' },
    { id: 'support', name: 'Casey', role: 'support', emoji: '🎧', subtitle: 'Support Operator', description: 'Handles shipment queries, delays, and carrier communications.' },
    { id: 'sales', name: 'Alex', role: 'sales', emoji: '📈', subtitle: 'Sales Operator', description: 'Manages enterprise accounts and identifies new shipping volume opportunities.' },
    { id: 'researcher', name: 'Iris', role: 'researcher', emoji: '🔬', subtitle: 'Research Operator', description: 'Tracks regulations, lane pricing, and supply chain disruptions.' },
  ],
  Finance: [
    { id: 'researcher', name: 'Iris', role: 'researcher', emoji: '🔬', subtitle: 'Research Operator', description: 'Analyses market signals, tracks portfolio risks, and monitors macroeconomic data.' },
    { id: 'sales', name: 'Alex', role: 'sales', emoji: '📈', subtitle: 'Sales Operator', description: 'Manages investor relations, tracks pipeline, and drives AUM growth.' },
    { id: 'engineer', name: 'Dev', role: 'engineer', emoji: '⚙️', subtitle: 'Engineering Operator', description: 'Maintains trading infrastructure, data feeds, and reporting pipelines.' },
    { id: 'support', name: 'Casey', role: 'support', emoji: '🎧', subtitle: 'Support Operator', description: 'Handles client account queries and compliance documentation requests.' },
  ],
  Retail: [
    { id: 'marketing', name: 'Max', role: 'marketing', emoji: '📣', subtitle: 'Marketing Operator', description: 'Drives foot traffic and online sales through targeted campaigns.' },
    { id: 'support', name: 'Casey', role: 'support', emoji: '🎧', subtitle: 'Support Operator', description: 'Manages returns, loyalty queries, and store-level customer service.' },
    { id: 'sales', name: 'Alex', role: 'sales', emoji: '📈', subtitle: 'Sales Operator', description: 'Optimises pricing, tracks sell-through, and manages vendor relations.' },
    { id: 'researcher', name: 'Iris', role: 'researcher', emoji: '🔬', subtitle: 'Research Operator', description: 'Monitors trends, competitor pricing, and seasonal demand signals.' },
  ],
  Other: [
    { id: 'sales', name: 'Alex', role: 'sales', emoji: '📈', subtitle: 'Sales Operator', description: 'Manages pipeline, outreach, and revenue growth for your business.' },
    { id: 'marketing', name: 'Max', role: 'marketing', emoji: '📣', subtitle: 'Marketing Operator', description: 'Handles brand, content, and growth marketing autonomously.' },
    { id: 'support', name: 'Casey', role: 'support', emoji: '🎧', subtitle: 'Support Operator', description: 'Triages customer requests and maintains satisfaction metrics.' },
    { id: 'researcher', name: 'Iris', role: 'researcher', emoji: '🔬', subtitle: 'Research Operator', description: 'Monitors industry signals and surfaces opportunities for your team.' },
  ],
};

const ROLE_SYSTEM_PROMPTS = {
  sales: (company, mission) => `You are Alex, Sales Operator at ${company}. Mission: ${mission}.

You own the pipeline — from first outreach to signed deal. When leads go cold you warm them. When demos aren't converting you diagnose why and fix it. You don't describe the sales process; you run it.

## Voice & Tone
- Sharp, personable, relentlessly follow-through
- Direct — say what you mean, then act on it
- You know that silence kills deals

## Every heartbeat
1. Check pipeline for stale leads (no contact in 3+ days)
2. Draft follow-up sequences for warm prospects
3. Surface what's blocking conversion and propose a fix
4. Log pipeline status and next actions

## Rules
- Revenue is your report card. Treat it that way.
- Fix first, report after. Don't escalate problems you can resolve.
- Never fabricate lead data or pipeline status.
- Take a position on deals — is this worth pursuing or not?
- **Never mark a task as blocked.** If you need access, a decision, or a resource — use create_approval to ask the founder. State what you need and what you'll do once you have it.`,

  marketing: (company, mission) => `You are Max, Marketing Operator at ${company}. Mission: ${mission}.

You own growth — content, brand, distribution, demand generation. You don't ask what to post; you build the calendar, write the copy, and get it out. You track what's resonating and double down on it.

## Voice & Tone
- Creative but rigorous — you can write a compelling hook AND read a conversion funnel
- Opinionated about what works, honest about what doesn't
- Brand-consistent, channel-native

## Every heartbeat
1. Check content cadence — is anything overdue?
2. Surface what's performing (clicks, opens, engagement)
3. Identify distribution gaps or missed opportunities
4. Propose one concrete content or campaign action

## Rules
- Growth is a system. Build it, don't just describe it.
- Measure everything you ship. No vanity metrics.
- Fix first, report after. Don't escalate problems you can resolve.
- **Never mark a task as blocked.** If you need access, a decision, or a resource — use create_approval to ask the founder. State what you need and what you'll do once you have it.`,

  support: (company, mission) => `You are Casey, Support Operator at ${company}. Mission: ${mission}.

You own customer experience end-to-end. A ticket comes in — it gets triaged, routed, and resolved. You spot patterns in support volume and flag them before they become crises. Customer retention is revenue. That's why this role exists.

## Voice & Tone
- Calm, precise, warm — customers are people, treat them like it
- Don't confuse warmth with slowness
- Clear and specific in every response — no vague reassurances

## Every heartbeat
1. Review open tickets and check SLA compliance
2. Identify tickets older than 24h with no response
3. Surface recurring issues that need product attention
4. Flag any customer who is at churn risk

## Rules
- Every open ticket is a customer at risk. Treat it accordingly.
- Fix first, report after. Don't escalate problems you can resolve.
- Never fabricate resolution status or feature timelines.
- **Never mark a task as blocked.** If you need access, a decision, or a resource — use create_approval to ask the founder. State what you need and what you'll do once you have it.`,

  engineer: (company, mission) => `You are Dev, Engineering Operator at ${company}. Mission: ${mission}.

You own technical execution — bug resolution, feature delivery, infrastructure health. You don't describe what needs doing; you create the tasks, set priorities, and track delivery. Shipping beats discussing.

## Voice & Tone
- Systematic, precise, no drama
- Good engineering is invisible when it works
- Flag technical risk early and clearly

## Every heartbeat
1. Check deployment health and production error rates
2. Review blocked technical tasks and unblock or escalate
3. Flag any infrastructure issues, slow queries, or SSL expiry
4. Check if any long-running jobs have stalled

## Rules
- Ship code, don't just plan it.
- Fix first, report after. Don't escalate problems you can resolve.
- Never fabricate build status or test results.
- Security and reliability first — convenience second.
- **Never mark a task as blocked.** If you need access, a decision, or a resource — use create_approval to ask the founder. State what you need and what you'll do once you have it.`,

  researcher: (company, mission) => `You are Iris, Research Operator at ${company}. Mission: ${mission}.

You surface the information this company needs to make good decisions — market trends, competitor moves, customer signals. You don't just send links; you synthesize and recommend. Insight without action is just trivia.

## Voice & Tone
- Curious, evidence-driven, opinionated when the data supports it
- Rigorous without being academic
- Concise summaries, clear recommendations

## Every heartbeat
1. Scan industry signals and competitor activity
2. Update competitive intelligence with any notable changes
3. Surface one actionable insight the team should act on
4. Flag any emerging threats or opportunities

## Rules
- Make your research matter — always end with a recommendation.
- Cite sources. Don't fabricate data or trends.
- Fix first, report after. Don't escalate problems you can resolve.
- **Never mark a task as blocked.** If you need access, a decision, or a resource — use create_approval to ask the founder. State what you need and what you'll do once you have it.`,
};

const DEPLOY_STEPS = [
  'Creating your workspace...',
  'Initializing Freemi as CEO...',
  'Building agent souls...',
  'Configuring memory layers...',
  'Scheduling heartbeat cycles...',
  'Deploying operators to Fly.io...',
  'Your company is live!',
];

// ── Typing animation ───────────────────────────────────────────────────────────
function TypedText({ text, onDone }) {
  const [shown, setShown] = useState('');
  const i = useRef(0);
  useEffect(() => {
    setShown(''); i.current = 0;
    const iv = setInterval(() => {
      i.current++;
      setShown(text.slice(0, i.current));
      if (i.current >= text.length) { clearInterval(iv); if (onDone) onDone(); }
    }, 18);
    return () => clearInterval(iv);
  }, [text]);
  return <span>{shown}<span className="animate-pulse opacity-60">▌</span></span>;
}

// ── Freemi speech bubble ───────────────────────────────────────────────────────
function FreemiSays({ message, onTyped }) {
  return (
    <motion.div key={message} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-end gap-3 mb-5">
      <div className="flex-shrink-0 mb-1">
        <FreemiCharacter size="sm" color="#5B5FFF" />
      </div>
      <div className="relative max-w-xs">
        <div className="absolute -left-1.5 bottom-4 w-3 h-3 rotate-45"
          style={{ background: 'white', borderLeft: '1.5px solid rgba(91,95,255,0.12)', borderBottom: '1.5px solid rgba(91,95,255,0.12)' }} />
        <div className="rounded-2xl rounded-bl-sm px-4 py-3.5"
          style={{ background: 'white', border: '1.5px solid rgba(91,95,255,0.12)', boxShadow: '0 6px 24px rgba(91,95,255,0.10)' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#1E293B', minHeight: 20 }}>
            <TypedText text={message} onDone={onTyped} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Step dots ──────────────────────────────────────────────────────────────────
function StepDots({ total, current }) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div key={i}
          animate={{ width: i === current ? 24 : 8, background: i <= current ? '#5B5FFF' : '#E2E8F0' }}
          transition={{ duration: 0.3 }}
          className="h-2 rounded-full" />
      ))}
    </div>
  );
}

// ── Agent recommendation card ──────────────────────────────────────────────────
function AgentCard({ agent, selected, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left rounded-2xl p-4 transition-all relative"
      style={{
        background: selected ? 'rgba(91,95,255,0.06)' : 'white',
        border: `2px solid ${selected ? '#5B5FFF' : 'rgba(91,95,255,0.12)'}`,
        boxShadow: selected ? '0 4px 20px rgba(91,95,255,0.12)' : '0 2px 8px rgba(91,95,255,0.05)',
      }}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: selected ? 'rgba(91,95,255,0.12)' : '#F1F5F9' }}>
          {agent.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-sm" style={{ color: '#0A0F1E' }}>{agent.name}</p>
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: selected ? '#5B5FFF' : '#E2E8F0' }}>
              {selected && <Check size={11} className="text-white" />}
            </div>
          </div>
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: selected ? '#5B5FFF' : '#94A3B8' }}>
            {agent.subtitle}
          </p>
          <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#64748B' }}>
            {agent.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

// ── Animated deploy progress ───────────────────────────────────────────────────
function DeployProgress({ step }) {
  return (
    <div className="w-full space-y-2.5 py-2">
      {DEPLOY_STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <motion.div key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: done || active ? 1 : 0.3, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: done ? '#10B981' : active ? '#5B5FFF' : '#E2E8F0',
                transition: 'background 0.3s',
              }}>
              {done
                ? <Check size={11} className="text-white" />
                : active
                  ? <Loader2 size={11} className="text-white animate-spin" />
                  : null}
            </div>
            <span className="text-sm font-medium"
              style={{ color: done ? '#10B981' : active ? '#5B5FFF' : '#CBD5E1' }}>
              {label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Setup wizard ───────────────────────────────────────────────────────────────
function CompanySetupWizard({ onCreated, onCancel, isFirst }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { onCompanyCreated } = useCompany();

  const [phase, setPhase] = useState('intro');
  const [typed, setTyped] = useState(false);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('SaaS');
  const [customIndustry, setCustomIndustry] = useState('');
  const [mission, setMission] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteContent, setWebsiteContent] = useState('');
  const [websiteLoading, setWebsiteLoading] = useState(false);
  const [websiteError, setWebsiteError] = useState('');
  const [boardRecs, setBoardRecs] = useState([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState(new Set());
  const [deployStep, setDeployStep] = useState(0);
  const [error, setError] = useState('');

  const nameRef = useRef();
  const missionRef = useRef();
  const websiteRef = useRef();

  useEffect(() => {
    if (phase === 'name') setTimeout(() => nameRef.current?.focus(), 300);
    if (phase === 'mission') setTimeout(() => missionRef.current?.focus(), 300);
    if (phase === 'website') setTimeout(() => websiteRef.current?.focus(), 300);
  }, [phase]);

  // Build board recs when entering board phase — use LLM to reason about mission + industry
  useEffect(() => {
    if (phase !== 'board') return;

    setBoardLoading(true);
    setBoardRecs([]);

    const prompt = `You are recommending an AI agent team for a new company.

Company name: ${name}
Industry: ${industry}
Mission: ${mission}${websiteContent ? `\n\nCompany website context:\n${websiteContent}` : ''}

Based on the MISSION and company context (not just the industry), recommend exactly 4 AI operators from this list:
- sales: grows revenue, manages pipeline and outreach
- marketing: content, brand, campaigns, social media, PR
- support: customer success, resolves issues, manages relationships
- engineer: technical work, product development, specs
- researcher: market research, competitive analysis, data insights
- ops: operations, logistics, process optimization
- finance: budgeting, financial tracking, forecasting

Return ONLY a JSON array of exactly 4 objects, no other text:
[{"role":"<role>","name":"<short name>","reason":"<1 sentence why this specific mission needs this role>"}]

Pick the roles that best fit the MISSION. If the mission is about media/content, prioritize marketing and researcher. If it's about sales growth, prioritize sales. Think carefully.`;

    chatProxyFn({
      agentName: 'Freemi',
      agentRole: 'CEO',
      messages: [{ role: 'user', content: prompt }],
    }).then(result => {
      try {
        const text = result.data?.reply || '';
        const match = text.match(/\[[\s\S]*\]/);
        if (!match) throw new Error('No JSON array found');
        const parsed = JSON.parse(match[0]);

        const ROLE_EMOJIS = { sales: '📈', marketing: '📣', support: '🎧', engineer: '⚙️', researcher: '🔬', ops: '📊', finance: '💰' };
        const ROLE_NAMES  = { sales: 'Alex', marketing: 'Max', support: 'Casey', engineer: 'Dev', researcher: 'Iris', ops: 'Nova', finance: 'Quinn' };

        const recs = parsed.slice(0, 4).map(a => ({
          id:          a.role,
          name:        a.name || ROLE_NAMES[a.role] || a.role,
          role:        a.role,
          emoji:       ROLE_EMOJIS[a.role] || '🤖',
          subtitle:    `${a.role.charAt(0).toUpperCase() + a.role.slice(1)} Operator`,
          description: a.reason || `Handles ${a.role} for your company.`,
        }));

        setBoardRecs(recs);
        setSelectedAgents(new Set(recs.slice(0, 2).map(a => a.id)));
      } catch {
        // Fallback to hardcoded
        const recs = BOARD_TEMPLATES[industry] || BOARD_TEMPLATES.Other;
        setBoardRecs(recs);
        setSelectedAgents(new Set(recs.slice(0, 2).map(a => a.id)));
      }
    }).catch(() => {
      const recs = BOARD_TEMPLATES[industry] || BOARD_TEMPLATES.Other;
      setBoardRecs(recs);
      setSelectedAgents(new Set(recs.slice(0, 2).map(a => a.id)));
    }).finally(() => setBoardLoading(false));

  }, [phase]);

  function resolveUid() {
    if (user?.uid) return user.uid;
    let id = localStorage.getItem('freemi_guest_id');
    if (!id) { id = 'guest-' + Math.random().toString(36).slice(2, 10); localStorage.setItem('freemi_guest_id', id); }
    return id;
  }

  async function handleReadWebsite() {
    if (!websiteUrl.trim()) return;
    setWebsiteLoading(true);
    setWebsiteError('');
    let url = websiteUrl.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    try {
      const result = await readWebsiteFn({ url });
      const text = result.data?.text || '';
      setWebsiteContent(text);
      // Auto-advance to board after a brief moment
      setTimeout(() => { setTyped(false); setPhase('board'); }, 800);
    } catch (err) {
      setWebsiteError("Couldn't read that URL — paste some content below or skip.");
    } finally {
      setWebsiteLoading(false);
    }
  }

  function toggleAgent(id) {
    setSelectedAgents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function launch() {
    setPhase('deploying');
    setDeployStep(0);
    setError('');

    const uid = resolveUid();
    const chosenAgents = boardRecs.filter(a => selectedAgents.has(a.id));

    try {
      // Step 0: create workspace
      const finalIndustry = industry === 'Other' ? (customIndustry || 'Other') : industry;
      const companyId = await createCompany(uid, { name, industry: finalIndustry, mission, websiteUrl: websiteUrl || null, websiteContent: websiteContent || null, size: 'startup' });
      setDeployStep(1);

      // Step 1: create CEO agent
      const ceoId = await createCEOAgent(companyId, uid);
      setDeployStep(2);
      await new Promise(r => setTimeout(r, 600));

      // Step 2: build agent souls (create approvals + auto-approve)
      setDeployStep(3);
      await new Promise(r => setTimeout(r, 500));

      for (const agent of chosenAgents) {
        const systemPrompt = ROLE_SYSTEM_PROMPTS[agent.role]
          ? ROLE_SYSTEM_PROMPTS[agent.role](name, mission)
          : `You are ${agent.name}, a ${agent.role} operator at ${name}.`;

        const approvalId = await createApproval(companyId, ceoId || uid, {
          type: 'hire_agent',
          title: `Hire ${agent.name} (${agent.role})`,
          description: `${agent.description}`,
          payload: {
            name: agent.name,
            role: agent.role,
            reportsTo: ceoId || null,
            monthlyBudgetUsd: 30,
            heartbeatIntervalMinutes: 60,
            systemPrompt,
          },
        });
        // Auto-approve — triggers onApprovalDecided cloud function → Fly provisioning
        await approveRequest(companyId, uid, approvalId, 'Auto-approved during setup');
      }

      setDeployStep(4);
      await new Promise(r => setTimeout(r, 500));

      // Step 4-5: memory/heartbeat setup (cosmetic delay)
      setDeployStep(5);
      await new Promise(r => setTimeout(r, 600));

      setDeployStep(6);

      // Mark bootstrapped
      await markBootstrapped(companyId);
      onCompanyCreated(companyId, { name, industry: finalIndustry, mission });

      await new Promise(r => setTimeout(r, 800));
      setPhase('done');
      setTimeout(() => { onCreated(companyId); navigate('/dashboard'); }, 1800);

    } catch (e) {
      console.error('Launch error:', e);
      setError(e.message || 'Something went wrong. Please try again.');
      setPhase('mission');
    }
  }

  const MSGS = {
    intro: isFirst
      ? "Hey! I'm Freemi — your AI Chief Executive. I run your company, hire agents, and handle the work while you focus on what matters. Let's set up your first company!"
      : "Let's set up a new company. I'll create a fresh workspace with its own agents, goals, and team.",
    name:      "What's your company called?",
    industry:  `Nice! What industry is ${name || 'your company'} in?`,
    mission:   `Perfect. What's the mission? Be specific — I'll use this to set goals and direct every agent.`,
    website:   `Got it! Got a website or content I can read to learn more about ${name || 'your company'}? This helps me build a smarter team. (Optional — you can skip this.)`,
    board:     `Based on your mission${websiteContent ? ' and your website' : ''}, here's my recommended founding board. Pick who to bring on — you can always add more later.`,
    deploying: `Building your company and hiring your team...`,
    done:      `You're live! Freemi is running as CEO and your operators are spinning up. Let's go! 🚀`,
  };

  const PHASES = ['intro', 'name', 'industry', 'mission', 'website', 'board'];
  const phaseIndex = PHASES.indexOf(phase);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-2 py-6 max-w-md mx-auto w-full">
      {phaseIndex >= 0 && <StepDots total={6} current={phaseIndex} />}

      <AnimatePresence mode="wait">
        {['intro','name','industry','mission','website','board'].includes(phase) && (
          <FreemiSays key={phase} message={MSGS[phase]} onTyped={() => setTyped(true)} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* Intro */}
        {phase === 'intro' && typed && (
          <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-2">
            <button onClick={() => { setTyped(false); setPhase('name'); }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#5B5FFF,#7C3AED)', boxShadow: '0 6px 24px rgba(91,95,255,0.35)' }}>
              <Sparkles size={16} /> {isFirst ? "Let's build my company" : "Create new company"}
            </button>
            {!isFirst && (
              <button onClick={onCancel} className="w-full py-3 text-sm font-medium" style={{ color: '#94A3B8' }}>
                Cancel
              </button>
            )}
          </motion.div>
        )}

        {/* Company name */}
        {phase === 'name' && typed && (
          <motion.div key="name" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex gap-2">
            <input ref={nameRef} value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && (setTyped(false), setPhase('industry'))}
              placeholder="e.g. Acme Corp"
              className="flex-1 px-5 py-4 rounded-2xl text-base font-medium outline-none transition-all"
              style={{ background: 'white', border: '2px solid rgba(91,95,255,0.20)', color: '#0A0F1E', boxShadow: '0 4px 16px rgba(91,95,255,0.08)' }}
              onFocus={e => e.target.style.borderColor = '#5B5FFF'}
              onBlur={e => e.target.style.borderColor = 'rgba(91,95,255,0.20)'}
            />
            <button onClick={() => { if (name.trim()) { setTyped(false); setPhase('industry'); } }} disabled={!name.trim()}
              className="px-5 py-4 rounded-2xl font-bold text-white flex-shrink-0"
              style={{ background: name.trim() ? 'linear-gradient(135deg,#5B5FFF,#7C3AED)' : '#E2E8F0', boxShadow: name.trim() ? '0 4px 16px rgba(91,95,255,0.3)' : 'none' }}>
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* Industry */}
        {phase === 'industry' && typed && (
          <motion.div key="industry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map(ind => (
              <button key={ind} onClick={() => {
                setIndustry(ind);
                if (ind !== 'Other') { setCustomIndustry(''); setTyped(false); setPhase('mission'); }
              }}
                className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: industry === ind ? 'rgba(91,95,255,0.08)' : 'white',
                  border: `2px solid ${industry === ind ? '#5B5FFF' : 'rgba(91,95,255,0.12)'}`,
                  color: industry === ind ? '#5B5FFF' : '#374151',
                  boxShadow: '0 2px 8px rgba(91,95,255,0.06)',
                }}>
                {ind}
              </button>
            ))}
            </div>
            {industry === 'Other' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                <input
                  autoFocus
                  value={customIndustry}
                  onChange={e => setCustomIndustry(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && customIndustry.trim()) { setIndustry(customIndustry.trim()); setTyped(false); setPhase('mission'); } }}
                  placeholder="Type your industry..."
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                  style={{ background: 'white', border: '2px solid #5B5FFF', color: '#0A0F1E' }}
                />
                <button
                  onClick={() => { if (customIndustry.trim()) { setIndustry(customIndustry.trim()); setTyped(false); setPhase('mission'); } }}
                  disabled={!customIndustry.trim()}
                  className="px-5 py-3 rounded-xl font-bold text-white text-sm"
                  style={{ background: customIndustry.trim() ? 'linear-gradient(135deg,#5B5FFF,#7C3AED)' : '#E2E8F0' }}>
                  Next →
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Mission */}
        {phase === 'mission' && typed && (
          <motion.div key="mission" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-3">
            <textarea ref={missionRef} value={mission} onChange={e => setMission(e.target.value)}
              placeholder="e.g. Become the go-to CRM for solo founders and close 50 deals by end of year"
              rows={3}
              className="w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none transition-all resize-none"
              style={{ background: 'white', border: '2px solid rgba(91,95,255,0.20)', color: '#0A0F1E', lineHeight: 1.7, boxShadow: '0 4px 16px rgba(91,95,255,0.08)' }}
              onFocus={e => e.target.style.borderColor = '#5B5FFF'}
              onBlur={e => e.target.style.borderColor = 'rgba(91,95,255,0.20)'}
            />
            <p className="text-xs" style={{ color: '#94A3B8' }}>Tip: be specific — "grow revenue 3x" beats "be successful"</p>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button onClick={() => { if (mission.trim()) { setTyped(false); setPhase('website'); } }} disabled={!mission.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white"
              style={{ background: mission.trim() ? 'linear-gradient(135deg,#5B5FFF,#7C3AED)' : '#E2E8F0', boxShadow: mission.trim() ? '0 6px 24px rgba(91,95,255,0.35)' : 'none' }}>
              <ArrowRight size={16} /> Continue
            </button>
          </motion.div>
        )}

        {/* Website / content */}
        {phase === 'website' && typed && (
          <motion.div key="website" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-3">
            <div className="relative">
              <Link size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
              <input
                ref={websiteRef}
                value={websiteUrl}
                onChange={e => { setWebsiteUrl(e.target.value); setWebsiteError(''); }}
                onKeyDown={e => e.key === 'Enter' && websiteUrl.trim() && handleReadWebsite()}
                placeholder="https://yourcompany.com"
                className="w-full pl-10 pr-4 py-4 rounded-2xl text-sm font-medium outline-none transition-all"
                style={{ background: 'white', border: '2px solid rgba(91,95,255,0.20)', color: '#0A0F1E', boxShadow: '0 4px 16px rgba(91,95,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = '#5B5FFF'}
                onBlur={e => e.target.style.borderColor = 'rgba(91,95,255,0.20)'}
              />
            </div>

            {websiteError && (
              <p className="text-xs px-1" style={{ color: '#EF4444' }}>{websiteError}</p>
            )}
            {websiteContent && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Check size={13} style={{ color: '#10B981' }} />
                <span className="text-xs font-semibold" style={{ color: '#10B981' }}>Website read — I'll use this to build your team</span>
              </div>
            )}

            <button
              onClick={handleReadWebsite}
              disabled={!websiteUrl.trim() || websiteLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white"
              style={{ background: websiteUrl.trim() && !websiteLoading ? 'linear-gradient(135deg,#5B5FFF,#7C3AED)' : '#E2E8F0', boxShadow: websiteUrl.trim() && !websiteLoading ? '0 6px 24px rgba(91,95,255,0.35)' : 'none' }}>
              {websiteLoading ? <><Loader2 size={15} className="animate-spin" /> Reading site…</> : <><Globe size={15} /> Read my website</>}
            </button>

            <button
              onClick={() => { setTyped(false); setPhase('board'); }}
              className="w-full py-2.5 text-sm font-medium"
              style={{ color: '#94A3B8' }}>
              Skip — build team without it
            </button>
          </motion.div>
        )}

        {/* Board recommendation */}
        {phase === 'board' && typed && (
          <motion.div key="board" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-3">
            {/* Freemi badge */}
            <div className="flex items-center gap-2 px-1 mb-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(91,95,255,0.08)', border: '1px solid rgba(91,95,255,0.15)' }}>
                <Brain size={11} style={{ color: '#5B5FFF' }} />
                <span className="text-[11px] font-bold" style={{ color: '#5B5FFF' }}>Freemi's Recommendation</span>
              </div>
              <span className="text-[11px]" style={{ color: '#94A3B8' }}>{selectedAgents.size} of {boardRecs.length} selected</span>
            </div>

            {/* Agent cards */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {boardLoading && (
                <div className="flex items-center gap-2 py-6 justify-center">
                  <Loader2 size={16} className="animate-spin" style={{ color: '#5B5FFF' }} />
                  <span className="text-sm font-medium" style={{ color: '#94A3B8' }}>Freemi is thinking about your mission…</span>
                </div>
              )}
              {boardRecs.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  selected={selectedAgents.has(agent.id)}
                  onToggle={() => toggleAgent(agent.id)}
                />
              ))}
            </div>

            {/* Launch button */}
            <button onClick={launch}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white mt-2"
              style={{ background: 'linear-gradient(135deg,#5B5FFF,#7C3AED)', boxShadow: '0 6px 24px rgba(91,95,255,0.35)' }}>
              <Zap size={16} />
              {selectedAgents.size > 0
                ? `Launch with ${selectedAgents.size} operator${selectedAgents.size !== 1 ? 's' : ''}`
                : 'Launch with Freemi only'}
            </button>

            <button onClick={() => launch()}
              className="w-full py-2 text-xs font-medium"
              style={{ color: '#94A3B8' }}>
              Skip — I'll hire later
            </button>
          </motion.div>
        )}

        {/* Deploying */}
        {phase === 'deploying' && (
          <motion.div key="deploying" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-5 py-2 w-full">

            {/* Animated logo */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#5B5FFF,#7C3AED)', boxShadow: '0 8px 30px rgba(91,95,255,0.4)' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Zap size={28} className="text-white" />
                </motion.div>
              </div>
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ border: '2px solid rgba(91,95,255,0.4)' }}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }} />
            </div>

            <DeployProgress step={deployStep} />
          </motion.div>
        )}

        {/* Done */}
        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-4">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}>
              <Check size={24} className="text-white" />
            </motion.div>
            <p className="text-sm font-bold text-center" style={{ color: '#10B981' }}>Company created! Taking you in…</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ── Edit panel ─────────────────────────────────────────────────────────────────
function EditPanel({ co, onSave, onClose }) {
  const [form, setForm] = useState({ name: co.name || '', industry: co.industry || 'SaaS', mission: co.mission || '' });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await updateCompany(co.id, { name: form.name, industry: form.industry, mission: form.mission });
    setSaving(false);
    onSave({ ...co, ...form });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col w-full"
        style={{ maxWidth: 460, maxHeight: '90vh', background: 'white', borderRadius: 24, boxShadow: '0 24px 80px rgba(91,95,255,0.18), 0 8px 32px rgba(0,0,0,0.10)', border: '1px solid rgba(91,95,255,0.1)', pointerEvents: 'all' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(91,95,255,0.08)' }}>
          <div>
            <p className="font-black text-base" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Edit Company</p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{co.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors" style={{ color: '#94A3B8' }}>
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#94A3B8' }}>Company name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: '#F8FAFF', border: '1.5px solid rgba(91,95,255,0.15)', color: '#0A0F1E' }}
              onFocus={e => e.target.style.borderColor = '#5B5FFF'}
              onBlur={e => e.target.style.borderColor = 'rgba(91,95,255,0.15)'} />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>Industry</label>
            <div className="flex flex-wrap gap-1.5">
              {INDUSTRIES.map(ind => (
                <button key={ind} onClick={() => set('industry', ind)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: form.industry === ind ? 'rgba(91,95,255,0.10)' : '#F8FAFF',
                    border: `1.5px solid ${form.industry === ind ? '#5B5FFF' : 'rgba(91,95,255,0.12)'}`,
                    color: form.industry === ind ? '#5B5FFF' : '#64748B',
                  }}>
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#94A3B8' }}>Mission</label>
            <textarea value={form.mission} onChange={e => set('mission', e.target.value)}
              placeholder="What are you building and why?"
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
              style={{ background: '#F8FAFF', border: '1.5px solid rgba(91,95,255,0.15)', color: '#0A0F1E', lineHeight: 1.7 }}
              onFocus={e => e.target.style.borderColor = '#5B5FFF'}
              onBlur={e => e.target.style.borderColor = 'rgba(91,95,255,0.15)'} />
            <p className="text-[11px] mt-1.5" style={{ color: '#94A3B8' }}>Freemi uses this to guide every agent and goal.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex-shrink-0 flex gap-2"
          style={{ borderTop: '1px solid rgba(91,95,255,0.08)', borderRadius: '0 0 24px 24px', background: '#FAFBFF' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#F1F5F9', color: '#64748B' }}
            onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}>
            Cancel
          </button>
          <button onClick={save} disabled={saving || !form.name.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#5B5FFF,#7C3AED)', boxShadow: '0 4px 14px rgba(91,95,255,0.3)' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Save changes</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Company card ───────────────────────────────────────────────────────────────
function CompanyCard({ co, isActive, agentCount, onOpen, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: isActive ? 'rgba(91,95,255,0.04)' : 'white',
        border: isActive ? '2px solid rgba(91,95,255,0.28)' : '1.5px solid rgba(91,95,255,0.10)',
        boxShadow: isActive ? '0 6px 28px rgba(91,95,255,0.12)' : '0 2px 12px rgba(91,95,255,0.06)',
      }}>

      <button onClick={onOpen} className="w-full text-left p-5 transition-colors block"
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(91,95,255,0.02)'; }}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#5B5FFF,#7C3AED)', boxShadow: '0 4px 12px rgba(91,95,255,0.3)' }}>
              {co.name?.[0]?.toUpperCase() || 'F'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm" style={{ color: '#0A0F1E' }}>{co.name}</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                {co.industry || 'Company'} · {agentCount} operator{agentCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isActive && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: 'rgba(91,95,255,0.10)', color: '#5B5FFF' }}>Active</span>
            )}
            <ExternalLink size={14} style={{ color: '#CBD5E1' }} />
          </div>
        </div>

        {co.mission && (
          <p className="mt-3 text-xs leading-relaxed line-clamp-2"
            style={{ color: '#64748B', borderTop: '1px solid rgba(91,95,255,0.07)', paddingTop: 10 }}>
            {co.mission}
          </p>
        )}
      </button>

      <div className="flex items-center justify-between px-5 py-2.5"
        style={{ borderTop: '1px solid rgba(91,95,255,0.07)', background: 'rgba(91,95,255,0.02)' }}>
        <div className="flex items-center gap-3">
          {[
            { icon: Users, label: `${agentCount} Agents`, color: '#5B5FFF' },
            { icon: Target, label: 'Goals', color: '#00B894' },
            { icon: MessageSquare, label: 'Chat', color: '#E17055' },
          ].map(({ icon: Icon, label, color }) => (
            <span key={label} className="flex items-center gap-1 text-[11px] font-medium" style={{ color: '#94A3B8' }}>
              <Icon size={11} style={{ color }} />{label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={e => { e.stopPropagation(); onEdit(); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.07)'; e.currentTarget.style.color = '#5B5FFF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
            <Pencil size={11} /> Edit
          </button>
          {!isActive && (
            <button onClick={e => { e.stopPropagation(); onDelete(); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{ color: '#94A3B8' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.color = '#EF4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
              <Trash2 size={11} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function CompaniesView() {
  const { company, allCompanies, agents, activeCompanyId, switchCompany, isBootstrapped } = useCompany();
  const navigate = useNavigate();
  const [addingNew, setAddingNew] = useState(false);
  const [editingCo, setEditingCo] = useState(null);

  const hasCompany = allCompanies.length > 0 && isBootstrapped;

  if (!hasCompany || addingNew) {
    return (
      <div className="h-full overflow-y-auto"
        style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>
        <CompanySetupWizard
          isFirst={!hasCompany}
          onCreated={() => setAddingNew(false)}
          onCancel={() => setAddingNew(false)}
        />
      </div>
    );
  }

  const handleOpen = (id) => {
    if (id !== activeCompanyId) switchCompany(id);
    navigate('/dashboard');
  };

  return (
    <div className="h-full overflow-y-auto px-5 py-7 max-w-2xl mx-auto">

      <AnimatePresence>
        {editingCo && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              style={{ background: 'rgba(10,15,30,0.25)', backdropFilter: 'blur(3px)' }}
              onClick={() => setEditingCo(null)} />
            <EditPanel
              co={editingCo}
              onSave={() => {}}
              onClose={() => setEditingCo(null)}
            />
          </>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Companies</h1>
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
            {allCompanies.length} workspace{allCompanies.length !== 1 ? 's' : ''} · click to open
          </p>
        </div>
        <button onClick={() => setAddingNew(true)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#5B5FFF,#7C3AED)', boxShadow: '0 4px 14px rgba(91,95,255,0.3)' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(91,95,255,0.45)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(91,95,255,0.3)'}>
          <Plus size={14} /> New
        </button>
      </div>

      <div className="space-y-3">
        {allCompanies.map(co => (
          <CompanyCard
            key={co.id}
            co={co}
            isActive={co.id === activeCompanyId}
            agentCount={co.id === activeCompanyId ? agents.length : 0}
            onOpen={() => handleOpen(co.id)}
            onEdit={() => setEditingCo(co)}
            onDelete={() => {
              if (window.confirm(`Delete "${co.name}"? This cannot be undone.`)) {
                deleteDoc(doc(firestore, 'companies', co.id)).catch(console.error);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
