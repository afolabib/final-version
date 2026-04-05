import { useState } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandLogo from '@/components/BrandLogo';

const tabs = ['All', 'Installed', 'Available'];

const skills = [
  { name: 'Fast Browser Use', desc: 'Browse the web and interact with websites automatically', category: 'Development', color: '#5B5FFF' },
  { name: 'GitHub', desc: 'Manage repositories, issues, and pull requests', category: 'Development', color: '#181717' },
  { name: 'Gmail', desc: 'Read, send, and search emails via Gmail', category: 'Communication', color: '#EA4335' },
  { name: 'Google Calendar', desc: 'Read and create Google Calendar events', category: 'Productivity', color: '#4285F4' },
  { name: 'Google Drive', desc: 'Access and manage Google Drive files', category: 'Productivity', color: '#4285F4' },
  { name: 'Memory', desc: 'Persistent memory for storing and recalling information', category: 'AI', color: '#F59E0B' },
  { name: 'PDF', desc: 'Read, parse, and extract data from PDFs', category: 'Data', color: '#EF4444' },
  { name: 'Slack', desc: 'Send and receive messages in Slack workspaces', category: 'Communication', color: '#E01E5A' },
];

const catColors = {
  Development: { bg: 'rgba(91,95,255,0.07)',  color: '#5B5FFF', border: 'rgba(91,95,255,0.14)' },
  Communication: { bg: 'rgba(16,185,129,0.07)', color: '#10B981', border: 'rgba(16,185,129,0.14)' },
  Productivity: { bg: 'rgba(14,165,233,0.07)', color: '#0EA5E9', border: 'rgba(14,165,233,0.14)' },
  AI: { bg: 'rgba(245,158,11,0.07)',  color: '#F59E0B', border: 'rgba(245,158,11,0.14)' },
  Data: { bg: 'rgba(100,116,139,0.07)', color: '#64748B', border: 'rgba(100,116,139,0.14)' },
};

export default function SkillsView() {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [savedSkills, setSavedSkills] = useState([]);

  const filtered = skills.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const visible = filtered.filter(skill => {
    const installed = savedSkills.includes(skill.name);
    if (tab === 'Installed') return installed;
    if (tab === 'Available') return !installed;
    return true;
  });

  return (
    <div className="h-full flex flex-col overflow-y-auto px-4 md:px-8 py-6 md:py-8"
      style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>

      {/* Header */}
      <div className="mb-6">
        <h1 className="heading-serif text-2xl font-bold" style={{ color: '#0A0F1E' }}>Skills</h1>
        <p className="text-sm mt-0.5 font-medium" style={{ color: '#64748B' }}>
          Enable capabilities to enhance your operators' functionality
        </p>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-6 w-full sm:w-80"
        style={{
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid rgba(91,95,255,0.09)',
          boxShadow: '0 2px 12px rgba(91,95,255,0.04)',
        }}>
        <Search size={14} style={{ color: '#CBD5E1' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search skills…"
          className="flex-1 text-sm outline-none bg-transparent font-medium"
          style={{ color: '#374151' }} />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="flex gap-1.5 mb-8">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: tab === t ? 'linear-gradient(135deg, #5B5FFF, #2563EB)' : 'rgba(255,255,255,0.88)',
              color: tab === t ? '#fff' : '#6B7280',
              border: tab === t ? 'none' : '1px solid rgba(91,95,255,0.09)',
              boxShadow: tab === t ? '0 2px 10px rgba(91,95,255,0.28)' : 'none',
            }}>
            {t}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visible.map((skill, i) => {
          const cat = catColors[skill.category] || catColors.Data;
          const installed = savedSkills.includes(skill.name);
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 + i * 0.03 }}
              className="rounded-2xl p-5 flex flex-col card-lift"
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(91,95,255,0.07)',
                boxShadow: '0 4px 20px rgba(91,95,255,0.04)',
              }}>
              {/* Brand logo */}
              <div className="mb-3">
                <BrandLogo name={skill.name} fallbackColor={skill.color} size={36} />
              </div>
              <div className="flex items-start justify-between mb-2.5">
                <p className="text-sm font-bold" style={{ color: '#0A0F1E' }}>{skill.name}</p>
                <button
                  onClick={() => setSavedSkills(prev => installed ? prev.filter(n => n !== skill.name) : [...prev, skill.name])}
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    border: installed ? '1.5px solid #10B981' : '1.5px solid rgba(0,0,0,0.07)',
                    color: installed ? '#10B981' : '#CBD5E1',
                    background: installed ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.5)',
                  }}>
                  {installed ? <Check size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2.5} />}
                </button>
              </div>
              <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: '#94A3B8' }}>
                {skill.desc}
              </p>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full self-start"
                style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                {skill.category}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
