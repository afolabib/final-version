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
                  style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)', boxShadow: '0 2px 12px rgba(91,95,255,0.3)' }}>
                  <div className="w-3 h-3 rounded-full bg-white/90" />
                </div>
                <span className="font-bold text-surface text-base tracking-tight">Freemi</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[200px]">
                AI operators built for your business — answering customers, booking meetings, following up leads.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Platform</h4>
              <div className="space-y-2.5">
                <Link to="/how-it-works" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">How It Works</Link>
                <Link to="/solutions/ai-operators" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">AI Operators</Link>
                <Link to="/solutions/phone" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Freemi Voice</Link>
                <Link to="/solutions/widget" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Website Widget</Link>
                <Link to="/for-business" className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium">Website Build</Link>
                <button onClick={() => scrollTo('pricing')} className="block text-sm text-gray-500 hover:text-surface transition-colors font-medium text-left">Pricing</button>
              </div>
            </div>

            {/* Use cases */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Use Cases</h4>
              <div className="space-y-2.5">
                <span className="block text-sm text-gray-500 font-medium">Customer Enquiries</span>
                <span className="block text-sm text-gray-500 font-medium">Bookings & Calendar</span>
                <span className="block text-sm text-gray-500 font-medium">Lead Follow-up</span>
                <span className="block text-sm text-gray-500 font-medium">Email & Inbox</span>
                <span className="block text-sm text-gray-500 font-medium">Operations & Tasks</span>
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

          {/* Trust line */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-6 mb-10 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.04)' }}>
            {[
              { icon: '⚡', label: 'Set up in 1–2 days' },
              { icon: '🔗', label: 'Connects to your existing tools' },
              { icon: '💬', label: '24/7 customer responses' },
              { icon: '📊', label: 'Full dashboard visibility' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.06)' }}>
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
              <span>Built for businesses that run on outcomes.</span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </footer>
  );
}