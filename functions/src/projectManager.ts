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

import * as functions from 'firebase-functions';
import { db, serverTimestamp } from './firebase';

export type Project = {
  id: string;
  companyId: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'archived';
  agentIds: string[];           // agents assigned to this project
  goals: string[];              // high-level goals
  memoryNamespace: string;      // Pinecone namespace
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  metadata: Record<string, unknown>;
};

// ── Create project ────────────────────────────────────────────────────────────

export const createProject = functions.https.onCall(async (data, context) => {
  const { companyId, name, description = '', agentIds = [], goals = [] } = data;

  if (!companyId || !name) {
    throw new functions.https.HttpsError('invalid-argument', 'companyId and name are required.');
  }

  const ref = db.collection(`companies/${companyId}/projects`).doc();

  const project: Omit<Project, 'id'> = {
    companyId,
    name,
    description,
    status: 'active',
    agentIds,
    goals,
    memoryNamespace: `${companyId}__${ref.id}`,
    createdAt: serverTimestamp() as FirebaseFirestore.Timestamp,
    updatedAt: serverTimestamp() as FirebaseFirestore.Timestamp,
    metadata: {},
  };

  await ref.set(project);

  return { projectId: ref.id, memoryNamespace: project.memoryNamespace };
});

// ── Update project ────────────────────────────────────────────────────────────

export const updateProject = functions.https.onCall(async (data, context) => {
  const { companyId, projectId, updates } = data;

  if (!companyId || !projectId) {
    throw new functions.https.HttpsError('invalid-argument', 'companyId and projectId required.');
  }

  const allowed = ['name', 'description', 'status', 'agentIds', 'goals', 'metadata'];
  const sanitized = Object.fromEntries(
    Object.entries(updates || {}).filter(([k]) => allowed.includes(k))
  );

  await db.collection(`companies/${companyId}/projects`).doc(projectId).update({
    ...sanitized,
    updatedAt: serverTimestamp(),
  });

  return { success: true };
});

// ── Get projects ──────────────────────────────────────────────────────────────

export const getProjects = functions.https.onCall(async (data, context) => {
  const { companyId } = data;

  const snap = await db.collection(`companies/${companyId}/projects`)
    .where('status', '!=', 'archived')
    .orderBy('status')
    .orderBy('createdAt', 'desc')
    .get();

  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
});

// ── Archive project ───────────────────────────────────────────────────────────

export const archiveProject = functions.https.onCall(async (data, context) => {
  const { companyId, projectId } = data;

  await db.collection(`companies/${companyId}/projects`).doc(projectId).update({
    status: 'archived',
    updatedAt: serverTimestamp(),
  });

  // Pause all active sessions under this project
  const sessions = await db.collection(`companies/${companyId}/sessions`)
    .where('projectId', '==', projectId)
    .where('status', '==', 'active')
    .get();

  const batch = db.batch();
  sessions.docs.forEach(doc => {
    batch.update(doc.ref, { status: 'paused', updatedAt: serverTimestamp() });
  });
  await batch.commit();

  return { success: true, pausedSessions: sessions.size };
});
