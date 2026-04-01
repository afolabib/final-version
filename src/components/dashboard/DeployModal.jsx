import { motion } from 'framer-motion';
import { X, Rocket } from 'lucide-react';

export default function DeployModal({ onClose }) {
  const rows = [
    { label: 'Type', value: 'Custom Agent' },
    { label: 'Name', value: '—' },
    { label: 'Goal', value: '—' },
    { label: 'Audience', value: '—' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(10,10,26,0.4)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-md mx-4 rounded-3xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 32px 80px rgba(74,108,247,0.2), 0 8px 32px rgba(0,0,0,0.1)' }}>
        {/* Close */}
        <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: '#9CA3AF' }}>
          <X size={16} />
        </button>

        <div className="px-8 pt-10 pb-8 flex flex-col items-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(74,108,247,0.1)' }}>
            <Rocket size={28} style={{ color: '#4A6CF7' }} />
          </div>

          <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#0A0A1A' }}>Deploy</h2>
          <p className="text-sm text-center mb-7" style={{ color: '#9CA3AF' }}>
            Your agent is configured and ready. Deploy it to make it live.
          </p>

          {/* Summary card */}
          <div className="w-full rounded-2xl p-5 mb-6" style={{ background: '#F4F5FC', border: '1px solid #E8EAFF' }}>
            {rows.map((r, i) => (
              <div key={r.label} className={`flex items-center justify-between py-2 ${i < rows.length - 1 ? 'border-b' : ''}`}
                style={{ borderColor: '#E8EAFF' }}>
                <span className="text-sm font-semibold" style={{ color: '#374151' }}>{r.label}</span>
                <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Deploy button */}
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#4A6CF7,#7B93FF)', boxShadow: '0 6px 20px rgba(74,108,247,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 28px rgba(74,108,247,0.55)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(74,108,247,0.4)'}>
            <Rocket size={16} />
            Deploy Agent
          </button>
        </div>
      </motion.div>
    </div>
  );
}