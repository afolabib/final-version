import { useState } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = ['All', 'Installed', 'Available'];

const skills = [
  { name: 'Fast Browser Use', desc: 'Browse the web and interact with websites automatically', category: 'Development' },
  { name: 'GitHub', desc: 'Manage repositories, issues, and pull requests', category: 'Development' },
  { name: 'Gmail', desc: 'Read, send, and search emails via Gmail', category: 'Communication' },
  { name: 'Google Calendar', desc: 'Read and create Google Calendar events', category: 'Productivity' },
  { name: 'Google Drive', desc: 'Access and manage Google Drive files', category: 'Productivity' },
  { name: 'Memory', desc: 'Persistent memory for storing and recalling information', category: 'AI' },
  { name: 'PDF', desc: 'Read, parse, and extract data from PDFs', category: 'Data' },
  { name: 'Slack', desc: 'Send and receive messages in Slack workspaces', category: 'Communication' },
];

const catColors = {
  Development: { bg: 'rgba(59,130,246,0.08)', color: '#3B82F6', border: 'rgba(59,130,246,0.15)' },
  Communication: { bg: 'rgba(16,185,129,0.08)', color: '#10B981', border: 'rgba(16,185,129,0.15)' },
  Productivity: { bg: 'rgba(139,92,246,0.08)', color: '#8B5CF6', border: 'rgba(139,92,246,0.15)' },
  AI: { bg: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: 'rgba(245,158,11,0.15)' },
  Data: { bg: 'rgba(100,116,139,0.08)', color: '#64748B', border: 'rgba(100,116,139,0.15)' },
};

export default function SkillsView() {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [savedSkills, setSavedSkills] = useState([]);

  const filtered = skills.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const visible = filtered.filter((skill) => {
    const installed = savedSkills.includes(skill.name);
    if (tab === 'Installed') return installed;
    if (tab === 'Available') return !installed;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8" style={{ background: '#F4F5FC' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>Skills</h1>
        <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>Enable capabilities to enhance your agents' functionality</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-6 w-full sm:w-80"
        style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
        <Search size={14} style={{ color: '#CBD5E1' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills..."
          className="flex-1 text-sm outline-none bg-transparent font-medium" style={{ color: '#374151' }} />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.08 }}
        className="flex gap-1.5 mb-8">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: tab === t ? 'linear-gradient(135deg, #6C5CE7, #7C3AED)' : 'rgba(255,255,255,0.8)',
              color: tab === t ? '#fff' : '#6B7280',
              border: tab === t ? 'none' : '1px solid rgba(0,0,0,0.04)',
              boxShadow: tab === t ? '0 2px 8px rgba(108,92,231,0.25)' : 'none',
            }}>
            {t}
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visible.map((skill, i) => {
          const cat = catColors[skill.category] || catColors.Data;
          const installed = savedSkills.includes(skill.name);
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 + i * 0.02 }}
              className="rounded-2xl p-5 flex flex-col"
              style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
              <div className="flex items-start justify-between mb-2.5">
                <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{skill.name}</p>
                <button
                  onClick={() => setSavedSkills((prev) => installed ? prev.filter((n) => n !== skill.name) : [...prev, skill.name])}
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    border: installed ? '1.5px solid #10B981' : '1.5px solid rgba(0,0,0,0.06)',
                    color: installed ? '#10B981' : '#CBD5E1',
                    background: installed ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.5)'
                  }}>
                  {installed ? <Check size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2.5} />}
                </button>
              </div>
              <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: '#94A3B8' }}>{skill.desc}</p>
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
