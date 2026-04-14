import { motion } from 'framer-motion';
import { Download, Brain, Sparkles, Film, Captions, TrendingUp, Check } from 'lucide-react';

const STEP_ICONS = { Download, Brain, Sparkles, Film, Captions, TrendingUp };

const STEPS = [
  { id: 'download', label: 'Downloading video', icon: 'Download' },
  { id: 'analyze',  label: 'Analyzing content', icon: 'Brain' },
  { id: 'detect',   label: 'Detecting key moments', icon: 'Sparkles' },
  { id: 'generate', label: 'Generating clips', icon: 'Film' },
  { id: 'caption',  label: 'Adding AI captions', icon: 'Captions' },
  { id: 'score',    label: 'Scoring virality', icon: 'TrendingUp' },
];

export default function ProcessingAnimation({ processing }) {
  const currentStep = processing?.step ?? 0;

  return (
    <div className="py-4">
      {/* Central orb */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 rounded-full"
            style={{
              border: '2px solid transparent',
              borderTopColor: '#5B5FFF',
              borderRightColor: '#7C3AED',
            }}
          />
          {/* Inner ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full"
            style={{
              border: '2px solid transparent',
              borderTopColor: '#06B6D4',
              borderLeftColor: '#5B5FFF',
            }}
          />
          {/* Core */}
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-5 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)',
              boxShadow: '0 0 30px rgba(91,95,255,0.4)',
            }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const Icon = STEP_ICONS[step.icon] || Sparkles;
          const isActive = i === currentStep;
          const isDone = i < currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all"
              style={{
                background: isActive ? 'rgba(91,95,255,0.06)' : 'transparent',
                border: isActive ? '1px solid rgba(91,95,255,0.10)' : '1px solid transparent',
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: isDone ? 'rgba(16,185,129,0.10)' : isActive ? 'rgba(91,95,255,0.08)' : 'rgba(100,116,139,0.06)',
                }}
              >
                {isDone ? (
                  <Check size={14} style={{ color: '#10B981' }} />
                ) : (
                  <Icon size={14} style={{ color: isActive ? '#5B5FFF' : '#94A3B8' }} />
                )}
              </div>
              <span className={`text-sm font-medium`} style={{ color: isDone ? '#10B981' : isActive ? '#0A0F1E' : '#94A3B8' }}>
                {step.label}
              </span>
              {isActive && (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: '#5B5FFF' }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-6 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(91,95,255,0.08)' }}>
        <motion.div
          animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #5B5FFF, #7C3AED, #06B6D4)' }}
        />
      </div>
    </div>
  );
}
