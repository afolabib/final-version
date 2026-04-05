"use strict";
/**
 * agentExecutor.ts
 *
 * Firestore trigger: when a task is assigned to an agent (assignedAgentId set
 * and status → todo or in_progress), ping the agent's Fly.io machine so it
 * picks up the task immediately rather than waiting for the next poll cycle.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onTaskAssigned = void 0;
const functions = __importStar(require("firebase-functions"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const firebase_1 = require("./firebase");
/**
 * Triggered whenever a task document is written (created or updated).
 * Pings the assigned agent's Fly machine so it processes the task immediately.
 */
exports.onTaskAssigned = functions.firestore
    .document('tasks/{taskId}')
    .onWrite(async (change, context) => {
    const after = change.after.exists ? change.after.data() : null;
    if (!after)
        return null;
    const before = change.before.exists ? change.before.data() : null;
    const { assignedAgentId, status, companyId, title } = after;
    const { taskId } = context.params;
    // ── Auto-escalate blocked tasks to approvals ───────────────────────────────
    // If a task just became blocked (wasn't blocked before), auto-create an
    // approval request and reset the task to 'todo' so it can be retried.
    const justBlocked = status === 'blocked' && (!before || before.status !== 'blocked');
    if (justBlocked) {
        console.log(`Task "${title}" (${taskId}) is blocked — auto-escalating to approvals`);
        const approvalRef = firebase_1.db.collection('approvals').doc();
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
            createdAt: (0, firebase_1.serverTimestamp)(),
            updatedAt: (0, firebase_1.serverTimestamp)(),
        });
        // Reset task to 'todo' so it can be retried once the founder responds
        await change.after.ref.update({ status: 'todo', blockedReason: '', updatedAt: (0, firebase_1.serverTimestamp)() });
        return null;
    }
    // ── Ping agent machine on new task assignment ──────────────────────────────
    if (!assignedAgentId)
        return null;
    if (status !== 'todo')
        return null;
    const agentIdChanged = !before || before.assignedAgentId !== assignedAgentId;
    const isNew = !before;
    if (!isNew && !agentIdChanged)
        return null;
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
async function getAgentMachineUrl(agentId) {
    const snap = await firebase_1.db.collection('agent_machines')
        .where('agentId', '==', agentId)
        .where('status', '==', 'running')
        .limit(1)
        .get();
    if (snap.empty)
        return null;
    return snap.docs[0].data().url || null;
}
async function pingAgentMachine(machineUrl, agentId, taskId, companyId) {
    const gatewayToken = await getGatewayToken(agentId);
    try {
        const res = await (0, node_fetch_1.default)(`${machineUrl}/session`, {
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
        }
        else {
            console.warn(`Machine ping returned ${res.status} for task ${taskId}`);
        }
    }
    catch (err) {
        // Non-fatal — machine will pick up task on next Firestore poll
        console.warn(`Machine ping failed (task will self-heal via Firestore subscription):`, err.message);
    }
}
async function getGatewayToken(agentId) {
    const snap = await firebase_1.db.collection('agent_machines')
        .where('agentId', '==', agentId)
        .limit(1)
        .get();
    if (snap.empty)
        return null;
    return snap.docs[0].data().gatewayToken || null;
}
