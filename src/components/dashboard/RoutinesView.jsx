import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';

const TEMPLATES = [
  { label: 'Daily Standup',      dots: ['#F59E0B', '#FCD34D'], schedule: 'Weekdays at 9am' },
  { label: 'Lead Review',        dots: ['#5B5FFF', '#6B63FF'], schedule: 'Every 4 hours' },
  { label: 'Inbox Triage',       dots: ['#10B981', '#14B8A6'], schedule: 'Every 30 minutes' },
  { label: 'Weekly Report',      dots: ['#EC4899', '#F43F5E'], schedule: 'Fridays at 5pm' },
  { label: 'Agent Health Check', dots: ['#EF4444', '#F97316'], schedule: 'Every 15 minutes' },
  { label: 'Content Queue',      dots: ['#0EA5E9', '#10B981'], schedule: 'Daily at 8am' },
];

const SCHEDULES = [
  'Every 15 minutes',
  'Every 30 minutes',
  'Every hour',
  'Every 4 hours',
  'Daily at 8am',
  'Weekdays at 9am',
  'Fridays at 5pm',
  'Custom…',
];

export default function RoutinesView() {
  const { agents: companyAgents } = useCompany();
  const agents = (companyAgents || []).filter(a => a.status !== 'terminated');

  const [desc, setDesc] = useState('');
  const [focused, setFocused] = useState(false);
  const [sent, setSent] = useState(false);
  const [showAgentSelect, setShowAgentSelect] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const textareaRef = useRef();

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [desc]);

  function handleCreate() {
    if (!desc.trim()) return;
    setSent(true);
    setDesc('');
    setSelectedAgent(null);
    setSelectedSchedule(null);
    setTimeout(() => setSent(false), 3000);
  }

  const handleKey = e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleCreate();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F7FF 45%, #FAFCFF 100%)' }}>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #5B5FFF, #2563EB)',
              boxShadow: '0 8px 32px rgba(91,95,255,0.35)',
            }}>
            <Clock size={28} color="#fff" strokeWidth={1.8} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="heading-serif font-bold tracking-tight text-center mb-2"
          style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#0A0F1E', letterSpacing: '-0.02em' }}>
          What should this routine do?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-sm mb-8 text-center font-medium"
          style={{ color: '#94A3B8' }}>
          Describe it and set a schedule — Freemi runs it automatically
        </motion.p>

        {/* Input card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="w-full max-w-2xl rounded-2xl mb-5 input-focus-ring"
          style={{
            background: 'rgba(255,255,255,0.97)',
            border: focused ? '1.5px solid rgba(91,95,255,0.28)' : '1.5px solid rgba(91,95,255,0.09)',
            boxShadow: focused
              ? '0 0 0 4px rgba(91,95,255,0.07), 0 8px 32px rgba(91,95,255,0.10)'
              : '0 4px 24px rgba(91,95,255,0.06)',
            transition: 'border-color 200ms, box-shadow 200ms',
          }}>

          <div className="px-5 pt-5 pb-2">
            <textarea
              ref={textareaRef}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Describe your routine in plain English…"
              className="w-full text-sm outline-none resize-none bg-transparent leading-relaxed font-medium"
              style={{ color: '#0A0F1E', caretColor: '#5B5FFF', minHeight: 72 }}
            />
          </div>

          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2 relative">

              {/* Schedule picker */}
              <div className="relative">
                <button
                  onClick={() => { setShowSchedule(!showSchedule); setShowAgentSelect(false); }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                  style={{
                    color: selectedSchedule ? '#5B5FFF' : '#94A3B8',
                    background: showSchedule ? 'rgba(91,95,255,0.08)' : 'rgba(244,245,252,0.8)',
                  }}>
                  <Clock size={10} />
                  {selectedSchedule || 'Set schedule'}
                  <ChevronDown size={10} style={{ transform: showSchedule ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                </button>
                {showSchedule && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-white z-50"
                    style={{ border: '1px solid rgba(91,95,255,0.12)', boxShadow: '0 8px 32px rgba(91,95,255,0.10)' }}>
                    {SCHEDULES.map(s => (
                      <button key={s}
                        onClick={() => { setSelectedSchedule(s); setShowSchedule(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors"
                        style={{ color: '#374151', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Agent picker */}
              <div className="relative">
                <button
                  onClick={() => { setShowAgentSelect(!showAgentSelect); setShowSchedule(false); }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                  style={{
                    color: selectedAgent ? '#5B5FFF' : '#94A3B8',
                    background: showAgentSelect ? 'rgba(91,95,255,0.08)' : 'rgba(244,245,252,0.8)',
                  }}>
                  + {selectedAgent || 'Select agent'}
                  <ChevronDown size={10} style={{ transform: showAgentSelect ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                </button>
                {showAgentSelect && (
                  <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl bg-white z-50"
                    style={{ border: '1px solid rgba(91,95,255,0.12)', boxShadow: '0 8px 32px rgba(91,95,255,0.10)' }}>
                    {agents.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-center" style={{ color: '#94A3B8' }}>No agents yet</div>
                    ) : agents.map(a => (
                      <button key={a.id}
                        onClick={() => { setSelectedAgent(a.name); setShowAgentSelect(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors"
                        style={{ color: '#374151', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {a.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={!desc.trim()}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all btn-press disabled:opacity-40"
              style={{
                background: desc.trim() ? 'linear-gradient(135deg, #5B5FFF, #2563EB)' : '#E2E8F0',
                boxShadow: desc.trim() ? '0 4px 14px rgba(91,95,255,0.40)' : 'none',
                cursor: desc.trim() ? 'pointer' : 'not-allowed',
              }}>
              <ArrowUp size={14} style={{ color: desc.trim() ? '#fff' : '#94A3B8' }} />
            </button>
          </div>
        </motion.div>

        {/* Confirmation */}
        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm mb-4"
              style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle2 size={13} strokeWidth={2.5} />
              <span className="font-semibold">Routine scheduled.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Template chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="flex flex-wrap gap-2.5 justify-center max-w-2xl">
          {TEMPLATES.map(t => (
            <button
              key={t.label}
              onClick={() => { setDesc(t.label); setSelectedSchedule(t.schedule); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1.5px solid rgba(91,95,255,0.09)',
                color: '#374151',
                boxShadow: '0 2px 8px rgba(91,95,255,0.05)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(91,95,255,0.28)';
                e.currentTarget.style.background = 'rgba(91,95,255,0.04)';
                e.currentTarget.style.color = '#5B5FFF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(91,95,255,0.09)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.92)';
                e.currentTarget.style.color = '#374151';
              }}>
              <span className="flex items-center gap-0.5 flex-shrink-0">
                <span className="w-2 h-2 rounded-full" style={{ background: t.dots[0] }} />
                <span className="w-2 h-2 rounded-full" style={{ background: t.dots[1] }} />
              </span>
              {t.label}
            </button>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-xs font-medium cursor-pointer transition-colors"
          style={{ color: '#C7D0E8' }}
          onMouseEnter={e => e.currentTarget.style.color = '#5B5FFF'}
          onMouseLeave={e => e.currentTarget.style.color = '#C7D0E8'}>
          Browse all templates
        </motion.p>
      </div>
    </div>
  );
}
