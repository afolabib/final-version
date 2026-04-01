import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import MiniFreemi from './MiniFreemi';

const workActions = {
  sales: ['Qualifying lead...', 'Sending follow-up...', 'Booking meeting...', 'Updating CRM...'],
  support: ['Reading ticket...', 'Looking up docs...', 'Sending fix...', 'Closing ticket...'],
  ops: ['Processing invoice...', 'Updating records...', 'Generating report...', 'Flagging items...'],
  cs: ['Checking health score...', 'Drafting outreach...', 'Flagging risk...', 'Logging notes...'],
  exec: ['Prepping brief...', 'Updating calendar...', 'Drafting email...', 'Scheduling call...'],
};

const roleColors = {
  sales: '#6C5CE7',
  support: '#7C3AED',
  ops: '#059669',
  cs: '#D97706',
  exec: '#2563EB',
};

// Bottom-only waypoints (percentage from left)
const bottomStops = [5, 25, 50, 70, 90, 60, 30, 10];

// Mini worker positions — top-right area so they don't block text
const workerSpots = [
  [
    { x: '72%', y: '12%' },
    { x: '82%', y: '18%' },
    { x: '68%', y: '22%' },
  ],
  [
    { x: '85%', y: '10%' },
    { x: '75%', y: '16%' },
    { x: '90%', y: '24%' },
  ],
];

export default function WorkingFreemi({ roleKey }) {
  const color = roleColors[roleKey] || '#6C5CE7';
  const actions = workActions[roleKey] || ['Working...'];
  const [step, setStep] = useState(0);
  const [actionIdx, setActionIdx] = useState(0);
  const [spawned, setSpawned] = useState(false);

  useEffect(() => {
    setStep(0);
    setActionIdx(0);
    setSpawned(false);
    const spawnTimer = setTimeout(() => setSpawned(true), 1800);
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % bottomStops.length);
      setActionIdx(prev => (prev + 1) % actions.length);
    }, 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(spawnTimer);
    };
  }, [roleKey, actions.length]);

  const xPos = bottomStops[step];
  const prevX = bottomStops[(step - 1 + bottomStops.length) % bottomStops.length];
  const facingRight = xPos > prevX;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* === Main Freemi running along the bottom === */}
      <motion.div
        className="absolute bottom-3"
        initial={{ left: '50%', bottom: '-50px', opacity: 0 }}
        animate={{
          left: `${xPos}%`,
          bottom: '12px',
          opacity: 1,
        }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Speech bubble */}
        <motion.div
          className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-lg whitespace-nowrap"
          style={{ background: `${color}10`, border: `1px solid ${color}20` }}
          key={actionIdx}
          initial={{ opacity: 0, y: 4, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], y: [4, 0, 0, -2], scale: [0.8, 1, 1, 0.9] }}
          transition={{ duration: 2.0, times: [0, 0.1, 0.75, 1] }}
        >
          <span className="text-[10px] font-bold" style={{ color }}>{actions[actionIdx]}</span>
        </motion.div>

        {/* Character */}
        <motion.div
          animate={{ scaleX: facingRight ? 1 : -1, y: [0, -5, 0] }}
          transition={{ scaleX: { duration: 0.2 }, y: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <MiniFreemi color={color} running={true} size={38} />
        </motion.div>

        {/* Dust */}
        {[0, 1].map(i => (
          <motion.div
            key={i}
            className="absolute -bottom-0.5 w-1 h-1 rounded-full"
            style={{ background: `${color}30`, left: facingRight ? -2 - i * 4 : 'auto', right: facingRight ? 'auto' : -2 - i * 4 }}
            animate={{ y: [0, 2], opacity: [0.5, 0], scale: [1, 0.3] }}
            transition={{ duration: 0.35, delay: i * 0.1, repeat: Infinity }}
          />
        ))}
      </motion.div>

      {/* === 2 Spawned mini-workers === */}
      {spawned && [0, 1].map(workerIdx => {
        const spots = workerSpots[workerIdx];
        return <MiniWorker key={`${roleKey}-${workerIdx}`} color={color} spots={spots} delay={workerIdx * 0.4} />;
      })}
    </div>
  );
}

function MiniWorker({ color, spots, delay }) {
  const [pos, setPos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPos(prev => (prev + 1) % spots.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [spots.length]);

  const spot = spots[pos];

  return (
    <motion.div
      className="absolute"
      initial={{ opacity: 0, scale: 0, x: '50%', y: '80%' }}
      animate={{ opacity: 1, scale: 1, left: spot.x, top: spot.y }}
      transition={{
        opacity: { duration: 0.3, delay },
        scale: { type: 'spring', stiffness: 300, damping: 15, delay },
        left: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
        top: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {/* Tiny working indicator */}
      <motion.div
        className="absolute -top-3 left-1/2 -translate-x-1/2"
        animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: delay + 0.5 }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}60` }} />
      </motion.div>

      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        <MiniFreemi color={color} running={false} size={18} />
      </motion.div>
    </motion.div>
  );
}