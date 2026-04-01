import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: 'hero', label: 'Home', desc: 'AI operators that run your business.' },
  { id: 'always-working', label: 'Operators', desc: 'Your operators never sleep.' },
  { id: 'use-cases', label: 'Use Cases', desc: 'Deploy an operator for each function.' },
  { id: 'testimonials', label: 'Proof', desc: 'Trusted by teams running lean.' },
  { id: 'pricing', label: 'Pricing', desc: 'The cost of one operator vs one hire.' },
  { id: 'faq', label: 'FAQ', desc: 'Everything you need to get started.' },
];

export default function FloatingDock() {
  const [hovered, setHovered] = useState(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-3 py-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-[20px] shadow-lg flex items-center gap-1"
    >
      {navItems.map((item) => (
        <div key={item.id} className="relative">
          <AnimatePresence>
            {hovered === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-2 rounded-lg bg-surface/90 border border-gray-200 text-xs text-gray-500 shadow-md"
              >
                {item.desc}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => scrollTo(item.id)}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-spark hover:bg-spark/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-spark focus:ring-offset-2"
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  );
}