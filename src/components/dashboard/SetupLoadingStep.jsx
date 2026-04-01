import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Sparkles, Brain, Workflow, Zap, Wrench, Database, ArrowRight, Pencil, Loader2, ExternalLink } from 'lucide-react';
import { getOnboardingSession, provisionInstance, subscribeToOnboardingSession, verifyInstanceHealth } from '@/lib/onboardingService';

const FIREBASE_PROJECT_ID = 'freemi-3f7c7';
const FIREBASE_BILLING_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/usage/details`;

function isHostedWizard() {
  if (typeof window === 'undefined') return false;
  const hostname = window.location?.hostname || '';
  return hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.local');
}

function isLocalFallbackSessionId(value) {
  return typeof value === 'string' && value.startsWith('onb_');
}

const configSteps = [
  { label: 'Agent Identity', icon: Sparkles, color: '#F59E0B' },
  { label: 'Agent Soul', icon: Sparkles, color: '#F59E0B' },
  { label: 'AI Model', icon: Brain, color: '#EC4899' },
  { label: 'Workflows', icon: Workflow, color: '#2563EB' },
  { label: 'Automations', icon: Zap, color: '#8B5CF6' },
  { label: 'Tools', icon: Wrench, color: '#6B7280' },
  { label: 'Memory Layer', icon: Database, color: '#EC4899' },
];

function extractFirstUrl(value) {
  const match = typeof value === 'string' ? value.match(/https?:\/\/[^\s]+/i) : null;
  return match?.[0] || null;
}

export default function SetupLoadingStep({ agent, onboardingDataId, onComplete, onBack }) {
  const [completed, setCompleted] = useState(0);
  const [provisionState, setProvisionState] = useState({ status: 'loading', error: null, result: null });
  const [sessionState, setSessionState] = useState(null);
  const [animationDone, setAnimationDone] = useState(false);
  const total = configSteps.length;
  const backendReadyStatuses = new Set(['provisioned', 'provisioned_unverified', 'healthy']);
  const backendFailedStatuses = new Set(['provisioning_failed', 'verification_failed']);
  const progress = Math.round((completed / total) * 100);
  const agentName = agent?.name || 'Agent';

  const sessionStatus = sessionState?.status || null;
  const hasProvisionedResult = Boolean(provisionState.result?.instanceId || provisionState.result?.url);
  const ready = backendReadyStatuses.has(sessionStatus) || (provisionState.status === 'success' && hasProvisionedResult);
  const failed = provisionState.status === 'error' || backendFailedStatuses.has(sessionStatus);
  const blockerUrl = extractFirstUrl(provisionState.error);
  const deploymentContext = useMemo(() => ({
    onboardingSessionId: onboardingDataId || sessionState?.id || provisionState.result?.onboardingSessionId || null,
    instanceId: sessionState?.instanceId || provisionState.result?.instanceId || null,
    deploymentUrl: sessionState?.deploymentUrl || provisionState.result?.url || null,
    subdomain: sessionState?.subdomain || provisionState.result?.subdomain || null,
    healthCheck: sessionState?.healthCheck || provisionState.result?.healthCheck || null,
    status: sessionStatus || provisionState.status,
    provisioningError: sessionState?.provisioningError || provisionState.error || null,
  }), [onboardingDataId, provisionState.error, provisionState.result, provisionState.status, sessionState, sessionStatus]);

  const statusCopy = useMemo(() => {
    if (failed) {
      return {
        title: 'Setup blocked',
        subtitle: 'We hit a real deployment issue before launch.',
        badge: 'Needs attention',
      };
    }

    if (sessionStatus === 'healthy') {
      return {
        title: 'Agent is healthy',
        subtitle: 'Your runtime is up and passed its first health check.',
        badge: '✓ Healthy',
      };
    }

    if (ready) {
      return {
        title: 'Deployment Started',
        subtitle: 'Your agent runtime is provisioning now.',
        badge: '✓ Live handoff',
      };
    }

    if (sessionStatus === 'provisioning_started') {
      return {
        title: 'Provisioning in progress',
        subtitle: 'Your saved onboarding session is now driving a live backend deploy.',
        badge: 'Provisioning…',
      };
    }

    return {
      title: 'Setting Up Agent',
      subtitle: 'Saving your setup and provisioning the runtime…',
      badge: 'Configuring…',
    };
  }, [failed, ready, sessionStatus]);

  useEffect(() => {
    if (completed >= total) {
      setAnimationDone(true);
      return;
    }

    const t = setTimeout(() => setCompleted((count) => count + 1), 350);
    return () => clearTimeout(t);
  }, [completed, total]);

  useEffect(() => {
    if (!onboardingDataId || isLocalFallbackSessionId(onboardingDataId)) return undefined;

    const unsubscribe = subscribeToOnboardingSession(
      onboardingDataId,
      (session) => {
        setSessionState(session);

        if (!session) return;

        if (session.status === 'provisioning_failed') {
          setProvisionState((current) => ({
            status: 'error',
            error: session.provisioningError || current.error || 'Provisioning failed to start.',
            result: current.result,
          }));
          return;
        }

        if (backendReadyStatuses.has(session.status)) {
          setProvisionState((current) => ({
            status: 'success',
            error: null,
            result: {
              ...(current.result || {}),
              onboardingSessionId: session.id,
              instanceId: session.instanceId || current.result?.instanceId || null,
              url: session.deploymentUrl || current.result?.url || null,
              subdomain: session.subdomain || current.result?.subdomain || null,
              healthCheck: session.healthCheck || current.result?.healthCheck || null,
            },
          }));
        }
      },
      () => {}
    );

    return () => unsubscribe?.();
  }, [onboardingDataId]);

  useEffect(() => {
    let cancelled = false;

    const runProvision = async () => {
      if (!onboardingDataId) {
        if (!cancelled) {
          setProvisionState({
            status: 'error',
            error: 'Missing onboarding session. Please go back and save your answers again.',
            result: null,
          });
        }
        return;
      }

      try {
        const session = await getOnboardingSession(onboardingDataId);
        if (!session) {
          throw new Error('Saved onboarding session could not be found.');
        }

        const hostedWizard = isHostedWizard();
        const localOnlySession = session.persistenceMode === 'local' || isLocalFallbackSessionId(session.id);

        if (hostedWizard && localOnlySession) {
          throw new Error(
            `Live setup backend unavailable: this hosted wizard only has a local fallback onboarding session, so it cannot create a real Firestore/Fly deployment yet. Next step: open ${FIREBASE_BILLING_URL} for project ${FIREBASE_PROJECT_ID}, enable Blaze billing, deploy Firebase Functions, then restart setup.`
          );
        }

        if (!cancelled) {
          setSessionState(session);
          setProvisionState((current) => ({ ...current, status: 'starting', error: null }));
        }

        const result = await provisionInstance({
          onboardingSessionId: session.id,
          plan: session.plan,
          agentType: session.agentType,
          answers: session.answers || {},
        });

        if (!result?.success) {
          throw new Error(result?.error || 'Provisioning failed to start.');
        }

        if (!cancelled) {
          setProvisionState({ status: 'success', error: null, result });
        }
      } catch (error) {
        if (!cancelled) {
          setProvisionState({
            status: 'error',
            error: error?.message || 'Provisioning failed to start.',
            result: null,
          });
        }
      }
    };

    runProvision();

    return () => {
      cancelled = true;
    };
  }, [onboardingDataId]);

  useEffect(() => {
    if (!ready || !animationDone) return undefined;
    const t = setTimeout(() => onComplete?.(deploymentContext), 1800);
    return () => clearTimeout(t);
  }, [animationDone, deploymentContext, onComplete, ready]);

  useEffect(() => {
    const sessionId = onboardingDataId || sessionState?.id || provisionState.result?.onboardingSessionId || null;
    const instanceId = sessionState?.instanceId || provisionState.result?.instanceId || null;
    const status = sessionState?.status || null;

    if (!sessionId || !instanceId) return undefined;
    if (status === 'healthy' || status === 'verification_failed' || status === 'provisioning_failed') return undefined;

    let cancelled = false;
    let timeoutId = null;

    const schedule = (delayMs) => {
      timeoutId = window.setTimeout(async () => {
        const result = await verifyInstanceHealth({ onboardingSessionId: sessionId, instanceId });
        if (cancelled) return;

        if (!result?.success && result?.error) {
          setProvisionState((current) => ({
            ...current,
            status: 'error',
            error: result.error,
          }));
          return;
        }

        const nextStatus = result?.status || sessionState?.status || null;
        if (nextStatus !== 'healthy' && nextStatus !== 'verification_failed') {
          schedule(5000);
        }
      }, delayMs);
    };

    schedule(2500);

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [onboardingDataId, provisionState.result, sessionState]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex flex-col items-center py-4 px-4 flex-1">
          <div className="w-full max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-3">
              <h1 className="text-xl font-extrabold mb-0.5" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>
                {statusCopy.title}
              </h1>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                {statusCopy.subtitle}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all"
                style={{
                  background: failed
                    ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                    : ready
                      ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                      : 'rgba(74,108,247,0.1)',
                  boxShadow: failed
                    ? '0 4px 16px rgba(239,68,68,0.25)'
                    : ready
                      ? '0 4px 16px rgba(34,197,94,0.3)'
                      : '0 0 12px rgba(74,108,247,0.12)',
                }}
              >
                {failed ? (
                  <AlertCircle size={22} color="#fff" strokeWidth={2.75} />
                ) : ready ? (
                  <Check size={22} color="#fff" strokeWidth={3} />
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 rounded-full border-[2.5px]"
                    style={{ borderColor: '#E8EAFF', borderTopColor: '#4A6CF7' }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                style={{
                  background: failed ? 'rgba(239,68,68,0.08)' : ready ? 'rgba(34,197,94,0.1)' : 'rgba(74,108,247,0.08)',
                  color: failed ? '#DC2626' : ready ? '#22C55E' : '#4A6CF7',
                  border: `1px solid ${failed ? 'rgba(239,68,68,0.15)' : ready ? 'rgba(34,197,94,0.2)' : 'rgba(74,108,247,0.12)'}`,
                }}
              >
                {statusCopy.badge}
              </span>
              <h2 className="text-base font-bold mt-2" style={{ color: '#0A0A1A' }}>{agentName}</h2>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                {failed
                  ? 'Go back to adjust the setup or retry on the next run.'
                  : ready
                    ? `${sessionStatus === 'healthy' ? 'Healthy runtime confirmed' : 'Provisioning accepted'}${provisionState.result?.instanceId ? ` • Instance ${provisionState.result.instanceId}` : ''}`
                    : sessionStatus === 'provisioning_started'
                      ? 'Backend deploy is running from your saved onboarding session...'
                      : 'Building your agent configuration and handoff package...'}
              </p>
            </motion.div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#9CA3AF' }}>Progress</span>
                <span className="text-xs font-bold" style={{ color: failed ? '#DC2626' : ready ? '#22C55E' : '#4A6CF7' }}>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#EEF0F8' }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{
                    background: failed
                      ? 'linear-gradient(90deg, #F87171, #EF4444)'
                      : ready
                        ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                        : 'linear-gradient(90deg, #4A6CF7, #6366F1)',
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {configSteps.map((step, i) => {
                const done = i < completed;
                const active = i === completed && !animationDone;
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 + 0.15 }}
                    className="relative rounded-2xl px-3 py-3 transition-all"
                    style={{
                      background: '#FFFFFF',
                      border: done ? '1.5px solid rgba(34,197,94,0.25)' : active ? '1.5px solid #4A6CF7' : '1.5px solid #E8EAFF',
                      boxShadow: active ? '0 0 0 3px rgba(74,108,247,0.08)' : done ? '0 0 0 3px rgba(34,197,94,0.06)' : '0 1px 4px rgba(0,0,0,0.03)',
                    }}
                  >
                    {done && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: '#22C55E', boxShadow: '0 2px 6px rgba(34,197,94,0.3)' }}
                      >
                        <Check size={10} color="#fff" strokeWidth={3} />
                      </motion.div>
                    )}
                    {active && (
                      <div
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: '#FFFFFF', border: '1.5px solid #4A6CF7' }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-3 h-3 rounded-full border-[1.5px]"
                          style={{ borderColor: '#E8EAFF', borderTopColor: '#4A6CF7' }}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${step.color}10` }}>
                        <Icon size={14} style={{ color: step.color }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: done ? '#374151' : active ? '#0A0A1A' : '#9CA3AF' }}>
                        {step.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="rounded-2xl px-4 py-3" style={{ background: '#F8FAFF', border: '1px solid #E8EAFF' }}>
              {failed ? (
                <div className="flex items-start gap-3 text-sm" style={{ color: '#B91C1C' }}>
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">Provisioning did not start</div>
                    <div className="text-xs" style={{ color: '#991B1B' }}>{provisionState.error}</div>
                    {blockerUrl && (
                      <a
                        href={blockerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold mt-2 underline"
                        style={{ color: '#991B1B' }}
                      >
                        Open Firebase billing / project settings
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ) : ready ? (
                <div className="flex items-start gap-3 text-sm" style={{ color: '#166534' }}>
                  <Check size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">
                      {sessionStatus === 'healthy' ? 'Runtime healthy' : 'Live provisioning handoff complete'}
                    </div>
                    <div className="text-xs" style={{ color: '#15803D' }}>
                      {sessionStatus === 'healthy'
                        ? `Instance ${provisionState.result?.instanceId || sessionState?.instanceId || 'created'} passed its first health check${provisionState.result?.url || sessionState?.deploymentUrl ? ` • ${(provisionState.result?.url || sessionState?.deploymentUrl)}` : ''}.`
                        : provisionState.result?.instanceId
                          ? `Instance ${provisionState.result.instanceId} is now provisioning in the backend${provisionState.result?.url ? ` • ${provisionState.result.url}` : ''}.`
                          : 'Your deployment request has been accepted and is now provisioning in the backend.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-sm" style={{ color: '#4A6CF7' }}>
                  <Loader2 size={16} className="mt-0.5 flex-shrink-0 animate-spin" />
                  <div>
                    <div className="font-semibold mb-1">Saving and provisioning from the modal flow</div>
                    <div className="text-xs" style={{ color: '#64748B' }}>
                      We’re rehydrating your saved onboarding session and starting the real deployment underneath this classic wizard UI.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(failed || ready) && (
        <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 bg-white">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="text-center">
            <div className="flex items-center justify-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: '#FFFFFF', border: '1.5px solid #E8EAFF', color: '#6B7280' }}
                >
                  <Pencil size={14} />
                  Edit Answers
                </button>
              )}
              {ready && (
                <motion.button
                  onClick={() => onComplete?.(deploymentContext)}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(74,108,247,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #4A6CF7, #6366F1)', boxShadow: '0 4px 16px rgba(74,108,247,0.25)' }}
                >
                  Continue
                  <ArrowRight size={14} strokeWidth={2.5} />
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
