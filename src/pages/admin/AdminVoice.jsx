import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { Phone, Search, Mic, ToggleLeft, ToggleRight, PhoneCall, Clock } from 'lucide-react';

const glassCard = {
  background: 'rgba(255,255,255,0.97)',
  border: '1px solid rgba(91,95,255,0.08)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
};

const MOCK_VOICE = [
  {
    id: 'v1',
    businessName: "Lauren O'Reilly",
    phoneNumber: '+1 (555) 012-3456',
    forwardingNumber: '+1 (555) 987-6543',
    voiceName: 'Aria',
    language: 'en-US',
    active: true,
    totalCalls: 34,
    totalMinutes: 127,
    createdAt: null,
  },
  {
    id: 'v2',
    businessName: 'Wellness Script',
    phoneNumber: '+1 (555) 234-5678',
    forwardingNumber: null,
    voiceName: 'Nova',
    language: 'en-US',
    active: false,
    totalCalls: 0,
    totalMinutes: 0,
    createdAt: null,
  },
];

export default function AdminVoice() {
  const [configs, setConfigs] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [voiceSnap, callSnap] = await Promise.all([
          getDocs(collection(firestore, 'voice_configs')),
          getDocs(collection(firestore, 'voice_calls')),
        ]);
        let docs = voiceSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const callDocs = callSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (docs.length === 0) docs = MOCK_VOICE;
        setConfigs(docs);
        setCalls(callDocs);
      } catch (e) {
        console.error('[AdminVoice] error', e);
        setConfigs(MOCK_VOICE);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleActive = async (config) => {
    const newActive = !config.active;
    try {
      await updateDoc(doc(firestore, 'voice_configs', config.id), {
        active: newActive,
        updatedAt: serverTimestamp(),
      });
      setConfigs(prev => prev.map(c => c.id === config.id ? { ...c, active: newActive } : c));
    } catch (e) {
      console.error('Toggle failed:', e);
    }
  };

  const filtered = configs.filter(c =>
    !search ||
    (c.businessName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phoneNumber || '').includes(search)
  );

  const callsForConfig = (configId) => calls.filter(c => c.voiceConfigId === configId || c.configId === configId);

  const timeAgo = (ts) => {
    if (!ts) return '—';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    const m = Math.floor((Date.now() - d) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  };

  const totalActive = configs.filter(c => c.active).length;
  const totalCalls  = configs.reduce((s, c) => s + (c.totalCalls || callsForConfig(c.id).length), 0);
  const totalMins   = configs.reduce((s, c) => s + (c.totalMinutes || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-7 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Voice</h1>
          <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>
            {configs.length} phone numbers · {totalActive} active
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active numbers', value: totalActive, icon: Phone,     color: '#5B5FFF' },
          { label: 'Total calls',    value: totalCalls,  icon: PhoneCall,  color: '#7C3AED' },
          { label: 'Total minutes',  value: totalMins,   icon: Clock,      color: '#0EA5E9' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-4 relative overflow-hidden" style={glassCard}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }} />
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${color}14` }}>
              <Icon size={14} strokeWidth={2} style={{ color }} />
            </div>
            <p className="text-[24px] font-black leading-none mb-0.5" style={{ color: '#0A0F1E', letterSpacing: '-0.03em' }}>{value}</p>
            <p className="text-[11px] font-semibold" style={{ color: '#94A3B8' }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#CBD5E1' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by business name or phone number…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[12px] outline-none"
          style={{ background: '#fff', border: '1px solid rgba(91,95,255,0.12)', color: '#374151' }} />
      </div>

      {/* Voice config cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(91,95,255,0.04)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((config, i) => {
            const configCalls   = callsForConfig(config.id);
            const totalCallsVal = config.totalCalls ?? configCalls.length;
            const totalMinsVal  = config.totalMinutes ?? 0;
            const isSelected    = selected?.id === config.id;

            return (
              <motion.div key={config.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl overflow-hidden" style={glassCard}>

                {/* Main row */}
                <div className="p-4 flex items-start justify-between gap-4 cursor-pointer"
                  onClick={() => setSelected(isSelected ? null : config)}>
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: config.active ? 'linear-gradient(135deg, #5B5FFF, #7C3AED)' : 'rgba(91,95,255,0.08)' }}>
                      <Mic size={16} strokeWidth={2} style={{ color: config.active ? '#fff' : '#CBD5E1' }} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[13px] font-black" style={{ color: '#0A0F1E' }}>
                          {config.businessName || 'Unnamed'}
                        </p>
                        {config.voiceName && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
                            {config.voiceName}
                          </span>
                        )}
                        {config.language && (
                          <span className="text-[10px]" style={{ color: '#CBD5E1' }}>{config.language}</span>
                        )}
                      </div>
                      <p className="text-[12px] font-semibold mb-1" style={{ color: '#374151' }}>
                        {config.phoneNumber || 'No number assigned'}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                          <PhoneCall size={9} className="inline mr-0.5" />{totalCallsVal} calls
                        </span>
                        <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                          <Clock size={9} className="inline mr-0.5" />{totalMinsVal} min
                        </span>
                        {config.forwardingNumber && (
                          <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                            → {config.forwardingNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); toggleActive(config); }}
                      className="flex items-center gap-1">
                      {config.active
                        ? <ToggleRight size={26} style={{ color: '#5B5FFF' }} />
                        : <ToggleLeft  size={26} style={{ color: '#CBD5E1' }} />}
                      <span className="text-[11px] font-semibold" style={{ color: config.active ? '#5B5FFF' : '#CBD5E1' }}>
                        {config.active ? 'Active' : 'Off'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isSelected && (
                  <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                    <div className="pt-4 grid grid-cols-2 gap-3">

                      {/* Left: config info */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>Configuration</p>
                        {[
                          ['Phone number',     config.phoneNumber       || '—'],
                          ['Forwarding to',    config.forwardingNumber  || 'Not set'],
                          ['Voice',            config.voiceName         || '—'],
                          ['Language',         config.language          || '—'],
                          ['Created',          timeAgo(config.createdAt)],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between">
                            <span className="text-[11px]" style={{ color: '#94A3B8' }}>{k}</span>
                            <span className="text-[11px] font-semibold" style={{ color: '#374151' }}>{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* Right: usage stats */}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>Usage</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Total calls',   value: totalCallsVal, color: '#5B5FFF' },
                            { label: 'Total minutes', value: totalMinsVal,  color: '#7C3AED' },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="rounded-xl p-3"
                              style={{ background: `${color}08`, border: `1px solid ${color}12` }}>
                              <p className="text-[18px] font-black" style={{ color, letterSpacing: '-0.02em' }}>{value}</p>
                              <p className="text-[10px]" style={{ color: '#94A3B8' }}>{label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Recent calls from Firestore */}
                        {configCalls.length > 0 && (
                          <div className="mt-3">
                            <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>Recent calls</p>
                            <div className="space-y-1.5">
                              {configCalls.slice(0, 4).map(call => (
                                <div key={call.id} className="flex items-center justify-between">
                                  <span className="text-[10px]" style={{ color: '#374151' }}>
                                    {call.from || call.callerNumber || 'Unknown'}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                                      {call.duration ? `${call.duration}s` : '—'}
                                    </span>
                                    <span className="text-[9px]" style={{ color: '#CBD5E1' }}>
                                      {timeAgo(call.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center text-[12px] py-12" style={{ color: '#CBD5E1' }}>No voice configs found</p>
          )}
        </div>
      )}
    </div>
  );
}
