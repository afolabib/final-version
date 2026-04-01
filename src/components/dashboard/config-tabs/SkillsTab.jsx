import { Wrench, Plus, Check, ArrowRight } from 'lucide-react';

const skills = [
  { name: 'Web Search', desc: 'Search the internet for real-time information', icon: '🔍', enabled: true },
  { name: 'Code Execution', desc: 'Run Python, Node.js, and shell scripts', icon: '⚡', enabled: true },
  { name: 'File Management', desc: 'Create, read, and edit files', icon: '📁', enabled: true },
  { name: 'OpenClaw Optimizer', desc: 'AI-powered workflow optimization', icon: '🦞', enabled: false },
  { name: 'Self-Improving', desc: 'Learn and improve from task outcomes', icon: '🧠', enabled: false },
  { name: 'Computer Use', desc: 'Control browser and desktop applications', icon: '🖥️', enabled: false },
];

export default function SkillsTab() {
  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>Skills</h2>
      <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>Capabilities available to this agent during task execution.</p>

      <div className="space-y-2 mb-6">
        {skills.map(skill => (
          <div key={skill.name}
            className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8EAFF' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4A6CF7'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(74,108,247,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8EAFF'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: '#F4F5FC', border: '1px solid #E8EAFF' }}>
                {skill.icon}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#374151' }}>{skill.name}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{skill.desc}</p>
              </div>
            </div>
            {skill.enabled ? (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <Check size={12} strokeWidth={2.5} style={{ color: '#22C55E' }} />
                <span className="text-xs font-bold" style={{ color: '#22C55E' }}>Active</span>
              </div>
            ) : (
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                style={{ background: 'rgba(74,108,247,0.08)', color: '#4A6CF7', border: '1px solid rgba(74,108,247,0.15)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.08)'; }}>
                Enable <ArrowRight size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button className="text-xs font-bold transition-colors"
        style={{ color: '#4A6CF7' }}
        onMouseEnter={e => e.currentTarget.style.color = '#6366F1'}
        onMouseLeave={e => e.currentTarget.style.color = '#4A6CF7'}>
        Browse skill marketplace →
      </button>
    </div>
  );
}