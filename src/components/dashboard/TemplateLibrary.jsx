import { useState } from 'react';
import { X, Search, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = ['All', 'Sales', 'Email', 'Support', 'Research', 'Scheduling', 'Social', 'Operations', 'Recurring'];

const tagColors = {
  Gmail: { bg: '#FEE2E2', color: '#EF4444' },
  WhatsApp: { bg: '#D1FAE5', color: '#10B981' },
  HubSpot: { bg: '#FEF3C7', color: '#F59E0B' },
  'Google Sheets': { bg: '#DBEAFE', color: '#3B82F6' },
  Slack: { bg: '#EDE9FE', color: '#8B5CF6' },
  Browser: { bg: '#F3F4F6', color: '#6B7280' },
  'Google Calendar': { bg: '#DBEAFE', color: '#3B82F6' },
  Notion: { bg: '#F3F4F6', color: '#374151' },
};

const templates = [
  { name: 'Inbound Lead Qualifier', desc: 'Scores inbound leads, researches them, responds personally, and logs to CRM.', tags: ['Gmail', 'WhatsApp', 'HubSpot', 'Google Sheets', 'Slack', 'Browser'], details: 'When a new lead comes in via email or WhatsApp: 1. Read their message and extract: name, company, role, what they need 2. Use browser to research their company (website, LinkedIn) 3. Score 1-5 based on: company size (bigger = higher), urgency, fit with our product 4. Create a contact in HubSpot with: name, email, company, score, source, notes 5. If score 4-5: respond within 2 min with personalized message offering a call, and send me a Slack alert 6. If score 2-3: respond with a helpful resource, set a follow-up task for 48 hours 7. If score 1: send polite template response 8. Log everything in the "Lead Tracker" Google Sheet as backup' },
  { name: 'Lead Follow-Up Machine', desc: "Follows up with leads who haven't responded on day 1, 3, 7, and 14.", tags: ['Gmail', 'HubSpot', 'Google Sheets'], extras: 1 },
  { name: 'Meeting Prep Brief', desc: 'Researches prospects before every sales call and sends you a brief.', tags: ['Google Calendar', 'HubSpot', 'Browser'], extras: 1 },
  { name: 'Cold Outreach Engine', desc: 'Researches each prospect individually, writes personalized cold emails.', tags: ['Google Sheets', 'Browser', 'Gmail'], extras: 2 },
  { name: 'Competitor Monitor', desc: 'Weekly scan of competitor sites for pricing, feature, or messaging changes.', tags: ['Browser', 'Google Sheets', 'Slack'], extras: 1 },
  { name: 'Email Inbox Manager', desc: 'Categorizes every email, drafts sales responses, flags urgent items.', tags: ['Gmail', 'HubSpot', 'Slack'], extras: 1 },
  { name: 'Smart Auto-Responder', desc: 'Automatically replies to common inquiries with personalized responses.', tags: ['Gmail', 'Slack'] },
  { name: '24/7 Support Agent', desc: 'Answers customers on all channels around the clock.', tags: ['Gmail', 'WhatsApp', 'Slack'] },
];

function Tag({ name }) {
  const style = tagColors[name] || { bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: style.bg, color: style.color }}>
      {name}
    </span>
  );
}

function TemplateDetail({ template, onBack, onClose }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F0F1FF' }}>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 rounded-lg hover:bg-gray-100" style={{ color: '#9CA3AF' }}><X size={14} /></button>
          <h2 className="text-base font-extrabold" style={{ color: '#0A0A1A' }}>{template.name}</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: '#9CA3AF' }}><X size={16} /></button>
      </div>
      <div className="px-6 py-5 flex-1 overflow-y-auto">
        <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>{template.desc}</p>
        <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF' }}>Integrations used</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {template.tags.map(t => <Tag key={t} name={t} />)}
        </div>
        <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF' }}>What it does</p>
        <div className="rounded-2xl p-4 text-sm leading-relaxed" style={{ background: '#F4F5FC', color: '#374151' }}>
          {template.details}
        </div>
      </div>
      <div className="px-6 py-4" style={{ borderTop: '1px solid #F0F1FF' }}>
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white"
          style={{ background: '#0A0A1A' }}>
          <Play size={14} /> Use this template
        </button>
      </div>
    </div>
  );
}

export default function TemplateLibrary({ onClose }) {
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = templates.filter(t =>
    (cat === 'All' || true) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(10,10,26,0.4)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl mx-4 rounded-3xl overflow-hidden flex flex-col"
        style={{ background: '#fff', boxShadow: '0 32px 80px rgba(74,108,247,0.18)', maxHeight: '85vh' }}
      >
        {selected ? (
          <TemplateDetail template={selected} onBack={() => setSelected(null)} onClose={onClose} />
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #F0F1FF' }}>
              <h2 className="text-xl font-extrabold" style={{ color: '#0A0A1A' }}>Template Library</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: '#9CA3AF' }}><X size={16} /></button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-40 flex-shrink-0 py-3 px-2" style={{ borderRight: '1px solid #F0F1FF' }}>
                {categories.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all mb-0.5"
                    style={{ background: cat === c ? 'rgba(74,108,247,0.08)' : 'transparent', color: cat === c ? '#4A6CF7' : '#6B7280' }}>
                    {c}
                  </button>
                ))}
              </div>
              {/* Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #F0F1FF' }}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#F4F5FC' }}>
                    <Search size={13} style={{ color: '#C5C9E0' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..."
                      className="flex-1 text-sm outline-none bg-transparent font-medium" style={{ color: '#374151' }} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {filtered.map(t => (
                      <button key={t.name} onClick={() => setSelected(t)}
                        className="text-left rounded-2xl p-4 transition-all"
                        style={{ border: '1.5px solid #E8EAFF', background: '#fff' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#4A6CF7'; e.currentTarget.style.background = 'rgba(74,108,247,0.02)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8EAFF'; e.currentTarget.style.background = '#fff'; }}>
                        <p className="text-sm font-bold mb-1" style={{ color: '#0A0A1A' }}>{t.name}</p>
                        <p className="text-xs mb-3 leading-relaxed" style={{ color: '#9CA3AF' }}>{t.desc}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {t.tags.slice(0, 3).map(tag => <Tag key={tag} name={tag} />)}
                          {(t.extras || 0) > 0 && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: '#F4F5FC', color: '#9CA3AF' }}>+{t.extras}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}