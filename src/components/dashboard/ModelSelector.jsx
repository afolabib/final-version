import { ChevronDown, ChevronRight } from 'lucide-react';

const models = [
  { name: 'Claude Opus', version: '4.6', provider: 'anthropic' },
  { name: 'Claude Sonnet', version: '4.5', provider: 'anthropic' },
  { name: 'Claude Haiku', version: '4.5', provider: 'anthropic' },
  { name: 'GPT-5.2', version: '', provider: 'openai' },
  { name: 'GPT-5.2 Codex', version: '', provider: 'openai' },
  { name: 'GPT-5.1 Codex', version: '', provider: 'openai' },
  { name: 'GPT-5', version: '', provider: 'openai' },
  { name: 'GPT-4o', version: '', provider: 'openai' },
  { name: 'ChatGPT', version: '4o', provider: 'openai' },
  { name: 'ChatGPT', version: 'o1', provider: 'openai' },
  { name: 'ChatGPT', version: 'o1 Pro', provider: 'openai' },
];

function ModelIcon({ provider }) {
  if (provider === 'anthropic') return (
    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
      style={{ background: '#D97706' }}>A</div>
  );
  return (
    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
      style={{ border: '1.5px solid #E8EAFF', background: '#F4F5FC' }}>
      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#6B7280' }} />
    </div>
  );
}

export default function ModelSelector({ model, setModel, show, setShow }) {
  const displayName = model.name + (model.version ? ` ${model.version}` : '');

  return (
    <div className="relative">
      <button
        onClick={() => setShow(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        style={{ color: '#6B7280', background: show ? 'rgba(74,108,247,0.08)' : '#F4F5FC', border: '1px solid #E8EAFF' }}
      >
        {displayName}
        <ChevronDown size={10} />
      </button>

      {show && (
        <div className="absolute bottom-full right-0 mb-2 rounded-2xl overflow-hidden z-50"
          style={{ background: '#fff', border: '1px solid #E8EAFF', boxShadow: '0 20px 60px rgba(74,108,247,0.18), 0 4px 20px rgba(0,0,0,0.06)', minWidth: '220px' }}>
          {/* Header */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #F0F1FF' }}>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#C5C9E0' }}>Model</span>
          </div>

          {/* Models */}
          <div className="py-1.5 max-h-72 overflow-y-auto">
            {models.map(m => {
              const isSelected = m.name === model.name && m.version === model.version;
              return (
                <button
                  key={m.name + m.version}
                  onClick={() => { setModel(m); setShow(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-all"
                  style={{
                    background: isSelected ? 'rgba(74,108,247,0.06)' : 'transparent',
                    color: '#374151',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F8F9FF'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <ModelIcon provider={m.provider} />
                  <span className="flex-1 text-sm font-semibold text-left">
                    {m.name}
                    {m.version && <span className="ml-1 font-normal" style={{ color: '#9CA3AF' }}>{m.version}</span>}
                  </span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,108,247,0.1)' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4A6CF7' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #F0F1FF' }}>
            <span className="text-sm font-semibold" style={{ color: '#4A6CF7' }}>More models</span>
            <ChevronRight size={14} style={{ color: '#4A6CF7' }} />
          </div>
        </div>
      )}
    </div>
  );
}