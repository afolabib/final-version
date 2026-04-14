import { motion } from 'framer-motion';
import { User, Bell, Key, Globe, Trash2, CreditCard, Shield, Download } from 'lucide-react';
import ClipsGlassCard from '../shared/ClipsGlassCard';
import ClipsGradientText from '../shared/ClipsGradientText';

const SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile', desc: 'Name, email, avatar' },
      { icon: Bell, label: 'Notifications', desc: 'Email & push preferences' },
      { icon: Key, label: 'API Keys', desc: 'Access tokens for integrations' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Globe, label: 'Language', desc: 'Default caption language', value: 'English' },
      { icon: Download, label: 'Export Quality', desc: 'Default export resolution', value: '1080p' },
      { icon: Shield, label: 'Watermark', desc: 'Show FreemiClips watermark', value: 'Off' },
    ],
  },
  {
    title: 'Billing',
    items: [
      { icon: CreditCard, label: 'Subscription', desc: 'Pro plan - $19/mo', action: 'Manage' },
      { icon: CreditCard, label: 'Payment Method', desc: 'Visa ending 4242', action: 'Update' },
    ],
  },
];

export default function ClipsSettingsView() {
  return (
    <div className="p-6 md:p-8 max-w-[800px] mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#0A0F1E' }}>
          <ClipsGradientText>Settings</ClipsGradientText>
        </h1>
        <p className="text-sm" style={{ color: '#64748B' }}>Manage your account and preferences</p>
      </motion.div>

      {SECTIONS.map((section, si) => (
        <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#64748B' }}>{section.title}</h2>
          <ClipsGlassCard className="divide-y divide-[rgba(91,95,255,0.06)]">
            {section.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(91,95,255,0.06)' }}>
                    <item.icon size={16} style={{ color: '#64748B' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#0A0F1E' }}>{item.label}</p>
                    <p className="text-[11px]" style={{ color: '#64748B' }}>{item.desc}</p>
                  </div>
                </div>
                {item.value && (
                  <span className="text-xs font-medium px-3 py-1 rounded-lg"
                    style={{ color: '#64748B', background: 'rgba(91,95,255,0.04)' }}>
                    {item.value}
                  </span>
                )}
                {item.action && (
                  <button className="text-xs font-semibold px-3 py-1 rounded-lg"
                    style={{ background: 'rgba(91,95,255,0.06)', color: '#5B5FFF' }}>
                    {item.action}
                  </button>
                )}
              </div>
            ))}
          </ClipsGlassCard>
        </motion.div>
      ))}

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="text-xs font-bold text-red-400/60 uppercase tracking-wider mb-3">Danger Zone</h2>
        <ClipsGlassCard className="px-5 py-4" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
                <Trash2 size={16} className="text-red-400/60" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#0A0F1E' }}>Delete Account</p>
                <p className="text-[11px]" style={{ color: '#64748B' }}>Permanently delete your data</p>
              </div>
            </div>
            <button className="text-xs font-semibold px-3 py-1 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.06)', color: '#EF4444' }}>
              Delete
            </button>
          </div>
        </ClipsGlassCard>
      </motion.div>
    </div>
  );
}
