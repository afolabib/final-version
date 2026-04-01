import {
  collection, doc, addDoc, getDoc, setDoc, updateDoc,
  onSnapshot, serverTimestamp, query, where, getDocs
} from 'firebase/firestore';
import { firestore } from './firebaseClient';

const COL = 'companies';

export async function createCompany(userId, { name, mission, industry = '', size = 'startup' }) {
  const ref = await addDoc(collection(firestore, COL), {
    ownerId: userId,
    name,
    mission,
    industry,
    size,
    planId: 'starter',
    monthlyBudgetUsd: 100,
    requireBoardApprovalForNewAgents: false,
    isBootstrapped: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCompany(companyId) {
  const snap = await getDoc(doc(firestore, COL, companyId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getUserCompanies(userId) {
  const q = query(collection(firestore, COL), where('ownerId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeToCompany(companyId, cb) {
  return onSnapshot(doc(firestore, COL, companyId), snap => {
    if (snap.exists()) cb({ id: snap.id, ...snap.data() });
    else cb(null);
  });
}

export async function updateCompany(companyId, updates) {
  await updateDoc(doc(firestore, COL, companyId), { ...updates, updatedAt: serverTimestamp() });
}

export async function markBootstrapped(companyId) {
  await updateDoc(doc(firestore, COL, companyId), { isBootstrapped: true, updatedAt: serverTimestamp() });
}

// Import a full company from Paperclip-style JSON export
export async function importCompany(userId, exportData) {
  const { company, agents = [], goals = [], projects = [], routines = [] } = exportData;
  const companyId = await createCompany(userId, {
    name: company.name,
    mission: company.mission || company.description || '',
    industry: company.industry || '',
    size: company.size || 'startup',
  });
  return { companyId, agentCount: agents.length, goalCount: goals.length };
}

// Export full company as portable JSON (Paperclip-compatible)
export async function exportCompany(companyId) {
  const company = await getCompany(companyId);
  const agentsSnap = await getDocs(query(collection(firestore, 'agents'), where('companyId', '==', companyId)));
  const goalsSnap = await getDocs(query(collection(firestore, 'goals'), where('companyId', '==', companyId)));
  return {
    exportedAt: new Date().toISOString(),
    company: { name: company.name, mission: company.mission, industry: company.industry, size: company.size },
    agents: agentsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    goals: goalsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
  };
}
