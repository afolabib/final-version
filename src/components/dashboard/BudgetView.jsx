import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, StopCircle } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { ROLE_COLORS } from '@/lib/agentService';
import { subscribeAgentSpend } from '@/lib/costService';

// ─── Spend gauge ──────────────────────────────────────────────────────────────
function SpendGauge({ spent, limit, color }) {
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const isWarning = pct >= 80;
  const isHardStop = pct >= 100;
  const barColor = isHardStop ? '#EF4444' : isWarning ? '#F59E0B' : color;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs" style={{ color: '#64748B' }}>
        <span>${spent.toFixed(2)} spent</span>
        <span style={{ color: isHardStop ? '#EF4444' : isWarning ? '#F59E0B' : '#94A3B8' }}>
          {pct.toFixed(0)}% of ${limit}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }} />
      </div>
      {isHardStop && (
        <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#EF4444' }}>
          <StopCircle size={11} /> Hard stop reached — agent paused
        </p>
      )}
      {isWarning && !isHardStop && (
        <p className="text-xs font-medium flex items-center gap-1" style={{ color: '#F59E0B' }}>
          <AlertTriangle size={11} /> Approaching budget limit
        </p>
      )}
    </div>
  );
}

// ─── Agent budget card ────────────────────────────────────────────────────────
function AgentBudgetCard({ agent, spend }) {
  const color = ROLE_COLORS[agent.role] || '#6C5CE7';
  const spent = spend?.totalUsd || 0;
  const limit = agent.budgetMonthly || 50;

  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${color}18` }}>
          {agent.avatar || '🤖'}
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: '#0A0A1A' }}>{agent.name}</div>
          <div className="text-xs capitalize" style={{ color: '#94A3B8' }}>{agent.role}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="font-bold text-lg" style={{ color }}>
            ${spent.toFixed(2)}
          </div>
          <div className="text-xs" style={{ color: '#94A3B8' }}>this month</div>
        </div>
      </div>
      <SpendGauge spent={spent} limit={limit} color={color} />
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function BudgetView() {
  const { agents, activeCompanyId } = useCompany();
  const [spendMap, setSpendMap] = useState({}); // agentId → {total, events}

  useEffect(() => {
    if (!activeCompanyId) return;
    const unsubs = agents.map(agent => {
      return subscribeAgentSpend(activeCompanyId, agent.id, (data) => {
        setSpendMap(m => ({ ...m, [agent.id]: data }));
      });
    });
    return () => unsubs.forEach(u => u && u());
  }, [agents, activeCompanyId]);

  const totalSpend = Object.values(spendMap).reduce((sum, s) => sum + (s?.totalUsd || 0), 0);
  const totalBudget = agents.reduce((sum, a) => sum + (a.budgetMonthly || 50), 0);

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(180deg,#EEF0F8 0%,#F8FAFF 40%,#FFF 100%)' }}>

      {/* Header */}
      <div className="px-8 py-5 flex-shrink-0">
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#0A0A1A' }}>Budget</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-2">
          {[
            { label: 'Total Spent (MTD)',  value: `$${totalSpend.toFixed(2)}`,  icon: DollarSign,   color: '#6C5CE7' },
            { label: 'Monthly Budget',     value: `$${totalBudget}`,            icon: TrendingUp,   color: '#00B894' },
            { label: 'Burn Rate',          value: totalBudget > 0 ? `${((totalSpend / totalBudget) * 100).toFixed(0)}%` : '0%',
              icon: AlertTriangle, color: totalSpend / totalBudget >= 0.8 ? '#F59E0B' : '#94A3B8' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} style={{ color: s.color }} />
                  <span className="text-xs" style={{ color: '#94A3B8' }}>{s.label}</span>
                </div>
                <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-agent grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <span className="text-5xl">💸</span>
            <p className="text-sm" style={{ color: '#94A3B8' }}>No agents to show budget for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map(agent => (
              <AgentBudgetCard key={agent.id} agent={agent} spend={spendMap[agent.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
