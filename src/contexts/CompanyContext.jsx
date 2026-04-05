import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getUserCompanies, subscribeToCompany, markBootstrapped } from '@/lib/companyService';
import { subscribeToAgents } from '@/lib/agentService';
import { subscribeGoals } from '@/lib/goalService';
import { subscribePendingApprovals } from '@/lib/approvalService';
import { subscribeRecentActivity } from '@/lib/activityService';
import { subscribeTasks } from '@/lib/taskService';
import { subscribeLatestHeartbeats } from '@/lib/heartbeatService';
import { isDemoMode } from '@/lib/firebaseClient';

const CompanyContext = createContext(null);

function getOrCreateGuestId() {
  let id = localStorage.getItem('freemi_guest_id');
  if (!id) {
    id = 'guest-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('freemi_guest_id', id);
  }
  return id;
}

export function CompanyProvider({ children }) {
  const { user } = useAuth();

  const [allCompanies, setAllCompanies]       = useState([]);
  const [company, setCompany]                 = useState(null);
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [agents, setAgents]                   = useState([]);
  const [goals, setGoals]                     = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentActivity, setRecentActivity]   = useState([]);
  const [tasks, setTasks]                     = useState([]);
  const [heartbeats, setHeartbeats]           = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [bootstrapping, setBootstrapping]     = useState(false);

  // Derived
  const ceoAgent      = agents.find(a => a.role === 'ceo' || a.isCEO) || null;
  const isBootstrapped = !!company?.isBootstrapped;

  // ── Load all user companies on auth ────────────────────────────────────────
  useEffect(() => {
    const uid = user?.uid || getOrCreateGuestId();
    let cancelled = false;
    setLoading(true);

    const timeout = isDemoMode ? null : setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 4000);

    getUserCompanies(uid).then(companies => {
      if (timeout) clearTimeout(timeout);
      if (cancelled) return;
      setAllCompanies(companies);
      if (companies.length > 0) {
        // Restore last active company from localStorage
        const stored = localStorage.getItem('freemi_active_company');
        const valid  = companies.find(c => c.id === stored);
        setActiveCompanyId(valid ? valid.id : companies[0].id);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (timeout) clearTimeout(timeout);
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; if (timeout) clearTimeout(timeout); };
  }, [user?.uid]);

  // ── Subscribe to active company doc ────────────────────────────────────────
  useEffect(() => {
    if (!activeCompanyId) return;
    localStorage.setItem('freemi_active_company', activeCompanyId);
    const unsub = subscribeToCompany(activeCompanyId, data => {
      setCompany(data);
      setLoading(false);
    });
    return unsub;
  }, [activeCompanyId]);

  // ── Subscribe to agents ────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeCompanyId) return;
    return subscribeToAgents(activeCompanyId, setAgents);
  }, [activeCompanyId]);

  // ── Subscribe to goals ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeCompanyId) return;
    return subscribeGoals(activeCompanyId, setGoals);
  }, [activeCompanyId]);

  // ── Subscribe to approvals ─────────────────────────────────────────────────
  useEffect(() => {
    if (!activeCompanyId) return;
    return subscribePendingApprovals(activeCompanyId, setPendingApprovals);
  }, [activeCompanyId]);

  // ── Subscribe to activity ──────────────────────────────────────────────────
  useEffect(() => {
    if (!activeCompanyId) return;
    return subscribeRecentActivity(activeCompanyId, setRecentActivity, 50);
  }, [activeCompanyId]);

  // ── Subscribe to tasks ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeCompanyId) return;
    return subscribeTasks(activeCompanyId, setTasks);
  }, [activeCompanyId]);

  // ── Subscribe to heartbeats ────────────────────────────────────────────────
  useEffect(() => {
    if (!activeCompanyId) return;
    return subscribeLatestHeartbeats(activeCompanyId, setHeartbeats, 20);
  }, [activeCompanyId]);

  // ── Switch active company ──────────────────────────────────────────────────
  const switchCompany = useCallback((companyId) => {
    setActiveCompanyId(companyId);
    setCompany(null);
    setAgents([]);
    setGoals([]);
    setPendingApprovals([]);
    setRecentActivity([]);
    setTasks([]);
    setHeartbeats([]);
  }, []);

  // ── After creating a new company ───────────────────────────────────────────
  const onCompanyCreated = useCallback((companyId, companyData) => {
    if (companyData) {
      setAllCompanies(prev => {
        const exists = prev.find(c => c.id === companyId);
        return exists ? prev : [...prev, { id: companyId, ...companyData }];
      });
    }
    setActiveCompanyId(companyId);
  }, []);

  const onBootstrapComplete = useCallback(async () => {
    if (activeCompanyId) await markBootstrapped(activeCompanyId);
  }, [activeCompanyId]);

  return (
    <CompanyContext.Provider value={{
      allCompanies,
      company,
      activeCompanyId,
      agents,
      goals,
      tasks,
      heartbeats,
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
