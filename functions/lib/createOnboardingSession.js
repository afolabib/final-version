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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnboardingSession = void 0;
const functions = __importStar(require("firebase-functions"));
const crypto_1 = require("crypto");
const firebase_1 = require("./firebase");
function normalizeDeploymentConfig(deploymentConfig = {}) {
    const channel = typeof deploymentConfig.channel === 'string' ? deploymentConfig.channel.trim().toLowerCase() : 'web';
    const username = typeof deploymentConfig.username === 'string' ? deploymentConfig.username.trim() : '';
    return {
        channel: channel || 'web',
        username: username || null,
    };
}
exports.createOnboardingSession = functions.https.onCall(async (data) => {
    const selectedAgent = data?.selectedAgent && typeof data.selectedAgent === 'object' ? data.selectedAgent : {};
    const answers = data?.answers && typeof data.answers === 'object' ? data.answers : {};
    const deploymentConfigInput = data?.deploymentConfig && typeof data.deploymentConfig === 'object'
        ? data.deploymentConfig
        : {};
    const plan = typeof data?.plan === 'string' ? data.plan : null;
    const deploymentConfig = normalizeDeploymentConfig(deploymentConfigInput);
    const deploymentTargetLabels = {
        web: 'Web Dashboard',
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
    };
    const sessionToken = (0, crypto_1.randomBytes)(24).toString('hex');
    const payload = {
        agentType: typeof selectedAgent.id === 'string' ? selectedAgent.id : null,
        agentName: typeof selectedAgent.name === 'string' ? selectedAgent.name : null,
        questionSchema: Array.isArray(selectedAgent.questions) ? selectedAgent.questions : [],
        answers,
        plan,
        deploymentConfig,
        deploymentTarget: deploymentTargetLabels[deploymentConfig.channel] || 'Web Dashboard',
        status: 'draft',
        source: 'wizard_v2_callable',
        wizardAccessToken: sessionToken,
        createdAt: (0, firebase_1.serverTimestamp)(),
        updatedAt: (0, firebase_1.serverTimestamp)(),
    };
    const docRef = await firebase_1.db.collection('onboarding_sessions').add(payload);
    return {
        id: docRef.id,
        agentType: payload.agentType,
        agentName: payload.agentName,
        questionSchema: payload.questionSchema,
        answers: payload.answers,
        plan: payload.plan,
        deploymentConfig: payload.deploymentConfig,
        deploymentTarget: payload.deploymentTarget,
        status: payload.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wizardAccessToken: sessionToken,
    };
});
