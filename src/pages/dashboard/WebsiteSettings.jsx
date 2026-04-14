import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe2, Save, CheckCircle, Loader2, AlertCircle,
  ExternalLink, Palette, Link2, Mail, Phone, MapPin,
  Instagram, Youtube, MessageCircle, Zap, Settings,
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useWebsite } from '@/contexts/WebsiteContext';

function Field({ label, value, onChange, placeholder, type = 'text', mono = false }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 rounded-xl text-[13px] outline-none ${mono ? 'font-mono' : ''}`}
        style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
        onFocus={e => e.target.style.borderColor = 'rgba(5,150,105,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
      />
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.01)' }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(5,150,105,0.08)' }}>
          <Icon size={12} style={{ color: '#059669' }} />
        </div>
        <span className="text-[12px] font-black uppercase tracking-wider" style={{ color: '#94A3B8' }}>{title}</span>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export default function DashboardWebsiteSettings() {
  const { activeSite } = useWebsite();

  const [name, setName]           = useState('');
  const [domain, setDomain]       = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [address, setAddress]     = useState('');
  const [color, setColor]         = useState('#059669');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube]     = useState('');
  const [tiktok, setTiktok]       = useState('');
  const [spotify, setSpotify]     = useState('');
  const [linkedIn, setLinkedIn]   = useState('');

  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState(null);

  // Populate from activeSite
  useEffect(() => {
    if (!activeSite) return;
    setName(activeSite.name || '');
    setDomain(activeSite.domain || '');
    setColor(activeSite.primaryColor || '#059669');
    setEmail(activeSite.email || '');
    setPhone(activeSite.phone || '');
    setAddress(activeSite.address || '');
    setInstagram(activeSite.socials?.instagram || '');
    setYoutube(activeSite.socials?.youtube || '');
    setTiktok(activeSite.socials?.tiktok || '');
    setSpotify(activeSite.socials?.spotify || '');
    setLinkedIn(activeSite.socials?.linkedin || '');
  }, [activeSite?.id]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  const handleSave = async () => {
    if (!activeSite?.id) return;
    setSaving(true);
    setError(null);
    try {
      await setDoc(
        doc(firestore, 'websites', activeSite.id),
        {
          name, domain, primaryColor: color, email, phone, address,
          socials: { instagram, youtube, tiktok, spotify, linkedin: linkedIn },
        },
        { merge: true },
      );
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!activeSite) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: '#A7F3D0' }} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-7 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Site Settings</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] font-bold" style={{ color: '#059669' }}>{activeSite.domain}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeSite.domain && (
              <a
                href={`https://${activeSite.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all"
                style={{ background: 'rgba(5,150,105,0.06)', color: '#059669', border: '1px solid rgba(5,150,105,0.15)' }}>
                <ExternalLink size={12} /> View site
              </a>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all"
              style={{
                background: saved ? 'rgba(16,185,129,0.9)' : 'linear-gradient(135deg, #059669, #10B981)',
                boxShadow: saved ? 'none' : '0 4px 14px rgba(5,150,105,0.3)',
              }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <CheckCircle size={13} /> : <Save size={13} />}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* Status card */}
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
          style={{ background: 'white', border: '1px solid rgba(5,150,105,0.1)', boxShadow: '0 2px 8px rgba(5,150,105,0.04)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(5,150,105,0.08)' }}>
            <Globe2 size={18} strokeWidth={1.5} style={{ color: '#059669' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black truncate" style={{ color: '#0A0F1E' }}>{name || activeSite.name}</p>
            <p className="text-[11px] font-mono truncate" style={{ color: '#94A3B8' }}>{domain || activeSite.domain}</p>
          </div>
          <div className="flex gap-4 text-center flex-shrink-0">
            {[
              { label: 'PageSpeed', value: activeSite.pagespeed || '—' },
              { label: 'SEO', value: activeSite.seoScore || '—' },
              { label: 'Uptime', value: '99.9%' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[14px] font-black" style={{ color: '#059669' }}>{s.value}{typeof s.value === 'number' ? '' : ''}</p>
                <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: '#CBD5E1' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Site details */}
        <Section title="Site Details" icon={Settings}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Site name" value={name} onChange={setName} placeholder="e.g. Lauren O'Reilly" />
            <Field label="Domain" value={domain} onChange={setDomain} placeholder="yoursite.com" mono />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
              Brand colour
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0.5"
                style={{ background: 'none' }}
              />
              <input
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="#059669"
                className="flex-1 px-3 py-2.5 rounded-xl text-[13px] outline-none font-mono"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                onFocus={e => e.target.style.borderColor = 'rgba(5,150,105,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
              />
              <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: color }} />
            </div>
          </div>
        </Section>

        {/* Contact info */}
        <Section title="Contact Info" icon={Mail}>
          <Field label="Business email" value={email} onChange={setEmail} placeholder="hello@yoursite.com" type="email" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone" value={phone} onChange={setPhone} placeholder="+353 1 234 5678" />
            <Field label="Address / Location" value={address} onChange={setAddress} placeholder="Dublin, Ireland" />
          </div>
        </Section>

        {/* Social links */}
        <Section title="Social Links" icon={Link2}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
                <Instagram size={10} /> Instagram
              </label>
              <input value={instagram} onChange={e => setInstagram(e.target.value)}
                placeholder="@handle"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                onFocus={e => e.target.style.borderColor = 'rgba(5,150,105,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
                <Youtube size={10} /> YouTube
              </label>
              <input value={youtube} onChange={e => setYoutube(e.target.value)}
                placeholder="@channel"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                onFocus={e => e.target.style.borderColor = 'rgba(5,150,105,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
                <MessageCircle size={10} /> TikTok
              </label>
              <input value={tiktok} onChange={e => setTiktok(e.target.value)}
                placeholder="@handle"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                onFocus={e => e.target.style.borderColor = 'rgba(5,150,105,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
                <Zap size={10} /> Spotify
              </label>
              <input value={spotify} onChange={e => setSpotify(e.target.value)}
                placeholder="Show URL or handle"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                onFocus={e => e.target.style.borderColor = 'rgba(5,150,105,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
            </div>
          </div>
        </Section>

        {/* Request a change */}
        <div className="px-5 py-4 rounded-2xl"
          style={{ background: 'rgba(5,150,105,0.04)', border: '1px solid rgba(5,150,105,0.1)' }}>
          <div className="flex items-start gap-3">
            <CheckCircle size={14} strokeWidth={2} className="flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
            <div>
              <p className="text-[12px] font-bold" style={{ color: '#059669' }}>All changes reviewed by Freemi</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                Domain migrations, design changes, or structural updates? Save your settings above and our team will apply them to the live site.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-[12px]"
              style={{ background: 'rgba(239,68,68,0.07)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertCircle size={13} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
