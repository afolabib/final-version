import { useState } from 'react';
import { Check, Zap, Info } from 'lucide-react';

const models = [
  { id: 'claude-opus-4.6', name: 'Claude Opus 4.6', provider: 'anthropic', badge: 'Most Capable', tier: 'premium' },
  { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'anthropic', badge: 'Recommended', tier: 'standard' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'anthropic', badge: 'Fast', tier: 'fast' },
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'openai', badge: null, tier: 'premium' },
  { id: 'gpt-5.2-codex', name: 'GPT-5.2 Codex', provider: 'openai', badge: 'Coding', tier: 'standard' },
];

const providerColors = { anthropic: '#D97706', openai: '#5B5FFF' };
const tierColors = { premium: '#5B5FFF', standard: '#6B63FF', fast: '#14B8A6' };

export default function AIModelTab() {
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4.5');
  const selected = models.find(m => m.id === selectedModel);

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)' }}>AI Model</h2>
      <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>Select a specific AI model. Credit usage may vary by model</p>

      <div className="space-y-2 mb-6">
        {models.map(m => {
          const isActive = selectedModel === m.id;
          const pColor = providerColors[m.provider];
          return (
            <button key={m.id} onClick={() => setSelectedModel(m.id)}
             className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-200 btn-press"
             style={{
               background: isActive ? 'rgba(91,95,255,0.08)' : 'rgba(255,255,255,0.6)',
               backdropFilter: 'blur(8px)',
               border: isActive ? '1.5px solid rgba(91,95,255,0.4)' : '1.5px solid rgba(91,95,255,0.12)',
               boxShadow: isActive ? '0 8px 24px rgba(91,95,255,0.15), inset 0 1px 0 rgba(255,255,255,0.4)' : '0 2px 8px rgba(0,0,0,0.02)',
             }}>
              {/* Radio */}
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  border: isActive ? '2px solid #5B5FFF' : '2px solid rgba(91,95,255,0.2)',
                  background: isActive ? 'linear-gradient(135deg, #5B5FFF, #6B63FF)' : 'transparent',
                }}>
                {isActive && <Check size={11} strokeWidth={3} style={{ color: '#fff' }} />}
              </div>
              {/* Provider badge */}
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: pColor, boxShadow: `0 2px 8px ${pColor}30` }}>
                {m.provider === 'anthropic' ? 'A' : 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: isActive ? '#0A0A1A' : '#6B7280' }}>{m.name}</span>
                  {m.badge && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${tierColors[m.tier]}15`, color: tierColors[m.tier] }}>
                      {m.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px]" style={{ color: '#9CA3AF' }}>{m.provider}/{m.id}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected model info card */}
      {selected && (
        <div className="rounded-2xl px-5 py-4"
          style={{ background: 'rgba(91,95,255,0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(91,95,255,0.15)', boxShadow: '0 4px 16px rgba(91,95,255,0.1), inset 0 1px 0 rgba(255,255,255,0.4)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={13} style={{ color: '#5B5FFF' }} />
            <span className="text-xs font-bold" style={{ color: '#374151' }}>Active Model</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold" style={{ color: '#0A0A1A' }}>{selected.name}</span>
            <span className="text-[10px] font-mono px-2 py-1 rounded-lg" style={{ background: '#FFFFFF', color: '#9CA3AF', border: '1px solid #E8EAFF' }}>
              {selected.provider}/{selected.id}
            </span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: '#9CA3AF' }}>Model selection saves immediately and syncs to the VM when possible.</p>
        </div>
      )}
    </div>
  );
}