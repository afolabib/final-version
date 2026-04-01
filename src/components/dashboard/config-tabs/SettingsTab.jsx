import { useState } from 'react';
import { Check, Palette } from 'lucide-react';

const agentColors = [
  { name: 'Gold', color: '#D4A855' },
  { name: 'Coral', color: '#E06B6B' },
  { name: 'Cyan', color: '#56B5B5' },
  { name: 'Violet', color: '#9B7ED8' },
  { name: 'Prismatic', color: '#D87EAF' },
  { name: 'Aurora', color: '#E0608C' },
  { name: 'Ocean', color: '#5B7FE6' },
  { name: 'Emerald', color: '#3DBB78' },
  { name: 'Sunset', color: '#E88B4D' },
  { name: 'Gray', color: '#6B7280' },
];

export default function SettingsTab() {
  const [selectedColor, setSelectedColor] = useState('Gray');
  const [theme, setTheme] = useState('dark');
  const [productUpdates, setProductUpdates] = useState(true);
  const [taskEmails, setTaskEmails] = useState(false);

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>Settings</h2>
      <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>General settings and appearance.</p>

      {/* Appearance Section */}
      <div className="mb-8">
        <h3 className="text-sm font-bold mb-4" style={{ color: '#374151' }}>Appearance</h3>

        {/* Agent Color */}
        <p className="text-xs font-semibold mb-3" style={{ color: '#6B7280' }}>Agent Color</p>
        <div className="flex flex-wrap gap-3 mb-6">
          {agentColors.map(c => (
            <button key={c.name} onClick={() => setSelectedColor(c.name)} className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 relative"
                style={{
                  background: `linear-gradient(145deg, ${c.color}, ${c.color}CC)`,
                  boxShadow: selectedColor === c.name ? `0 0 0 2px #FFFFFF, 0 0 0 4px ${c.color}, 0 4px 16px ${c.color}40` : `0 4px 12px ${c.color}25`,
                  transform: selectedColor === c.name ? 'scale(1.05)' : 'scale(1)',
                }}>
                {selectedColor === c.name && <Check size={18} strokeWidth={2.5} style={{ color: '#fff' }} />}
              </div>
              <span className="text-[10px] font-medium" style={{ color: selectedColor === c.name ? '#374151' : '#9CA3AF' }}>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Theme selector */}
        <div className="flex gap-3 mb-8">
          {[
            { id: 'light', label: 'Light' },
            { id: 'dark', label: 'Dark' },
          ].map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)} className="flex flex-col items-center gap-2">
              <div className="w-24 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-200"
                style={{
                  background: t.id === 'light' ? '#F8FAFC' : '#1E293B',
                  border: theme === t.id ? '2px solid #4A6CF7' : '2px solid #E8EAFF',
                  boxShadow: theme === t.id ? '0 4px 16px rgba(74,108,247,0.15)' : 'none',
                }}>
                <div className="flex flex-col gap-1">
                  <div className="w-12 h-1.5 rounded-full" style={{ background: t.id === 'light' ? '#CBD5E1' : '#475569' }} />
                  <div className="w-8 h-1.5 rounded-full" style={{ background: t.id === 'light' ? '#94A3B8' : '#334155' }} />
                </div>
                {theme === t.id && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: '#4A6CF7' }}>
                    <Check size={10} strokeWidth={3} style={{ color: '#fff' }} />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium" style={{ color: theme === t.id ? '#374151' : '#9CA3AF' }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px mb-8" style={{ background: '#E8EAFF' }} />

      {/* Communication Preferences */}
      <h3 className="text-sm font-bold mb-5" style={{ color: '#374151' }}>Communication preferences</h3>

      <ToggleRow
        title="Receive product updates"
        desc="Receive early access to feature releases and success stories to optimize your workflow."
        checked={productUpdates}
        onChange={() => setProductUpdates(!productUpdates)}
      />
      <ToggleRow
        title="Email me when my queued task starts"
        desc="When enabled, we'll send you a timely email once your task finishes queuing and begins processing."
        checked={taskEmails}
        onChange={() => setTaskEmails(!taskEmails)}
      />
    </div>
  );
}

function ToggleRow({ title, desc, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold mb-0.5" style={{ color: '#374151' }}>{title}</p>
        <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>{desc}</p>
      </div>
      <button onClick={onChange} className="flex-shrink-0 mt-0.5"
        style={{ width: 44, height: 24, borderRadius: 12, background: checked ? '#4A6CF7' : '#E8EAFF', transition: 'background 200ms', position: 'relative', border: checked ? 'none' : '1px solid #D1D5E8' }}>
        <div style={{
          width: 18, height: 18, borderRadius: 9, background: '#fff',
          position: 'absolute', top: 3, left: checked ? 23 : 3,
          transition: 'left 200ms ease-out',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );
}