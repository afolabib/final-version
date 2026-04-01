"use strict";
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
exports.stripeWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const firebase_1 = require("./firebase");
const FLY_API_TOKEN = process.env.FLY_API_TOKEN;
const FLY_API_BASE = 'https://api.machines.dev';
const FLY_APP_NAME = process.env.FLY_APP_NAME || 'maagic-operators';
const FLY_REGION = process.env.FLY_REGION || 'iad';
// Generate random subdomain
function generateSubdomain() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}
// Create Fly.io Machine
async function createFlyMachine(subdomain, userId, env) {
    // 1. Create volume
    const volumeResponse = await (0, node_fetch_1.default)(`${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/volumes`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${FLY_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: `vol-${subdomain}`,
            size_gb: 1,
            region: FLY_REGION,
        }),
    });
    if (!volumeResponse.ok) {
        throw new Error(`Failed to create volume: ${await volumeResponse.text()}`);
    }
    const volume = await volumeResponse.json();
    // 2. Create machine
    const config = {
        image: 'ghcr.io/openclaw/openclaw:latest',
        guest: {
            cpu_kind: 'shared',
            cpus: 1,
            memory_mb: 1024,
        },
        env: {
            HOST: '0.0.0.0',
            PLATFORM_API_KEY: process.env.PLATFORM_API_KEY || '',
            USER_ID: userId,
            AGENT_SUBDOMAIN: subdomain,
            AGENT_URL: `https://${subdomain}.fly.dev`,
            ...env,
        },
        services: [
            {
                ports: [
                    { port: 80, handlers: ['http'] },
                    { port: 443, handlers: ['tls', 'http'] },
                ],
                protocol: 'tcp',
                internal_port: 18789,
            },
        ],
        checks: {
            http: {
                type: 'http',
                port: 18789,
                path: '/health',
                interval: '30s',
                timeout: '10s',
            },
        },
        mounts: [
            {
                volume: volume.id,
                path: '/home/node/.openclaw/workspace',
            },
        ],
        metadata: {
            user_id: userId,
            subdomain: subdomain,
            platform: 'maagic',
        },
    };
    const machineResponse = await (0, node_fetch_1.default)(`${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/machines`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${FLY_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: `agent-${subdomain}`,
            config,
            region: FLY_REGION,
        }),
    });
    if (!machineResponse.ok) {
        throw new Error(`Failed to create machine: ${await machineResponse.text()}`);
    }
    const machine = await machineResponse.json();
    // 3. Wait for machine to start
    await (0, node_fetch_1.default)(`${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/machines/${machine.id}/wait?state=started`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${FLY_API_TOKEN}`,
        },
    });
    return { machine, volume };
}
// Stripe Webhook Handler
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
    }
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        // In production, verify signature with webhookSecret
        // For now, parse the event directly
        event = req.body;
    }
    catch (err) {
        console.error('Webhook error:', err);
        res.status(400).send(`Webhook Error: ${err}`);
        return;
    }
    console.log('Stripe event:', event.type);
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            if (!userId) {
                console.error('No userId in session metadata');
                break;
            }
            console.log('Processing checkout for user:', userId);
            try {
                // Generate subdomain
                const subdomain = generateSubdomain();
                // Create Fly.io machine
                console.log('Creating Fly.io machine for:', subdomain);
                const { machine, volume } = await createFlyMachine(subdomain, userId, {});
                // Save to Firestore
                await firebase_1.db.collection('instances').add({
                    userId,
                    subdomain,
                    machineId: machine.id,
                    volumeId: volume.id,
                    url: `https://${subdomain}.fly.dev`,
                    status: 'active',
                    createdAt: (0, firebase_1.serverTimestamp)(),
                });
                console.log('Instance created:', subdomain);
            }
            catch (error) {
                console.error('Failed to provision instance:', error);
            }
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            console.log('Subscription deleted:', subscription.id);
            // Handle cleanup - find and delete instance
            break;
        }
        default:
            console.log('Unhandled event type:', event.type);
    }
    res.json({ received: true });
});
