import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ScrollReveal({ children, className = '', delay = 0, direction = 'up', distance = 60, once = true, duration = 0.8 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-80px 0px' });
  const isMobile = useIsMobile();

  if (isMobile) {
    return <div className={className}>{children}</div>;
  }

  const dirs = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { y: 0, x: distance },
    right: { y: 0, x: -distance },
    none: { y: 0, x: 0 },
  };

  const d = dirs[direction] || dirs.up;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: d.y, x: d.x, scale: direction === 'none' ? 0.95 : 1 }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1 } : {}}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}