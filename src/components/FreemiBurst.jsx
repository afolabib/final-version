import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MiniFreemi from './MiniFreemi';

const freemis = [
  { color: '#5B5FFF' },
  { color: '#7C6CF7' },
  { color: '#9B8BFF' },
  { color: '#6C63FF' },
  { color: '#5B4BC7' },
];

function CenterFreemi({ phase }) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      animate={phase === 'burst' ? { scale: [1, 1.3, 0.9, 1] } : { scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ width: 80, height: 80, top: -10, left: '50%', marginLeft: -40 }}
        animate={phase === 'burst' ? {
          boxShadow: [
            '0 0 0px rgba(91,95,255,0)',
            '0 0 60px rgba(91,95,255,0.6)',
            '0 0 100px rgba(91,95,255,0.3)',
            '0 0 40px rgba(91,95,255,0.1)',
          ],
          scale: [1, 1.8, 2.2, 1],
          opacity: [0, 1, 0.5, 0],
        } : {}}
        transition={{ duration: 0.8 }}
      />
      <motion.div
        className="w-14 h-16 rounded-full relative z-10"
        style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)' }}
        animate={phase === 'idle' ? { y: [0, -4, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
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
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-5 h-2.5 border-b-[2.5px] border-white rounded-b-full" />
      </motion.div>
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
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    const startSequence = () => {
      setPhase('idle');

      const burstTimer = setTimeout(() => setPhase('burst'), 2000);
      const spreadTimer = setTimeout(() => setPhase('spread'), 2600);
      const resetTimer = setTimeout(() => {
        setPhase('idle');
      }, 2600 + freemis.length * 600 + 2000);

      return () => {
        clearTimeout(burstTimer);
        clearTimeout(spreadTimer);
        clearTimeout(resetTimer);
      };
    };

    const cleanup = startSequence();
    const loop = setInterval(() => {
      if (cleanup) cleanup();
      startSequence();
    }, 2600 + freemis.length * 600 + 4000);

    return () => {
      cleanup();
      clearInterval(loop);
    };
  }, []);

  const getSpreadPosition = (index) => {
    const total = freemis.length;
    // Spread horizontally in a shallow arc — stays within container bounds
    const spreadRadius = 130;
    const startAngle = -50;
    const endAngle = 50;
    const angle = startAngle + (endAngle - startAngle) * (index / (total - 1));
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.sin(rad) * spreadRadius,
      y: -Math.abs(Math.cos(rad)) * 50, // max -50px upward, stays contained
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="flex flex-col items-center justify-end relative overflow-hidden"
      style={{ height: 200, paddingBottom: 16 }}
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
                    background: freemis[i % freemis.length].color,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              );
            })}
            <motion.div
              className="absolute rounded-full border-2"
              style={{ borderColor: 'rgba(91,95,255,0.4)' }}
              initial={{ width: 20, height: 20, opacity: 1 }}
              animate={{ width: 200, height: 200, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute rounded-full border"
              style={{ borderColor: 'rgba(91,95,255,0.2)' }}
              initial={{ width: 20, height: 20, opacity: 1 }}
              animate={{ width: 260, height: 260, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Spread Freemis */}
      <AnimatePresence>
        {(phase === 'spread' || phase === 'burst') && phase !== 'idle' && freemis.map((f, i) => {
          const pos = getSpreadPosition(i);
          return (
            <motion.div
              key={`freemi-${i}`}
              className="absolute z-20"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x: pos.x, y: pos.y, opacity: 1, scale: 1 }}
              exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              transition={{
                x: { duration: 0.5, delay: i * 0.08, type: 'spring', stiffness: 200, damping: 18 },
                y: { duration: 0.5, delay: i * 0.08, type: 'spring', stiffness: 200, damping: 18 },
                opacity: { duration: 0.3, delay: i * 0.08 },
                scale: { duration: 0.3 },
              }}
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
              >
                <MiniFreemi color={f.color} size={28} />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Center Freemi */}
      <div className="relative z-10">
        <CenterFreemi phase={phase} />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.p
            key="idle-label"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-xs font-bold mt-4 tracking-widest uppercase"
            style={{ color: '#5B5FFF' }}
          >
            Your operators. Ready to go.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
