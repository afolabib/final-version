import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import ClipsSidebar from '@/components/dashboard/ClipsSidebar';
import ClipsLayout from './shared/ClipsLayout';
import { ClipsProvider } from '@/contexts/ClipsContext';

export default function ClipsAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const active = location.pathname.replace('/clips/', '').replace('/clips', '') || 'clips';

  const handleNav = (id) => {
    setSidebarOpen(false);
    if (id === 'clips') navigate('/clips/studio');
    else navigate(`/clips/studio/${id.replace('clips/', '')}`);
  };

  return (
    <ClipsProvider>
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'var(--font-body)', background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <ClipsSidebar active={active} onNav={handleNav} />
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
              <ClipsSidebar active={active} onNav={handleNav} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl" style={{ color: '#6B7280' }}>
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm" style={{ color: '#0A0F1E' }}>FreemiClips</span>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} className="h-full overflow-y-auto"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}>
              <ClipsLayout>
                <Outlet />
              </ClipsLayout>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
    </ClipsProvider>
  );
}
