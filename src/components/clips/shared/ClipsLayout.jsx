import { motion } from 'framer-motion';

const ORBS = [
  { size: 400, x: '10%', y: '15%', color: 'rgba(91,95,255,0.06)', delay: 0 },
  { size: 300, x: '75%', y: '10%', color: 'rgba(91,95,255,0.04)', delay: 0.3 },
  { size: 250, x: '50%', y: '70%', color: 'rgba(91,95,255,0.03)', delay: 0.6 },
];

export default function ClipsLayout({ children }) {
  return (
      <div
        className="flex-1 overflow-y-auto relative"
      >
        {ORBS.map((orb, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2.5, delay: orb.delay, ease: 'easeOut' }}
            className="fixed rounded-full blur-3xl pointer-events-none"
            style={{
              width: orb.size, height: orb.size,
              left: orb.x, top: orb.y,
              background: orb.color, zIndex: 0,
            }}
          />
        ))}
        <div className="relative z-10">
          {children}
        </div>
      </div>
  );
}
