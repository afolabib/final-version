import { useState } from 'react';
import { Zap, Search, ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TypeBadge from './TypeBadge';

const sessionTabs = ['All', 'Active', 'Archived'];

const seedTasks = [
  {
    id: 'task_1',
    title: 'Website lead follow-up',
    lastMessage: 'Drafted first response and waiting for approval.',
    agent: 'Freemi',
    time: '2m ago',
    type: 'task',
    messages: [
      { role: 'assistant', text: 'I drafted a follow-up for the inbound lead from the website.', timestamp: '9:12 AM' },
      { role: 'user', text: 'Send me the draft here.', timestamp: '9:13 AM' },
      { role: 'assistant', text: 'Here is the draft. I can also tailor it for WhatsApp or email.', timestamp: '9:14 AM' },
    ],
  },
  {
    id: 'task_2',
    title: 'Support triage review',
    lastMessage: 'Three tickets were categorized as billing related.',
    agent: 'Triager',
    time: '11m ago',
    type: 'task',
    messages: [
      { role: 'assistant', text: 'Three new tickets were tagged billing and prioritized medium.', timestamp: '8:58 AM' },
    ],
  },
];

function SessionCard({ session, onSelect }) {
  return (
    <motion.div onClick={() => onSelect(session)} whileHover={{ y: -4 }} className="group relative rounded-2xl p-4 cursor-pointer overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,249,254,0.8))', border: '1px solid rgba(108,92,231,0.10)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <div className="relative z-1 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold" style={{ color: '#0F172A' }}>{session.title}</h3>
            <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>{session.lastMessage}</p>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(108,92,231,0.10)' }}>
            <MessageCircle size={14} style={{ color: '#6C5CE7' }} />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(108,92,231,0.1)', color: '#6C5CE7' }}>Task</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ color: '#6C5CE7', background: 'rgba(108,92,231,0.1)' }}>{session.agent}</span>
          <div className="flex-1" />
          <span className="text-xs" style={{ color: '#94A3B8' }}>{session.time}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ChatSession({ session, onBack }) {
  const [messages, setMessages] = useState(session.messages || []);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const next = [
      ...messages,
      { role: 'user', text: input.trim(), timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) },
    ];
    setMessages(next);
    setInput('');
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="flex-1 flex flex-col overflow-hidden" style={{ background: '#F4F5FC' }}>
      <div className="px-4 md:px-8 py-4 md:py-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.04)', background: 'rgba(255,255,255,0.5)' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors" style={{ color: '#94A3B8' }}>
          <ArrowLeft size={14} /> <span>Back to conversations</span>
        </button>
        <h1 className="text-lg md:text-xl font-extrabold" style={{ color: '#0F172A' }}>{session.title}</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 min-h-0">
        <div className="max-w-2xl mx-auto space-y-4 px-4 pb-24">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full min-w-0 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
              <div className="max-w-full overflow-hidden px-4 py-3 rounded-2xl text-sm leading-relaxed break-words whitespace-normal" style={{ background: msg.role === 'user' ? 'linear-gradient(135deg, #6C5CE7, #7C6CF7)' : 'rgba(255,255,255,0.95)', color: msg.role === 'user' ? '#fff' : '#1F2937', border: msg.role === 'user' ? 'none' : '1px solid rgba(108,92,231,0.08)' }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 md:px-8 py-4 border-t sticky bottom-0 z-10" style={{ borderColor: 'rgba(0,0,0,0.04)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-2xl mx-auto flex gap-3 w-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Reply here..."
            className="flex-1 px-4 py-3 rounded-xl outline-none text-sm font-medium"
            style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(108,92,231,0.12)', color: '#374151' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
            style={{ background: input.trim() ? 'linear-gradient(135deg, #6C5CE7, #7C6CF7)' : 'rgba(0,0,0,0.05)', color: input.trim() ? '#fff' : '#CBD5E1' }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function InboxView() {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  const visibleSessions = seedTasks.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  if (selectedSession) return <ChatSession session={selectedSession} onBack={() => setSelectedSession(null)} />;

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8" style={{ background: '#F4F5FC' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(108,92,231,0.08)' }}><Zap size={15} style={{ color: '#6C5CE7' }} /></div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>Inbox</h1>
            <p className="text-sm" style={{ color: '#94A3B8' }}>Review agent conversations and tasks.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex gap-2">
            {sessionTabs.map((sessionTab) => (
              <button key={sessionTab} onClick={() => setTab(sessionTab)} className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background: tab === sessionTab ? 'linear-gradient(135deg, #6C5CE7, #7C3AED)' : 'rgba(255,255,255,0.8)', color: tab === sessionTab ? '#fff' : '#6B7280', border: tab === sessionTab ? 'none' : '1px solid rgba(0,0,0,0.04)' }}>
                {sessionTab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl w-full sm:w-80" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <Search size={14} style={{ color: '#CBD5E1' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." className="flex-1 text-sm outline-none bg-transparent font-medium" style={{ color: '#374151' }} />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleSessions.map((session) => (
            <SessionCard key={session.id} session={session} onSelect={setSelectedSession} />
          ))}
        </div>
      </AnimatePresence>

      {visibleSessions.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-sm text-gray-500 border" style={{ borderColor: '#E8EAFF' }}>No conversations yet.</div>
      )}
    </div>
  );
}
