import { motion } from 'framer-motion';

export default function FreemiLogo({ size = 'md' }) {
  const sizes = {
    sm: { outer: 'w-16 h-16', inner: 'w-10 h-10', eye: 'w-4 h-4', radius: '20px' },
    md: { outer: 'w-24 h-24', inner: 'w-14 h-14', eye: 'w-5 h-5', radius: '28px' },
    lg: { outer: 'w-32 h-32', inner: 'w-20 h-20', eye: 'w-7 h-7', radius: '36px' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulsating glow container */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 24px 8px rgba(108,92,231,0.12), 0 0 48px 16px rgba(108,92,231,0.06)',
            '0 0 36px 14px rgba(108,92,231,0.24), 0 0 64px 24px rgba(108,92,231,0.12)',
            '0 0 24px 8px rgba(108,92,231,0.12), 0 0 48px 16px rgba(108,92,231,0.06)',
          ],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`${s.outer} flex items-center justify-center`}
        style={{
          borderRadius: s.radius,
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,241,255,0.9))',
          border: '1px solid rgba(255,255,255,0.8)',
        }}
      >
        {/* Inner purple icon */}
        <div
          className={`${s.inner} rounded-xl flex items-center justify-center`}
          style={{
            background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)',
            boxShadow: '0 4px 16px rgba(108,92,231,0.35)',
          }}
        >
          {/* Blinking eye */}
          <motion.div
            animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              times: [0, 0.45, 0.5, 0.55, 1],
              ease: 'easeInOut',
            }}
            className={`${s.eye} rounded-full bg-white/90`}
          />
        </div>
      </motion.div>
    </div>
  );
}