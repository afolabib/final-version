import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Check, Rocket, Globe, Send, MessageCircle, CheckCircle2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import WizardOptionCard from './WizardOptionCard';
import WizardProgressDots from './WizardProgressDots';
import SetupLoadingStep from './SetupLoadingStep';
import DeploySuccessStep from './DeploySuccessStep';
import PaymentStep from './PaymentStep';

const optionEmojis = {
  'Task delegation': '📋', 'Daily scheduling': '📅', 'Progress tracking': '📊', 'Reminders & alerts': '🔔', 'Team updates': '👥',
  '1–5': '✋', '6–15': '🔢', '16–30': '📈', '30+': '🚀',
  'Notion': '📝', 'Asana': '🎯', 'Jira': '🐛', 'Linear': '⚡', 'Trello': '📌', 'Other': '🔧',
  'Slack': '💬', 'Email': '📧', 'Dashboard only': '🖥️', 'WhatsApp': '📱',
  'Founder / CEO': '👔', 'Manager': '📊', 'Team Lead': '🎖️', 'Individual Contributor': '💪',
  'Every hour': '⏰', 'Twice a day': '🌗', 'Daily': '☀️', 'Weekly': '📆',
  'Yes, autonomously': '🤖', 'Yes, with approval': '✅', 'No, handle everything': '🙅',
  'Growing revenue': '💰', 'Reducing costs': '✂️', 'Shipping faster': '🚢', 'Hiring & team': '🤝', 'Customer success': '⭐',
  'Tech & AI': '🤖', 'Startups': '🚀', 'Marketing': '📣', 'Design': '🎨', 'Finance': '💳', 'My niche': '🎯',
  '1': '1️⃣', '3': '3️⃣', '5': '5️⃣', '10+': '🔟',
  'Professional': '👔', 'Casual': '😎', 'Humorous': '😂', 'Thought leader': '🧠',
  'Yes, daily': '📅', 'Yes, weekly': '📆', 'No threads': '❌',
  'Grow followers': '📈', 'Drive traffic': '🚗', 'Build brand': '🏗️', 'Generate leads': '🧲',
  'Yes': '✅', 'No, start fresh': '🆕', 'No': '❌',
  'Morning': '🌅', 'Afternoon': '☀️', 'Evening': '🌙', 'Spread throughout': '🕐',
  'Always': '♾️', 'Sometimes': '🎲', 'Never': '🚫',
  'Intercom': '💬', 'Zendesk': '🎧', 'Custom form': '📝',
  '< 1 hour': '⚡', '< 4 hours': '⏱️', '< 24 hours': '📅', 'No SLA': '🤷',
  'Bug reports': '🐛', 'Billing questions': '💳', 'Feature requests': '💡', 'General enquiries': '📩', 'All of the above': '🌟',
  'Draft only, I review': '👀',
  'Me': '🙋', 'Team lead': '🎖️', 'Whole team': '👥', 'Slack channel': '📢',
  'Yes, link it': '🔗', 'No, not yet': '🚧',
  'English only': '🇬🇧', 'Multiple languages': '🌍',
  'By urgency': '🚨', 'By customer tier': '👑', 'By topic': '🏷️', 'Automatically': '🤖',
  'Emails': '📧', 'Calendar': '📅', 'Tasks': '✅', 'News': '📰', 'Metrics': '📊',
  '6am': '🌅', '7am': '🌤️', '8am': '☀️', '9am': '🕘',
  'Google Calendar': '📅', 'Outlook': '📨',
  'Yes, 15 min before': '⏱️', 'Yes, 1 hr before': '🕐',
  'Mostly meetings': '🤝', 'Mostly deep work': '🎯', 'Balanced': '⚖️', 'Varies': '🔄',
  'Yes, summary email': '📧', 'Yes, Slack message': '💬',
  'AI & tech': '🤖', 'Leadership': '👑', 'My industry': '🏭',
  'Story-driven': '📖', 'Data-backed': '📊', 'Opinionated': '🎤', 'Educational': '🎓',
  'Build audience': '👥', 'Establish authority': '🏆', 'Get hired': '💼',
  'Short & punchy': '⚡', 'Medium': '📄', 'Long-form': '📜',
  'Mondays': '📆', 'On demand': '🎯',
  'SMBs': '🏪', 'Mid-market': '🏢', 'Enterprise': '🏛️', 'Consumers': '🛒',
  'SaaS': '☁️', 'E-commerce': '🛍️', 'Agencies': '🏬', 'Healthcare': '🏥',
  'Cold email': '❄️', 'LinkedIn DM': '💼', 'Both': '🤝', 'Phone calls': '📞',
  '2': '2️⃣', '5+': '5️⃣',
  '< $1k': '💵', '$1k–$10k': '💰', '$10k–$100k': '💎', '$100k+': '🏆',
  '< 1 week': '⚡', '1–4 weeks': '📅', '1–3 months': '🗓️', '3+ months': '⏳',
  'Draft only': '📝',
  'HubSpot': '🧡', 'Salesforce': '☁️', 'Pipedrive': '🔄', 'None': '🚫',
  'Book meetings': '📅', 'Sell a product': '🛒', 'Build partnerships': '🤝', 'Recruit candidates': '👔',
  'Founders': '🚀', 'Executives': '👔', 'Marketers': '📣', 'Developers': '💻',
  'LinkedIn': '💼', 'Email list': '📧', 'CRM': '📊', 'Web scraping': '🕸️',
  'Highly personalised': '✨', 'Moderately': '📝', 'Template-based': '📋',
  '10–50': '📨', '50–200': '📬', '200–500': '📮', '500+': '🚀',
  'Direct': '🎯', 'Friendly': '😊',
  'Gmail': '📧', 'Instantly': '⚡', 'Lemlist': '🍋',
  'Competitors': '🏁', 'Market trends': '📈', 'Customer sentiment': '❤️', 'Industry reports': '📑',
  'Executive summary': '📋', 'Bullet points': '🔹', 'Full report': '📄',
  'Dashboard': '🖥️',
  'Competitor launches something': '🚀', 'Funding news': '💰', 'Industry news': '📰',
  'Just me': '🙋', 'My team': '👥', 'My customers': '🤝',
  'Continuously': '♾️', 'Hourly': '⏰',
  'Yes, always': '✅', 'Only on issues': '⚠️',
  'Time saved': '⏱️', 'Revenue generated': '💰', 'Issues resolved': '🔧', 'Tasks completed': '✅',
};

const agentQuestions = {
  'Sam': [
    { q: 'What should Sam manage for you?', opts: ['Task delegation', 'Daily scheduling', 'Progress tracking', 'Reminders & alerts', 'Team updates'] },
    { q: 'How many tasks do you manage daily?', opts: ['1–5', '6–15', '16–30', '30+'] },
    { q: 'Which tools do you use for tasks?', opts: ['Notion', 'Asana', 'Jira', 'Linear', 'Trello', 'Other'] },
    { q: 'How should Sam communicate updates?', opts: ['Slack', 'Email', 'Dashboard only', 'WhatsApp'] },
    { q: 'What is your primary role?', opts: ['Founder / CEO', 'Manager', 'Team Lead', 'Individual Contributor'] },
    { q: 'How often should Sam check in?', opts: ['Every hour', 'Twice a day', 'Daily', 'Weekly'] },
    { q: 'Should Sam delegate to other agents?', opts: ['Yes, autonomously', 'Yes, with approval', 'No, handle everything'] },
    { q: 'What is your top priority right now?', opts: ['Growing revenue', 'Reducing costs', 'Shipping faster', 'Hiring & team', 'Customer success'] },
  ],
  'Tweet Machine': [
    { q: 'What topics should Tweet Machine cover?', opts: ['Tech & AI', 'Startups', 'Marketing', 'Design', 'Finance', 'My niche'] },
    { q: 'How many tweets per day?', opts: ['1', '3', '5', '10+'] },
    { q: 'What is your tone of voice?', opts: ['Professional', 'Casual', 'Humorous', 'Thought leader'] },
    { q: 'Should it write threads too?', opts: ['Yes, daily', 'Yes, weekly', 'No threads'] },
    { q: 'What is your goal on Twitter?', opts: ['Grow followers', 'Drive traffic', 'Build brand', 'Generate leads'] },
    { q: 'Should it analyze your past tweets?', opts: ['Yes', 'No, start fresh'] },
    { q: 'Preferred posting time?', opts: ['Morning', 'Afternoon', 'Evening', 'Spread throughout'] },
    { q: 'Hashtag usage?', opts: ['Always', 'Sometimes', 'Never'] },
  ],
  'Triager': [
    { q: 'Where do support tickets come from?', opts: ['Email', 'Intercom', 'Zendesk', 'Slack', 'Custom form'] },
    { q: 'How urgent is your response SLA?', opts: ['< 1 hour', '< 4 hours', '< 24 hours', 'No SLA'] },
    { q: 'What type of tickets does Triager handle?', opts: ['Bug reports', 'Billing questions', 'Feature requests', 'General enquiries', 'All of the above'] },
    { q: 'Should Triager auto-respond to simple tickets?', opts: ['Yes', 'Draft only, I review', 'No'] },
    { q: 'Who should receive escalation alerts?', opts: ['Me', 'Team lead', 'Whole team', 'Slack channel'] },
    { q: 'Do you have a knowledge base?', opts: ['Yes, link it', 'No, not yet'] },
    { q: 'Language of your customers?', opts: ['English only', 'Multiple languages'] },
    { q: 'How should tickets be prioritised?', opts: ['By urgency', 'By customer tier', 'By topic', 'Automatically'] },
  ],
  'Aria': [
    { q: 'What should Aria brief you on each morning?', opts: ['Emails', 'Calendar', 'Tasks', 'News', 'Metrics'] },
    { q: 'When do you want your morning brief?', opts: ['6am', '7am', '8am', '9am'] },
    { q: 'What calendar do you use?', opts: ['Google Calendar', 'Outlook', 'Notion', 'Other'] },
    { q: 'Should Aria prep you before meetings?', opts: ['Yes, 15 min before', 'Yes, 1 hr before', 'No'] },
    { q: 'How should Aria communicate?', opts: ['Email', 'Slack', 'WhatsApp', 'Dashboard'] },
    { q: 'What does your day look like?', opts: ['Mostly meetings', 'Mostly deep work', 'Balanced', 'Varies'] },
    { q: 'Should Aria track daily goals?', opts: ['Yes', 'No'] },
    { q: 'End of day recap?', opts: ['Yes, summary email', 'Yes, Slack message', 'No'] },
  ],
  'Ghost': [
    { q: 'What topics should Ghost write about?', opts: ['AI & tech', 'Startups', 'Leadership', 'Marketing', 'My industry'] },
    { q: 'How many LinkedIn posts per week?', opts: ['1', '3', '5', 'Daily'] },
    { q: 'What is your writing style?', opts: ['Story-driven', 'Data-backed', 'Opinionated', 'Educational'] },
    { q: 'Should Ghost use your past posts as reference?', opts: ['Yes', 'No, start fresh'] },
    { q: 'What is your primary goal?', opts: ['Build audience', 'Generate leads', 'Establish authority', 'Get hired'] },
    { q: 'Post length preference?', opts: ['Short & punchy', 'Medium', 'Long-form'] },
    { q: 'Should Ghost add a CTA to each post?', opts: ['Always', 'Sometimes', 'Never'] },
    { q: 'When should Ghost draft posts?', opts: ['Mondays', 'Daily', 'On demand'] },
  ],
  'Rex': [
    { q: 'What type of leads should Rex target?', opts: ['SMBs', 'Mid-market', 'Enterprise', 'Consumers'] },
    { q: 'What industry are you selling to?', opts: ['SaaS', 'E-commerce', 'Agencies', 'Healthcare', 'Finance', 'Other'] },
    { q: 'What does your outreach look like?', opts: ['Cold email', 'LinkedIn DM', 'Both', 'Phone calls'] },
    { q: 'How many follow-ups should Rex send?', opts: ['1', '2', '3', '5+'] },
    { q: 'What is your average deal size?', opts: ['< $1k', '$1k–$10k', '$10k–$100k', '$100k+'] },
    { q: 'What is your sales cycle?', opts: ['< 1 week', '1–4 weeks', '1–3 months', '3+ months'] },
    { q: 'Should Rex auto-book demos?', opts: ['Yes', 'Draft only', 'No'] },
    { q: 'What CRM do you use?', opts: ['HubSpot', 'Salesforce', 'Pipedrive', 'Notion', 'None'] },
  ],
  'Outreacher': [
    { q: 'What is the goal of your outreach?', opts: ['Book meetings', 'Sell a product', 'Build partnerships', 'Recruit candidates'] },
    { q: 'Who are you reaching out to?', opts: ['Founders', 'Executives', 'Marketers', 'Developers', 'Other'] },
    { q: 'Where do your prospects come from?', opts: ['LinkedIn', 'Email list', 'CRM', 'Web scraping'] },
    { q: 'How personalised should emails be?', opts: ['Highly personalised', 'Moderately', 'Template-based'] },
    { q: 'How many emails per day?', opts: ['10–50', '50–200', '200–500', '500+'] },
    { q: 'What tone should the emails have?', opts: ['Professional', 'Casual', 'Direct', 'Friendly'] },
    { q: 'Should Outreacher track replies?', opts: ['Yes', 'No'] },
    { q: 'Preferred email tool?', opts: ['Gmail', 'Outlook', 'Instantly', 'Lemlist', 'Other'] },
  ],
  'Lens': [
    { q: 'What should Lens research for you?', opts: ['Competitors', 'Market trends', 'News', 'Customer sentiment', 'Industry reports'] },
    { q: 'Which industries should Lens monitor?', opts: ['AI & tech', 'Finance', 'Healthcare', 'E-commerce', 'My niche'] },
    { q: 'How often do you want reports?', opts: ['Daily', 'Weekly', 'On demand'] },
    { q: 'Who are your top 3 competitors?', opts: [], freeText: true },
    { q: 'What format do you prefer?', opts: ['Executive summary', 'Bullet points', 'Full report'] },
    { q: 'Where should Lens deliver reports?', opts: ['Email', 'Slack', 'Dashboard', 'Notion'] },
    { q: 'Should Lens track social media sentiment?', opts: ['Yes', 'No'] },
    { q: 'Alert me when?', opts: ['Competitor launches something', 'Funding news', 'Industry news', 'All of the above'] },
  ],
  'Custom Agent': [
    { q: 'What should this agent do?', opts: [], freeText: true },
    { q: 'Who is the primary user?', opts: ['Just me', 'My team', 'My customers'] },
    { q: 'What tone should it have?', opts: ['Professional', 'Casual', 'Friendly', 'Direct'] },
    { q: 'What tools should it connect to?', opts: ['Email', 'Slack', 'Notion', 'CRM', 'Calendar', 'Other'] },
    { q: 'How autonomous should it be?', opts: ['Fully autonomous', 'Ask before acting', 'Draft only'] },
    { q: 'How often should it run?', opts: ['Continuously', 'Hourly', 'Daily', 'On demand'] },
    { q: 'Should it report back to you?', opts: ['Yes, always', 'Only on issues', 'No'] },
    { q: 'What is the main success metric?', opts: ['Time saved', 'Revenue generated', 'Issues resolved', 'Tasks completed'] },
  ],
};

const defaultQuestions = agentQuestions['Sam'];

const channels = [
  { id: 'web', label: 'Web', emoji: '🌐', desc: 'Chat from dashboard', color: '#6366F1' },
  { id: 'telegram', label: 'Telegram', emoji: '✈️', desc: 'Connect via bot', color: '#0EA5E9' },
  { id: 'whatsapp', label: 'WhatsApp', emoji: '💬', desc: 'Scan QR to pair', color: '#22C55E' },
];

const FIREBASE_PROJECT_ID = 'freemi-3f7c7';
const FIREBASE_BILLING_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/usage/details`;

function isHostedWizard() {
  if (typeof window === 'undefined') return false;
  const hostname = window.location?.hostname || '';
  return hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.local');
}

function DeployView({ agent, initialChannel = 'web', onBack, onDeploy }) {
  const [channel, setChannel] = useState(initialChannel);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const agentName = agent?.name || 'Agent';
  const canDeploy = channel === 'web' || channel === 'whatsapp' || (username.trim() && token.trim());
  const activeChannel = channels.find(c => c.id === channel);
  const showHostedBackendNotice = isHostedWizard();
  const deployCtaLabel = showHostedBackendNotice ? `Review plan & blocker` : `Deploy ${agentName}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <div className="text-2xl mb-2">🚀</div>
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full inline-block mb-2"
            style={{ color: '#4A6CF7', background: 'rgba(74,108,247,0.08)', border: '1px solid rgba(74,108,247,0.12)' }}>
            Final Step
          </span>
          <h2 className="text-xl font-extrabold" style={{ color: '#0A0A1A', letterSpacing: '-0.03em' }}>Deploy {agentName}</h2>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Choose where your agent will live.</p>
        </motion.div>

        {showHostedBackendNotice && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl px-4 py-3 flex items-start gap-3"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}
          >
            <Rocket size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#B45309' }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: '#92400E' }}>Live deploy still depends on the Firebase backend</div>
              <div className="text-xs mt-1" style={{ color: '#B45309' }}>
                Before you choose a channel, note that hosted setup for project {FIREBASE_PROJECT_ID} still needs Blaze billing enabled and Firebase Functions deployed.
              </div>
              <a
                href={FIREBASE_BILLING_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold mt-2 underline"
                style={{ color: '#92400E' }}
              >
                Open Firebase billing / project settings
                <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        )}

        {/* Channel cards */}
        <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: '#9CA3AF' }}>Select channel</p>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {channels.map(c => {
            const isActive = channel === c.id;
            return (
              <motion.button key={c.id} onClick={() => setChannel(c.id)} whileTap={{ scale: 0.96 }}
                className="relative flex flex-col items-center gap-1.5 py-3.5 px-3 rounded-2xl text-center transition-all duration-200"
                style={{
                  background: isActive ? `${c.color}08` : '#FFFFFF',
                  border: isActive ? `1.5px solid ${c.color}60` : '1.5px solid #E8EAFF',
                  boxShadow: isActive ? `0 4px 20px ${c.color}12` : '0 1px 4px rgba(0,0,0,0.03)',
                }}>
                {isActive && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: c.color, boxShadow: `0 2px 8px ${c.color}40` }}>
                    <CheckCircle2 size={14} color="#fff" strokeWidth={2.5} />
                  </motion.div>
                )}
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <span className="text-sm font-bold block" style={{ color: isActive ? '#374151' : '#6B7280' }}>{c.label}</span>
                  <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{c.desc}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Channel info */}
        <AnimatePresence mode="wait">
          <motion.div key={channel} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {channel === 'web' && (
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(74,108,247,0.04)', border: '1px solid rgba(74,108,247,0.1)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🌐</span>
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: '#374151' }}>Web dashboard</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>Chat directly from the dashboard. No extra setup needed.</p>
                    <div className="flex gap-2 mt-3">
                      {['⚡ Instant', '🔑 No API keys', '✨ Full features'].map(t => (
                        <span key={t} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(74,108,247,0.08)', color: '#4A6CF7' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {channel === 'whatsapp' && (
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: '#374151' }}>QR code pairing</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>Scan a QR code after deployment to connect.</p>
                    <div className="flex gap-2 mt-3">
                      {['📱 QR scan', '🔒 Secure', '🛡️ End-to-end'].map(t => (
                        <span key={t} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(34,197,94,0.06)', color: '#22C55E' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {channel === 'telegram' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold mb-1.5 block" style={{ color: '#374151' }}>Telegram username</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#F4F5FC', border: '1px solid #E8EAFF' }}>
                    <span className="text-sm" style={{ color: '#9CA3AF' }}>@</span>
                    <input value={username} onChange={e => setUsername(e.target.value)} placeholder="your_username"
                      className="flex-1 text-sm bg-transparent outline-none" style={{ color: '#374151' }} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block" style={{ color: '#374151' }}>Bot token</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#F4F5FC', border: '1px solid #E8EAFF' }}>
                    <input value={token} onChange={e => setToken(e.target.value)} type={showToken ? 'text' : 'password'} placeholder="123456789:ABCdef..."
                      className="flex-1 text-sm bg-transparent outline-none font-mono" style={{ color: '#374151' }} />
                    <button onClick={() => setShowToken(s => !s)} style={{ color: '#9CA3AF' }}>
                      {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 flex-shrink-0" style={{ borderTop: '1px solid #E8EAFF' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: '#9CA3AF' }}
          onMouseEnter={e => e.currentTarget.style.color = '#4A6CF7'}
          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-3">
          {showHostedBackendNotice && (
            <a
              href={FIREBASE_BILLING_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1 text-xs font-semibold underline"
              style={{ color: '#92400E' }}
            >
              Billing / project settings
              <ExternalLink size={12} />
            </a>
          )}
          <motion.button onClick={() => canDeploy && onDeploy?.({ channel, username: username.trim(), token: token.trim() })} disabled={!canDeploy}
            whileTap={canDeploy ? { scale: 0.97 } : {}}
            className="flex items-center gap-2.5 px-7 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
            style={{
              background: canDeploy ? `linear-gradient(135deg, ${activeChannel.color}, ${activeChannel.color}CC)` : '#EEF0F8',
              color: canDeploy ? '#fff' : '#C5C9E0',
              cursor: canDeploy ? 'pointer' : 'not-allowed',
              boxShadow: canDeploy ? `0 4px 20px ${activeChannel.color}25` : 'none',
            }}>
            🚀 {deployCtaLabel} <ArrowRight size={14} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function WizardModal({ agent, onClose }) {
  const questions = agentQuestions[agent?.name] || defaultQuestions;
  const total = questions.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [custom, setCustom] = useState('');
  const [direction, setDirection] = useState(1);
  const [phase, setPhase] = useState('questions'); // questions | deploy | payment | loading | success
  const [deployConfig, setDeployConfig] = useState({ channel: 'web', username: '', token: '' });
  const [deploymentResult, setDeploymentResult] = useState(null);

  const agentName = agent?.name || 'Agent';

  const current = questions[step];
  const selected = answers[step] || [];
  const progress = ((step + 1) / total) * 100;
  const canContinue = (answers[step] && answers[step].length > 0) || custom.trim().length > 0 || (!current?.opts?.length);

  const toggle = (opt) => {
    setAnswers(prev => {
      const cur = Array.isArray(prev[step]) ? prev[step] : [];
      return { ...prev, [step]: cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt] };
    });
  };

  const commitCurrentAnswer = () => {
    const trimmedCustom = custom.trim();

    setAnswers(prev => {
      const currentAnswer = prev[step];
      const selectedValues = Array.isArray(currentAnswer) ? currentAnswer : [];

      if (trimmedCustom && !selectedValues.length) {
        return { ...prev, [step]: trimmedCustom };
      }

      if (trimmedCustom && selectedValues.length) {
        const merged = selectedValues.includes(trimmedCustom)
          ? selectedValues
          : [...selectedValues, trimmedCustom];
        return { ...prev, [step]: merged };
      }

      return prev;
    });
  };

  const goNext = () => {
    commitCurrentAnswer();
    if (step < total - 1) { setDirection(1); setStep(s => s + 1); setCustom(''); }
    else { setPhase('deploy'); }
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection(-1); setStep(s => s - 1); setCustom('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col rounded-3xl overflow-hidden"
        style={{
          width: '720px',
          maxWidth: '92vw',
          height: '560px',
          maxHeight: '84vh',
          background: '#FFFFFF',
          border: '1px solid #E8EAFF',
          boxShadow: '0 32px 100px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid #E8EAFF', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4A6CF7, #6366F1)', boxShadow: '0 2px 8px rgba(74,108,247,0.35)' }}>
              {agentName[0]}
            </div>
            <span className="text-sm font-bold" style={{ color: '#0A0A1A' }}>Configure {agentName}</span>
            {phase === 'questions' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,108,247,0.1)', color: '#4A6CF7' }}>
                {step + 1}/{total}
              </span>
            )}
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,108,247,0.06)'; e.currentTarget.style.color = '#4A6CF7'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}>
            <X size={15} />
          </button>
        </div>

        {/* Progress bar */}
        {phase === 'questions' && (
          <div className="w-full h-[3px] flex-shrink-0" style={{ background: '#EEF0F8' }}>
            <motion.div className="h-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ background: 'linear-gradient(90deg, #4A6CF7, #6366F1)', boxShadow: '0 0 12px rgba(74,108,247,0.3)' }} />
          </div>
        )}

        {/* Content */}
        {phase === 'questions' && (
          <>
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 md:py-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * 30 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {/* Progress dots */}
                  <div className="mb-5">
                    <WizardProgressDots total={total} current={step} />
                  </div>

                  {/* Question */}
                  <h2 className="text-xl md:text-2xl font-extrabold mb-1.5 leading-tight" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>
                    {current.q}
                  </h2>
                  {current.opts?.length > 0 && (
                    <p className="text-xs font-medium mb-5" style={{ color: '#9CA3AF' }}>Select all that apply</p>
                  )}

                  {/* Custom input first */}
                  <div className="mb-5">
                    {current.opts?.length > 0 && (
                      <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: '#9CA3AF' }}>type your own</p>
                    )}
                    <input
                      value={custom}
                      onChange={e => setCustom(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && canContinue) goNext(); }}
                      placeholder={current.opts?.length ? 'Type a custom answer...' : 'Describe what you want...'}
                      className="w-full px-5 py-3.5 rounded-2xl text-sm outline-none transition-all duration-200 font-medium"
                      style={{
                        background: '#F4F5FC',
                        border: '1px solid #E8EAFF',
                        color: '#374151',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#4A6CF7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,108,247,0.1)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#E8EAFF'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {/* Options below */}
                  {current.opts?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {current.opts.map((opt, i) => (
                        <WizardOptionCard
                          key={opt}
                          label={opt}
                          emoji={optionEmojis[opt] || '✦'}
                          isSelected={selected.includes(opt)}
                          onClick={() => toggle(opt)}
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 md:px-8 py-4 flex-shrink-0" style={{ borderTop: '1px solid #E8EAFF' }}>
              <button onClick={goBack} disabled={step === 0}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: step === 0 ? '#D1D5DB' : '#9CA3AF', cursor: step === 0 ? 'not-allowed' : 'pointer' }}
                onMouseEnter={e => { if (step > 0) e.currentTarget.style.color = '#4A6CF7'; }}
                onMouseLeave={e => { if (step > 0) e.currentTarget.style.color = '#9CA3AF'; }}>
                <ArrowLeft size={14} /> Back
              </button>
              <motion.button onClick={goNext} disabled={!canContinue}
                whileTap={canContinue ? { scale: 0.97 } : {}}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                style={{
                  background: canContinue ? 'linear-gradient(135deg, #4A6CF7, #6366F1)' : '#EEF0F8',
                  color: canContinue ? '#fff' : '#C5C9E0',
                  cursor: canContinue ? 'pointer' : 'not-allowed',
                  boxShadow: canContinue ? '0 4px 20px rgba(74,108,247,0.3)' : 'none',
                }}>
                {step === total - 1 ? '🚀 Deploy' : 'Continue'}
                <ArrowRight size={14} strokeWidth={2.5} />
              </motion.button>
            </div>
          </>
        )}

        {phase === 'deploy' && (
          <DeployView
            agent={agent}
            initialChannel={deployConfig.channel}
            onBack={() => setPhase('questions')}
            onDeploy={(nextDeployConfig) => {
              setDeployConfig(nextDeployConfig || { channel: 'web', username: '', token: '' });
              setPhase('payment');
            }}
          />
        )}

        {phase === 'payment' && (
          <PaymentStep
            agent={agent}
            answers={answers}
            questions={questions}
            deployConfig={deployConfig}
            onBack={() => setPhase('deploy')}
            onComplete={(onboardingDataId) => {
              agent.onboardingDataId = onboardingDataId;
              setDeploymentResult(null);
              setPhase('loading');
            }}
          />
        )}

        {phase === 'loading' && (
          <div className="flex-1 overflow-hidden">
            <SetupLoadingStep
              agent={agent}
              onboardingDataId={agent?.onboardingDataId}
              onBack={() => setPhase('questions')}
              onComplete={(result) => {
                setDeploymentResult(result || null);
                setPhase('success');
              }}
            />
          </div>
        )}

        {phase === 'success' && (
          <DeploySuccessStep
            agent={agent}
            channel={deployConfig.channel}
            deployConfig={deployConfig}
            deployment={deploymentResult}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
