import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SamDemo() {
  const [messages, setMessages] = useState([
    { role: 'agent', content: 'Hi! I\'m Sam, your task management assistant. What can I help you organize today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await base44.functions.invoke('samDemo', { userMessage });
      setMessages(prev => [...prev, { role: 'agent', content: response.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'agent', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-bold px-4 py-2 rounded-full inline-block mb-4" style={{ background: 'rgba(74,108,247,0.08)', color: '#4A6CF7' }}>
            Try Sam Now
          </span>
          <h2 className="text-4xl font-extrabold mb-3" style={{ color: '#0A0A1A', letterSpacing: '-0.03em' }}>
            Meet Sam in Action
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#6B7280' }}>
            Chat with Sam to see how it can organize your tasks, manage your calendar, and keep your team aligned.
          </p>
        </motion.div>

        {/* Chat container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8EAFF',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            height: '500px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Messages area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4"
            style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 100%)' }}
          >
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                  style={{
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #4A6CF7, #6366F1)' : '#F4F5FC',
                    boxShadow: msg.role === 'user' ? '0 4px 12px rgba(74,108,247,0.25)' : 'none'
                  }}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </motion.div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-gray-100 p-4" style={{ background: '#FFFFFF' }}>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask Sam something..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                style={{
                  background: '#F4F5FC',
                  border: '1px solid #E8EAFF',
                  color: '#374151'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #4A6CF7, #6366F1)' : '#EEF0F8',
                  color: input.trim() && !loading ? '#fff' : '#C5C9E0',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
                }}
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
            Ready to deploy Sam for your team?
          </p>
          <button
            className="px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #4A6CF7, #6366F1)',
              boxShadow: '0 8px 28px rgba(74,108,247,0.3)'
            }}
          >
            Get Started
          </button>
        </motion.div>
      </div>
    </section>
  );
}