import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import { useNavigate } from 'react-router-dom';

const AGENTS = [
  {
    id: 'rex', name: 'Rex', role: 'Sales Agent', emoji: '🎯', color: '#E17055', bg: '#E1705512',
    tagline: 'Fills your pipeline while you sleep',
    capabilities: ['Researches and qualifies inbound leads','Sends personalised follow-up sequences','Books discovery calls on your calendar','Updates CRM and flags high-intent accounts'],
    tools: ['HubSpot', 'Apollo', 'Gmail', 'Calendly'],
    example: 'Close 10 enterprise deals this quarter',
    log: ['Sent follow-up to Acme Corp (3rd touch)','Booked demo: StartupXYZ → Thursday 2pm','Flagged GlobalCo as high-intent (visited pricing 3×)','Updated CRM: 14 contacts moved to Qualified'],
  },
  {
    id: 'dev', name: 'Dev', role: 'Engineering Agent', emoji: '⚙️', color: '#0984E3', bg: '#0984E312',
    tagline: 'Ships features, fixes bugs, reviews PRs',
    capabilities: ['Breaks down epics into sprint-sized tasks','Writes and reviews code with full context','Monitors CI/CD and alerts on failures','Creates and triages GitHub issues automatically'],
    tools: ['GitHub', 'Linear', 'Slack', 'Vercel'],
    example: 'Ship the new auth system by end of sprint',
    log: ['Opened PR for auth refactor — 4 files changed','Flagged flaky test in payment suite','Created 6 Linear tasks from spec doc','Deployed staging build — all checks green ✓'],
  },
  {
    id: 'echo', name: 'Echo', role: 'Support Agent', emoji: '💬', color: '#00B894', bg: '#00B89412',
    tagline: 'Resolves tickets before customers get frustrated',
    capabilities: ['Triages and categorises incoming tickets','Resolves common issues automatically','Escalates complex problems with full context','Tracks response time SLAs in real time'],
    tools: ['Intercom', 'Zendesk', 'Notion', 'Slack'],
    example: 'Maintain sub-2h response time on all tickets',
    log: ['Resolved 12 tickets — billing & account issues','Escalated ticket #4821 to senior support','Average response time today: 1h 23min ✓','Updated FAQ with top 3 recurring questions'],
  },
  {
    id: 'nova', name: 'Nova', role: 'Marketing Agent', emoji: '📣', color: '#A29BFE', bg: '#A29BFE12',
    tagline: 'Grows your audience while you focus on product',
    capabilities: ['Drafts and schedules social content','Researches keywords and SEO opportunities','Writes email sequences and newsletters','Tracks campaign performance and reports weekly'],
    tools: ['Buffer', 'Mailchimp', 'Ahrefs', 'Canva'],
    example: 'Grow LinkedIn following by 5k this month',
    log: ['Drafted 5 LinkedIn posts — queued for review','Found 3 high-intent keywords for blog sprint','Sent weekly newsletter to 2,400 subscribers','Engagement up 23% vs last week ↑'],
  },
];

export default function UseCasesSection() {
  const [active, setActive] = useState('rex');
  const navigate = useNavigate();
  const agent = AGENTS.find(a => a.id === active);

  return (
    <section id="agents" className="py-24 px-6" style={{ background: '#fff' }}>
      <div className="max-w-6xl mx-auto">

        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(108,92,231,0.07)', color: '#6C5CE7', border: '1px solid rgba(108,92,231,0.15)' }}>
              Your AI Team
            </div>
            <h2 className="text-[clamp(1.9rem,4vw,3rem)] font-extrabold tracking-tight mb-4" style={{ color: '#0A0A1A' }}>
              One CEO. Many specialists.
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: '#64748B' }}>
              Freemi manages a team of AI agents, each expert in their domain. You set the direction — they get it done.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {AGENTS.map(a => (
              <button key={a.id} onClick={() => setActive(a.id)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: active === a.id ? a.bg : 'rgba(0,0,0,0.03)',
                  color: active === a.id ? a.color : '#64748B',
                  border: `1.5px solid ${active === a.id ? `${a.color}30` : 'transparent'}`,
                  boxShadow: active === a.id ? `0 4px 16px ${a.color}20` : 'none',
                }}>
                <span>{a.emoji}</span>
                <span>{a.name}</span>
                <span className="text-xs opacity-60">{a.role}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            <div className="grid md:grid-cols-2 gap-6">

              {/* Info card */}
              <div className="rounded-2xl p-7"
                style={{ background: 'linear-gradient(135deg,#F8FAFF,#fff)', border: '1px solid rgba(108,92,231,0.08)' }}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: agent.bg, border: `1px solid ${agent.color}20` }}>{agent.emoji}</div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#0A0A1A' }}>{agent.name}</h3>
                    <p className="text-sm font-medium" style={{ color: agent.color }}>{agent.role}</p>
                    <p className="text-sm mt-1" style={{ color: '#64748B' }}>{agent.tagline}</p>
                  </div>
                </div>
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#CBD5E1' }}>Capabilities</p>
                  <ul className="space-y-2">
                    {agent.capabilities.map(c => (
                      <li key={c} className="flex items-start gap-2.5 text-sm" style={{ color: '#374151' }}>
                        <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${agent.color}15` }}>
                          <span className="text-[8px]" style={{ color: agent.color }}>✓</span>
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#CBD5E1' }}>Connected Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {agent.tools.map(t => (
                      <span key={t} className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{ background: `${agent.color}10`, color: agent.color }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl px-4 py-3" style={{ background: `${agent.color}08`, border: `1px solid ${agent.color}20` }}>
                  <p className="text-xs font-bold mb-1" style={{ color: agent.color }}>Example goal</p>
                  <p className="text-sm italic" style={{ color: '#374151' }}>"{agent.example}"</p>
                </div>
              </div>

              {/* Live log */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: '#0A0A1A', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 px-5 py-3.5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: agent.color }} />
                  <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {agent.name}'s Activity Log
                  </span>
                </div>
                <div className="p-5 space-y-3 flex-1">
                  {agent.log.map((l, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-3">
                      <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: `${agent.color}80` }}>▸</span>
                      <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)', fontFamily: 'ui-monospace,monospace' }}>{l}</span>
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-xs animate-pulse" style={{ color: agent.color }}>●</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.22)', fontFamily: 'ui-monospace,monospace' }}>awaiting next task…</span>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <button onClick={() => navigate('/dashboard')}
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{ background: `${agent.color}20`, color: agent.color, border: `1px solid ${agent.color}30` }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${agent.color}30`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${agent.color}20`; }}>
                    Hire {agent.name} →
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
