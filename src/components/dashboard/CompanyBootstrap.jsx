import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Target, ArrowRight, Upload, Check, Loader2, Globe, Users, Zap } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { createCompany, importCompany } from '@/lib/companyService';
import { createCEOAgent } from '@/lib/agentService';
import { markBootstrapped } from '@/lib/companyService';
import { useCompany } from '@/contexts/CompanyContext';

const STEPS = ['mode', 'setup', 'mission', 'done'];

const INDUSTRIES = ['SaaS', 'E-Commerce', 'Agency', 'Healthcare', 'Logistics', 'Hospitality', 'Finance', 'Other'];
const SIZES = [
  { id: 'solo', label: 'Solo founder', sub: 'Just me' },
  { id: 'startup', label: 'Startup', sub: '2–20 people' },
  { id: 'scaleup', label: 'Scale-up', sub: '20–200 people' },
];

export default function CompanyBootstrap({ onComplete }) {
  const { user } = useAuth();
  const { onBootstrapComplete } = useCompany();
  const [step, setStep] = useState('mode'); // mode | setup | mission | importing | done
  const [mode, setMode] = useState(null);   // 'create' | 'import'
  const [form, setForm] = useState({ name: '', industry: 'SaaS', size: 'startup' });
  const [mission, setMission] = useState('');
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleCreate() {
    if (!form.name.trim() || !mission.trim()) return;
    const uid = user?.uid;
    if (!uid) { setError('Please sign in first.'); return; }
    setSaving(true);
    setError('');
    try {
      const companyId = await createCompany(uid, { ...form, mission });
      await createCEOAgent(companyId, uid);
      await markBootstrapped(companyId);
      onComplete(companyId);
      setStep('done');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const uid = user?.uid;
    if (!uid) { setError('Please sign in first.'); return; }
    setImporting(true);
    setError('');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const { companyId } = await importCompany(uid, data);
      const hasCEO = data.agents?.some(a => a.role === 'ceo');
      if (!hasCEO) await createCEOAgent(companyId, uid);
      await markBootstrapped(companyId);
      onComplete(companyId);
      setStep('done');
    } catch (e) {
      setError('Invalid export file. Please use a FreemiOS or Paperclip export.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'linear-gradient(135deg,#EEF0F8 0%,#F8FAFF 60%,#fff 100%)' }}>

      {/* Ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle,#6C5CE7 0%,transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle,#7C6CF7 0%,transparent 70%)' }} />

      <AnimatePresence mode="wait">

        {/* ── Mode picker ── */}
        {step === 'mode' && (
          <motion.div key="mode" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-lg px-4">
            <div className="text-center mb-10">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ambient-pulse"
                style={{ background: 'linear-gradient(135deg,#6C5CE7,#7C6CF7)', boxShadow: '0 8px 30px rgba(108,92,231,0.4)' }}>
                <div className="w-5 h-5 rounded-full bg-white/90" />
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A0A1A' }}>Welcome to FreemiOS</h1>
              <p className="text-base" style={{ color: '#64748B' }}>Your AI-powered company, run by Freemi</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'create', icon: Building2, title: 'New Company', sub: 'Start from scratch', color: '#6C5CE7' },
                { id: 'import', icon: Upload, title: 'Import Company', sub: 'From Paperclip or FreemiOS export', color: '#00B894' },
              ].map(opt => (
                <button key={opt.id} onClick={() => { setMode(opt.id); setStep(opt.id === 'import' ? 'importing' : 'setup'); }}
                  className="flex flex-col items-start gap-3 p-6 rounded-2xl text-left transition-all duration-200 card-lift"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(108,92,231,0.1)', boxShadow: '0 4px 20px rgba(108,92,231,0.07)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${opt.color}40`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(108,92,231,0.1)'}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${opt.color}15` }}>
                    <opt.icon size={20} style={{ color: opt.color }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#0A0A1A' }}>{opt.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Import mode ── */}
        {step === 'importing' && (
          <motion.div key="importing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md px-4">
            <div className="rounded-2xl p-8 text-center"
              style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(108,92,231,0.1)', boxShadow: '0 8px 40px rgba(108,92,231,0.12)' }}>
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(0,184,148,0.1)' }}>
                <Upload size={22} style={{ color: '#00B894' }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#0A0A1A' }}>Import Company</h2>
              <p className="text-sm mb-6" style={{ color: '#64748B' }}>Upload a FreemiOS or Paperclip export JSON file to restore your company, agents, and goals.</p>
              {error && <p className="text-sm mb-4 text-red-500">{error}</p>}
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              {importing ? (
                <div className="flex items-center justify-center gap-2 py-3" style={{ color: '#6C5CE7' }}>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm font-medium">Importing…</span>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all btn-press"
                  style={{ background: 'linear-gradient(135deg,#00B894,#00CEC9)', boxShadow: '0 4px 16px rgba(0,184,148,0.3)' }}>
                  Choose export file
                </button>
              )}
              <button onClick={() => setStep('mode')} className="mt-3 text-sm" style={{ color: '#94A3B8' }}>← Back</button>
            </div>
          </motion.div>
        )}

        {/* ── Setup: name + industry + size ── */}
        {step === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-lg px-4">
            <div className="rounded-2xl p-8"
              style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(108,92,231,0.1)', boxShadow: '0 8px 40px rgba(108,92,231,0.12)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(108,92,231,0.1)' }}>
                  <Building2 size={20} style={{ color: '#6C5CE7' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#0A0A1A' }}>Company Setup</h2>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>Step 1 of 2</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#374151' }}>Company name</label>
                  <input value={form.name} onChange={e => setField('name', e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all input-focus-ring"
                    style={{ background: '#F8FAFF', border: '1.5px solid rgba(108,92,231,0.15)', color: '#0A0A1A' }} />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#374151' }}>Industry</label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map(ind => (
                      <button key={ind} onClick={() => setField('industry', ind)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: form.industry === ind ? 'rgba(108,92,231,0.12)' : 'rgba(108,92,231,0.04)',
                          color: form.industry === ind ? '#6C5CE7' : '#64748B',
                          border: `1.5px solid ${form.industry === ind ? 'rgba(108,92,231,0.3)' : 'transparent'}`,
                        }}>{ind}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#374151' }}>Team size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZES.map(sz => (
                      <button key={sz.id} onClick={() => setField('size', sz.id)}
                        className="flex flex-col items-center py-3 rounded-xl text-center transition-all"
                        style={{
                          background: form.size === sz.id ? 'rgba(108,92,231,0.08)' : 'rgba(108,92,231,0.03)',
                          border: `1.5px solid ${form.size === sz.id ? 'rgba(108,92,231,0.3)' : 'rgba(108,92,231,0.08)'}`,
                        }}>
                        <span className="text-xs font-bold" style={{ color: form.size === sz.id ? '#6C5CE7' : '#374151' }}>{sz.label}</span>
                        <span className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>{sz.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => { if (form.name.trim()) setStep('mission'); }}
                disabled={!form.name.trim()}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all btn-press"
                style={{ background: form.name.trim() ? 'linear-gradient(135deg,#6C5CE7,#7C6CF7)' : '#E2E8F0', boxShadow: form.name.trim() ? '0 4px 16px rgba(108,92,231,0.35)' : 'none' }}>
                Continue <ArrowRight size={14} />
              </button>
              <button onClick={() => setStep('mode')} className="mt-2 w-full text-sm py-1.5" style={{ color: '#94A3B8' }}>← Back</button>
            </div>
          </motion.div>
        )}

        {/* ── Mission ── */}
        {step === 'mission' && (
          <motion.div key="mission" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-lg px-4">
            <div className="rounded-2xl p-8"
              style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(108,92,231,0.1)', boxShadow: '0 8px 40px rgba(108,92,231,0.12)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(108,92,231,0.1)' }}>
                  <Target size={20} style={{ color: '#6C5CE7' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#0A0A1A' }}>Company Mission</h2>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>Step 2 of 2 — Freemi traces every task back to this</p>
                </div>
              </div>

              <textarea
                value={mission}
                onChange={e => setMission(e.target.value)}
                placeholder="e.g. Build the most user-friendly CRM for small businesses and close 100 enterprise deals in 2025"
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none input-focus-ring"
                style={{ background: '#F8FAFF', border: '1.5px solid rgba(108,92,231,0.15)', color: '#0A0A1A', lineHeight: 1.7 }}
              />
              <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>Be specific. "Grow revenue by 3x" is better than "be successful".</p>

              {error && <p className="text-sm mt-3 text-red-500">{error}</p>}

              <button onClick={handleCreate} disabled={!mission.trim() || saving}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all btn-press"
                style={{ background: mission.trim() ? 'linear-gradient(135deg,#6C5CE7,#7C6CF7)' : '#E2E8F0', boxShadow: mission.trim() ? '0 4px 20px rgba(108,92,231,0.4)' : 'none' }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Zap size={14} /> Launch FreemiOS</>}
              </button>
              <button onClick={() => setStep('setup')} className="mt-2 w-full text-sm py-1.5" style={{ color: '#94A3B8' }}>← Back</button>
            </div>
          </motion.div>
        )}

        {/* ── Done ── */}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm px-4 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#00B894,#00CEC9)', boxShadow: '0 8px 30px rgba(0,184,148,0.4)' }}>
              <Check size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#0A0A1A' }}>FreemiOS is live</h2>
            <p className="text-sm mb-2" style={{ color: '#64748B' }}>Freemi is ready. Tell her your goals and she'll run the company.</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
