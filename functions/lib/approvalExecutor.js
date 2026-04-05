"use strict";
/**
 * approvalExecutor.ts
 *
 * Firestore trigger: when an approval is set to 'approved', execute the action.
 * Supported types: hire_agent, fire_agent, budget_override, strategy_change
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onApprovalDecided = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
exports.onApprovalDecided = functions.firestore
    .document('approvals/{approvalId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    // Only fire when status transitions (approved OR rejected)
    if (before.status === after.status)
        return null;
    if (after.status !== 'approved' && after.status !== 'rejected')
        return null;
    // For needs_input rejections, cancel the stuck task
    if (after.status === 'rejected' && after.type === 'needs_input') {
        const { taskId } = (after.payload || {});
        if (taskId) {
            const taskSnap = await firebase_1.db.collection('tasks').doc(taskId).get();
            if (taskSnap.exists) {
                const task = taskSnap.data();
                await taskSnap.ref.update({
                    status: 'cancelled',
                    outputSummary: `${task.outputSummary || ''}\n\nFounder could not provide required input. Task cancelled.`.trim(),
                    updatedAt: (0, firebase_1.serverTimestamp)(),
                });
                await logActivity(after.companyId, after.decidedByUserId, 'approval.needs_input_skipped', context.params.approvalId, `Task "${task.title}" cancelled — founder couldn't provide required input`);
            }
        }
        return null;
    }
    if (after.status !== 'approved')
        return null;
    const { approvalId } = context.params;
    const { companyId, type, payload = {}, decidedByUserId } = after;
    console.log(`Executing approval ${approvalId}: type=${type}`);
    try {
        switch (type) {
            case 'hire_agent': {
                // Create a new agent record — status:'active' triggers onAgentCreated → Fly provisioning
                const agentRef = firebase_1.db.collection('agents').doc();
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
                    createdAt: (0, firebase_1.serverTimestamp)(),
                    updatedAt: (0, firebase_1.serverTimestamp)(),
                });
                await logActivity(companyId, decidedByUserId, 'approval.hire_agent', approvalId, `New operator hired: ${payload.name || 'New Operator'} (${payload.role || 'ops'})`);
                console.log(`Hired agent: ${agentRef.id}`);
                break;
            }
            case 'fire_agent': {
                if (!payload.agentId)
                    break;
                await firebase_1.db.collection('agents').doc(payload.agentId).update({
                    status: 'terminated',
                    machineStatus: 'terminated',
                    terminatedAt: (0, firebase_1.serverTimestamp)(),
                    terminatedByApprovalId: approvalId,
                    updatedAt: (0, firebase_1.serverTimestamp)(),
                });
                await logActivity(companyId, decidedByUserId, 'approval.fire_agent', approvalId, `Operator terminated: ${payload.agentName || payload.agentId}`);
                break;
            }
            case 'budget_override': {
                if (!payload.agentId || !payload.newBudget)
                    break;
                await firebase_1.db.collection('agents').doc(payload.agentId).update({
                    monthlyBudgetUsd: Number(payload.newBudget),
                    updatedAt: (0, firebase_1.serverTimestamp)(),
                });
                await logActivity(companyId, decidedByUserId, 'approval.budget_override', approvalId, `Budget updated to $${payload.newBudget}/mo for ${payload.agentName || payload.agentId}`);
                break;
            }
            case 'strategy_change': {
                const updates = { updatedAt: (0, firebase_1.serverTimestamp)() };
                if (payload.missionUpdate)
                    updates.mission = payload.missionUpdate;
                if (payload.industryUpdate)
                    updates.industry = payload.industryUpdate;
                if (Object.keys(updates).length > 1) {
                    await firebase_1.db.collection('companies').doc(companyId).update(updates);
                }
                await logActivity(companyId, decidedByUserId, 'approval.strategy_change', approvalId, `Strategy change approved: ${payload.description || 'company strategy updated'}`);
                break;
            }
            // ── needs_input: founder answered — relay to agent via task context ────
            case 'needs_input': {
                const { taskId } = payload;
                const founderAnswer = after.decisionNote || '';
                if (!taskId || !founderAnswer)
                    break;
                const taskRef = firebase_1.db.collection('tasks').doc(taskId);
                const taskSnap = await taskRef.get();
                if (!taskSnap.exists)
                    break;
                const task = taskSnap.data();
                // Append founder's answer to the task description so agent has full context
                const updatedDesc = `${task.description || ''}\n\n---\n**Founder's response (${new Date().toLocaleDateString()}):** ${founderAnswer}\n\nPlease use the above information to complete this task.`.trim();
                await taskRef.update({
                    status: 'todo',
                    description: updatedDesc,
                    blockedReason: '',
                    founderResponse: founderAnswer,
                    updatedAt: (0, firebase_1.serverTimestamp)(),
                });
                await logActivity(companyId, decidedByUserId, 'approval.needs_input_resolved', approvalId, `Founder answered agent's question — task "${task.title}" reset to retry`);
                console.log(`needs_input resolved for task ${taskId} — founder said: "${founderAnswer.slice(0, 80)}"`);
                break;
            }
            // ── needs_input rejected: founder can't help — log and cancel task ──
            case 'needs_input_rejected': {
                const { taskId } = payload;
                if (!taskId)
                    break;
                const taskSnap = await firebase_1.db.collection('tasks').doc(taskId).get();
                if (!taskSnap.exists)
                    break;
                const task = taskSnap.data();
                await firebase_1.db.collection('tasks').doc(taskId).update({
                    status: 'cancelled',
                    outputSummary: `${task.outputSummary || ''}\n\nFounder could not provide the required input. Task cancelled.`.trim(),
                    updatedAt: (0, firebase_1.serverTimestamp)(),
                });
                await logActivity(companyId, decidedByUserId, 'approval.needs_input_skipped', approvalId, `Task "${task.title}" cancelled — founder couldn't provide required input`);
                break;
            }
            default:
                console.warn(`Unknown approval type: ${type}`);
        }
        // Mark the approval as executed
        await change.after.ref.update({
            executedAt: (0, firebase_1.serverTimestamp)(),
            updatedAt: (0, firebase_1.serverTimestamp)(),
        });
    }
    catch (err) {
        console.error(`Approval execution failed for ${approvalId}:`, err);
        await change.after.ref.update({
            executionError: err.message,
            updatedAt: (0, firebase_1.serverTimestamp)(),
        });
    }
    return null;
});
async function logActivity(companyId, actorId, event, entityId, summary) {
    await firebase_1.db.collection('activity_log').add({
        companyId,
        actorId: actorId || 'system',
        actorType: 'user',
        event,
        entityId,
        summary,
        createdAt: (0, firebase_1.serverTimestamp)(),
    });
}
