import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, Send, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/lib/AuthContext';

const quickActions = [
  { emoji: '🎯', text: 'Score leads', prompt: 'Review this lead and score them 1-10 based on fit. Consider: budget, timeline, use case, and industry alignment. Provide a brief assessment.' },
  { emoji: '✍️', text: 'Compose responses', prompt: 'Draft a professional, personalized email response. Keep it concise (2-3 sentences), friendly, and address the key points they raised.' },
  { emoji: '📅', text: 'Schedule meetings', prompt: 'Suggest 3 available meeting times for next week, send a calendar invite, and include a brief agenda.' },
  { emoji: '📧', text: 'Follow-up messages', prompt: 'Write a thoughtful follow-up message that references our previous conversation, adds value, and includes a clear next step.' },
];

export default function HomeView({ onDeploy }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const typeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const { uploadFile, uploading } = useFileUpload();
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const typeText = (text) => {
    if (typeoutRef.current) clearInterval(typeoutRef.current);
    let idx = 0;
    setInput('');
    typeoutRef.current = setInterval(() => {
      if (idx < text.length) {
        setInput(prev => prev + text[idx]);
        idx++;
      } else {
        clearInterval(typeoutRef.current);
      }
    }, 10);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) {
        setInput(prev => prev + (prev ? ' ' : '') + `[File: ${file.name}]`);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = moment().format('dddd, MMMM D');

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: '#F4F5FC' }}>
      {/* Speaking-to bar */}
      <div className="px-4 md:px-8 py-3 text-sm" style={{ color: '#9CA3AF', borderBottom: '1px solid rgba(0,0,0,0.04)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}>
        <span className="font-medium" style={{ color: '#374151' }}>Speaking to:</span>
        <span className="ml-2 italic">No agents yet</span>
      </div>

      <div className="flex-1 flex flex-col items-center pt-8 md:pt-16 pb-8 px-4 md:px-6">
        {/* Logo icon */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <img src="https://media.base44.com/images/public/69c33793e2f72e04b51160c6/d9b7a3023_image.png" alt="Freemi" className="w-14 h-14 rounded-2xl mb-6" style={{ boxShadow: '0 8px 28px rgba(108,92,231,0.35)' }} />
        </motion.div>

        {/* Serif greeting */}
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.06 }}
          className="text-2xl md:text-4xl mb-2 text-center tracking-tight font-extrabold"
          style={{ color: '#0A0A1A' }}>
          {greeting}, {firstName}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.12 }}
          className="text-sm mb-8" style={{ color: '#6B7280' }}>
          {dateStr} · Your agents are ready
        </motion.p>

        {/* Chat input card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18 }}
          className="w-full max-w-2xl rounded-2xl mb-6 input-focus-ring"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            border: focused ? '1px solid rgba(108,92,231,0.25)' : '1px solid rgba(0,0,0,0.05)',
            boxShadow: focused
              ? '0 0 0 3px rgba(108,92,231,0.10), 0 8px 30px rgba(108,92,231,0.10)'
              : '0 4px 20px rgba(0,0,0,0.04)',
            transition: 'box-shadow 220ms ease-out, border-color 220ms ease-out',
          }}>
          <div className="px-5 pt-5 pb-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Ask your operator to do something..."
              className="w-full text-sm outline-none bg-transparent font-medium"
              style={{ color: '#374151', caretColor: '#6C5CE7', transition: 'color 150ms' }}
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <span className="text-xs hidden md:inline" style={{ color: '#CBD5E1' }}>⌘K to focus · ⌘↵ to send</span>
            <div className="flex items-center gap-2">
              <button onClick={handleFileClick} disabled={uploading} className="p-1.5 rounded-lg transition-all" style={{ color: uploading ? '#94A3B8' : '#CBD5E1' }}
                onMouseEnter={e => !uploading && (e.currentTarget.style.color = '#6C5CE7')}
                onMouseLeave={e => !uploading && (e.currentTarget.style.color = '#CBD5E1')}>
                <Paperclip size={14} strokeWidth={2} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="*"
              />
              <button
                onClick={() => { if (input) navigate('/chat'); }}
                className="w-7 h-7 rounded-full flex items-center justify-center btn-press"
                style={{
                  background: input
                    ? 'linear-gradient(135deg, #6C5CE7, #7C6CF7)'
                    : 'rgba(0,0,0,0.05)',
                  boxShadow: input ? '0 4px 12px rgba(108,92,231,0.30)' : 'none',
                  transition: 'background 200ms, box-shadow 200ms',
                }}>
                <Send size={12} strokeWidth={2} style={{ color: input ? '#fff' : '#CBD5E1' }} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick action cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.26 }}
          className="flex flex-wrap gap-2 md:gap-2.5 justify-center max-w-2xl mb-8">
          {quickActions.map((action) => {
            const borderColors = ['#E0E7FF', '#DBEAFE', '#FEF3C7', '#DCFCE7'];
            const hoverColors = ['#6366F1', '#3B82F6', '#F59E0B', '#10B981'];
            const idx = quickActions.indexOf(action);
            return (
              <motion.button key={action.text} onClick={() => typeText(action.prompt)}
                whileHover={{ y: -2 }}
                className="px-3 py-2 md:px-3.5 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all inline-flex items-center gap-1.5 md:gap-2"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: `1.5px solid ${borderColors[idx]}`,
                  color: '#374151',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = hoverColors[idx];
                  e.currentTarget.style.color = hoverColors[idx];
                  e.currentTarget.style.background = 'rgba(255,255,255,0.85)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${hoverColors[idx]}15`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = borderColors[idx];
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                }}>
                <span>{action.emoji}</span>{action.text}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Deploy CTA */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.32 }}
          onClick={() => navigate('/dashboard/picker')}
          className="px-8 py-3 rounded-full text-sm font-bold text-white btn-press btn-breathe"
          style={{
            background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)',
            boxShadow: '0 4px 16px rgba(108,92,231,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}>
          Deploy your first operator →
        </motion.button>
      </div>
    </div>
  );
}