/**
 * agentExecutor.ts
 *
 * Firestore trigger: when a task is assigned to an agent (assignedAgentId set
 * and status → todo or in_progress), ping the agent's Fly.io machine so it
 * picks up the task immediately rather than waiting for the next poll cycle.
 */

import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import { db, serverTimestamp } from './firebase';

/**
 * Triggered whenever a task document is written (created or updated).
 * Pings the assigned agent's Fly machine so it processes the task immediately.
 */
export const onTaskAssigned = functions.firestore
  .document('tasks/{taskId}')
  .onWrite(async (change, context) => {
    const after = change.after.exists ? change.after.data() : null;
    if (!after) return null;

    const before = change.before.exists ? change.before.data() : null;
    const { assignedAgentId, status, companyId, title } = after;
    const { taskId } = context.params;

    // ── Auto-escalate blocked tasks to approvals ───────────────────────────────
    // If a task just became blocked (wasn't blocked before), auto-create an
    // approval request and reset the task to 'todo' so it can be retried.
    const justBlocked = status === 'blocked' && (!before || before.status !== 'blocked');
    if (justBlocked) {
      // Dedup: only create one pending approval per task — skip if one already exists
      const existing = await db.collection('approvals')
        .where('payload.taskId', '==', taskId)
        .where('status', '==', 'pending')
        .limit(1)
        .get();
      if (!existing.empty) {
        console.log(`Task "${title}" (${taskId}) blocked again but approval already pending — just resetting to todo`);
        await change.after.ref.update({ status: 'todo', blockedReason: '', updatedAt: serverTimestamp() });
        return null;
      }

      console.log(`Task "${title}" (${taskId}) is blocked — auto-escalating to approvals`);
      const approvalRef = db.collection('approvals').doc();
      await approvalRef.set({
        companyId: companyId || '',
        requestingActorId: assignedAgentId || 'system',
        requestedByAgentId: assignedAgentId || null,
        type: 'needs_input',
        title: `Blocked: "${title}"`,
        description: after.blockedReason
          || after.outputSummary
          || `The task "${title}" was blocked. Please review the agent output and provide whatever is needed to continue.`,
        payload: { taskId },
        status: 'pending',
        decidedByUserId: null,
        decidedAt: null,
        decisionNote: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // Reset task to 'todo' — wait for founder to respond before agent retries
      await change.after.ref.update({ status: 'todo', blockedReason: '', updatedAt: serverTimestamp() });
      return null;
    }

    // ── Ping agent machine on new task assignment ──────────────────────────────
    if (!assignedAgentId) return null;
    if (status !== 'todo') return null;

    const agentIdChanged = !before || before.assignedAgentId !== assignedAgentId;
    const isNew = !before;

    if (!isNew && !agentIdChanged) return null;

    console.log(`Task "${title}" (${taskId}) assigned to agent ${assignedAgentId} — pinging machine`);

    // Find the agent's Fly machine
    const machineUrl = await getAgentMachineUrl(assignedAgentId);
    if (!machineUrl) {
      console.log(`No active machine for agent ${assignedAgentId} — task will be picked up on next poll`);
      return null;
    }

    // Ping the machine with the task
    await pingAgentMachine(machineUrl, assignedAgentId, taskId, companyId);
    return null;
  });

async function getAgentMachineUrl(agentId: string): Promise<string | null> {
  const snap = await db.collection('agent_machines')
    .where('agentId', '==', agentId)
    .where('status', '==', 'running')
    .limit(1)
    .get();

  if (snap.empty) return null;
  return snap.docs[0].data().url || null;
}

async function pingAgentMachine(
  machineUrl: string,
  agentId: string,
  taskId: string,
  companyId: string
): Promise<void> {
  const gatewayToken = await getGatewayToken(agentId);

  try {
    const res = await fetch(`${machineUrl}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(gatewayToken ? { Authorization: `Bearer ${gatewayToken}` } : {}),
      },
      body: JSON.stringify({
        type: 'START_SESSION',
        taskId,
        companyId,
        agentId,
      }),
      // Short timeout — the machine might be starting up
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      console.log(`Machine pinged successfully for task ${taskId}`);
    } else {
      console.warn(`Machine ping returned ${res.status} for task ${taskId}`);
    }
  } catch (err) {
    // Non-fatal — machine will pick up task on next Firestore poll
    console.warn(`Machine ping failed (task will self-heal via Firestore subscription):`, (err as Error).message);
  }
}

async function getGatewayToken(agentId: string): Promise<string | null> {
  const snap = await db.collection('agent_machines')
    .where('agentId', '==', agentId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data().gatewayToken || null;
}
