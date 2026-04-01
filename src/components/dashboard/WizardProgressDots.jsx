import { motion } from 'framer-motion';

export default function WizardProgressDots({ total, current }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <motion.div
            key={i}
            animate={{
              width: isActive ? 24 : 7,
              opacity: isDone ? 0.5 : 1,
            }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="h-[7px] rounded-full"
            style={{
              background: isActive
                ? 'linear-gradient(90deg, #4A6CF7, #6366F1)'
                : isDone
                  ? '#4A6CF7'
                  : '#D1D5E8',
              boxShadow: isActive ? '0 0 12px rgba(74,108,247,0.3)' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}