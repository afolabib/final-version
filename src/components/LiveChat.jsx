import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-400"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

export default function LiveChat({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! 👋 I'm Freemi — your AI operator. I handle the work so you don't have to.\n\nAsk me anything about what I can do, or just say hi!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const replies = [
        "FreemiOS lets you give goals to an AI CEO that breaks them down into tasks and delegates to specialized agents — sales, engineering, support, and more.",
        "You can hire agents, set budgets, and track everything from one dashboard. Freemi handles the execution.",
        "Think of it as a fully staffed company, just AI-powered. You stay in command while Freemi runs the day-to-day.",
        "Head to the dashboard to brief Freemi on your goals — she'll take it from there. 🚀",
        "FreemiOS is built on a Paperclip-style orchestration model: CEO agent at the top, specialized sub-agents handling each function.",
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      await new Promise(r => setTimeout(r, 700));
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      toast.error('Failed to get response');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full md:rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #F8F7FF 0%, #FFFFFF 100%)',
        boxShadow: '0 25px 60px rgba(108,92,231,0.15), 0 8px 20px rgba(0,0,0,0.06)',
        border: '1px solid rgba(108,92,231,0.08)',
      }}>

      {/* Header */}
      <div className="relative px-5 py-4 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #6C5CE7 0%, #7C6CF7 50%, #8B7CF8 100%)',
        }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3), transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2), transparent 50%)' }} />
        <div className="relative flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-tight">Freemi</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              <span className="text-white/70 text-[10px] font-medium">Online now</span>
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose}
            className="relative md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #EDE9FF, #F3F0FF)', border: '1px solid rgba(108,92,231,0.08)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: '#6C5CE7' }} />
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    isUser
                      ? 'rounded-2xl rounded-br-md text-white font-medium'
                      : 'rounded-2xl rounded-bl-md text-gray-700'
                  }`}
                  style={isUser
                    ? { background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', boxShadow: '0 2px 8px rgba(108,92,231,0.25)' }
                    : { background: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }
                  }
                >
                  {isUser ? (
                    msg.content.split('\n').map((line, j) => (
                      <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
                    ))
                  ) : (
                    <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_strong]:text-gray-800 [&_a]:text-violet-600">
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start gap-2"
          >
            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: 'linear-gradient(135deg, #EDE9FF, #F3F0FF)', border: '1px solid rgba(108,92,231,0.08)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#6C5CE7' }} />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-md"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
              <TypingIndicator />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(108,92,231,0.06)', background: 'rgba(248,247,255,0.5)' }}>
        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Ask Freemi anything..."
              className="w-full px-4 py-2.5 bg-white rounded-xl text-[13px] font-medium outline-none placeholder:text-gray-400 input-focus-ring"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
              disabled={loading}
            />
          </div>
          <motion.button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            whileTap={{ scale: 0.92 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: input.trim() && !loading ? 'linear-gradient(135deg, #6C5CE7, #7C6CF7)' : 'rgba(108,92,231,0.08)',
              boxShadow: input.trim() && !loading ? '0 3px 12px rgba(108,92,231,0.3)' : 'none',
              color: input.trim() && !loading ? '#fff' : '#B0A8E0',
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}