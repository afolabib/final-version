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
exports.createCheckout = void 0;
const functions = __importStar(require("firebase-functions"));
const stripe_1 = __importDefault(require("stripe"));
const firebase_1 = require("./firebase");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});
const PRICE_IDS = {
    starter: process.env.STRIPE_PRICE_STARTER || '',
    pro: process.env.STRIPE_PRICE_PRO || '',
    max: process.env.STRIPE_PRICE_MAX || '',
};
exports.createCheckout = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { plan, onboardingSessionId, agentType } = data;
    if (!plan || !PRICE_IDS[plan]) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid plan');
    }
    const priceId = PRICE_IDS[plan];
    try {
        // Get or create Stripe customer
        const usersRef = firebase_1.db.collection('users').doc(context.auth.uid);
        const userDoc = await usersRef.get();
        let customerId = userDoc.data()?.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: context.auth.token.email,
                metadata: { firebaseUid: context.auth.uid },
            });
            customerId = customer.id;
            await usersRef.set({ stripeCustomerId: customerId }, { merge: true });
        }
        if (onboardingSessionId) {
            await firebase_1.db.collection('onboarding_sessions').doc(onboardingSessionId).set({
                userId: context.auth.uid,
                plan,
                agentType: agentType || null,
                status: 'checkout_created',
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.SITE_URL || 'https://freemi.ai'}/dashboard/wizard?checkout=success&session=${onboardingSessionId || ''}`,
            cancel_url: `${process.env.SITE_URL || 'https://freemi.ai'}/dashboard/wizard?checkout=canceled&session=${onboardingSessionId || ''}`,
            metadata: {
                userId: context.auth.uid,
                plan,
                onboardingSessionId: onboardingSessionId || '',
                agentType: agentType || '',
            },
        });
        return {
            url: session.url,
            checkoutSessionId: session.id,
            onboardingSessionId: onboardingSessionId || null,
        };
    }
    catch (error) {
        console.error('Checkout error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
    }
});
