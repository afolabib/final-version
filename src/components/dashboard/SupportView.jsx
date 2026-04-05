import { useState, useEffect, useRef } from 'react';
import { Search, Mail, MessageSquare, Users, BookOpen, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';

const helpTabs = [
  { id: 'started', label: '🚀 Getting Started' },
  { id: 'agents', label: '🤖 Agents & Deployment' },
  { id: 'billing', label: '💳 Billing & Plans' },
  { id: 'integrations', label: '🔌 Integrations' },
  { id: 'troubleshooting', label: '🔧 Troubleshooting' },
];

const faqs = {
  started: [
    { q: 'How do I create my first agent?', a: 'Start with the onboarding wizard. Choose your use case, connect your tools, and deploy in minutes.' },
    { q: 'Do I need technical skills?', a: 'No. Our guided setup handles everything. Most teams are live within 60 seconds.' },
    { q: 'What are the system requirements?', a: 'Just a web browser and internet connection. Works on all devices—desktop, tablet, or mobile.' },
  ],
  agents: [
    { q: 'How do I deploy an agent?', a: 'Go to Agents → Deploy Agent and follow the wizard. Select your AI model, connect integrations, and activate.' },
    { q: 'Can I run multiple agents?', a: 'Yes, depending on your plan you can run multiple agents simultaneously. Each with unique configurations.' },
    { q: 'How do I customize my agent behavior?', a: 'Use the Skills tab to add custom behaviors, set response rules, and define agent personalities.' },
  ],
  billing: [
    { q: 'How does billing work?', a: 'We charge per credit used. Credits reset monthly based on your plan. Unused credits roll over up to 3 months.' },
    { q: 'Can I upgrade anytime?', a: 'Yes, upgrades take effect immediately. You\'ll only be charged for the remainder of the billing cycle.' },
    { q: 'What happens if I run out of credits?', a: 'Your agents will pause. You can either wait for next month\'s reset or purchase additional credits instantly.' },
  ],
  integrations: [
    { q: 'Which tools can I connect?', a: 'Over 20 integrations including Gmail, Slack, HubSpot, Notion, Google Sheets, Salesforce, and more.' },
    { q: 'Is OAuth secure?', a: 'Yes, we use OAuth 2.0 and never store your passwords. Credentials are encrypted and isolated per user.' },
    { q: 'Can I connect multiple accounts for the same tool?', a: 'Yes. You can connect multiple Gmail accounts, Slack workspaces, or HubSpot instances under different agent configurations.' },
  ],
  troubleshooting: [
    { q: 'My agent is not responding, what do I do?', a: 'Check the Inbox view for errors. Try rebooting the VM from the agent chat. If issues persist, contact support.' },
    { q: 'How do I reset my agent?', a: "Open the agent chat, click ··· and select 'Reboot VM'. This will refresh all connections and clear the queue." },
    { q: 'Why is my agent slow or timing out?', a: 'This usually happens with large dataset queries. Try optimizing your integration settings or limiting data scope. Contact support if it persists.' },
  ],
};

const channels = [
  { icon: Mail, title: 'Email Support', sub: 'support@maagic.systems', note: '< 2 hours', color: '#2563EB' },
  { icon: MessageSquare, title: 'Live Chat', sub: 'Available 9am-6pm EST', badge: 'Instant', note: 'Instant', color: '#10B981' },
  { icon: Users, title: 'Community Slack', sub: 'Join 5000+ users', note: 'Community driven', color: '#818CF8' },
  { icon: BookOpen, title: 'Documentation', sub: 'Full guides & tutorials', note: 'Always available', color: '#F59E0B' },
];

export default function SupportView() {
  const [tab, setTab] = useState('started');
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const currentFaqs = faqs[tab] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Thanks for reaching out! Our support team will help you shortly.' }]);
    }, 500);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-10" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
        <div className="inline-block mb-4">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full" style={{ background: 'rgba(74,108,247,0.08)', color: '#5B5FFF', border: '1px solid rgba(74,108,247,0.15)' }}>Support Center</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3" style={{ color: '#0A0A1A', letterSpacing: '-0.03em' }}>How can we help?</h1>
        <p className="text-base" style={{ color: '#6B7280' }}>Find answers, guides, and premium support for Maagic Systems</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        className="flex items-center gap-3 px-5 py-3.5 rounded-2xl mb-8 md:mb-10 w-full sm:w-96 input-focus-ring"
        style={{ background: '#FFFFFF', border: '1px solid #E8EAFF', boxShadow: '0 4px 16px rgba(74,108,247,0.08)' }}>
        <Search size={16} style={{ color: '#5B5FFF' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search help articles..."
          className="flex-1 text-sm outline-none bg-transparent font-medium" style={{ color: '#374151' }} />
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.08 }}
        className="flex flex-wrap gap-2 md:gap-2.5 mb-8 md:mb-12">
        {helpTabs.map(t => (
          <motion.button key={t.id} onClick={() => setTab(t.id)}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === t.id ? 'linear-gradient(135deg, #5B5FFF, #6B63FF)' : '#FFFFFF',
              color: tab === t.id ? '#fff' : '#6B7280',
              border: tab === t.id ? 'none' : '1px solid #E8EAFF',
              boxShadow: tab === t.id ? '0 8px 24px rgba(74,108,247,0.3)' : '0 2px 8px rgba(0,0,0,0.02)',
            }}>
            {t.label}
          </motion.button>
        ))}
      </motion.div>

      {/* FAQs */}
      <div className="grid grid-cols-1 gap-6 mb-14">
        {currentFaqs.map((faq, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
            whileHover={{ y: -6 }}
            className="rounded-2xl p-7 group relative overflow-hidden"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8EAFF',
              boxShadow: '0 4px 20px rgba(74,108,247,0.08)',
            }}>
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity pointer-events-none" style={{ background: '#5B5FFF' }} />
            <p className="text-base font-bold mb-3" style={{ color: '#0A0A1A' }}>{faq.q}</p>
            <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{faq.a}</p>
          </motion.div>
        ))}
      </div>

      {/* Channels */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6 md:mb-8" style={{ color: '#0A0A1A', letterSpacing: '-0.03em' }}>Support Channels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-14">
          {channels.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25 + i * 0.04 }}
                whileHover={{ y: -8 }}
                className="rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer relative overflow-hidden group"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8EAFF',
                  boxShadow: '0 4px 20px rgba(74,108,247,0.08)',
                }}>
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" style={{ background: c.color }} />
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: `${c.color}12` }}>
                  <Icon size={24} style={{ color: c.color }} />
                </div>
                <p className="text-base font-bold mb-2" style={{ color: '#0A0A1A' }}>{c.title}</p>
                <p className="text-sm mb-3" style={{ color: '#6B7280' }}>{c.sub}</p>
                {c.badge && (
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full mb-2 transition-all"
                    style={{ background: 'linear-gradient(135deg, rgba(74,108,247,0.12), rgba(99,102,241,0.08))', color: '#5B5FFF', border: '1px solid rgba(74,108,247,0.2)' }}>{c.badge}</span>
                )}
                <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>{c.note}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Contact form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
        className="rounded-2xl p-6 md:p-10 mb-10 relative overflow-hidden group"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF, #F8FAFF)',
          border: '1px solid #E8EAFF',
          boxShadow: '0 8px 32px rgba(74,108,247,0.1)',
        }}>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{ background: '#5B5FFF' }} />
        <h3 className="text-2xl font-extrabold mb-2" style={{ color: '#0A0A1A' }}>Didn't find an answer?</h3>
        <p className="text-base mb-6" style={{ color: '#6B7280' }}>Get in touch with our support team and we'll help you out</p>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email"
          className="w-full px-5 py-3.5 rounded-xl text-sm outline-none mb-4 input-focus-ring font-medium"
          style={{ border: '1px solid #E8EAFF', color: '#374151', background: '#FFFFFF' }} />
        <textarea rows={4} placeholder="Describe your issue..."
          className="w-full px-5 py-3.5 rounded-xl text-sm outline-none resize-none mb-5 input-focus-ring font-medium"
          style={{ border: '1px solid #E8EAFF', color: '#374151', background: '#FFFFFF' }} />
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 8px 24px rgba(74,108,247,0.3)' }}>
          Send message
        </motion.button>
      </motion.div>

      <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
        © 2026 Freemi. All rights reserved. &nbsp;·&nbsp;
        <span className="cursor-pointer hover:text-[#5B5FFF] transition-colors" style={{ color: '#9CA3AF' }}>Privacy Policy</span> &nbsp;·&nbsp;
        <span className="cursor-pointer hover:text-[#5B5FFF] transition-colors" style={{ color: '#9CA3AF' }}>Terms of Service</span>
      </p>

      {/* Chat Widget */}
      {showChat && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 right-6 w-96 rounded-2xl shadow-2xl z-50" style={{ background: '#FFFFFF', border: '1px solid #E8EAFF' }}>
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E8EAFF', background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)' }}>
            <div>
              <p className="text-sm font-bold text-white">Live Chat Support</p>
              <p className="text-xs text-white/80">Average reply time: 2 min</p>
            </div>
            <button onClick={() => setShowChat(false)} className="text-white/80 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <MessageSquare size={32} style={{ color: '#E8EAFF', margin: '0 auto 8px' }} />
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Start a conversation</p>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 flex gap-2" style={{ borderTop: '1px solid #E8EAFF' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none font-medium"
              style={{ background: '#F3F4F6', border: '1px solid #E8EAFF', color: '#374151' }}
            />
            <button onClick={handleSendMessage} className="p-2 rounded-lg transition-all text-white" style={{ background: '#5B5FFF' }}>
              <Send size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Chat Toggle Button */}
      {!showChat && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg z-40"
          style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', boxShadow: '0 8px 24px rgba(74,108,247,0.3)' }}>
          <MessageSquare size={20} />
        </motion.button>
      )}
    </div>
  );
}