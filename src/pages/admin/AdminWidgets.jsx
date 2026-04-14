import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { Search, MessageSquare, ToggleLeft, ToggleRight, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_WIDGETS } from '@/contexts/WidgetContext';

const glassCard = {
  background: 'rgba(255,255,255,0.97)',
  border: '1px solid rgba(91,95,255,0.08)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
};

const CAPABILITY_LABELS = {
  bookings: 'Bookings', enquiries: 'Enquiries', leads: 'Leads',
  support: 'Support', orders: 'Orders', faq: 'FAQ',
};

export default function AdminWidgets() {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(firestore, 'widgets'));
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (docs.length === 0) docs = MOCK_WIDGETS;
        setWidgets(docs);
      } catch (e) {
        console.error('[AdminWidgets] error', e);
        setWidgets(MOCK_WIDGETS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleActive = async (widget) => {
    const newActive = !widget.active;
    try {
      await updateDoc(doc(firestore, 'widgets', widget.id), { active: newActive, updatedAt: serverTimestamp() });
      setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, active: newActive } : w));
      toast.success(`Widget ${newActive ? 'activated' : 'deactivated'}`);
    } catch (e) { toast.error('Failed to update widget'); }
  };

  const filtered = widgets.filter(w =>
    !search ||
    w.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    w.botName?.toLowerCase().includes(search.toLowerCase()) ||
    w.site?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-7">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Widgets</h1>
        <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>{widgets.length} AI widgets deployed</p>
      </div>

      <div className="relative mb-5">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#CBD5E1' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by business name, bot name, or site…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[12px] outline-none"
          style={{ background: '#fff', border: '1px solid rgba(91,95,255,0.12)', color: '#374151' }} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(91,95,255,0.04)' }} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((widget, i) => (
            <motion.div key={widget.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-4" style={glassCard}>

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  {/* Color swatch */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: widget.primaryColor || '#5B5FFF' }}>
                    <MessageSquare size={16} strokeWidth={2} style={{ color: '#fff' }} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[13px] font-black" style={{ color: '#0A0F1E' }}>{widget.businessName || widget.siteName}</p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
                        {widget.botName}
                      </span>
                    </div>
                    <p className="text-[11px] truncate mb-2" style={{ color: '#94A3B8' }}>
                      {widget.site || 'No site'} · {widget.tone || 'balanced'} · {(widget.personality || []).join(', ')}
                    </p>
                    {/* Capabilities */}
                    <div className="flex flex-wrap gap-1">
                      {(widget.capabilities || []).map(c => (
                        <span key={c} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED' }}>
                          {CAPABILITY_LABELS[c] || c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Toggle active */}
                <button onClick={() => toggleActive(widget)} className="flex-shrink-0 flex items-center gap-1.5">
                  {widget.active
                    ? <ToggleRight size={26} style={{ color: '#5B5FFF' }} />
                    : <ToggleLeft size={26} style={{ color: '#CBD5E1' }} />}
                  <span className="text-[11px] font-semibold" style={{ color: widget.active ? '#5B5FFF' : '#CBD5E1' }}>
                    {widget.active ? 'Live' : 'Off'}
                  </span>
                </button>
              </div>

              {/* Greeting preview */}
              {widget.greeting && (
                <div className="mt-3 px-3 py-2 rounded-xl text-[11px] italic"
                  style={{ background: 'rgba(91,95,255,0.03)', color: '#6B7280', borderLeft: `3px solid ${widget.primaryColor || '#5B5FFF'}` }}>
                  "{widget.greeting}"
                </div>
              )}
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-[12px] py-12" style={{ color: '#CBD5E1' }}>No widgets found</p>
          )}
        </div>
      )}
    </div>
  );
}
