import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Pencil, Users, Monitor, SlidersHorizontal, MoreHorizontal, X, Bot, RefreshCw, RotateCcw, Trash2, Settings, MessageSquareText } from 'lucide-react';
import AgentConfigModal from '../components/dashboard/AgentConfigModal';
import MessageQueue from '../components/dashboard/MessageQueue';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ChatInput from '../components/dashboard/ChatInput';
import ReactMarkdown from 'react-markdown';

const initialMessages = [
  {
    id: 1, role: 'agent', time: '14:52',
    content: `To get dialed in, I need a **few things** from you:

1. **What should I call you?**
2. **What do you do?** (founder, exec, creator, etc.)
3. **What timezone are you in?**
4. **What matters most to you right now?** (top priorities)
5. **How do you like updates?** Brief pings, morning briefings, detailed reports?

Once I know who I'm working for, I'll be a lot more useful.`
  },
  { id: 2, role: 'user', time: '14:54', content: 'hi' },
  { id: 3, role: 'agent', time: '14:54', content: "Hey. I'm here — what do you need?" },
  { id: 4, role: 'user', time: 'just now', content: 'I need general assistance' },
  { id: 5, role: 'agent', time: 'just now', content: "Hey — I'm Atlas, ready to help. What do you need?" },
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0 mt-0.5"
          style={{ background: 'linear-gradient(135deg, #4A6CF7, #7B93FF)', boxShadow: '0 2px 8px rgba(74,108,247,0.35)' }}>
          A
        </div>
      )}
      <div className={`max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-bold" style={{ color: '#0A0A1A' }}>Atlas</span>
            <span className="text-[11px]" style={{ color: '#C5C9E0' }}>{msg.time}</span>
          </div>
        )}
        <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={isUser ? {
            background: 'linear-gradient(135deg, #4A6CF7, #7B93FF)',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(74,108,247,0.28)',
          } : {
            background: '#fff',
            color: '#374151',
            border: '1px solid #E8EAFF',
            boxShadow: '0 2px 12px rgba(74,108,247,0.06)',
          }}>
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <ReactMarkdown
              className="prose prose-sm max-w-none"
              components={{
                strong: ({ children }) => <strong style={{ color: '#0A0A1A', fontWeight: 700 }}>{children}</strong>,
                p: ({ children }) => <p style={{ margin: '4px 0', lineHeight: 1.6 }}>{children}</p>,
                ol: ({ children }) => <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>{children}</ol>,
                li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          )}
        </div>
        {isUser && <span className="text-[11px] mt-1" style={{ color: '#C5C9E0' }}>{msg.time}</span>}
      </div>
    </motion.div>
  );
}

const panels = [
  { id: 'subagents', icon: MessageSquareText, label: 'Chat' },
  { id: 'computer', icon: Monitor, label: "Agent's Computer" },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'refresh', icon: RefreshCw, label: 'Refresh' },
];

export default function AgentChat() {
  const navigate = useNavigate();
  const [active, setActive] = useState('agents');
  const [messages, setMessages] = useState(initialMessages);

  const handleNav = (id) => {
    setActive(id);
    navigate(`/dashboard/${id === 'home' ? '' : id}`);
  };
  const [openPanel, setOpenPanel] = useState(null);
  const [messageQueue, setMessageQueue] = useState([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text, hasFile) => {
    // Add to queue instead of sending immediately if agent is busy
    const newItem = { id: Date.now(), text: text.length > 40 ? text.slice(0, 40) + '...' : text, hasFile: !!hasFile };
    setMessageQueue(q => [...q, newItem]);
    // Simulate processing the first queued message after a short delay
    setTimeout(() => {
      setMessageQueue(q => q.filter(item => item.id !== newItem.id));
      const userMsg = { id: Date.now(), role: 'user', time: 'just now', content: text };
      const agentReply = { id: Date.now() + 1, role: 'agent', time: 'just now', content: "Got it — I'm on it. Let me know if you need anything else." };
      setMessages(prev => [...prev, userMsg, agentReply]);
    }, 2000);
  };

  const handleClearQueue = () => setMessageQueue([]);
  const handleRemoveFromQueue = (id) => setMessageQueue(q => q.filter(item => item.id !== id));
  const handlePauseQueue = () => {};

  const _handleSend = (text) => {
    const userMsg = { id: Date.now(), role: 'user', time: 'just now', content: text };
    const agentReply = { id: Date.now() + 1, role: 'agent', time: 'just now', content: "Got it — I'm on it. Let me know if you need anything else." };
    setMessages(prev => [...prev, userMsg, agentReply]);
  };

  const togglePanel = (id) => {
    if (id === 'settings') {
      setShowConfig(true);
      return;
    }
    if (id === 'refresh') return;
    setOpenPanel(p => p === id ? null : id);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'Inter, sans-serif', background: '#EEF0F8' }}>
      <DashboardSidebar active={active} onNav={handleNav} />

      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: '#F4F5FC' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E8EAFF' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #4A6CF7, #7B93FF)', boxShadow: '0 2px 8px rgba(74,108,247,0.35)' }}>A</div>
            <span className="font-bold text-sm" style={{ color: '#0A0A1A' }}>Atlas</span>
            <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: '#C5C9E0' }}>
              <Pencil size={12} strokeWidth={2} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {panels.map(p => (
              <button key={p.id}
                onClick={() => togglePanel(p.id)}
                className="p-2 rounded-xl transition-all"
                style={{
                  color: openPanel === p.id ? '#4A6CF7' : '#C5C9E0',
                  background: openPanel === p.id ? 'rgba(74,108,247,0.08)' : 'transparent',
                }}
                onMouseEnter={e => { if (openPanel !== p.id) { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = '#F4F5FC'; } }}
                onMouseLeave={e => { if (openPanel !== p.id) { e.currentTarget.style.color = '#C5C9E0'; e.currentTarget.style.background = 'transparent'; } }}
              >
                <p.icon size={15} strokeWidth={1.8} />
              </button>
            ))}
            {/* More menu */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(v => !v)}
                className="p-2 rounded-xl transition-all"
                style={{ color: showMoreMenu ? '#4A6CF7' : '#C5C9E0', background: showMoreMenu ? 'rgba(74,108,247,0.08)' : 'transparent', border: showMoreMenu ? '1px solid #E8EAFF' : '1px solid transparent' }}
              >
                <MoreHorizontal size={15} strokeWidth={1.8} />
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden z-50 w-52"
                  style={{ background: '#fff', border: '1px solid #E8EAFF', boxShadow: '0 16px 48px rgba(74,108,247,0.16), 0 4px 16px rgba(0,0,0,0.06)' }}>
                  <button onClick={() => setShowMoreMenu(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50" style={{ color: '#374151', borderBottom: '1px solid #F0F1FF' }}>
                    <RotateCcw size={14} style={{ color: '#6B7280' }} />
                    Reboot VM
                  </button>
                  <button onClick={() => setShowMoreMenu(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors hover:bg-red-50" style={{ color: '#EF4444', borderBottom: '1px solid #F0F1FF' }}>
                    <X size={14} style={{ color: '#EF4444' }} />
                    Cancel subscription
                  </button>
                  <button onClick={() => setShowMoreMenu(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors hover:bg-red-50" style={{ color: '#EF4444' }}>
                    <Trash2 size={14} style={{ color: '#EF4444' }} />
                    Delete employee
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              <div ref={bottomRef} />
            </div>
            <MessageQueue
              queue={messageQueue}
              onClear={handleClearQueue}
              onRemove={handleRemoveFromQueue}
              onPause={handlePauseQueue}
            />
            <ChatInput onSend={handleSend} />
          </div>

          {/* Side panel */}
          {openPanel && (
            <motion.div
              key={openPanel}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.18 }}
              className="w-80 flex-shrink-0 flex flex-col"
              style={{ background: '#fff', borderLeft: '1px solid #E8EAFF', boxShadow: '-4px 0 24px rgba(74,108,247,0.07)' }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #F0F1FF' }}>
                <div className="flex items-center gap-2">
                  {(() => { const p = panels.find(x => x.id === openPanel); return p ? <p.icon size={14} style={{ color: '#4A6CF7' }} /> : null; })()}
                  <span className="text-sm font-bold" style={{ color: '#0A0A1A' }}>
                    {panels.find(p => p.id === openPanel)?.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: '#C5C9E0' }}><RefreshCw size={13} /></button>
                  <button onClick={() => setOpenPanel(null)} className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: '#C5C9E0' }}><X size={13} /></button>
                </div>
              </div>

              {/* Panel content */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {openPanel === 'subagents' && (
                  <div>
                    <p className="text-xs font-semibold mb-3" style={{ color: '#9CA3AF' }}>Subagents</p>
                    <div className="rounded-2xl flex flex-col items-center justify-center py-10 gap-3"
                      style={{ background: '#F4F5FC', border: '1px solid #E8EAFF' }}>
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#E8EAFF' }}>
                        <Bot size={20} style={{ color: '#C5C9E0' }} />
                      </div>
                      <p className="text-xs font-semibold text-center" style={{ color: '#9CA3AF' }}>No subagents running</p>
                    </div>
                  </div>
                )}
                {openPanel === 'computer' && (
                  <div className="flex flex-col h-full">
                    <div className="pb-4 mb-4" style={{ borderBottom: '1px solid #F0F1FF' }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#9CA3AF' }}>Agent's Computer</p>
                      <p className="text-xs" style={{ color: '#CBD5E1' }}>What is using Inspector</p>
                    </div>
                    <div className="flex-1 rounded-xl overflow-hidden" style={{ border: '1px solid #E8EAFF' }}>
                      <div className="px-3 py-2 flex items-center gap-2" style={{ background: '#F4F5FC', borderBottom: '1px solid #E8EAFF' }}>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-300" />
                          <div className="w-2 h-2 rounded-full bg-yellow-300" />
                          <div className="w-2 h-2 rounded-full bg-green-300" />
                        </div>
                        <div className="flex-1 rounded px-2 py-0.5 text-[10px]" style={{ background: '#fff', color: '#9CA3AF' }}>google.com</div>
                      </div>
                      <div className="flex items-center justify-center py-12" style={{ background: '#fff' }}>
                        <div className="text-2xl font-bold" style={{ background: 'linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Google</div>
                      </div>
                    </div>
                    
                    {/* Task progress */}
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid #F0F1FF' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>Task progress</p>
                        <span className="text-xs" style={{ color: '#CBD5E1' }}>1 / 1</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F4F5FC' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
                        <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Inspecting files...</p>
                      </div>
                    </div>
                  </div>
                )}
                {openPanel === 'files' && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <SlidersHorizontal size={24} style={{ color: '#C5C9E0' }} />
                    <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>No files yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <AnimatePresence>
        {showConfig && <AgentConfigModal onClose={() => setShowConfig(false)} />}
      </AnimatePresence>
    </div>
  );
}