import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function MagneticButton({ children, variant = 'primary', onClick, className = '' }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * 0.25, y: y * 0.25 });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  const baseStyles = variant === 'primary'
    ? 'bg-spark text-white font-semibold shadow-lg shadow-spark/25 hover:shadow-spark/40 hover:bg-blue-600'
    : 'border border-gray-300 bg-white text-gray-800 font-semibold hover:border-spark hover:text-spark';

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`px-6 py-3 rounded-full text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-spark focus:ring-offset-2 ${baseStyles} ${className}`}
    >
      {children}
    </motion.button>
  );
}