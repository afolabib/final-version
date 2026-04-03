import { ArrowRight } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

const channels = [
  { name: 'WhatsApp', desc: 'Chat via WhatsApp Business (QR pairing)', color: '#25D366', connected: false },
  { name: 'Telegram', desc: 'Connect your Telegram bot', color: '#0088CC', connected: false },
  { name: 'Discord', desc: 'Deploy as a Discord bot', color: '#5865F2', connected: true },
  { name: 'Slack', desc: 'Integrate with Slack workspace', color: '#E01E5A', connected: false },
  { name: 'Gmail', desc: 'Receive and respond via email', color: '#EA4335', connected: false },
  { name: 'Microsoft Teams', desc: 'Deploy as a Teams bot', color: '#6264A7', connected: false },
];

export default function ChannelsTab() {
  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>Messaging Channels</h2>
      <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>Connect platforms so people can reach your AI agent anywhere.</p>

      <div className="space-y-2">
        {channels.map(ch => (
          <div key={ch.name}
            className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 group"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E8EAFF',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4A6CF7'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(74,108,247,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8EAFF'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div className="flex items-center gap-4">
              <BrandLogo name={ch.name} fallbackColor={ch.color} size={40} />
              <div>
                <p className="text-sm font-bold" style={{ color: '#374151' }}>{ch.name}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{ch.desc}</p>
              </div>
            </div>
            {ch.connected ? (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.4)' }} />
                <span className="text-xs font-bold" style={{ color: '#22C55E' }}>Connected</span>
              </div>
            ) : (
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                style={{ background: 'rgba(74,108,247,0.08)', color: '#4A6CF7', border: '1px solid rgba(74,108,247,0.15)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.15)'; e.currentTarget.style.borderColor = '#4A6CF7'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.08)'; e.currentTarget.style.borderColor = 'rgba(74,108,247,0.15)'; }}>
                Connect <ArrowRight size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}