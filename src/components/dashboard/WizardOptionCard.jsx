import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function WizardOptionCard({ label, emoji, isSelected, onClick, index }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="relative flex items-center gap-3.5 px-5 py-4 rounded-2xl text-left transition-all duration-200 group overflow-hidden"
      style={{
        background: isSelected ? 'rgba(74,108,247,0.06)' : '#FFFFFF',
        border: isSelected ? '1.5px solid #4A6CF7' : '1.5px solid #E8EAFF',
        boxShadow: isSelected ? '0 4px 20px rgba(74,108,247,0.12)' : '0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(74,108,247,0.03), transparent)' }} />

      {/* Checkbox */}
      <div className="w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-200 relative z-10"
        style={{
          background: isSelected ? 'linear-gradient(135deg, #4A6CF7, #6B63FF)' : '#F4F5FC',
          border: isSelected ? 'none' : '1.5px solid #D1D5E8',
          boxShadow: isSelected ? '0 2px 8px rgba(74,108,247,0.35)' : 'none',
        }}>
        {isSelected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
            <Check size={11} color="#fff" strokeWidth={3} />
          </motion.div>
        )}
      </div>

      {/* Emoji */}
      <span className="text-lg flex-shrink-0 relative z-10">{emoji}</span>

      {/* Label */}
      <span className="text-sm font-semibold relative z-10 transition-colors duration-200"
        style={{ color: isSelected ? '#374151' : '#6B7280' }}>
        {label}
      </span>

      {/* Selected indicator dot */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto w-2 h-2 rounded-full flex-shrink-0 relative z-10"
          style={{ background: '#4A6CF7', boxShadow: '0 0 8px rgba(74,108,247,0.4)' }}
        />
      )}
    </motion.button>
  );
}