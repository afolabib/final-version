import { useState, useEffect } from 'react';
import { FileText, Save, Loader2, CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { doc, getDoc, updateDoc, collection, query, where, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/AuthContext';
import { getAgentSystemPrompt, getAgentHeartbeat } from '@/lib/agentTemplates';

// ── File definitions ──────────────────────────────────────────────────────────
function getFiles(agent, company, user, memoryLines) {
  const fx = agent?.felixFiles || {};

  // Core Felix files — use stored generated version if available, otherwise fallback
  const identity = fx.IDENTITY || [
    `# IDENTITY.md — ${agent?.name || 'Agent'}`,
    ``,
    `- Name: ${agent?.name || '—'}`,
    `- Role: ${agent?.role || '—'}`,
    `- Reports to: ${agent?.reportsTo || 'Founder'}`,
    `- Budget: $${agent?.monthlyBudgetUsd || 30}/mo`,
    `- Heartbeat: every ${agent?.heartbeatIntervalMinutes || 60} min`,
    `- Created: ${agent?.createdAt?.toDate?.()?.toLocaleDateString?.() || '—'}`,
    ``,
    `## Daily Rhythm`,
    `- Morning: Execute against the approved plan. No waiting.`,
    `- Heartbeats: Track execution, unblock issues, keep momentum.`,
    `- Nightly: Review the day. Propose tomorrow's plan. Send summary.`,
    `- Always: Think about the goal unprompted. Identify opportunities. Act.`,
  ].join('\n');

  const companyMd = company ? [
    `# COMPANY.md — ${company.name}`,
    ``,
    `- Industry: ${company.industry || '—'}`,
    `- Stage: ${company.size || 'startup'}`,
    ``,
    `## Mission`,
    company.mission || 'Not set.',
    ...(company.websiteUrl ? ['', `## Website`, company.websiteUrl] : []),
    ...(company.websiteContent ? ['', `## Website Content`, company.websiteContent.slice(0, 800) + '…'] : []),
  ].join('\n') : 'No company data.';

  const userMd = [
    `# USER.md — Founder`,
    ``,
    `- Name: ${user?.displayName || user?.email?.split('@')[0] || 'Founder'}`,
    `- Email: ${user?.email || '—'}`,
    `- Role: Founder & CEO`,
  ].join('\n');

  const memoryMd = memoryLines.length
    ? `# MEMORY.md\n\n## Recent Heartbeats\n${memoryLines.join('\n')}`
    : '# MEMORY.md\n\nNo heartbeats recorded yet.';

  const files = [
    {
      name: 'SOUL.md',
      desc: 'Personality & operating philosophy',
      field: 'systemPrompt',
      editable: true,
      target: 'agent',
      content: agent?.systemPrompt || fx.SOUL || getAgentSystemPrompt(agent, company?.name, company?.mission),
    },
    {
      name: 'IDENTITY.md',
      desc: 'Role, mission & focus areas',
      editable: false,
      content: identity,
    },
    {
      name: 'HEARTBEAT.md',
      desc: 'Heartbeat checklist',
      field: 'heartbeatInstructions',
      editable: true,
      target: 'agent',
      content: agent?.heartbeatInstructions || fx.HEARTBEAT || getAgentHeartbeat(agent),
    },
    {
      name: 'BOOTSTRAP.md',
      desc: 'First-run setup guide',
      editable: false,
      content: fx.BOOTSTRAP || `# BOOTSTRAP.md — ${agent?.name || 'Agent'}\n\nFirst-run setup guide generated on next agent creation.`,
    },
    {
      name: 'AGENTS.md',
      desc: 'Tool access & permissions',
      editable: false,
      content: fx.AGENTS || `# AGENTS.md — ${agent?.name || 'Agent'}\n\nPermissions manifest generated on next agent creation.`,
    },
    {
      name: 'TOOLS.md',
      desc: 'All available tools',
      editable: false,
      content: fx.TOOLS || `# TOOLS.md\n\nFull tool manifest generated on next agent creation.`,
    },
    {
      name: 'SKILLS.md',
      desc: 'Enabled skill modules',
      editable: false,
      content: fx.SKILLS || `# SKILLS.md — ${agent?.name || 'Agent'}\n\nSkills manifest generated on next agent creation.`,
    },
    {
      name: 'COMPANY.md',
      desc: 'Mission, industry & website',
      editable: false,
      content: companyMd,
    },
    {
      name: 'USER.md',
      desc: 'Founder profile',
      editable: false,
      content: userMd,
    },
    {
      name: 'MEMORY.md',
      desc: 'Recent decisions & heartbeats',
      editable: false,
      content: memoryMd,
    },
  ];

  return files;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FilesTab({ agent, companyId }) {
  const { user } = useAuth();
  const [company, setCompany]       = useState(null);
  const [memoryLines, setMemoryLines] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState('SOUL.md');
  const [editValue, setEditValue]   = useState('');
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);

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
        console.warn('FilesTab load error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [companyId, agent?.id]);

  const files = getFiles(agent, company, user, memoryLines);
  const activeFile = files.find(f => f.name === selected) || files[0];

  // Sync editor when file selection changes
  useEffect(() => {
    if (activeFile) setEditValue(activeFile.content);
    setSaved(false);
  }, [selected, agent?.systemPrompt, agent?.heartbeatInstructions]);

  async function handleSave() {
    if (!activeFile?.editable || !agent?.id) return;
    setSaving(true);
    try {
      await updateDoc(doc(firestore, 'agents', agent.id), {
        [activeFile.field]: editValue,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setSaving(false);
    }
  }

  const isDirty = activeFile?.editable && editValue !== activeFile.content;

  return (
    <div className="flex h-full" style={{ minHeight: 440 }}>

      {/* Left: file list */}
      <div className="flex-shrink-0 border-r overflow-y-auto" style={{ width: 200, borderColor: '#E8EAFF' }}>
        <p className="px-4 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C5C9E0' }}>
          Files {loading && <Loader2 size={9} className="inline animate-spin ml-1" />}
        </p>
        {files.map(file => {
          const isActive = selected === file.name;
          return (
            <button
              key={file.name}
              onClick={() => setSelected(file.name)}
              className="w-full text-left flex items-center gap-2 px-4 py-2.5 transition-colors"
              style={{ background: isActive ? 'rgba(74,108,247,0.07)' : 'transparent' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(74,108,247,0.03)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <FileText size={12} style={{ color: isActive ? '#4A6CF7' : '#C5C9E0', flexShrink: 0 }} />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: isActive ? '#4A6CF7' : '#374151' }}>
                  {file.name}
                </p>
                <p className="text-[9px] truncate" style={{ color: '#9CA3AF' }}>{file.desc}</p>
              </div>
              {isActive && <ChevronRight size={10} style={{ color: '#4A6CF7', flexShrink: 0, marginLeft: 'auto' }} />}
            </button>
          );
        })}
      </div>

      {/* Right: editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor header */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid #E8EAFF' }}>
          <div className="flex items-center gap-2">
            <FileText size={13} style={{ color: '#4A6CF7' }} />
            <span className="text-sm font-bold" style={{ color: '#374151' }}>{activeFile?.name}</span>
            {!activeFile?.editable && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#F4F5FC', color: '#9CA3AF' }}>
                <Lock size={9} /> Read only
              </span>
            )}
          </div>
          {activeFile?.editable && (
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: saved ? 'rgba(16,185,129,0.1)' : isDirty ? '#4A6CF7' : '#F4F5FC',
                color: saved ? '#10B981' : isDirty ? '#fff' : '#C5C9E0',
                cursor: isDirty ? 'pointer' : 'default',
              }}>
              {saving ? <Loader2 size={11} className="animate-spin" /> : saved ? <CheckCircle2 size={11} /> : <Save size={11} />}
              {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>

        {/* Editor body */}
        <div className="flex-1 p-4 overflow-hidden">
          {activeFile?.editable ? (
            <textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="w-full h-full text-xs leading-relaxed outline-none resize-none rounded-xl p-4"
              style={{
                background: '#F8FAFF',
                border: '1px solid rgba(74,108,247,0.1)',
                color: '#374151',
                fontFamily: 'ui-monospace, monospace',
              }}
              placeholder="Start writing…"
              spellCheck={false}
            />
          ) : (
            <pre
              className="w-full h-full text-xs leading-relaxed whitespace-pre-wrap overflow-y-auto rounded-xl p-4"
              style={{
                background: '#F8FAFF',
                border: '1px solid rgba(74,108,247,0.1)',
                color: '#374151',
                fontFamily: 'ui-monospace, monospace',
              }}>
              {activeFile?.content || '—'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
