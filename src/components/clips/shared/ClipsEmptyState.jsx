import { motion } from 'framer-motion';

export default function ClipsEmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {Icon && (
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(139,92,246,0.12)' }}
        >
          <Icon className="w-8 h-8 text-clips-accent" />
        </motion.div>
      )}
      <h3 className="text-lg font-semibold text-clips-text mb-2">{title}</h3>
      <p className="text-sm text-clips-muted max-w-sm mb-6">{description}</p>
      {action}
    </motion.div>
  );
}
