import { useState, useRef, useEffect } from 'react';
import {
  Home, Briefcase, Inbox, Zap, Settings,
  LogOut, ChevronDown, Plus, Bell, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { ROLE_COLORS, AGENT_STATUS, getRoleEmoji } from '@/lib/agentService';

// ── Status dot ────────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const map = {
    [AGENT_STATUS.ACTIVE]:           { color: '#10B981', pulse: true },
    [AGENT_STATUS.SLEEPING]:         { color: '#F59E0B', pulse: false },
    [AGENT_STATUS.PAUSED]:           { color: '#94A3B8', pulse: false },
    [AGENT_STATUS.ERROR]:            { color: '#EF4444', pulse: true },
    [AGENT_STATUS.PENDING_APPROVAL]: { color: '#8B5CF6', pulse: true },
    [AGENT_STATUS.TERMINATED]:       { color: '#CBD5E1', pulse: false },
  };
  const { color, pulse } = map[status] || { color: '#CBD5E1', pulse: false };
  return (
    <span className="relative flex-shrink-0" style={{ width: 8, height: 8 }}>
      <span className="block rounded-full w-2 h-2" style={{ background: color }} />
      {pulse && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-50"
          style={{ background: color }} />
      )}
    </span>
  );
}

// ── Nav button ────────────────────────────────────────────────────────────────
function NavBtn({ icon: Icon, label, id, active, onClick, badgeCount, badge, activeIds }) {
  const isActive = activeIds ? activeIds.includes(active) : active === id;
  return (
    <button
      onClick={() => onClick(id)}
      data-active={isActive ? 'true' : 'false'}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium nav-pill group/nav"
      style={{
        color: isActive ? '#5B5FFF' : '#64748B',
        background: isActive
          ? 'linear-gradient(135deg, rgba(91,95,255,0.10), rgba(99,102,241,0.07))'
          : 'transparent',
        fontWeight: isActive ? 700 : 500,
        borderLeft: isActive ? '2px solid rgba(91,95,255,0.40)' : '2px solid transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(91,95,255,0.06)';
          e.currentTarget.style.color = '#5B5FFF';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#64748B';
        }
      }}
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
        style={{ background: isActive ? 'rgba(91,95,255,0.12)' : 'transparent' }}>
        <Icon size={14} strokeWidth={isActive ? 2.3 : 1.9} style={{ transition: 'stroke-width 150ms' }} />
      </div>
      <span className="flex-1 text-left truncate text-[13px]">{label}</span>

      {badgeCount > 0 && (
        <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-white px-1"
          style={{ background: '#EF4444', boxShadow: '0 2px 6px rgba(239,68,68,0.35)' }}>
          {badgeCount}
        </span>
      )}

      {badge && !badgeCount && (
        <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(91,95,255,0.07)', color: '#5B5FFF' }}>{badge}</span>
      )}
    </button>
  );
}

// ── Agent row ─────────────────────────────────────────────────────────────────
function AgentRow({ agent }) {
  const color = ROLE_COLORS[agent.role] || '#5B5FFF';
  const emoji = getRoleEmoji(agent);
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/dashboard/chat?agent=${encodeURIComponent(agent.name)}`)}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-150"
      style={{ color: '#64748B' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.04)'; e.currentTarget.style.color = '#5B5FFF'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
    >
      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        {emoji}
      </div>
      <span className="flex-1 text-left text-xs font-medium truncate">{agent.name}</span>
      <StatusDot status={agent.status} />
    </button>
  );
}

// ── User menu ─────────────────────────────────────────────────────────────────
function UserMenu({ onClose, onSettings, onLogout, user }) {
  const name = user?.full_name || user?.displayName || 'User';
  const email = user?.email || '';
  const initial = name[0]?.toUpperCase() || 'U';
  return (
    <div className="absolute bottom-16 left-2 right-2 rounded-2xl overflow-hidden z-50"
      style={{
        background: 'rgba(255,255,255,0.99)',
        border: '1px solid rgba(91,95,255,0.1)',
        boxShadow: '0 -8px 32px rgba(91,95,255,0.10), 0 4px 24px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(12px)',
      }}>
      <div className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #5B5FFF, #2563EB)' }}>
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#0A0F1E' }}>{name}</p>
          <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{email}</p>
        </div>
      </div>
      <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(91,95,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-semibold" style={{ color: '#64748B' }}>All systems operational</span>
        </div>
      </div>
      <button onClick={() => { onSettings(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
        style={{ color: '#374151', borderBottom: '1px solid rgba(91,95,255,0.05)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <Settings size={14} strokeWidth={1.8} /><span>Settings</span>
      </button>
      <button onClick={() => { onLogout(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
        style={{ color: '#EF4444' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <LogOut size={14} strokeWidth={1.8} /><span>Sign out</span>
      </button>
    </div>
  );
}

// ── Company switcher dropdown ─────────────────────────────────────────────────
function CompanySwitcher({ company, allCompanies, activeCompanyId, onSwitch, onNew, onClose }) {
  return (
    <div className="absolute top-16 left-2 right-2 rounded-2xl overflow-hidden z-50"
      style={{
        background: 'rgba(255,255,255,0.99)',
        border: '1px solid rgba(91,95,255,0.12)',
        boxShadow: '0 12px 40px rgba(91,95,255,0.15)',
      }}>
      <div className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
        <span className="text-[9px] font-black tracking-[0.12em] uppercase" style={{ color: '#C7D0E8' }}>Workspaces</span>
      </div>
      <div className="py-1 max-h-48 overflow-y-auto">
        {allCompanies.map(co => (
          <button key={co.id} onClick={() => { onSwitch(co.id); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
              {co.name?.[0]?.toUpperCase() || 'F'}
            </div>
            <span className="flex-1 text-sm font-semibold truncate" style={{ color: '#0A0F1E' }}>{co.name}</span>
            {co.id === activeCompanyId && (
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#5B5FFF' }} />
            )}
          </button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(91,95,255,0.07)' }}>
        <button onClick={() => { onNew(); onClose(); }}
          className="w-full flex items-center gap-2.5 px-3 py-3 text-sm font-semibold transition-colors"
          style={{ color: '#5B5FFF' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Plus size={14} /> New company
        </button>
      </div>
    </div>
  );
}

// ── Nav items config ──────────────────────────────────────────────────────────
// id = what we call onNav with; activeIds = which route segments match as "active"
const NAV_ITEMS = [
  { icon: Home,     label: 'Home',      id: 'home',      activeIds: ['home', ''] },
  { icon: Briefcase,label: 'Work',      id: 'projects',  activeIds: ['projects', 'goals', 'tasks', 'files'] },
  { icon: Users,    label: 'Team',      id: 'agents',    activeIds: ['agents', 'chat', 'orgchart'] },
  { icon: Inbox,    label: 'Inbox',     id: 'inbox',     activeIds: ['inbox'], hasBadge: true },
  { icon: Zap,      label: 'Playbooks', id: 'automations',activeIds: ['automations', 'routines', 'skills'], badge: 'Beta' },
  { icon: Settings, label: 'Settings',  id: 'settings',  activeIds: ['settings', 'credits', 'integrations'] },
];

// ── Main sidebar ──────────────────────────────────────────────────────────────
export default function DashboardSidebar({ active, onNav }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { company, allCompanies, agents, activeCompanyId, pendingApprovals, switchCompany } = useCompany();
  const [showMenu, setShowMenu] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const menuRef = useRef(null);
  const switcherRef = useRef(null);

  const name = user?.full_name || user?.displayName || 'User';
  const initial = name[0]?.toUpperCase() || 'U';
  const approvalCount = pendingApprovals.length;

  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (switcherRef.current && !switcherRef.current.contains(e.target)) setShowSwitcher(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const visibleAgents = agents.filter(a => a.status !== AGENT_STATUS.TERMINATED).slice(0, 6);

  return (
    <aside
      className="flex-shrink-0 flex flex-col h-full m-2 rounded-2xl overflow-visible relative"
      style={{
        width: 220,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(91,95,255,0.08)',
        boxShadow: '0 8px 32px rgba(91,95,255,0.07), inset 0 1px 0 rgba(255,255,255,0.8)',
      }}
    >
      {showMenu && (
        <div ref={menuRef}>
          <UserMenu
            user={user}
            onClose={() => setShowMenu(false)}
            onSettings={() => navigate('/dashboard/settings')}
            onLogout={logout}
          />
        </div>
      )}

      {showSwitcher && (
        <div ref={switcherRef}>
          <CompanySwitcher
            company={company}
            allCompanies={allCompanies}
            activeCompanyId={activeCompanyId}
            onSwitch={switchCompany}
            onNew={() => onNav('companies')}
            onClose={() => setShowSwitcher(false)}
          />
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 12px rgba(91,95,255,0.35)' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-white opacity-95" />
          </div>
          <span className="font-black text-sm tracking-tight" style={{ color: '#0A0F1E' }}>Freemi</span>
        </div>

        {/* Company switcher pill */}
        <button
          onClick={() => setShowSwitcher(s => !s)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl min-w-0 max-w-[90px] transition-all flex-shrink-0"
          style={{
            background: showSwitcher ? 'rgba(91,95,255,0.10)' : 'rgba(91,95,255,0.05)',
            border: '1px solid rgba(91,95,255,0.12)',
          }}
          onMouseEnter={e => { if (!showSwitcher) e.currentTarget.style.background = 'rgba(91,95,255,0.09)'; }}
          onMouseLeave={e => { if (!showSwitcher) e.currentTarget.style.background = 'rgba(91,95,255,0.05)'; }}>
          <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
            {company?.name?.[0]?.toUpperCase() || 'F'}
          </div>
          <span className="text-[10px] font-bold truncate" style={{ color: '#374151' }}>
            {company?.name || 'Co'}
          </span>
          <ChevronDown size={10} style={{ color: '#94A3B8', flexShrink: 0, transform: showSwitcher ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
        </button>

        {approvalCount > 0 && (
          <button onClick={() => onNav('inbox')}
            className="relative flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#5B5FFF' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Bell size={12} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold text-white flex items-center justify-center"
              style={{ background: '#EF4444' }}>
              {approvalCount}
            </span>
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <NavBtn
            key={item.id}
            icon={item.icon}
            label={item.label}
            id={item.id}
            active={active}
            activeIds={item.activeIds}
            onClick={onNav}
            badgeCount={item.hasBadge ? approvalCount : 0}
            badge={item.badge}
          />
        ))}

        {/* ── Deployed operators ── */}
        <div className="px-3 pt-5 pb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-black tracking-[0.12em] uppercase" style={{ color: '#C7D0E8' }}>
            Operators
          </span>
          <button onClick={() => onNav('agents')}
            className="w-5 h-5 rounded-md flex items-center justify-center transition-colors"
            style={{ color: '#C7D0E8' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.08)'; e.currentTarget.style.color = '#5B5FFF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C7D0E8'; }}>
            <Plus size={11} />
          </button>
        </div>

        {visibleAgents.length === 0 ? (
          <p className="px-3 text-xs font-medium" style={{ color: '#CBD5E1' }}>No operators yet</p>
        ) : (
          visibleAgents.map(agent => (
            <AgentRow key={agent.id} agent={agent} />
          ))
        )}
      </nav>

      {/* ── User row ── */}
      <div className="px-2 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(91,95,255,0.07)' }}>
        <button
          onClick={() => setShowMenu(s => !s)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
          style={{ color: '#374151' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #2563EB)', boxShadow: '0 4px 10px rgba(91,95,255,0.28)' }}>
            {initial}
          </div>
          <span className="text-sm font-semibold truncate flex-1 text-left">{name.split(' ')[0]}</span>
          <ChevronDown size={12} style={{ color: '#CBD5E1', flexShrink: 0, transition: 'transform 150ms' }}
            className={showMenu ? 'rotate-180' : ''} />
        </button>
      </div>
    </aside>
  );
}
