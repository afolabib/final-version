import { useState, useEffect } from 'react';
import { subscribeAgentHeartbeats } from '@/lib/heartbeatService';
import { subscribeTasksByAgent } from '@/lib/taskService';

export function useAgentStatus(agentId, companyId) {
  const [lastRun, setLastRun] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    if (!agentId || !companyId) return;
    const unsub = subscribeAgentHeartbeats(companyId, agentId, runs => {
      setLastRun(runs[0] || null);
    });
    return unsub;
  }, [agentId, companyId]);

  useEffect(() => {
    if (!agentId || !companyId) return;
    const unsub = subscribeTasksByAgent(companyId, agentId, tasks => {
      const inProgress = tasks.find(t => t.status === 'in_progress');
      setCurrentTask(inProgress || null);
      setTaskCount(tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length);
    });
    return unsub;
  }, [agentId, companyId]);

  return { lastRun, currentTask, taskCount };
}
