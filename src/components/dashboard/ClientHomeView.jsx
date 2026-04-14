import { motion } from 'framer-motion';
import { useCompany } from '@/contexts/CompanyContext';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Globe, Phone, Zap, Activity,
  ArrowRight, CheckCircle2, Clock, TrendingUp, Users,
  ExternalLink, Settings, ChevronRight, Wifi, WifiOff
} from 'lucide-react';

const CARD = {
  background: 'rgba(255,255,255,0.97)',
  border: '1px solid rgba(91,95,255,0.08)',
  borderRadius: 20,
  boxShadow: '0 4px 20px rgba(91,95,255,0.05)',
};

function StatCard({ label, value, sub, icon: Icon, color = '#5B5FFF', trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ ...CARD, padding: '20px 22px' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}12` }}>
          <Icon size={16} strokeWidth={2} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className="text-[11px] font-bold px-2 py-1 rounded-full"
            style={{ background: trend >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: trend >= 0 ? '#10B981' : '#EF4444' }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-black mb-0.5" style={{ color: '#0A0F1E' }}>{value}</div>
      <div className="text-xs font-semibold" style={{ color: '#94A3B8' }}>{label}</div>
      {sub && <div className="text-[11px] mt-1" style={{ color: '#CBD5E1' }}>{sub}</div>}
    </motion.div>
  );
}

function ActivityItem({ item, index }) {
  const icons = {
    message: MessageSquare,
    booking: CheckCircle2,
    lead: TrendingUp,
    call: Phone,
    default: Activity,
  };
  const colors = {
    message: '#5B5FFF',
    booking: '#10B981',
    lead: '#7C3AED',
    call: '#F59E0B',
    default: '#94A3B8',
  };
  const type = item.type || 'default';
  const Icon = icons[type] || icons.default;
  const color = colors[type] || colors.default;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(91,95,255,0.05)' }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${color}12` }}>
        <Icon size={13} strokeWidth={2} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug" style={{ color: '#0A0F1E' }}>
          {item.summary || item.message || 'Activity recorded'}
        </p>
        {item.detail && (
          <p className="text-xs mt-0.5 truncate" style={{ color: '#94A3B8' }}>{item.detail}</p>
        )}
      </div>
      <div className="text-[10px] font-medium flex-shrink-0 mt-0.5" style={{ color: '#CBD5E1' }}>
        {item.timeAgo || item.createdAt ? formatTime(item.createdAt) : ''}
      </div>
    </motion.div>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - d) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function WidgetCard({ company }) {
  const navigate = useNavigate();
  const isLive = company?.widgetEnabled !== false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ ...CARD, padding: '22px 24px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(91,95,255,0.1)' }}>
            <MessageSquare size={16} strokeWidth={2} style={{ color: '#5B5FFF' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Chat Widget</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isLive ? (
                <><Wifi size={10} style={{ color: '#10B981' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#10B981' }}>Live on your site</span></>
              ) : (
                <><WifiOff size={10} style={{ color: '#94A3B8' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>Not installed</span></>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/widget')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.08)'}>
          Configure <Settings size={11} />
        </button>
      </div>

      {/* Widget preview bar */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #5B5FFF08, #7C3AED06)', border: '1px solid rgba(91,95,255,0.08)', padding: '14px 16px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
              <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: '#0A0F1E' }}>Freemi</p>
              <p className="text-[10px]" style={{ color: '#94A3B8' }}>Hi! How can I help you today?</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10B981' }} />
          </div>
        </div>
      </div>

      {company?.website && (
        <div className="flex items-center gap-2 mt-3">
          <ExternalLink size={11} style={{ color: '#94A3B8' }} />
          <a href={company.website} target="_blank" rel="noopener noreferrer"
            className="text-xs truncate hover:underline" style={{ color: '#5B5FFF' }}>
            {company.website.replace(/^https?:\/\//, '')}
          </a>
        </div>
      )}
    </motion.div>
  );
}

function WebsiteCard({ company }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ ...CARD, padding: '22px 24px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.1)' }}>
            <Globe size={16} strokeWidth={2} style={{ color: '#7C3AED' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Your Website</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-semibold" style={{ color: '#10B981' }}>Online</span>
            </div>
          </div>
        </div>
        {company?.website && (
          <a href={company.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.08)'}>
            View site <ExternalLink size={11} />
          </a>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7C3AED08, #5B5FFF06)', border: '1px solid rgba(124,58,237,0.08)', padding: '14px 16px' }}>
        <div className="space-y-2">
          {[
            { label: 'AI chat', status: 'active' },
            { label: 'SSL certificate', status: 'active' },
            { label: 'Mobile optimised', status: 'active' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: '#64748B' }}>{item.label}</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} style={{ color: '#10B981' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#10B981' }}>Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function VoiceCard() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ ...CARD, padding: '22px 24px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.1)' }}>
            <Phone size={16} strokeWidth={2} style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Freemi Voice</h3>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
              Early access
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-2xl text-center py-6"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(245,158,11,0.02))', border: '1px solid rgba(245,158,11,0.08)' }}>
        <Phone size={22} strokeWidth={1.5} className="mx-auto mb-2" style={{ color: '#F59E0B', opacity: 0.6 }} />
        <p className="text-xs font-semibold mb-1" style={{ color: '#64748B' }}>Call answering active</p>
        <p className="text-[11px]" style={{ color: '#94A3B8' }}>Inbound calls handled 24/7</p>
      </div>
    </motion.div>
  );
}

export default function ClientHomeView() {
  const { company, recentActivity, agents } = useCompany();
  const navigate = useNavigate();
  const products = company?.products || [];

  const hasWidget = products.includes('widget');
  const hasWebsite = products.includes('website');
  const hasVoice = products.includes('voice');

  const todayActivity = recentActivity.slice(0, 8);
  const firstName = company?.name?.split(' ')[0] || 'there';

  // Stats — use real data where possible, show placeholders otherwise
  const conversationsToday = recentActivity.filter(a => {
    if (!a.createdAt) return false;
    const d = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    return d.toDateString() === new Date().toDateString();
  }).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: '#0A0F1E' }}>
                Good {getGreeting()}, {firstName} 👋
              </h1>
              <p className="text-sm" style={{ color: '#94A3B8' }}>
                Here's what's happening with your Freemi setup today.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold" style={{ color: '#10B981' }}>All systems running</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Conversations today"
            value={conversationsToday || '—'}
            icon={MessageSquare}
            color="#5B5FFF"
          />
          <StatCard
            label="Response rate"
            value="100%"
            sub="Avg < 2s reply time"
            icon={Zap}
            color="#10B981"
            trend={0}
          />
          <StatCard
            label="Active since"
            value={company?.createdAt ? formatDaysAgo(company.createdAt) : '—'}
            sub="Days running"
            icon={Clock}
            color="#7C3AED"
          />
          <StatCard
            label="Total handled"
            value={recentActivity.length > 0 ? `${recentActivity.length}+` : '—'}
            sub="Messages & actions"
            icon={Activity}
            color="#F59E0B"
          />
        </div>

        {/* Product cards + activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

          {/* Left: product cards */}
          <div className="md:col-span-2 space-y-4">
            {hasWidget && <WidgetCard company={company} />}
            {hasWebsite && <WebsiteCard company={company} />}
            {hasVoice && <VoiceCard />}
            {!hasWidget && !hasWebsite && !hasVoice && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ ...CARD, padding: '28px 24px', textAlign: 'center' }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(91,95,255,0.08)' }}>
                  <Zap size={20} strokeWidth={1.8} style={{ color: '#5B5FFF' }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#0A0F1E' }}>Set up your products</h3>
                <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
                  Configure your widget, website, or voice to start seeing activity here.
                </p>
                <button
                  onClick={() => navigate('/dashboard/settings')}
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #5B5FFF, #7C3AED)' }}>
                  Go to settings →
                </button>
              </motion.div>
            )}
          </div>

          {/* Right: activity feed */}
          <div style={{ ...CARD, padding: '20px 20px' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: '#0A0F1E' }}>Recent activity</h3>
              <button
                onClick={() => navigate('/dashboard/inbox')}
                className="text-[11px] font-bold flex items-center gap-1 transition-colors"
                style={{ color: '#5B5FFF' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                View all <ChevronRight size={11} />
              </button>
            </div>

            {todayActivity.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(91,95,255,0.06)' }}>
                  <Activity size={18} strokeWidth={1.5} style={{ color: '#CBD5E1' }} />
                </div>
                <p className="text-xs font-semibold" style={{ color: '#CBD5E1' }}>No activity yet today</p>
                <p className="text-[11px] mt-1" style={{ color: '#E2E8F0' }}>Activity will appear here as conversations come in</p>
              </div>
            ) : (
              <div>
                {todayActivity.map((item, i) => (
                  <ActivityItem key={item.id || i} item={item} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { label: 'Conversations', icon: MessageSquare, id: 'inbox', color: '#5B5FFF' },
            { label: 'Widget setup', icon: Settings, id: 'widget', color: '#7C3AED' },
            { label: 'Integrations', icon: Zap, id: 'integrations', color: '#F59E0B' },
            { label: 'Support', icon: Users, id: 'support', color: '#10B981' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => navigate(`/dashboard/${item.id}`)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl transition-all text-left"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(91,95,255,0.07)',
                boxShadow: '0 2px 8px rgba(91,95,255,0.04)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,95,255,0.1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(91,95,255,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.color}10` }}>
                <item.icon size={14} strokeWidth={2} style={{ color: item.color }} />
              </div>
              <span className="text-xs font-bold" style={{ color: '#374151' }}>{item.label}</span>
              <ArrowRight size={11} className="ml-auto flex-shrink-0" style={{ color: '#CBD5E1' }} />
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function formatDaysAgo(ts) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const days = Math.floor((Date.now() - d) / 86400000);
  return days || 1;
}
