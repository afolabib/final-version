import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Globe, Send, MessageCircle, Rocket, CheckCircle2 } from 'lucide-react';
import SetupLoadingStep from './SetupLoadingStep';
import DeploySuccessStep from './DeploySuccessStep';

const channels = [
  { id: 'web', label: 'Web', icon: Globe, desc: 'Chat from dashboard', color: '#2563EB' },
  { id: 'telegram', label: 'Telegram', icon: Send, desc: 'Connect via bot', color: '#0EA5E9' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, desc: 'Scan QR to pair', color: '#22C55E' },
];

export default function DeployChannelStep({ agent, onBack }) {
  const [channel, setChannel] = useState('web');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [stage, setStage] = useState('form');

  const agentName = agent?.name || 'Agent';
  const canDeploy = channel === 'web' || channel === 'whatsapp' || (username.trim() && token.trim());
  const activeChannel = channels.find(c => c.id === channel);

  if (stage === 'loading') return <SetupLoadingStep agent={agent} onComplete={() => setStage('success')} />;
  if (stage === 'success') return <DeploySuccessStep agent={agent} channel={channel} />;

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#F4F5FC', fontFamily: 'Inter, sans-serif' }}>
      {/* Breadcrumb */}
      <div className="px-8 py-3 flex-shrink-0 flex items-center gap-2 text-sm"
        style={{ borderBottom: '1px solid #E8EAFF', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 transition-colors" style={{ color: '#9CA3AF' }}
          onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
          <ArrowLeft size={13} strokeWidth={2} /> Configure
        </button>
        <span style={{ color: '#D1D5DB' }}>/</span>
        <span style={{ color: '#374151', fontWeight: 600 }}>Deploy</span>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
          <div className="w-full max-w-2xl">
            {/* Header with icon */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(99,102,241,0.06))', border: '1.5px solid rgba(37,99,235,0.1)' }}>
                <Rocket size={20} style={{ color: '#2563EB' }} />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase mb-2 inline-block px-3 py-1 rounded-full"
                style={{ color: '#2563EB', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.1)' }}>
                Final Step
              </span>
              <h1 className="text-2xl font-extrabold mt-2" style={{ color: '#0F172A', letterSpacing: '-0.03em' }}>
                Deploy {agentName}
              </h1>
              <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                Choose where your agent will live. You can add more channels later.
              </p>
            </motion.div>

            {/* Channel selector cards */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: '#CBD5E1' }}>Select channel</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {channels.map(c => {
                  const isActive = channel === c.id;
                  const Icon = c.icon;
                  return (
                    <motion.button key={c.id} type="button" onClick={() => setChannel(c.id)}
                      whileTap={{ scale: 0.96 }}
                      className="relative flex flex-col items-center gap-2 py-4 px-3 rounded-2xl text-center transition-all group"
                      style={{
                        background: isActive ? '#fff' : '#fff',
                        border: isActive ? `2px solid ${c.color}` : '1.5px solid #E8EAFF',
                        boxShadow: isActive ? `0 4px 20px ${c.color}18, 0 0 0 3px ${c.color}0A` : '0 1px 3px rgba(0,0,0,0.03)',
                        cursor: 'pointer',
                      }}>
                      {/* Active check badge */}
                      {isActive && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: c.color, boxShadow: `0 2px 8px ${c.color}40` }}>
                          <CheckCircle2 size={14} color="#fff" strokeWidth={2.5} />
                        </motion.div>
                      )}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                        style={{
                          background: isActive ? `linear-gradient(135deg, ${c.color}, ${c.color}CC)` : '#F4F5FC',
                          boxShadow: isActive ? `0 4px 16px ${c.color}30` : 'none',
                          transform: isActive ? 'scale(1.05)' : 'scale(1)',
                        }}>
                        <Icon size={20} strokeWidth={2} style={{ color: isActive ? '#fff' : '#94A3B8' }} />
                      </div>
                      <div>
                        <span className="text-sm font-bold block" style={{ color: isActive ? '#0F172A' : '#6B7280' }}>{c.label}</span>
                        <span className="text-[10px] mt-0.5 block" style={{ color: '#94A3B8' }}>{c.desc}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Channel-specific content */}
            <AnimatePresence mode="wait">
              <motion.div key={channel}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>

                {channel === 'web' && (
                  <div className="p-5 rounded-2xl mb-6 relative overflow-hidden"
                    style={{ background: '#fff', border: '1.5px solid #E8EAFF', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                      style={{ background: 'rgba(37,99,235,0.04)' }} />
                    <div className="flex items-start gap-4 relative">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.04))', border: '1px solid rgba(37,99,235,0.1)' }}>
                        <Globe size={18} style={{ color: '#2563EB' }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>Web dashboard</p>
                        <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                          Chat with your agent directly from the dashboard. No extra setup needed — just deploy and start talking.
                        </p>
                        <div className="flex gap-2 mt-3">
                          {['Instant setup', 'No API keys', 'Full features'].map(t => (
                            <span key={t} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: 'rgba(37,99,235,0.06)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.08)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {channel === 'whatsapp' && (
                  <div className="p-5 rounded-2xl mb-6 relative overflow-hidden"
                    style={{ background: '#fff', border: '1.5px solid rgba(34,197,94,0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                      style={{ background: 'rgba(34,197,94,0.04)' }} />
                    <div className="flex items-start gap-4 relative">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
                        <MessageCircle size={18} style={{ color: '#22C55E' }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>QR code pairing</p>
                        <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                          After deployment, scan a QR code with your phone to connect. No API keys needed.
                        </p>
                        <div className="flex gap-2 mt-3">
                          {['QR scan', 'Secure', 'End-to-end'].map(t => (
                            <span key={t} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: 'rgba(34,197,94,0.06)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.1)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {channel === 'telegram' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm font-bold mb-2 flex items-center gap-1" style={{ color: '#374151' }}>
                        Your Telegram username <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl transition-all"
                        style={{ background: '#fff', border: '1.5px solid #E8EAFF', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <span className="text-sm font-semibold" style={{ color: '#CBD5E1' }}>@</span>
                        <input value={username} onChange={e => setUsername(e.target.value)}
                          placeholder="your_username"
                          className="flex-1 text-sm outline-none bg-transparent"
                          style={{ color: '#0F172A' }}
                          onFocus={e => { e.currentTarget.parentElement.style.borderColor = '#0EA5E9'; e.currentTarget.parentElement.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
                          onBlur={e => { e.currentTarget.parentElement.style.borderColor = '#E8EAFF'; e.currentTarget.parentElement.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }} />
                      </div>
                      <p className="text-[11px] mt-2" style={{ color: '#CBD5E1' }}>Only this account can message your bot.</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-2 flex items-center gap-1" style={{ color: '#374151' }}>
                        Bot token <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl transition-all"
                        style={{ background: '#fff', border: '1.5px solid #E8EAFF', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <input value={token} onChange={e => setToken(e.target.value)}
                          type={showToken ? 'text' : 'password'}
                          placeholder="123456789:ABCdefGHI..."
                          className="flex-1 text-sm outline-none bg-transparent"
                          style={{ color: '#0F172A' }}
                          onFocus={e => { e.currentTarget.parentElement.style.borderColor = '#0EA5E9'; e.currentTarget.parentElement.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
                          onBlur={e => { e.currentTarget.parentElement.style.borderColor = '#E8EAFF'; e.currentTarget.parentElement.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }} />
                        <button type="button" onClick={() => setShowToken(s => !s)} style={{ color: '#CBD5E1' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#6B7280'}
                          onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}>
                          {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <div className="mt-4 p-5 rounded-2xl" style={{ background: 'rgba(14,165,233,0.03)', border: '1px solid rgba(14,165,233,0.1)' }}>
                        <p className="text-xs font-bold mb-2.5" style={{ color: '#374151' }}>How to get your bot token:</p>
                        <ol className="space-y-2 text-xs" style={{ color: '#94A3B8' }}>
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5" style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}>1</span>
                            Open <span style={{ color: '#0EA5E9', fontWeight: 600 }}>@BotFather</span> on Telegram
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5" style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}>2</span>
                            Send <code className="px-1.5 py-0.5 rounded-lg text-[11px]" style={{ background: 'rgba(14,165,233,0.06)', color: '#0EA5E9' }}>/newbot</code>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5" style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}>3</span>
                            Copy the token and paste it above
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Divider */}
            <div className="h-px w-full mb-4" style={{ background: '#E8EAFF' }} />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button type="button" onClick={onBack}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ color: '#6B7280' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <ArrowLeft size={14} strokeWidth={2} /> Back
              </button>
              <motion.button type="button" disabled={!canDeploy}
                onClick={() => canDeploy && setStage('loading')}
                whileHover={canDeploy ? { scale: 1.02, boxShadow: `0 8px 28px ${activeChannel.color}35` } : {}}
                whileTap={canDeploy ? { scale: 0.97 } : {}}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all"
                style={{
                  background: canDeploy ? `linear-gradient(135deg, ${activeChannel.color}, ${activeChannel.color}CC)` : '#E8EAFF',
                  color: canDeploy ? '#fff' : '#A0AEC0',
                  cursor: canDeploy ? 'pointer' : 'not-allowed',
                  boxShadow: canDeploy ? `0 4px 20px ${activeChannel.color}30` : 'none',
                }}>
                <Rocket size={15} strokeWidth={2} />
                Deploy {agentName}
                <ArrowRight size={14} strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}