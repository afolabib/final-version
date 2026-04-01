import { useState, useEffect } from 'react';
import { subscribeCostEvents } from '@/lib/costService';

export function useBudget(companyId, agents = []) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!companyId) return;
    const unsub = subscribeCostEvents(companyId, setEvents, 200);
    return unsub;
  }, [companyId]);

  // Build per-agent spend map
  const byAgent = {};
  events.forEach(e => {
    if (!byAgent[e.agentId]) byAgent[e.agentId] = 0;
    byAgent[e.agentId] += e.costUsd || 0;
  });

  const totalSpent = Object.values(byAgent).reduce((s, v) => s + v, 0);

  // Add pct for each agent
  const agentBudgets = agents.map(a => {
    const spent = byAgent[a.id] || 0;
    const limit = a.monthlyBudgetUsd || 20;
    const pct = Math.min(100, Math.round((spent / limit) * 100));
    return { agentId: a.id, name: a.name, spent, limit, pct, isWarning: pct >= 80, isHardStop: pct >= 100 };
  });

  const isOverBudget = agentBudgets.some(b => b.isHardStop);

  return { totalSpent, byAgent, agentBudgets, isOverBudget, events };
}
