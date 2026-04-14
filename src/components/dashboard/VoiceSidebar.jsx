import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, PhoneCall, Settings2, Plug2,
  Settings, LifeBuoy, LogOut, ChevronDown, CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';

const NAV = [
  { id: 'home',      label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'call-log',  label: 'Call log',   icon: PhoneCall },
];

const CONFIG_NAV = [
  { id: 'voice-setup',   label: 'Voice Setup',   icon: Settings2 },
  { id: 'integrations',  label: 'Integrations',  icon: Plug2 },
  { id: 'settings',      label: 'Settings',      icon: Settings },
  { id: 'credits',       label: 'Billing',       icon: CreditCard },
  { id: 'support',       label: 'Support',       icon: LifeBuoy },
];

function NavItem({ item, active, onClick, badge }) {
  const isActive = active === item.id;
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150"
      style={{
        color: isActive ? '#5B5FFF' : '#64748B',
        background: isActive ? 'rgba(91,95,255,0.09)' : 'transparent',
        fontWeight: isActive ? 700 : 500,
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(91,95,255,0.05)'; e.currentTarget.style.color = '#334155'; } }}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; } }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
        style={{ background: isActive ? 'rgba(91,95,255,0.15)' : 'rgba(0,0,0,0.03)' }}>
        <Icon size={14} strokeWidth={isActive ? 2.3 : 1.9} />
      </div>
      <span className="flex-1 text-left">{item.label}</span>
      {badge > 0 && (
        <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white flex-shrink-0"
          style={{ background: '#5B5FFF' }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

function UserMenu({ user, onClose, onSettings, onLogout }) {
  const name = user?.full_name || user?.displayName || 'User';
  const email = user?.email || '';
  const initial = name[0]?.toUpperCase() || 'U';
  return (
    <div className="absolute bottom-[72px] left-3 right-3 rounded-2xl overflow-hidden z-50"
      style={{
        background: 'white',
        border: '1px solid rgba(91,95,255,0.1)',
        boxShadow: '0 -4px 32px rgba(91,95,255,0.12), 0 8px 32px rgba(0,0,0,0.08)',
      }}>
      <div className="flex items-center gap-3 px-4 py-3.5"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #5B5FFF, #5B5FFF)' }}>
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#0A0F1E' }}>{name}</p>
          <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{email}</p>
        </div>
      </div>
      {[
        { label: 'Settings', icon: Settings, action: onSettings },
        { label: 'Sign out', icon: LogOut, action: onLogout, danger: true },
      ].map(item => (
        <button key={item.label}
          onClick={() => { item.action(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
          style={{ color: item.danger ? '#EF4444' : '#374151', borderTop: '1px solid rgba(0,0,0,0.04)' }}
          onMouseEnter={e => e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.04)' : 'rgba(91,95,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <item.icon size={14} strokeWidth={1.8} />
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function VoiceSidebar({ active, onNav, callCount = 0 }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { company } = useCompany();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const name = user?.full_name || user?.displayName || 'User';
  const initial = name[0]?.toUpperCase() || 'U';

  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <aside className="flex flex-col h-full m-2 rounded-2xl overflow-visible relative"
      style={{
        width: 228,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(91,95,255,0.08)',
        boxShadow: '0 4px 24px rgba(91,95,255,0.06)',
      }}>

      {showMenu && (
        <div ref={menuRef}>
          <UserMenu user={user} onClose={() => setShowMenu(false)} onSettings={() => navigate('/dashboard/settings')} onLogout={logout} />
        </div>
      )}

      {/* Company header */}
      <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #5B5FFF)', boxShadow: '0 3px 10px rgba(91,95,255,0.3)' }}>
            {company?.name?.[0]?.toUpperCase() || 'F'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate leading-tight" style={{ color: '#0A0F1E' }}>
              {company?.name || 'My Business'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] font-semibold" style={{ color: '#5B5FFF' }}>Voice active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV.map(item => (
          <NavItem
            key={item.id}
            item={item}
            active={active}
            onClick={onNav}
            badge={item.id === 'call-log' ? callCount : 0}
          />
        ))}

        <div className="pt-5 pb-1.5 px-1">
          <span className="text-[9px] font-black tracking-[0.14em] uppercase" style={{ color: '#C7D0E8' }}>
            Configure
          </span>
        </div>

        {CONFIG_NAV.map(item => (
          <NavItem key={item.id} item={item} active={active} onClick={onNav} />
        ))}
      </nav>

      {/* User row */}
      <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <button
          onClick={() => setShowMenu(s => !s)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #5B5FFF)' }}>
            {initial}
          </div>
          <span className="text-sm font-medium flex-1 text-left truncate" style={{ color: '#374151' }}>
            {name.split(' ')[0]}
          </span>
          <ChevronDown size={12} style={{ color: '#CBD5E1', transition: 'transform 150ms', transform: showMenu ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>
    </aside>
  );
}
