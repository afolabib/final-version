import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Send, Bell, Zap, X } from 'lucide-react';
import SetupLoadingStep from '../../components/dashboard/SetupLoadingStep';

const presets = [
  { label: 'General Assistant', color: '#EF4444' },
  { label: 'Social Media Manager', color: '#0A66C2' },
  { label: 'Executive Assistant', color: '#4285F4' },
  { label: 'Customer Support Agent', color: '#7B5EA7' },
  { label: 'Research Agent', color: '#EA4335' },
  { label: 'Sales Assistant', color: '#FF6B35' },
];

const integrationIcons = [
  { bg: '#EA4335', label: 'G' },
  { bg: '#0A66C2', label: 'in' },
  { bg: '#4285F4', label: '+' },
  { bg: '#7B5EA7', label: 'S' },
  { bg: '#25D366', label: 'W' },
  { bg: '#1877F2', label: 'f' },
];

export default function CustomAgent() {
  const navigate = useNavigate();
  const location = useLocation();
  const agent = location.state?.agent || { name: 'Custom Agent' };
  const [showDeploy, setShowDeploy] = useState(true);
  const [input, setInput] = useState('');

  if (showDeploy) {
    return (
      <SetupLoadingStep
        agent={agent}
        onComplete={() => navigate('/')}
        onBack={() => navigate('/dashboard/wizard', { state: { agent } })}
      />
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: '#1A1A2E', fontFamily: 'Inter, sans-serif' }}>

      {/* Close */}
      <button onClick={() => navigate('/dashboard/picker')}
        className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
        style={{ color: '#6B7280', background: 'rgba(255,255,255,0.06)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
        <X size={14} />
      </button>

      {/* Heading */}
      <h1 className="text-5xl font-serif font-normal mb-8 text-center" style={{ color: '#F3F4F6', letterSpacing: '-0.02em' }}>
        What can I build for you?
      </h1>

      {/* Input card */}
      <div className="w-full max-w-xl rounded-2xl overflow-hidden mb-4"
        style={{ background: '#252538', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-5 pt-4 pb-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe your agent in plain English..."
            className="w-full text-sm outline-none bg-transparent"
            style={{ color: '#9CA3AF', caretColor: '#4A6CF7' }}
            onFocus={e => e.currentTarget.style.color = '#F3F4F6'}
            onBlur={e => e.currentTarget.style.color = '#9CA3AF'}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <button className="transition-colors" style={{ color: '#4B5563' }}
              onMouseEnter={e => e.currentTarget.style.color = '#9CA3AF'}
              onMouseLeave={e => e.currentTarget.style.color = '#4B5563'}>
              <Zap size={14} strokeWidth={1.8} />
            </button>
            <button className="transition-colors" style={{ color: '#4B5563' }}
              onMouseEnter={e => e.currentTarget.style.color = '#9CA3AF'}
              onMouseLeave={e => e.currentTarget.style.color = '#4B5563'}>
              <Bell size={14} strokeWidth={1.8} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="transition-colors" style={{ color: '#4B5563' }}
              onMouseEnter={e => e.currentTarget.style.color = '#9CA3AF'}
              onMouseLeave={e => e.currentTarget.style.color = '#4B5563'}>
              <Mic size={14} strokeWidth={1.8} />
            </button>
            <button
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{ background: input ? '#4A6CF7' : 'rgba(255,255,255,0.1)' }}
              onClick={() => input && navigate('/dashboard/wizard', { state: { agent: { name: 'Custom Agent' } } })}>
              <Send size={12} strokeWidth={2} style={{ color: input ? '#fff' : '#4B5563' }} />
            </button>
          </div>
        </div>

        {/* Integrations bar */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-2">
            <Zap size={11} style={{ color: '#4B5563' }} />
            <span className="text-xs" style={{ color: '#4B5563' }}>Connect your tools to StartClaw</span>
          </div>
          <div className="flex items-center gap-1.5">
            {integrationIcons.map((ic, i) => (
              <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{ background: ic.bg }}>
                {ic.label}
              </div>
            ))}
            <button style={{ color: '#4B5563' }}><X size={10} /></button>
          </div>
        </div>
      </div>

      {/* Preset chips */}
      <div className="flex flex-wrap gap-2 justify-center mb-6 max-w-xl">
        {presets.map((p, i) => (
          <button key={p.label}
            onClick={() => { setInput(p.label); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: i === 0 ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.06)',
              border: i === 0 ? '1px solid rgba(74,108,247,0.4)' : '1px solid rgba(255,255,255,0.08)',
              color: i === 0 ? '#7B93FF' : '#9CA3AF',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.15)'; e.currentTarget.style.color = '#7B93FF'; }}
            onMouseLeave={e => {
              e.currentTarget.style.background = i === 0 ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = i === 0 ? '#7B93FF' : '#9CA3AF';
            }}>
            <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
            {p.label}
          </button>
        ))}
      </div>

      {/* Footer links */}
      <div className="flex items-center gap-4 text-xs" style={{ color: '#4B5563' }}>
        <button className="flex items-center gap-1 transition-colors hover:text-gray-400">
          <Zap size={11} /> Browse marketplace
        </button>
        <span>|</span>
        <button className="transition-colors hover:text-gray-400"
          onClick={() => navigate('/dashboard/wizard', { state: { agent: { name: 'Custom Agent' } } })}>
          Configure manually
        </button>
      </div>
    </div>
  );
}