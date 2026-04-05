import { useState } from 'react';
import { Check, Loader2, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';

const AGENT_COLORS = [
  { name: 'Indigo',   color: '#5B5FFF' },
  { name: 'Emerald',  color: '#10B981' },
  { name: 'Sky',      color: '#0984E3' },
  { name: 'Rose',     color: '#E17055' },
  { name: 'Violet',   color: '#8B5CF6' },
  { name: 'Pink',     color: '#EC4899' },
  { name: 'Amber',    color: '#F59E0B' },
  { name: 'Teal',     color: '#00B894' },
  { name: 'Slate',    color: '#64748B' },
];

export default function SettingsTab({ agent, companyId }) {
  const [name,       setName]       = useState(agent?.name || '');
  const [jobTitle,   setJobTitle]   = useState(agent?.jobTitle || agent?.role || '');
  const [color,      setColor]      = useState(agent?.color || '#5B5FFF');
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);

  const isDirty = name !== (agent?.name || '') || jobTitle !== (agent?.jobTitle || agent?.role || '') || color !== (agent?.color || '#5B5FFF');

  async function handleSave() {
    if (!agent?.id || !isDirty) return;
    setSaving(true);
    try {
      await updateDoc(doc(firestore, 'agents', agent.id), {
        name,
        jobTitle,
        color,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('SettingsTab save error:', e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="heading-serif text-2xl font-bold tracking-tight" style={{ color: '#0A0F1E' }}>Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          style={{
            background: saved ? 'rgba(16,185,129,0.1)' : isDirty ? '#4A6CF7' : '#F4F5FC',
            color: saved ? '#10B981' : isDirty ? '#fff' : '#C5C9E0',
            cursor: isDirty ? 'pointer' : 'default',
          }}>
          {saving ? <Loader2 size={11} className="animate-spin" /> : saved ? <CheckCircle2 size={11} /> : null}
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
        </button>
      </div>
      <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>Edit this agent's name, role, and appearance.</p>

      {/* Identity */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9CA3AF' }}>Identity</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6B7280' }}>Agent name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{ background: '#F8FAFF', border: '1px solid rgba(74,108,247,0.15)', color: '#0A0F1E' }}
              onFocus={e => e.target.style.borderColor = 'rgba(74,108,247,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(74,108,247,0.15)'}
              placeholder="e.g. Alex, Nova, Rex…"
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#6B7280' }}>Job title / role</label>
            <input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{ background: '#F8FAFF', border: '1px solid rgba(74,108,247,0.15)', color: '#0A0F1E' }}
              onFocus={e => e.target.style.borderColor = 'rgba(74,108,247,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(74,108,247,0.15)'}
              placeholder="e.g. Sales Operator, Content Strategist…"
            />
          </div>
        </div>
      </div>

      {/* Color */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9CA3AF' }}>Agent color</h3>
        <div className="flex flex-wrap gap-3">
          {AGENT_COLORS.map(c => (
            <button key={c.name} onClick={() => setColor(c.color)} className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: `linear-gradient(145deg, ${c.color}, ${c.color}CC)`,
                  boxShadow: color === c.color ? `0 0 0 2px #fff, 0 0 0 4px ${c.color}, 0 4px 12px ${c.color}40` : `0 3px 8px ${c.color}25`,
                  transform: color === c.color ? 'scale(1.12)' : 'scale(1)',
                }}>
                {color === c.color && <Check size={14} strokeWidth={2.5} style={{ color: '#fff' }} />}
              </div>
              <span className="text-[10px] font-medium" style={{ color: color === c.color ? '#374151' : '#9CA3AF' }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
