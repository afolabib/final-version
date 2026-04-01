import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FLY_API_TOKEN = Deno.env.get('FLY_API_TOKEN');
const FLY_APP_NAME = Deno.env.get('FLY_APP_NAME') || 'openclaw-prod';
const FLY_API_BASE = 'https://api.machines.dev';
const FLY_REGION = 'iad';
const OPENCLAW_IMAGE = 'ghcr.io/openclaw/openclaw:latest';
const OPENCLAW_PORT = 18789;

async function flyFetch(path, options = {}) {
  const response = await fetch(`${FLY_API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${FLY_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Fly.io API ${response.status}: ${text}`);
  }
  return response;
}

function generateSubdomain() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

async function createVolume(userId) {
  const safeName = `ws_${userId.replace(/[^a-z0-9]/gi, '').substring(0, 20)}`;
  const res = await flyFetch(`/v1/apps/${FLY_APP_NAME}/volumes`, {
    method: 'POST',
    body: JSON.stringify({
      name: safeName,
      size_gb: 1,
      region: FLY_REGION,
    }),
  });
  const data = await res.json();
  return data.id;
}

function buildMachineConfig(env, volumeId) {
  return {
    image: OPENCLAW_IMAGE,
    guest: { cpu_kind: 'shared', cpus: 1, memory_mb: 1024 },
    env: { HOST: '0.0.0.0', ...env },
    services: [{
      ports: [
        { port: 80, handlers: ['http'] },
        { port: 443, handlers: ['tls', 'http'] },
      ],
      protocol: 'tcp',
      internal_port: OPENCLAW_PORT,
    }],
    checks: {
      health: {
        type: 'http',
        port: OPENCLAW_PORT,
        path: '/health',
        interval: '30s',
        timeout: '10s',
      },
    },
    mounts: volumeId ? [{ volume: volumeId, path: '/home/node/.openclaw/workspace' }] : [],
  };
}

function buildSoulMd(onboardingData) {
  const agentName = onboardingData.agentName || 'AI Operator';
  const answers = onboardingData.agentAnswers || {};
  const questions = onboardingData.agentQuestions || [];

  // Build Q&A section from agent-specific onboarding
  const qaLines = questions.map((q, i) => {
    const answer = answers[i];
    if (!answer) return null;
    const answerText = Array.isArray(answer) ? answer.join(', ') : String(answer);
    return `- ${q}: ${answerText}`;
  }).filter(Boolean).join('\n');

  return `# SOUL.md — ${agentName} AI Operator

## Identity
You are ${agentName}, a dedicated AI operator deployed via Freemi.

## Configuration
${qaLines || 'No specific configuration provided.'}

## Deployment
- Plan: ${onboardingData.plan || 'Not specified'}
- Channel: ${onboardingData.channel || 'web'}
`;
}

async function provisionInstance(base44, userId, onboardingData) {
  const subdomain = generateSubdomain();

  const instance = await base44.asServiceRole.entities.CustomerInstance.create({
    customerId: userId,
    appId: `pending-${subdomain}`,
    appName: `freemi-${subdomain}`,
    appUrl: `https://${FLY_APP_NAME}.fly.dev`,
    status: 'provisioning',
    region: FLY_REGION,
    config: {
      subdomain,
      agentName: onboardingData.agentName || 'Custom Agent',
      plan: onboardingData.plan,
    },
  });

  const volumeId = await createVolume(userId);

  const containerEnv = {
    USER_ID: userId,
    AGENT_NAME: onboardingData.agentName || 'Custom Agent',
    SOUL_MD: buildSoulMd(onboardingData),
  };

  if (onboardingData.telegramBotToken) {
    containerEnv.TELEGRAM_BOT_TOKEN = onboardingData.telegramBotToken;
  }

  const config = buildMachineConfig(containerEnv, volumeId);

  const machineRes = await flyFetch(`/v1/apps/${FLY_APP_NAME}/machines`, {
    method: 'POST',
    body: JSON.stringify({
      name: `user-${userId.substring(0, 8)}-${subdomain}`,
      config,
      region: FLY_REGION,
    }),
  });
  const machine = await machineRes.json();

  await flyFetch(`/v1/apps/${FLY_APP_NAME}/machines/${machine.id}/wait?state=started`);

  await base44.asServiceRole.entities.CustomerInstance.update(instance.id, {
    appId: machine.id,
    status: 'active',
    config: {
      ...instance.config,
      machineId: machine.id,
      volumeId,
    },
  });

  return { instanceId: instance.id, machineId: machine.id, volumeId };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { onboardingDataId, userId: targetUserId } = await req.json();

    const provisionUserId = (user.role === 'admin' && targetUserId) ? targetUserId : user.id;

    let onboardingData = {};
    if (onboardingDataId) {
      onboardingData = await base44.asServiceRole.entities.OnboardingData.get(onboardingDataId);
    }

    const result = await provisionInstance(base44, provisionUserId, onboardingData);

    if (onboardingDataId) {
      await base44.asServiceRole.entities.OnboardingData.update(onboardingDataId, { status: 'deployed' });
    }

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('Provisioning error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});