import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Upload, ArrowRight, Youtube, Globe } from 'lucide-react';

export default function QuickStartInput({ onSubmit }) {
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  };

  const handlePaste = (e) => {
    // Get pasted text immediately
    const pasted = e.clipboardData?.getData('text') || '';
    if (pasted) {
      setUrl(pasted);
    }
  };

  return (
    <div className="relative">
      <div
        className={`rounded-2xl p-[1px] transition-all duration-500 ${focused ? 'clips-gradient-border' : ''}`}
        style={!focused ? { background: 'rgba(91,95,255,0.08)' } : {}}
      >
        <div
          className="rounded-2xl px-6 py-5"
          style={{ background: 'rgba(255,255,255,0.97)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(91,95,255,0.08)' }}>
              <Link2 className="w-4 h-4" style={{ color: '#5B5FFF' }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: '#0A0F1E' }}>Create New Project</h3>
              <p className="text-[11px]" style={{ color: '#64748B' }}>Paste a video URL or upload a file</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onPaste={handlePaste}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Paste YouTube, TikTok, or video URL..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  color: '#0A0F1E',
                  background: 'rgba(91,95,255,0.04)',
                  border: '1px solid rgba(91,95,255,0.08)',
                }}
              />
              {isYouTube && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Youtube size={18} className="text-red-500" />
                </motion.div>
              )}
              {url && !isYouTube && (
                <Globe size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
              )}
            </div>

            <button
              type="submit"
              disabled={!url.trim()}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all btn-press disabled:opacity-40"
              style={{
                background: url.trim() ? 'linear-gradient(135deg, #5B5FFF, #7C3AED)' : 'rgba(91,95,255,0.10)',
                boxShadow: url.trim() ? '0 4px 16px rgba(91,95,255,0.3)' : 'none',
              }}
            >
              Get Clips <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => onSubmit('upload')}
              className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all btn-press"
              style={{ background: 'rgba(91,95,255,0.04)', color: '#64748B', border: '1px solid rgba(91,95,255,0.08)' }}
            >
              <Upload size={16} /> Upload
            </button>
          </form>

          {/* Source badges */}
          <div className="flex gap-2 mt-3">
            {['YouTube', 'TikTok', 'Vimeo', 'Twitch', 'Upload'].map(src => (
              <span key={src} className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                style={{ background: 'rgba(91,95,255,0.04)', color: '#94A3B8' }}>
                {src}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
