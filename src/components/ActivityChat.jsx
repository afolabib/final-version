import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const activities = [
  "Good morning! While you slept, I cleared 23 emails, booked 2 calls with hot leads, and updated your CRM. Coffee time? ☕",
  "Heads up — 3 prospects replied overnight. I've drafted personalized follow-ups and scheduled them for 9am. All you need to do is approve.",
  "Support queue is at zero. I resolved 8 tickets, escalated 1 VIP issue to your inbox, and updated the knowledge base.",
  "Your 10am meeting is prepped. I've pulled competitor data, summarized the prospect's recent activity, and drafted talking points.",
  "5 new leads from yesterday's webinar just qualified. I've added them to the pipeline and sent warm intro emails from your account.",
  "End of day wrap: 47 tasks completed, 6 meetings scheduled, 12 follow-ups sent. Tomorrow's priorities are ready for your review.",
];

export default function ActivityChat() {
  const [current, setCurrent] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const fullText = activities[current];
    let index = 0;

    if (isTyping) {
      const interval = setInterval(() => {
        if (index < fullText.length) {
          setDisplayText(fullText.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
        }
      }, 30);

      return () => clearInterval(interval);
    } else {
      // Show message for 3 seconds before moving to next
      const timeout = setTimeout(() => {
        setDisplayText('');
        setCurrent(p => (p + 1) % activities.length);
        setIsTyping(true);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isTyping, current]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mx-auto px-4 md:px-6 w-full"
    >
      <div
        className="rounded-2xl px-4 py-3 md:px-6 md:py-3.5 border backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 100%)',
          border: '1px solid rgba(108, 92, 231, 0.2)',
          boxShadow: '0 12px 40px rgba(108, 92, 231, 0.1), 0 0 1px rgba(255,255,255,0.9) inset',
        }}
      >
        {/* Chat header */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#6C5CE7', letterSpacing: '0.08em' }}>Freemi</span>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>

        {/* Chat message */}
        <div className="min-h-[28px] flex items-start">
          <p className="text-xs md:text-sm text-gray-800 leading-relaxed font-semibold break-words">
            {displayText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="ml-1 inline-block w-1.5 h-4 bg-gray-700 rounded-sm"
              />
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}