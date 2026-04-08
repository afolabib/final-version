import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';

export default function SiteFooter() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative pt-16 pb-24 px-6">
      <ScrollReveal>
        <div className="max-w-5xl mx-auto">
          {/* Main footer grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 md:gap-6 mb-14">
            {/* Brand column */}
            <div className="col-span-2 sm:col-span-3 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', boxShadow: '0 2px 12px rgba(108,92,231,0.3)' }}>
                  <div className="w-3 h-3 rounded-full bg-white/90" />
                </div>
                <span className="font-bold text-surface text-base tracking-tight">Freemi</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[200px]">
                AI operators that handle real work, so you don't have to.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Product</h4>
              <div className="space-y-2.5">
                <Link to="/about" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">How It Works</Link>
                <Link to="/solutions" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Solutions</Link>
                <button onClick={() => scrollTo('pricing')} className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium text-left">Pricing</button>
                <button onClick={() => scrollTo('faq')} className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium text-left">FAQ</button>
              </div>
            </div>

            {/* Industries */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Industries</h4>
              <div className="space-y-2.5">
                <Link to="/industries/saas" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">SaaS</Link>
                <Link to="/industries/ecommerce" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">E-Commerce</Link>
                <Link to="/industries/hospitality" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Hospitality</Link>
                <Link to="/industries/healthcare" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Healthcare</Link>
                <Link to="/industries/agencies" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Agencies</Link>
                <Link to="/industries/logistics" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Logistics</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Company</h4>
              <div className="space-y-2.5">
                <Link to="/about" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">About</Link>
                <Link to="/blog" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Blog</Link>
                <a href="#" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Careers</a>
                <a href="mailto:hello@freemi.ai" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Contact</a>
              </div>
            </div>

            {/* Studio */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Studio</h4>
              <div className="space-y-2.5">
                <Link to="/business" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Web Studio</Link>
                <Link to="/business#portfolio" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Portfolio</Link>
                <Link to="/business#pricing" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Build Pricing</Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Legal</h4>
              <div className="space-y-2.5">
                <a href="#" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Privacy Policy</a>
                <a href="#" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Terms of Service</a>
                <a href="#" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Security</a>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-6 mb-10 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.04)' }}>
            {[
              { icon: '🔒', label: 'SOC 2 Compliant' },
              { icon: '🛡️', label: 'Encrypted at Rest' },
              { icon: '📋', label: 'GDPR Ready' },
              { icon: '⚡', label: '99.9% Uptime' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(108,92,231,0.04)', border: '1px solid rgba(108,92,231,0.06)' }}>
                <span className="text-xs">{badge.icon}</span>
                <span className="text-[11px] font-semibold text-gray-500">{badge.label}</span>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
            style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="text-xs text-gray-400">© 2026 Freemi. All rights reserved.</div>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <span>Built for teams that ship.</span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </footer>
  );
}