"use strict";
/**
 * composioAuth.ts — Cloud Functions for Composio OAuth flow.
 *
 * initComposioConnection  — called by UI "Connect" button → returns OAuth redirect URL
 * composioCallback        — OAuth redirect lands here → marks integration connected in Firestore
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
exports.disconnectComposioIntegration = exports.composioCallback = exports.connectComposioApiKey = exports.initComposioConnection = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const composio_core_1 = require("composio-core");
function getComposio() {
    const apiKey = process.env.COMPOSIO_API_KEY;
    if (!apiKey)
        throw new Error('COMPOSIO_API_KEY not set');
    return new composio_core_1.Composio({ apiKey });
}
// ── Initiate OAuth connection ──────────────────────────────────────────────────
// Called from UI: POST { companyId, appName }
// Returns: { redirectUrl } — UI opens this in a popup/tab
exports.initComposioConnection = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Login required');
    const { companyId, appName } = data;
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
    return { redirectUrl: connection.redirectUrl ?? connection.redirectUri, connectionId: connection.connectionId ?? connection.connectedAccountId };
});
// ── Connect with API key (non-OAuth apps) ─────────────────────────────────────
// Called from UI for apps like OpenAI, HubSpot, Stripe that use API keys
exports.connectComposioApiKey = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Login required');
    const { companyId, appName, apiKey } = data;
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
            connectionId: connection.connectionId ?? null,
            authMode: 'API_KEY',
        },
    });
    return { success: true, connectionId: connection.connectionId ?? connection.connectedAccountId };
});
// ── OAuth callback (after user authorises in external app) ────────────────────
// Composio redirects here after OAuth — mark as connected in Firestore
exports.composioCallback = functions.https.onRequest(async (req, res) => {
    const { companyId, app, connectionId } = req.query;
    if (companyId && app) {
        const db = admin.firestore();
        await db.collection('companies').doc(companyId).update({
            [`integrations.${app}`]: {
                connectedAt: admin.firestore.FieldValue.serverTimestamp(),
                connectionId: connectionId || null,
                authMode: 'OAUTH2',
            },
        }).catch(() => { });
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
exports.disconnectComposioIntegration = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Login required');
    const { companyId, appName } = data;
    try {
        const composio = getComposio();
        const entity = await composio.getEntity(companyId);
        const conn = await entity.getConnection({ app: appName.toLowerCase() });
        if (conn)
            await conn.delete();
    }
    catch {
        // Ignore if connection not found in Composio — still clean up Firestore
    }
    const db = admin.firestore();
    await db.collection('companies').doc(companyId).update({
        [`integrations.${appName}`]: admin.firestore.FieldValue.delete(),
    });
    return { success: true };
});
