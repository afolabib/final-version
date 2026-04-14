/**
 * Admin — Sites Manager
 * Add and manage client websites. Freemi internal use only.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe2, Plus, CheckCircle, AlertCircle, Loader2,
  ExternalLink, X, Search, User, Link2, Palette,
  Eye, Zap, ChevronRight,
} from 'lucide-react';
import {
  collection, addDoc, getDocs, query, where,
  serverTimestamp, orderBy,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';

function StatusDot({ status }) {
  const live = status === 'live';
  return (
    <span className={`flex items-center gap-1.5 text-[11px] font-bold ${live ? 'text-emerald-600' : 'text-amber-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
      {live ? 'Live' : 'Draft'}
    </span>
  );
}

function SiteCard({ site, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-4 px-5 py-4 transition-all"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>

      {/* Colour swatch */}
      <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{ background: site.primaryColor ? `${site.primaryColor}20` : 'rgba(91,95,255,0.1)' }}>
        <Globe2 size={15} style={{ color: site.primaryColor || '#5B5FFF' }} />
      </div>

      {/* Site info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold truncate" style={{ color: '#0A0F1E' }}>{site.name || site.domain}</p>
        <p className="text-[11px] font-mono truncate" style={{ color: '#94A3B8' }}>{site.domain}</p>
      </div>

      {/* User email */}
      <div className="hidden md:block min-w-0 w-48">
        <p className="text-[11px] truncate" style={{ color: '#64748B' }}>{site.email || site.userId}</p>
      </div>

      {/* Status */}
      <div className="w-16 flex-shrink-0">
        <StatusDot status={site.status} />
      </div>

      {/* Firestore ID */}
      <p className="hidden lg:block text-[10px] font-mono w-36 truncate" style={{ color: '#CBD5E1' }}>{site.id}</p>

      {/* View */}
      {site.domain && (
        <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer"
          className="p-1.5 rounded-lg transition-all hover:bg-slate-100">
          <ExternalLink size={13} style={{ color: '#94A3B8' }} />
        </a>
      )}
    </motion.div>
  );
}

export default function AdminSites() {
  const [sites, setSites]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [email, setEmail]       = useState('');
  const [uid, setUid]           = useState('');
  const [siteName, setSiteName] = useState('');
  const [domain, setDomain]     = useState('');
  const [color, setColor]       = useState('#5B5FFF');
  const [status, setStatus]     = useState('live');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitDone, setSubmitDone]   = useState(false);

  const loadSites = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(firestore, 'websites'));
      setSites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Failed to load sites:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSites(); }, []);

  const filtered = sites.filter(s => {
    const q = search.toLowerCase();
    return !q || (s.name || '').toLowerCase().includes(q)
      || (s.domain || '').toLowerCase().includes(q)
      || (s.email || '').toLowerCase().includes(q)
      || (s.userId || '').toLowerCase().includes(q);
  });

  const resetForm = () => {
    setEmail(''); setUid(''); setSiteName(''); setDomain('');
    setColor('#5B5FFF'); setStatus('live');
    setSubmitError(null); setSubmitDone(false);
  };

  const handleAddSite = async (e) => {
    e.preventDefault();
    if (!uid.trim()) { setSubmitError('User UID is required.'); return; }
    if (!domain.trim()) { setSubmitError('Domain is required.'); return; }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await addDoc(collection(firestore, 'websites'), {
        userId: uid.trim(),
        email: email.trim(),
        name: siteName.trim() || domain.trim(),
        domain: domain.trim().replace(/^https?:\/\//, ''),
        primaryColor: color,
        status,
        pageCount: 0,
        pagespeed: null,
        seoScore: null,
        createdAt: serverTimestamp(),
        publishedAt: status === 'live' ? serverTimestamp() : null,
        lastUpdated: serverTimestamp(),
      });
      setSubmitDone(true);
      await loadSites();
      setTimeout(() => { setShowForm(false); resetForm(); }, 1800);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-7">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Client Sites</h1>
            <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>
              {sites.length} site{sites.length !== 1 ? 's' : ''} · Freemi internal
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #818CF8)', boxShadow: '0 4px 14px rgba(91,95,255,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(91,95,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(91,95,255,0.35)'}>
            <Plus size={14} /> Add site
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search sites…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 rounded-xl text-[13px] outline-none"
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
            onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

          {/* Header row */}
          <div className="flex items-center gap-4 px-5 py-3"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.015)' }}>
            {['Site', 'User', 'Status', 'ID', ''].map((h, i) => (
              <span key={i} className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: '#CBD5E1', width: i === 0 ? 'auto' : i === 1 ? '12rem' : i === 2 ? '4rem' : i === 3 ? '9rem' : '2rem', flexShrink: 0, flex: i === 0 ? 1 : undefined }}>
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2" style={{ color: '#CBD5E1' }}>
              <Loader2 size={18} className="animate-spin" /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Globe2 size={28} strokeWidth={1.5} style={{ color: '#E2E8F0' }} />
              <p className="text-[13px] mt-3 font-bold" style={{ color: '#CBD5E1' }}>No sites found</p>
            </div>
          ) : (
            filtered.map((s, i) => <SiteCard key={s.id} site={s} index={i} />)
          )}
        </div>

      </div>

      {/* ── Add site modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); resetForm(); } }}>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.22 }}
              className="w-full max-w-md rounded-3xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(91,95,255,0.1)' }}>
                    <Plus size={13} style={{ color: '#5B5FFF' }} />
                  </div>
                  <span className="text-[14px] font-black" style={{ color: '#0A0F1E' }}>Add client site</span>
                </div>
                <button onClick={() => { setShowForm(false); resetForm(); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-all">
                  <X size={15} style={{ color: '#94A3B8' }} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddSite} className="px-6 py-5 space-y-4">

                {/* User section */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#CBD5E1' }}>Client</p>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>
                      Email address
                    </label>
                    <div className="relative">
                      <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="client@email.com"
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl text-[13px] outline-none"
                        style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>
                      Firebase UID <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={uid}
                      onChange={e => setUid(e.target.value)}
                      placeholder="e.g. NHK2XlH09NOgtEBlPGUZjOPeNmF2"
                      required
                      className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none font-mono"
                      style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                    />
                    <p className="text-[10px] mt-1" style={{ color: '#CBD5E1' }}>
                      Find in Firebase Console → Authentication → Users
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }} className="pt-4 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#CBD5E1' }}>Site</p>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>Site name</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={e => setSiteName(e.target.value)}
                      placeholder="e.g. Lauren O'Reilly"
                      className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                      style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>
                      Domain / URL <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div className="relative">
                      <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
                      <input
                        type="text"
                        value={domain}
                        onChange={e => setDomain(e.target.value)}
                        placeholder="itslaurenoreilly.web.app"
                        required
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl text-[13px] outline-none font-mono"
                        style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>Brand colour</label>
                      <div className="flex gap-2">
                        <input type="color" value={color} onChange={e => setColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer p-0.5 border-0" />
                        <input value={color} onChange={e => setColor(e.target.value)}
                          className="flex-1 px-3 py-2.5 rounded-xl text-[12px] outline-none font-mono"
                          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                          onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>Status</label>
                      <select value={status} onChange={e => setStatus(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                        style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}>
                        <option value="live">Live</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {submitError && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px]"
                      style={{ background: 'rgba(239,68,68,0.07)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <AlertCircle size={13} /> {submitError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button type="submit" disabled={submitting || submitDone}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white transition-all"
                  style={{
                    background: submitDone ? 'rgba(16,185,129,0.9)' : 'linear-gradient(135deg, #5B5FFF, #818CF8)',
                    boxShadow: submitDone ? 'none' : '0 4px 14px rgba(91,95,255,0.35)',
                    opacity: submitting ? 0.7 : 1,
                  }}>
                  {submitting
                    ? <><Loader2 size={14} className="animate-spin" /> Adding site…</>
                    : submitDone
                    ? <><CheckCircle size={14} /> Site added!</>
                    : <><Zap size={14} /> Add site</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
