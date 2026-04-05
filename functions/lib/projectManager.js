"use strict";
/**
 * Project Manager
 *
 * Projects are logical workspaces within a client's Fly machine.
 * Each project has:
 *   - Its own set of agents (or shares company agents)
 *   - Isolated memory namespace (Pinecone)
 *   - Isolated session history
 *   - Shared company context (tone, products, team)
 *
 * Firestore:
 *   companies/{companyId}/projects/{projectId}
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
exports.archiveProject = exports.getProjects = exports.updateProject = exports.createProject = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
// ── Create project ────────────────────────────────────────────────────────────
exports.createProject = functions.https.onCall(async (data, context) => {
    const { companyId, name, description = '', agentIds = [], goals = [] } = data;
    if (!companyId || !name) {
        throw new functions.https.HttpsError('invalid-argument', 'companyId and name are required.');
    }
    const ref = firebase_1.db.collection(`companies/${companyId}/projects`).doc();
    const project = {
        companyId,
        name,
        description,
        status: 'active',
        agentIds,
        goals,
        memoryNamespace: `${companyId}__${ref.id}`,
        createdAt: (0, firebase_1.serverTimestamp)(),
        updatedAt: (0, firebase_1.serverTimestamp)(),
        metadata: {},
    };
    await ref.set(project);
    return { projectId: ref.id, memoryNamespace: project.memoryNamespace };
});
// ── Update project ────────────────────────────────────────────────────────────
exports.updateProject = functions.https.onCall(async (data, context) => {
    const { companyId, projectId, updates } = data;
    if (!companyId || !projectId) {
        throw new functions.https.HttpsError('invalid-argument', 'companyId and projectId required.');
    }
    const allowed = ['name', 'description', 'status', 'agentIds', 'goals', 'metadata'];
    const sanitized = Object.fromEntries(Object.entries(updates || {}).filter(([k]) => allowed.includes(k)));
    await firebase_1.db.collection(`companies/${companyId}/projects`).doc(projectId).update({
        ...sanitized,
        updatedAt: (0, firebase_1.serverTimestamp)(),
    });
    return { success: true };
});
// ── Get projects ──────────────────────────────────────────────────────────────
exports.getProjects = functions.https.onCall(async (data, context) => {
    const { companyId } = data;
    const snap = await firebase_1.db.collection(`companies/${companyId}/projects`)
        .where('status', '!=', 'archived')
        .orderBy('status')
        .orderBy('createdAt', 'desc')
        .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
});
// ── Archive project ───────────────────────────────────────────────────────────
exports.archiveProject = functions.https.onCall(async (data, context) => {
    const { companyId, projectId } = data;
    await firebase_1.db.collection(`companies/${companyId}/projects`).doc(projectId).update({
        status: 'archived',
        updatedAt: (0, firebase_1.serverTimestamp)(),
    });
    // Pause all active sessions under this project
    const sessions = await firebase_1.db.collection(`companies/${companyId}/sessions`)
        .where('projectId', '==', projectId)
        .where('status', '==', 'active')
        .get();
    const batch = firebase_1.db.batch();
    sessions.docs.forEach(doc => {
        batch.update(doc.ref, { status: 'paused', updatedAt: (0, firebase_1.serverTimestamp)() });
    });
    await batch.commit();
    return { success: true, pausedSessions: sessions.size };
});
