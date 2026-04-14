import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, getDocs, doc, updateDoc, serverTimestamp, query, where, getCountFromServer,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import {
  Search, X, Globe2, MessageSquare, Mic, CreditCard, Mail,
  Calendar, Ban, CheckCircle, ChevronRight, ArrowUpRight,
  Building2, Zap, TrendingUp, Edit2, Check, AlertCircle,
  MoreHorizontal, Activity, FileText, Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion as m } from 'framer-motion';

const PLANS = ['starter', 'growth', 'business'];
const PLAN_PRICE = { starter: 22, growth: 40, business: 75 };
const PLAN_LIMITS = {
  starter:  { conversations: 500,   sites: 1, widgets: 1 },
  growth:   { conversations: 1500,  sites: 2, widgets: 2 },
  business: { conversations: 5000,  sites: 5, widgets: 5 },
};

const STATUS_META = {
  active:    { color: '#5B5FFF', bg: 'rgba(91,95,255,0.1)',   dot: '#5B5FFF',  label: 'Active' },
  suspended: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   dot: '#EF4444',  label: 'Suspended' },
  trial:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  dot: '#F59E0B',  label: 'Trial' },
};

function timeAgo(ts) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const days = Math.floor((Date.now() - d) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function fmtDate(ts) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Usage bar ─────────────────────────────────────────────────────────────────
function UsageBar({ label, used, total, color = '#5B5FFF' }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const warn = pct > 80;
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-[11px] font-semibold" style={{ color: '#64748B' }}>{label}</span>
        <span className="text-[11px] font-bold" style={{ color: warn ? '#F59E0B' : '#374151' }}>
          {used} / {total === Infinity ? '∞' : total}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: warn ? '#F59E0B' : color }} />
      </div>
    </div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function UserPanel({ user, allWidgets, allSites, allVoice, allConvos, onClose, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [editPlan, setEditPlan] = useState(false);
  const [plan, setPlan] = useState(user.planId || 'starter');
  const [editNote, setEditNote] = useState(false);
  const [note, setNote] = useState(user.adminNote || '');
  const [activeTab, setActiveTab] = useState('overview');

  const uid = user.ownerId;
  const userWidgets = allWidgets.filter(w => w.userId === uid);
  const userSites   = allSites.filter(s => s.userId === uid);
  const userVoice   = allVoice.filter(v => v.userId === uid || v.uid === uid);
  const userConvos  = allConvos.filter(c => userWidgets.some(w => w.id === c.widgetId));

  const limits = PLAN_LIMITS[user.planId || 'starter'];
  const price  = PLAN_PRICE[user.planId || 'starter'];

  const savePlan = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(firestore, 'companies', user.id), { planId: plan, updatedAt: serverTimestamp() });
      onUpdate({ ...user, planId: plan });
      toast.success(`Plan changed to ${plan}`);
      setEditPlan(false);
    } catch { toast.error('Failed to update plan'); }
    finally { setSaving(false); }
  };

  const saveNote = async () => {
    try {
      await updateDoc(doc(firestore, 'companies', user.id), { adminNote: note, updatedAt: serverTimestamp() });
      onUpdate({ ...user, adminNote: note });
      toast.success('Note saved');
      setEditNote(false);
    } catch { toast.error('Failed to save note'); }
  };

  const toggleSuspend = async () => {
    const s = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateDoc(doc(firestore, 'companies', user.id), { status: s, updatedAt: serverTimestamp() });
      onUpdate({ ...user, status: s });
      toast.success(s === 'suspended' ? 'Account suspended' : 'Account reactivated');
    } catch { toast.error('Failed to update status'); }
  };

  const TABS = ['overview', 'usage', 'services', 'billing'];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="w-96 flex-shrink-0 flex flex-col h-full overflow-hidden"
      style={{ background: '#fff', borderLeft: '1px solid rgba(91,95,255,0.09)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black text-white"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
            {(user.name || user.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-[13px] font-black leading-tight" style={{ color: '#0A0F1E' }}>{user.name || 'Unnamed'}</p>
            <p className="text-[10px]" style={{ color: '#94A3B8' }}>{user.email || user.ownerId?.slice(0, 20)}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.05)' }}>
          <X size={12} />
        </button>
      </div>

      {/* Status + quick stats */}
      <div className="px-5 py-3 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: 'rgba(91,95,255,0.02)' }}>
        <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: STATUS_META[user.status || 'active'].bg, color: STATUS_META[user.status || 'active'].color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_META[user.status || 'active'].dot }} />
          {STATUS_META[user.status || 'active'].label}
        </span>
        <span className="text-[11px] font-bold capitalize px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
          {user.planId || 'starter'} · €{price}/mo
        </span>
        <span className="text-[11px] ml-auto" style={{ color: '#CBD5E1' }}>
          Joined {timeAgo(user.createdAt)}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex px-5 py-2 gap-1 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all"
            style={{
              background: activeTab === t ? 'rgba(91,95,255,0.1)' : 'transparent',
              color: activeTab === t ? '#5B5FFF' : '#94A3B8',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Info grid */}
            <div className="space-y-2.5">
              {[
                { icon: Building2, label: 'Company', val: user.name || '—' },
                { icon: Mail,      label: 'Email',   val: user.email || '—' },
                { icon: Activity,  label: 'Industry',val: user.industry || '—' },
                { icon: Calendar,  label: 'Joined',  val: fmtDate(user.createdAt) },
                { icon: FileText,  label: 'UID',     val: user.ownerId?.slice(0, 20) + '…' || '—' },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.02)' }}>
                  <Icon size={12} style={{ color: '#CBD5E1', flexShrink: 0 }} />
                  <span className="text-[11px] w-16 flex-shrink-0" style={{ color: '#94A3B8' }}>{label}</span>
                  <span className="text-[11px] font-semibold truncate" style={{ color: '#374151' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Admin note */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#CBD5E1' }}>Internal note</span>
                <button onClick={() => setEditNote(e => !e)} className="text-[10px] font-bold" style={{ color: '#5B5FFF' }}>
                  {editNote ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {editNote ? (
                <div>
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                    placeholder="Add internal note about this user…"
                    className="w-full p-3 rounded-xl text-[12px] resize-none outline-none"
                    style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.15)', color: '#374151' }} />
                  <button onClick={saveNote}
                    className="w-full mt-1.5 py-2 rounded-xl text-[11px] font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                    Save note
                  </button>
                </div>
              ) : (
                <p className="text-[12px] px-3 py-2.5 rounded-xl min-h-[40px]"
                  style={{ background: 'rgba(0,0,0,0.02)', color: note ? '#374151' : '#CBD5E1', fontStyle: note ? 'normal' : 'italic' }}>
                  {note || 'No note yet'}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <button onClick={toggleSuspend}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[12px] font-bold"
                style={{
                  background: user.status === 'suspended' ? 'rgba(91,95,255,0.07)' : 'rgba(239,68,68,0.07)',
                  color: user.status === 'suspended' ? '#5B5FFF' : '#EF4444',
                }}>
                {user.status === 'suspended'
                  ? <><CheckCircle size={13} /> Reactivate account</>
                  : <><Ban size={13} /> Suspend account</>}
              </button>
              {user.email && (
                <a href={`mailto:${user.email}`}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[12px] font-bold"
                  style={{ background: 'rgba(91,95,255,0.07)', color: '#5B5FFF', display: 'flex' }}>
                  <Mail size={13} /> Email user
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── USAGE ── */}
        {activeTab === 'usage' && (
          <div className="space-y-5">
            <div className="rounded-xl p-4" style={{ background: 'rgba(91,95,255,0.03)', border: '1px solid rgba(91,95,255,0.08)' }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-4" style={{ color: '#94A3B8' }}>This month's usage</p>
              <UsageBar label="Conversations" used={userConvos.length} total={limits.conversations} />
              <UsageBar label="AI widgets"    used={userWidgets.length}  total={limits.widgets} />
              <UsageBar label="Sites hosted"  used={userSites.length}    total={limits.sites} />
            </div>

            {/* Usage cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total conversations', val: userConvos.length,  icon: MessageSquare, color: '#5B5FFF' },
                { label: 'Active widgets',       val: userWidgets.filter(w => w.active !== false).length, icon: Zap, color: '#7C3AED' },
                { label: 'Pages published',      val: userSites.reduce((s, _) => s + 1, 0), icon: Globe2, color: '#0EA5E9' },
                { label: 'Voice calls',          val: userVoice.length,   icon: Phone, color: '#F59E0B' },
              ].map(({ label, val, icon: Icon, color }) => (
                <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.02)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: `${color}14` }}>
                    <Icon size={13} strokeWidth={2} style={{ color }} />
                  </div>
                  <p className="text-[20px] font-black" style={{ color: '#0A0F1E' }}>{val}</p>
                  <p className="text-[10px]" style={{ color: '#94A3B8' }}>{label}</p>
                </div>
              ))}
            </div>

            {userConvos.length > 80 && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <AlertCircle size={13} style={{ color: '#F59E0B' }} />
                <p className="text-[11px] font-semibold" style={{ color: '#92400E' }}>
                  Approaching conversation limit — consider upselling to {user.planId === 'starter' ? 'Growth' : 'Business'}.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── SERVICES ── */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {/* Widgets */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#CBD5E1' }}>
                Widgets ({userWidgets.length})
              </p>
              {userWidgets.length === 0 ? (
                <p className="text-[12px] py-3 text-center" style={{ color: '#CBD5E1' }}>No widgets</p>
              ) : userWidgets.map(w => (
                <div key={w.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1.5"
                  style={{ background: 'rgba(91,95,255,0.04)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: w.active !== false ? '#5B5FFF' : '#CBD5E1' }} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold truncate" style={{ color: '#374151' }}>{w.businessName || w.siteName}</p>
                    <p className="text-[10px]" style={{ color: '#94A3B8' }}>{w.site || '—'} · {w.botName}</p>
                  </div>
                  <span className="text-[9px] font-bold ml-auto flex-shrink-0 px-1.5 py-0.5 rounded-full"
                    style={{ background: w.active !== false ? 'rgba(91,95,255,0.1)' : 'rgba(0,0,0,0.05)', color: w.active !== false ? '#5B5FFF' : '#94A3B8' }}>
                    {w.active !== false ? 'Live' : 'Off'}
                  </span>
                </div>
              ))}
            </div>

            {/* Sites */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#CBD5E1' }}>
                Websites ({userSites.length})
              </p>
              {userSites.length === 0 ? (
                <p className="text-[12px] py-3 text-center" style={{ color: '#CBD5E1' }}>No websites</p>
              ) : userSites.map(s => (
                <div key={s.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1.5"
                  style={{ background: 'rgba(124,58,237,0.04)' }}>
                  <Globe2 size={11} style={{ color: '#7C3AED' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold truncate" style={{ color: '#374151' }}>{s.name || s.domain}</p>
                    <p className="text-[10px]" style={{ color: '#94A3B8' }}>{s.domain}</p>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: s.status === 'live' ? 'rgba(91,95,255,0.1)' : 'rgba(0,0,0,0.05)', color: s.status === 'live' ? '#5B5FFF' : '#94A3B8' }}>
                    {s.status || 'draft'}
                  </span>
                </div>
              ))}
            </div>

            {/* Voice */}
            {userVoice.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#CBD5E1' }}>Voice</p>
                {userVoice.map(v => (
                  <div key={v.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1.5"
                    style={{ background: 'rgba(245,158,11,0.04)' }}>
                    <Phone size={11} style={{ color: '#F59E0B' }} />
                    <p className="text-[12px] font-semibold" style={{ color: '#374151' }}>{v.phoneNumber || 'Configured'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BILLING ── */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            {/* Current plan */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.12)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#94A3B8' }}>Current plan</p>
                <button onClick={() => setEditPlan(e => !e)} className="text-[10px] font-bold" style={{ color: '#5B5FFF' }}>
                  {editPlan ? 'Cancel' : 'Change'}
                </button>
              </div>

              {editPlan ? (
                <div className="space-y-2">
                  {PLANS.map(p => (
                    <button key={p} onClick={() => setPlan(p)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[12px] font-semibold capitalize"
                      style={{
                        background: plan === p ? 'rgba(91,95,255,0.12)' : 'rgba(0,0,0,0.03)',
                        border: plan === p ? '1.5px solid rgba(91,95,255,0.3)' : '1.5px solid transparent',
                        color: plan === p ? '#5B5FFF' : '#374151',
                      }}>
                      <span>{p}</span>
                      <span className="font-black">€{PLAN_PRICE[p]}/mo</span>
                    </button>
                  ))}
                  <button onClick={savePlan} disabled={saving}
                    className="w-full py-2.5 rounded-xl text-[12px] font-black text-white mt-1"
                    style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving…' : 'Save plan change'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[18px] font-black capitalize" style={{ color: '#0A0F1E' }}>{user.planId || 'Starter'}</span>
                    <span className="text-[22px] font-black" style={{ color: '#5B5FFF' }}>€{price}<span className="text-[12px] font-normal" style={{ color: '#94A3B8' }}>/mo</span></span>
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>
                    Billed monthly · Est. ARR: €{price * 12}
                  </p>
                </>
              )}
            </div>

            {/* What's included */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#CBD5E1' }}>Plan includes</p>
              {[
                { label: `${limits.sites} website${limits.sites > 1 ? 's' : ''} hosted`, icon: Globe2 },
                { label: `${limits.widgets} AI widget${limits.widgets > 1 ? 's' : ''}`, icon: MessageSquare },
                { label: `${limits.conversations.toLocaleString()} conversations/mo`, icon: Zap },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 py-1.5">
                  <Check size={11} strokeWidth={3} style={{ color: '#5B5FFF' }} />
                  <span className="text-[12px]" style={{ color: '#374151' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Revenue summary */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.02)' }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: '#CBD5E1' }}>Revenue</p>
              {[
                { label: 'Monthly', val: `€${price}` },
                { label: 'Annual (est.)', val: `€${price * 12}` },
                { label: 'Joined', val: fmtDate(user.createdAt) },
                { label: 'Next invoice', val: (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); d.setDate(1); return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' }); })() },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-1">
                  <span className="text-[11px]" style={{ color: '#94A3B8' }}>{label}</span>
                  <span className="text-[12px] font-bold" style={{ color: '#374151' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [allWidgets, setWidgets] = useState([]);
  const [allSites, setSites]     = useState([]);
  const [allVoice, setVoice]     = useState([]);
  const [allConvos, setConvos]   = useState([]);
  const [loading, setLoading]    = useState(true);
  const [search, setSearch]      = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected]  = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [companiesSnap, widgetsSnap, sitesSnap, voiceSnap, convosSnap] = await Promise.all([
          getDocs(collection(firestore, 'companies')),
          getDocs(collection(firestore, 'widgets')),
          getDocs(collection(firestore, 'websites')),
          getDocs(collection(firestore, 'voice_configs')),
          getDocs(collection(firestore, 'widget_conversations')),
        ]);

        let userDocs = companiesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (userDocs.length === 0) {
          userDocs = [
            { id: '1', name: "Lauren O'Reilly", ownerId: 'NHK2XlH09NOgtEBlPGUZjOPeNmF2', email: 'laurenoreilly7@gmail.com', industry: 'Health & Wellness', planId: 'starter', status: 'active', createdAt: null },
            { id: '2', name: 'Wellness Script', ownerId: 'NHK2XlH09NOgtEBlPGUZjOPeNmF2', email: 'hello@thewellnessscript.com', industry: 'Media & Podcast', planId: 'starter', status: 'active', createdAt: null },
          ];
        }
        setUsers(userDocs.sort((a, b) => {
          const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return tb - ta;
        }));

        const wDocs = widgetsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setWidgets(wDocs.length > 0 ? wDocs : [
          { id: 'w1', userId: 'NHK2XlH09NOgtEBlPGUZjOPeNmF2', businessName: "Lauren O'Reilly", botName: 'Freemi', site: 'itslaurenoreilly.web.app', active: true },
          { id: 'w2', userId: 'NHK2XlH09NOgtEBlPGUZjOPeNmF2', businessName: 'Wellness Script', botName: 'WS Concierge', site: 'wellness-cript.web.app', active: true },
        ]);

        const sDocs = sitesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSites(sDocs.length > 0 ? sDocs : [
          { id: 's1', userId: 'NHK2XlH09NOgtEBlPGUZjOPeNmF2', name: "Lauren O'Reilly", domain: 'itslaurenoreilly.web.app', status: 'live' },
          { id: 's2', userId: 'NHK2XlH09NOgtEBlPGUZjOPeNmF2', name: 'Wellness Script', domain: 'wellness-cript.web.app', status: 'live' },
        ]);

        setVoice(voiceSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setConvos(convosSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('[AdminUsers]', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpdate = (updated) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setSelected(updated);
  };

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = !s || u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.industry?.toLowerCase().includes(s);
    const matchPlan   = filterPlan === 'all'   || u.planId === filterPlan;
    const matchStatus = filterStatus === 'all' || (u.status || 'active') === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalMrr = users.reduce((s, u) => s + (PLAN_PRICE[u.planId] || 22), 0);

  return (
    <div className="flex h-full overflow-hidden">

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-7">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Users</h1>
              <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>
                {users.length} accounts · <span className="font-bold" style={{ color: '#5B5FFF' }}>€{totalMrr}/mo MRR</span>
              </p>
            </div>
          </div>

          {/* MRR mini-breakdown */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {PLANS.map(p => {
              const count = users.filter(u => (u.planId || 'starter') === p).length;
              return (
                <div key={p} className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.08)' }}>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider capitalize" style={{ color: '#94A3B8' }}>{p}</p>
                    <p className="text-[15px] font-black" style={{ color: '#0A0F1E' }}>{count} <span className="text-[11px] font-normal" style={{ color: '#94A3B8' }}>users</span></p>
                  </div>
                  <p className="text-[13px] font-black" style={{ color: '#5B5FFF' }}>€{count * PLAN_PRICE[p]}</p>
                </div>
              );
            })}
          </div>

          {/* Search + filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex-1 min-w-48 relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#CBD5E1' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, industry…"
                className="w-full pl-8 pr-3 py-2 rounded-xl text-[12px] outline-none"
                style={{ background: '#fff', border: '1px solid rgba(91,95,255,0.1)', color: '#374151' }} />
            </div>
            <div className="flex gap-1.5">
              {['all', ...PLANS].map(p => (
                <button key={p} onClick={() => setFilterPlan(p)}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all"
                  style={{ background: filterPlan === p ? 'rgba(91,95,255,0.1)' : '#fff', color: filterPlan === p ? '#5B5FFF' : '#94A3B8', border: filterPlan === p ? '1px solid rgba(91,95,255,0.2)' : '1px solid rgba(0,0,0,0.06)' }}>
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {['all', 'active', 'suspended'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all"
                  style={{ background: filterStatus === s ? 'rgba(91,95,255,0.1)' : '#fff', color: filterStatus === s ? '#5B5FFF' : '#94A3B8', border: filterStatus === s ? '1px solid rgba(91,95,255,0.2)' : '1px solid rgba(0,0,0,0.06)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-2.5">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: 'rgba(91,95,255,0.04)' }} />)}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(91,95,255,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              {/* Header */}
              <div className="grid px-5 py-2.5" style={{ gridTemplateColumns: '2fr 80px 60px 60px 70px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.015)' }}>
                {['User', 'Plan', 'W', 'S', 'Status', ''].map(h => (
                  <span key={h} className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#CBD5E1' }}>{h}</span>
                ))}
              </div>

              {filtered.length === 0 ? (
                <p className="text-center text-[12px] py-10" style={{ color: '#CBD5E1' }}>No users match filters</p>
              ) : filtered.map((user, i) => {
                const isSelected = selected?.id === user.id;
                const statusMeta = STATUS_META[user.status || 'active'];
                const wCount = allWidgets.filter(w => w.userId === user.ownerId).length;
                const sCount = allSites.filter(s => s.userId === user.ownerId).length;
                const cCount = allConvos.filter(c => allWidgets.filter(w => w.userId === user.ownerId).some(w => w.id === c.widgetId)).length;
                const atLimit = cCount >= (PLAN_LIMITS[user.planId || 'starter'].conversations * 0.9);

                return (
                  <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    onClick={() => setSelected(isSelected ? null : user)}
                    className="grid items-center px-5 py-3 cursor-pointer transition-colors"
                    style={{ gridTemplateColumns: '2fr 80px 60px 60px 70px 24px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', background: isSelected ? 'rgba(91,95,255,0.04)' : 'transparent' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(91,95,255,0.02)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>

                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                        {(user.name || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[12px] font-bold truncate" style={{ color: '#0A0F1E' }}>{user.name || 'Unnamed'}</p>
                          {atLimit && <AlertCircle size={10} style={{ color: '#F59E0B', flexShrink: 0 }} />}
                        </div>
                        <p className="text-[10px] truncate" style={{ color: '#94A3B8' }}>{user.industry || user.email || timeAgo(user.createdAt)}</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold capitalize" style={{ color: '#5B5FFF' }}>
                      {user.planId || 'starter'}
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: wCount > 0 ? '#374151' : '#E2E8F0' }}>{wCount}</span>
                    <span className="text-[11px] font-semibold" style={{ color: sCount > 0 ? '#374151' : '#E2E8F0' }}>{sCount}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: statusMeta.bg, color: statusMeta.color }}>{statusMeta.label}</span>
                    <ChevronRight size={12} style={{ color: '#CBD5E1', transition: 'transform 150ms', transform: isSelected ? 'rotate(180deg)' : 'none' }} />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <UserPanel
            user={selected}
            allWidgets={allWidgets}
            allSites={allSites}
            allVoice={allVoice}
            allConvos={allConvos}
            onClose={() => setSelected(null)}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
