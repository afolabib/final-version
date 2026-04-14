import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { Search, Globe2, ExternalLink, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_SITES } from '@/components/dashboard/website/mockWebsite';

const glassCard = {
  background: 'rgba(255,255,255,0.97)',
  border: '1px solid rgba(91,95,255,0.08)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
};

const STATUS_META = {
  live:  { color: '#5B5FFF', bg: 'rgba(91,95,255,0.08)',  label: 'Live',  icon: CheckCircle },
  draft: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: 'Draft', icon: Clock },
  error: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  label: 'Error', icon: AlertTriangle },
};

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminWebsites() {
  const [sites, setSites]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(firestore, 'websites'));
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (docs.length === 0) docs = MOCK_SITES;
        setSites(docs.sort((a, b) => {
          const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return tb - ta;
        }));
      } catch (e) {
        console.error('[AdminWebsites] load error', e);
        setSites(MOCK_SITES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleStatus = async (site) => {
    const newStatus = site.status === 'live' ? 'draft' : 'live';
    try {
      await updateDoc(doc(firestore, 'websites', site.id), { status: newStatus, updatedAt: serverTimestamp() });
      setSites(prev => prev.map(s => s.id === site.id ? { ...s, status: newStatus } : s));
      toast.success(`Site set to ${newStatus}`);
    } catch (e) { toast.error('Failed to update site status'); }
  };

  const filtered = sites.filter(s => {
    const matchSearch = !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.domain?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Websites</h1>
          <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>{sites.length} sites across all users</p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#CBD5E1' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or domain…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[12px] outline-none"
            style={{ background: '#fff', border: '1px solid rgba(91,95,255,0.12)', color: '#374151' }} />
        </div>
        {['all', 'live', 'draft'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-3 py-2 rounded-xl text-[11px] font-bold capitalize transition-all"
            style={{
              background: filterStatus === s ? 'rgba(91,95,255,0.1)' : '#fff',
              color: filterStatus === s ? '#5B5FFF' : '#94A3B8',
              border: filterStatus === s ? '1px solid rgba(91,95,255,0.2)' : '1px solid rgba(0,0,0,0.06)',
            }}>{s}</button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: 'rgba(91,95,255,0.04)' }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((site, i) => {
            const statusMeta = STATUS_META[site.status] || STATUS_META.draft;
            const StatusIcon = statusMeta.icon;
            return (
              <motion.div key={site.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-4" style={glassCard}>

                {/* Preview image */}
                <div className="w-full h-24 rounded-xl mb-3 overflow-hidden relative"
                  style={{ background: 'rgba(91,95,255,0.04)' }}>
                  {site.domain && (
                    <img
                      src={`https://api.microlink.io?url=https%3A%2F%2F${site.domain}&screenshot=true&meta=false&embed=screenshot.url`}
                      alt={site.name}
                      className="w-full h-full object-cover object-top"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: statusMeta.bg, color: statusMeta.color }}>
                      <StatusIcon size={8} strokeWidth={2.5} />
                      {statusMeta.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-black truncate" style={{ color: '#0A0F1E' }}>{site.name}</p>
                    <p className="text-[11px] truncate" style={{ color: '#94A3B8' }}>{site.domain}</p>
                  </div>
                  <a href={`https://${site.domain}`} target="_blank" rel="noreferrer"
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(91,95,255,0.07)' }}
                    onClick={e => e.stopPropagation()}>
                    <ExternalLink size={11} style={{ color: '#5B5FFF' }} />
                  </a>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="flex gap-3">
                    <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                      <span className="font-bold" style={{ color: '#374151' }}>{site.pageCount || 0}</span> pages
                    </span>
                    <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                      SEO <span className="font-bold" style={{ color: '#374151' }}>{site.seoScore || '—'}</span>
                    </span>
                  </div>
                  <button onClick={() => toggleStatus(site)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                    style={{ background: 'rgba(0,0,0,0.04)', color: '#94A3B8' }}>
                    {site.status === 'live' ? 'Set draft' : 'Go live'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
