import { useState, useEffect } from 'react';
import { ChevronDown, LayoutGrid, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import TemplateLibrary from './TemplateLibrary';

const templates = [
  { label: 'Email Inbox Manager', color1: '#2563EB', color2: '#10B981' },
  { label: '24/7 Support Agent', color1: '#10B981', color2: '#2563EB' },
  { label: 'Lead Follow-Up Machine', color1: '#EC4899', color2: '#F59E0B' },
  { label: 'Daily Task Digest', color1: '#F59E0B', color2: '#EC4899' },
  { label: 'Meeting Prep Brief', color1: '#2563EB', color2: '#10B981' },
  { label: 'Weekly Business Pulse', color1: '#EC4899', color2: '#2563EB' },
];

export default function AutomationsView() {
  const [desc, setDesc] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [focused, setFocused] = useState(false);
  const [automations, setAutomations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [showAgentSelect, setShowAgentSelect] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [automationData, agentData] = await Promise.all([
          base44.entities.Automation.list(),
          base44.entities.Agent.list('-updated_date', 50)
        ]);
        setAutomations(automationData);
        setAgents(agentData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto items-center pt-10 md:pt-16 pb-8 px-4 md:px-8" style={{ background: '#F4F5FC' }}>
      {/* Icon */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ambient-pulse"
          style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)', boxShadow: '0 8px 28px rgba(37,99,235,0.35)' }}>
          <Sparkles size={22} color="#fff" strokeWidth={1.8} />
        </div>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="text-2xl md:text-3xl font-extrabold tracking-tight text-center mb-2"
        style={{ color: '#0F172A', letterSpacing: '-0.02em', maxWidth: 420 }}>
        What should this automation do?
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }}
        className="text-sm mb-8" style={{ color: '#94A3B8' }}>
        Describe your workflow in plain English
      </motion.p>

      {/* Input card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}
        className="w-full max-w-2xl rounded-2xl mb-5 input-focus-ring"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          border: focused ? '1px solid rgba(37,99,235,0.25)' : '1px solid rgba(255,255,255,0.6)',
          boxShadow: focused ? '0 0 0 3px rgba(37,99,235,0.10), 0 8px 30px rgba(37,99,235,0.10)' : '0 4px 24px rgba(0,0,0,0.04)',
          transition: 'box-shadow 220ms, border-color 220ms',
        }}>
        <div className="px-5 pt-5 pb-3">
          <textarea
            rows={2}
            value={desc}
            onChange={e => setDesc(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Describe your automation in plain English..."
            className="w-full text-sm outline-none bg-transparent resize-none font-medium leading-relaxed"
            style={{ color: '#374151', caretColor: '#2563EB' }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.03)' }}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowAgentSelect(!showAgentSelect)}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                style={{ color: selectedAgent ? '#2563EB' : '#94A3B8', background: showAgentSelect ? 'rgba(37,99,235,0.1)' : 'rgba(244,245,252,0.8)' }}>
                <span>+</span> {selectedAgent || 'Select agent'} <ChevronDown size={10} style={{ transform: showAgentSelect ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }} />
              </button>
              {showAgentSelect && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-lg z-50" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                  {agents.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-gray-500 text-center">No agents available</div>
                  ) : (
                    agents.map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setSelectedAgent(agent.name);
                          setShowAgentSelect(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors hover:bg-blue-50"
                        style={{ color: '#374151', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        {agent.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <button className="p-1.5 rounded-xl transition-all" style={{ color: '#CBD5E1' }}
              onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
              onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}>
              <LayoutGrid size={14} />
            </button>
            <button className="p-1.5 rounded-xl transition-all" style={{ color: '#CBD5E1' }}
              onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
              onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}>
              <RefreshCw size={14} />
            </button>
          </div>
          <button 
           onClick={() => desc && console.log('Creating automation:', { desc, agent: selectedAgent })}
           disabled={!desc}
           className="w-8 h-8 rounded-full flex items-center justify-center transition-all btn-press disabled:opacity-50"
           style={{
             background: desc ? 'linear-gradient(135deg, #2563EB, #3B82F6)' : 'rgba(0,0,0,0.04)',
             boxShadow: desc ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
             cursor: desc ? 'pointer' : 'not-allowed'
           }}>
           <span style={{ color: desc ? '#fff' : '#CBD5E1', fontSize: 14 }}>↑</span>
          </button>
        </div>
      </motion.div>

      {/* Connect tools */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.18 }}
        className="flex items-center gap-3 mb-8">
        <Sparkles size={14} style={{ color: '#2563EB' }} />
        <span className="text-sm" style={{ color: '#94A3B8' }}>Connect your tools to Freemi</span>
        <button onClick={() => console.log('Connect integrations')} className="text-sm font-bold transition-colors hover:opacity-80" style={{ color: '#2563EB' }}>Connect</button>
      </motion.div>

      {/* Template chips */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.22 }}
        className="flex flex-wrap gap-2.5 justify-center mb-8 max-w-2xl">
        {templates.map(t => (
          <button key={t.label}
           onClick={() => setDesc(t.label)}
           className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all btn-press"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,0,0,0.04)',
              color: '#374151',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)'; e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; }}>
            <span className="flex gap-0.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: t.color1 }} />
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: t.color2 }} />
            </span>
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Links */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.28 }}
        className="flex items-center gap-4 text-sm">
        <button onClick={() => setShowTemplates(true)}
          className="flex items-center gap-1.5 font-bold transition-colors"
          style={{ color: '#94A3B8' }}
          onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
          onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
          <LayoutGrid size={13} /> Browse all templates
        </button>
        <span style={{ color: '#E5E7EB' }}>|</span>
        <button 
         onClick={() => console.log('Configure manually')}
         className="font-bold transition-colors" 
         style={{ color: '#94A3B8' }}
         onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
         onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
         Configure manually
        </button>
      </motion.div>

      {showTemplates && <TemplateLibrary onClose={() => setShowTemplates(false)} />}
    </div>
  );
}