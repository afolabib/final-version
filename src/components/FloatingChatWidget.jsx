import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveChat from './LiveChat';
import FreemiCharacter from './FreemiCharacter';

export default function FloatingChatWidget() {
  const [open, setOpen] = useState(false);


  return (
    <>
      {/* Floating Button */}
      <div
        className="fixed bottom-2 right-2 md:bottom-6 md:right-4 z-[9999]"
        style={{ overflow: 'visible' }}
      >
        <motion.button
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.9 }}
          className="flex items-center justify-center"
          style={{ overflow: 'visible' }}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #5B5FFF, #7C6CF7)',
                  boxShadow: '0 4px 20px rgba(91,95,255,0.4)',
                }}
              >
                <X size={22} className="text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="character"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="relative"
              >
                {/* Speech bubble */}
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.4, type: 'spring', stiffness: 200 }}
                  className="absolute -top-12 right-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg pointer-events-none"
                  style={{
                    background: '#fff',
                    color: '#5B5FFF',
                    border: '1px solid rgba(91,95,255,0.15)',
                    boxShadow: '0 4px 16px rgba(91,95,255,0.12)',
                  }}
                >
                  Hi! I'm Freemi, nice to meet you 👋
                  <div className="absolute -bottom-1 right-5 w-2.5 h-2.5 rotate-45" style={{ background: '#fff', borderRight: '1px solid rgba(91,95,255,0.15)', borderBottom: '1px solid rgba(91,95,255,0.15)' }} />
                </motion.div>
                <FreemiCharacter size="sm" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] md:inset-auto md:bottom-24 md:right-6 md:w-96 md:h-[600px] md:rounded-2xl overflow-hidden"
          >
            <LiveChat onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}