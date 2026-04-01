import { useState, useRef, useEffect } from 'react';
import {
  Terminal, Users, Target, CheckSquare, Inbox,
  RefreshCw, Plug, Wrench, FolderOpen,
  BarChart2, Settings, HelpCircle, LogOut, ChevronDown,
  Plus, Bell, Building2, Download, Upload, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { ROLE_COLORS, AGENT_STATUS } from '@/lib/agentService';

// ── Status dot ────────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const map = {
    [AGENT_STATUS.ACTIVE]:           { color: '#00B894', pulse: true },
    [AGENT_STATUS.SLEEPING]:         { color: '#FDCB6E', pulse: false },
    [AGENT_STATUS.PAUSED]:           { color: '#B2BEC3', pulse: false },
    [AGENT_STATUS.ERROR]:            { color: '#D63031', pulse: true },
    [AGENT_STATUS.PENDING_APPROVAL]: { color: '#A29BFE', pulse: true },
    [AGENT_STATUS.TERMINATED]:       { color: '#636E72', pulse: false },
  };
  const { color, pulse } = map[status] || { color: '#B2BEC3', pulse: false };
  return (
    <span className="relative flex-shrink-0" style={{ width: 8, height: 8 }}>
      <span className="block rounded-full w-2 h-2" style={{ background: color }} />
      {pulse && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: color }} />
      )}
    </span>
  );
}

// ── Nav button ────────────────────────────────────────────────────────────────
function NavBtn({ icon: Icon, label, id, active, onClick, badge, badgeCount }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
      style={{
        color: isActive ? '#6C5CE7' : '#64748B',
        background: isActive ? 'rgba(108,92,231,0.09)' : 'transparent',
        fontWeight: isActive ? 600 : 500,
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(108,92,231,0.05)'; e.currentTarget.style.color = '#6C5CE7'; }}}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}}
    >
      <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
      <span className="flex-1 text-left truncate">{label}</span>
      {badgeCount > 0 && (
        <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-white px-1"
          style={{ background: '#6C5CE7' }}>{badgeCount}</span>
      )}
      {badge && !badgeCount && (
        <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(108,92,231,0.08)', color: '#6C5CE7' }}>{badge}</span>
      )}
    </button>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label }) {
  return (
    <div className="px-3 pt-5 pb-1.5">
      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#CBD5E1' }}>{label}</span>
    </div>
  );
}

// ── Agent row in sidebar ──────────────────────────────────────────────────────
function AgentRow({ agent, companyId, onClick }) {
  const color = ROLE_COLORS[agent.role] || '#6C5CE7';
  const initial = agent.name?.[0]?.toUpperCase() || '?';
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-150 group"
      style={{ color: '#64748B' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,92,231,0.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
        style={{ background: color, boxShadow: `0 2px 6px ${color}40` }}>
        {initial}
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
    <div className="absolute bottom-16 left-2 right-2 rounded-2xl overflow-hidden z-50 shadow-xl"
      style={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(108,92,231,0.12)' }}>
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid rgba(108,92,231,0.08)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#6C5CE7,#7C6CF7)' }}>{initial}</div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#0A0A1A' }}>{name}</p>
          <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{email}</p>
        </div>
      </div>
      {[{ icon: Settings, label: 'Settings', action: onSettings }].map(item => (
        <button key={item.label} onClick={() => { item.action(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
          style={{ color: '#374151', borderBottom: '1px solid rgba(108,92,231,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,92,231,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <item.icon size={14} strokeWidth={1.8} /><span>{item.label}</span>
        </button>
      ))}
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

// ── Main sidebar ──────────────────────────────────────────────────────────────
export default function DashboardSidebar({ active, onNav }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { company, agents, activeCompanyId, pendingApprovals } = useCompany();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const name = user?.full_name || user?.displayName || 'User';
  const initial = name[0]?.toUpperCase() || 'U';
  const approvalCount = pendingApprovals.length;

  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const visibleAgents = agents.filter(a => a.status !== AGENT_STATUS.TERMINATED).slice(0, 8);

  return (
    <aside
      className="flex-shrink-0 flex flex-col h-full m-2 rounded-2xl overflow-visible relative"
      style={{
        width: 260,
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(108,92,231,0.08)',
        boxShadow: '0 8px 30px rgba(108,92,231,0.07), inset 0 1px 0 rgba(255,255,255,0.6)',
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

      {/* ── Logo + company ── */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(108,92,231,0.07)' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6C5CE7,#7C6CF7)', boxShadow: '0 4px 12px rgba(108,92,231,0.35)' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-white opacity-90" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: '#0A0A1A', lineHeight: 1.2 }}>FreemiOS</p>
            {company?.name && (
              <p className="text-[10px] truncate" style={{ color: '#94A3B8' }}>{company.name}</p>
            )}
          </div>
        </div>
        {approvalCount > 0 && (
          <button onClick={() => onNav('approvals')}
            className="relative flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#6C5CE7' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,92,231,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Bell size={13} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ background: '#D63031' }}>{approvalCount}</span>
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">

        <SectionLabel label="Work" />
        <NavBtn icon={Terminal}    label="Command"      id="home"         active={active} onClick={onNav} />
        <NavBtn icon={Users}       label="Team"         id="agents"       active={active} onClick={onNav} />
        <NavBtn icon={Target}      label="Goals"        id="goals"        active={active} onClick={onNav} />
        <NavBtn icon={CheckSquare} label="Tasks"        id="tasks"        active={active} onClick={onNav} />
        <NavBtn icon={Inbox}       label="Inbox"        id="inbox"        active={active} onClick={onNav}
          badgeCount={approvalCount} />

        <SectionLabel label="Configure" />
        <NavBtn icon={RefreshCw}   label="Routines"     id="routines"     active={active} onClick={onNav} />
        <NavBtn icon={Plug}        label="Integrations" id="integrations" active={active} onClick={onNav} />
        <NavBtn icon={Wrench}      label="Skills"       id="skills"       active={active} onClick={onNav} />
        <NavBtn icon={FolderOpen}  label="Files"        id="files"        active={active} onClick={onNav} />

        <SectionLabel label="Account" />
        <NavBtn icon={BarChart2}   label="Budget"       id="budget"       active={active} onClick={onNav} />
        <NavBtn icon={Settings}    label="Settings"     id="settings"     active={active} onClick={onNav} />
        <NavBtn icon={HelpCircle}  label="Support"      id="support"      active={active} onClick={onNav} />

        {/* ── Agent team ── */}
        {visibleAgents.length > 0 && (
          <>
            <div className="px-3 pt-5 pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#CBD5E1' }}>Your Team</span>
              <button onClick={() => onNav('agents')}
                className="w-5 h-5 rounded-md flex items-center justify-center transition-colors"
                style={{ color: '#CBD5E1' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,92,231,0.08)'; e.currentTarget.style.color = '#6C5CE7'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#CBD5E1'; }}>
                <Plus size={11} />
              </button>
            </div>
            {visibleAgents.map(agent => (
              <AgentRow key={agent.id} agent={agent} companyId={activeCompanyId} onClick={() => onNav('agents')} />
            ))}
          </>
        )}
      </nav>

      {/* ── User row ── */}
      <div className="px-2 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(108,92,231,0.07)' }}>
        <button
          onClick={() => setShowMenu(s => !s)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
          style={{ color: '#374151' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,92,231,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6C5CE7,#7C6CF7)', boxShadow: '0 4px 12px rgba(108,92,231,0.3)' }}>
            {initial}
          </div>
          <span className="text-sm font-semibold truncate flex-1 text-left">{name.split(' ')[0]}</span>
          <ChevronDown size={12} style={{ color: '#CBD5E1', flexShrink: 0 }} />
        </button>
      </div>
    </aside>
  );
}
