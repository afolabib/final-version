import { useState, useRef } from 'react';
import { Upload, FolderOpen, LayoutGrid, List, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const filterTabs = ['All', 'Documents', 'Images', 'Code'];

export default function FilesView() {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [gridMode, setGridMode] = useState(true);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const localFile = {
        id: `file_${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
      };
      setFiles((prev) => [localFile, ...prev]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#F4F5FC' }}>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>Files</h1>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(37,99,235,0.06)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.1)' }}>Beta</span>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}>
            <Upload size={14} strokeWidth={2.5} /> {uploading ? 'Uploading...' : 'Upload file'}
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex gap-1.5 flex-wrap">
            {filterTabs.map(t => (
              <button key={t} onClick={() => setTab(t)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: tab === t ? 'rgba(37,99,235,0.1)' : 'transparent', color: tab === t ? '#2563EB' : '#6B7280', border: tab === t ? '1px solid rgba(37,99,235,0.2)' : '1px solid transparent' }}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <Search size={13} style={{ color: '#CBD5E1' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="text-xs outline-none bg-transparent w-28 font-medium" style={{ color: '#374151' }} />
            </div>
            <button onClick={() => setGridMode(true)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ color: gridMode ? '#2563EB' : '#CBD5E1', background: gridMode ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.04)' }}><LayoutGrid size={14} /></button>
            <button onClick={() => setGridMode(false)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ color: !gridMode ? '#2563EB' : '#CBD5E1', background: !gridMode ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.04)' }}><List size={14} /></button>
          </div>
        </motion.div>

        <p className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 mb-4" style={{ color: '#94A3B8' }}><FolderOpen size={11} /> Agent files — {filteredFiles.length} items</p>

        {filteredFiles.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="rounded-3xl flex flex-col items-center justify-center py-20"
            style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(37,99,235,0.06)' }}><FolderOpen size={24} style={{ color: '#CBD5E1' }} /></div>
            <p className="text-sm font-bold mb-1" style={{ color: '#374151' }}>No files found</p>
            <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Upload your first file to get started</p>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-xs font-semibold px-3.5 py-2 rounded-lg transition-all inline-flex items-center gap-1.5"
              style={{ color: '#2563EB', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
              <Upload size={12} strokeWidth={2} /> {uploading ? 'Uploading...' : 'Upload file'}
            </button>
          </motion.div>
        ) : (
          <div className={gridMode ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-2'}>
            {filteredFiles.map((file) => (
              <motion.div key={file.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <p className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>{file.name}</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : '—'}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
