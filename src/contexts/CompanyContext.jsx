import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getUserCompanies, subscribeToCompany, markBootstrapped } from '@/lib/companyService';
import { subscribeToAgents } from '@/lib/agentService';
import { subscribeGoals } from '@/lib/goalService';
import { subscribePendingApprovals } from '@/lib/approvalService';
import { subscribeRecentActivity } from '@/lib/activityService';

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const { user } = useAuth();

  const [company, setCompany] = useState(null);
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [agents, setAgents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bootstrapping, setBootstrapping] = useState(false);

  // Derived
  const ceoAgent = agents.find(a => a.role === 'ceo' || a.isCEO) || null;
  const isBootstrapped = !!company?.isBootstrapped;

  // Load user's first company on auth
  useEffect(() => {
    if (!user?.uid) {
      setCompany(null);
      setActiveCompanyId(null);
      setAgents([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getUserCompanies(user.uid).then(companies => {
      if (cancelled) return;
      if (companies.length > 0) {
        setActiveCompanyId(companies[0].id);
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));

    return () => { cancelled = true; };
  }, [user?.uid]);

  // Subscribe to company doc
  useEffect(() => {
    if (!activeCompanyId) return;
    const unsub = subscribeToCompany(activeCompanyId, data => {
      setCompany(data);
      setLoading(false);
    });
    return unsub;
  }, [activeCompanyId]);

  // Subscribe to agents
  useEffect(() => {
    if (!activeCompanyId) return;
    const unsub = subscribeToAgents(activeCompanyId, setAgents);
    return unsub;
  }, [activeCompanyId]);

  // Subscribe to goals
  useEffect(() => {
    if (!activeCompanyId) return;
    const unsub = subscribeGoals(activeCompanyId, setGoals);
    return unsub;
  }, [activeCompanyId]);

  // Subscribe to pending approvals
  useEffect(() => {
    if (!activeCompanyId) return;
    const unsub = subscribePendingApprovals(activeCompanyId, setPendingApprovals);
    return unsub;
  }, [activeCompanyId]);

  // Subscribe to activity
  useEffect(() => {
    if (!activeCompanyId) return;
    const unsub = subscribeRecentActivity(activeCompanyId, setRecentActivity, 50);
    return unsub;
  }, [activeCompanyId]);

  const switchCompany = useCallback((companyId) => {
    setActiveCompanyId(companyId);
    setAgents([]);
    setGoals([]);
    setPendingApprovals([]);
    setRecentActivity([]);
  }, []);

  const onCompanyCreated = useCallback((companyId) => {
    setActiveCompanyId(companyId);
  }, []);

  const onBootstrapComplete = useCallback(async () => {
    if (activeCompanyId) {
      await markBootstrapped(activeCompanyId);
    }
  }, [activeCompanyId]);

  return (
    <CompanyContext.Provider value={{
      company,
      activeCompanyId,
      agents,
      goals,
      pendingApprovals,
      recentActivity,
      ceoAgent,
      loading,
      bootstrapping,
      isBootstrapped,
      switchCompany,
      onCompanyCreated,
      onBootstrapComplete,
      setBootstrapping,
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
