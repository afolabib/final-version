import { useState } from 'react';
import { Search, Check, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const cats = ['All', 'Communication', 'CRM', 'Payments', 'Productivity', 'Marketing', 'Analytics', 'Storage'];

const integrations = [
  { name: 'Slack', desc: 'Send messages and receive notifications directly from Slack', popular: true, color: '#E01E5A' },
  { name: 'HubSpot', desc: 'Sync CRM data, leads, and workflows into your AI agents', popular: true, color: '#FF7A59' },
  { name: 'Stripe', desc: 'Accept payments and manage recurring subscriptions', popular: true, color: '#635BFF' },
  { name: 'Gmail', desc: 'Send emails with intelligent AI drafting', popular: true, color: '#EA4335' },
  { name: 'Notion', desc: 'Project papers across your workflows', popular: true, color: '#000000' },
  { name: 'Salesforce', desc: 'Deep CRM integration to enterprise sales workflows', popular: true, color: '#00A1E0' },
  { name: 'OpenAI', desc: 'Advanced language model and custom embeddings', popular: true, color: '#10A37F' },
  { name: 'WhatsApp', desc: 'WhatsApp messaging automation', popular: true, color: '#25D366' },
  { name: 'Twilio', desc: 'SMS, voice, and WhatsApp automation', popular: true, color: '#F22F46' },
  { name: 'Google Calendar', desc: 'Sync calendars and schedule meetings', popular: true, color: '#4285F4' },
  { name: 'Pipedrive', desc: 'Pipeline management and lead tracking', color: '#017737' },
  { name: 'Zendesk', desc: 'Connect Zendesk CRM, Tickets, and Desk', color: '#03363D' },
  { name: 'Discord', desc: 'Send and receive messages in Discord', color: '#5865F2' },
  { name: 'Telegram', desc: 'Automate Telegram bots and messaging', color: '#0088CC' },
  { name: 'PayPal', desc: 'Accept PayPal payments and manage transactions', color: '#003087' },
  { name: 'Intercom', desc: 'Customer messaging and support', color: '#1F8DED' },
  { name: 'Airtable', desc: 'Connected bases and workflow automation', color: '#18BFFF' },
  { name: 'Zapier', desc: 'Connect apps and automate workflows', color: '#FF4A00' },
  { name: 'Shopify', desc: 'E-commerce integration and order management', color: '#96BF48' },
  { name: 'WordPress', desc: 'WordPress CMS integration', color: '#21759B' },
  { name: 'GitHub', desc: 'Code repositories and CI/CD', color: '#181717' },
  { name: 'Vercel', desc: 'Deploy and host web applications', color: '#000000' },
  { name: 'Linear', desc: 'Project tracking and issue management', color: '#5E6AD2' },
  { name: 'Asana', desc: 'Team tasks and project management', color: '#F06A6A' },
  { name: 'Monday.com', desc: 'Work management platform', color: '#FF3D57' },
  { name: 'Jira', desc: 'Issue tracking and project management', color: '#0052CC' },
  { name: 'Figma', desc: 'Design collaboration and prototyping', color: '#F24E1E' },
  { name: 'Canva', desc: 'Design graphics and visual content', color: '#00C4CC' },
];

export default function IntegrationsView() {
  const [search, setSearch] = useState('');
  const [category, setCat] = useState('All');
  const [connected, setConnected] = useState({});
  const [loading, setLoading] = useState(false);

  const handleConnect = (name) => {
    setConnected(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const filtered = integrations.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
                        i.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || 
      (category === 'Communication' && ['Slack', 'Discord', 'Telegram', 'WhatsApp', 'Twilio'].includes(i.name)) ||
      (category === 'CRM' && ['HubSpot', 'Salesforce', 'Pipedrive', 'Zendesk'].includes(i.name)) ||
      (category === 'Payments' && ['Stripe', 'PayPal', 'Shopify'].includes(i.name)) ||
      (category === 'Productivity' && ['Notion', 'Linear', 'Asana', 'Monday.com', 'Jira', 'Airtable'].includes(i.name)) ||
      (category === 'Marketing' && ['Intercom'].includes(i.name)) ||
      (category === 'Analytics' && ['GitHub'].includes(i.name)) ||
      (category === 'Storage' && ['Vercel', 'WordPress', 'Figma', 'Canva'].includes(i.name));
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Integrations</h1>
        <p className="text-gray-600">Connect your AI agent to your favorite tools</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search integrations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === c ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${item.popular ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'} hover:shadow-md transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: item.color }}>
                  {item.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.popular && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">Popular</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.desc}</p>
                </div>
              </div>
              {connected[item.name] ? (
                <div className="mt-3 flex items-center gap-1 text-xs" style={{ color: '#22C55E' }}>
                  <Check size={12} /> Connected
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(item.name)}
                  className="mt-3 w-full py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Connect
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
