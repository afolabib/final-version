import { ArrowRight, ExternalLink, Plug } from 'lucide-react';

const integrations = [
  { name: 'Claude Pro/Max', desc: 'Connect your Pro or Max subscription — no API key needed.', icon: '∧', iconColor: '#D97706', connected: false },
  { name: 'Google Calendar', desc: 'Read and manage calendar events.', icon: '📅', iconColor: '#4285F4', connected: false },
  { name: 'Notion', desc: 'Read and write Notion pages and databases.', icon: '📝', iconColor: '#000', connected: false },
  { name: 'GitHub', desc: 'Access repos, issues, and pull requests.', icon: '🐙', iconColor: '#333', connected: false },
  { name: 'Slack', desc: 'Send and receive Slack messages.', icon: '💬', iconColor: '#E01E5A', connected: false },
];

export default function IntegrationsTab() {
  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>Integrations</h2>
      <p className="text-sm mb-2" style={{ color: '#9CA3AF' }}>Services connected to this agent.</p>
      <button className="text-xs font-bold mb-8 transition-colors" style={{ color: '#4A6CF7' }}
        onMouseEnter={e => e.currentTarget.style.color = '#6B63FF'}
        onMouseLeave={e => e.currentTarget.style.color = '#4A6CF7'}>
        Manage all integrations →
      </button>

      <div className="space-y-2">
        {integrations.map(itg => (
          <div key={itg.name}
            className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8EAFF' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4A6CF7'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(74,108,247,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8EAFF'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: '#F4F5FC', border: '1px solid #E8EAFF' }}>
                {itg.icon}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#374151' }}>{itg.name}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{itg.desc}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={{ background: 'rgba(74,108,247,0.08)', color: '#4A6CF7', border: '1px solid rgba(74,108,247,0.15)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.08)'; }}>
              Connect <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>

      <p className="text-[11px] mt-6" style={{ color: '#9CA3AF' }}>
        Connected services can be accessed by the agent during task execution.
      </p>
    </div>
  );
}