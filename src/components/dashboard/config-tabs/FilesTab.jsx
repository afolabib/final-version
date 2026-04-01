import { useState } from 'react';
import { Search, RefreshCw, Plus, FileText, FolderOpen } from 'lucide-react';

const coreFiles = [
  { name: 'AGENTS.md', desc: 'Operating manual & rules', size: '2.4 KB' },
  { name: 'BOOT.md', desc: 'Startup checks', size: '1.1 KB' },
  { name: 'BOOTSTRAP.md', desc: 'Initial setup & bootstrap', size: '3.2 KB' },
  { name: 'HEARTBEAT.md', desc: 'Scheduled task prompts', size: '0.8 KB' },
  { name: 'IDENTITY.md', desc: 'Identity & branding', size: '1.5 KB' },
  { name: 'MEMORY.md', desc: 'Long-term memory', size: '4.1 KB' },
  { name: 'SOUL.md', desc: 'Agent personality & instructions', size: '5.7 KB' },
  { name: 'TOOLS.md', desc: 'Available tools & skills', size: '2.9 KB' },
  { name: 'USER.md', desc: 'User preferences & info', size: '1.3 KB' },
];

const fileTabs = ['All 1089', 'Core 10', 'Memory', 'Workspace 1079'];

export default function FilesTab() {
  const [fileSearch, setFileSearch] = useState('');
  const [activeFileTab, setActiveFileTab] = useState('Core');

  const filtered = coreFiles.filter(f => !fileSearch || f.name.toLowerCase().includes(fileSearch.toLowerCase()));

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>Files</h2>
      <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>Manage memory, instructions, and core files for this agent.</p>

      {/* Search & actions */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-200"
          style={{ background: '#FFFFFF', border: '1px solid #E8EAFF' }}>
          <Search size={13} style={{ color: '#9CA3AF' }} />
          <input value={fileSearch} onChange={e => setFileSearch(e.target.value)} placeholder="Search files..."
            className="text-xs outline-none bg-transparent flex-1 font-medium" style={{ color: '#374151' }} />
        </div>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ color: '#9CA3AF', background: '#FFFFFF', border: '1px solid #E8EAFF' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#4A6CF7'; e.currentTarget.style.background = 'rgba(74,108,247,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = '#FFFFFF'; }}>
          <RefreshCw size={13} />
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
          style={{ background: 'rgba(74,108,247,0.08)', color: '#4A6CF7', border: '1px solid rgba(74,108,247,0.15)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.08)'; }}>
          <Plus size={12} /> Add
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {fileTabs.map(t => {
          const tabName = t.split(' ')[0];
          const isActive = activeFileTab === tabName;
          return (
            <button key={t} onClick={() => setActiveFileTab(tabName)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: isActive ? '#4A6CF7' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#6B7280',
                border: isActive ? '1px solid #4A6CF7' : '1px solid #E8EAFF',
              }}>
              {t}
            </button>
          );
        })}
      </div>

      {/* File table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#FFFFFF', border: '1.5px solid #E8EAFF' }}>
        <div className="grid px-5 py-3" style={{ gridTemplateColumns: '1fr 1fr 80px', borderBottom: '1px solid #E8EAFF' }}>
          {['Name', 'Description', 'Size'].map(h => (
            <span key={h} className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: '#9CA3AF' }}>{h}</span>
          ))}
        </div>
        {filtered.map((f) => (
          <div key={f.name}
            className="grid items-center px-5 py-3.5 cursor-pointer transition-all duration-150"
            style={{ gridTemplateColumns: '1fr 1fr 80px', borderBottom: '1px solid #F4F5FC' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,108,247,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="flex items-center gap-2.5">
              <FileText size={13} style={{ color: '#9CA3AF' }} />
              <span className="text-sm font-semibold" style={{ color: '#374151' }}>{f.name}</span>
            </div>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>{f.desc}</span>
            <span className="text-xs font-mono" style={{ color: '#9CA3AF' }}>{f.size}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <FolderOpen size={24} style={{ color: '#D1D5E8' }} />
            <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>No files found</p>
          </div>
        )}
      </div>
    </div>
  );
}