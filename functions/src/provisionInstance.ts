import * as functions from 'firebase-functions';
import { randomBytes } from 'crypto';
import fetch from 'node-fetch';
import { admin, db, serverTimestamp } from './firebase';
import { generateOpenClawWorkspace, type GeneratedWorkspace } from './openclawWorkspace';

const FLY_API_TOKEN = process.env.FLY_API_TOKEN;
const FLY_API_BASE = 'https://api.machines.dev';
const FLY_APP_NAME = process.env.FLY_APP_NAME || 'maagic-operators';
const FLY_REGION = process.env.FLY_REGION || 'iad';
const FLY_PUBLIC_HOSTNAME = process.env.FLY_PUBLIC_HOSTNAME || `${FLY_APP_NAME}.fly.dev`;
const FLY_APP_HOSTNAME = FLY_PUBLIC_HOSTNAME.replace(/^https?:\/\//, '').replace(/\/$/, '');
const OPENCLAW_GATEWAY_PORT = Number(process.env.OPENCLAW_GATEWAY_PORT || 18789);
const OPENCLAW_STATE_DIR = process.env.OPENCLAW_STATE_DIR || '/data';
const FLY_MACHINE_MEMORY_MB = Number(process.env.FLY_MACHINE_MEMORY_MB || 4096);
const NODE_MAX_OLD_SPACE_MB = Number(process.env.NODE_MAX_OLD_SPACE_MB || 3072);
const FLY_SHARED_CPU_MEMORY_CAP_MB = 2048;
const OPENCLAW_GATEWAY_TOKEN_LENGTH_BYTES = 32;
const HEALTH_VERIFY_TIMEOUT_MS = 4500;
const HEALTH_FAILURE_THRESHOLD = 3;

type WizardAnswers = Record<string, unknown>;
type DeploymentProfile = {
  version: number;
  generatedAt: string;
  target: {
    platform: 'fly.io';
    appName: string;
    region: string;
    image: string;
    url: string;
    subdomain: string;
  };
  agent: {
    type: string | null;
    plan: string | null;
    model: string | null;
    communicationChannel: string | null;
    autonomy: string | null;
    priority: string | null;
  };
  onboarding: {
    sessionId: string | null;
    answers: WizardAnswers;
  };
  runtime: {
    env: Record<string, string>;
    workspaceSeedHints: string[];
  };
};

type ProvisioningEvent = {
  type: string;
  status: 'info' | 'success' | 'warning' | 'error';
  message: string;
  userId: string;
  onboardingSessionId?: string | null;
  instanceId?: string | null;
  machineId?: string | null;
  deploymentUrl?: string | null;
  details?: Record<string, unknown>;
  createdAt: FirebaseFirestore.FieldValue;
};

type OnboardingSessionContext = {
  ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
  data: Record<string, unknown>;
  userId: string;
  plan: string | null;
  agentType: string | null;
  answers: WizardAnswers;
  deploymentTarget: string;
};

type ProvisioningClaimResult = {
  shouldProvision: boolean;
  existingInstanceId: string | null;
  existingMachineId: string | null;
  existingVolumeId: string | null;
  existingDeploymentUrl: string | null;
  existingSubdomain: string | null;
  existingDeploymentProfile: DeploymentProfile | null;
  existingGeneratedWorkspace: GeneratedWorkspace | null;
  existingHealthCheck: Record<string, unknown> | null;
  existingStatus: string | null;
  inFlight: boolean;
  lockToken: string | null;
};

type FlyMachineHealthSummary = {
  ok: boolean;
  machineState: string | null;
  checksPassing: boolean | null;
  checkCount: number;
  passingChecks: number;
  failingChecks: number;
  rawChecks: unknown[];
  machineResponse: Record<string, unknown> | null;
};

type FlyMachineConfig = {
  image: string;
  guest: {
    cpu_kind: string;
    cpus: number;
    memory_mb: number;
  };
  init?: {
    cmd?: string[];
  };
  env: Record<string, string>;
  services: Array<{
    ports: Array<{ port: number; handlers: string[] }>;
    protocol: string;
    internal_port: number;
  }>;
  checks: Record<string, {
    type: string;
    port: number;
    path: string;
    interval: string;
    timeout: string;
    grace_period?: string;
  }>;
  mounts?: Array<{ volume: string; path: string }>;
  metadata: Record<string, string>;
};

type FlyVolume = {
  id: string;
};

type FlyMachine = {
  id: string;
};

function normalizeAnswer(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const items = value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry).trim()))
      .filter(Boolean);

    return items.length ? items.join(', ') : null;
  }

  return value == null ? null : String(value);
}

function buildWorkspaceSeedHints(agentType: string | null, answers: WizardAnswers): string[] {
  const hints = new Set<string>();

  if (agentType === 'freemi_operator') {
    hints.add('Include CEO-mode operating instructions and heartbeat cadence.');
  }

  if (agentType === 'dev_operator') {
    hints.add('Include web-development and deployment-focused instructions.');
  }

  if (agentType === 'sales_operator') {
    hints.add('Include outreach, follow-up cadence, and CRM workflow instructions.');
  }

  if (agentType === 'support_operator') {
    hints.add('Include SLA handling, escalation, and response-drafting instructions.');
  }

  if (normalizeAnswer(answers.tool_stack) || normalizeAnswer(answers.stack) || normalizeAnswer(answers.tools) || normalizeAnswer(answers.crm)) {
    hints.add('Preload tool integration notes based on selected stack and connected systems.');
  }

  if (normalizeAnswer(answers.business_goal) || normalizeAnswer(answers.goal) || normalizeAnswer(answers.top_priority) || normalizeAnswer(answers.success_metric)) {
    hints.add('Reflect the primary business objective in the agent mission and KPIs.');
  }

  if (normalizeAnswer(answers.update_channel) || normalizeAnswer(answers.outreach_channel) || normalizeAnswer(answers.escalation)) {
    hints.add('Configure communication defaults around the preferred update and escalation channels.');
  }

  return Array.from(hints);
}

function buildDeploymentProfile(params: {
  subdomain: string;
  deploymentUrl: string;
  onboardingSessionId: string | null;
  plan: string | null;
  agentType: string | null;
  answers: WizardAnswers;
  resolvedModel: string | null;
  env: Record<string, string>;
  deploymentTarget: string | null;
}): DeploymentProfile {
  const {
    subdomain,
    deploymentUrl,
    onboardingSessionId,
    plan,
    agentType,
    answers,
    resolvedModel,
    env,
    deploymentTarget,
  } = params;

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    target: {
      platform: 'fly.io',
      appName: FLY_APP_NAME,
      region: FLY_REGION,
      image: 'ghcr.io/openclaw/openclaw:latest',
      url: deploymentUrl,
      subdomain,
    },
    agent: {
      type: agentType,
      plan,
      model: resolvedModel,
      communicationChannel: normalizeAnswer(answers.update_channel)
        || normalizeAnswer(answers.outreach_channel)
        || normalizeAnswer(answers.escalation)
        || deploymentTarget,
      autonomy: normalizeAnswer(answers.delegation_mode) || normalizeAnswer(answers.autonomy) || normalizeAnswer(answers.auto_response),
      priority: normalizeAnswer(answers.top_priority) || normalizeAnswer(answers.goal) || normalizeAnswer(answers.success_metric),
    },
    onboarding: {
      sessionId: onboardingSessionId,
      answers,
    },
    runtime: {
      env,
      workspaceSeedHints: buildWorkspaceSeedHints(agentType, answers),
    },
  };
}

function generateSubdomain(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function buildAppDeploymentUrl(): string {
  return `https://${FLY_APP_HOSTNAME}`;
}

function generateGatewayToken(): string {
  return randomBytes(OPENCLAW_GATEWAY_TOKEN_LENGTH_BYTES).toString('hex');
}

function buildOpenClawStartupCommand(): string[] {
  const publicOrigin = buildAppDeploymentUrl();
  const stateFile = `${OPENCLAW_STATE_DIR.replace(/\/$/, '')}/openclaw.json`;
  const seedConfigScript = [
    'const fs=require("fs");',
    `const file=${JSON.stringify(stateFile)};`,
    'const nextOrigin=process.env.FLY_APP_HOSTNAME ? `https://${process.env.FLY_APP_HOSTNAME}` : process.env.AGENT_URL;',
    'let config={};',
    'if(fs.existsSync(file)){config=JSON.parse(fs.readFileSync(file,"utf8"));}',
    'config.gateway=config.gateway||{};',
    'config.gateway.bind="lan";',
    'config.gateway.controlUi=config.gateway.controlUi||{};',
    'config.gateway.controlUi.allowedOrigins=[nextOrigin];',
    'fs.writeFileSync(file, JSON.stringify(config, null, 2));',
  ].join('');
  const gatewayCommand = [
    'exec',
    'node',
    'dist/index.js',
    'gateway',
    '--allow-unconfigured',
    '--port',
    String(OPENCLAW_GATEWAY_PORT),
    '--bind',
    'lan',
  ].join(' ');

  return [
    'sh',
    '-lc',
    [
      `mkdir -p ${JSON.stringify(OPENCLAW_STATE_DIR)}`,
      `node -e ${JSON.stringify(seedConfigScript)}`,
      gatewayCommand,
    ].join(' && '),
  ];
}

function buildSharedFlyGuestConfig() {
  const cpus = Math.max(1, Math.ceil(FLY_MACHINE_MEMORY_MB / FLY_SHARED_CPU_MEMORY_CAP_MB));

  return {
    cpu_kind: 'shared',
    cpus,
    memory_mb: FLY_MACHINE_MEMORY_MB,
  };
}

function buildContainerEnv(params: {
  subdomain: string;
  userId: string;
  env?: Record<string, string>;
}): Record<string, string> {
  const { subdomain, userId, env = {} } = params;
  const appDeploymentUrl = buildAppDeploymentUrl();

  return {
    HOST: '0.0.0.0',
    NODE_OPTIONS: `--max-old-space-size=${NODE_MAX_OLD_SPACE_MB}`,
    OPENCLAW_GATEWAY_BIND: 'lan',
    OPENCLAW_GATEWAY_PORT: String(OPENCLAW_GATEWAY_PORT),
    OPENCLAW_GATEWAY_TOKEN: generateGatewayToken(),
    OPENCLAW_STATE_DIR,
    USER_ID: userId,
    AGENT_SUBDOMAIN: subdomain,
    FLY_APP_NAME,
    FLY_APP_HOSTNAME,
    AGENT_URL: appDeploymentUrl,
    ...env,
  };
}

async function logProvisioningEvent(event: ProvisioningEvent) {
  const payload = {
    ...event,
    details: event.details || {},
  };

  const writes: Array<Promise<unknown>> = [];

  if (event.onboardingSessionId) {
    writes.push(
      db.collection('onboarding_sessions')
        .doc(event.onboardingSessionId)
        .collection('events')
        .add(payload)
    );
  }

  if (event.instanceId) {
    writes.push(
      db.collection('instances')
        .doc(event.instanceId)
        .collection('events')
        .add(payload)
    );
  }

  if (!writes.length) return;

  const results = await Promise.allSettled(writes);
  const rejected = results.find((result) => result.status === 'rejected');
  if (rejected?.status === 'rejected') {
    throw rejected.reason;
  }
}

function buildPendingHealthCheck() {
  return {
    healthy: false,
    verifiedAt: null,
    pending: true,
    mode: 'deferred',
    attempts: [],
  };
}

function summarizeFlyChecks(rawChecks: unknown[]): { checkCount: number; passingChecks: number; failingChecks: number; checksPassing: boolean | null } {
  if (!rawChecks.length) {
    return {
      checkCount: 0,
      passingChecks: 0,
      failingChecks: 0,
      checksPassing: null,
    };
  }

  let passingChecks = 0;
  let failingChecks = 0;

  for (const check of rawChecks) {
    const normalized = typeof check === 'object' && check ? check as Record<string, unknown> : {};
    const status = typeof normalized.status === 'string' ? normalized.status.toLowerCase() : null;
    const output = typeof normalized.output === 'string' ? normalized.output.toLowerCase() : '';

    const isPassing = status === 'passing' || status === 'passed' || status === 'healthy' || output.includes('passing');
    const isFailing = status === 'failing' || status === 'failed' || status === 'critical' || output.includes('failing') || output.includes('failed');

    if (isPassing) passingChecks += 1;
    if (isFailing) failingChecks += 1;
  }

  return {
    checkCount: rawChecks.length,
    passingChecks,
    failingChecks,
    checksPassing: failingChecks > 0 ? false : passingChecks > 0 ? true : null,
  };
}

async function getFlyMachineHealth(machineId: string): Promise<FlyMachineHealthSummary> {
  const response = await fetch(`${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/machines/${machineId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${FLY_API_TOKEN}` },
  });

  if (!response.ok) {
    throw new Error(`Machine inspect error: ${await response.text()}`);
  }

  const machineResponse = await response.json() as Record<string, unknown>;
  const machineState = typeof machineResponse.state === 'string'
    ? machineResponse.state.toLowerCase()
    : typeof machineResponse.instance_state === 'string'
      ? String(machineResponse.instance_state).toLowerCase()
      : null;

  const rawChecks = Array.isArray(machineResponse.checks)
    ? machineResponse.checks
    : Array.isArray(machineResponse.health_checks)
      ? machineResponse.health_checks
      : [];

  const { checkCount, passingChecks, failingChecks, checksPassing } = summarizeFlyChecks(rawChecks);
  const ok = (machineState === 'started' || machineState === 'running') && (checksPassing !== false);

  return {
    ok,
    machineState,
    checksPassing,
    checkCount,
    passingChecks,
    failingChecks,
    rawChecks,
    machineResponse,
  };
}

async function resolveOnboardingSessionContext(params: {
  onboardingSessionId: string;
  userId?: string | null;
  wizardAccessToken?: string | null;
  plan?: string | null;
  agentType?: string | null;
  answers?: WizardAnswers;
}) {
  const { onboardingSessionId, userId, wizardAccessToken, plan, agentType, answers } = params;
  const onboardingRef = db.collection('onboarding_sessions').doc(onboardingSessionId);
  const onboardingSnap = await onboardingRef.get();

  if (!onboardingSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Onboarding session could not be found');
  }

  const onboardingData = (onboardingSnap.data() || {}) as Record<string, unknown>;

  const sessionUserId = typeof onboardingData.userId === 'string' && onboardingData.userId
    ? onboardingData.userId
    : `wizard_${onboardingSessionId}`;
  const storedWizardAccessToken = typeof onboardingData.wizardAccessToken === 'string' ? onboardingData.wizardAccessToken : null;
  const hasValidWizardToken = Boolean(
    wizardAccessToken
    && storedWizardAccessToken
    && wizardAccessToken === storedWizardAccessToken
  );

  if (userId) {
    if (typeof onboardingData.userId === 'string' && onboardingData.userId && onboardingData.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Onboarding session does not belong to this user');
    }
  } else if (!hasValidWizardToken) {
    throw new functions.https.HttpsError('unauthenticated', 'Wizard access token is required for unauthenticated provisioning');
  }

  const sessionAnswers = onboardingData.answers && typeof onboardingData.answers === 'object'
    ? onboardingData.answers as WizardAnswers
    : {};
  const requestAnswers = answers && typeof answers === 'object' ? answers : {};

  return {
    ref: onboardingRef,
    data: onboardingData,
    userId: sessionUserId,
    plan: plan || (typeof onboardingData.plan === 'string' ? onboardingData.plan : null),
    agentType: agentType || (typeof onboardingData.agentType === 'string' ? onboardingData.agentType : null),
    answers: Object.keys(requestAnswers).length ? requestAnswers : sessionAnswers,
    deploymentTarget: typeof onboardingData.deploymentTarget === 'string' && onboardingData.deploymentTarget
      ? onboardingData.deploymentTarget
      : 'Fly.io',
  } satisfies OnboardingSessionContext;
}

async function claimProvisioningForSession(params: {
  context: OnboardingSessionContext;
  userId: string;
  plan: string | null;
  agentType: string | null;
  answers: WizardAnswers;
  deploymentTarget: string;
}) {
  const { context, userId, plan, agentType, answers, deploymentTarget } = params;
  const lockToken = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const nowIso = new Date().toISOString();
  const staleBeforeMs = Date.now() - (10 * 60 * 1000);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(context.ref);
    const data = (snapshot.data() || {}) as Record<string, unknown>;

    const existingInstanceId = typeof data.instanceId === 'string' ? data.instanceId : null;
    const existingMachineId = typeof data.machineId === 'string' ? data.machineId : null;
    const existingVolumeId = typeof data.volumeId === 'string' ? data.volumeId : null;
    const existingDeploymentUrl = typeof data.deploymentUrl === 'string' ? data.deploymentUrl : null;
    const existingSubdomain = typeof data.subdomain === 'string' ? data.subdomain : null;
    const existingStatus = typeof data.status === 'string' ? data.status : null;
    const existingDeploymentProfile = data.deploymentProfile && typeof data.deploymentProfile === 'object'
      ? data.deploymentProfile as DeploymentProfile
      : null;
    const existingGeneratedWorkspace = data.generatedWorkspace && typeof data.generatedWorkspace === 'object'
      ? data.generatedWorkspace as GeneratedWorkspace
      : null;
    const existingHealthCheck = data.healthCheck && typeof data.healthCheck === 'object'
      ? data.healthCheck as Record<string, unknown>
      : null;
    const existingLockToken = typeof data.provisioningLockToken === 'string' ? data.provisioningLockToken : null;
    const existingStartedAtRaw = typeof data.provisioningStartedAt === 'string' ? data.provisioningStartedAt : null;
    const existingStartedAtMs = existingStartedAtRaw ? Date.parse(existingStartedAtRaw) : NaN;
    const hasFreshLock = Boolean(existingLockToken && !Number.isNaN(existingStartedAtMs) && existingStartedAtMs >= staleBeforeMs);

    if (existingInstanceId) {
      return {
        shouldProvision: false,
        existingInstanceId,
        existingMachineId,
        existingVolumeId,
        existingDeploymentUrl,
        existingSubdomain,
        existingDeploymentProfile,
        existingGeneratedWorkspace,
        existingHealthCheck,
        existingStatus,
        inFlight: false,
        lockToken: null,
      } satisfies ProvisioningClaimResult;
    }

    if (existingStatus === 'provisioning_started' && hasFreshLock) {
      return {
        shouldProvision: false,
        existingInstanceId: null,
        existingMachineId,
        existingVolumeId,
        existingDeploymentUrl,
        existingSubdomain,
        existingDeploymentProfile,
        existingGeneratedWorkspace,
        existingHealthCheck,
        existingStatus,
        inFlight: true,
        lockToken: existingLockToken,
      } satisfies ProvisioningClaimResult;
    }

    transaction.set(context.ref, {
      userId,
      plan,
      agentType,
      answers,
      status: 'provisioning_started',
      deploymentTarget,
      provisioningLockToken: lockToken,
      provisioningStartedAt: nowIso,
      provisioningError: admin.firestore.FieldValue.delete(),
      updatedAt: nowIso,
    }, { merge: true });

    return {
      shouldProvision: true,
      existingInstanceId: null,
      existingMachineId: null,
      existingVolumeId: null,
      existingDeploymentUrl: null,
      existingSubdomain: null,
      existingDeploymentProfile: null,
      existingGeneratedWorkspace: null,
      existingHealthCheck: null,
      existingStatus: 'provisioning_started',
      inFlight: false,
      lockToken,
    } satisfies ProvisioningClaimResult;
  });
}

async function createFlyVolume(subdomain: string): Promise<FlyVolume> {
  const volumeRes = await fetch(`${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/volumes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FLY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: `vol-${subdomain}`, size_gb: 1, region: FLY_REGION }),
  });

  if (!volumeRes.ok) throw new Error(`Volume error: ${await volumeRes.text()}`);

  const volume = await volumeRes.json() as Partial<FlyVolume>;
  if (!volume.id) {
    throw new Error(`Volume error: unexpected response ${JSON.stringify(volume)}`);
  }

  return { id: volume.id };
}

function buildFlyMachineConfig(params: {
  volumeId: string;
  containerEnv: Record<string, string>;
  metadata: Record<string, string>;
}): FlyMachineConfig {
  const { volumeId, containerEnv, metadata } = params;

  return {
    image: 'ghcr.io/openclaw/openclaw:latest',
    guest: buildSharedFlyGuestConfig(),
    init: {
      cmd: buildOpenClawStartupCommand(),
    },
    env: containerEnv,
    services: [
      {
        ports: [{ port: 80, handlers: ['http'] }, { port: 443, handlers: ['tls', 'http'] }],
        protocol: 'tcp',
        internal_port: OPENCLAW_GATEWAY_PORT,
      },
    ],
    checks: {
      http: {
        type: 'http',
        port: OPENCLAW_GATEWAY_PORT,
        path: '/healthz',
        interval: '30s',
        timeout: '10s',
        grace_period: '30s',
      },
    },
    mounts: [{ volume: volumeId, path: OPENCLAW_STATE_DIR }],
    metadata,
  };
}

async function createFlyMachine(params: {
  subdomain: string;
  config: FlyMachineConfig;
}): Promise<FlyMachine> {
  const { subdomain, config } = params;

  const machineRes = await fetch(`${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/machines`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${FLY_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `agent-${subdomain}`, config, region: FLY_REGION }),
  });

  if (!machineRes.ok) throw new Error(`Machine error: ${await machineRes.text()}`);

  const machine = await machineRes.json() as Partial<FlyMachine>;
  if (!machine.id) {
    throw new Error(`Machine error: unexpected response ${JSON.stringify(machine)}`);
  }

  const waitRes = await fetch(`${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/machines/${machine.id}/wait?state=started`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${FLY_API_TOKEN}` },
  });

  if (!waitRes.ok) {
    throw new Error(`Machine wait error: ${await waitRes.text()}`);
  }

  return { id: machine.id };
}

export const provisionInstance = functions.https.onCall(async (data, context) => {
  const {
    model,
    openrouterKey,
    onboardingSessionId,
    plan,
    agentType,
    answers = {},
    wizardAccessToken,
  } = data || {};
  const normalizedAnswers: WizardAnswers = answers && typeof answers === 'object' ? answers as WizardAnswers : {};
  const providedWizardAccessToken = typeof wizardAccessToken === 'string' ? wizardAccessToken : null;
  let userId = context.auth?.uid || null;

  if (!userId && !providedWizardAccessToken) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated or provide a wizard access token');
  }

  let createdInstanceId: string | null = null;
  let createdMachineId: string | null = null;
  let deploymentUrlForLogs: string | null = null;
  let effectivePlan = plan || null;
  let effectiveAgentType = agentType || null;
  let effectiveAnswers: WizardAnswers = normalizedAnswers;
  let deploymentTarget = typeof normalizedAnswers?.deployment_target === 'string' && normalizedAnswers.deployment_target
    ? normalizedAnswers.deployment_target
    : 'Fly.io';
  let provisioningLockToken: string | null = null;

  try {
    let onboardingContext: OnboardingSessionContext | null = null;

    if (onboardingSessionId) {
      onboardingContext = await resolveOnboardingSessionContext({
        onboardingSessionId,
        userId,
        wizardAccessToken: providedWizardAccessToken,
        plan: effectivePlan,
        agentType: effectiveAgentType,
        answers: effectiveAnswers,
      });

      userId = userId || onboardingContext.userId;
      effectivePlan = onboardingContext.plan;
      effectiveAgentType = onboardingContext.agentType;
      effectiveAnswers = onboardingContext.answers;
      deploymentTarget = onboardingContext.deploymentTarget || deploymentTarget;

      const claim = await claimProvisioningForSession({
        context: onboardingContext,
        userId,
        plan: effectivePlan,
        agentType: effectiveAgentType,
        answers: effectiveAnswers,
        deploymentTarget,
      });

      provisioningLockToken = claim.lockToken;

      if (claim.existingInstanceId) {
        const existingInstanceRef = db.collection('instances').doc(claim.existingInstanceId);
        const existingInstanceSnap = await existingInstanceRef.get();

        if (existingInstanceSnap.exists) {
          const existingInstance = existingInstanceSnap.data() || {};

          await onboardingContext.ref.set({
            status: existingInstance.healthCheck?.healthy ? 'healthy' : 'provisioned',
            provisioningLockToken: admin.firestore.FieldValue.delete(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });

          await logProvisioningEvent({
            type: 'instance_reused',
            status: 'info',
            message: 'Provisioning request reused an existing instance for this onboarding session.',
            userId,
            onboardingSessionId,
            instanceId: existingInstanceSnap.id,
            machineId: existingInstance.machineId || claim.existingMachineId || null,
            deploymentUrl: existingInstance.url || claim.existingDeploymentUrl || null,
            details: {
              status: existingInstance.healthCheck?.healthy ? 'healthy' : 'provisioned',
              subdomain: existingInstance.subdomain || claim.existingSubdomain || null,
            },
            createdAt: serverTimestamp(),
          });

          return {
            success: true,
            reusedExistingInstance: true,
            instanceId: existingInstanceSnap.id,
            onboardingSessionId,
            subdomain: existingInstance.subdomain || claim.existingSubdomain || null,
            machineId: existingInstance.machineId || claim.existingMachineId || null,
            volumeId: existingInstance.volumeId || claim.existingVolumeId || null,
            url: existingInstance.url || claim.existingDeploymentUrl || null,
            deploymentTarget: existingInstance.deploymentTarget || deploymentTarget,
            deploymentProfile: existingInstance.deploymentProfile || claim.existingDeploymentProfile || null,
            generatedWorkspace: existingInstance.generatedWorkspace || claim.existingGeneratedWorkspace || null,
            healthCheck: existingInstance.healthCheck || claim.existingHealthCheck || null,
          };
        }
      }

      if (claim.inFlight) {
        await logProvisioningEvent({
          type: 'provisioning_reused_inflight',
          status: 'info',
          message: 'Provisioning request detected an existing in-flight deployment for this onboarding session.',
          userId,
          onboardingSessionId,
          machineId: claim.existingMachineId,
          deploymentUrl: claim.existingDeploymentUrl,
          details: {
            status: claim.existingStatus,
            subdomain: claim.existingSubdomain,
          },
          createdAt: serverTimestamp(),
        });

        return {
          success: true,
          provisioningInFlight: true,
          onboardingSessionId,
          instanceId: null,
          subdomain: claim.existingSubdomain,
          machineId: claim.existingMachineId,
          volumeId: claim.existingVolumeId,
          url: claim.existingDeploymentUrl,
          deploymentTarget,
          deploymentProfile: claim.existingDeploymentProfile,
          generatedWorkspace: claim.existingGeneratedWorkspace,
          healthCheck: claim.existingHealthCheck,
          status: claim.existingStatus || 'provisioning_started',
        };
      }

      await logProvisioningEvent({
        type: 'provisioning_started',
        status: 'info',
        message: 'Provisioning started for onboarding session.',
        userId,
        onboardingSessionId,
        details: {
          plan: effectivePlan,
          agentType: effectiveAgentType,
          deploymentTarget,
          answersSource: Object.keys(normalizedAnswers).length ? 'request_payload' : 'onboarding_session',
        },
        createdAt: serverTimestamp(),
      });
    }

    const env: Record<string, string> = {};
    const resolvedModel = model || effectiveAnswers?.preferred_model || effectiveAnswers?.model_choice || null;

    if (resolvedModel) env.MODEL_PREFERENCE = resolvedModel;
    if (openrouterKey) env.OPENROUTER_API_KEY = openrouterKey;

    const subdomain = generateSubdomain();
    const containerEnv = buildContainerEnv({
      subdomain,
      userId,
      env,
    });
    const deploymentUrl = buildAppDeploymentUrl();
    deploymentUrlForLogs = deploymentUrl;
    const deploymentProfile = buildDeploymentProfile({
      subdomain,
      deploymentUrl,
      onboardingSessionId: onboardingSessionId || null,
      plan: effectivePlan,
      agentType: effectiveAgentType,
      answers: effectiveAnswers,
      resolvedModel,
      env: containerEnv,
      deploymentTarget,
    });
    const generatedWorkspace = generateOpenClawWorkspace(deploymentProfile);

    await logProvisioningEvent({
      type: 'deployment_profile_generated',
      status: 'info',
      message: 'Generated deployment profile and OpenClaw workspace bundle.',
      userId,
      onboardingSessionId: onboardingSessionId || null,
      deploymentUrl,
      details: {
        subdomain,
        workspaceFileCount: generatedWorkspace.files.length,
        deploymentTarget,
      },
      createdAt: serverTimestamp(),
    });

    const volume = await createFlyVolume(subdomain);
    const machineConfig = buildFlyMachineConfig({
      volumeId: volume.id,
      containerEnv,
      metadata: {
        user_id: userId,
        subdomain,
        public_hostname: FLY_APP_HOSTNAME,
        platform: 'maagic',
      },
    });
    const machine = await createFlyMachine({
      subdomain,
      config: machineConfig,
    });
    createdMachineId = machine.id;
    const healthCheck = buildPendingHealthCheck();

    await logProvisioningEvent({
      type: 'machine_created',
      status: 'success',
      message: 'Fly machine and attached volume created successfully.',
      userId,
      onboardingSessionId: onboardingSessionId || null,
      machineId: machine.id,
      deploymentUrl,
      details: {
        subdomain,
        volumeId: volume.id,
        appName: FLY_APP_NAME,
        region: FLY_REGION,
        launchPath: 'thin_machine_only',
      },
      createdAt: serverTimestamp(),
    });

    await logProvisioningEvent({
      type: 'launch_path_completed',
      status: 'info',
      message: 'Thin deployment path completed machine launch without post-boot seeding or inline health polling.',
      userId,
      onboardingSessionId: onboardingSessionId || null,
      machineId: machine.id,
      deploymentUrl,
      details: {
        subdomain,
        deferredHealthCheck: true,
        workspaceBundleStoredOnly: true,
      },
      createdAt: serverTimestamp(),
    });

    const instanceRef = await db.collection('instances').add({
      userId,
      onboardingSessionId: onboardingSessionId || null,
      subdomain,
      machineId: machine.id,
      volumeId: volume.id,
      url: deploymentUrl,
      status: 'active_unverified',
      provisioningSource: 'wizard_v2',
      launchPath: 'thin_machine_only',
      plan: effectivePlan,
      agentType: effectiveAgentType,
      deploymentTarget,
      answers: effectiveAnswers,
      deploymentProfile,
      generatedWorkspace,
      healthCheck,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    createdInstanceId = instanceRef.id;

    if (onboardingSessionId) {
      await db.collection('onboarding_sessions').doc(onboardingSessionId).set({
        instanceId: instanceRef.id,
        subdomain,
        machineId: machine.id,
        volumeId: volume.id,
        deploymentUrl,
        deploymentProfile,
        generatedWorkspace,
        healthCheck,
        provisioningLockToken: admin.firestore.FieldValue.delete(),
        status: 'provisioned_unverified',
        launchPath: 'thin_machine_only',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    await logProvisioningEvent({
      type: 'instance_record_created',
      status: 'success',
      message: 'Provisioned instance record persisted to Firestore.',
      userId,
      onboardingSessionId: onboardingSessionId || null,
      instanceId: instanceRef.id,
      machineId: machine.id,
      deploymentUrl,
      details: {
        subdomain,
        status: 'active_unverified',
        volumeId: volume.id,
        launchPath: 'thin_machine_only',
      },
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      instanceId: instanceRef.id,
      onboardingSessionId: onboardingSessionId || null,
      subdomain,
      machineId: machine.id,
      volumeId: volume.id,
      url: deploymentUrl,
      deploymentTarget,
      deploymentProfile,
      generatedWorkspace,
      healthCheck,
      launchPath: 'thin_machine_only',
    };
  } catch (error) {
    console.error('Provision error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown provisioning error';

    if (onboardingSessionId) {
      await db.collection('onboarding_sessions').doc(onboardingSessionId).set({
        status: 'provisioning_failed',
        provisioningError: errorMessage,
        provisioningLockToken: admin.firestore.FieldValue.delete(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    await logProvisioningEvent({
      type: 'provisioning_failed',
      status: 'error',
      message: errorMessage,
      userId,
      onboardingSessionId: onboardingSessionId || null,
      instanceId: createdInstanceId,
      machineId: createdMachineId,
      deploymentUrl: deploymentUrlForLogs,
      details: {
        plan: effectivePlan,
        agentType: effectiveAgentType,
      },
      createdAt: serverTimestamp(),
    }).catch((loggingError) => {
      console.error('Provisioning event logging failed:', loggingError);
    });

    throw new functions.https.HttpsError('internal', errorMessage);
  }
});

export const verifyInstanceHealth = functions.https.onCall(async (data, context) => {
  if (!FLY_API_TOKEN) throw new functions.https.HttpsError('failed-precondition', 'FLY_API_TOKEN is not configured');

  const onboardingSessionId = typeof data?.onboardingSessionId === 'string' ? data.onboardingSessionId : null;
  const requestedInstanceId = typeof data?.instanceId === 'string' ? data.instanceId : null;
  const providedWizardAccessToken = typeof data?.wizardAccessToken === 'string' ? data.wizardAccessToken : null;
  const force = Boolean(data?.force);
  let userId = context.auth?.uid || null;

  if (!userId && !providedWizardAccessToken) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated or provide a wizard access token');
  }

  let instanceRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | null = null;
  let instanceId: string | null = requestedInstanceId;
  let onboardingRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | null = null;
  let onboardingState: string | null = null;

  if (onboardingSessionId) {
    const onboardingContext = await resolveOnboardingSessionContext({
      onboardingSessionId,
      userId,
      wizardAccessToken: providedWizardAccessToken,
    });

    userId = userId || onboardingContext.userId;
    onboardingRef = onboardingContext.ref;
    onboardingState = typeof onboardingContext.data.status === 'string' ? onboardingContext.data.status : null;
    if (!instanceId && typeof onboardingContext.data.instanceId === 'string') {
      instanceId = onboardingContext.data.instanceId;
    }
  }

  if (!instanceId) {
    throw new functions.https.HttpsError('failed-precondition', 'Instance is not ready for verification yet');
  }

  instanceRef = db.collection('instances').doc(instanceId);
  const instanceSnap = await instanceRef.get();
  if (!instanceSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Instance could not be found');
  }

  const instanceData = (instanceSnap.data() || {}) as Record<string, unknown>;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Unable to resolve verification identity');
  }

  if (typeof instanceData.userId === 'string' && instanceData.userId !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'Instance does not belong to this user');
  }

  if (!onboardingRef && typeof instanceData.onboardingSessionId === 'string') {
    onboardingRef = db.collection('onboarding_sessions').doc(instanceData.onboardingSessionId);
  }

  const machineId = typeof instanceData.machineId === 'string' ? instanceData.machineId : null;
  const deploymentUrl = typeof instanceData.url === 'string' ? instanceData.url : null;
  const currentHealthCheck = instanceData.healthCheck && typeof instanceData.healthCheck === 'object'
    ? instanceData.healthCheck as Record<string, unknown>
    : buildPendingHealthCheck();
  const currentStatus = typeof instanceData.status === 'string' ? instanceData.status : null;

  if (!machineId) {
    throw new functions.https.HttpsError('failed-precondition', 'Instance is missing a machine id');
  }

  if (!force && currentHealthCheck.healthy === true && currentStatus === 'active') {
    return {
      success: true,
      instanceId,
      onboardingSessionId: typeof instanceData.onboardingSessionId === 'string' ? instanceData.onboardingSessionId : onboardingSessionId,
      status: 'healthy',
      healthCheck: currentHealthCheck,
      deploymentUrl,
    };
  }

  const verificationStartedAt = new Date().toISOString();
  const previousAttempts = Array.isArray(currentHealthCheck.attempts) ? [...currentHealthCheck.attempts] : [];

  const healthSummary = await Promise.race([
    getFlyMachineHealth(machineId),
    new Promise<FlyMachineHealthSummary>((_, reject) => {
      setTimeout(() => reject(new Error('Health verification timed out while waiting on Fly machine inspection')), HEALTH_VERIFY_TIMEOUT_MS);
    }),
  ]);

  const attempt = {
    at: verificationStartedAt,
    machineState: healthSummary.machineState,
    checksPassing: healthSummary.checksPassing,
    checkCount: healthSummary.checkCount,
    passingChecks: healthSummary.passingChecks,
    failingChecks: healthSummary.failingChecks,
  };
  const attempts = [...previousAttempts, attempt].slice(-10);

  const priorFailureCount = Number((currentHealthCheck as Record<string, unknown>).failureCount || 0);
  const failureCount = healthSummary.ok ? 0 : priorFailureCount + 1;
  const resolvedHealthy = healthSummary.ok;
  const resolvedFailed = !resolvedHealthy && failureCount >= HEALTH_FAILURE_THRESHOLD;
  const nextInstanceStatus = resolvedHealthy ? 'active' : resolvedFailed ? 'failed' : 'active_unverified';
  const nextOnboardingStatus = resolvedHealthy ? 'healthy' : resolvedFailed ? 'verification_failed' : 'provisioned_unverified';
  const verificationState = resolvedHealthy ? 'healthy' : resolvedFailed ? 'failed' : 'pending';
  const verificationMessage = resolvedHealthy
    ? 'Instance passed deferred Fly/OpenClaw verification.'
    : resolvedFailed
      ? 'Instance failed deferred verification after repeated unhealthy checks.'
      : 'Instance is still booting or awaiting passing Fly checks.';

  const healthCheckUpdate = {
    ...currentHealthCheck,
    healthy: resolvedHealthy,
    pending: !resolvedHealthy && !resolvedFailed,
    mode: 'deferred',
    verifiedAt: resolvedHealthy ? verificationStartedAt : null,
    lastCheckedAt: verificationStartedAt,
    failureCount,
    machineState: healthSummary.machineState,
    checksPassing: healthSummary.checksPassing,
    checkCount: healthSummary.checkCount,
    passingChecks: healthSummary.passingChecks,
    failingChecks: healthSummary.failingChecks,
    verificationState,
    attempts,
  };

  await instanceRef.set({
    status: nextInstanceStatus,
    healthCheck: healthCheckUpdate,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  if (onboardingRef) {
    await onboardingRef.set({
      status: nextOnboardingStatus,
      healthCheck: healthCheckUpdate,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }

  await logProvisioningEvent({
    type: resolvedHealthy ? 'health_verification_succeeded' : resolvedFailed ? 'health_verification_failed' : 'health_verification_pending',
    status: resolvedHealthy ? 'success' : resolvedFailed ? 'error' : 'info',
    message: verificationMessage,
    userId,
    onboardingSessionId: typeof instanceData.onboardingSessionId === 'string' ? instanceData.onboardingSessionId : onboardingSessionId,
    instanceId,
    machineId,
    deploymentUrl,
    details: {
      machineState: healthSummary.machineState,
      checkCount: healthSummary.checkCount,
      passingChecks: healthSummary.passingChecks,
      failingChecks: healthSummary.failingChecks,
      failureCount,
      onboardingState,
    },
    createdAt: serverTimestamp(),
  });

  return {
    success: true,
    instanceId,
    onboardingSessionId: typeof instanceData.onboardingSessionId === 'string' ? instanceData.onboardingSessionId : onboardingSessionId,
    status: nextOnboardingStatus,
    instanceStatus: nextInstanceStatus,
    healthCheck: healthCheckUpdate,
    deploymentUrl,
    verificationMessage,
  };
});

export const deleteInstance = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');

  const { instanceId, machineId, volumeId } = data;
  const userId = context.auth.uid;

  try {
    if (machineId) {
      try {
        await fetch(`${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/machines/${machineId}/stop`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${FLY_API_TOKEN}` },
        });
        await fetch(`${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/machines/${machineId}?force=true`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${FLY_API_TOKEN}` },
        });
      } catch (e) { /* ignore */ }
    }

    if (volumeId) {
      await fetch(`${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/volumes/${volumeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${FLY_API_TOKEN}` },
      });
    }

    if (instanceId) {
      await logProvisioningEvent({
        type: 'instance_deleted',
        status: 'warning',
        message: 'Instance delete flow removed Fly resources and deleted the Firestore instance record.',
        userId,
        instanceId,
        machineId: machineId || null,
        details: {
          volumeId: volumeId || null,
        },
        createdAt: serverTimestamp(),
      }).catch((loggingError) => {
        console.error('Delete event logging failed:', loggingError);
      });

      await db.collection('instances').doc(instanceId).delete();
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown delete error';
    throw new functions.https.HttpsError('internal', errorMessage);
  }
});
