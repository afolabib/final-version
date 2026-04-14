import { motion } from 'framer-motion';

export default function ClipsGlassCard({ children, className = '', hover = true, glow = false, onClick, style }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      className={`surface-elevated rounded-2xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: 'rgba(255,255,255,0.97)',
        border: '1px solid rgba(91,95,255,0.08)',
        boxShadow: '0 4px 24px rgba(91,95,255,0.06)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
