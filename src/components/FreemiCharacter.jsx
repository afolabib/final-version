import { motion } from 'framer-motion';

export default function FreemiCharacter({ size = 'lg', color = '#5B5FFF' }) {
  const isLg = size === 'lg';
  const body = size === 'lg' ? 120 : size === 'sm' ? 64 : 28; // xs = 28
  const eyeSize = size === 'lg' ? 28 : size === 'sm' ? 16 : 7;
  const radius = size === 'lg' ? 32 : size === 'sm' ? 16 : 7;
  const armW = size === 'lg' ? 10 : size === 'sm' ? 5 : 2;
  const armH = size === 'lg' ? 28 : size === 'sm' ? 14 : 6;
  const legW = size === 'lg' ? 10 : size === 'sm' ? 5 : 2;
  const legH = size === 'lg' ? 22 : size === 'sm' ? 11 : 5;
  const totalW = body + (size === 'xs' ? 8 : 40);

  return (
    <div className="relative flex flex-col items-center" style={{ width: totalW, height: body + legH + 12 }}>
      {/* Left arm */}
      <motion.div
        animate={{ rotate: [0, -15, 0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
        className="absolute"
        style={{
          width: armW,
          height: armH,
          background: color,
          left: totalW / 2 - body / 2 - armW - 2,
          top: body * 0.45,
          transformOrigin: 'top center',
          borderRadius: armW,
        }}
      />

      {/* Right arm */}
      <motion.div
        animate={{ rotate: [0, 15, 0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2, delay: 0.3 }}
        className="absolute"
        style={{
          width: armW,
          height: armH,
          background: color,
          right: totalW / 2 - body / 2 - armW - 2,
          top: body * 0.45,
          transformOrigin: 'top center',
          borderRadius: armW,
        }}
      />

      {/* Purple body */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center"
        style={{
          width: body,
          height: body,
          borderRadius: radius,
          background: `linear-gradient(135deg, ${color}, ${color}CC)`,
          boxShadow: `0 8px 32px ${color}4D, inset 0 2px 0 rgba(255,255,255,0.15)`,
        }}
      >
        {/* Blinking eye — same proportions as logo */}
        <motion.div
          animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.45, 0.5, 0.55, 1],
            ease: 'easeInOut',
          }}
          style={{
            width: eyeSize,
            height: eyeSize,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
          }}
        />
      </motion.div>

      {/* Legs */}
      <div className="flex items-start" style={{ gap: isLg ? 20 : 10, marginTop: -2 }}>
        <motion.div
          animate={{ rotate: [0, 8, 0, -8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
          style={{
            width: legW,
            height: legH,
            background: color,
            borderRadius: legW,
            transformOrigin: 'top center',
          }}
        />
        <motion.div
          animate={{ rotate: [0, -8, 0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3, delay: 0.2 }}
          style={{
            width: legW,
            height: legH,
            background: color,
            borderRadius: legW,
            transformOrigin: 'top center',
          }}
        />
      </div>
    </div>
  );
}