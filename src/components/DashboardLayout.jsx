import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import DashboardSidebar from './dashboard/DashboardSidebar';
import WidgetSidebar from './dashboard/WidgetSidebar';
import VoiceSidebar from './dashboard/VoiceSidebar';
import WebsiteSidebar from './dashboard/WebsiteSidebar';
import ClipsSidebar from './dashboard/ClipsSidebar';
import ProductTopBar from './dashboard/ProductTopBar';
import ClipsLayout from './clips/shared/ClipsLayout';
import FloatingFreemiChat from './dashboard/FloatingFreemiChat';
import CommandPalette from './dashboard/CommandPalette';
import InteractiveGrid from './InteractiveGrid';
import { CompanyProvider, useCompany } from '@/contexts/CompanyContext';
import { ProductContext } from '@/contexts/ProductContext';
import { WebsiteProvider } from '@/contexts/WebsiteContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import ErrorBoundary from './ErrorBoundary';

const BG = 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)';

const ORBS = [
  { size: 500, x: '5%',  y: '10%', color: 'rgba(91,95,255,0.07)', delay: 0 },
  { size: 350, x: '70%', y: '5%',  color: 'rgba(91,95,255,0.05)', delay: 0.4 },
  { size: 280, x: '55%', y: '65%', color: 'rgba(91,95,255,0.04)', delay: 0.8 },
];

// ── Route → product mapping ──────────────────────────────────────────────────
function routeToProduct(pathname) {
  if (pathname.startsWith('/dashboard/conversations')) return 'widget';
  if (pathname === '/dashboard/widget') return 'widget';
  if (pathname.startsWith('/dashboard/call-log')) return 'voice';
  if (pathname.startsWith('/dashboard/voice-setup')) return 'voice';
  if (pathname.startsWith('/dashboard/website-pages')) return 'website';
  if (pathname.startsWith('/dashboard/website-analytics')) return 'website';
  if (pathname.startsWith('/dashboard/website-settings')) return 'website';
  if (pathname.startsWith('/dashboard/agents')) return 'operators';
  if (pathname.startsWith('/dashboard/automations')) return 'operators';
  if (pathname.startsWith('/dashboard/goals')) return 'operators';
  if (pathname.startsWith('/dashboard/clips')) return 'clips';
  return null;
}

// ── Detect available products from company doc (or infer) ────────────────────
function detectProducts(company, agents) {
  const base = company?.products?.length ? [...company.products] : [];
  if (base.length) {
    // Always surface widget, voice, website regardless of legacy company doc
    if (!base.includes('widget'))  base.push('widget');
    if (!base.includes('voice'))   base.push('voice');
    if (!base.includes('website')) base.push('website');
    return base;
  }
  const detected = [];
  if (agents.length > 0) detected.push('operators');
  detected.push('widget');
  detected.push('voice');
  detected.push('website');
  detected.push('clips');
  return detected;
}

function DashboardContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { isBootstrapped, loading, company, agents, recentActivity } = useCompany();

  const availableProducts = detectProducts(company, agents);
  const [activeProduct, setActiveProduct] = useState(availableProducts[0] || 'widget');

  // Sync product with URL
  useEffect(() => {
    const mapped = routeToProduct(location.pathname);
    if (mapped && availableProducts.includes(mapped)) setActiveProduct(mapped);
  }, [location.pathname]);

  // Sync when available products load
  useEffect(() => {
    if (!availableProducts.includes(activeProduct)) {
      setActiveProduct(availableProducts[0] || 'widget');
    }
  }, [availableProducts.join(',')]);

  // ⌘K
  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPaletteOpen(o => !o); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const active = location.pathname.replace('/dashboard', '').replace(/^\//, '') || 'home';

  // Bootstrap redirect for operators
  useEffect(() => {
    if (activeProduct === 'operators' && !loading && !isBootstrapped &&
        location.pathname !== '/dashboard/companies') {
      navigate('/dashboard/companies', { replace: true });
    }
  }, [loading, isBootstrapped, location.pathname, activeProduct]);

  const handleNav = id => {
    setSidebarOpen(false);
    if (id === 'home') navigate('/dashboard');
    else navigate(`/dashboard/${id}`);
  };

  const handleProductSwitch = product => {
    setActiveProduct(product);
    if (product === 'clips') navigate('/dashboard/clips');
    else navigate('/dashboard');
  };

  const isWidgetMode  = activeProduct === 'widget';
  const isVoiceMode   = activeProduct === 'voice';
  const isWebsiteMode = activeProduct === 'website';
  const isClipsMode   = activeProduct === 'clips';

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: BG }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center ambient-pulse"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 4px 20px rgba(91,95,255,0.4)' }}>
            <div className="w-4 h-4 rounded-full bg-white opacity-90" />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#94A3B8' }}>Loading Freemi…</p>
        </div>
      </div>
    );
  }

  return (
    <ProductContext.Provider value={{ activeProduct, setActiveProduct }}>
      <div className="flex h-screen overflow-hidden relative flex-col" style={{ fontFamily: 'var(--font-body)', background: BG }}>

        <InteractiveGrid />

        {ORBS.map((orb, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2.5, delay: orb.delay, ease: 'easeOut' }}
            className="fixed rounded-full blur-3xl pointer-events-none"
            style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y, background: orb.color, zIndex: 0 }}
          />
        ))}

        {/* Product switcher top bar */}
        <div className="relative z-20 flex-shrink-0">
          <ProductTopBar
            activeProduct={activeProduct}
            onSwitch={handleProductSwitch}
            availableProducts={availableProducts}
          />
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden relative z-10">

          {/* Desktop sidebar */}
          <div className="hidden md:block flex-shrink-0">
            {isClipsMode
              ? <ClipsSidebar active={active} onNav={handleNav} />
              : isWidgetMode
              ? <WidgetSidebar active={active} onNav={handleNav} />
              : isVoiceMode
              ? <VoiceSidebar active={active} onNav={handleNav} />
              : isWebsiteMode
              ? <WebsiteSidebar active={active} onNav={handleNav} />
              : <DashboardSidebar active={active} onNav={handleNav} />
            }
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
                  {isClipsMode
                    ? <ClipsSidebar active={active} onNav={handleNav} />
                    : isWidgetMode
                    ? <WidgetSidebar active={active} onNav={handleNav} />
                    : isVoiceMode
                    ? <VoiceSidebar active={active} onNav={handleNav} />
                    : isWebsiteMode
                    ? <WebsiteSidebar active={active} onNav={handleNav} />
                    : <DashboardSidebar active={active} onNav={handleNav} />
                  }
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main content */}
          <main className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="md:hidden flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl" style={{ color: '#6B7280' }}>
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
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
                    {isClipsMode ? <ClipsLayout><Outlet /></ClipsLayout> : <Outlet />}
                  </ErrorBoundary>
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

        {!isClipsMode && <FloatingFreemiChat />}
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
    </ProductContext.Provider>
  );
}

export default function DashboardLayout() {
  return (
    <CompanyProvider>
      <WebsiteProvider>
        <WidgetProvider>
          <DashboardContent />
        </WidgetProvider>
      </WebsiteProvider>
    </CompanyProvider>
  );
}
