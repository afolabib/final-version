/**
 * approvalExecutor.ts
 *
 * Firestore trigger: when an approval is set to 'approved', execute the action.
 * Supported types: hire_agent, fire_agent, budget_override, strategy_change
 */

import * as functions from 'firebase-functions';
import { db, serverTimestamp } from './firebase';

export const onApprovalDecided = functions.firestore
  .document('approvals/{approvalId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only fire when status transitions to 'approved'
    if (before.status === after.status) return null;
    if (after.status !== 'approved') return null;

    const { approvalId } = context.params;
    const { companyId, type, payload = {}, decidedByUserId } = after;

    console.log(`Executing approval ${approvalId}: type=${type}`);

    try {
      switch (type) {

        case 'hire_agent': {
          // Create a new agent record — status:'active' triggers onAgentCreated → Fly provisioning
          const agentRef = db.collection('agents').doc();
          await agentRef.set({
            companyId,
            name: payload.name || 'New Operator',
            role: payload.role || 'ops',
            reportsTo: payload.reportsTo || null,
            systemPrompt: payload.systemPrompt || '',
            status: 'active',
            isCEO: false,
            monthlyBudgetUsd: payload.monthlyBudgetUsd || 30,
            spentThisMonthUsd: 0,
            heartbeatIntervalMinutes: payload.heartbeatIntervalMinutes || 60,
            machineStatus: 'pending',
            lastHeartbeatAt: null,
            nextHeartbeatAt: null,
            createdByApprovalId: approvalId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          await logActivity(companyId, decidedByUserId, 'approval.hire_agent', approvalId,
            `New operator hired: ${payload.name || 'New Operator'} (${payload.role || 'ops'})`);
          console.log(`Hired agent: ${agentRef.id}`);
          break;
        }

        case 'fire_agent': {
          if (!payload.agentId) break;
          await db.collection('agents').doc(payload.agentId).update({
            status: 'terminated',
            machineStatus: 'terminated',
            terminatedAt: serverTimestamp(),
            terminatedByApprovalId: approvalId,
            updatedAt: serverTimestamp(),
          });
          await logActivity(companyId, decidedByUserId, 'approval.fire_agent', approvalId,
            `Operator terminated: ${payload.agentName || payload.agentId}`);
          break;
        }

        case 'budget_override': {
          if (!payload.agentId || !payload.newBudget) break;
          await db.collection('agents').doc(payload.agentId).update({
            monthlyBudgetUsd: Number(payload.newBudget),
            updatedAt: serverTimestamp(),
          });
          await logActivity(companyId, decidedByUserId, 'approval.budget_override', approvalId,
            `Budget updated to $${payload.newBudget}/mo for ${payload.agentName || payload.agentId}`);
          break;
        }

        case 'strategy_change': {
          const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
          if (payload.missionUpdate) updates.mission = payload.missionUpdate;
          if (payload.industryUpdate) updates.industry = payload.industryUpdate;
          if (Object.keys(updates).length > 1) {
            await db.collection('companies').doc(companyId).update(updates);
          }
          await logActivity(companyId, decidedByUserId, 'approval.strategy_change', approvalId,
            `Strategy change approved: ${payload.description || 'company strategy updated'}`);
          break;
        }

        default:
          console.warn(`Unknown approval type: ${type}`);
      }

      // Mark the approval as executed
      await change.after.ref.update({
        executedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

    } catch (err) {
      console.error(`Approval execution failed for ${approvalId}:`, err);
      await change.after.ref.update({
        executionError: (err as Error).message,
        updatedAt: serverTimestamp(),
      });
    }

    return null;
  });

async function logActivity(
  companyId: string,
  actorId: string,
  event: string,
  entityId: string,
  summary: string
): Promise<void> {
  await db.collection('activity_log').add({
    companyId,
    actorId: actorId || 'system',
    actorType: 'user',
    event,
    entityId,
    summary,
    createdAt: serverTimestamp(),
  });
}
