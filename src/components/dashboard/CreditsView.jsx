import { useState, useEffect } from 'react';
import { Zap, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

const packs = [
  { label: '$10', credits: '1,000 credits', days: '~166 days', tag: 'BEST VALUE', tagColor: '#10B981' },
  { label: '$25', credits: '2,500 credits', days: '~416 days', tag: 'POPULAR', tagColor: '#5B5FFF' },
  { label: '$50', credits: '5,000 credits', days: '~833 days' },
  { label: '$100', credits: '10,000 credits', days: '~1666 days' },
];

const activity = [
  { name: 'ChatGPT API usage', sub: 'Agent: Atlas', cr: -12, time: '2h ago' },
  { name: 'Image Generation', sub: 'Agent: Atlas', cr: -5, time: '4h ago' },
  { name: 'Claude Opus', sub: 'Agent: Atlas', cr: -8, time: '1d ago' },
  { name: 'Video Generation', sub: 'Agent: Atlas', cr: -20, time: '2d ago' },
];

const glassCard = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
};

export default function CreditsView() {
  const { user } = useAuth();
  const [selectedPack, setSelectedPack] = useState('$25');
  const [upgrading, setUpgrading] = useState(false);
  const currentPlan = user?.plan || 'Starter';

  const handleUpgrade = async (planType) => {
    toast.info('Billing coming soon — contact support to upgrade.');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-6" style={{ background: '#F4F5FC' }}>
      {/* YOUR PLAN */}
      <div>
        <h2 className="text-lg font-extrabold mb-4" style={{ color: '#0A0A1A' }}>Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="rounded-2xl p-6 relative overflow-hidden" style={glassCard}>
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)' }} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#94A3B8' }}>Current Plan</span>
              <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF' }}>Starter</span>
            </div>
            <p className="text-lg font-extrabold mb-3" style={{ color: '#0A0A1A' }}>Starter Agent</p>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: '#6B7280' }}>Deploy one AI agent with included credits for API usage.</p>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: '#0A0A1A' }}>$49.99<span className="text-sm font-normal" style={{ color: '#6B7280' }}>/mo</span></p>
            <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>$50 API credits included monthly</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-2xl p-6 relative overflow-hidden" style={glassCard}>
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: 'rgba(91,95,255,0.2)' }} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#94A3B8' }}>Included</span>
            </div>
            <p className="text-xs font-semibold mb-3" style={{ color: '#5B5FFF' }}>This month's credits</p>
            <p className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A' }}>$50<span className="text-sm font-normal" style={{ color: '#6B7280' }}>/mo</span></p>
            <div className="w-full h-2 rounded-full overflow-hidden mb-2 mt-3" style={{ background: 'rgba(91,95,255,0.1)' }}>
              <div className="h-full rounded-full" style={{ width: '87%', background: 'linear-gradient(90deg, #5B5FFF, #6B63FF)' }} />
            </div>
            <p className="text-xs" style={{ color: '#94A3B8' }}>$43.50 used · $6.50 remaining</p>
          </motion.div>
        </div>
      </div>

      {/* MANAGE PLAN */}
      <div>
        <h2 className="text-lg font-extrabold mb-4" style={{ color: '#0A0A1A' }}>Manage Your Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Starter Agent', price: 49.99, credits: 50, features: ['1 Agent', '$50/mo credits', 'All models & features'] },
            { name: 'Pro', price: 299.99, credits: 300, features: ['Unlimited Agents', '$300/mo credits', 'Priority support'] },
            { name: 'Max', price: 599.99, credits: 600, features: ['Unlimited Agents', '$600/mo credits', '24/7 Dedicated support'] }
          ].map(plan => {
            const isCurrent = plan.name === 'Starter Agent';
            return (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="rounded-2xl p-6 cursor-pointer transition-all" style={{
                ...glassCard,
                border: isCurrent ? '2px solid #5B5FFF' : glassCard.border,
                background: isCurrent ? 'rgba(91,95,255,0.08)' : glassCard.background,
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = isCurrent ? '0 8px 32px rgba(91,95,255,0.2)' : '0 8px 32px rgba(91,95,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = isCurrent ? '0 4px 24px rgba(91,95,255,0.08)' : '0 4px 24px rgba(0,0,0,0.03)' }>
              <p className="text-sm font-extrabold mb-2" style={{ color: '#0A0A1A' }}>{plan.name}</p>
              <p className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: '#0A0A1A' }}>${plan.price.toFixed(2)}<span className="text-sm font-normal" style={{ color: '#6B7280' }}>/mo</span></p>
              <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>${plan.credits}/mo credits included</p>
              {plan.features.map(f => (
                <div key={f} className="flex items-center gap-2 mb-2 text-xs" style={{ color: '#6B7280' }}>
                  <span style={{ color: '#5B5FFF' }}>✓</span> {f}
                </div>
              ))}
              <button onClick={() => handleUpgrade(plan.name === 'Starter Agent' ? 'starter' : plan.name === 'Pro' ? 'pro' : 'max')} disabled={upgrading}
                className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all" style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', color: '#fff', opacity: upgrading ? 0.6 : 1 }}>
                {upgrading ? 'Processing...' : isCurrent ? 'Current Plan' : 'Upgrade →'}
              </button>
            </motion.div>
            );
          })}
        </div>
      </div>

      {/* ADD EXTRA CREDITS */}
      <div>
        <h2 className="text-lg font-extrabold mb-4" style={{ color: '#0A0A1A' }}>Add Extra Credits</h2>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="rounded-2xl p-6" style={glassCard}>
          <p className="text-xs mb-4" style={{ color: '#6B7280' }}>For ChatGPT, image generation, video, and emoji creation</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {packs.map(p => (
              <button key={p.label} onClick={() => setSelectedPack(p.label)}
                className="rounded-2xl p-4 text-left transition-all relative card-lift"
                style={{
                  border: selectedPack === p.label ? '2px solid #5B5FFF' : '1.5px solid rgba(0,0,0,0.04)',
                  background: selectedPack === p.label ? 'rgba(91,95,255,0.08)' : 'rgba(244,245,252,0.6)',
                  boxShadow: selectedPack === p.label ? '0 0 0 3px rgba(91,95,255,0.08)' : 'none',
                }}>
                {p.tag && (
                  <span className="absolute -top-2.5 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: p.tagColor, boxShadow: `0 2px 8px ${p.tagColor}40` }}>{p.tag}</span>
                )}
                <p className="text-xl font-extrabold mb-0.5" style={{ color: '#0F172A' }}>{p.label}</p>
                <p className="text-xs font-semibold" style={{ color: '#5B5FFF' }}>{p.credits}</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{p.days}</p>
              </button>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 4px 16px rgba(91,95,255,0.30)' }}>
            Buy {selectedPack} Credits
          </motion.button>
          <p className="text-xs mt-3 text-center" style={{ color: '#CBD5E1' }}>1 credit = $0.01</p>
        </motion.div>
      </div>

      {/* RECENT USAGE */}
      <div>
        <h2 className="text-lg font-extrabold mb-4" style={{ color: '#0A0A1A' }}>Recent Credit Usage</h2>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#94A3B8' }}>Activity</span>
          </div>
          {activity.map((a, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-3.5 transition-colors"
              style={{ borderBottom: i < activity.length - 1 ? '1px solid rgba(0,0,0,0.03)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 2px 8px rgba(91,95,255,0.25)' }}>
                  💳
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#374151' }}>{a.name}</p>
                  <p className="text-[10px]" style={{ color: '#CBD5E1' }}>{a.sub}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-sm font-bold" style={{ color: '#374151' }}>
                  {a.cr} credits
                </p>
                <p className="text-[10px]" style={{ color: '#CBD5E1' }}>{a.time}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}