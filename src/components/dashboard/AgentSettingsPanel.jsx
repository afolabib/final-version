import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Check, ChevronDown, Settings2 } from 'lucide-react';

const models = [
  { id: 'claude-opus', name: 'Claude Opus 4.6', provider: 'anthropic' },
  { id: 'claude-sonnet', name: 'Claude Sonnet 4.5', provider: 'anthropic' },
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'openai' },
  { id: 'gpt-5', name: 'GPT-5', provider: 'openai' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
];

export default function AgentSettingsPanel({ show, onClose }) {
  const [mode, setMode] = useState('automatic');
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [manualExpanded, setManualExpanded] = useState(false);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="absolute bottom-full right-0 mb-2 z-50 rounded-2xl overflow-hidden"
      style={{
        background: '#fff',
        border: '1.5px solid #E8EAFF',
        boxShadow: '0 20px 60px rgba(37,99,235,0.12), 0 4px 20px rgba(0,0,0,0.06)',
        width: 280,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
      }}>

      {/* AI Model row */}
      <button
        onClick={() => setModelOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors"
        style={{ borderBottom: '1px solid #F0F1FF' }}
        onMouseEnter={e => e.currentTarget.style.background = '#FAFBFF'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.06)' }}>
          <Sparkles size={15} style={{ color: '#2563EB' }} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold" style={{ color: '#0F172A' }}>AI Model</p>
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            {mode === 'automatic' ? 'Automatic' : selectedModel.name}
          </p>
        </div>
        <ChevronRight size={14} style={{ color: '#CBD5E1', transform: modelOpen ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }} />
      </button>

      {/* Model selection panel */}
      <AnimatePresence>
        {modelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            style={{ borderBottom: '1px solid #F0F1FF' }}>
            <div className="px-3 py-2">
              {/* Automatic */}
              <button onClick={() => { setMode('automatic'); }}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all mb-1"
                style={{
                  background: mode === 'automatic' ? 'rgba(37,99,235,0.04)' : 'transparent',
                  border: mode === 'automatic' ? '1px solid rgba(37,99,235,0.1)' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (mode !== 'automatic') e.currentTarget.style.background = '#FAFBFF'; }}
                onMouseLeave={e => { if (mode !== 'automatic') e.currentTarget.style.background = 'transparent'; }}>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold" style={{ color: '#0F172A' }}>Automatic</span>
                    <Sparkles size={12} style={{ color: '#2563EB' }} />
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#94A3B8' }}>
                    Matched with the best AI model for each request
                  </p>
                </div>
                {mode === 'automatic' && <Check size={16} style={{ color: '#2563EB', marginTop: 2, flexShrink: 0 }} strokeWidth={2.5} />}
              </button>

              {/* Manual */}
              <button onClick={() => { setMode('manual'); setManualExpanded(v => !v); }}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all"
                style={{
                  background: mode === 'manual' ? 'rgba(37,99,235,0.04)' : 'transparent',
                  border: mode === 'manual' ? '1px solid rgba(37,99,235,0.1)' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (mode !== 'manual') e.currentTarget.style.background = '#FAFBFF'; }}
                onMouseLeave={e => { if (mode !== 'manual') e.currentTarget.style.background = 'transparent'; }}>
                <div className="flex-1 text-left">
                  <span className="text-sm font-bold" style={{ color: '#0F172A' }}>Manual</span>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#94A3B8' }}>
                    Select a specific AI model.<br />Credit usage may vary by model
                  </p>
                </div>
                <ChevronDown size={14} style={{
                  color: '#CBD5E1', marginTop: 4, flexShrink: 0,
                  transform: (mode === 'manual' && manualExpanded) ? 'rotate(180deg)' : 'none',
                  transition: 'transform 150ms',
                }} />
              </button>

              {/* Manual model list */}
              <AnimatePresence>
                {mode === 'manual' && manualExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden">
                    <div className="pl-3 pr-1 py-1 space-y-0.5 max-h-48 overflow-y-auto">
                      {models.map(m => {
                        const isSelected = selectedModel.id === m.id;
                        return (
                          <button key={m.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedModel(m); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left"
                            style={{ background: isSelected ? 'rgba(37,99,235,0.06)' : 'transparent' }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#FAFBFF'; }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'rgba(37,99,235,0.06)' : 'transparent'; }}>
                            <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white"
                              style={{ background: m.provider === 'anthropic' ? '#D97706' : '#6B7280' }}>
                              {m.provider === 'anthropic' ? 'A' : 'G'}
                            </div>
                            <span className="flex-1 text-xs font-semibold" style={{ color: isSelected ? '#2563EB' : '#374151' }}>{m.name}</span>
                            {isSelected && <Check size={13} style={{ color: '#2563EB' }} strokeWidth={2.5} />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Controls row */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors"
        onMouseEnter={e => e.currentTarget.style.background = '#FAFBFF'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(107,114,128,0.06)' }}>
          <Settings2 size={15} style={{ color: '#6B7280' }} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold" style={{ color: '#0F172A' }}>AI Controls</p>
        </div>
        <ChevronRight size={14} style={{ color: '#CBD5E1' }} />
      </button>
    </motion.div>
  );
}