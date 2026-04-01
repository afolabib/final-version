import { useEffect, useState } from 'react';
import { Search, ArrowLeft, AlertCircle, ExternalLink } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import WizardModal from './WizardModal';
import FreemiAgent from '../solutions/FreemiAgent';

const cats = ['All', 'Productivity', 'Social Media', 'Support', 'Development', 'Marketing', 'Sales', 'Research'];

const agentCharacterMap = {
  'Freemi': 'freemi',
  'Sam': 'sam',
  'Rex': 'rex',
  'Ghost': 'ghost',
  'Aria': 'echo',
  'Dev': 'nova',
  'Lens': 'pixel',
  'Tweet Machine': 'sam',
  'Triager': 'rex',
  'Outreacher': 'echo',
  'Custom Agent': 'pixel',
};

const FIREBASE_PROJECT_ID = 'freemi-3f7c7';
const FIREBASE_BILLING_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/usage/details`;

function isHostedWizard() {
  if (typeof window === 'undefined') return false;
  const hostname = window.location?.hostname || '';
  return hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.local');
}

const agents = [
  { name: 'Freemi', sub: 'The Operator Agent', subColor: '#4A6CF7', desc: 'Your all-in-one business operator — handles tasks, delegates to other agents, and keeps everything running.', popular: true, cat: 'Productivity' },
  { name: 'Custom Agent', sub: 'Build your own', subColor: '#F59E0B', desc: 'Design an agent from scratch with your own personality, tools, and workflows.', badge: 'Builder', cat: 'Productivity' },
  { name: 'Dev', sub: 'Web Development Agent', subColor: '#8B5CF6', desc: 'Full-stack web development — HTML, CSS, JS, React, backend, debugging, and deployment. Builds sites, apps, and fixes bugs.', popular: true, cat: 'Development' },
  { name: 'Tweet Machine', sub: 'Twitter Growth Engine', subColor: '#4A6CF7', desc: 'Draft daily tweets, build threads, and analyze engagement to grow your audience.', cat: 'Social Media' },
  { name: 'Triager', sub: 'Support Ticket Triager', subColor: '#10B981', desc: 'Auto-prioritize support tickets and draft responses instantly.', cat: 'Support' },
  { name: 'Aria', sub: 'Founder Assistant', subColor: '#F59E0B', desc: 'Morning briefs, meeting prep, and daily recaps for busy founders.', cat: 'Productivity' },
  { name: 'Ghost', sub: 'LinkedIn Ghostwriter', subColor: '#4A6CF7', desc: 'Write thought leadership posts that drive engagement and inbound leads.', cat: 'Social Media' },
  { name: 'Rex', sub: 'Sales SDR', subColor: '#EC4899', desc: 'Qualify leads, send follow-ups, and book demos on autopilot.', cat: 'Sales' },
  { name: 'Outreacher', sub: 'Cold Outreach Drafter', subColor: '#F59E0B', desc: 'Research prospects and write personalized cold emails that convert.', cat: 'Sales' },
  { name: 'Lens', sub: 'Market Research Analyst', subColor: '#8B5CF6', desc: 'Track competitors, trends, and news — summarized daily in your inbox.', cat: 'Research' },
];

export default function AgentPicker({ onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [wizardAgent, setWizardAgent] = useState(null);

  useEffect(() => {
    if (!location.state?.openWizard) return;

    const routedAgent = location.state?.agent;
    if (routedAgent?.name) {
      setWizardAgent(routedAgent);
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const filtered = agents.filter(a =>
    (cat === 'All' || a.cat === cat) &&
    a.name.toLowerCase().includes(search.toLowerCase())
  );
  const showHostedBackendNotice = isHostedWizard();
  const hostedCardCtaLabel = showHostedBackendNotice ? 'Review plan & blocker' : 'Start setup';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-4 md:px-8 py-3 flex-shrink-0 flex items-center gap-2 text-sm"
        style={{ borderBottom: '1px solid #E8EAFF', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)' }}>
        <button onClick={onBack} className="flex items-center gap-1 transition-colors" style={{ color: '#9CA3AF' }}
          onMouseEnter={e => e.currentTarget.style.color = '#4A6CF7'}
          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
          <ArrowLeft size={13} /> Agents
        </button>
        <span style={{ color: '#C5C9E0' }}>/</span>
        <span style={{ color: '#374151', fontWeight: 600 }}>Choose an Agent</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1" style={{ color: '#0A0A1A' }}>Deploy an Agent</h1>
        <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>Pick a pre-built agent or create your own from scratch.</p>

        {showHostedBackendNotice && (
          <div
            className="mb-6 rounded-2xl px-4 py-3 flex items-start gap-3"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}
          >
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#B45309' }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: '#92400E' }}>Hosted deploys are still blocked on the Firebase backend</div>
              <div className="text-xs mt-1" style={{ color: '#B45309' }}>
                Before you pick an agent, note that project {FIREBASE_PROJECT_ID} still needs Blaze billing enabled and Firebase Functions deployed for live setup to work end-to-end.
              </div>
              <a
                href={FIREBASE_BILLING_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold mt-2 underline"
                style={{ color: '#92400E' }}
              >
                Open Firebase billing / project settings
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-1.5">
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{ background: cat === c ? '#4A6CF7' : '#fff', color: cat === c ? '#fff' : '#6B7280', border: '1px solid #E8EAFF' }}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl flex-shrink-0"
            style={{ background: '#fff', border: '1px solid #E8EAFF' }}>
            <Search size={13} style={{ color: '#C5C9E0' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="text-xs outline-none bg-transparent w-24 font-medium" style={{ color: '#374151' }} />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(agent => {
            const isFreemi = agent.name === 'Freemi';
            return (
            <button key={agent.name} onClick={() => agent.name === 'Custom Agent' ? navigate('/dashboard/custom-agent') : setWizardAgent(agent)}
              className="text-left rounded-2xl p-5 flex flex-col relative"
              style={{
                background: isFreemi ? 'linear-gradient(180deg, rgba(108,92,231,0.08) 0%, #fff 38%)' : '#fff',
                border: isFreemi ? '2px solid rgba(108,92,231,0.28)' : '1.5px solid #E8EAFF',
                boxShadow: isFreemi ? '0 10px 30px rgba(108,92,231,0.14)' : '0 2px 8px rgba(74,108,247,0.04)',
                transition: 'transform 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = isFreemi ? 'rgba(108,92,231,0.48)' : '#4A6CF7'; e.currentTarget.style.boxShadow = isFreemi ? '0 14px 36px rgba(108,92,231,0.22)' : '0 8px 28px rgba(74,108,247,0.15)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isFreemi ? 'rgba(108,92,231,0.28)' : '#E8EAFF'; e.currentTarget.style.boxShadow = isFreemi ? '0 10px 30px rgba(108,92,231,0.14)' : '0 2px 8px rgba(74,108,247,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}>
              {agent.popular && (
                <span className="absolute top-4 right-4 text-[11px] font-extrabold px-3 py-1 rounded-full"
                  style={{ background: isFreemi ? 'rgba(108,92,231,0.14)' : 'rgba(74,108,247,0.1)', color: isFreemi ? '#6C5CE7' : '#4A6CF7', boxShadow: isFreemi ? '0 6px 18px rgba(108,92,231,0.12)' : 'none' }}>Most Popular</span>
              )}
              {agent.badge && (
                <span className="absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>{agent.badge}</span>
              )}
              {/* Agent character */}
              <div className="mb-3">
                {agentCharacterMap[agent.name] ? (
                  <div className="scale-75 origin-left -my-1">
                    <FreemiAgent agentKey={agentCharacterMap[agent.name]} size="sm" animate={false} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${agent.subColor}15` }}>
                    <span className="text-lg">🤖</span>
                  </div>
                )}
              </div>
              <p className="text-base font-extrabold mb-0.5" style={{ color: '#0A0A1A' }}>{agent.name}</p>
              <p className="text-xs font-semibold mb-3" style={{ color: agent.subColor }}>{agent.sub}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>{agent.desc}</p>

              <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold">
                <span style={{ color: showHostedBackendNotice ? '#B45309' : '#6B7280' }}>
                  {showHostedBackendNotice ? 'Hosted backend still blocked' : 'Ready to configure'}
                </span>
                <span
                  className="inline-flex items-center rounded-full px-3 py-1"
                  style={{
                    background: showHostedBackendNotice ? 'rgba(245,158,11,0.1)' : 'rgba(74,108,247,0.08)',
                    color: showHostedBackendNotice ? '#92400E' : '#4A6CF7',
                  }}
                >
                  {hostedCardCtaLabel}
                </span>
              </div>
            </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {wizardAgent && <WizardModal agent={wizardAgent} onClose={() => setWizardAgent(null)} />}
      </AnimatePresence>
    </div>
  );
}
