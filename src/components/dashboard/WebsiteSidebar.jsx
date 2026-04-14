import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, FileText, BarChart2, Globe2,
  Settings, LifeBuoy, LogOut, ChevronDown, Globe, CreditCard,
  Check, Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useWebsite } from '@/contexts/WebsiteContext';
import { MOCK_SITES } from './website/mockWebsite';

const NAV = [
  { id: 'home',              label: 'Dashboard', icon: LayoutDashboard },
  { id: 'website-pages',     label: 'Pages',     icon: FileText },
  { id: 'website-analytics', label: 'Analytics', icon: BarChart2 },
];

const CONFIG_NAV = [
  { id: 'website-settings', label: 'Site Settings', icon: Globe2 },
  { id: 'settings',         label: 'Account',        icon: Settings },
  { id: 'credits',          label: 'Billing',        icon: CreditCard },
  { id: 'support',          label: 'Support',         icon: LifeBuoy },
];

function NavItem({ item, active, onClick }) {
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
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: isActive ? 'rgba(91,95,255,0.15)' : 'rgba(0,0,0,0.03)' }}>
        <Icon size={14} strokeWidth={isActive ? 2.3 : 1.9} />
      </div>
      <span className="flex-1 text-left">{item.label}</span>
    </button>
  );
}

// ── Site switcher ─────────────────────────────────────────────────────────────

function SiteSwitcher({ sites, activeSite, onSwitch }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!activeSite) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all"
        style={{
          background: open ? 'rgba(91,95,255,0.07)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${open ? 'rgba(91,95,255,0.2)' : 'rgba(0,0,0,0.05)'}`,
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'rgba(91,95,255,0.05)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
      >
        {/* Favicon dot */}
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
          <Globe size={11} className="text-white" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[12px] font-bold truncate leading-tight" style={{ color: '#0A0F1E' }}>
            {activeSite.name}
          </p>
          <p className="text-[10px] truncate" style={{ color: '#94A3B8' }}>
            {activeSite.domain}
          </p>
        </div>
        <ChevronDown size={11} style={{
          color: '#94A3B8',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 150ms',
          flexShrink: 0,
        }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl overflow-hidden z-50"
            style={{
              background: 'white',
              border: '1px solid rgba(91,95,255,0.12)',
              boxShadow: '0 8px 32px rgba(91,95,255,0.12), 0 2px 8px rgba(0,0,0,0.08)',
            }}>
            <div className="p-1.5">
              {sites.map(site => {
                const isActive = site.id === activeSite.id;
                return (
                  <button
                    key={site.id}
                    onClick={() => { onSwitch(site.id); setOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left"
                    style={{ background: isActive ? 'rgba(91,95,255,0.07)' : 'transparent' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(91,95,255,0.04)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                      <Globe size={12} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold truncate" style={{ color: '#0A0F1E' }}>{site.name}</p>
                      <p className="text-[10px] truncate" style={{ color: '#94A3B8' }}>{site.domain}</p>
                    </div>
                    {isActive && <Check size={12} strokeWidth={2.5} style={{ color: '#5B5FFF', flexShrink: 0 }} />}
                    {site.status === 'live' && !isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── User menu ─────────────────────────────────────────────────────────────────

function UserMenu({ user, onClose, onSettings, onLogout }) {
  const name    = user?.full_name || user?.displayName || 'User';
  const email   = user?.email || '';
  const initial = name[0]?.toUpperCase() || 'U';
  return (
    <div className="absolute bottom-[72px] left-3 right-3 rounded-2xl overflow-hidden z-50"
      style={{ background: 'white', border: '1px solid rgba(91,95,255,0.1)', boxShadow: '0 -4px 32px rgba(91,95,255,0.1), 0 8px 32px rgba(0,0,0,0.08)' }}>
      <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#0A0F1E' }}>{name}</p>
          <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{email}</p>
        </div>
      </div>
      {[
        { label: 'Settings', icon: Settings, action: onSettings },
        { label: 'Sign out', icon: LogOut,   action: onLogout, danger: true },
      ].map(item => (
        <button key={item.label} onClick={() => { item.action(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
          style={{ color: item.danger ? '#EF4444' : '#374151', borderTop: '1px solid rgba(0,0,0,0.04)' }}
          onMouseEnter={e => e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.04)' : 'rgba(91,95,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <item.icon size={14} strokeWidth={1.8} />{item.label}
        </button>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function WebsiteSidebar({ active, onNav }) {
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { sites, activeSite, setActiveSiteId, loading } = useWebsite();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Fall back to mock sites so switcher is always visible
  const displaySites  = sites.length > 0 ? sites : MOCK_SITES;
  const displayActive = sites.length > 0 ? activeSite : (activeSite || MOCK_SITES[0]);

  const name    = user?.full_name || user?.displayName || 'User';
  const initial = name[0]?.toUpperCase() || 'U';

  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <aside className="flex flex-col h-full m-2 rounded-2xl overflow-visible relative"
      style={{ width: 228, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(91,95,255,0.08)', boxShadow: '0 4px 24px rgba(91,95,255,0.06)' }}>

      {showMenu && (
        <div ref={menuRef}>
          <UserMenu user={user} onClose={() => setShowMenu(false)} onSettings={() => navigate('/dashboard/settings')} onLogout={logout} />
        </div>
      )}

      {/* Site switcher */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[9px] font-black tracking-[0.14em] uppercase" style={{ color: '#C7D0E8' }}>
            Your sites
          </span>
          {displaySites.length > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
              {displaySites.length}
            </span>
          )}
        </div>
        <SiteSwitcher
          sites={displaySites}
          activeSite={displayActive}
          onSwitch={setActiveSiteId}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV.map(item => (
          <NavItem key={item.id} item={item} active={active} onClick={onNav} />
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
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
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
