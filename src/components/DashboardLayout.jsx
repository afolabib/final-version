import { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import DashboardSidebar from './dashboard/DashboardSidebar';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const active = location.pathname.replace('/dashboard', '').replace('/', '') || 'home';

  const handleNav = (id) => {
    if (id === 'home') navigate('/dashboard');
    else navigate(`/dashboard/${id}`);
  };

  const goToDeploy = () => navigate('/dashboard/picker');

  const handleMobileNav = (id) => {
    handleNav(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'var(--font-body)', background: 'linear-gradient(180deg, #EEF0F8 0%, #F8FAFF 40%, #FFFFFF 100%)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar active={active} onNav={handleNav} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 left-0 bottom-0 z-50 md:hidden"
            >
              <DashboardSidebar active={active} onNav={handleMobileNav} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: 'transparent' }}>
        {/* Mobile header bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl transition-colors" style={{ color: '#6B7280' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,92,231,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)' }}>
              <div className="w-2 h-2 rounded-full bg-white/90" />
            </div>
            <span className="font-bold text-sm" style={{ color: '#0A0A1A' }}>Freemi</span>
          </div>
          <div className="w-9" />
        </div>
        {active === 'agents' && (
          <div className="flex items-center justify-between px-4 md:px-8 py-3.5 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <button onClick={goToDeploy}
              className="ml-auto flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white rounded-full btn-press btn-breathe"
              style={{ background: 'linear-gradient(135deg, #6B63FF, #5B5FFF)', boxShadow: '0 4px 16px rgba(91,95,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
              + Deploy agent
            </button>
          </div>
        )}

        {/* Show Picker/Wizard as full pages instead of modal */}
        {(active === 'picker' || active === 'wizard') && (
          <div className="flex-shrink-0 border-b px-4 md:px-8 py-3.5" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', borderBottomColor: 'rgba(0,0,0,0.04)' }}>
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: '#94A3B8' }}
              onMouseEnter={e => e.currentTarget.style.color = '#5B5FFF'}
              onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
              ← Back to Dashboard
            </button>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="h-full overflow-y-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              <Outlet context={{ goToDeploy }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}