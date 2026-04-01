import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { createOnboardingSession } from '@/lib/onboardingService';
import { AGENT_TEMPLATES } from '@/lib/agentTemplates';

const FIREBASE_PROJECT_ID = 'freemi-3f7c7';
const FIREBASE_BILLING_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/usage/details`;

function isHostedWizard() {
  if (typeof window === 'undefined') return false;
  const hostname = window.location?.hostname || '';
  return hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.local');
}

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    period: '/month',
    desc: 'For individuals and lighter workflows',
    features: ['1 Operator', 'Limited usage', 'Basic tools', 'Email & task support'],
    color: '#3B82F6',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$299',
    period: '/month',
    desc: 'One production-ready operator',
    features: ['1 Full Operator', 'Email, CRM, docs, browser', 'Follow-ups & execution', 'Memory & context', 'Live oversight'],
    color: '#4A6CF7',
    popular: true,
  },
  {
    id: 'max',
    name: 'Max',
    price: '$599',
    period: '/month',
    desc: 'Multiple operators across functions',
    features: ['Multiple operators', 'Shared workflows', 'Cross-functional automation', 'Custom integrations'],
    color: '#7C3AED',
  },
];

function buildSelectedAgent(agent, questions = []) {
  const matchedTemplate = AGENT_TEMPLATES.find((template) => template.name === agent?.name);
  if (matchedTemplate) return matchedTemplate;

  return {
    id: (agent?.name || 'custom_agent').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    name: agent?.name || 'Custom Agent',
    questions: (questions || []).map((question, index) => ({
      id: `q_${index + 1}`,
      label: question?.q || `Question ${index + 1}`,
      type: question?.freeText ? 'text' : 'multi',
      options: question?.opts || [],
      required: false,
    })),
  };
}

function normalizeAnswers(questions = [], answers = {}) {
  return (questions || []).reduce((acc, question, index) => {
    const answer = answers[index];
    if (answer == null) return acc;

    if (Array.isArray(answer)) {
      if (answer.length) acc[question.id] = answer;
      return acc;
    }

    if (typeof answer === 'string') {
      const trimmed = answer.trim();
      if (trimmed) acc[question.id] = trimmed;
      return acc;
    }

    acc[question.id] = answer;
    return acc;
  }, {});
}

function extractFirstUrl(value) {
  const match = typeof value === 'string' ? value.match(/https?:\/\/[^\s]+/i) : null;
  return match?.[0] || null;
}

export default function PaymentStep({ agent, answers, questions, deployConfig, onBack, onComplete }) {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const blockerUrl = extractFirstUrl(error);
  const showHostedBackendNotice = isHostedWizard();

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const selectedAgent = buildSelectedAgent(agent, questions);
      const normalizedAnswers = normalizeAnswers(selectedAgent.questions, answers);
      const session = await createOnboardingSession({
        selectedAgent,
        answers: normalizedAnswers,
        plan: selectedPlan,
        deploymentConfig: deployConfig,
      });

      onComplete?.(session.id);
    } catch (checkoutError) {
      setError(checkoutError?.message || 'Unable to start setup right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="text-2xl mb-2">💳</div>
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full inline-block mb-2"
            style={{ color: '#4A6CF7', background: 'rgba(74,108,247,0.08)', border: '1px solid rgba(74,108,247,0.12)' }}>
            Choose your plan
          </span>
          <h2 className="text-xl font-extrabold" style={{ color: '#0A0A1A', letterSpacing: '-0.03em' }}>Select a plan to deploy</h2>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Your {agent?.name} is ready. Pick a plan and launch it.</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl px-4 py-3 flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}
          >
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#DC2626' }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: '#991B1B' }}>Setup can’t continue yet</div>
              <div className="text-xs mt-1" style={{ color: '#B91C1C' }}>{error}</div>
              {blockerUrl && (
                <a
                  href={blockerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold mt-2 underline"
                  style={{ color: '#991B1B' }}
                >
                  Open Firebase billing / project settings
                  <ArrowRight size={12} />
                </a>
              )}
            </div>
          </motion.div>
        )}

        {showHostedBackendNotice && !error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl px-4 py-3 flex items-start gap-3"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}
          >
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#B45309' }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: '#92400E' }}>Live setup still depends on the Firebase backend</div>
              <div className="text-xs mt-1" style={{ color: '#B45309' }}>
                This hosted wizard can only finish once project {FIREBASE_PROJECT_ID} has Blaze billing enabled and Firebase Functions deployed.
              </div>
              <a
                href={FIREBASE_BILLING_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold mt-2 underline"
                style={{ color: '#92400E' }}
              >
                Open Firebase billing / project settings
                <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <motion.button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                whileTap={{ scale: 0.98 }}
                className="relative p-4 rounded-2xl text-left transition-all duration-200"
                style={{
                  background: isSelected ? `${plan.color}08` : '#FFFFFF',
                  border: isSelected ? `1.5px solid ${plan.color}60` : '1.5px solid #E8EAFF',
                  boxShadow: isSelected ? `0 4px 20px ${plan.color}12` : '0 1px 4px rgba(0,0,0,0.03)',
                }}>
                {plan.popular && (
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: plan.color, color: '#fff' }}>Popular</span>
                )}
                <div className="font-bold text-sm mb-1" style={{ color: '#0A0A1A' }}>{plan.name}</div>
                <div className="text-xs mb-2" style={{ color: '#9CA3AF' }}>{plan.desc}</div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-lg font-bold" style={{ color: plan.color }}>{plan.price}</span>
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{plan.period}</span>
                </div>
                <div className="space-y-1">
                  {plan.features.map((f) => (
                    <div key={f} className="text-xs flex items-center gap-1.5" style={{ color: '#6B7280' }}>
                      <span style={{ color: plan.color }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-8 py-4 flex-shrink-0" style={{ borderTop: '1px solid #E8EAFF' }}>
        <button onClick={onBack} disabled={loading}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: loading ? '#D1D5DB' : '#9CA3AF', cursor: loading ? 'not-allowed' : 'pointer' }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.color = '#4A6CF7'; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.color = '#9CA3AF'; }}>
          <ArrowLeft size={14} /> Back
        </button>
        <motion.button onClick={handleCheckout} disabled={loading}
          whileTap={!loading ? { scale: 0.97 } : {}}
          className="flex items-center gap-2.5 px-7 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
          style={{
            background: !loading ? 'linear-gradient(135deg, #4A6CF7, #6366F1)' : '#EEF0F8',
            color: !loading ? '#fff' : '#C5C9E0',
            cursor: !loading ? 'pointer' : 'not-allowed',
            boxShadow: !loading ? '0 4px 20px rgba(74,108,247,0.3)' : 'none',
          }}>
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Finishing setup...
            </>
          ) : (
            <>
              ✅ Continue to Setup <ArrowRight size={14} strokeWidth={2.5} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
