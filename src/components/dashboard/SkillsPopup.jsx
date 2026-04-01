import { useState } from 'react';
import { Search, Puzzle, Check, Plus } from 'lucide-react';

const installed = [
  { name: 'calendar' },
  { name: 'openclaw-optimizer' },
  { name: 'self-improving' },
];

const available = [
  { name: 'Slack', desc: 'Send and receive messages in Slac...' },
  { name: 'Memory', desc: 'Persistent memory for storing and r...' },
  { name: 'Fast Browser Use', desc: 'Browse the web and interact with w...' },
];

export default function SkillsPopup() {
  const [search, setSearch] = useState('');

  const filteredInstalled = installed.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const filteredAvailable = available.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="absolute bottom-full mb-3 left-0 z-50 w-72 rounded-2xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 20px 60px rgba(74,108,247,0.18), 0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E8EAFF' }}>
      {/* Search */}
      <div className="flex items-center gap-2.5 px-4 py-3.5" style={{ borderBottom: '1px solid #F0F1FF' }}>
        <Search size={14} style={{ color: '#C5C9E0' }} className="flex-shrink-0" />
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search skills..."
          className="flex-1 text-sm outline-none bg-transparent font-medium placeholder-gray-300"
          style={{ color: '#374151' }}
        />
      </div>

      {/* Installed */}
      {filteredInstalled.length > 0 && (
        <div className="py-1">
          {filteredInstalled.map((skill, i) => (
            <div key={skill.name}
              className="flex items-center justify-between px-4 py-3 transition-colors cursor-pointer"
              style={{
                background: 'rgba(74,108,247,0.04)',
                borderBottom: i < filteredInstalled.length - 1 ? '1px solid rgba(74,108,247,0.06)' : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,108,247,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,108,247,0.04)'}
            >
              <div className="flex items-center gap-3">
                <Puzzle size={14} style={{ color: '#4A6CF7' }} />
                <span className="text-sm font-semibold" style={{ color: '#374151' }}>{skill.name}</span>
              </div>
              <Check size={14} style={{ color: '#4A6CF7' }} strokeWidth={2.5} />
            </div>
          ))}
        </div>
      )}

      {/* Available */}
      {filteredAvailable.length > 0 && (
        <div style={{ borderTop: filteredInstalled.length > 0 ? '1px solid #F0F1FF' : 'none' }}>
          {filteredAvailable.map((skill, i) => (
            <div key={skill.name}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              style={{ borderBottom: i < filteredAvailable.length - 1 ? '1px solid #F8F8FF' : 'none' }}>
              <div className="flex items-center gap-3">
                <Puzzle size={14} style={{ color: '#C5C9E0' }} />
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#374151' }}>{skill.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{skill.desc}</div>
                </div>
              </div>
              <button className="text-xs font-semibold ml-3 flex-shrink-0 px-2.5 py-1 rounded-full transition-all"
                style={{ color: '#4A6CF7', background: 'rgba(74,108,247,0.08)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,108,247,0.16)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,108,247,0.08)'}>
                Install
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-3.5" style={{ borderTop: '1px solid #F0F1FF' }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(74,108,247,0.1)' }}>
          <Plus size={11} style={{ color: '#4A6CF7' }} />
        </div>
        <span className="text-sm font-semibold" style={{ color: '#4A6CF7' }}>Manage skills</span>
      </div>
    </div>
  );
}