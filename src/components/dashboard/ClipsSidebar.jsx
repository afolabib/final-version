import { LayoutDashboard, Palette, Calendar, BarChart3, Settings, HelpCircle, CreditCard, Film, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { id: '',           path: '',           label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'brand-kit',  path: 'brand-kit',  label: 'Brand Kit',   icon: Palette },
  { id: 'scheduler',  path: 'scheduler',  label: 'Scheduler',   icon: Calendar },
  { id: 'analytics',  path: 'analytics',  label: 'Analytics',   icon: BarChart3 },
];

const CONFIG_ITEMS = [
  { id: 'settings',   path: 'settings',   label: 'Settings',    icon: Settings },
  { id: 'billing',    path: 'settings',   label: 'Billing',     icon: CreditCard },
  { id: 'support',    path: 'settings',   label: 'Support',     icon: HelpCircle },
];

export default function ClipsSidebar({ active, onNav }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect base path — works from both /dashboard/clips and /clips/studio
  const isStandalone = location.pathname.startsWith('/clips/studio');
  const basePath = isStandalone ? '/clips/studio' : '/dashboard/clips';

  const handleNav = (path) => {
    if (onNav) {
      // Dashboard mode: use parent's nav handler
      onNav(path ? `clips/${path}` : 'clips');
    } else {
      // Standalone mode: navigate directly
      navigate(path ? `${basePath}/${path}` : basePath);
    }
  };

  const isActive = (id) => {
    const current = location.pathname;
    if (id === '') return current === basePath || current === `${basePath}/`;
    return current.includes(id);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 240,
        background: 'rgba(255,255,255,0.98)',
        borderRight: '1px solid rgba(91,95,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)',
            boxShadow: '0 4px 16px rgba(91,95,255,0.35)',
          }}
        >
          <Film className="w-4.5 h-4.5 text-white" size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight" style={{ color: '#0A0F1E' }}>FreemiClips</h2>
          <p className="text-[10px] font-medium" style={{ color: '#5B5FFF' }}>
            <Sparkles className="inline w-3 h-3 mr-0.5 -mt-0.5" />AI Video Studio
          </p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 mt-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-2"
          style={{ color: '#94A3B8' }}>
          Studio
        </p>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.id);
          return (
            <motion.button
              key={item.id || 'dashboard'}
              onClick={() => handleNav(item.path)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl mb-0.5 text-left transition-colors relative"
              style={{
                background: active ? 'rgba(91,95,255,0.08)' : 'transparent',
                color: active ? '#5B5FFF' : '#64748B',
              }}
            >
              <item.icon size={17} style={active ? { color: '#5B5FFF' } : {}} />
              <span className="text-[13px] font-medium">{item.label}</span>
              {active && (
                <motion.div
                  layoutId="clips-sidebar-active"
                  className="absolute left-0 w-[3px] h-5 rounded-r-full"
                  style={{ background: '#5B5FFF' }}
                />
              )}
            </motion.button>
          );
        })}

        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-2"
            style={{ color: '#94A3B8' }}>
            Config
          </p>
          {CONFIG_ITEMS.map(item => {
            const active = isActive(item.id);
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNav(item.path)}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl mb-0.5 text-left transition-colors"
                style={{
                  background: active ? 'rgba(91,95,255,0.08)' : 'transparent',
                  color: active ? '#5B5FFF' : '#64748B',
                }}
              >
                <item.icon size={17} />
                <span className="text-[13px] font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Usage indicator */}
      <div className="px-4 py-4 mx-3 mb-3 rounded-xl" style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.08)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-medium" style={{ color: '#64748B' }}>Credits Used</span>
          <span className="text-[11px] font-bold" style={{ color: '#5B5FFF' }}>47/150</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(91,95,255,0.10)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '31%' }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #5B5FFF, #7C3AED)' }}
          />
        </div>
      </div>
    </div>
  );
}
