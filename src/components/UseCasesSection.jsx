import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';
import WorkingFreemi from './WorkingFreemi';
import MiniFreemi from './MiniFreemi';
import FreemiEntrance from './FreemiEntrance';
import LiveWorkstation from './LiveWorkstation';
import LiveToolsBar from './LiveToolsBar';

const roleColors = {
  ceo: '#5B5FFF',
  rex: '#7C3AED',
  dev: '#059669',
  echo: '#D97706',
  nova: '#2563EB',
};

const roles = [
  {
    key: 'ceo', label: 'Freemi (CEO)', emoji: '🧠',
    title: 'Orchestrates your agent team, sets strategy, and drives execution',
    tasks: ['Strategic planning', 'Agent delegation', 'Performance review'],
    tools: 'All Agents + Goals + Analytics',
    example: '"Review last week\'s results and brief each agent on their top 3 priorities for this sprint."',
    tags: ['Strategy Set', 'Agents Briefed', 'Goals Tracked'],
  },
  {
    key: 'rex', label: 'Rex (Sales)', emoji: '🎯',
    title: 'Qualifies leads, responds instantly, and books meetings',
    tasks: ['Inbound qualification', 'Follow-up emails', 'Meeting booking'],
    tools: 'Email + CRM + Calendar',
    example: '"Can you send pricing details? Happy to jump on a call this week."',
    tags: ['Lead Qualified', 'Meeting Scheduled', 'CRM Updated'],
  },
  {
    key: 'dev', label: 'Dev (Engineering)', emoji: '⚙️',
    title: 'Triages bugs, manages PRs, and keeps engineering moving',
    tasks: ['Bug triage', 'PR review coordination', 'Sprint planning'],
    tools: 'GitHub + Jira + Slack',
    example: '"Triage all open issues and create a prioritized list for the next sprint."',
    tags: ['Bugs Triaged', 'PRs Reviewed', 'Sprint Updated'],
  },
  {
    key: 'echo', label: 'Echo (Support)', emoji: '🎧',
    title: 'Handles customer messages and resolves requests',
    tasks: ['Ticket routing', 'Knowledge base lookup', 'Escalation routing'],
    tools: 'Helpdesk + Docs + Slack',
    example: '"My integration stopped syncing two days ago. Can you check?"',
    tags: ['Issue Identified', 'Fix Applied', 'Customer Notified'],
  },
  {
    key: 'nova', label: 'Nova (Operations)', emoji: '📊',
    title: 'Executes ops tasks, updates systems, keeps workflows moving',
    tasks: ['Invoice processing', 'Data entry', 'Report generation'],
    tools: 'Spreadsheets + Email + Accounting',
    example: '"Process all pending invoices and flag any over $5,000."',
    tags: ['Invoices Processed', 'Flags Raised', 'Summary Sent'],
  },
];

export default function UseCasesSection() {
  const [active, setActive] = useState('ceo');
  const role = roles.find(r => r.key === active);

  return (
    <section id="use-cases" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
              style={{ color: '#5B5FFF', background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.1)' }}>
              Your Agent Team
            </span>
          </ScrollReveal>
          <TextReveal delay={0.1}>
            <h2 className="text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold tracking-[-0.03em] text-surface leading-[1.08]">
              Deploy an Agent for Every Function of Your Business
            </h2>
          </TextReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-lg text-gray-500 mt-5 max-w-xl mx-auto leading-relaxed">
              One AI CEO. Five specialized agents. Your entire company running on autopilot.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.1}>
          <FreemiEntrance />
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {roles.map(r => {
              const isActive = active === r.key;
              return (
                <motion.button key={r.key}
                onClick={() => setActive(r.key)}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 relative overflow-visible"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #5B5FFF, #7C6CF7)' : '#fff',
                  color: isActive ? '#fff' : '#6B7280',
                  border: isActive ? 'none' : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: isActive ? '0 4px 16px rgba(91,95,255,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                <span className="mr-1.5">{r.emoji}</span>
                {r.label}
                </motion.button>
              );
            })}
          </div>
        </ScrollReveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="p-8 md:p-10 rounded-3xl bg-white/80 backdrop-blur-sm overflow-hidden relative"
            style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 40px rgba(0,0,0,0.04)' }}
          >
            {/* Subtle gradient accent */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
              style={{ background: `radial-gradient(circle, ${roleColors[active]}08, transparent 70%)` }} />

            {/* Working Freemi running along bottom */}
            <WorkingFreemi key={active} roleKey={active} />

            <div className="grid md:grid-cols-2 gap-8 relative">
              {/* Left — Role info + tools */}
              <div>
                <motion.h3
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold text-surface mb-2"
                >
                  {role.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-gray-400 mb-5 leading-relaxed italic"
                >
                  {role.example}
                </motion.p>

                <div className="mb-5">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">Connected Tools</span>
                  <div className="mt-2">
                    <LiveToolsBar roleKey={active} color={roleColors[active]} />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">Capabilities</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {role.tasks.map((t, i) => (
                      <motion.span key={t}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ background: `${roleColors[active]}08`, color: roleColors[active], border: `1px solid ${roleColors[active]}12` }}
                      >
                        {t}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — Live activity feed */}
              <div className="rounded-2xl p-5 relative"
                style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <LiveWorkstation roleKey={active} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}