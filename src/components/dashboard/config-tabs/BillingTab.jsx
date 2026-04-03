import { useState } from 'react';
import { CreditCard, Zap, Key, ArrowRight, TrendingUp } from 'lucide-react';

export default function BillingTab() {
  const [billingMode, setBillingMode] = useState('credits');

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>Billing</h2>
      <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>Manage how AI usage is billed and view subscription details.</p>

      {/* Billing Mode */}
      <div className="rounded-2xl p-6 mb-6"
        style={{ background: '#FFFFFF', border: '1.5px solid #E8EAFF' }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: '#374151' }}>Billing Mode</h3>
        <p className="text-xs mb-5" style={{ color: '#9CA3AF' }}>Choose how AI calls are billed for this agent.</p>

        <div className="space-y-2 mb-4">
          {[
            { id: 'credits', label: 'Use Credits', desc: 'Deducted from your credit balance. No API key needed.', icon: Zap, iconColor: '#F59E0B' },
            { id: 'api-key', label: 'Use Your API Key', desc: 'Billed directly to your provider account.', icon: Key, iconColor: '#6B63FF' },
          ].map(opt => {
            const isActive = billingMode === opt.id;
            return (
              <button key={opt.id} onClick={() => setBillingMode(opt.id)}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(74,108,247,0.06)' : 'transparent',
                  border: isActive ? '1.5px solid #4A6CF7' : '1.5px solid #E8EAFF',
                  boxShadow: isActive ? '0 4px 16px rgba(74,108,247,0.08)' : 'none',
                }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    border: isActive ? '2px solid #4A6CF7' : '2px solid #D1D5E8',
                    background: isActive ? '#4A6CF7' : 'transparent',
                  }}>
                  {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${opt.iconColor}12` }}>
                  <opt.icon size={16} style={{ color: opt.iconColor }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: isActive ? '#374151' : '#6B7280' }}>{opt.label}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] px-1" style={{ color: billingMode === 'credits' ? '#22C55E' : '#9CA3AF' }}>
          {billingMode === 'credits' ? '✓ Using Maagic credits. Make sure you have enough credits in your balance.' : 'Provide your API key in the Custom APIs tab.'}
        </p>
      </div>

      {/* Usage Stats */}
      <div className="rounded-2xl p-6 mb-6"
        style={{ background: '#FFFFFF', border: '1.5px solid #E8EAFF' }}>
        <div className="flex items-center gap-2.5 mb-5">
          <TrendingUp size={15} style={{ color: '#4A6CF7' }} />
          <h3 className="text-sm font-bold" style={{ color: '#374151' }}>Usage This Period</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Credits Used', value: '147', sub: 'of 500' },
            { label: 'API Calls', value: '2,847', sub: 'this month' },
            { label: 'Avg Latency', value: '1.2s', sub: 'per call' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl px-4 py-3" style={{ background: '#F4F5FC', border: '1px solid #E8EAFF' }}>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#9CA3AF' }}>{stat.label}</p>
              <p className="text-lg font-extrabold" style={{ color: '#0A0A1A' }}>{stat.value}</p>
              <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Claude Pro/Max */}
      <div className="rounded-2xl p-6"
        style={{ background: '#FFFFFF', border: '1.5px solid #E8EAFF' }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: '#374151' }}>Claude Pro/Max Account</h3>
        <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>Connect your Pro or Max subscription — no API key needed for Anthropic models.</p>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
          style={{ background: 'rgba(217,119,6,0.08)', color: '#F59E0B', border: '1px solid rgba(217,119,6,0.15)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(217,119,6,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(217,119,6,0.08)'; }}>
          <span>∧</span> Connect Claude Account <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}