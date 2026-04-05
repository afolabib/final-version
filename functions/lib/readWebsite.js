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
exports.readWebsite = void 0;
const functions = __importStar(require("firebase-functions"));
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Fetches a URL and returns plain text (tags stripped).
 * Used during onboarding so Freemi can read the company's website.
 */
exports.readWebsite = functions.https.onCall(async (data) => {
    const { url } = data;
    if (!url || !url.startsWith('http')) {
        throw new functions.https.HttpsError('invalid-argument', 'A valid URL is required');
    }
    try {
        const res = await (0, node_fetch_1.default)(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Freemi/1.0)' },
            // @ts-ignore
            timeout: 8000,
            redirect: 'follow',
        });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        // Strip HTML tags → plain text, collapse whitespace
        const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\s{2,}/g, ' ')
            .trim()
            .slice(0, 4000); // cap at 4k chars to keep LLM prompt sane
        return { text, url };
    }
    catch (err) {
        throw new functions.https.HttpsError('internal', `Could not fetch site: ${err.message}`);
    }
});
