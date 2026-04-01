import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Plug, BarChart3 } from 'lucide-react';
import FreemiAgent from './FreemiAgent';
import LiveWorkstation from '../LiveWorkstation';

export default function SolutionsShowcase({ agent }) {
  if (!agent) return null;
  const { key, name, role, color, personality, description, tasks, tools, workstation, stats, useCases, metrics } = agent;

  return (
    <section className="px-4 md:px-6 pb-16 md:pb-24">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>

            {/* Profile header */}
            <div className="rounded-3xl overflow-hidden mb-8"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 40px rgba(0,0,0,0.04)' }}>
              <div className="relative p-6 md:p-10" style={{ background: `linear-gradient(135deg, ${color}10, ${color}04)` }}>
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: `${color}12` }} />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
                  <div className="scale-75 md:scale-100 origin-left -my-2">
                    <FreemiAgent agentKey={key} size="lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-surface tracking-tight">{name}</h2>
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${color}15`, color }}>{role}</span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">● Active 24/7</span>
                    </div>
                    <p className="text-gray-400 italic text-sm mb-3">"{personality}"</p>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base max-w-2xl">{description}</p>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                {stats.map((s, i) => (
                  <div key={i} className="text-center py-5 md:py-6" style={{ borderRight: i < 2 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                    <div className="text-xl md:text-2xl font-extrabold mb-0.5" style={{ color }}>{s.value}</div>
                    <div className="text-[10px] md:text-xs text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-column detail grid */}
            <div className="grid md:grid-cols-3 gap-5 mb-8">
              {/* Capabilities */}
              <div className="rounded-2xl p-5 md:p-6"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={16} style={{ color }} />
                  <h3 className="text-xs font-bold tracking-[0.12em] uppercase text-gray-400">What {name} Does</h3>
                </div>
                <div className="space-y-2.5">
                  {tasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${color}10` }}>
                        <span className="text-[9px] font-bold" style={{ color }}>{i + 1}</span>
                      </div>
                      <span className="text-sm text-gray-600 leading-snug">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live workstation */}
              <div className="rounded-2xl p-5 md:p-6"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={16} style={{ color }} />
                  <h3 className="text-xs font-bold tracking-[0.12em] uppercase text-gray-400">{name} in Action</h3>
                </div>
                <div className="rounded-xl p-3 min-h-[260px]" style={{ background: `${color}04`, border: `1px solid ${color}10` }}>
                  <LiveWorkstation roleKey={workstation} />
                </div>
              </div>

              {/* Integrations & Use Cases */}
              <div className="space-y-5">
                <div className="rounded-2xl p-5 md:p-6"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Plug size={16} style={{ color }} />
                    <h3 className="text-xs font-bold tracking-[0.12em] uppercase text-gray-400">Integrations</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tools.map(t => (
                      <span key={t} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: `${color}08`, color: '#4B5563', border: `1px solid ${color}12` }}>{t}</span>
                    ))}
                  </div>
                </div>

                {useCases && (
                  <div className="rounded-2xl p-5 md:p-6"
                    style={{ background: `linear-gradient(135deg, ${color}08, ${color}03)`, border: `1px solid ${color}12` }}>
                    <h3 className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color }}>Best For</h3>
                    <div className="space-y-2">
                      {useCases.map((uc, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs">{uc.emoji}</span>
                          <span className="text-sm text-gray-600">{uc.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics bar */}
            {metrics && (
              <div className="rounded-2xl p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.05)' }}>
                {metrics.map((m, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color }}>{m.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}