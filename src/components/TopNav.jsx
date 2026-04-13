import { useState, useEffect } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const lastY = useState(0);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = lastY[0];
    setHidden(y > 200 && y > prev);
    lastY[0] = y;
    setScrolled(y > 40);
  });

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <motion.header
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.04)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity bg-none border-none p-0" onClick={() => location.pathname === '/' ? scrollTo('hero') : navigate('/')}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 2px 12px rgba(91,95,255,0.35)' }}>
            <div className="w-3 h-3 rounded-full bg-white/90" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-surface text-base tracking-tight">Freemi</span>
            <span className="text-xs font-medium text-gray-500 tracking-tight">by Bidemi</span>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: 'How It Works', href: '/about' },
            { label: 'Agents', href: '/solutions' },
            { label: 'Blog', href: '/blog' },
            { label: 'FAQ', id: 'faq' },
          ].map(item => {
            const isActive = item.href && location.pathname === item.href;
            const isPricingActive = item.id === 'pricing' && location.pathname === '/';
            return item.href ? (
              <Link key={item.label} to={item.href}
                className="px-4 py-2 text-sm font-medium transition-all rounded-full"
                style={{
                  color: isActive ? '#5B5FFF' : '#6B7280',
                  background: isActive ? 'rgba(91,95,255,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(91,95,255,0.15)' : '1px solid transparent',
                }}>
                {item.label}
              </Link>
            ) : (
              <button key={item.label} onClick={() => {
                if (location.pathname !== '/') { navigate('/'); setTimeout(() => scrollTo(item.id), 400); }
                else { scrollTo(item.id); }
              }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-surface font-medium transition-all rounded-full hover:bg-black/[0.03]">
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-surface font-medium transition-colors px-3 py-2">Sign in</a>
          <button onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 4px 16px rgba(91,95,255,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(91,95,255,0.45)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,95,255,0.3)'}>
            Launch Freemi →
          </button>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="space-y-1.5">
            <div className={`w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 py-4 space-y-1">
          <Link to="/about" className="block w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:text-surface font-medium rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link to="/solutions" className="block w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:text-surface font-medium rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Agents</Link>
          <button onClick={() => { navigate('/'); setTimeout(() => scrollTo('pricing'), 300); setMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:text-surface font-medium rounded-lg hover:bg-gray-50">Pricing</button>
          <Link to="/blog" className="block w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:text-surface font-medium rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Blog</Link>
          <div className="pt-3 flex flex-col gap-2">
            <button onClick={() => navigate('/dashboard')} className="w-full px-4 py-2.5 text-sm font-semibold text-white rounded-full"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)' }}>Launch Freemi →</button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}