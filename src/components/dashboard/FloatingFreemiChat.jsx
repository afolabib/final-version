import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, ChevronDown } from 'lucide-react';
import FreemiCharacter from '@/components/FreemiCharacter';

const SUGGESTED = [
  'What did my agents do today?',
  'Show me my top priority tasks',
  'How is my budget tracking?',
  'Summarize open support tickets',
];

const WELCOME = {
  role: 'assistant',
  text: "Hey! I'm Freemi, your AI Chief Executive. Ask me anything about your goals, agents, or business — I'm on it 24/7.",
};

export default function FloatingFreemiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [pulse, setPulse] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Occasional pulse to draw attention
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 4000);
    const t2 = setTimeout(() => setPulse(false), 7000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setThinking(true);
    // Simulate response
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 600));
    setThinking(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      text: getResponse(msg),
    }]);
  };

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 z-50 flex flex-col"
            style={{
              width: 360,
              height: 500,
              borderRadius: 24,
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(91,95,255,0.12)',
              boxShadow: '0 24px 80px rgba(91,95,255,0.18), 0 4px 24px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex-shrink-0 relative">
                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Sparkles size={14} color="white" strokeWidth={2} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ background: '#22C55E' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm leading-none">Freemi</div>
                <div className="text-white/70 text-[10px] mt-0.5">Your AI Chief Executive • Online</div>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                style={{ color: 'rgba(255,255,255,0.8)' }}>
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)' }}>
                      <Sparkles size={10} color="white" strokeWidth={2} />
                    </div>
                  )}
                  <div
                    className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed"
                    style={m.role === 'user' ? {
                      background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)',
                      color: 'white',
                      borderBottomRightRadius: 6,
                    } : {
                      background: 'rgba(91,95,255,0.06)',
                      color: '#1E1E2E',
                      borderBottomLeftRadius: 6,
                      border: '1px solid rgba(91,95,255,0.08)',
                    }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #5B5FFF, #6B63FF)' }}>
                    <Sparkles size={10} color="white" strokeWidth={2} />
                  </div>
                  <div className="rounded-2xl px-4 py-3 flex gap-1 items-center"
                    style={{ background: 'rgba(91,95,255,0.06)', border: '1px solid rgba(91,95,255,0.08)', borderBottomLeftRadius: 6 }}>
                    {[0, 0.15, 0.3].map(d => (
                      <motion.div key={d} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                        className="w-1.5 h-1.5 rounded-full" style={{ background: '#5B5FFF', opacity: 0.6 }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Suggestions (only show after first message if no user messages yet) */}
              {messages.length === 1 && (
                <div className="flex flex-col gap-2 mt-2">
                  {SUGGESTED.map((s, i) => (
                    <motion.button key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => send(s)}
                      className="text-left text-[12px] px-3.5 py-2 rounded-xl font-medium transition-all hover:scale-[1.01]"
                      style={{
                        background: 'rgba(91,95,255,0.05)',
                        color: '#5B5FFF',
                        border: '1px solid rgba(91,95,255,0.12)',
                      }}>
                      {s}
                    </motion.button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-3 pb-3 pt-2"
              style={{ borderTop: '1px solid rgba(91,95,255,0.07)' }}>
              <div className="flex gap-2 items-center rounded-2xl px-3 py-2"
                style={{ background: 'rgba(91,95,255,0.04)', border: '1px solid rgba(91,95,255,0.12)' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Ask Freemi anything…"
                  className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-gray-400"
                  style={{ color: '#1E1E2E' }}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || thinking}
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: input.trim() ? 'linear-gradient(135deg, #5B5FFF, #6B63FF)' : 'rgba(91,95,255,0.1)' }}>
                  <Send size={12} color={input.trim() ? 'white' : '#5B5FFF'} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-5 z-50 flex items-center justify-center"
        style={{
          width: 58,
          height: 58,
          borderRadius: 20,
          background: open ? 'linear-gradient(135deg, #5B5FFF, #6B63FF)' : 'white',
          boxShadow: open
            ? '0 8px 32px rgba(91,95,255,0.4)'
            : '0 8px 32px rgba(91,95,255,0.18), 0 2px 8px rgba(0,0,0,0.06)',
          border: open ? '1.5px solid rgba(255,255,255,0.2)' : '1.5px solid rgba(91,95,255,0.15)',
        }}>
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close"
              initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
              transition={{ duration: 0.18 }}>
              <X size={20} color="white" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div key="char"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              style={{ transform: 'scale(0.52)', transformOrigin: 'center' }}>
              <FreemiCharacter size="sm" color="#5B5FFF" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread dot */}
        {!open && (
          <motion.div
            animate={pulse ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.5 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: '#22C55E', border: '2px solid white', fontSize: 8, color: 'white', fontWeight: 700 }}>
            1
          </motion.div>
        )}
      </motion.button>
    </>
  );
}

function getResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('task') || m.includes('priorit')) return "You have 3 high-priority tasks due today. Rex has 2 open leads to follow up on, and Dev flagged a critical bug for your review.";
  if (m.includes('budget')) return "You're at 68% of your monthly budget. Marketing spend is running 12% over — I can have Nova generate a detailed breakdown and flag any anomalies.";
  if (m.includes('support') || m.includes('ticket')) return "Echo resolved 9 support tickets today with a 97% satisfaction score. 2 tickets are escalated and awaiting your input.";
  if (m.includes('agent') || m.includes('today')) return "Today your agents closed 4 deals (Rex), resolved 9 tickets (Echo), filed 3 ops reports (Nova), and merged 2 PRs (Dev). Strong day overall.";
  if (m.includes('goal')) return "You have 4 active goals. 'Q2 Revenue Target' is on track at 74%. I'd recommend reviewing the 'Launch Email Campaign' goal — it's at 22% with 8 days left.";
  return "On it. I'm pulling that data from your connected tools now. I'll have a full summary ready in just a moment — anything else you want me to include?";
}
