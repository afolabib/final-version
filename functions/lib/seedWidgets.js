"use strict";
/**
 * seedWidgets — one-time HTTP function to create/update widget documents
 * Call once: GET https://us-central1-freemi-3f7c7.cloudfunctions.net/seedWidgets
 * Then remove this export from index.ts
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
exports.seedWidgets = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
const LAUREN_UID = 'NHK2XlH09NOgtEBlPGUZjOPeNmF2';
exports.seedWidgets = functions.https.onRequest(async (req, res) => {
    const widgets = [
        {
            id: 'lauren-widget-1',
            data: {
                userId: LAUREN_UID,
                ownerId: LAUREN_UID,
                businessName: "Lauren O'Reilly",
                botName: 'Sally',
                tone: 'professional, warm, efficient',
                personality: ['confident', 'direct', 'calm', 'expert'],
                capabilities: [
                    'speaking engagement bookings',
                    'brand partnership enquiries',
                    'podcast guest applications',
                    'media appearance requests',
                    'general questions about Lauren',
                ],
                greeting: "Welcome. I'm **Sally** — Lauren's AI concierge.\n\nI handle bookings, partnerships, enquiries, and complaints — right here, right now.\n\nWhat do you need?",
                primaryColor: '#C1122F',
                customInstructions: `Lauren O'Reilly is a qualified pharmacist (MPSI), podcast host, RTÉ contributor, and health communicator based in Ireland. She hosts The Wellness Script podcast — evidence-based wellness conversations with verified professionals. Instagram: @itslaurenoreilly

SERVICES:
- Speaking engagements: keynotes, panels, workshops on health & wellness
- Media appearances: TV, radio, digital expert commentary
- Brand partnerships: authentic collaborations with health-focused brands
- Podcast guesting: expert interviews on The Wellness Script
- Consulting: advisory for wellness brands, startups, health organisations

BOOKING FLOW: Collect name → request type → preferred date → company/org → budget → email. Then confirm and submit.
Never redirect visitors to email or contact forms — handle everything in the chat.
Always confirm submissions with: "Your request has been submitted — Lauren's team will respond within 24–48 hours."`,
                active: true,
                updatedAt: (0, firebase_1.serverTimestamp)(),
            },
        },
        {
            id: 'lauren-widget-2',
            data: {
                userId: LAUREN_UID,
                ownerId: LAUREN_UID,
                businessName: 'The Wellness Script',
                botName: 'Sally',
                tone: 'warm, friendly, knowledgeable',
                personality: ['approachable', 'enthusiastic', 'evidence-based'],
                capabilities: [
                    'podcast episode information',
                    'sponsorship enquiries',
                    'guest applications',
                    'listener support',
                ],
                greeting: "Hey! 👋 Welcome to **The Wellness Script**. I'm Sally — ask me anything about the podcast, Lauren, sponsorship, or how to get involved!\n\nWhat can I help with?",
                primaryColor: '#C1122F',
                customInstructions: `The Wellness Script is an evidence-based wellness podcast hosted by Lauren O'Reilly, a qualified pharmacist and RTÉ contributor based in Ireland. Season 2 is currently streaming. Available on Spotify, Apple Podcasts, and YouTube. Tagline: "Truth in a noisy wellness world"

FIVE CONTENT PILLARS:
1. Pharmacy & Medication — drug interactions, supplements, what works
2. Mental Health — anxiety, stress, therapy insights
3. Nutrition — evidence-based diet, debunking myths
4. Fitness & Recovery — exercise science, injury prevention
5. Holistic Wellness — sleep, gut health, hormones

All guests are verified professionals — GPs, psychologists, dietitians, sports scientists. No influencers.

SPONSORSHIP: Season 2 Launch Sponsor package — €2,500 for the full season.
Includes: host-read ad every episode, show notes links, tagged in all social posts, dedicated Instagram Reel, first refusal on future seasons. One exclusive sponsor per season.

CONTACT: lauren@wellnessscriptpod.com | @itslaurenoreilly`,
                active: true,
                updatedAt: (0, firebase_1.serverTimestamp)(),
            },
        },
    ];
    try {
        const batch = firebase_1.db.batch();
        for (const w of widgets) {
            const ref = firebase_1.db.collection('widgets').doc(w.id);
            batch.set(ref, w.data, { merge: true });
        }
        await batch.commit();
        res.json({ success: true, created: widgets.map(w => w.id) });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
