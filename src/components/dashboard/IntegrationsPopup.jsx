import { useState } from 'react';
import { Search, Plus } from 'lucide-react';

const integrations = [
  { name: 'Gmail', icon: '📧' },
  { name: 'Composio', icon: '⚙️' },
  { name: 'GitHub', icon: '🐙' },
  { name: 'Google Calendar', icon: '📅' },
  { name: 'Notion', icon: '📝' },
  { name: 'Google Sheets', icon: '📊' },
  { name: 'Slack', icon: '💬' },
  { name: 'Stripe', icon: '💳' },
];

export default function IntegrationsPopup() {
  const [search, setSearch] = useState('');
  const filtered = integrations.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="absolute bottom-full mb-3 left-0 z-50 w-80 rounded-2xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 20px 60px rgba(74,108,247,0.18), 0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E8EAFF' }}>
      {/* Search */}
      <div className="flex items-center gap-2.5 px-4 py-3.5" style={{ borderBottom: '1px solid #F0F1FF' }}>
        <Search size={14} style={{ color: '#C5C9E0' }} className="flex-shrink-0" />
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search integrations..."
          className="flex-1 text-sm outline-none bg-transparent font-medium placeholder-gray-300"
          style={{ color: '#374151' }}
        />
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {filtered.map((item, i) => (
          <div key={item.name}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F8F8FF' : 'none' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: '#F4F5FC', border: '1px solid #E8EAFF' }}>
                {item.icon}
              </div>
              <span className="text-sm font-semibold" style={{ color: '#374151' }}>{item.name}</span>
            </div>
            <button className="text-xs font-semibold transition-all px-2.5 py-1 rounded-full"
              style={{ color: '#4A6CF7', background: 'rgba(74,108,247,0.08)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,108,247,0.16)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,108,247,0.08)'}>
              Connect
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-3.5" style={{ borderTop: '1px solid #F0F1FF' }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(74,108,247,0.1)' }}>
          <Plus size={11} style={{ color: '#4A6CF7' }} />
        </div>
        <span className="text-sm font-semibold" style={{ color: '#4A6CF7' }}>Add more apps</span>
      </div>
    </div>
  );
}