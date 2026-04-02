import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'What exactly is FreemiOS?',
    a: 'FreemiOS is an AI company operating system. You get a CEO agent (Freemi) who receives your goals and manages a team of specialist AI agents — for sales, engineering, support, marketing, and more. Think of it as spinning up a fully staffed startup, instantly.',
  },
  {
    q: 'How do I give Freemi a goal?',
    a: 'From the command center, type your goal in plain English — "Close 10 enterprise deals this quarter" or "Ship the new checkout flow by Friday." Freemi breaks it into tasks, assigns them to the right agents, and starts working immediately.',
  },
  {
    q: 'What are AI agents and what can they do?',
    a: 'Agents are autonomous workers specialised in one domain. Rex handles sales outreach and CRM. Dev manages code, PRs, and issues. Echo resolves support tickets. Nova runs your marketing. Each connects to real tools (Slack, GitHub, HubSpot, etc.) and takes actions on your behalf.',
  },
  {
    q: 'Can I control how much autonomy agents have?',
    a: 'Yes — every agent has a configurable autonomy level. Set to "Full autonomy" and they run independently. Set to "Board approval" and sensitive actions require your sign-off in the Inbox before they execute.',
  },
  {
    q: 'How does billing for agent actions work?',
    a: 'Each agent has a monthly budget cap you configure. When an agent needs a paid tool or API, it draws from that budget. Set hard stops at any threshold and see a full spend breakdown in the Budget view.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. Data is encrypted at rest and in transit. Agents only access tools you explicitly connect. We never train on your company data, and you can export or delete everything at any time.',
  },
  {
    q: 'Can I import from Paperclip or another platform?',
    a: 'Yes — FreemiOS supports Paperclip.ai exports. Your agents, goals, and configuration migrate automatically. Choose "Import Company" on first launch and upload your export file.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-24 px-6" style={{ background: '#fff' }}>
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(108,92,231,0.07)', color: '#6C5CE7', border: '1px solid rgba(108,92,231,0.15)' }}>
              FAQ
            </div>
            <h2 className="text-[clamp(1.9rem,4vw,3rem)] font-extrabold tracking-tight mb-3" style={{ color: '#0A0A1A' }}>
              Questions? We've got answers.
            </h2>
            <p className="text-base" style={{ color: '#64748B' }}>
              Still unsure?{' '}
              <a href="/dashboard" className="font-semibold underline" style={{ color: '#6C5CE7' }}>Try it free</a>
              {' '}— no card needed.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.04}>
              <div className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background: open === i ? 'rgba(108,92,231,0.03)' : 'rgba(255,255,255,0.9)',
                  border: open === i ? '1.5px solid rgba(108,92,231,0.18)' : '1px solid rgba(108,92,231,0.08)',
                }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="text-sm font-semibold pr-4" style={{ color: '#0A0A1A' }}>{faq.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                    <ChevronDown size={16} style={{ color: open === i ? '#6C5CE7' : '#CBD5E1' }} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
                      <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#64748B' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
