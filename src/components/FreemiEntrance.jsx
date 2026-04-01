import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import FreemiCharacter from './FreemiCharacter';
import MiniFreemi from './MiniFreemi';

const agents = [
  { label: 'Sales', color: '#6C5CE7', targetIndex: 0, path: 'runLeft' },
  { label: 'Support', color: '#7C3AED', targetIndex: 1, path: 'climbLeft' },
  { label: 'Operations', color: '#059669', targetIndex: 2, path: 'jumpCenter' },
  { label: 'Customer Success', color: '#D97706', targetIndex: 3, path: 'crawlRight' },
  { label: 'Executive Assistant', color: '#2563EB', targetIndex: 4, path: 'runRight' },
];

// Each agent gets a unique movement style
function getPathStyle(style, idx) {
  // Paths are relative to center start point, targeting tab positions
  // Tabs are roughly evenly spaced. We use offsets from center.
  const tabOffsets = [-260, -130, 0, 130, 260]; // approximate px from center
  const targetX = tabOffsets[idx];
  const targetY = 85; // distance down to the tabs row

  switch (style) {
    case 'runLeft':
      return {
        x: [0, -30, targetX * 0.5, targetX * 0.8, targetX, targetX],
        y: [0, -50, -20, 30, targetY - 10, targetY],
        rotate: [0, -15, -8, 5, -3, 0],
        times: [0, 0.12, 0.35, 0.6, 0.85, 1],
      };
    case 'climbLeft':
      return {
        x: [0, -15, -60, targetX * 0.6, targetX, targetX],
        y: [0, -70, -40, 10, targetY - 15, targetY],
        rotate: [0, -20, -35, -10, 5, 0],
        times: [0, 0.15, 0.35, 0.55, 0.82, 1],
      };
    case 'jumpCenter':
      return {
        x: [0, 0, 5, 0, 0, 0],
        y: [0, -90, -60, 20, targetY - 5, targetY],
        rotate: [0, 0, 10, -5, 2, 0],
        times: [0, 0.2, 0.4, 0.6, 0.85, 1],
      };
    case 'crawlRight':
      return {
        x: [0, 20, 60, targetX * 0.5, targetX, targetX],
        y: [0, -30, -10, 40, targetY - 8, targetY],
        rotate: [0, 10, 25, 15, -3, 0],
        times: [0, 0.12, 0.3, 0.55, 0.82, 1],
      };
    case 'runRight':
      return {
        x: [0, 40, targetX * 0.4, targetX * 0.7, targetX, targetX],
        y: [0, -60, -30, 25, targetY - 12, targetY],
        rotate: [0, 15, 10, -5, 3, 0],
        times: [0, 0.15, 0.35, 0.6, 0.85, 1],
      };
    default:
      return {
        x: [0, 0, targetX, targetX],
        y: [0, -50, targetY, targetY],
        rotate: [0, 0, 0, 0],
        times: [0, 0.3, 0.8, 1],
      };
  }
}

export default function FreemiEntrance({ onTabClick }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-20px' });
  const [phase, setPhase] = useState('idle');
  // idle → charging → explode → running → arrived

  useEffect(() => {
    if (!isInView) return;
    const timers = [];
    setPhase('charging');
    timers.push(setTimeout(() => setPhase('explode'), 700));
    timers.push(setTimeout(() => setPhase('running'), 1000));
    timers.push(setTimeout(() => setPhase('arrived'), 3800));
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
  <div ref={containerRef} className="relative mx-auto" style={{ height: 120, width: '100%', maxWidth: 600 }}>
      {/* Main Freemi — charges up then pops */}
      <AnimatePresence>
        {(phase === 'idle' || phase === 'charging') && (
          <motion.div
            className="absolute"
            style={{ top: 20 }}
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={
              phase === 'charging'
                ? {
                    opacity: 1,
                    scale: [1, 1.1, 1.05, 1.15, 1.08, 1.2],
                    y: 0,
                    rotate: [0, -2, 2, -3, 3, 0],
                  }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={{ opacity: 0, scale: 1.8, transition: { duration: 0.12 } }}
            transition={phase === 'charging' ? { duration: 0.7 } : { duration: 0.3 }}
          >
            {phase === 'charging' && (
              <motion.div
                className="absolute -inset-4 rounded-3xl"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(108,92,231,0.2)',
                    '0 0 50px rgba(108,92,231,0.5)',
                    '0 0 30px rgba(108,92,231,0.3)',
                    '0 0 70px rgba(108,92,231,0.7)',
                  ],
                }}
                transition={{ duration: 0.7 }}
              />
            )}
            <FreemiCharacter size="sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explosion particles */}
      <AnimatePresence>
        {phase === 'explode' && (
          <>
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              const dist = 50 + Math.random() * 50;
              return (
                <motion.div
                  key={`p-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 3 + Math.random() * 5,
                    height: 3 + Math.random() * 5,
                    background: ['#6C5CE7', '#7C3AED', '#059669', '#D97706', '#2563EB'][i % 5],
                    top: 45,
                    left: '50%',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1.5 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: 0,
                    scale: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              );
            })}
            <motion.div
              className="absolute rounded-full"
              style={{ top: 25, left: '50%', marginLeft: -35 }}
              initial={{
                width: 70,
                height: 70,
                opacity: 0.8,
                background: 'radial-gradient(circle, rgba(108,92,231,0.5), rgba(124,58,237,0.2), transparent)',
              }}
              animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
              transition={{ duration: 0.4 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Mini Freemis running to their tabs */}
      {(phase === 'running' || phase === 'arrived') &&
        agents.map((agent, i) => {
          const path = getPathStyle(agent.path, agent.targetIndex);
          const isRunning = phase === 'running';
          return (
            <motion.div
              key={agent.label}
              className="absolute"
              style={{ top: 25, left: '50%', marginLeft: -18 }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
              animate={{
                x: path.x,
                y: path.y,
                rotate: path.rotate,
                opacity: 1,
                scale: [0.2, 1.1, 1, 1, 1, 1],
              }}
              transition={{
                duration: 2.6,
                times: path.times,
                ease: 'easeInOut',
                delay: i * 0.08,
              }}
            >
              {/* Dust trail while running */}
              {isRunning && (
                <motion.div className="absolute -bottom-1 left-1/2">
                  {[0, 1].map((j) => (
                    <motion.div
                      key={j}
                      className="absolute w-1 h-1 rounded-full"
                      style={{ background: `${agent.color}40` }}
                      animate={{
                        x: [0, agent.targetIndex < 2 ? 6 : -6],
                        y: [0, -4],
                        opacity: [0.5, 0],
                        scale: [1, 0.5],
                      }}
                      transition={{
                        duration: 0.35,
                        repeat: 5,
                        delay: 0.3 + j * 0.15,
                      }}
                    />
                  ))}
                </motion.div>
              )}

              <motion.div
                animate={
                  phase === 'arrived'
                    ? { y: [0, -3, 0], scale: [1, 1.05, 1] }
                    : {}
                }
                transition={
                  phase === 'arrived'
                    ? { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }
                    : {}
                }
              >
                <MiniFreemi color={agent.color} running={isRunning} size={24} />
              </motion.div>

              {/* Landing puff */}
              {phase === 'arrived' && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full"
                  style={{ background: `radial-gradient(ellipse, ${agent.color}25, transparent)` }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: [0, 1.5, 0], opacity: [1, 0.3, 0] }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                />
              )}
            </motion.div>
          );
        })}

    </div>
  );
}