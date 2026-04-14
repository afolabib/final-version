import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ExternalLink, Save, CheckCircle, AlertCircle,
  ChevronDown, ChevronRight, Globe, Loader2,
  Monitor, Smartphone, RefreshCw, Eye, EyeOff,
  FileText, Home, Info, Briefcase, Phone, BookOpen,
  Zap, Settings, PenLine, Search,
} from 'lucide-react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { useWebsite } from '@/contexts/WebsiteContext';

// ── Default content seeded from live site ────────────────────────────────────
// Keyed by siteId → pageId → sectionKey (first word of section name, lowercase).
// Used as fallback when Firestore has no content saved yet.

const _LAUREN_HOME = {
  hero: {
    heading: "Pharmacist. Speaker. Trusted Voice in Health & Wellness.",
    body: "Helping brands, audiences, and organisations navigate health with clarity, credibility, and warmth.",
    cta: "Book Lauren",
    ctaSecondary: "View Work",
    image: "https://itslaurenoreilly.web.app/lauren-hero.jpg",
  },
  about: {
    heading: "Clarity in a complex world.",
    body: "I'm a qualified pharmacist turned media personality, on a mission to make health and wellness accessible, evidence-based, and genuinely helpful.",
    image: "https://itslaurenoreilly.web.app/media-tv.jpg",
  },
  services: {
    heading: "Ways to work together.",
    body: "From keynote stages to brand collaborations, here's how we can partner.",
  },
  portfolio: {
    heading: "Recent highlights.",
    body: "Speaking engagements, media appearances, and brand collaborations.",
  },
  featured: {
    heading: "Recent highlights.",
    body: "Speaking engagements, media appearances, and brand collaborations.",
  },
  podcast: {
    heading: "My podcast. My platform.",
    body: "The Wellness Script is where I dive deep into health topics with experts, share evidence-based insights, and build a community of wellness-curious listeners.",
    cta: "Visit Podcast Site",
  },
  cta: {
    heading: "Ready to dive in?",
    body: "Start listening today or explore partnership opportunities.",
    cta: "Start Listening",
    ctaSecondary: "Partner With Us",
  },
  testimonials: {
    heading: "What people say.",
    body: "Feedback from event organisers, brand partners, and producers.",
  },
  why: {
    heading: "In a crowded space, we stand out.",
    body: "Evidence-led, clear, and practical health content — no pseudoscience, no miracle cures.",
  },
  booking: {
    heading: "Let's work together.",
    body: "Tell me about your project, event, or collaboration idea. I'll get back to you within 48 hours.",
    cta: "Send Enquiry",
  },
};

const _LAUREN_ABOUT = {
  story: {
    heading: "Clarity in a complex world.",
    body: "I'm a qualified pharmacist turned media personality, on a mission to make health and wellness accessible, evidence-based, and genuinely helpful.",
    image: "https://itslaurenoreilly.web.app/media-tv.jpg",
  },
  values: {
    heading: "What I stand for.",
    body: "Evidence-based health communication, accessible to everyone.",
  },
  press: {
    heading: "In the press.",
    body: "RTÉ, The Wellness Script, national media appearances.",
  },
};

const _LAUREN_SERVICES = {
  service: {
    heading: "Ways to work together.",
    body: "From keynote stages to brand collaborations, here's how we can partner.",
  },
  process: {
    heading: "How it works.",
    body: "Initial enquiry → Discovery call → Custom proposal → Seamless collaboration.",
  },
  pricing: {
    heading: "Investment.",
    body: "Packages tailored to your needs — speaking, media, brand partnerships, and consulting.",
  },
};

const _LAUREN_CONTACT = {
  contact: {
    heading: "Let's connect.",
    body: "Reach out for speaking, media, or brand enquiries.",
    cta: "Send Message",
  },
  socials: {
    heading: "Find me online.",
    body: "Instagram, YouTube, Spotify, Apple Podcasts.",
  },
};

// ── Wellness Script (IpQd3oVj6AALA0rBC8Oo) ───────────────────────────────────

const _WELLNESS_HOME = {
  hero: {
    heading: "Truth in a noisy wellness world.",
    body: "Pharmacist Lauren O'Reilly separates fact from fiction. Evidence-led conversations with real experts.",
    cta: "Start Listening",
    ctaSecondary: "Become a Partner",
  },
  podcast: {
    heading: "The power of trust.",
    body: "54% of listeners are more likely to buy from a brand they heard on a podcast. Host recommendations carry more weight than traditional ads.",
  },
  about: {
    heading: "Making sense of wellness.",
    body: "The Wellness Script cuts through the noise. Each episode brings you evidence-led conversations that genuinely help you live better.",
    image: "https://wellness-cript.web.app/studio-scene.jpg",
  },
  guest: {
    heading: "Learn from the best.",
    body: "Season 2 features qualified professionals — menopause coaching, sleep science, dentistry, breathwork, PCOS specialist dietitians, and more.",
  },
  platforms: {
    heading: "Listen anywhere.",
    body: "Available to listen or watch across all streaming platforms — Spotify, Apple Podcasts, YouTube.",
    cta: "Start Listening",
  },
  cta: {
    heading: "Ready to dive in?",
    body: "Start listening today or explore partnership opportunities.",
    cta: "Start Listening",
    ctaSecondary: "Become a Partner",
  },
};

const _WELLNESS_EPISODES = {
  episode: {
    heading: "All episodes.",
    body: "Evidence-led health conversations. New episodes weekly on Spotify, Apple Podcasts and YouTube.",
    cta: "Listen on Spotify",
  },
  newsletter: {
    heading: "Get Your Wellness Guide.",
    body: "Key takeaways, expert insights, and actionable steps from every episode — beautifully compiled into one guide. Delivered straight to your inbox.",
    cta: "Browse All Guides",
  },
};

const _WELLNESS_GUESTS = {
  guest: {
    heading: "Learn from the best.",
    body: "Season 2 guests include Catherine O'Keeffe (Menopause Coach), Elle Kelly (Women's Health Dietitian), Tom Coleman (Sleep Coach), Dr Bronagh Keane (Dentist), and more.",
  },
  apply: {
    heading: "Apply to be a guest.",
    body: "Are you a qualified health professional with a message worth sharing? We'd love to hear from you.",
    cta: "Apply Now",
  },
};

const _WELLNESS_ABOUT = {
  about: {
    heading: "Lauren O'Reilly.",
    body: "Pharmacist. Health communicator. Trusted voice. Making complex health topics accessible by approaching the right health and wellness professionals with a clear, balanced approach.",
    image: "https://wellness-cript.web.app/lauren-hero.jpg",
  },
  growth: {
    heading: "Building something bigger.",
    body: "From podcast to wellness media platform. 5 seasons, 40 episodes planned for 2026 — plus events, newsletter, and video content.",
  },
};

const _WELLNESS_CONTACT = {
  contact: {
    heading: "Let's connect.",
    body: "Partnership idea? Guest idea? Event idea? Or feedback on an episode — we'd love to hear from you.",
    cta: "Send Message",
  },
  sponsorship: {
    heading: "Align with trust.",
    body: "Associate your brand with clinical credibility. Host-read ads, show notes links, tagged social posts, and a dedicated Instagram Reel per season. Category exclusivity available.",
    cta: "Become a Sponsor",
  },
};

// ── PAGE_DEFAULTS registry ────────────────────────────────────────────────────
// To add a new client site: add an entry keyed by Firestore siteId.
// Each pageId maps to { sectionKey: { heading, body, cta, ctaSecondary, image } }
// sectionKey = first word of the section name, lowercase (matches toKey() output).
// Include both real Firestore doc IDs AND mock fallback IDs (p1, q1, etc.).

const PAGE_DEFAULTS = {
  // ── Lauren O'Reilly — itslaurenoreilly.web.app ──
  '7YPUFfSUXrIsMF7LjrBb': {
    home:     _LAUREN_HOME,
    p1:       _LAUREN_HOME,
    about:    _LAUREN_ABOUT,
    p2:       _LAUREN_ABOUT,
    services: _LAUREN_SERVICES,
    p3:       _LAUREN_SERVICES,
    p6:       _LAUREN_CONTACT,
    contact:  _LAUREN_CONTACT,
  },
  // ── The Wellness Script — wellness-cript.web.app ──
  'IpQd3oVj6AALA0rBC8Oo': {
    home:     _WELLNESS_HOME,
    q1:       _WELLNESS_HOME,
    episodes: _WELLNESS_EPISODES,
    q2:       _WELLNESS_EPISODES,
    guests:   _WELLNESS_GUESTS,
    q3:       _WELLNESS_GUESTS,
    about:    _WELLNESS_ABOUT,
    q4:       _WELLNESS_ABOUT,
    contact:  _WELLNESS_CONTACT,
    q5:       _WELLNESS_CONTACT,
  },
};

// ── SEO_DEFAULTS registry ─────────────────────────────────────────────────────
// Add an entry per siteId → pageId → { title, desc }.

const SEO_DEFAULTS = {
  // ── Lauren O'Reilly ──
  '7YPUFfSUXrIsMF7LjrBb': {
    home: {
      title: "Lauren O'Reilly | Pharmacist, Speaker & Health Expert",
      desc: "Lauren O'Reilly is a qualified pharmacist, media personality and trusted health voice. Book Lauren for speaking, media appearances and brand partnerships.",
    },
    p1: {
      title: "Lauren O'Reilly | Pharmacist, Speaker & Health Expert",
      desc: "Lauren O'Reilly is a qualified pharmacist, media personality and trusted health voice. Book Lauren for speaking, media appearances and brand partnerships.",
    },
    about: {
      title: "About Lauren O'Reilly | Pharmacist & Media Personality",
      desc: "Meet Lauren O'Reilly — pharmacist, RTÉ contributor and wellness advocate. Discover her story, values and approach to evidence-based health communication.",
    },
    p2: {
      title: "About Lauren O'Reilly | Pharmacist & Media Personality",
      desc: "Meet Lauren O'Reilly — pharmacist, RTÉ contributor and wellness advocate. Discover her story, values and approach to evidence-based health communication.",
    },
    services: {
      title: "Services | Lauren O'Reilly",
      desc: "From keynote speaking to brand partnerships — explore how to work with Lauren O'Reilly, Ireland's trusted health and wellness voice.",
    },
    p3: {
      title: "Services | Lauren O'Reilly",
      desc: "From keynote speaking to brand partnerships — explore how to work with Lauren O'Reilly, Ireland's trusted health and wellness voice.",
    },
    p4: {
      title: "Work | Lauren O'Reilly",
      desc: "Explore Lauren O'Reilly's speaking highlights, media appearances, and brand partnerships.",
    },
    p5: {
      title: "The Wellness Script Podcast | Lauren O'Reilly",
      desc: "Listen to The Wellness Script — evidence-based health conversations with Lauren O'Reilly. Available on Spotify, Apple Podcasts and YouTube.",
    },
    p6: {
      title: "Contact Lauren O'Reilly",
      desc: "Get in touch to book Lauren for speaking, media or brand partnerships. Based in Ireland, available internationally.",
    },
    contact: {
      title: "Contact Lauren O'Reilly",
      desc: "Get in touch to book Lauren for speaking, media or brand partnerships. Based in Ireland, available internationally.",
    },
  },
  // ── The Wellness Script ──
  'IpQd3oVj6AALA0rBC8Oo': {
    home: {
      title: "The Wellness Script | Evidence-Led Health Podcast",
      desc: "Pharmacist Lauren O'Reilly separates health fact from fiction. Evidence-led conversations with real experts. Listen on Spotify, Apple Podcasts & YouTube.",
    },
    q1: {
      title: "The Wellness Script | Evidence-Led Health Podcast",
      desc: "Pharmacist Lauren O'Reilly separates health fact from fiction. Evidence-led conversations with real experts. Listen on Spotify, Apple Podcasts & YouTube.",
    },
    episodes: {
      title: "Episodes | The Wellness Script Podcast",
      desc: "Browse all episodes of The Wellness Script. Evidence-based health conversations with qualified experts — new episodes weekly.",
    },
    q2: {
      title: "Episodes | The Wellness Script Podcast",
      desc: "Browse all episodes of The Wellness Script. Evidence-based health conversations with qualified experts — new episodes weekly.",
    },
    guests: {
      title: "Guests | The Wellness Script Podcast",
      desc: "Meet the expert guests on The Wellness Script. Qualified health professionals sharing evidence-led insights.",
    },
    q3: {
      title: "Guests | The Wellness Script Podcast",
      desc: "Meet the expert guests on The Wellness Script. Qualified health professionals sharing evidence-led insights.",
    },
    about: {
      title: "About | The Wellness Script by Lauren O'Reilly",
      desc: "The Wellness Script is hosted by pharmacist Lauren O'Reilly. Making sense of wellness through evidence-led conversations.",
    },
    q4: {
      title: "About | The Wellness Script by Lauren O'Reilly",
      desc: "The Wellness Script is hosted by pharmacist Lauren O'Reilly. Making sense of wellness through evidence-led conversations.",
    },
    contact: {
      title: "Contact | The Wellness Script",
      desc: "Partnership idea, guest idea, or feedback? Get in touch with The Wellness Script team. Email lauren@wellnessscriptpod.com.",
    },
    q5: {
      title: "Contact | The Wellness Script",
      desc: "Partnership idea, guest idea, or feedback? Get in touch with The Wellness Script team. Email lauren@wellnessscriptpod.com.",
    },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const PAGE_ICONS = {
  home:     { icon: Home,      color: '#5B5FFF' },
  about:    { icon: Info,      color: '#5B5FFF' },
  services: { icon: Briefcase, color: '#F59E0B' },
  contact:  { icon: Phone,     color: '#7C3AED' },
  blog:     { icon: BookOpen,  color: '#0EA5E9' },
  other:    { icon: FileText,  color: '#94A3B8' },
};

function toKey(name) {
  // Use first word only for stable content keys (handles "Hero — Description" format)
  const firstWord = name.trim().split(/[\s—–,]+/)[0];
  return firstWord.toLowerCase();
}

// ── Section editor accordion ──────────────────────────────────────────────────

function SectionPanel({ name, value = {}, onChange, autoOpen }) {
  const [open, setOpen] = useState(autoOpen || false);
  const hasContent = !!(value.heading || value.body || value.cta);

  const upd = (k, v) => onChange(toKey(name), { ...value, [k]: v });

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{
        border: `1px solid ${open ? 'rgba(91,95,255,0.2)' : 'rgba(0,0,0,0.07)'}`,
        background: open ? 'rgba(91,95,255,0.02)' : 'white',
      }}>

      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: open ? 'rgba(91,95,255,0.12)' : 'rgba(0,0,0,0.04)' }}>
          <Zap size={12} style={{ color: open ? '#5B5FFF' : '#94A3B8' }} />
        </div>
        <span className="flex-1 text-[13px] font-semibold" style={{ color: '#0A0F1E' }}>{name}</span>
        {hasContent && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(91,95,255,0.1)', color: '#5B5FFF' }}>Edited</span>
        )}
        {open
          ? <ChevronDown size={13} style={{ color: '#94A3B8' }} />
          : <ChevronRight size={13} style={{ color: '#CBD5E1' }} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}>
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(91,95,255,0.08)' }}>

              <div className="pt-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
                  Heading
                </label>
                <input
                  value={value.heading || ''}
                  onChange={e => upd('heading', e.target.value)}
                  placeholder="Section heading…"
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
                  Body text
                </label>
                <textarea
                  value={value.body || ''}
                  onChange={e => upd('body', e.target.value)}
                  placeholder="Main paragraph or description…"
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E', lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
                    Button 1
                  </label>
                  <input
                    value={value.cta || ''}
                    onChange={e => upd('cta', e.target.value)}
                    placeholder="Primary CTA…"
                    className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
                    Button 2
                  </label>
                  <input
                    value={value.ctaSecondary || ''}
                    onChange={e => upd('ctaSecondary', e.target.value)}
                    placeholder="Secondary CTA…"
                    className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
                  Image URL
                </label>
                <input
                  value={value.image || ''}
                  onChange={e => upd('image', e.target.value)}
                  placeholder="https://…"
                  className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none font-mono"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                />
                {value.image && (
                  <div className="mt-2 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                    <img
                      src={value.image}
                      alt="section"
                      className="w-full object-cover"
                      style={{ maxHeight: 140, objectFit: 'cover' }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SEO tab ───────────────────────────────────────────────────────────────────

function SeoPanel({ seoTitle, setSeoTitle, seoDesc, setSeoDesc, title, page, activeSite }) {
  return (
    <div className="px-5 py-5 space-y-4">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
          Title tag <span style={{ color: '#94A3B8', fontWeight: 400 }}>({seoTitle.length}/60)</span>
        </label>
        <input
          value={seoTitle}
          onChange={e => setSeoTitle(e.target.value)}
          maxLength={60}
          placeholder="e.g. Home | Lauren O'Reilly"
          className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E' }}
          onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#CBD5E1' }}>
          Meta description <span style={{ color: '#94A3B8', fontWeight: 400 }}>({seoDesc.length}/155)</span>
        </label>
        <textarea
          value={seoDesc}
          onChange={e => setSeoDesc(e.target.value)}
          maxLength={155}
          rows={4}
          placeholder="Appears in Google search results…"
          className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: '#0A0F1E', lineHeight: 1.6 }}
          onFocus={e => e.target.style.borderColor = 'rgba(91,95,255,0.4)'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
        />
      </div>

      {/* Google preview */}
      <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
            <Globe size={10} style={{ color: '#94A3B8' }} />
          </div>
          <span className="text-[11px]" style={{ color: '#94A3B8' }}>{activeSite?.domain || 'yoursite.com'}{page.slug === '/' ? '' : page.slug}</span>
          <ChevronDown size={10} style={{ color: '#94A3B8' }} />
        </div>
        <p className="text-[15px] font-medium leading-snug mb-1" style={{ color: '#1a0dab' }}>
          {seoTitle || title || 'Page title'}
        </p>
        <p className="text-[12px] leading-relaxed" style={{ color: '#545454' }}>
          {seoDesc || 'Add a meta description to control how this page appears in search results.'}
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'content', label: 'Content', icon: PenLine },
  { id: 'seo',     label: 'SEO',     icon: Search },
];

const VIEWPORTS = [
  { id: 'desktop',  icon: Monitor,     width: '100%' },
  { id: 'mobile',   icon: Smartphone,  width: '390px' },
];

export default function WebsiteVisualEditor({ page, onClose }) {
  const { activeSite } = useWebsite();
  const iframeRef = useRef(null);

  const [tab, setTab]             = useState('content');
  const [viewport, setViewport]   = useState('desktop');
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Content state
  const [content, setContent]     = useState({});
  const [title, setTitle]         = useState(page.title || '');
  const [seoTitle, setSeoTitle]   = useState(page.seoTitle || page.title || '');
  const [seoDesc, setSeoDesc]     = useState(page.seoDesc || '');
  const [status, setStatus]       = useState(page.status || 'published');
  const [sections, setSections]   = useState(page.sections || []);

  const [showPreview, setShowPreview] = useState(true);

  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState(null);

  const meta = PAGE_ICONS[page.type] || PAGE_ICONS.other;
  const Icon = meta.icon;

  const siteBase = activeSite?.previewUrl ||
    (activeSite?.domain ? `https://${activeSite.domain}` : '');
  const iframeUrl = siteBase
    ? `${siteBase}${page.slug === '/' ? '' : page.slug}`
    : null;

  // Load existing Firestore content, falling back to hardcoded site defaults
  useEffect(() => {
    if (!activeSite?.id) return;
    const defaults = PAGE_DEFAULTS[activeSite.id]?.[page.id] || {};
    const seoDefaults = SEO_DEFAULTS[activeSite.id]?.[page.id] || {};
    // Apply defaults immediately — no blank editor while waiting for Firestore
    setContent(defaults);
    if (seoDefaults.title && !page.seoTitle) setSeoTitle(seoDefaults.title);
    if (seoDefaults.desc  && !page.seoDesc)  setSeoDesc(seoDefaults.desc);
    // Then merge with any saved Firestore content
    getDoc(doc(firestore, 'websites', activeSite.id, 'pages', page.id))
      .then(snap => {
        if (snap.exists()) {
          const d = snap.data();
          // Firestore content wins over defaults for any saved fields
          if (d.content && Object.keys(d.content).length > 0) {
            setContent({ ...defaults, ...d.content });
          }
          if (d.seoTitle)  setSeoTitle(d.seoTitle);
          if (d.seoDesc)   setSeoDesc(d.seoDesc);
          if (d.status)    setStatus(d.status);
          if (d.title)     setTitle(d.title);
          if (d.sections)  setSections(d.sections);
        }
      })
      .catch(() => {});
  }, [activeSite?.id, page.id]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  // When Firestore page has no sections field, derive display names from content keys
  const SECTION_LABELS = {
    hero: 'Hero', about: 'About', services: 'Services', portfolio: 'Portfolio',
    podcast: 'Podcast', cta: 'CTA', story: 'Story', values: 'Values', press: 'Press',
    service: 'Service Cards', process: 'Process', pricing: 'Pricing', testimonials: 'Testimonials',
    booking: 'Booking', contact: 'Contact', socials: 'Socials', featured: 'Featured Work',
    why: 'Why We Stand Out',
  };
  const displaySections = sections.length > 0
    ? sections
    : Object.keys(content).map(k => SECTION_LABELS[k] || k.charAt(0).toUpperCase() + k.slice(1));

  const updateSection = (key, val) =>
    setContent(c => ({ ...c, [key]: val }));

  const handleSave = async () => {
    if (!activeSite?.id) return;
    setSaving(true);
    setError(null);
    try {
      await setDoc(
        doc(firestore, 'websites', activeSite.id, 'pages', page.id),
        { title, seoTitle, seoDesc, status, sections, slug: page.slug, type: page.type,
          views: page.views || 0, seo: page.seo || null, content, lastEdited: serverTimestamp() },
        { merge: true },
      );
      setSaved(true);
      // Brief delay then reload iframe to show changes
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
      }, 800);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#0F1117' }}>

      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-5 h-14 flex-shrink-0"
        style={{ background: '#161820', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Page identity */}
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Icon size={13} style={{ color: meta.color }} />
          </div>
          <span className="text-[13px] font-bold text-white">{page.title}</span>
          <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{page.slug}</span>
        </div>

        {/* Status pill */}
        <div className="flex gap-1.5">
          {[
            { id: 'published', label: 'Live',  color: '#7C3AED' },
            { id: 'draft',     label: 'Draft', color: '#F59E0B' },
          ].map(opt => {
            const active = status === opt.id;
            return (
              <button key={opt.id} onClick={() => setStatus(opt.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: active ? `${opt.color}20` : 'rgba(255,255,255,0.05)',
                  color: active ? opt.color : 'rgba(255,255,255,0.3)',
                  border: active ? `1px solid ${opt.color}40` : '1px solid transparent',
                }}>
                <div className={`w-1.5 h-1.5 rounded-full ${active ? '' : 'opacity-30'}`}
                  style={{ background: opt.color }} />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Show/hide preview */}
        {!showPreview && (
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
            <Eye size={12} /> Show preview
          </button>
        )}

        {/* Viewport toggle */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {VIEWPORTS.map(v => {
            const Ico = v.icon;
            return (
              <button key={v.id} onClick={() => setViewport(v.id)}
                className="p-1.5 rounded-lg transition-all"
                style={{
                  background: viewport === v.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: viewport === v.id ? 'white' : 'rgba(255,255,255,0.3)',
                }}>
                <Ico size={14} />
              </button>
            );
          })}
        </div>

        {/* Refresh iframe */}
        <button
          onClick={() => { if (iframeRef.current) iframeRef.current.src = iframeRef.current.src; }}
          className="p-2 rounded-xl transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
          title="Reload preview">
          <RefreshCw size={13} />
        </button>

        {/* View live */}
        {iframeUrl && (
          <a href={iframeUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>
            <ExternalLink size={12} /> View live
          </a>
        )}

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all"
          style={{
            background: saving ? 'rgba(91,95,255,0.4)' : saved ? 'rgba(16,185,129,0.9)' : 'rgba(91,95,255,0.9)',
            color: 'white',
            boxShadow: saving || saved ? 'none' : '0 4px 14px rgba(91,95,255,0.4)',
          }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <CheckCircle size={13} /> : <Save size={13} />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </button>

        {/* Close */}
        <button onClick={onClose}
          className="p-2 rounded-xl transition-all ml-1"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
          <X size={15} />
        </button>
      </div>

      {/* ── Body: preview + editor ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: site preview */}
        {showPreview && (
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">

          {/* Browser chrome */}
          <div className="rounded-2xl overflow-hidden flex flex-col flex-1"
            style={{ background: '#1E2029', border: '1px solid rgba(255,255,255,0.07)' }}>

            {/* URL bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
              style={{ background: '#1A1C24', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex gap-1.5">
                {['#EF4444','#F59E0B','#7C3AED'].map(c => (
                  <div key={c} className="w-3 h-3 rounded-full opacity-60" style={{ background: c }} />
                ))}
              </div>
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg mx-2"
                style={{ background: 'rgba(255,255,255,0.05)', maxWidth: 480 }}>
                <div className="w-2 h-2 rounded-full bg-green-400 opacity-70" />
                <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {iframeUrl || 'yoursite.com'}
                </span>
              </div>
              {!iframeLoaded && <Loader2 size={12} className="animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />}
              {/* Close preview */}
              <button
                onClick={() => setShowPreview(false)}
                className="ml-auto p-1.5 rounded-lg transition-all hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                title="Hide preview">
                <X size={13} />
              </button>
            </div>

            {/* iframe */}
            <div className="flex-1 overflow-hidden flex items-start justify-center"
              style={{ background: '#0F1117' }}>
              {iframeUrl ? (
                <div className="h-full overflow-auto transition-all duration-300 flex-shrink-0"
                  style={{ width: viewport === 'mobile' ? '390px' : '100%' }}>
                  <iframe
                    ref={iframeRef}
                    src={iframeUrl}
                    className="w-full"
                    style={{ height: '100%', border: 'none', minHeight: '100%' }}
                    onLoad={() => setIframeLoaded(true)}
                    title={`${page.title} preview`}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Globe size={32} style={{ color: 'rgba(255,255,255,0.1)' }} />
                  <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    No preview URL configured for this site
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Right: editor panel */}
        <div className="w-[380px] flex-shrink-0 flex flex-col"
          style={{ background: '#F8F9FE', borderLeft: '1px solid rgba(0,0,0,0.07)' }}>

          {/* Tab bar */}
          <div className="flex flex-shrink-0 px-4 pt-1"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', background: 'white' }}>
            {TABS.map(t => {
              const Ico = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="flex items-center gap-1.5 px-4 py-3 text-[12px] font-bold relative transition-colors"
                  style={{ color: active ? '#5B5FFF' : '#94A3B8' }}>
                  <Ico size={12} />{t.label}
                  {active && (
                    <motion.div layoutId="ve-tab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: '#5B5FFF' }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Scrollable editor area */}
          <div className="flex-1 overflow-y-auto">

            {tab === 'content' && (
              <div className="p-4 space-y-2.5">
                <p className="text-[11px] px-1 pb-1" style={{ color: '#94A3B8' }}>
                  Edit each section — changes save to Firestore and update the live site instantly.
                </p>
                {displaySections.length === 0 && (
                  <p className="text-center py-10 text-[13px]" style={{ color: '#CBD5E1' }}>
                    No sections defined for this page.
                  </p>
                )}
                {displaySections.map((name, i) => (
                  <SectionPanel
                    key={name}
                    name={name}
                    value={content[toKey(name)]}
                    onChange={updateSection}
                    autoOpen={i === 0}
                  />
                ))}
              </div>
            )}

            {tab === 'seo' && (
              <SeoPanel
                seoTitle={seoTitle} setSeoTitle={setSeoTitle}
                seoDesc={seoDesc} setSeoDesc={setSeoDesc}
                title={title} page={page} activeSite={activeSite}
              />
            )}

          </div>

          {/* Error bar */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mx-4 mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px]"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                <AlertCircle size={13} /> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>,
    document.body
  );
}
