import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardSidebar from './dashboard/DashboardSidebar';
import Header from './Header';

export default function AdminDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const active = location.pathname.replace('/admin', '').replace('/', '') || 'home';

  const handleNav = (id) => {
    if (id === 'home') navigate('/admin');
    else navigate(`/admin/${id}`);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'Inter, sans-serif', background: '#F0F4FF' }}>
      <DashboardSidebar active={active} onNav={handleNav} />

      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 100%)' }}>
        <Header />

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
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}