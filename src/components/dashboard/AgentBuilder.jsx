import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';

const suggestions = [
  'A Twitter content strategist that writes daily threads',
  'A customer support agent that triages tickets by priority',
  'A morning brief assistant for busy founders',
  'A cold email writer that researches prospects first',
];

export default function AgentBuilder({ onBack, onNext }) {
  const [desc, setDesc] = useState('');

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Breadcrumb */}
      <div className="px-8 py-3 flex items-center gap-2 text-sm" style={{ borderBottom: '1px solid #E8EAFF' }}>
        <button onClick={onBack} className="flex items-center gap-1 font-medium transition-colors hover:text-spark" style={{ color: '#9CA3AF' }}>
          <ArrowLeft size={13} /> Back
        </button>
        <span style={{ color: '#C5C9E0' }}>/</span>
        <span className="font-semibold" style={{ color: '#374151' }}>Custom Agent Builder</span>
      </div>

      <div className="flex flex-col items-center pt-12 pb-8 px-6">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
          style={{ background: 'rgba(74,108,247,0.08)', color: '#4A6CF7' }}>
          <Sparkles size={14} />
          Custom Agent Builder
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 }}
          className="text-4xl font-extrabold tracking-tight mb-2 text-center" style={{ color: '#0A0A1A' }}>
          Describe your agent
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }}
          className="text-sm mb-8" style={{ color: '#9CA3AF' }}>
          Tell us what you want to build and we'll generate a complete agent.
        </motion.p>

        {/* Text area card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.14 }}
          className="w-full max-w-2xl rounded-2xl mb-6"
          style={{ background: '#fff', border: '1px solid #E8EAFF', boxShadow: '0 4px 24px rgba(74,108,247,0.1)' }}>
          <textarea
            rows={4}
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="A customer support agent that triages tickets by priority..."
            className="w-full px-5 pt-5 pb-3 text-sm outline-none bg-transparent resize-none font-medium leading-relaxed"
            style={{ color: '#374151', caretColor: '#4A6CF7' }}
          />
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #F0F1FF' }}>
            <span className="text-xs" style={{ color: '#C5C9E0' }}>Describe your ideal agent</span>
            <button
              onClick={() => desc.trim() && onNext(desc)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#4A6CF7,#7B93FF)', boxShadow: '0 4px 14px rgba(74,108,247,0.35)', opacity: desc.trim() ? 1 : 0.6 }}>
              <Sparkles size={13} />
              Generate
            </button>
          </div>
        </motion.div>

        {/* Suggestion chips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-wrap gap-2 justify-center max-w-2xl">
          {suggestions.map(s => (
            <button key={s} onClick={() => setDesc(s)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={{ background: '#fff', border: '1px solid #E8EAFF', color: '#6B7280', boxShadow: '0 2px 8px rgba(74,108,247,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4A6CF7'; e.currentTarget.style.color = '#4A6CF7'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8EAFF'; e.currentTarget.style.color = '#6B7280'; }}>
              {s}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}