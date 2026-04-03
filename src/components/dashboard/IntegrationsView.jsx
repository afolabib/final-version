import { useState } from 'react';
import { Search, Check, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandLogo from '@/components/BrandLogo';

const cats = ['All', 'Communication', 'CRM', 'Payments', 'Productivity', 'Marketing', 'Analytics', 'Storage'];

const integrations = [
  { name: 'Slack', desc: 'Send messages and receive notifications directly from Slack', popular: true, color: '#E01E5A', cat: 'Communication' },
  { name: 'HubSpot', desc: 'Sync CRM data, leads, and workflows into your AI agents', popular: true, color: '#FF7A59', cat: 'CRM' },
  { name: 'Stripe', desc: 'Accept payments and manage recurring subscriptions', popular: true, color: '#635BFF', cat: 'Payments' },
  { name: 'Gmail', desc: 'Send emails with intelligent AI drafting', popular: true, color: '#EA4335', cat: 'Communication' },
  { name: 'Notion', desc: 'Project papers across your workflows', popular: true, color: '#000000', cat: 'Productivity' },
  { name: 'Salesforce', desc: 'Deep CRM integration to enterprise sales workflows', popular: true, color: '#00A1E0', cat: 'CRM' },
  { name: 'OpenAI', desc: 'Advanced language model and custom embeddings', popular: true, color: '#10A37F', cat: 'Analytics' },
  { name: 'WhatsApp', desc: 'WhatsApp messaging automation', popular: true, color: '#25D366', cat: 'Communication' },
  { name: 'Twilio', desc: 'SMS, voice, and WhatsApp automation', popular: true, color: '#F22F46', cat: 'Communication' },
  { name: 'Google Calendar', desc: 'Sync calendars and schedule meetings', popular: true, color: '#4285F4', cat: 'Productivity' },
  { name: 'Pipedrive', desc: 'Pipeline management and lead tracking', color: '#017737', cat: 'CRM' },
  { name: 'Zendesk', desc: 'Connect Zendesk CRM, Tickets, and Desk', color: '#03363D', cat: 'CRM' },
  { name: 'Discord', desc: 'Send and receive messages in Discord', color: '#5865F2', cat: 'Communication' },
  { name: 'Telegram', desc: 'Automate Telegram bots and messaging', color: '#0088CC', cat: 'Communication' },
  { name: 'PayPal', desc: 'Accept PayPal payments and manage transactions', color: '#003087', cat: 'Payments' },
  { name: 'Intercom', desc: 'Customer messaging and support', color: '#1F8DED', cat: 'Marketing' },
  { name: 'Airtable', desc: 'Connected bases and workflow automation', color: '#18BFFF', cat: 'Productivity' },
  { name: 'Zapier', desc: 'Connect apps and automate workflows', color: '#FF4A00', cat: 'Productivity' },
  { name: 'Shopify', desc: 'E-commerce integration and order management', color: '#96BF48', cat: 'Payments' },
  { name: 'WordPress', desc: 'WordPress CMS integration', color: '#21759B', cat: 'Storage' },
  { name: 'GitHub', desc: 'Code repositories and CI/CD', color: '#181717', cat: 'Analytics' },
  { name: 'Vercel', desc: 'Deploy and host web applications', color: '#000000', cat: 'Storage' },
  { name: 'Linear', desc: 'Project tracking and issue management', color: '#5E6AD2', cat: 'Productivity' },
  { name: 'Asana', desc: 'Team tasks and project management', color: '#F06A6A', cat: 'Productivity' },
  { name: 'Monday.com', desc: 'Work management platform', color: '#FF3D57', cat: 'Productivity' },
  { name: 'Jira', desc: 'Issue tracking and project management', color: '#0052CC', cat: 'Productivity' },
  { name: 'Figma', desc: 'Design collaboration and prototyping', color: '#F24E1E', cat: 'Storage' },
  { name: 'Canva', desc: 'Design graphics and visual content', color: '#00C4CC', cat: 'Storage' },
];

export default function IntegrationsView() {
  const [search, setSearch] = useState('');
  const [category, setCat] = useState('All');
  const [connected, setConnected] = useState({});

  const handleConnect = (name) => {
    setConnected(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const filtered = integrations.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
                        i.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || i.cat === category;
    return matchSearch && matchCat;
  });

  const connectedCount = Object.values(connected).filter(Boolean).length;

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F7FF 45%, #FAFCFF 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 flex-shrink-0">
        <div>
          <h1 className="heading-serif text-3xl font-bold" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>Integrations</h1>
          <p className="text-sm mt-1 font-medium" style={{ color: '#64748B' }}>
            {connectedCount} connected · {integrations.length} available
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(91,95,255,0.12)' }}>
          <Search size={13} style={{ color: '#94A3B8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search integrations…"
            className="text-sm outline-none bg-transparent w-48 font-medium"
            style={{ color: '#0A0A1A' }}
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="px-8 pb-4 flex-shrink-0">
        <div className="flex gap-2 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: category === c ? 'linear-gradient(135deg,#5B5FFF,#6B63FF)' : 'rgba(255,255,255,0.85)',
                color: category === c ? '#fff' : '#64748B',
                border: category === c ? 'none' : '1px solid rgba(91,95,255,0.1)',
                boxShadow: category === c ? '0 2px 8px rgba(91,95,255,0.25)' : 'none',
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item, i) => {
            const isConnected = !!connected[item.name];
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                className="rounded-2xl p-4 group card-hover"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(12px)',
                  border: isConnected ? '1.5px solid rgba(16,185,129,0.25)' : '1px solid rgba(0,0,0,0.07)',
                  boxShadow: isConnected ? '0 4px 20px rgba(16,185,129,0.06)' : '0 4px 20px rgba(91,95,255,0.04)',
                }}>
                <div className="flex items-start gap-3">
                  {/* Brand logo */}
                  <BrandLogo name={item.name} fallbackColor={item.color} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm" style={{ color: '#0A0A1A' }}>{item.name}</h3>
                      {item.popular && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>Popular</span>
                      )}
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: '#94A3B8' }}>{item.desc}</p>
                  </div>
                </div>

                {isConnected ? (
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: '#00B894' }}>
                    <Check size={11} strokeWidth={2.5} /> Connected
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(item.name)}
                    className="mt-3 w-full py-1.5 text-xs font-semibold rounded-xl transition-all"
                    style={{
                      color: '#5B5FFF',
                      border: '1.5px solid rgba(91,95,255,0.2)',
                      background: 'rgba(91,95,255,0.03)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(91,95,255,0.35)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(91,95,255,0.2)'; }}>
                    Connect
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
