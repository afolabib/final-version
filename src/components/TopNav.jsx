import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, MessageSquare, Phone, Send, Calendar, Bot, Zap, ArrowRight, Pill, Building2, HeartPulse, Briefcase, Package, ShoppingCart, Headphones, TrendingUp, CalendarCheck, Settings } from 'lucide-react';

const productItems = [
  { label: 'Studio', desc: 'AI-powered websites built for you', href: '/products/studio', Icon: Globe, accent: '#7B61FF' },
  { label: 'Concierge', desc: 'AI chat widget on your website', href: '/products/concierge', Icon: MessageSquare, accent: '#2F8FFF' },
  { label: 'Voice', desc: 'AI phone agent for every call', href: '/products/voice', Icon: Phone, accent: '#27C087' },
  { label: 'WhatsApp', desc: 'Auto-reply AI agent', href: '/products/whatsapp', Icon: Send, accent: '#25D366' },
  { label: 'Bookings', desc: 'AI appointment system', href: '/products/bookings', Icon: Calendar, accent: '#F59E0B' },
];

const industryItems = [
  { label: 'Pharmacy', href: '/solutions/pharmacy', Icon: Pill, accent: '#E84393' },
  { label: 'Hospitality', href: '/industries/hospitality', Icon: Building2, accent: '#F59E0B' },
  { label: 'Healthcare', href: '/industries/healthcare', Icon: HeartPulse, accent: '#27C087' },
  { label: 'Agencies', href: '/industries/agencies', Icon: Briefcase, accent: '#7B61FF' },
  { label: 'Logistics', href: '/industries/logistics', Icon: Package, accent: '#2F8FFF' },
  { label: 'E-Commerce', href: '/industries/ecommerce', Icon: ShoppingCart, accent: '#E84393' },
];

const useCaseItems = [
  { label: 'Customer Support', href: '/solutions/ai-operators', Icon: Headphones },
  { label: 'Sales & Leads', href: '/solutions/ai-operators', Icon: TrendingUp },
  { label: 'Bookings & Calendar', href: '/products/bookings', Icon: CalendarCheck },
  { label: 'Operations', href: '/solutions/ai-operators', Icon: Settings },
];

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
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

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const closeAll = () => { setProductsOpen(false); setSolutionsOpen(false); setMenuOpen(false); };

  const DropdownCard = ({ children, width = 480 }) => (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2"
      style={{ width }}>
      <div className="flex justify-center mb-1">
        <div className="w-2.5 h-2.5 rotate-45 rounded-sm" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', marginBottom: -6 }} />
      </div>
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(40px)', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)' }}>
        {children}
      </div>
    </motion.div>
  );

  const NavItem = ({ item, onClick }) => (
    <Link to={item.href} onClick={onClick}
      className="group flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-150 hover:bg-purple-50/50">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-150 group-hover:scale-110"
        style={{ background: `${item.accent}12` }}>
        <item.Icon size={15} strokeWidth={2} style={{ color: item.accent }} />
      </div>
      <div>
        <div className="text-sm font-semibold text-surface">{item.label}</div>
        {item.desc && <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>}
      </div>
    </Link>
  );

  return (
    <motion.header
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(200%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 30px rgba(123,97,255,0.08)' : 'none',
      }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <button className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity bg-none border-none p-0"
          onClick={() => location.pathname === '/' ? scrollTo('hero') : navigate('/')}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 2px 12px rgba(123,97,255,0.35)' }}>
            <div className="w-3 h-3 rounded-full bg-white/90" />
          </div>
          <span className="font-bold text-surface text-base tracking-tight">Freemi</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">

          {/* Products dropdown */}
          <div className="relative"
            onMouseEnter={() => { setProductsOpen(true); setSolutionsOpen(false); }}
            onMouseLeave={() => setProductsOpen(false)}>
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all rounded-full"
              style={{ color: productsOpen ? '#7B61FF' : '#6B7280', background: productsOpen ? 'rgba(123,97,255,0.07)' : 'transparent' }}>
              Products
              <ChevronDown size={13} strokeWidth={2.5} className={`transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {productsOpen && (
                <DropdownCard width={340}>
                  <div className="px-5 pt-5 pb-3">
                    <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-400">AI Products</span>
                  </div>
                  <div className="px-3 pb-3 space-y-0.5">
                    {productItems.map(p => <NavItem key={p.href} item={p} onClick={closeAll} />)}
                  </div>
                  <div className="mx-3 mb-3 px-4 py-3 rounded-xl flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.05), rgba(47,143,255,0.04))', border: '1px solid rgba(123,97,255,0.08)' }}>
                    <div>
                      <div className="text-xs font-semibold text-surface">See all products</div>
                      <div className="text-[11px] text-gray-400">Compare features & pricing</div>
                    </div>
                    <button onClick={() => { closeAll(); navigate('/'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 300); }}
                      className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ color: '#7B61FF', background: 'rgba(123,97,255,0.08)' }}>
                      Pricing <ArrowRight size={11} />
                    </button>
                  </div>
                </DropdownCard>
              )}
            </AnimatePresence>
          </div>

          {/* Solutions dropdown */}
          <div className="relative"
            onMouseEnter={() => { setSolutionsOpen(true); setProductsOpen(false); }}
            onMouseLeave={() => setSolutionsOpen(false)}>
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all rounded-full"
              style={{ color: solutionsOpen ? '#7B61FF' : '#6B7280', background: solutionsOpen ? 'rgba(123,97,255,0.07)' : 'transparent' }}>
              Solutions
              <ChevronDown size={13} strokeWidth={2.5} className={`transition-transform duration-200 ${solutionsOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {solutionsOpen && (
                <DropdownCard width={520}>
                  <div className="grid grid-cols-2 divide-x divide-gray-100/50">
                    {/* Industries */}
                    <div className="p-4">
                      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-400 px-3">By Industry</span>
                      <div className="mt-3 space-y-0.5">
                        {industryItems.map(item => (
                          <Link key={item.href} to={item.href} onClick={closeAll}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-purple-50/50 transition-colors">
                            <item.Icon size={14} style={{ color: item.accent }} />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                    {/* Use Cases */}
                    <div className="p-4">
                      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-400 px-3">By Use Case</span>
                      <div className="mt-3 space-y-0.5">
                        {useCaseItems.map(item => (
                          <Link key={item.label} to={item.href} onClick={closeAll}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-purple-50/50 transition-colors">
                            <item.Icon size={14} className="text-gray-400" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </DropdownCard>
              )}
            </AnimatePresence>
          </div>

          <Link to="/how-it-works"
            className="px-4 py-2 text-sm font-medium transition-all rounded-full"
            style={{ color: isActive('/how-it-works') ? '#7B61FF' : '#6B7280', background: isActive('/how-it-works') ? 'rgba(123,97,255,0.07)' : 'transparent' }}>
            How It Works
          </Link>

          <button
            onClick={() => {
              if (location.pathname !== '/') { navigate('/'); setTimeout(() => scrollTo('pricing'), 400); }
              else { scrollTo('pricing'); }
            }}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-surface transition-all rounded-full hover:bg-black/[0.03]">
            Pricing
          </button>

          <Link to="/blog"
            className="px-4 py-2 text-sm font-medium transition-all rounded-full"
            style={{ color: isActive('/blog') ? '#7B61FF' : '#6B7280', background: isActive('/blog') ? 'rgba(123,97,255,0.07)' : 'transparent' }}>
            Blog
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          <a href="https://studio.freemi.ai" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-surface font-medium transition-colors px-3 py-2">Sign in</a>
          <button onClick={() => window.open('https://studio.freemi.ai', '_blank')}
            className="btn-press px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all"
            style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 4px 16px rgba(123,97,255,0.3)' }}>
            Start free trial →
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="space-y-1.5">
            <div className={`w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white/96 backdrop-blur-xl border-b border-gray-100 px-5 py-4 space-y-0.5 max-h-[80vh] overflow-y-auto">

          <div className="text-[9px] font-bold tracking-[0.18em] uppercase px-3 pt-1 pb-2 text-gray-400">Products</div>
          {productItems.map(s => (
            <Link key={s.href} to={s.href} onClick={closeAll}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-purple-50/50">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.accent}10` }}>
                <s.Icon size={13} strokeWidth={2} style={{ color: s.accent }} />
              </div>
              <span className="text-sm font-medium text-gray-700">{s.label}</span>
            </Link>
          ))}

          <div className="h-px mx-2 my-2 bg-gray-100" />

          <div className="text-[9px] font-bold tracking-[0.18em] uppercase px-3 pt-1 pb-2 text-gray-400">Solutions</div>
          {industryItems.map(s => (
            <Link key={s.href} to={s.href} onClick={closeAll}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 font-medium hover:bg-purple-50/50">
              <s.Icon size={13} style={{ color: s.accent }} />
              {s.label}
            </Link>
          ))}

          <div className="h-px mx-2 my-2 bg-gray-100" />

          <Link to="/how-it-works" onClick={closeAll} className="block px-3 py-2.5 text-sm text-gray-600 font-medium rounded-xl hover:bg-gray-50">How It Works</Link>
          <button onClick={() => { navigate('/'); setTimeout(() => scrollTo('pricing'), 300); closeAll(); }}
            className="block w-full text-left px-3 py-2.5 text-sm text-gray-600 font-medium rounded-xl hover:bg-gray-50">Pricing</button>
          <Link to="/blog" onClick={closeAll} className="block px-3 py-2.5 text-sm text-gray-600 font-medium rounded-xl hover:bg-gray-50">Blog</Link>

          <div className="pt-3 pb-1 space-y-2">
            <a href="https://studio.freemi.ai" target="_blank" rel="noopener noreferrer" className="block w-full text-center px-4 py-2.5 text-sm font-medium text-gray-500 rounded-full border border-gray-200">Sign in</a>
            <button onClick={() => { window.open('https://studio.freemi.ai', '_blank'); closeAll(); }}
              className="w-full px-4 py-3 text-sm font-bold text-white rounded-full"
              style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)' }}>
              Start free trial →
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
