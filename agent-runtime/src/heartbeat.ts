import cron from 'node-cron';
import { getDb, serverTimestamp } from './firestoreClient';
import { buildSystemPrompt, type AgentIdentity } from './identity';
import { AGENT_TOOL_DEFINITIONS, executeAgentTool } from './agentTools';
import { loadAllMemory, formatMemoryForPrompt, appendDailyNote } from './memory';
import { buildHeartbeatPrompt, buildBootstrapPrompt } from './identity';
import { orchestrateToolLoop } from './orchestrator';

export async function runHeartbeat(identity: AgentIdentity): Promise<void> {
  console.log(`[${identity.name}] Heartbeat starting...`);
  const db = getDb();

  // Budget guard
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const costSnap = await db.collection('cost_events')
    .where('agentId',   '==', identity.agentId)
    .where('createdAt', '>=', monthStart)
    .get();

  const monthlySpend = costSnap.docs.reduce((s, d) => s + (d.data().costUsd || 0), 0);
  if (monthlySpend >= identity.monthlyBudgetUsd) {
    console.log(`[${identity.name}] Budget exhausted ($${monthlySpend.toFixed(2)}/$${identity.monthlyBudgetUsd}), skipping`);
    return;
  }

  const isCEO = identity.isCEO;

  // Detect first run — check if agent has ever had a heartbeat
  const agentSnap = await db.collection('agents').doc(identity.agentId).get();
  const agentData = agentSnap.data() || {};
  const isFirstRun = !agentData.bootstrapped && !agentData.lastHeartbeatAt;

  // Load all 3 memory layers
  const { tacit, entities, todayNote } = await loadAllMemory(identity.agentId);
  const memoryBlock = formatMemoryForPrompt(tacit, entities, todayNote);

  const systemPrompt = `${buildSystemPrompt(identity)}${memoryBlock}

${isFirstRun
  ? `This is your FIRST EVER heartbeat. You are in bootstrap mode — gather context before acting. Do not create tasks or goals yet.`
  : `This is your periodic heartbeat. Review company state using read_company_state, then make 0–4 smart decisions.`}

${isCEO ? `As CEO you can:
- create_goal — set new strategic objectives
- create_task — assign work to any agent (use their ID from read_company_state)
- hire_agent — request to add a new operator when there is clear ongoing need
- create_workflow — set up recurring automations
- create_approval — escalate decisions to the founder

Team status and available agent IDs will be in read_company_state results.
` : `As ${identity.role} operator you can:
- create_task — create tasks for yourself
- update_task — complete or update your tasks
- create_approval — escalate anything that needs human sign-off
`}

Rules:
- Always call read_company_state first
- Make 0–4 decisions max per heartbeat — making 0 decisions is fine if nothing is needed
- Do NOT duplicate existing tasks or goals — check current state first
- Do NOT create low priority tasks unless there are no pending tasks at all
- Only create tasks you can assign to a real agent ID from read_company_state — never leave assignedAgentId empty
- Only hire when there is clear, ongoing need and the role doesn't already exist
- If no goals exist, create 1–2 based on company mission
- Tasks should be specific and actionable, not vague or generic
- After all decisions, your final message should be a 1–2 sentence summary of what you decided
- Use the remember tool to save anything important you learn (founder preferences, lessons, key facts)

Monthly spend so far: $${monthlySpend.toFixed(3)} / $${identity.monthlyBudgetUsd}`;

  const userPrompt = isFirstRun
    ? buildBootstrapPrompt(identity)
    : buildHeartbeatPrompt(identity, monthlySpend);

  try {
    const budgetUsedPct = monthlySpend / (identity.monthlyBudgetUsd || 20);

    const result = await orchestrateToolLoop(
      { taskType: isFirstRun ? 'bootstrap' : 'heartbeat', budgetUsedPct },
      [
        { role: 'system', content: systemPrompt, name: identity.name },
        { role: 'user',   content: userPrompt },
      ],
      AGENT_TOOL_DEFINITIONS,
      async (toolName, args) => executeAgentTool(toolName, args, {
        companyId: identity.companyId,
        agentId:   identity.agentId,
      }),
      1024,
      8,
    );

    const decisionsCount = result.toolCallsMade.filter(t => t.name !== 'read_company_state').length;
    const summary        = result.text || `Heartbeat: ${decisionsCount} decision(s) made.`;

    // Record heartbeat
    const heartbeatRef = db.collection('heartbeats').doc();
    await heartbeatRef.set({
      companyId:      identity.companyId,
      agentId:        identity.agentId,
      summary,
      decisionsCount,
      decisions:      result.toolCallsMade.filter(t => t.name !== 'read_company_state').map(t => t.name),
      tokensIn:       result.tokensIn,
      tokensOut:      result.tokensOut,
      costUsd:        result.costUsd,
      model:          result.model,
      createdAt:      serverTimestamp(),
    });

    // Cost event
    await db.collection('cost_events').add({
      companyId:   identity.companyId,
      agentId:     identity.agentId,
      heartbeatId: heartbeatRef.id,
      source:      'heartbeat',
      model:       result.model,
      tokensIn:    result.tokensIn,
      tokensOut:   result.tokensOut,
      costUsd:     result.costUsd,
      createdAt:   serverTimestamp(),
    });

    // Activity log
    await db.collection('activity_log').add({
      companyId: identity.companyId,
      actorId:   identity.agentId,
      actorType: 'agent',
      event:     'agent.heartbeat',
      entityId:  identity.agentId,
      summary:   `${identity.name}: ${summary}`,
      createdAt: serverTimestamp(),
    });

    // Update agent timestamps (mark bootstrapped on first run)
    await db.collection('agents').doc(identity.agentId).update({
      lastHeartbeatAt: serverTimestamp(),
      nextHeartbeatAt: new Date(Date.now() + identity.heartbeatIntervalMinutes * 60 * 1000),
      updatedAt:       serverTimestamp(),
      ...(isFirstRun ? { bootstrapped: true, bootstrappedAt: serverTimestamp() } : {}),
    });

    // Write to daily notes (Layer 2 memory)
    await appendDailyNote(identity.agentId, identity.companyId,
      `Heartbeat: ${decisionsCount} decision(s) — ${summary.slice(0, 120)}`
    ).catch(() => {});

    console.log(`[${identity.name}] Heartbeat done — ${decisionsCount} decision(s), $${result.costUsd.toFixed(5)}`);

  } catch (err) {
    console.error(`[${identity.name}] Heartbeat error:`, err);

    await db.collection('activity_log').add({
      companyId: identity.companyId,
      actorId:   identity.agentId,
      actorType: 'agent',
      event:     'agent.heartbeat.error',
      entityId:  identity.agentId,
      summary:   `${identity.name} heartbeat failed: ${(err as Error).message}`,
      createdAt: serverTimestamp(),
    }).catch(() => {});
  }
}

export function startHeartbeatSchedule(identity: AgentIdentity, intervalMinutes: number): void {
  const interval   = Math.max(5, Math.min(1440, intervalMinutes));
  const cronExpr   = interval < 60
    ? `*/${interval} * * * *`
    : `0 */${Math.floor(interval / 60)} * * *`;

  console.log(`[${identity.name}] Heartbeat scheduled: every ${interval} min (${cronExpr})`);

  cron.schedule(cronExpr, () => {
    runHeartbeat(identity).catch(err =>
      console.error(`[${identity.name}] Scheduled heartbeat error:`, err)
    );
  });
}
