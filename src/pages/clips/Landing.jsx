import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Film, Sparkles, TrendingUp, Smartphone, Captions, Image, Zap,
  Play, ArrowRight, Check, Star, Globe, Calendar, BarChart3,
  ChevronRight, Users, Award, Timer, Crown, Wand2
} from 'lucide-react';

// ── Animated counter ────────────────────────────────────────────────────────
function CountUp({ end, duration = 2, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Feature card ────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="p-6 rounded-2xl group cursor-default"
      style={{
        background: 'rgba(17,17,40,0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139,92,246,0.10)',
      }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{ background: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ── Pricing card ────────────────────────────────────────────────────────────
function PricingCard({ name, price, period, features, popular, delay }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={`p-6 rounded-2xl relative ${popular ? 'scale-105' : ''}`}
      style={{
        background: popular ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.10))' : 'rgba(17,17,40,0.8)',
        backdropFilter: 'blur(20px)',
        border: popular ? '1px solid rgba(139,92,246,0.30)' : '1px solid rgba(139,92,246,0.10)',
        boxShadow: popular ? '0 20px 60px rgba(139,92,246,0.15)' : 'none',
      }}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
          <Crown size={10} className="inline mr-1 -mt-0.5" />Most Popular
        </div>
      )}
      <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-black text-white">{price}</span>
        {period && <span className="text-sm text-gray-400">/{period}</span>}
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
            <Check size={14} style={{ color: '#8B5CF6' }} /> {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => navigate('/clips/studio')}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all btn-press"
        style={{
          background: popular ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)' : 'rgba(139,92,246,0.10)',
          color: popular ? '#fff' : '#C4B5FD',
          boxShadow: popular ? '0 4px 20px rgba(139,92,246,0.35)' : 'none',
        }}
      >
        {price === '$0' ? 'Start Free' : 'Get Started'}
      </button>
    </motion.div>
  );
}

// ── Main Landing Page ───────────────────────────────────────────────────────
export default function ClipsLanding() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen" style={{ background: '#0A0A1A', color: '#F1F5F9' }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        style={{ background: 'rgba(10,10,26,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
              <Film size={16} className="text-white" />
            </div>
            <span className="text-base font-bold text-white">FreemiClips</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</button>
            <button onClick={() => navigate('/clips/studio')}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white btn-press"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full blur-3xl -top-40 -left-40" style={{ background: 'rgba(139,92,246,0.08)' }} />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl -top-20 right-0" style={{ background: 'rgba(59,130,246,0.06)' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-3xl bottom-0 left-1/3" style={{ background: 'rgba(6,182,212,0.05)' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <Sparkles size={14} style={{ color: '#8B5CF6' }} />
              <span className="text-xs font-semibold" style={{ color: '#C4B5FD' }}>Powered by freemi.ai</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6"
          >
            Turn Long Videos Into{' '}
            <span className="clips-gradient-text">Viral Clips</span>
            {' '}With AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8"
          >
            Paste any video URL. Our AI finds the best moments, adds captions,
            scores virality, and gets your clips ready for TikTok, YouTube Shorts & Reels.
          </motion.p>

          {/* CTA Input */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-xl mx-auto"
          >
            <div className="flex gap-3 p-2 rounded-2xl"
              style={{ background: 'rgba(17,17,40,0.8)', border: '1px solid rgba(139,92,246,0.15)', backdropFilter: 'blur(20px)' }}>
              <input
                type="text"
                placeholder="Paste a YouTube URL to get started..."
                className="flex-1 px-4 py-3 bg-transparent text-white text-sm placeholder:text-gray-500 outline-none"
              />
              <button
                onClick={() => navigate('/clips/studio')}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 btn-press flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}
              >
                Get Clips <ArrowRight size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">No credit card required. 60 free credits to start.</p>
          </motion.div>

          {/* Mock video preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 max-w-3xl mx-auto relative"
          >
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1A1A3E, #111128)',
                border: '1px solid rgba(139,92,246,0.15)',
                boxShadow: '0 40px 100px rgba(139,92,246,0.15), 0 20px 60px rgba(0,0,0,0.5)',
                padding: '20px',
              }}>
              {/* Mock editor UI */}
              <div className="flex gap-4">
                {/* Video preview area */}
                <div className="flex-1 rounded-xl overflow-hidden relative" style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play size={28} className="text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <span className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: 'rgba(0,0,0,0.6)' }}>
                      The secret to going viral...
                    </span>
                  </div>
                </div>

                {/* Clips panel */}
                <div className="w-[140px] space-y-2">
                  {[94, 87, 72, 65].map((score, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.15 }}
                      className="rounded-lg p-2 flex items-center gap-2"
                      style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.10)' }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                        style={{
                          background: score >= 90 ? 'linear-gradient(135deg,#8B5CF6,#3B82F6)' : score >= 70 ? '#10B981' : '#F59E0B',
                        }}
                      >
                        {score}
                      </div>
                      <div className="min-w-0">
                        <div className="h-1.5 rounded-full mb-1" style={{ background: 'rgba(139,92,246,0.2)', width: `${score}%` }} />
                        <p className="text-[8px] text-gray-500 truncate">Clip {i + 1}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 px-6" style={{ borderTop: '1px solid rgba(139,92,246,0.06)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 50000, suffix: '+', label: 'Creators' },
            { value: 2, suffix: 'M+', label: 'Clips Created' },
            { value: 500, suffix: 'M+', label: 'Views Generated' },
            { value: 97, suffix: '%', label: 'Caption Accuracy' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <p className="text-3xl md:text-4xl font-black clips-gradient-text mb-1">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Everything You Need to Go <span className="clips-gradient-text">Viral</span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">AI-powered tools that turn hours of editing into minutes</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Sparkles} title="AI Clip Detection" description="Our AI analyzes your video and identifies the most engaging moments that are likely to go viral on social media." color="#8B5CF6" delay={0} />
            <FeatureCard icon={Captions} title="Auto Captions" description="97% accurate captions in 20+ languages with animated styles. Keyword emphasis and brand-consistent fonts." color="#3B82F6" delay={0.1} />
            <FeatureCard icon={TrendingUp} title="Virality Score" description="Every clip gets a 0-99 score based on Hook strength and Flow quality. Focus on clips most likely to perform." color="#10B981" delay={0.2} />
            <FeatureCard icon={Image} title="AI B-Roll" description="Generate stunning B-roll from text prompts. Photorealistic, cinematic, or stylized — you choose the look." color="#F59E0B" delay={0.3} />
            <FeatureCard icon={Smartphone} title="Smart Reframing" description="Intelligently resize for any platform. 9:16 vertical, 16:9 landscape, or 1:1 square with smart speaker tracking." color="#EC4899" delay={0.4} />
            <FeatureCard icon={Calendar} title="Multi-Platform Publishing" description="Schedule and auto-publish to TikTok, YouTube Shorts, Instagram Reels, LinkedIn, and X from one dashboard." color="#06B6D4" delay={0.5} />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6" style={{ background: 'rgba(139,92,246,0.02)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 mb-6">Start free, upgrade as you grow</p>
            <div className="inline-flex items-center gap-2 p-1 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)' }}>
              <button onClick={() => setAnnual(false)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${!annual ? 'bg-clips-accent text-white' : 'text-gray-400'}`}>
                Monthly
              </button>
              <button onClick={() => setAnnual(true)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${annual ? 'bg-clips-accent text-white' : 'text-gray-400'}`}>
                Annual <span className="text-emerald-400 ml-1">Save 40%</span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <PricingCard
              name="Free" price="$0" period={null} delay={0}
              features={['60 credits/month', '1080p with watermark', 'Basic AI captions', '1 export/month', 'Community support']}
            />
            <PricingCard
              name="Pro" price={annual ? '$12' : '$19'} period="mo" popular delay={0.1}
              features={['3,600 credits/year', 'No watermark', 'Virality Score', 'AI B-Roll & Reframing', 'Auto-publish to 6 platforms', 'Priority processing', 'Team workspace (2 seats)']}
            />
            <PricingCard
              name="Business" price="Custom" period={null} delay={0.2}
              features={['Unlimited credits', 'API access', 'Custom integrations', 'Dedicated support', 'SLA & MSA', 'Unlimited team seats', 'White-label option']}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Ready to Go <span className="clips-gradient-text">Viral</span>?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join 50,000+ creators using FreemiClips to grow their audience.
          </p>
          <button
            onClick={() => navigate('/clips/studio')}
            className="px-8 py-4 rounded-xl text-base font-bold text-white btn-press btn-breathe"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', boxShadow: '0 8px 32px rgba(139,92,246,0.4)' }}
          >
            Start Creating Free <ArrowRight size={18} className="inline ml-2" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ borderTop: '1px solid rgba(139,92,246,0.06)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
              <Film size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-500">FreemiClips &copy; 2026. Powered by freemi.ai</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
