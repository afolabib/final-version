/**
 * Seed script — Lauren O'Reilly's two sites
 *
 * Usage:
 *   1. Sign Lauren up at https://freemi-3f7c7.web.app/signup with lauren oreill7@gmail.com
 *   2. Get her UID from Firebase console → Authentication → Users
 *   3. Run: LAUREN_UID=<her-uid> node scripts/seed-lauren.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const LAUREN_UID = process.env.LAUREN_UID;
if (!LAUREN_UID) {
  console.error('Missing LAUREN_UID env var.\nUsage: LAUREN_UID=abc123 node scripts/seed-lauren.js');
  process.exit(1);
}

// Point to your service account key
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const now = Timestamp.now();
const daysAgo = d => Timestamp.fromDate(new Date(Date.now() - d * 86400000));

const sites = [
  {
    userId: LAUREN_UID,
    name: "Lauren O'Reilly",
    domain: 'itslaurenoreilly.web.app',
    previewUrl: 'https://itslaurenoreilly.web.app',
    status: 'live',
    publishedAt: daysAgo(28),
    lastUpdated: daysAgo(1),
    pageCount: 5,
    pagespeed: 98,
    seoScore: 94,
    primaryColor: '#EC4899',
    createdAt: now,
  },
  {
    userId: LAUREN_UID,
    name: 'Wellness Script',
    domain: 'wellness-cript.web.app',
    previewUrl: 'https://wellness-cript.web.app',
    status: 'live',
    publishedAt: daysAgo(10),
    lastUpdated: daysAgo(3),
    pageCount: 4,
    pagespeed: 95,
    seoScore: 88,
    primaryColor: '#0D9488',
    createdAt: now,
  },
];

async function seed() {
  console.log(`Seeding sites for user ${LAUREN_UID}...`);
  for (const site of sites) {
    const ref = await db.collection('websites').add(site);
    console.log(`✓ Created site "${site.name}" → ${ref.id}`);
  }
  console.log('\nDone! Lauren can now log in and see both sites in her Website dashboard.');
}

seed().catch(console.error);
