import { motion } from 'framer-motion';

function getScoreColor(score) {
  if (score >= 90) return { bg: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #06B6D4)', text: '#fff', ring: '#8B5CF6' };
  if (score >= 70) return { bg: 'linear-gradient(135deg, #10B981, #34D399)', text: '#fff', ring: '#10B981' };
  if (score >= 40) return { bg: 'linear-gradient(135deg, #F59E0B, #FBBF24)', text: '#000', ring: '#F59E0B' };
  return { bg: 'linear-gradient(135deg, #EF4444, #F87171)', text: '#fff', ring: '#EF4444' };
}

export default function ViralityBadge({ score, size = 'md' }) {
  const colors = getScoreColor(score);
  const dimensions = size === 'sm' ? 'w-8 h-8 text-[10px]' : size === 'lg' ? 'w-14 h-14 text-base' : 'w-10 h-10 text-xs';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`${dimensions} rounded-full flex items-center justify-center font-black relative`}
      style={{
        background: colors.bg,
        color: colors.text,
        boxShadow: `0 2px 12px ${colors.ring}40`,
      }}
    >
      {score >= 90 && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-2px] rounded-full"
          style={{
            border: '2px solid transparent',
            borderTopColor: '#8B5CF6',
            borderRightColor: '#06B6D4',
          }}
        />
      )}
      {score}
    </motion.div>
  );
}
