import { useState, useEffect } from 'react';
import { FileText, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';

function buildSoulMd(agent) {
  if (!agent) return 'No agent loaded.';
  return [
    `# ${agent.name} — Soul`,
    `**Role:** ${agent.role || 'Operator'}`,
    `**Status:** ${agent.status || 'active'}`,
    '',
    '## Personality & Instructions',
    agent.systemPrompt || 'No system prompt set.',
  ].join('\n');
}

function buildIdentityMd(agent) {
  if (!agent) return 'No agent loaded.';
  return [
    `# ${agent.name} — Identity`,
    `- **Name:** ${agent.name}`,
    `- **Role:** ${agent.role}`,
    `- **Reports to:** ${agent.reportsTo || 'Founder'}`,
    `- **Budget:** $${agent.monthlyBudgetUsd || 30}/mo`,
    `- **Heartbeat:** every ${agent.heartbeatIntervalMinutes || 60} min`,
    `- **Created:** ${agent.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Unknown'}`,
  ].join('\n');
}

function buildCompanyMd(company) {
  if (!company) return 'No company data.';
  const lines = [
    `# ${company.name} — Company`,
    `- **Industry:** ${company.industry || 'Unknown'}`,
    `- **Stage:** ${company.size || 'startup'}`,
    '',
    '## Mission',
    company.mission || 'Not set.',
  ];
  if (company.websiteUrl) {
    lines.push('', `## Website`, `${company.websiteUrl}`);
    if (company.websiteContent) {
      lines.push('', '## Website Content', company.websiteContent.slice(0, 600) + '…');
    }
  }
  return lines.join('\n');
}

function buildUserMd(user) {
  if (!user) return 'No user data.';
  return [
    '# USER.md — Founder Profile',
    `- **Name:** ${user.display_name || user.full_name || 'Founder'}`,
    `- **Email:** ${user.email || 'Unknown'}`,
    `- **Role:** Founder & CEO`,
  ].join('\n');
}

export default function FilesPopup({ agent, companyId }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(null); // which file is expanded
  const [company, setCompany] = useState(null);
  const [memoryLines, setMemoryLines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const [coSnap, hbSnap] = await Promise.all([
          getDoc(doc(firestore, 'companies', companyId)),
          getDocs(query(
            collection(firestore, 'heartbeats'),
            where('companyId', '==', companyId),
            ...(agent?.id ? [where('agentId', '==', agent.id)] : []),
            limit(5)
          )),
        ]);
        if (cancelled) return;
        if (coSnap.exists()) setCompany({ id: coSnap.id, ...coSnap.data() });
        const hbs = hbSnap.docs.map(d => d.data())
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setMemoryLines(hbs.map(h => `- ${h.summary || 'Heartbeat'}`));
      } catch (e) {
        console.warn('FilesPopup load error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [companyId, agent?.id]);

  const FILES = [
    {
      name: 'SOUL.md',
      desc: 'Personality & instructions',
      content: () => buildSoulMd(agent),
    },
    {
      name: 'IDENTITY.md',
      desc: 'Role, budget & schedule',
      content: () => buildIdentityMd(agent),
    },
    {
      name: 'COMPANY.md',
      desc: 'Mission, industry & website',
      content: () => buildCompanyMd(company),
    },
    {
      name: 'USER.md',
      desc: 'Founder profile',
      content: () => buildUserMd(user),
    },
    {
      name: 'MEMORY.md',
      desc: 'Recent decisions & heartbeats',
      content: () => memoryLines.length
        ? `# MEMORY.md\n\n## Recent Heartbeats\n${memoryLines.join('\n')}`
        : '# MEMORY.md\n\nNo heartbeats recorded yet.',
    },
  ];

  return (
    <div
      className="absolute bottom-full mb-3 left-0 z-50 w-80 rounded-2xl overflow-hidden"
      style={{
        background: '#fff',
        boxShadow: '0 20px 60px rgba(74,108,247,0.18), 0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #E8EAFF',
        maxHeight: 420,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #F0F1FF' }}>
        <span className="text-sm font-bold" style={{ color: '#374151' }}>
          {agent?.name ? `${agent.name}'s Files` : 'Agent Files'}
        </span>
        {loading && <Loader2 size={13} className="animate-spin" style={{ color: '#C5C9E0' }} />}
      </div>

      {/* File list */}
      <div className="overflow-y-auto flex-1">
        {FILES.map(file => {
          const isOpen = open === file.name;
          return (
            <div key={file.name} style={{ borderBottom: '1px solid #F4F5FC' }}>
              <button
                className="w-full flex items-center justify-between px-4 py-3 transition-colors text-left"
                style={{ background: isOpen ? 'rgba(74,108,247,0.04)' : 'transparent' }}
                onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(74,108,247,0.03)'; }}
                onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
                onClick={() => setOpen(isOpen ? null : file.name)}
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={13} style={{ color: isOpen ? '#4A6CF7' : '#9CA3AF', flexShrink: 0 }} />
                  <div>
                    <p className="text-xs font-bold" style={{ color: isOpen ? '#4A6CF7' : '#374151' }}>{file.name}</p>
                    <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{file.desc}</p>
                  </div>
                </div>
                {isOpen
                  ? <ChevronUp size={12} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                  : <ChevronDown size={12} style={{ color: '#9CA3AF', flexShrink: 0 }} />}
              </button>

              {isOpen && (
                <div className="px-4 pb-3">
                  <pre
                    className="text-[11px] leading-relaxed whitespace-pre-wrap rounded-xl p-3 overflow-y-auto"
                    style={{
                      background: '#F8FAFF',
                      border: '1px solid rgba(74,108,247,0.1)',
                      color: '#374151',
                      fontFamily: 'ui-monospace, monospace',
                      maxHeight: 180,
                    }}
                  >
                    {file.content()}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
