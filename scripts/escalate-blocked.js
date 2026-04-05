/**
 * One-time script: find all blocked tasks, create approvals, reset to 'todo'
 * Run with: node scripts/escalate-blocked.js
 */

const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'freemi-3f7c7',
});
const db = admin.firestore();
const ts = admin.firestore.FieldValue.serverTimestamp();

async function run() {
  const snap = await db.collection('tasks').where('status', '==', 'blocked').get();
  if (snap.empty) { console.log('No blocked tasks found.'); return; }
  console.log(`Found ${snap.size} blocked task(s). Escalating…`);

  for (const doc of snap.docs) {
    const task = doc.data();
    const approvalRef = db.collection('approvals').doc();
    await approvalRef.set({
      companyId: task.companyId || '',
      requestingActorId: task.assignedAgentId || 'system',
      requestedByAgentId: task.assignedAgentId || null,
      type: 'needs_input',
      title: `Blocked: "${task.title}"`,
      description: task.blockedReason || task.outputSummary
        || `Task "${task.title}" was blocked. Please provide what is needed to continue.`,
      payload: { taskId: doc.id },
      status: 'pending',
      decidedByUserId: null,
      decidedAt: null,
      decisionNote: '',
      createdAt: ts,
      updatedAt: ts,
    });
    await doc.ref.update({ status: 'todo', blockedReason: '', updatedAt: ts });
    console.log(`  ✓ "${task.title}" → approval created, task reset to todo`);
  }
  console.log('Done.');
  process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
