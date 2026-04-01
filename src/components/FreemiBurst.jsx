import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const roles = [
  { label: 'Sales', color: '#6C5CE7', emoji: '🎯', angle: -60 },
  { label: 'Support', color: '#00B894', emoji: '💬', angle: -30 },
  { label: 'Operations', color: '#E17055', emoji: '⚙️', angle: 0 },
  { label: 'Customer Success', color: '#FDCB6E', emoji: '🤝', angle: 30 },
  { label: 'Executive Assistant', color: '#74B9FF', emoji: '📋', angle: 60 },
];

function MiniAgent({ color, delay }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay, duration: 0.4, type: 'spring', stiffness: 300, damping: 15 }}
      className="relative"
    >
      {/* Body */}
      <div className="w-8 h-10 rounded-full relative" style={{ background: color }}>
        {/* Eyes */}
        <div className="absolute top-2.5 left-1.5 w-1.5 h-2 bg-white rounded-full" />
        <div className="absolute top-2.5 right-1.5 w-1.5 h-2 bg-white rounded-full" />
        {/* Mouth */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-3 h-1.5 border-b-2 border-white rounded-b-full" />
      </div>
      {/* Legs */}
      <div className="flex justify-center gap-1 -mt-0.5">
        <div className="w-2 h-3 rounded-b-full" style={{ background: color, filter: 'brightness(0.85)' }} />
        <div className="w-2 h-3 rounded-b-full" style={{ background: color, filter: 'brightness(0.85)' }} />
      </div>
    </motion.div>
  );
}

function CenterFreemi({ phase }) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      animate={phase === 'burst' ? { scale: [1, 1.3, 0.9, 1] } : { scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ width: 80, height: 80, top: -10, left: '50%', marginLeft: -40 }}
        animate={phase === 'burst' ? {
          boxShadow: [
            '0 0 0px rgba(108,92,231,0)',
            '0 0 60px rgba(108,92,231,0.6)',
            '0 0 100px rgba(108,92,231,0.3)',
            '0 0 40px rgba(108,92,231,0.1)',
          ],
          scale: [1, 1.8, 2.2, 1],
          opacity: [0, 1, 0.5, 0],
        } : {}}
        transition={{ duration: 0.8 }}
      />
      {/* Body */}
      <motion.div
        className="w-14 h-16 rounded-full relative z-10"
        style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)' }}
        animate={phase === 'idle' ? { y: [0, -4, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Eyes */}
        <motion.div
          className="absolute top-4 left-2.5 w-2.5 h-3.5 bg-white rounded-full"
          animate={phase === 'burst' ? { scaleY: [1, 0.1, 1] } : {}}
          transition={{ delay: 0.3, duration: 0.3 }}
        />
        <motion.div
          className="absolute top-4 right-2.5 w-2.5 h-3.5 bg-white rounded-full"
          animate={phase === 'burst' ? { scaleY: [1, 0.1, 1] } : {}}
          transition={{ delay: 0.3, duration: 0.3 }}
        />
        {/* Smile */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-5 h-2.5 border-b-[2.5px] border-white rounded-b-full" />
      </motion.div>
      {/* Legs */}
      <div className="flex gap-1.5 -mt-1 z-10">
        <motion.div
          className="w-3 h-4 rounded-b-full"
          style={{ background: '#5B4BC7' }}
          animate={phase === 'idle' ? { rotateZ: [-3, 3, -3] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="w-3 h-4 rounded-b-full"
          style={{ background: '#5B4BC7' }}
          animate={phase === 'idle' ? { rotateZ: [3, -3, 3] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

export default function FreemiBurst() {
  const [phase, setPhase] = useState('idle'); // idle -> burst -> spread -> idle
  const [activeRole, setActiveRole] = useState(-1);

  useEffect(() => {
    const startSequence = () => {
      setPhase('idle');
      setActiveRole(-1);

      // Start burst after idle
      const burstTimer = setTimeout(() => {
        setPhase('burst');
      }, 2000);

      // Spread agents
      const spreadTimer = setTimeout(() => {
        setPhase('spread');
      }, 2600);

      // Highlight each role sequentially
      const roleTimers = roles.map((_, i) =>
        setTimeout(() => setActiveRole(i), 3000 + i * 600)
      );

      // Reset to idle
      const resetTimer = setTimeout(() => {
        setPhase('idle');
        setActiveRole(-1);
      }, 3000 + roles.length * 600 + 2000);

      return () => {
        clearTimeout(burstTimer);
        clearTimeout(spreadTimer);
        roleTimers.forEach(clearTimeout);
        clearTimeout(resetTimer);
      };
    };

    const cleanup = startSequence();
    const loop = setInterval(() => {
      if (cleanup) cleanup();
      startSequence();
    }, 3000 + roles.length * 600 + 4000);

    return () => {
      cleanup();
      clearInterval(loop);
    };
  }, []);

  // Calculate positions for spread — arc layout
  const getSpreadPosition = (index) => {
    const total = roles.length;
    const spreadRadius = 120;
    const startAngle = -60;
    const endAngle = 60;
    const angle = startAngle + (endAngle - startAngle) * (index / (total - 1));
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.sin(rad) * spreadRadius,
      y: -Math.cos(rad) * spreadRadius + 20,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="flex flex-col items-center justify-center py-6 relative"
    >
      {/* Burst particles */}
      <AnimatePresence>
        {phase === 'burst' && (
          <>
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30) * Math.PI / 180;
              const dist = 60 + Math.random() * 40;
              return (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 4 + Math.random() * 6,
                    height: 4 + Math.random() * 6,
                    background: roles[i % roles.length].color,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: 0,
                    scale: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              );
            })}
            {/* Shockwave ring */}
            <motion.div
              className="absolute rounded-full border-2"
              style={{ borderColor: 'rgba(108,92,231,0.4)' }}
              initial={{ width: 20, height: 20, opacity: 1 }}
              animate={{ width: 200, height: 200, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute rounded-full border"
              style={{ borderColor: 'rgba(108,92,231,0.2)' }}
              initial={{ width: 20, height: 20, opacity: 1 }}
              animate={{ width: 260, height: 260, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Spread agents */}
      <AnimatePresence>
        {(phase === 'spread' || phase === 'burst') && phase !== 'idle' && roles.map((role, i) => {
          const pos = getSpreadPosition(i);
          const isActive = activeRole === i;
          return (
            <motion.div
              key={`agent-${role.label}`}
              className="absolute flex flex-col items-center gap-1 z-20"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: pos.x,
                y: pos.y,
                opacity: 1,
                scale: isActive ? 1.2 : 1,
              }}
              exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              transition={{
                x: { duration: 0.5, delay: i * 0.08, type: 'spring', stiffness: 200, damping: 18 },
                y: { duration: 0.5, delay: i * 0.08, type: 'spring', stiffness: 200, damping: 18 },
                opacity: { duration: 0.3, delay: i * 0.08 },
                scale: { duration: 0.3 },
              }}
            >
              <motion.div
                animate={isActive ? {
                  y: [0, -6, 0],
                  rotate: [0, -5, 5, 0],
                } : { y: [0, -2, 0] }}
                transition={isActive ? { duration: 0.5 } : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <MiniAgent color={role.color} delay={0} />
              </motion.div>
              <motion.span
                className="text-[10px] font-bold whitespace-nowrap px-2 py-0.5 rounded-full mt-0.5"
                style={{
                  background: isActive ? role.color : 'rgba(0,0,0,0.04)',
                  color: isActive ? 'white' : '#64748B',
                  boxShadow: isActive ? `0 4px 16px ${role.color}50` : 'none',
                }}
                animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {role.label}
              </motion.span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Center Freemi */}
      <div className="relative z-10">
        <CenterFreemi phase={phase} />
      </div>

      {/* Phase label */}
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.p
            key="idle-label"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-xs font-bold mt-4 tracking-widest uppercase"
            style={{ color: '#6C5CE7' }}
          >
            One AI. Every Role.
          </motion.p>
        )}
        {phase === 'spread' && activeRole >= 0 && (
          <motion.p
            key={`role-${activeRole}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-xs font-bold mt-4 tracking-widest uppercase"
            style={{ color: roles[activeRole].color }}
          >
            {roles[activeRole].emoji} {roles[activeRole].label}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}