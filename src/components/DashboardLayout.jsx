import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import DashboardSidebar from './dashboard/DashboardSidebar';
import FloatingFreemiChat from './dashboard/FloatingFreemiChat';
import InteractiveGrid from './InteractiveGrid';
import { CompanyProvider, useCompany } from '@/contexts/CompanyContext';
import ErrorBoundary from './ErrorBoundary';

const BG = 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)';

const ORBS = [
  { size: 500, x: '5%',  y: '10%', color: 'rgba(91,95,255,0.07)', delay: 0 },
  { size: 350, x: '70%', y: '5%',  color: 'rgba(91,95,255,0.05)', delay: 0.4 },
  { size: 280, x: '55%', y: '65%', color: 'rgba(91,95,255,0.04)', delay: 0.8 },
];

function DashboardContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isBootstrapped, loading } = useCompany();

  const active = location.pathname.replace('/dashboard', '').replace('/', '') || 'home';

  // Redirect to Companies setup page if no company yet
  useEffect(() => {
    if (!loading && !isBootstrapped && location.pathname !== '/dashboard/companies') {
      navigate('/dashboard/companies', { replace: true });
    }
  }, [loading, isBootstrapped, location.pathname]);

  const handleNav = id => {
    setSidebarOpen(false);
    if (id === 'home') navigate('/dashboard');
    else navigate(`/dashboard/${id}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: BG }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center ambient-pulse"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #2563EB)', boxShadow: '0 4px 20px rgba(91,95,255,0.4)' }}>
            <div className="w-4 h-4 rounded-full bg-white opacity-90" />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#94A3B8' }}>Loading Freemi…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ fontFamily: 'var(--font-body)', background: BG }}>

      {/* Homepage-style ambient grid */}
      <InteractiveGrid />

      {/* Floating gradient orbs */}
      {ORBS.map((orb, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.5, delay: orb.delay, ease: 'easeOut' }}
          className="fixed rounded-full blur-3xl pointer-events-none"
          style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y, background: orb.color, zIndex: 0 }}
        />
      ))}

      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0 relative z-10">
        <DashboardSidebar active={active} onNav={handleNav} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -270 }} animate={{ x: 0 }} exit={{ x: -270 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 left-0 bottom-0 z-50 md:hidden">
              <DashboardSidebar active={active} onNav={handleNav} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl transition-colors" style={{ color: '#6B7280' }}>
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #2563EB)' }}>
              <div className="w-2 h-2 rounded-full bg-white/90" />
            </div>
            <span className="font-bold text-sm" style={{ color: '#0A0A1A' }}>Freemi</span>
          </div>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} className="h-full overflow-y-auto"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}>
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Freemi chat — visible on every dashboard page */}
      <FloatingFreemiChat />
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <CompanyProvider>
      <DashboardContent />
    </CompanyProvider>
  );
}
