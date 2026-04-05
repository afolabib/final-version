import * as admin from 'firebase-admin';

let _db: admin.firestore.Firestore | null = null;

export function getDb(): admin.firestore.Firestore {
  if (_db) return _db;

  if (admin.apps.length) {
    _db = admin.firestore();
    return _db;
  }

  const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (serviceAccountB64) {
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountB64, 'base64').toString('utf8')
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || projectId,
    });
  } else if (projectId) {
    // Use application default credentials (works in Cloud Run / local with gcloud auth)
    admin.initializeApp({ projectId });
  } else {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID');
  }

  _db = admin.firestore();
  return _db;
}

export const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();
export const arrayUnion = (...items: unknown[]) => admin.firestore.FieldValue.arrayUnion(...items);
