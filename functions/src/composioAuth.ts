/**
 * composioAuth.ts — Cloud Functions for Composio OAuth flow.
 *
 * initComposioConnection  — called by UI "Connect" button → returns OAuth redirect URL
 * composioCallback        — OAuth redirect lands here → marks integration connected in Firestore
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Composio } from 'composio-core';

function getComposio() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) throw new Error('COMPOSIO_API_KEY not set');
  return new Composio({ apiKey });
}

// ── Initiate OAuth connection ──────────────────────────────────────────────────
// Called from UI: POST { companyId, appName }
// Returns: { redirectUrl } — UI opens this in a popup/tab
export const initComposioConnection = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  const { companyId, appName } = data as { companyId: string; appName: string };
  if (!companyId || !appName) {
    throw new functions.https.HttpsError('invalid-argument', 'companyId and appName required');
  }

  const composio = getComposio();
  const entity = await composio.getEntity(companyId);

  // Initiate connection — Composio handles OAuth redirect
  const connection = await entity.initiateConnection({
    appName: appName.toLowerCase(),
    redirectUri: `https://freemi-3f7c7.web.app/integrations/callback?companyId=${companyId}&app=${appName}`,
  });

  return { redirectUrl: (connection as any).redirectUrl ?? (connection as any).redirectUri, connectionId: (connection as any).connectionId ?? (connection as any).connectedAccountId };
});

// ── Connect with API key (non-OAuth apps) ─────────────────────────────────────
// Called from UI for apps like OpenAI, HubSpot, Stripe that use API keys
export const connectComposioApiKey = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  const { companyId, appName, apiKey } = data as { companyId: string; appName: string; apiKey: string };
  if (!companyId || !appName || !apiKey) {
    throw new functions.https.HttpsError('invalid-argument', 'companyId, appName, apiKey required');
  }

  const composio = getComposio();
  const entity = await composio.getEntity(companyId);

  // Connect via API key
  const connection = await entity.initiateConnection({
    appName: appName.toLowerCase(),
    authMode: 'API_KEY',
    authConfig: { api_key: apiKey },
  });

  // Mark connected in Firestore
  const db = admin.firestore();
  await db.collection('companies').doc(companyId).update({
    [`integrations.${appName}`]: {
      connectedAt: admin.firestore.FieldValue.serverTimestamp(),
      connectionId: (connection as any).connectionId ?? null,
      authMode: 'API_KEY',
    },
  });

  return { success: true, connectionId: (connection as any).connectionId ?? (connection as any).connectedAccountId };
});

// ── OAuth callback (after user authorises in external app) ────────────────────
// Composio redirects here after OAuth — mark as connected in Firestore
export const composioCallback = functions.https.onRequest(async (req, res) => {
  const { companyId, app, connectionId } = req.query as Record<string, string>;

  if (companyId && app) {
    const db = admin.firestore();
    await db.collection('companies').doc(companyId).update({
      [`integrations.${app}`]: {
        connectedAt: admin.firestore.FieldValue.serverTimestamp(),
        connectionId: connectionId || null,
        authMode: 'OAUTH2',
      },
    }).catch(() => {});
  }

  // Close the popup — parent window reads Firestore in real-time
  res.send(`
    <html><body><script>
      window.opener?.postMessage({ composioConnected: true, app: '${app}' }, '*');
      window.close();
    </script><p>Connected! You can close this tab.</p></body></html>
  `);
});

// ── Disconnect ────────────────────────────────────────────────────────────────
export const disconnectComposioIntegration = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  const { companyId, appName } = data as { companyId: string; appName: string };

  try {
    const composio = getComposio();
    const entity = await composio.getEntity(companyId);
    const conn = await entity.getConnection({ app: appName.toLowerCase() });
    if (conn) await (conn as any).delete();
  } catch {
    // Ignore if connection not found in Composio — still clean up Firestore
  }

  const db = admin.firestore();
  await db.collection('companies').doc(companyId).update({
    [`integrations.${appName}`]: admin.firestore.FieldValue.delete(),
  });

  return { success: true };
});
