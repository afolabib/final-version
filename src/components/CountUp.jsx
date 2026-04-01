import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

export default function CountUp({ end, duration = 2000, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return <span ref={ref} className={className}>{prefix}{count.toLocaleString()}{suffix}</span>;
}