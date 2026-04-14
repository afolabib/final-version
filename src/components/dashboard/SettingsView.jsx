import { useState, useEffect } from 'react';
import { User, Bot, Plug, Gift, Shield, Bell, Eye, EyeOff, Check, Settings, ExternalLink, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useProduct } from '@/contexts/ProductContext';
import { fireAgent, AGENT_STATUS } from '@/lib/agentService';

const ALL_TABS = [
  { id: 'general',       label: 'General',       icon: User,   products: ['operators', 'widget', 'website', 'voice'] },
  { id: 'agents',        label: 'Agents',         icon: Bot,    products: ['operators'] },
  { id: 'integrations',  label: 'Integrations',   icon: Plug,   products: ['operators', 'widget'] },
  { id: 'referrals',     label: 'Referrals',      icon: Gift,   products: ['operators', 'widget', 'website', 'voice'] },
  { id: 'security',      label: 'Security',       icon: Shield, products: ['operators', 'widget', 'website', 'voice'] },
  { id: 'notifications', label: 'Notifications',  icon: Bell,   products: ['operators', 'widget', 'website', 'voice'] },
];

const glassCard = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(91,95,255,0.08)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
};

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle}
      className="w-11 h-6 rounded-full transition-all flex-shrink-0 relative"
      style={{ background: on ? 'linear-gradient(135deg, #5B5FFF, #6B63FF)' : '#E5E7EB', boxShadow: on ? '0 2px 8px rgba(91,95,255,0.25)' : 'none' }}>
      <span className="absolute top-0.5 rounded-full w-5 h-5 bg-white transition-all"
        style={{ left: on ? '22px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </button>
  );
}

function InputField({ label, defaultValue, type = 'text' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#6B7280' }}>{label}</p>
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl input-focus-ring"
        style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(91,95,255,0.02)' }}>
        <input type={type === 'password' && !show ? 'password' : 'text'} defaultValue={defaultValue}
          className="flex-1 text-sm outline-none bg-transparent" style={{ color: '#1F2937' }} />
        {type === 'password' && (
          <button onClick={() => setShow(v => !v)} style={{ color: '#9CA3AF' }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function GeneralTab() {
  const { user } = useAuth();
  const { company } = useCompany();
  const name = user?.full_name || 'User';
  const email = user?.email || '';
  const initial = name[0]?.toUpperCase() || 'U';
  const orgName = company?.name || 'My Organization';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2 className="text-xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A' }}>Profile</h2>
      <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Your personal account information.</p>
      <div className="rounded-2xl p-6 mb-6" style={glassCard}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 4px 12px rgba(91,95,255,0.25)' }}>{initial}</div>
          <div>
           <p className="font-bold text-sm" style={{ color: '#0A0A1A' }}>{name}</p>
           <p className="text-xs" style={{ color: '#6B7280' }}>{email}</p>
          </div>
        </div>
        <InputField label="Display Name" defaultValue={name} />
        <InputField label="Email" defaultValue={email} />
        <div className="flex justify-end">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => toast.success('Profile updated.')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 4px 16px rgba(91,95,255,0.30)' }}>
            Save changes
          </motion.button>
        </div>
      </div>

      <h2 className="text-xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A' }}>Organization</h2>
      <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Your workspace and team settings.</p>
      <div className="rounded-2xl p-6 mb-6" style={glassCard}>
        <InputField label="Organization Name" defaultValue={orgName} />
        <div className="flex justify-end">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => toast.success('Organization settings saved.')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 4px 16px rgba(91,95,255,0.30)' }}>
            Save changes
          </motion.button>
        </div>
      </div>

      <h2 className="text-xl font-extrabold tracking-tight mb-1" style={{ color: '#DC2626' }}>Danger Zone</h2>
      <div className="rounded-2xl p-5 flex items-center justify-between" style={{ ...glassCard, border: '1px solid rgba(220,38,38,0.15)' }}>
        <div>
          <p className="text-sm font-bold" style={{ color: '#DC2626' }}>Delete Account</p>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Permanently delete your account and all data</p>
        </div>
        <button className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
          style={{ color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}
          onClick={() => { if (window.confirm('Are you sure? This will permanently delete your account and cannot be undone.')) toast.error('Account deletion — please contact support@freemi.ai to proceed.'); }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          Delete Account
        </button>
      </div>
    </motion.div>
  );
}

function SecurityTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2 className="text-xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A' }}>Change password</h2>
      <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Must be at least 10 characters.</p>
      <div className="rounded-2xl p-6 mb-6" style={glassCard}>
        <InputField label="Current Password" type="password" defaultValue="••••••••" />
        <InputField label="New Password" type="password" defaultValue="••••••••" />
        <InputField label="Confirm New Password" type="password" defaultValue="••••••••" />
        <button className="text-sm font-bold flex items-center gap-1" style={{ color: '#5B5FFF' }}
          onClick={() => toast.success('Password updated successfully.')}>🔒 Update password</button>
      </div>
      <h2 className="text-xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A' }}>Two-factor authentication</h2>
      <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Add an extra layer of security.</p>
      <div className="rounded-2xl p-5 flex items-center justify-between" style={glassCard}>
       <div>
         <p className="text-sm font-bold" style={{ color: '#0A0A1A' }}>Authenticator app</p>
         <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Use an authenticator app to generate one-time codes.</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>Coming soon</span>
      </div>
    </motion.div>
  );
}

function NotificationsTab() {
  const [settings, setSettings] = useState({ email: true, tasks: true, billing: true, marketing: false });
  const toggle = key => setSettings(p => ({ ...p, [key]: !p[key] }));
  const items = [
    { key: 'email', label: 'Email Notifications', desc: 'Receive email notifications for important updates' },
    { key: 'tasks', label: 'Task Alerts', desc: 'Get notified when your AI agents complete tasks' },
    { key: 'billing', label: 'Billing Alerts', desc: 'Receive notifications about billing and invoices' },
    { key: 'marketing', label: 'Marketing Emails', desc: 'Receive updates about new features and promotions' },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2 className="text-xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A' }}>Notifications</h2>
      <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Choose what you want to be notified about.</p>
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        {items.map((item, i) => (
          <div key={item.key} className="flex items-center justify-between px-6 py-5 transition-colors"
            style={{ borderBottom: i < items.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div>
              <p className="text-sm font-bold" style={{ color: '#0A0A1A' }}>{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{item.desc}</p>
            </div>
            <Toggle on={settings[item.key]} onToggle={() => toggle(item.key)} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ReferralsTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Earn 30% commission from every customer you refer.</p>
      <div className="rounded-2xl p-6 mb-6" style={glassCard}>
        <p className="text-base font-extrabold mb-1" style={{ color: '#0A0A1A' }}>Partner Program</p>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: '#6B7280' }}>Sign up or sign in to your affiliate dashboard to track referrals and earnings.</p>
        <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href="#"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 4px 16px rgba(91,95,255,0.30)' }}>
          Open Partner Dashboard ↗
        </motion.a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { step: 'STEP 1', title: 'Share your link', desc: 'Get your unique link from the partner dashboard.' },
          { step: 'STEP 2', title: 'They sign up', desc: 'Your referral creates an account and subscribes.' },
          { step: 'STEP 3', title: 'Earn 30%', desc: 'You earn 30% commission on every sale.' },
        ].map((s, i) => (
          <motion.div key={s.step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
            className="rounded-2xl p-5 card-lift" style={glassCard}>
            <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#5B5FFF' }}>{s.step}</p>
            <p className="text-sm font-extrabold mb-1" style={{ color: '#0A0A1A' }}>{s.title}</p>
            <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

const connectedApps = [
  { emoji: '💬', name: 'Slack', sub: 'Team messaging', connected: true },
  { emoji: '🐙', name: 'GitHub', sub: 'Code & repos', connected: false },
  { emoji: '📝', name: 'Notion', sub: 'Docs & wikis', connected: true },
  { emoji: '◆', name: 'Linear', sub: 'Issue tracking', connected: false },
  { emoji: '♦', name: 'Jira', sub: 'Project management', connected: false },
  { emoji: '📊', name: 'Google Sheets', sub: 'Spreadsheets', connected: true },
  { emoji: '🧡', name: 'HubSpot', sub: 'CRM & marketing', connected: true },
  { emoji: '☁', name: 'Salesforce', sub: 'CRM & sales', connected: false },
  { emoji: '💳', name: 'Stripe', sub: 'Payments & billing', connected: false },
];

function SettingsIntegrationsTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2 className="text-xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A' }}>Connected Apps</h2>
      <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Account-level connections inherited by all agents.</p>
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5 text-xs font-medium"
        style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF', border: '1px solid rgba(91,95,255,0.15)' }}>
        ℹ️ Agent-specific connections always take priority over account defaults.
      </div>
      <div className="rounded-2xl overflow-hidden mb-8" style={glassCard}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
         {connectedApps.map((app, i) => (
           <div key={app.name} className="flex flex-col items-center py-6 px-4 gap-2 transition-colors"
             style={{ borderRight: (i + 1) % 3 !== 0 ? '1px solid rgba(0,0,0,0.06)' : 'none', borderBottom: i < connectedApps.length - 3 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
             onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.04)'}
             onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
             <div className="text-3xl mb-1">{app.emoji}</div>
             <p className="text-sm font-bold" style={{ color: '#0A0A1A' }}>{app.name}</p>
             <p className="text-xs" style={{ color: '#6B7280' }}>{app.sub}</p>
              {app.connected ? (
                <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
                  <Check size={10} strokeWidth={2.5} /> Connected
                </span>
              ) : (
                <button className="text-xs font-bold px-4 py-1.5 rounded-full transition-all"
                  style={{ border: '1.5px solid rgba(91,95,255,0.2)', color: '#5B5FFF' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#5B5FFF'; e.currentTarget.style.background = 'rgba(91,95,255,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(91,95,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}>
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <h2 className="text-xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A' }}>API Keys</h2>
      <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Keys shared across all agents.</p>
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        {[{ emoji: '♦', name: 'OpenAI' }, { emoji: '🟢', name: 'Anthropic' }, { emoji: '🔲', name: 'Replicate' }].map((k, i) => (
          <div key={k.name} className="flex items-center justify-between px-6 py-4 transition-colors"
            style={{ borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{k.emoji}</span>
              <span className="text-sm font-bold" style={{ color: '#0A0A1A' }}>{k.name}</span>
            </div>
            <button className="text-xs font-bold px-4 py-1.5 rounded-full transition-all"
              style={{ border: '1.5px solid rgba(91,95,255,0.2)', color: '#5B5FFF' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#5B5FFF'; e.currentTarget.style.background = 'rgba(91,95,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(91,95,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}>
              Add key
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AgentsTab() {
  const navigate = useNavigate();
  const { agents, activeCompanyId } = useCompany();
  const { user } = useAuth();
  const loading = false;

  const handleTerminateAll = async () => {
    if (!confirm('Terminate all non-CEO agents? This cannot be undone.')) return;
    for (const agent of agents) {
      if (!agent.isCEO) {
        await fireAgent(activeCompanyId, user?.uid || 'user', agent.id, 'Bulk terminate from Settings');
      }
    }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: '#0A0A1A' }}>Agents</h2>
      <p className="text-base mb-8" style={{ color: '#374151' }}>Manage your deployed AI agents.</p>
      
      <div className="mb-8">
        <h3 className="text-base font-bold mb-2" style={{ color: '#0A0A1A' }}>Agents</h3>
        <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Each agent has its own configuration, API keys, and integrations.</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/agents')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white mb-6"
          style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 4px 16px rgba(91,95,255,0.30)' }}>
          + New Agent
        </motion.button>
        {loading ? (
          <div className="p-8 text-center" style={{ color: '#6B7280' }}>Loading agents...</div>
        ) : agents.length === 0 ? (
          <div className="p-8 text-center" style={{ color: '#6B7280' }}>No agents deployed yet. Create one to get started.</div>
        ) : (
         <div className="space-y-3">
           {agents.map((agent, i) => (
             <div key={i} className="flex items-center justify-between p-5 rounded-2xl"
               style={{ background: 'rgba(91,95,255,0.02)', border: '1px solid rgba(91,95,255,0.1)' }}
               onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.05)'}
               onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.02)'}>
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                   style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)' }}>{agent.name[0]}</div>
                 <div>
                   <p className="text-sm font-bold" style={{ color: '#0A0A1A' }}>{agent.name}</p>
                   <div className="flex items-center gap-2 mt-1">
                     <p className="text-xs" style={{ color: '#6B7280' }}>{agent.model}</p>
                     <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(91,95,255,0.12)', color: '#5B5FFF' }}>{agent.status}</span>
                   </div>
                   <p className="text-xs" style={{ color: '#6B7280' }}>{agent.tier}</p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                   onClick={() => navigate('/dashboard/agents')}
                   style={{ color: '#6B7280', background: 'rgba(91,95,255,0.04)' }}
                   onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.08)'; e.currentTarget.style.color = '#0A0A1A'; }}
                   onMouseLeave={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.04)'; e.currentTarget.style.color = '#6B7280'; }}>
                   <Settings size={14} /> Configure
                 </button>
                 <button className="flex items-center justify-center w-8 h-8 rounded-lg transition-all" style={{ color: '#6B7280' }}
                   onClick={() => toast.info('Agent public URL not configured yet.')}
                   onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.08)'; e.currentTarget.style.color = '#0A0A1A'; }}
                   onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}>
                   <ExternalLink size={14} />
                 </button>
               </div>
             </div>
           ))}
         </div>
        )}
        </div>

      <h2 className="text-base font-bold mb-3" style={{ color: '#DC2626' }}>Danger Zone</h2>
      <div className="p-5 rounded-2xl flex items-center justify-between" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} style={{ color: '#DC2626', marginTop: '2px' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: '#DC2626' }}>Terminate All Agents</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Permanently delete all AI agents and their data</p>
          </div>
        </div>
        <motion.button onClick={handleTerminateAll} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="px-6 py-2 rounded-lg text-sm font-bold transition-all"
          style={{ color: '#DC2626', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.05)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.05)'; }}>
          Delete All
        </motion.button>
      </div>
    </motion.div>
  );
}


export default function SettingsView() {
  const [tab, setTab] = useState('general');
  const { user } = useAuth();
  const { activeProduct } = useProduct();

  // Filter tabs based on active product
  const settingsTabs = ALL_TABS.filter(t => t.products.includes(activeProduct || 'widget'));

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>
      {/* Mobile tabs - horizontal scroll */}
      <div className="md:hidden flex-shrink-0 overflow-x-auto px-3 py-3 flex gap-1" style={{ borderBottom: '1px solid rgba(91,95,255,0.08)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitOverflowScrolling: 'touch' }}>
        {settingsTabs.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
              style={{
                background: isActive ? 'rgba(91,95,255,0.08)' : 'transparent',
                color: isActive ? '#5B5FFF' : '#6B7280',
              }}>
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-52 flex-shrink-0 py-5 px-3" style={{ borderRight: '1px solid rgba(91,95,255,0.08)', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)' }}>
        <div className="px-3 pb-3 mb-1">
          <h2 className="heading-serif text-lg font-bold" style={{ color: '#0A0F1E' }}>Settings</h2>
        </div>
        {settingsTabs.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all mb-0.5 text-left nav-pill"
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(91,95,255,0.10), rgba(99,102,241,0.07))' : 'transparent',
                color: isActive ? '#5B5FFF' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                borderLeft: isActive ? '2px solid rgba(91,95,255,0.40)' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(91,95,255,0.05)'; e.currentTarget.style.color = '#5B5FFF'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; } }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: isActive ? 'rgba(91,95,255,0.12)' : 'transparent' }}>
                <Icon size={13} />
              </div>
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-8" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>
        {tab === 'general' && <GeneralTab />}
        {tab === 'security' && <SecurityTab />}
        {tab === 'notifications' && <NotificationsTab />}
        {tab === 'agents' && <AgentsTab />}
        {tab === 'integrations' && <SettingsIntegrationsTab />}
        {tab === 'referrals' && <ReferralsTab />}
      </div>
    </div>
  );
}