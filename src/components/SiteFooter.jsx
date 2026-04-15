import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';

export default function SiteFooter() {
  return (
    <footer className="relative pt-16 pb-24 px-6">
      <ScrollReveal>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 md:gap-6 mb-14">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-3 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)', boxShadow: '0 2px 12px rgba(123,97,255,0.3)' }}>
                  <div className="w-3 h-3 rounded-full bg-white/90" />
                </div>
                <span className="font-bold text-surface text-base tracking-tight">Freemi</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[200px]">
                AI agents that run your business — answering customers, booking meetings, handling operations 24/7.
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Products</h4>
              <div className="space-y-2.5">
                <Link to="/products/studio" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Studio</Link>
                <Link to="/products/concierge" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Concierge</Link>
                <Link to="/products/voice" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Voice</Link>
                <Link to="/products/whatsapp" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">WhatsApp</Link>
                <Link to="/products/bookings" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Bookings</Link>
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Solutions</h4>
              <div className="space-y-2.5">
                <Link to="/solutions/pharmacy" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Pharmacy</Link>
                <Link to="/industries/hospitality" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Hospitality</Link>
                <Link to="/industries/healthcare" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Healthcare</Link>
                <Link to="/industries/agencies" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Agencies</Link>
                <Link to="/industries/ecommerce" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">E-Commerce</Link>
                <Link to="/industries/saas" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">SaaS</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Company</h4>
              <div className="space-y-2.5">
                <Link to="/about" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">About</Link>
                <Link to="/blog" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Blog</Link>
                <Link to="/how-it-works" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">How It Works</Link>
                <a href="mailto:hello@freemi.ai" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Contact</a>
              </div>
            </div>

            {/* Apps */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Apps</h4>
              <div className="space-y-2.5">
                <a href="https://studio.freemi.ai" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Freemi Studio →</a>
                <a href="https://pharmacy.freemi.ai" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Freemi Pharmacy →</a>
                <Link to="/login" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Dashboard Login</Link>
              </div>
            </div>
          </div>

          {/* Trust line */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-6 mb-10 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.04)' }}>
            {[
              { icon: '⚡', label: 'Live in 48 hours' },
              { icon: '🔗', label: 'Connects to your tools' },
              { icon: '💬', label: '24/7 AI agents' },
              { icon: '📊', label: 'Full dashboard visibility' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(123,97,255,0.04)', border: '1px solid rgba(123,97,255,0.06)' }}>
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
              <a href="mailto:hello@freemi.ai" className="hover:text-gray-600 transition-colors">hello@freemi.ai</a>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </footer>
  );
}
