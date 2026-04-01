import * as functions from 'firebase-functions';
import { randomBytes } from 'crypto';
import { db, serverTimestamp } from './firebase';

function normalizeDeploymentConfig(deploymentConfig: Record<string, unknown> = {}) {
  const channel = typeof deploymentConfig.channel === 'string' ? deploymentConfig.channel.trim().toLowerCase() : 'web';
  const username = typeof deploymentConfig.username === 'string' ? deploymentConfig.username.trim() : '';

  return {
    channel: channel || 'web',
    username: username || null,
  };
}

export const createOnboardingSession = functions.https.onCall(async (data) => {
  const selectedAgent = data?.selectedAgent && typeof data.selectedAgent === 'object' ? data.selectedAgent as Record<string, unknown> : {};
  const answers = data?.answers && typeof data.answers === 'object' ? data.answers as Record<string, unknown> : {};
  const deploymentConfigInput = data?.deploymentConfig && typeof data.deploymentConfig === 'object'
    ? data.deploymentConfig as Record<string, unknown>
    : {};
  const plan = typeof data?.plan === 'string' ? data.plan : null;
  const deploymentConfig = normalizeDeploymentConfig(deploymentConfigInput);
  const deploymentTargetLabels: Record<string, string> = {
    web: 'Web Dashboard',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
  };
  const sessionToken = randomBytes(24).toString('hex');

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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await db.collection('onboarding_sessions').add(payload);

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
