"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOpenClawWorkspace = generateOpenClawWorkspace;
function normalizeAnswer(value) {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length ? trimmed : null;
    }
    if (Array.isArray(value)) {
        const items = value
            .map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry).trim()))
            .filter(Boolean);
        return items.length ? items.join(', ') : null;
    }
    return value == null ? null : String(value);
}
function listAnswer(value) {
    if (Array.isArray(value)) {
        return value
            .map((entry) => normalizeAnswer(entry))
            .filter((entry) => Boolean(entry));
    }
    const normalized = normalizeAnswer(value);
    if (!normalized)
        return [];
    return normalized.includes(',')
        ? normalized.split(',').map((item) => item.trim()).filter(Boolean)
        : [normalized];
}
function titleCase(value, fallback) {
    if (!value)
        return fallback;
    return value
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
function inferOperatorName(agentType) {
    switch (agentType) {
        case 'freemi_operator':
            return 'Freemi';
        case 'dev_operator':
            return 'Dev';
        case 'sales_operator':
            return 'Rex';
        case 'support_operator':
            return 'Triager';
        case 'custom_operator':
            return 'Operator';
        default:
            return 'Operator';
    }
}
function inferOperatorRole(agentType) {
    switch (agentType) {
        case 'freemi_operator':
            return 'Business Operator';
        case 'dev_operator':
            return 'Development Operator';
        case 'sales_operator':
            return 'Sales Operator';
        case 'support_operator':
            return 'Support Operator';
        case 'custom_operator':
            return 'Custom Operator';
        default:
            return 'Operator';
    }
}
function buildBusinessSummary(answers) {
    return (normalizeAnswer(answers.businessName) ||
        normalizeAnswer(answers.business_name) ||
        normalizeAnswer(answers.company) ||
        normalizeAnswer(answers.project_type) ||
        normalizeAnswer(answers.offer) ||
        normalizeAnswer(answers.purpose) ||
        'Customer business');
}
function buildPrimaryUser(answers) {
    return (normalizeAnswer(answers.primary_user) ||
        normalizeAnswer(answers.role) ||
        normalizeAnswer(answers.escalation) ||
        'the account owner');
}
function buildMission(profile) {
    const answers = profile.onboarding.answers;
    return (normalizeAnswer(answers.business_goal) ||
        normalizeAnswer(answers.goal) ||
        normalizeAnswer(answers.success_metric) ||
        normalizeAnswer(answers.purpose) ||
        normalizeAnswer(answers.top_priority) ||
        'Run the operation reliably, surface issues early, and move work forward without drift.');
}
function buildHeartbeat(profile) {
    const answers = profile.onboarding.answers;
    const frequency = normalizeAnswer(answers.checkin_frequency) ||
        (profile.agent.type === 'support_operator' ? 'Every hour' : 'Twice a day');
    const beats = [
        `Primary cadence: ${frequency}`,
        'Check deployment health and recent failures first.',
        'Review pending work, customer-facing blockers, and stale tasks.',
        'Capture durable learnings and update memory if new patterns emerged.',
    ];
    if (profile.agent.communicationChannel) {
        beats.push(`Send major updates via ${profile.agent.communicationChannel}.`);
    }
    return beats;
}
function generateOpenClawWorkspace(profile) {
    const answers = profile.onboarding.answers;
    const operatorName = inferOperatorName(profile.agent.type);
    const operatorRole = inferOperatorRole(profile.agent.type);
    const businessSummary = buildBusinessSummary(answers);
    const primaryUser = buildPrimaryUser(answers);
    const tone = normalizeAnswer(answers.tone) || 'Clear, warm, and direct';
    const products = normalizeAnswer(answers.products) || normalizeAnswer(answers.offer) || 'Not specified yet';
    const customInstructions = normalizeAnswer(answers.customInstructions) || 'None provided yet.';
    const priorities = [
        ...listAnswer(answers.business_goal),
        ...listAnswer(answers.top_priority),
        ...listAnswer(answers.goal),
        ...listAnswer(answers.ticket_types),
    ].filter((value, index, array) => array.indexOf(value) === index);
    const tools = [
        ...listAnswer(answers.tool_stack),
        ...listAnswer(answers.stack),
        ...listAnswer(answers.tools),
        ...listAnswer(answers.crm),
        ...listAnswer(answers.ticket_source),
    ].filter((value, index, array) => array.indexOf(value) === index);
    const mission = buildMission(profile);
    const heartbeatItems = buildHeartbeat(profile);
    const files = [
        {
            path: 'IDENTITY.md',
            description: 'Operator identity and operating mandate',
            content: `# IDENTITY.md — ${operatorName}\n\n- Name: ${operatorName}\n- Role: ${operatorRole}\n- Plan: ${titleCase(profile.agent.plan, 'Unknown')}\n- Runtime: OpenClaw on Fly.io\n- Deployment URL: ${profile.target.url}\n\n## Mission\n${mission}\n\n## Focus\n- Keep ${businessSummary} moving without waiting on manual follow-up\n- Prioritize ${profile.agent.priority || 'the highest-leverage work'}\n- Operate within the approved ${titleCase(profile.agent.plan, 'customer')} plan\n\n## Boundaries\n- Avoid destructive or irreversible actions without explicit approval\n- Escalate when legal, financial, or security risk is material\n- Prefer direct execution over explanation\n`,
        },
        {
            path: 'SOUL.md',
            description: 'Persona, tone, and execution style',
            content: `# SOUL.md — ${operatorName}\n\n${operatorName} is the dedicated ${operatorRole.toLowerCase()} for ${businessSummary}.\n\n## Voice\n- Tone: ${tone}\n- Style: concise, action-oriented, and human\n- Default: execute first, summarize after\n\n## Operating Mode\n- Own outcomes, not just tasks\n- Surface blockers early and propose the next move\n- Keep work aligned with ${profile.agent.priority || 'the current priority'}\n- Use ${profile.agent.communicationChannel || 'the configured dashboard'} for meaningful updates\n\n## Autonomy\n- ${profile.agent.autonomy || 'Act autonomously within normal operating boundaries'}\n- If approval is needed, package the decision with a clear recommendation\n\n## Guardrails\n- Never expose secrets in chat or workspace notes\n- Do not fabricate status, integrations, or customer data\n- Leave a readable trail in memory and heartbeat notes\n`,
        },
        {
            path: 'USER.md',
            description: 'Primary operator user context',
            content: `# USER.md — Primary User\n\n- Primary user: ${primaryUser}\n- Preferred update channel: ${profile.agent.communicationChannel || 'Dashboard'}\n- Deployment target: ${profile.target.platform} (${profile.target.region})\n- Model preference: ${profile.agent.model || 'Default runtime model'}\n\n## What matters most\n${profile.agent.priority || mission}\n`,
        },
        {
            path: 'MEMORY.md',
            description: 'Operating memory and stable preferences',
            content: `# MEMORY.md\n\n## Stable Context\n- Business: ${businessSummary}\n- Products / Offer: ${products}\n- Priority: ${profile.agent.priority || 'Not specified yet'}\n- Preferred communication: ${profile.agent.communicationChannel || 'Dashboard'}\n- Deployment URL: ${profile.target.url}\n\n## Working Preferences\n- Tone: ${tone}\n- Autonomy: ${profile.agent.autonomy || 'Not specified'}\n- Tools: ${tools.length ? tools.join(', ') : 'No tool stack captured yet'}\n\n## Notes\n- Generated from onboarding session ${profile.onboarding.sessionId || 'unknown'} on ${profile.generatedAt}\n- Add durable user preferences and repeatable lessons here over time\n`,
        },
        {
            path: 'AGENTS.md',
            description: 'Workspace orchestration rules for the deployed operator',
            content: `# AGENTS.md\n\n## Workspace Purpose\nThis workspace powers ${operatorName}, the ${operatorRole.toLowerCase()} for ${businessSummary}.\n\n## Default Mode\n- Execute obvious next actions without waiting\n- Break complex work into bounded steps\n- Keep summaries tight and useful\n\n## Priorities\n${priorities.length ? priorities.map((item) => `- ${item}`).join('\n') : '- No explicit priorities were captured during onboarding yet'}\n\n## Tooling Notes\n${tools.length ? tools.map((item) => `- ${item}`).join('\n') : '- No tool stack was selected yet'}\n\n## Seed Hints\n${profile.runtime.workspaceSeedHints.length ? profile.runtime.workspaceSeedHints.map((item) => `- ${item}`).join('\n') : '- No seed hints generated'}\n`,
        },
        {
            path: 'HEARTBEAT.md',
            description: 'Operational heartbeat checklist',
            content: `# HEARTBEAT.md\n\n## Heartbeat Checklist\n${heartbeatItems.map((item) => `- ${item}`).join('\n')}\n\n## Deployment Metadata\n- App: ${profile.target.appName}\n- Subdomain: ${profile.target.subdomain}\n- Image: ${profile.target.image}\n`,
        },
        {
            path: 'BUSINESS_CONTEXT.md',
            description: 'Business context captured from onboarding answers',
            content: `# BUSINESS_CONTEXT.md\n\n## Business Summary\n- Business / project: ${businessSummary}\n- Products / services: ${products}\n- Agent type: ${titleCase(profile.agent.type, 'Operator')}\n- Plan: ${titleCase(profile.agent.plan, 'Unknown')}\n\n## Onboarding Answers\n${Object.entries(answers).length ? Object.entries(answers).map(([key, value]) => `- ${key}: ${normalizeAnswer(value) || '—'}`).join('\n') : '- No onboarding answers recorded'}\n\n## Custom Instructions\n${customInstructions}\n`,
        },
    ];
    return {
        version: 1,
        generatedAt: new Date().toISOString(),
        files,
    };
}
