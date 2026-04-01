import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const roleColors = {
  sales: '#6C5CE7',
  support: '#7C3AED',
  ops: '#059669',
  cs: '#D97706',
  exec: '#2563EB',
};

const liveSequences = {
  sales: [
    { type: 'incoming', icon: '📩', text: 'New lead — Sarah @ Acme Corp', ms: 400 },
    { type: 'thinking', text: 'Analyzing profile & intent...', ms: 2000 },
    { type: 'action', icon: '🔍', text: 'Enterprise tier • $85K ARR potential', tag: 'Lead Scored', ms: 3500 },
    { type: 'tool', tool: 'CRM', text: 'Contact created in HubSpot', ms: 4800 },
    { type: 'action', icon: '✉️', text: 'Follow-up sent with pricing deck', tag: 'Email Sent', ms: 6200 },
    { type: 'tool', tool: 'Calendar', text: 'Thursday 2pm — booked with Sarah', ms: 7600 },
    { type: 'done', icon: '✅', text: 'Pipeline +$85K • Team notified on Slack', ms: 9000 },
  ],
  support: [
    { type: 'incoming', icon: '🎫', text: 'Ticket #4281 — "Sync broken since Tue"', ms: 400 },
    { type: 'thinking', text: 'Searching knowledge base...', ms: 2000 },
    { type: 'action', icon: '🔎', text: 'Root cause: API rate limit exceeded', tag: 'Diagnosed', ms: 3500 },
    { type: 'tool', tool: 'Helpdesk', text: 'Ticket updated with diagnosis', ms: 4800 },
    { type: 'action', icon: '🔧', text: 'Reset sync token & raised rate limit', tag: 'Fix Applied', ms: 6200 },
    { type: 'tool', tool: 'Docs', text: 'KB article created for team', ms: 7600 },
    { type: 'done', icon: '✅', text: 'Resolved • Customer notified • CSAT tracked', ms: 9000 },
  ],
  ops: [
    { type: 'incoming', icon: '📊', text: '12 invoices in processing queue', ms: 400 },
    { type: 'thinking', text: 'Validating amounts & matching POs...', ms: 2000 },
    { type: 'tool', tool: 'Sheets', text: 'Cross-referenced against vendor database', ms: 3500 },
    { type: 'action', icon: '✓', text: '9 auto-processed ($42,800)', tag: 'Processed', ms: 4800 },
    { type: 'action', icon: '⚠️', text: '2 flagged: exceed $5K threshold', tag: 'Flagged', ms: 6200 },
    { type: 'tool', tool: 'Email', text: 'Summary sent to finance team', ms: 7600 },
    { type: 'done', icon: '✅', text: '$42.8K cleared • 1 pending review', ms: 9000 },
  ],
  cs: [
    { type: 'incoming', icon: '📈', text: 'Health scan: 47 accounts analyzed', ms: 400 },
    { type: 'thinking', text: 'Checking usage & engagement data...', ms: 2000 },
    { type: 'tool', tool: 'Analytics', text: 'Usage trends pulled for Q1', ms: 3500 },
    { type: 'action', icon: '🔴', text: '3 at risk — usage dropped 40%', tag: 'Risk Found', ms: 4800 },
    { type: 'action', icon: '✉️', text: 'Re-engagement emails personalized & sent', tag: 'Outreach', ms: 6200 },
    { type: 'tool', tool: 'CRM', text: 'Pipeline updated with risk scores', ms: 7600 },
    { type: 'done', icon: '✅', text: '3 saves in progress • 5 upsells flagged', ms: 9000 },
  ],
  exec: [
    { type: 'incoming', icon: '☀️', text: 'Good morning — starting daily briefing', ms: 400 },
    { type: 'thinking', text: 'Scanning inbox, calendar, dashboards...', ms: 2000 },
    { type: 'tool', tool: 'Email', text: '23 emails triaged — 4 need you', ms: 3500 },
    { type: 'tool', tool: 'Calendar', text: '3 meetings today, prep moved to 2pm', ms: 4800 },
    { type: 'action', icon: '📄', text: 'Board deck drafted with latest KPIs', tag: 'Brief Ready', ms: 6200 },
    { type: 'tool', tool: 'Docs', text: 'Talking points added to shared doc', ms: 7600 },
    { type: 'done', icon: '✅', text: 'Day optimized • Brief in your inbox', ms: 9000 },
  ],
};

const CYCLE_MS = 12000;

const toolIcons = {
  CRM: '📊', Email: '📧', Calendar: '📅', Slack: '💬', Helpdesk: '🎫',
  Docs: '📚', Sheets: '📋', Analytics: '📈',
};

function TypingDots({ color }) {
  return (
    <span className="inline-flex gap-[3px] ml-1.5 items-center">
      {[0, 1, 2].map(i => (
        <motion.span key={i} className="w-[3px] h-[3px] rounded-full inline-block"
          style={{ background: color }}
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </span>
  );
}

function FeedItem({ item, color }) {
  const isThinking = item.type === 'thinking';
  const isDone = item.type === 'done';
  const isTool = item.type === 'tool';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-2.5"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.05 }}
        className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5"
        style={{
          background: isDone ? `${color}18` : isTool ? `${color}0A` : isThinking ? 'rgba(0,0,0,0.03)' : `${color}0C`,
          border: isDone ? `1px solid ${color}30` : isTool ? `1px solid ${color}15` : '1px solid transparent',
        }}
      >
        {isThinking ? (
          <TypingDots color={color} />
        ) : isTool ? (
          <span>{toolIcons[item.tool] || '🔌'}</span>
        ) : (
          <span>{item.icon}</span>
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isTool && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[9px] font-bold uppercase tracking-wider block mb-0.5"
            style={{ color: `${color}90` }}
          >
            → {item.tool}
          </motion.span>
        )}
        <p className={`text-[13px] leading-snug ${
          isDone ? 'font-semibold' : isThinking ? 'italic text-gray-400' : 'text-gray-600'
        }`} style={isDone ? { color } : {}}>
          {item.text}
          {isThinking && <TypingDots color={color} />}
        </p>
        {item.tag && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block mt-1 px-2 py-[2px] rounded-full text-[9px] font-bold"
            style={{ background: `${color}0F`, color, border: `1px solid ${color}18` }}
          >
            ✓ {item.tag}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

export default function LiveWorkstation({ roleKey }) {
  const color = roleColors[roleKey] || '#6C5CE7';
  const sequence = liveSequences[roleKey] || liveSequences.sales;
  const [shownItems, setShownItems] = useState([]);
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const timersRef = useRef([]);
  const mountedRef = useRef(true);
  const isInView = useInView(containerRef, { once: false, margin: '-50px' });
  const hasStartedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    hasStartedRef.current = false;

    // Clear on role change
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setShownItems([]);

    return () => {
      mountedRef.current = false;
      timersRef.current.forEach(clearTimeout);
    };
  }, [roleKey]);

  useEffect(() => {
    if (!isInView || hasStartedRef.current) return;
    hasStartedRef.current = true;

    function runCycle() {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      if (!mountedRef.current) return;

      setShownItems([]);

      sequence.forEach((item, idx) => {
        const t = setTimeout(() => {
          if (!mountedRef.current) return;
          setShownItems(prev => [...prev, { ...item, _key: `${Date.now()}-${idx}` }]);
        }, item.ms);
        timersRef.current.push(t);
      });

      const restart = setTimeout(() => {
        if (mountedRef.current) runCycle();
      }, CYCLE_MS);
      timersRef.current.push(restart);
    }

    runCycle();
  }, [isInView, roleKey]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [shownItems.length]);

  const progress = shownItems.length / sequence.length;
  const isDone = shownItems.length >= sequence.length;

  return (
    <div ref={containerRef} className="relative h-full flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-[6px] h-[6px] rounded-full"
            style={{ background: isDone ? color : '#22C55E' }}
            animate={isDone ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color }}>
            {isDone ? 'Complete' : 'Working...'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-400 font-medium">{shownItems.length}/{sequence.length}</span>
          <div className="w-16 h-[3px] rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}, ${color}AA)` }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Feed */}
      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto pr-1 min-h-[220px] max-h-[280px]"
        style={{ scrollbarWidth: 'thin' }}>
        <AnimatePresence mode="popLayout">
          {shownItems.map(item => (
            <FeedItem key={item._key} item={item} color={color} />
          ))}
        </AnimatePresence>

        {/* Pending indicator */}
        {shownItems.length > 0 && !isDone && (
          <motion.div
            className="flex items-center gap-1.5 pl-7"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <div className="w-1 h-1 rounded-full" style={{ background: color }} />
            <div className="w-1 h-1 rounded-full" style={{ background: color }} />
            <div className="w-1 h-1 rounded-full" style={{ background: color }} />
          </motion.div>
        )}

        {/* Done celebration */}
        <AnimatePresence>
          {isDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="flex items-center justify-center gap-2 py-2 mt-1 rounded-lg"
              style={{ background: `${color}06`, border: `1px dashed ${color}20` }}
            >
              <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.5 }}>
                🎉
              </motion.span>
              <span className="text-[11px] font-bold" style={{ color }}>All tasks completed</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}