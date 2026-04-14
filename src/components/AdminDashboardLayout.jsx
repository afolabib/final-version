import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, Globe2, Users, MessageSquare,
  Mic, Shield, CreditCard, LogOut, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const NAV = [
  { id: '',         label: 'Overview',  icon: LayoutDashboard },
  { id: 'users',    label: 'Users',     icon: Users },
  { id: 'sites',    label: 'Websites',  icon: Globe2 },
  { id: 'widgets',  label: 'Widgets',   icon: MessageSquare },
  { id: 'voice',    label: 'Voice',     icon: Mic },
  { id: 'billing',  label: 'Billing',   icon: CreditCard },
];

function AdminSidebar({ active, onNav }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full"
      style={{ background: '#0A0D14', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(91,95,255,0.25)' }}>
          <Shield size={14} style={{ color: '#818CF8' }} />
        </div>
        <span className="text-[13px] font-black text-white">Freemi Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all text-left"
              style={{
                background: isActive ? 'rgba(91,95,255,0.18)' : 'transparent',
                color: isActive ? '#A5B4FC' : 'rgba(255,255,255,0.38)',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isActive ? 'rgba(91,95,255,0.18)' : 'transparent'; e.currentTarget.style.color = isActive ? '#A5B4FC' : 'rgba(255,255,255,0.38)'; }}>
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User + back to dashboard */}
      <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/dashboard')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] transition-all"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}>
          <ChevronRight size={12} style={{ transform: 'rotate(180deg)' }} />
          Back to dashboard
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
            {user?.full_name?.[0] || user?.email?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-white truncate">{user?.full_name || 'Admin'}</p>
            <p className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>Internal only</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function AdminDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const active = location.pathname.replace('/admin', '').replace(/^\//, '');

  const handleNav = (id) => navigate(id ? `/admin/${id}` : '/admin');

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <AdminSidebar active={active} onNav={handleNav} />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: '#F4F5FB' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="h-full overflow-y-auto"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
