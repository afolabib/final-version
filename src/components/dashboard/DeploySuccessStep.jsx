import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Globe, LayoutDashboard, Check, Sparkles, Zap, Shield, Server, MessageCircle, Send, MonitorSmartphone, RefreshCw, AlertCircle } from 'lucide-react';
import { verifyInstanceHealth } from '@/lib/onboardingService';

const confettiColors = ['#4A6CF7', '#6366F1', '#818CF8', '#22C55E', '#34D399', '#F59E0B', '#FBBF24', '#EC4899', '#F472B6', '#60A5FA', '#38BDF8'];

const confetti = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: 50 + (Math.random() - 0.5) * 100,
  y: Math.random() * 60 - 10,
  size: Math.random() * 6 + 2,
  color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
  delay: Math.random() * 1.2,
  duration: Math.random() * 2 + 1.5,
  rotation: Math.random() * 720 - 360,
  shape: Math.random() > 0.5 ? 'circle' : 'rect',
}));

function buildChannelInstructions({ channel, deploymentUrl, deploymentStatus, deployConfig }) {
  const isHealthy = deploymentStatus === 'healthy';

  if (channel === 'whatsapp') {
    return {
      icon: MessageCircle,
      accent: '#22C55E',
      title: 'WhatsApp pairing next',
      steps: [
        isHealthy
          ? 'Open the dashboard and scan the WhatsApp QR when the runtime prompts for pairing.'
          : 'Let the runtime finish coming up, then scan the WhatsApp QR from the dashboard once it appears.',
        deploymentUrl
          ? `Use the live runtime at ${deploymentUrl.replace(/^https?:\/\//, '')} as the launch point for pairing and checks.`
          : 'Use the dashboard deployment view as the launch point for pairing and checks.',
      ],
    };
  }

  if (channel === 'telegram') {
    const username = deployConfig?.username ? `@${deployConfig.username.replace(/^@/, '')}` : null;
    return {
      icon: Send,
      accent: '#0EA5E9',
      title: 'Telegram handoff queued',
      steps: [
        username
          ? `Keep ${username} ready for the bot connection step after the runtime is live.`
          : 'Keep your Telegram username ready for the bot connection step after the runtime is live.',
        deployConfig?.token
          ? 'Your bot token was captured in the modal handoff for this deploy flow; finish the bot-side connection from the dashboard/runtime checks.'
          : 'Add the Telegram bot token before the bot-side connection step if you want Telegram live right away.',
      ],
    };
  }

  return {
    icon: MonitorSmartphone,
    accent: '#4A6CF7',
    title: 'Web dashboard is ready',
    steps: [
      deploymentUrl
        ? `Open ${deploymentUrl.replace(/^https?:\/\//, '')} to reach the deployed runtime directly.`
        : 'Open the dashboard to monitor the deployment and launch the runtime when it is ready.',
      isHealthy
        ? 'The first health check passed, so you can start using the agent immediately.'
        : 'The deploy handoff succeeded; give the runtime a moment to finish booting before first use.',
    ],
  };
}

export default function DeploySuccessStep({ agent, channel = 'web', deployConfig = null, deployment = null }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [verificationState, setVerificationState] = useState({ loading: false, error: null });
  const agentName = agent?.name || 'Agent';

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  const runVerification = async (force = false) => {
    if (!instanceId && !onboardingSessionId) return;
    setVerificationState({ loading: true, error: null });
    const result = await verifyInstanceHealth({ onboardingSessionId, instanceId, force });
    if (!result?.success) {
      setVerificationState({ loading: false, error: result?.error || 'Verification failed' });
      return;
    }
    setVerificationState({ loading: false, error: null });
  };

  useEffect(() => {
    if (!instanceId && !onboardingSessionId) return undefined;
    if (deploymentStatus === 'healthy' || deploymentStatus === 'verification_failed' || deploymentStatus === 'failed') return undefined;

    const timeoutId = window.setTimeout(() => {
      runVerification(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [deploymentStatus, instanceId, onboardingSessionId]);

  const channelLabel = { web: 'Web Dashboard', telegram: 'Telegram', whatsapp: 'WhatsApp' }[channel] || 'Web';
  const deploymentUrl = deployment?.deploymentUrl || null;
  const onboardingSessionId = deployment?.onboardingSessionId || null;
  const instanceId = deployment?.instanceId || null;
  const deploymentStatus = deployment?.status || 'provisioned';
  const healthLabel = deploymentStatus === 'healthy' ? 'Healthy' : deploymentStatus === 'verification_failed' || deploymentStatus === 'failed' ? 'Failed' : 'Provisioning';
  const statusIcon = deploymentStatus === 'healthy' ? Shield : deploymentStatus === 'verification_failed' || deploymentStatus === 'failed' ? AlertCircle : Server;
  const primaryCtaLabel = deploymentUrl ? 'Open deployed agent' : 'Go to dashboard';
  const primaryCtaAction = () => {
    if (deploymentUrl) {
      window.open(deploymentUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate('/dashboard');
  };

  const statusBlurb = useMemo(() => {
    if (deploymentStatus === 'healthy') {
      return deploymentUrl
        ? `Your agent runtime passed its first health check and is live at ${deploymentUrl}.`
        : 'Your agent runtime passed its first health check and is ready.';
    }

    if (deploymentStatus === 'verification_failed' || deploymentStatus === 'failed') {
      return 'The post-launch verification path marked this runtime as failed. Review the instance and retry verification after fixing the machine state.';
    }

    if (deploymentUrl) {
      return `The deploy handoff completed and the runtime is now coming up at ${deploymentUrl}.`;
    }

    return 'The deploy handoff completed and the runtime is now provisioning in the backend.';
  }, [deploymentStatus, deploymentUrl]);

  const channelInstructions = useMemo(
    () => buildChannelInstructions({ channel, deploymentUrl, deploymentStatus, deployConfig }),
    [channel, deploymentStatus, deploymentUrl, deployConfig]
  );

  const StatusIcon = statusIcon;
  const ChannelInstructionIcon = channelInstructions.icon;

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative"
      style={{ fontFamily: 'Inter, sans-serif' }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map(p => (
          <motion.div key={p.id}
            initial={{ opacity: 0, y: '60vh', scale: 0, rotate: 0 }}
            animate={show ? {
              opacity: [0, 1, 1, 0.8, 0],
              y: ['60vh', `${p.y}%`, `${p.y - 20}%`, `${p.y + 40}%`],
              x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 60],
              scale: [0, 1.5, 1.2, 0.5],
              rotate: [0, p.rotation, p.rotation * 1.5],
            } : {}}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
            className="absolute"
            style={{
              left: `${p.x}%`,
              width: p.shape === 'circle' ? p.size : p.size * 0.6,
              height: p.shape === 'circle' ? p.size : p.size * 1.8,
              background: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : '1px',
              boxShadow: `0 0 ${p.size}px ${p.color}60`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute pointer-events-none"
        style={{ width: 600, height: 600, top: '35%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(74,108,247,0.08) 0%, rgba(74,108,247,0.02) 40%, transparent 70%)' }}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="mb-8 relative">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 2], opacity: [0.25, 0] }}
              transition={{ duration: 2.5, delay: 0.3 + i * 0.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-3xl"
              style={{ border: '2px solid #4A6CF7' }}
            />
          ))}
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #4A6CF7, #6366F1)', boxShadow: '0 12px 48px rgba(74,108,247,0.3), 0 4px 16px rgba(74,108,247,0.2)' }}>
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.4 }}>
              <Check size={36} strokeWidth={3} color="#fff" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="text-center mb-4">
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight"
            style={{ color: '#0A0A1A', letterSpacing: '-0.03em' }}>
            {deploymentStatus === 'healthy' ? `${agentName} is healthy` : `${agentName} is provisioning`}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF', maxWidth: 420 }}>
            {statusBlurb}
            <br />Connected via{' '}
            <span className="font-bold" style={{ color: '#4A6CF7' }}>{channelLabel}</span>.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="flex items-center gap-2.5 mb-6 flex-wrap justify-center">
          {[
            { icon: Zap, label: deploymentStatus === 'healthy' ? 'Active' : 'Deploying', color: '#22C55E' },
            { icon: StatusIcon, label: healthLabel, color: '#4A6CF7' },
            { icon: Sparkles, label: channelLabel, color: '#F59E0B' },
            ...(instanceId ? [{ icon: Globe, label: `Instance ${instanceId}`, color: '#6366F1' }] : []),
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
              style={{ background: '#FFFFFF', border: '1px solid #E8EAFF' }}>
              <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={10} style={{ color: s.color }} />
              </div>
              <span className="text-[11px] font-semibold" style={{ color: '#6B7280' }}>{s.label}</span>
            </div>
          ))}
        </motion.div>

        {(deploymentUrl || instanceId) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.52 }}
            className="w-full max-w-lg rounded-2xl px-4 py-3 mb-4"
            style={{ background: '#FFFFFF', border: '1px solid #E8EAFF' }}
          >
            <div className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: '#9CA3AF' }}>
              Live deployment details
            </div>
            <div className="space-y-2 text-sm">
              {instanceId && (
                <div className="flex items-center justify-between gap-3">
                  <span style={{ color: '#9CA3AF' }}>Instance</span>
                  <span className="font-semibold" style={{ color: '#374151' }}>{instanceId}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <span style={{ color: '#9CA3AF' }}>Status</span>
                <span className="font-semibold" style={{ color: deploymentStatus === 'healthy' ? '#16A34A' : deploymentStatus === 'verification_failed' || deploymentStatus === 'failed' ? '#DC2626' : '#4A6CF7' }}>
                  {deploymentStatus}
                </span>
              </div>
              {deploymentUrl && (
                <div className="flex items-center justify-between gap-3">
                  <span style={{ color: '#9CA3AF' }}>URL</span>
                  <a
                    href={deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold inline-flex items-center gap-1"
                    style={{ color: '#4A6CF7' }}
                  >
                    {deploymentUrl.replace(/^https?:\/\//, '')}
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {(instanceId || onboardingSessionId) && deploymentStatus !== 'healthy' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.54 }}
            className="w-full max-w-lg rounded-2xl px-4 py-3 mb-4"
            style={{ background: '#FFFFFF', border: '1px solid #E8EAFF' }}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: '#9CA3AF' }}>
                Post-launch verification
              </div>
              <button
                type="button"
                onClick={() => runVerification(true)}
                disabled={verificationState.loading}
                className="inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: verificationState.loading ? '#9CA3AF' : '#4A6CF7' }}
              >
                <RefreshCw size={12} className={verificationState.loading ? 'animate-spin' : ''} />
                {verificationState.loading ? 'Checking…' : 'Verify now'}
              </button>
            </div>
            <div className="text-sm" style={{ color: '#4B5563' }}>
              We now verify Fly/OpenClaw health after launch and promote this runtime from unverified to healthy or failed without extending the initial create-machine path.
            </div>
            {verificationState.error && (
              <div className="mt-2 text-xs font-medium" style={{ color: '#DC2626' }}>
                {verificationState.error}
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.56 }}
          className="w-full max-w-lg rounded-2xl px-4 py-3 mb-8"
          style={{ background: '#FFFFFF', border: '1px solid #E8EAFF' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${channelInstructions.accent}14` }}
            >
              <ChannelInstructionIcon size={14} style={{ color: channelInstructions.accent }} />
            </div>
            <div className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: '#9CA3AF' }}>
              {channelInstructions.title}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {channelInstructions.steps.map((step, index) => (
              <div key={`${channelInstructions.title}-${index}`} className="flex items-start gap-2" style={{ color: '#4B5563' }}>
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full" style={{ background: channelInstructions.accent }} />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex flex-col items-center gap-2.5 w-full max-w-xs">
          <motion.button onClick={primaryCtaAction}
            whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(99,102,241,0.4)' }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #4A6CF7, #6366F1)',
              boxShadow: '0 8px 28px rgba(74,108,247,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}>
            {deploymentUrl ? <Globe size={15} strokeWidth={2} /> : <LayoutDashboard size={15} strokeWidth={2} />}
            {primaryCtaLabel}
            <ArrowRight size={14} strokeWidth={2.5} />
          </motion.button>

          <motion.button onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-semibold transition-all"
            style={{ background: '#FFFFFF', border: '1px solid #E8EAFF', color: '#6B7280' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4A6CF7'; e.currentTarget.style.color = '#374151'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8EAFF'; e.currentTarget.style.color = '#6B7280'; }}>
            <LayoutDashboard size={15} strokeWidth={1.8} />
            Go to dashboard
          </motion.button>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}
        className="pb-6 px-6 text-center relative z-10 flex justify-center">
        <motion.button onClick={primaryCtaAction}
          whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(74,108,247,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #4A6CF7, #6366F1)',
            boxShadow: '0 8px 28px rgba(74,108,247,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}>
          {deploymentUrl ? '🌐 Open deployed agent' : '📋 View deployment'}
        </motion.button>
      </motion.div>
    </div>
  );
}
