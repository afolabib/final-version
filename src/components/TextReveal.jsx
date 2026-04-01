import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function TextReveal({ children, className = '', delay = 0, as = 'div' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px 0px' });
  const isMobile = useIsMobile();
  const Tag = motion[as] || motion.div;

  if (isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className="overflow-hidden">
      <Tag
        initial={{ y: '110%', opacity: 0 }}
        animate={isInView ? { y: '0%', opacity: 1 } : {}}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {children}
      </Tag>
    </div>
  );
}