import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, StopCircle, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCompany } from '@/contexts/CompanyContext';
import { ROLE_COLORS } from '@/lib/agentService';
import { subscribeAgentSpend } from '@/lib/costService';

// ─── Spend gauge ──────────────────────────────────────────────────────────────
function SpendGauge({ spent, limit, color }) {
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const isWarning = pct >= 80;
  const isHardStop = pct >= 100;
  const barGradient = isHardStop
    ? 'linear-gradient(90deg,#EF4444,#DC2626)'
    : isWarning
    ? 'linear-gradient(90deg,#F59E0B,#EF4444)'
    : `linear-gradient(90deg,${color},${color}bb)`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold" style={{ color: '#64748B' }}>
          ${spent.toFixed(2)} <span style={{ color: '#CBD5E1' }}>/ ${limit}</span>
        </span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: isHardStop ? 'rgba(239,68,68,0.08)' : isWarning ? 'rgba(245,158,11,0.08)' : `${color}12`,
            color: isHardStop ? '#EF4444' : isWarning ? '#F59E0B' : color,
          }}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#EEF2FF' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: barGradient }}
        />
      </div>
      {isHardStop && (
        <p className="text-xs font-semibold flex items-center gap-1.5 mt-1" style={{ color: '#EF4444' }}>
          <StopCircle size={11} /> Hard stop — agent paused
        </p>
      )}
      {isWarning && !isHardStop && (
        <p className="text-xs font-medium flex items-center gap-1.5 mt-1" style={{ color: '#F59E0B' }}>
          <AlertTriangle size={11} /> Approaching budget limit
        </p>
      )}
    </div>
  );
}

// ─── Agent budget card ────────────────────────────────────────────────────────
function AgentBudgetCard({ agent, spend, index }) {
  const color = ROLE_COLORS[agent.role] || '#5B5FFF';
  const spent = spend?.totalUsd || 0;
  const limit = agent.budgetMonthly || 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden card-hover"
      style={{
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 4px 20px rgba(91,95,255,0.04)',
      }}>

      {/* Color accent bar */}
      <div className="h-0.5" style={{ background: `linear-gradient(90deg,${color},${color}44)` }} />

      <div className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${color}15`, border: `1.5px solid ${color}20` }}>
            {agent.avatar || '🤖'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm" style={{ color: '#0A0F1E', letterSpacing: '-0.01em' }}>
              {agent.name}
            </div>
            <div className="text-xs capitalize font-medium mt-0.5" style={{ color: '#94A3B8' }}>
              {agent.role}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-black" style={{ color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
              ${spent.toFixed(2)}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#CBD5E1' }}>
              this month
            </div>
          </div>
        </div>
        <SpendGauge spent={spent} limit={limit} color={color} />
      </div>
    </motion.div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function BudgetView() {
  const { agents, activeCompanyId } = useCompany();
  const [spendMap, setSpendMap] = useState({});

  useEffect(() => {
    if (!activeCompanyId) return;
    const unsubs = agents.map(agent =>
      subscribeAgentSpend(activeCompanyId, agent.id, data =>
        setSpendMap(m => ({ ...m, [agent.id]: data }))
      )
    );
    return () => unsubs.forEach(u => u && u());
  }, [agents, activeCompanyId]);

  const totalSpend = Object.values(spendMap).reduce((sum, s) => sum + (s?.totalUsd || 0), 0);
  const totalBudget = agents.reduce((sum, a) => sum + (a.budgetMonthly || 50), 0);
  const burnPct = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;
  const burnColor = burnPct >= 90 ? '#EF4444' : burnPct >= 70 ? '#F59E0B' : '#10B981';

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F7FF 45%, #FAFCFF 100%)' }}>

      {/* Header */}
      <div className="px-8 py-5 flex-shrink-0">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="heading-serif text-3xl font-bold" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>
              Budget
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: '#64748B' }}>
              Month-to-date spend across {agents.length} operator{agents.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Summary strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Spent',    value: `$${totalSpend.toFixed(2)}`, sub: 'month to date', icon: DollarSign, color: '#5B5FFF' },
            { label: 'Monthly Budget', value: `$${totalBudget}`,           sub: `${agents.length} operators`, icon: BarChart2, color: '#0EA5E9' },
            { label: 'Burn Rate',      value: `${burnPct.toFixed(0)}%`,    sub: burnPct >= 80 ? 'high usage' : 'healthy', icon: burnPct >= 80 ? AlertTriangle : TrendingUp, color: burnColor },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.05 }}
                className="rounded-2xl p-4 stat-card"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(8px)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}12` }}>
                    <Icon size={13} style={{ color: s.color }} />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>
                    {s.label}
                  </span>
                </div>
                <div className="text-2xl font-black leading-none"
                  style={{ color: s.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                  {s.value}
                </div>
                <div className="text-[11px] font-medium mt-1" style={{ color: '#CBD5E1' }}>{s.sub}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Per-agent grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {agents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(91,95,255,0.10), rgba(91,95,255,0.05))',
                border: '1.5px solid rgba(91,95,255,0.12)',
              }}>
              💸
            </div>
            <p className="text-base font-bold" style={{ color: '#0A0F1E' }}>No agents yet</p>
            <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
              Deploy operators to track their spend here.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent, i) => (
              <AgentBudgetCard key={agent.id} agent={agent} spend={spendMap[agent.id]} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
