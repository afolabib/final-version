import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Key, Shield } from 'lucide-react';

export default function CustomAPIsTab() {
  const [apiKeys, setApiKeys] = useState([{ name: '', key: '' }]);
  const [showConnInfo, setShowConnInfo] = useState(false);

  const updateKey = (i, field, val) => {
    const nk = [...apiKeys];
    nk[i][field] = val;
    setApiKeys(nk);
  };

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>Custom APIs</h2>
      <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>Add third-party API keys for skills and integrations.</p>

      {/* API Keys Card */}
      <div className="rounded-2xl p-6 mb-6"
        style={{ background: '#FFFFFF', border: '1.5px solid #E8EAFF' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Key size={15} style={{ color: '#4A6CF7' }} />
            <div>
              <h3 className="text-sm font-bold" style={{ color: '#374151' }}>API Keys</h3>
              <p className="text-[11px]" style={{ color: '#9CA3AF' }}>Stored securely and encrypted at rest.</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
            style={{ background: 'rgba(74,108,247,0.08)', color: '#4A6CF7', border: '1px solid rgba(74,108,247,0.15)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.08)'; }}>
            💾 Save
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {apiKeys.map((key, i) => (
            <div key={i} className="flex items-center gap-2">
              <input placeholder="Name" value={key.name} onChange={e => updateKey(i, 'name', e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all duration-200"
                style={{ background: '#F4F5FC', border: '1px solid #E8EAFF', color: '#374151' }} />
              <input placeholder="sk-..." value={key.key} onChange={e => updateKey(i, 'key', e.target.value)}
                className="flex-[2] px-4 py-2.5 rounded-xl text-xs font-mono font-medium outline-none transition-all duration-200"
                style={{ background: '#F4F5FC', border: '1px solid #E8EAFF', color: '#374151' }} />
              <button onClick={() => setApiKeys(apiKeys.filter((_, j) => j !== i))}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ color: '#9CA3AF', background: '#F4F5FC' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = '#F4F5FC'; }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setApiKeys([...apiKeys, { name: '', key: '' }])}
          className="flex items-center gap-1.5 text-xs font-bold mx-auto transition-colors"
          style={{ color: '#9CA3AF' }}
          onMouseEnter={e => e.currentTarget.style.color = '#4A6CF7'}
          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
          <Plus size={12} /> Add API Key
        </button>
      </div>

      {/* Connection Information Card */}
      <div className="rounded-2xl p-6"
        style={{ background: '#FFFFFF', border: '1.5px solid #E8EAFF' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Shield size={15} style={{ color: '#4A6CF7' }} />
            <h3 className="text-sm font-bold" style={{ color: '#374151' }}>Connection Information</h3>
          </div>
          <button onClick={() => setShowConnInfo(v => !v)}
            className="flex items-center gap-1.5 text-xs font-bold transition-colors"
            style={{ color: '#4A6CF7' }}
            onMouseEnter={e => e.currentTarget.style.color = '#6366F1'}
            onMouseLeave={e => e.currentTarget.style.color = '#4A6CF7'}>
            {showConnInfo ? <EyeOff size={12} /> : <Eye size={12} />}
            {showConnInfo ? 'Hide' : 'Reveal'}
          </button>
        </div>
        {[
          { label: 'IP Address', value: showConnInfo ? '34.195.12.188' : '••••••••••' },
          { label: 'Instance ID', value: showConnInfo ? 'i-0496c68e71bb577' : '••••••••••' },
          { label: 'VNC Port', value: showConnInfo ? '5900' : '••••' },
          { label: 'Tier', value: showConnInfo ? 'Enterprise' : '••••••••' },
        ].map((row, i, arr) => (
          <div key={row.label} className="flex items-center justify-between py-3.5"
            style={{ borderBottom: i < arr.length - 1 ? '1px solid #E8EAFF' : 'none' }}>
            <span className="text-sm font-medium" style={{ color: '#6B7280' }}>{row.label}</span>
            <span className="text-sm font-mono font-medium" style={{ color: showConnInfo ? '#374151' : '#D1D5E8' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}