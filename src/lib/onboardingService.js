import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { firebaseAuth, firestore, functions } from '@/lib/firebaseClient';

const STORAGE_KEY = 'freemi-onboarding-session';
const FIREBASE_PROJECT_ID = 'freemi-3f7c7';
const FIREBASE_BILLING_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/usage/details`;
let anonymousAuthPromise = null;

function isLocalDevelopmentHost() {
  if (typeof window === 'undefined') return false;
  const hostname = window.location?.hostname || '';
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
}

function buildBackendUnavailableError(error) {
  const detail = error?.message || 'Server-backed onboarding session unavailable';
  const normalizedDetail = String(detail).toLowerCase();

  let action = 'This hosted wizard needs the Firebase callable backend deployed before setup can continue.';
  let nextStep = `Deploy Firebase Functions for project ${FIREBASE_PROJECT_ID}.`;

  if (normalizedDetail.includes('auth/configuration-not-found')) {
    action = 'This hosted wizard needs either the callable backend live or Firebase Auth/Identity Platform enabled before setup can continue.';
    nextStep = `Enable billing for project ${FIREBASE_PROJECT_ID}, then initialize Auth/Identity Platform or deploy the callable backend.`;
  }

  if (
    normalizedDetail.includes('function not found') ||
    normalizedDetail.includes('internal') ||
    normalizedDetail.includes('unavailable') ||
    normalizedDetail.includes('network error') ||
    normalizedDetail.includes('blaze') ||
    normalizedDetail.includes('billing')
  ) {
    action = 'This hosted wizard needs the Firebase callable backend live; in this project that likely means enabling Blaze billing before Functions can deploy.';
    nextStep = `Open ${FIREBASE_BILLING_URL} and upgrade project ${FIREBASE_PROJECT_ID} to Blaze, then redeploy Firebase Functions.`;
  }

  return new Error(`Live setup backend unavailable: ${detail}. ${action} Next step: ${nextStep}`);
}

async function ensureWizardAuth() {
  if (firebaseAuth.currentUser) {
    return firebaseAuth.currentUser;
  }

  if (!anonymousAuthPromise) {
    anonymousAuthPromise = signInAnonymously(firebaseAuth)
      .then((credential) => credential.user)
      .finally(() => {
        anonymousAuthPromise = null;
      });
  }

  return anonymousAuthPromise;
}

function persistLocalSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

function normalizeDeploymentConfig(deploymentConfig = {}) {
  const channel = typeof deploymentConfig?.channel === 'string' ? deploymentConfig.channel.trim().toLowerCase() : 'web';
  const username = typeof deploymentConfig?.username === 'string' ? deploymentConfig.username.trim() : '';

  return {
    channel: channel || 'web',
    username: username || null,
  };
}

function buildSessionPayload({ selectedAgent, answers, plan, deploymentConfig }) {
  const normalizedDeploymentConfig = normalizeDeploymentConfig(deploymentConfig);
  const deploymentTargetLabels = {
    web: 'Web Dashboard',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
  };

  return {
    agentType: selectedAgent?.id || null,
    agentName: selectedAgent?.name || null,
    questionSchema: selectedAgent?.questions || [],
    answers,
    plan,
    deploymentConfig: normalizedDeploymentConfig,
    deploymentTarget: deploymentTargetLabels[normalizedDeploymentConfig.channel] || 'Web Dashboard',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function createOnboardingSession({ selectedAgent, answers, plan, deploymentConfig }) {
  const payload = buildSessionPayload({ selectedAgent, answers, plan, deploymentConfig });

  try {
    const callable = httpsCallable(functions, 'createOnboardingSession');
    const result = await callable({ selectedAgent, answers, plan, deploymentConfig });
    return persistLocalSession({
      ...payload,
      ...(result.data || {}),
      persistenceMode: 'callable',
    });
  } catch (callableError) {
    console.warn('Callable onboarding save failed, trying Firebase auth + Firestore fallback:', callableError);

    try {
      await ensureWizardAuth();

      const docRef = await addDoc(collection(firestore, 'onboarding_sessions'), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        source: 'wizard_v2',
      });

      return persistLocalSession({
        id: docRef.id,
        ...payload,
        persistenceMode: 'firestore',
      });
    } catch (error) {
      console.warn('Firestore onboarding save failed, falling back to local storage:', error);

      if (!isLocalDevelopmentHost()) {
        throw buildBackendUnavailableError(callableError);
      }

      return persistLocalSession({
        id: `onb_${Date.now()}`,
        ...payload,
        persistenceMode: 'local',
      });
    }
  }
}

export async function getOnboardingSession(sessionId = null) {
  const raw = localStorage.getItem(STORAGE_KEY);
  const fallback = raw ? JSON.parse(raw) : null;

  if (!sessionId) {
    return fallback;
  }

  try {
    const snapshot = await getDoc(doc(firestore, 'onboarding_sessions', sessionId));
    if (!snapshot.exists()) {
      return fallback?.id === sessionId ? fallback : null;
    }

    const data = snapshot.data() || {};
    const session = {
      id: snapshot.id,
      ...data,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    console.warn('Firestore onboarding fetch failed, using local fallback:', error);
    return fallback?.id === sessionId ? fallback : null;
  }
}

export async function clearOnboardingSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function subscribeToOnboardingSession(sessionId, onUpdate, onError) {
  if (!sessionId) return () => {};

  return onSnapshot(
    doc(firestore, 'onboarding_sessions', sessionId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate?.(null);
        return;
      }

      const session = {
        id: snapshot.id,
        ...(snapshot.data() || {}),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      onUpdate?.(session);
    },
    (error) => {
      console.warn('Firestore onboarding subscription failed:', error);
      onError?.(error);
    }
  );
}

export async function createCheckoutSession({ onboardingSessionId, plan, agentType }) {
  try {
    const callable = httpsCallable(functions, 'createCheckout');
    const result = await callable({ onboardingSessionId, plan, agentType });
    return {
      mode: 'firebase',
      onboardingSessionId,
      plan,
      agentType,
      ...(result.data || {}),
    };
  } catch (error) {
    console.warn('Firebase checkout callable failed, using local fallback:', error);
    return {
      mode: 'stub',
      onboardingSessionId,
      plan,
      agentType,
      nextStep: 'provisioning',
      error: error?.message || 'Callable unavailable',
    };
  }
}

export async function provisionInstance({ onboardingSessionId, plan, agentType, answers, model, openrouterKey }) {
  try {
    const localSession = await getOnboardingSession(onboardingSessionId);
    const wizardAccessToken = typeof localSession?.wizardAccessToken === 'string' ? localSession.wizardAccessToken : null;

    if (!wizardAccessToken) {
      await ensureWizardAuth();
    }

    const callable = httpsCallable(functions, 'provisionInstance');
    const result = await callable({
      onboardingSessionId,
      plan,
      agentType,
      answers,
      model,
      openrouterKey,
      wizardAccessToken,
    });

    return {
      mode: 'firebase',
      onboardingSessionId,
      plan,
      agentType,
      answers,
      ...(result.data || {}),
    };
  } catch (error) {
    console.warn('Firebase provision callable failed:', error);
    const hostedError = !isLocalDevelopmentHost() ? buildBackendUnavailableError(error) : null;
    return {
      mode: 'stub',
      success: false,
      onboardingSessionId,
      plan,
      agentType,
      answers,
      error: hostedError?.message || error?.message || 'Provision callable unavailable',
    };
  }
}

export async function verifyInstanceHealth({ onboardingSessionId, instanceId, force = false }) {
  try {
    const localSession = await getOnboardingSession(onboardingSessionId);
    const wizardAccessToken = typeof localSession?.wizardAccessToken === 'string' ? localSession.wizardAccessToken : null;

    if (!wizardAccessToken) {
      await ensureWizardAuth();
    }

    const callable = httpsCallable(functions, 'verifyInstanceHealth');
    const result = await callable({ onboardingSessionId, instanceId, force, wizardAccessToken });
    return {
      mode: 'firebase',
      onboardingSessionId,
      instanceId,
      ...(result.data || {}),
    };
  } catch (error) {
    console.warn('Firebase verify callable failed:', error);
    const hostedError = !isLocalDevelopmentHost() ? buildBackendUnavailableError(error) : null;
    return {
      mode: 'stub',
      success: false,
      onboardingSessionId,
      instanceId,
      error: hostedError?.message || error?.message || 'Health verification callable unavailable',
    };
  }
}
