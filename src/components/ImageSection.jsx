import { motion } from 'framer-motion';

export default function ImageSection({ src, alt }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 0.6 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2 }}
      className="w-full h-64 md:h-96 overflow-hidden relative"
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-void/60 pointer-events-none" />
    </motion.div>
  );
}