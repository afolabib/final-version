import { Zap, MessageSquare, Globe, Phone, Film } from 'lucide-react';
import { motion } from 'framer-motion';

const PRODUCTS = [
  { id: 'operators', label: 'Operators', icon: Zap },
  { id: 'widget',    label: 'Widget',    icon: MessageSquare },
  { id: 'website',   label: 'Website',   icon: Globe },
  { id: 'voice',     label: 'Voice',     icon: Phone },
  { id: 'clips',     label: 'Clips',     icon: Film },
];

export default function ProductTopBar({ activeProduct, onSwitch, availableProducts }) {
  const visible = PRODUCTS.filter(p => availableProducts.includes(p.id));
  if (visible.length === 0) return null;

  return (
    <div
      className="flex-shrink-0 flex items-center gap-0.5 px-4"
      style={{
        height: 44,
        background: 'rgba(255,255,255,0.98)',
        borderBottom: '1px solid rgba(91,95,255,0.07)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo mark */}
      <div className="flex items-center gap-2 pr-4 mr-2"
        style={{ borderRight: '1px solid rgba(91,95,255,0.08)' }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)', boxShadow: '0 2px 8px rgba(91,95,255,0.3)' }}>
          <div className="w-2 h-2 rounded-full bg-white/90" />
        </div>
        <span className="text-xs font-black tracking-tight" style={{ color: '#0A0F1E' }}>Freemi</span>
      </div>

      {/* Product tabs */}
      {visible.map(p => {
        const Icon = p.icon;
        const isActive = activeProduct === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSwitch(p.id)}
            className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
            style={{
              color: isActive ? '#5B5FFF' : '#94A3B8',
              background: isActive ? 'rgba(91,95,255,0.08)' : 'transparent',
              fontWeight: isActive ? 700 : 500,
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'rgba(91,95,255,0.04)'; } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; } }}
          >
            <Icon size={12} strokeWidth={isActive ? 2.5 : 2} />
            {p.label}
            {isActive && (
              <motion.div
                layoutId="product-pill"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: 'rgba(91,95,255,0.08)',
                  border: '1px solid rgba(91,95,255,0.15)',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
