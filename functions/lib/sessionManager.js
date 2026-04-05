"use strict";
/**
 * Session & Project Memory Manager
 *
 * One Fly.io machine per client.
 * Projects are logical namespaces on that machine.
 * Agents share company memory but have isolated project memory.
 *
 * Firestore structure:
 *   companies/{companyId}/sessions/{sessionId}
 *   companies/{companyId}/projects/{projectId}/sessions/{sessionId}
 *   companies/{companyId}/agentMemory/{agentId}
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
exports.getSessions = exports.completeSession = exports.logSessionTask = exports.resumeSession = exports.pauseSession = exports.createSession = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
const node_fetch_1 = __importDefault(require("node-fetch"));
const FLY_API_TOKEN = process.env.FLY_API_TOKEN;
const FLY_API_BASE = 'https://api.machines.dev';
const FLY_APP_NAME = process.env.FLY_APP_NAME || 'maagic-operators';
// ── Helpers ───────────────────────────────────────────────────────────────────
function memoryNamespace(companyId, projectId) {
    return projectId
        ? `${companyId}__${projectId}`
        : `${companyId}__shared`;
}
async function getMachineId(companyId) {
    const snap = await firebase_1.db.collection('instances')
        .where('companyId', '==', companyId)
        .where('status', '==', 'running')
        .limit(1)
        .get();
    if (snap.empty)
        return null;
    return snap.docs[0].data().machineId || null;
}
async function pingMachine(machineId, payload) {
    try {
        const res = await (0, node_fetch_1.default)(`${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/machines/${machineId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${FLY_API_TOKEN}` },
        });
        return res.ok;
    }
    catch {
        return false;
    }
}
// ── Cloud Functions ───────────────────────────────────────────────────────────
/**
 * Create a new agent session.
 * Called when a user assigns a task or goal to an agent.
 */
exports.createSession = functions.https.onCall(async (data, context) => {
    const { companyId, projectId, agentId, agentName, goal } = data;
    if (!companyId || !agentId || !goal) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }
    const machineId = await getMachineId(companyId);
    const namespace = memoryNamespace(companyId, projectId || null);
    const sessionRef = projectId
        ? firebase_1.db.collection(`companies/${companyId}/projects/${projectId}/sessions`).doc()
        : firebase_1.db.collection(`companies/${companyId}/sessions`).doc();
    const session = {
        companyId,
        projectId: projectId || null,
        agentId,
        agentName,
        status: machineId ? 'starting' : 'failed',
        goal,
        startedAt: (0, firebase_1.serverTimestamp)(),
        updatedAt: (0, firebase_1.serverTimestamp)(),
        endedAt: null,
        machineId,
        browserSessionId: null,
        memoryNamespace: namespace,
        taskLog: [],
        messageLog: [],
        creditsUsed: 0,
        metadata: {},
    };
    await sessionRef.set(session);
    // Also log to company-level sessions for dashboard activity feed
    await firebase_1.db.collection(`companies/${companyId}/sessions`).doc(sessionRef.id).set({
        ...session,
        projectId: projectId || null,
    });
    // Notify the Fly machine to start working
    if (machineId) {
        await notifyMachine(machineId, companyId, sessionRef.id, {
            type: 'START_SESSION',
            sessionId: sessionRef.id,
            agentId,
            goal,
            memoryNamespace: namespace,
            projectId: projectId || null,
        });
    }
    return { sessionId: sessionRef.id, status: session.status };
});
/**
 * Pause a running session — agent checkpoints its state.
 */
exports.pauseSession = functions.https.onCall(async (data, context) => {
    const { companyId, sessionId } = data;
    const sessionRef = firebase_1.db.collection(`companies/${companyId}/sessions`).doc(sessionId);
    const snap = await sessionRef.get();
    if (!snap.exists)
        throw new functions.https.HttpsError('not-found', 'Session not found.');
    const session = snap.data();
    if (session.status !== 'active')
        return { success: false, reason: 'Session not active.' };
    await sessionRef.update({ status: 'paused', updatedAt: (0, firebase_1.serverTimestamp)() });
    if (session.machineId) {
        await notifyMachine(session.machineId, companyId, sessionId, {
            type: 'PAUSE_SESSION',
            sessionId,
        });
    }
    return { success: true };
});
/**
 * Resume a paused session — agent reloads state and continues.
 */
exports.resumeSession = functions.https.onCall(async (data, context) => {
    const { companyId, sessionId } = data;
    const sessionRef = firebase_1.db.collection(`companies/${companyId}/sessions`).doc(sessionId);
    const snap = await sessionRef.get();
    if (!snap.exists)
        throw new functions.https.HttpsError('not-found', 'Session not found.');
    const session = snap.data();
    if (session.status !== 'paused')
        return { success: false, reason: 'Session not paused.' };
    await sessionRef.update({ status: 'active', updatedAt: (0, firebase_1.serverTimestamp)() });
    if (session.machineId) {
        await notifyMachine(session.machineId, companyId, sessionId, {
            type: 'RESUME_SESSION',
            sessionId,
            memoryNamespace: session.memoryNamespace,
        });
    }
    return { success: true };
});
/**
 * Append a task entry to the session log — called by the Fly machine.
 */
exports.logSessionTask = functions.https.onCall(async (data, context) => {
    const { companyId, sessionId, task } = data;
    const sessionRef = firebase_1.db.collection(`companies/${companyId}/sessions`).doc(sessionId);
    await sessionRef.update({
        taskLog: require('firebase-admin').firestore.FieldValue.arrayUnion(task),
        updatedAt: (0, firebase_1.serverTimestamp)(),
    });
    // Also push to activity feed
    await firebase_1.db.collection(`companies/${companyId}/activityLog`).add({
        sessionId,
        ...task,
        createdAt: (0, firebase_1.serverTimestamp)(),
    });
    return { success: true };
});
/**
 * Complete a session.
 */
exports.completeSession = functions.https.onCall(async (data, context) => {
    const { companyId, sessionId, creditsUsed = 0 } = data;
    const sessionRef = firebase_1.db.collection(`companies/${companyId}/sessions`).doc(sessionId);
    await sessionRef.update({
        status: 'completed',
        endedAt: (0, firebase_1.serverTimestamp)(),
        updatedAt: (0, firebase_1.serverTimestamp)(),
        creditsUsed,
    });
    return { success: true };
});
/**
 * Get all sessions for a company, optionally scoped to a project.
 */
exports.getSessions = functions.https.onCall(async (data, context) => {
    const { companyId, projectId, limit = 20 } = data;
    let query = firebase_1.db.collection(`companies/${companyId}/sessions`)
        .orderBy('startedAt', 'desc')
        .limit(limit);
    if (projectId) {
        query = query.where('projectId', '==', projectId);
    }
    const snap = await query.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
});
// ── Notify Fly machine ────────────────────────────────────────────────────────
async function notifyMachine(machineId, companyId, sessionId, payload) {
    // Find the machine's gateway URL from Firestore
    const snap = await firebase_1.db.collection('instances')
        .where('machineId', '==', machineId)
        .limit(1)
        .get();
    if (snap.empty)
        return;
    const instance = snap.docs[0].data();
    const gatewayUrl = instance.url;
    const gatewayToken = instance.gatewayToken;
    if (!gatewayUrl || !gatewayToken)
        return;
    try {
        await (0, node_fetch_1.default)(`${gatewayUrl}/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${gatewayToken}`,
            },
            body: JSON.stringify({ companyId, sessionId, ...payload }),
        });
    }
    catch (err) {
        console.error('Failed to notify machine:', err);
        // Don't throw — machine may be starting up, session stays in 'starting' state
    }
}
