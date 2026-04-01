import { motion } from 'framer-motion';

// Tiny Freemi character with running legs
export default function MiniFreemi({ color = '#6C5CE7', running = false, size = 28 }) {
  const eyeSize = size * 0.22;
  const limbW = Math.max(2, size * 0.12);
  const armH = size * 0.32;
  const legH = size * 0.28;
  const radius = size * 0.28;

  return (
    <div className="relative flex flex-col items-center" style={{ width: size + 12, height: size + legH + 4 }}>
      {/* Left arm */}
      <motion.div
        animate={running ? { rotate: [-30, 30, -30] } : { rotate: [0, -10, 0] }}
        transition={running ? { duration: 0.3, repeat: Infinity, ease: 'linear' } : { duration: 2, repeat: Infinity }}
        className="absolute"
        style={{
          width: limbW,
          height: armH,
          background: color,
          left: (size + 12) / 2 - size / 2 - limbW - 1,
          top: size * 0.4,
          transformOrigin: 'top center',
          borderRadius: limbW,
        }}
      />
      {/* Right arm */}
      <motion.div
        animate={running ? { rotate: [30, -30, 30] } : { rotate: [0, 10, 0] }}
        transition={running ? { duration: 0.3, repeat: Infinity, ease: 'linear' } : { duration: 2, repeat: Infinity }}
        className="absolute"
        style={{
          width: limbW,
          height: armH,
          background: color,
          right: (size + 12) / 2 - size / 2 - limbW - 1,
          top: size * 0.4,
          transformOrigin: 'top center',
          borderRadius: limbW,
        }}
      />
      {/* Body */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: `linear-gradient(135deg, ${color}, ${color}DD)`,
          boxShadow: `0 4px 16px ${color}40`,
        }}
      >
        <motion.div
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
          style={{
            width: eyeSize,
            height: eyeSize,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
          }}
        />
      </div>
      {/* Legs */}
      <div className="flex" style={{ gap: size * 0.2, marginTop: -1 }}>
        <motion.div
          animate={running ? { rotate: [-35, 35, -35] } : { rotate: [0, 5, 0, -5, 0] }}
          transition={running ? { duration: 0.25, repeat: Infinity, ease: 'linear' } : { duration: 2, repeat: Infinity }}
          style={{
            width: limbW,
            height: legH,
            background: color,
            borderRadius: limbW,
            transformOrigin: 'top center',
          }}
        />
        <motion.div
          animate={running ? { rotate: [35, -35, 35] } : { rotate: [0, -5, 0, 5, 0] }}
          transition={running ? { duration: 0.25, repeat: Infinity, ease: 'linear', delay: 0.125 } : { duration: 2, repeat: Infinity, delay: 0.15 }}
          style={{
            width: limbW,
            height: legH,
            background: color,
            borderRadius: limbW,
            transformOrigin: 'top center',
          }}
        />
      </div>
    </div>
  );
}