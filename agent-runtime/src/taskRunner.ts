import { getDb, serverTimestamp } from './firestoreClient';
import { buildSystemPrompt, type AgentIdentity } from './identity';
import { llmToolLoop } from './llm';
import { AGENT_TOOL_DEFINITIONS, executeAgentTool } from './agentTools';

export async function processTask(taskId: string, identity: AgentIdentity): Promise<void> {
  const db = getDb();
  const taskRef = db.collection('tasks').doc(taskId);

  const taskSnap = await taskRef.get();
  if (!taskSnap.exists) { console.warn(`Task ${taskId} not found`); return; }

  const task = taskSnap.data()!;
  if (task.status === 'done' || task.status === 'cancelled') return;
  if (task.assignedAgentId !== identity.agentId) return;

  console.log(`[${identity.name}] Processing task: "${task.title}"`);

  // Load goal context
  let goalContext = '';
  if (task.goalId) {
    try {
      const goalSnap = await db.collection('goals').doc(task.goalId).get();
      if (goalSnap.exists) {
        const g = goalSnap.data()!;
        goalContext = `\n\nThis task is part of the goal: "${g.title}" — ${g.description || ''}`;
      }
    } catch { /* non-fatal */ }
  }

  const systemPrompt = `${buildSystemPrompt(identity)}

You have tools to read company state and take actions. For this task, complete the work and use update_task to mark it done with your output.`;

  const userPrompt = `Complete this task and mark it done when finished.

**Task**: ${task.title}
**Priority**: ${task.priority || 'medium'}
**Details**: ${task.description || 'No additional details'}${goalContext}

Steps:
1. Call read_company_state to understand current context if needed
2. Do the work — produce specific, actionable output
3. Call update_task with status="done" and outputSummary containing your results`;

  const startMs = Date.now();

  try {
    await taskRef.update({ status: 'in_progress', updatedAt: serverTimestamp() });

    const result = await llmToolLoop(
      'task',
      [
        { role: 'system', content: systemPrompt, name: identity.name },
        { role: 'user',   content: userPrompt },
      ],
      AGENT_TOOL_DEFINITIONS,
      async (toolName, args) => executeAgentTool(toolName, args, {
        companyId: identity.companyId,
        agentId:   identity.agentId,
      }),
      2048,
      8,
    );

    const elapsedMs = Date.now() - startMs;

    // If the model didn't call update_task itself, only mark done if it produced real output
    const taskUpdated = result.toolCallsMade.some(t => t.name === 'update_task');
    if (!taskUpdated) {
      const hasOutput = result.text && result.text.trim().length > 30;
      await taskRef.update({
        status:        hasOutput ? 'done' : 'blocked',
        outputSummary: result.text || 'Agent did not produce output.',
        completedAt:   hasOutput ? serverTimestamp() : null,
        updatedAt:     serverTimestamp(),
      });
    }

    // Cost tracking
    await db.collection('cost_events').add({
      companyId: identity.companyId,
      agentId:   identity.agentId,
      taskId,
      model:     result.model,
      tokensIn:  result.tokensIn,
      tokensOut: result.tokensOut,
      costUsd:   result.costUsd,
      elapsedMs,
      createdAt: serverTimestamp(),
    });

    await db.collection('activity_log').add({
      companyId: identity.companyId,
      actorId:   identity.agentId,
      actorType: 'agent',
      event:     'task.completed',
      entityId:  taskId,
      summary:   `${identity.name} completed: "${task.title}"`,
      createdAt: serverTimestamp(),
    });

    console.log(`[${identity.name}] Task done in ${elapsedMs}ms — ${result.toolCallsMade.length} tool calls, $${result.costUsd.toFixed(5)}`);

  } catch (err) {
    console.error(`[${identity.name}] Task failed:`, err);
    await taskRef.update({
      status:        'blocked',
      outputSummary: `Execution error: ${(err as Error).message}`,
      updatedAt:     serverTimestamp(),
    });
    await db.collection('activity_log').add({
      companyId: identity.companyId,
      actorId:   identity.agentId,
      actorType: 'agent',
      event:     'task.failed',
      entityId:  taskId,
      summary:   `${identity.name} failed: "${task.title}" — ${(err as Error).message}`,
      createdAt: serverTimestamp(),
    });
  }
}

export async function processPendingTasks(identity: AgentIdentity): Promise<void> {
  const db = getDb();
  const snap = await db.collection('tasks')
    .where('companyId',      '==', identity.companyId)
    .where('assignedAgentId', '==', identity.agentId)
    .where('status',          'in', ['todo', 'in_progress'])
    .limit(5)
    .get();

  if (snap.empty) return;
  console.log(`[${identity.name}] Found ${snap.size} pending task(s)`);
  for (const doc of snap.docs) await processTask(doc.id, identity);
}
