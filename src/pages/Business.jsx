import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

/* ─────────────────── DATA ─────────────────── */

const portfolioItems = [
  {
    id: 1,
    title: 'Arcadia Commerce',
    category: 'E-Commerce',
    description: 'High-converting DTC brand store with custom checkout flow and 3D product viewer.',
    tags: ['Shopify', 'React', 'Three.js'],
    stats: { metric: '+284%', label: 'conversion lift' },
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
    accent: '#e94560',
    icon: '🛒',
    mockScreenshot: {
      bg: 'linear-gradient(135deg, #0f3460, #16213e)',
      nav: '#e94560',
      blocks: ['#e94560', '#fff', '#e94560aa'],
    },
  },
  {
    id: 2,
    title: 'Verdant SaaS',
    category: 'SaaS Landing',
    description: 'Minimalist product page with interactive demo embed and animated feature walkthroughs.',
    tags: ['Next.js', 'Framer Motion', 'Tailwind'],
    stats: { metric: '61%', label: 'trial signups ↑' },
    gradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 40%, #1f2937 100%)',
    accent: '#39d353',
    icon: '⚡',
    mockScreenshot: {
      bg: 'linear-gradient(135deg, #0d1b2a, #1a2a1a)',
      nav: '#39d353',
      blocks: ['#39d353', '#39d35366', '#fff'],
    },
  },
  {
    id: 3,
    title: 'Lumière Studio',
    category: 'Creative Agency',
    description: 'Award-winning portfolio site with scroll-driven animations and WebGL canvas effects.',
    tags: ['React', 'GSAP', 'WebGL'],
    stats: { metric: '3× awards', label: 'CSS Design' },
    gradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 40%, #11998e 100%)',
    accent: '#a78bfa',
    icon: '✦',
    mockScreenshot: {
      bg: 'linear-gradient(135deg, #1a0a2e, #2d1b69)',
      nav: '#a78bfa',
      blocks: ['#a78bfa', '#7c3aed', '#fff'],
    },
  },
  {
    id: 4,
    title: 'Ember Restaurant Group',
    category: 'Hospitality',
    description: 'Reservation-first design with full menu CMS, location pages, and event booking.',
    tags: ['Next.js', 'Sanity CMS', 'Stripe'],
    stats: { metric: '+430%', label: 'online bookings' },
    gradient: 'linear-gradient(135deg, #1c0a00 0%, #3d1c02 40%, #7c3400 100%)',
    accent: '#f97316',
    icon: '🔥',
    mockScreenshot: {
      bg: 'linear-gradient(135deg, #1c0a00, #3d1c02)',
      nav: '#f97316',
      blocks: ['#f97316', '#ea580c', '#fff'],
    },
  },
  {
    id: 5,
    title: 'Axiom Law',
    category: 'Professional Services',
    description: 'Trust-first legal firm site with case intake forms, attorney bios, and SEO dominance.',
    tags: ['Next.js', 'Contentful', 'SEO'],
    stats: { metric: '#1 rank', label: 'Google local' },
    gradient: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 40%, #2a2a4e 100%)',
    accent: '#60a5fa',
    icon: '⚖️',
    mockScreenshot: {
      bg: 'linear-gradient(135deg, #0a0a1a, #1e293b)',
      nav: '#60a5fa',
      blocks: ['#60a5fa', '#3b82f6', '#fff'],
    },
  },
  {
    id: 6,
    title: 'Pulse Fitness',
    category: 'Health & Wellness',
    description: 'App-like gym site with class scheduling, member portal, and trainer booking.',
    tags: ['React', 'Firebase', 'Stripe'],
    stats: { metric: '2.1k', label: 'members onboarded' },
    gradient: 'linear-gradient(135deg, #0a1628 0%, #001f3f 40%, #003d7a 100%)',
    accent: '#06b6d4',
    icon: '💪',
    mockScreenshot: {
      bg: 'linear-gradient(135deg, #0a1628, #003d7a)',
      nav: '#06b6d4',
      blocks: ['#06b6d4', '#0891b2', '#fff'],
    },
  },
];

const services = [
  {
    icon: '◈',
    title: 'Design Systems',
    desc: 'Pixel-perfect UI from wireframe to Figma handoff. Every component designed to scale.',
    features: ['Brand identity integration', 'Component library', 'Design tokens', 'Dark mode'],
    accent: '#6C5CE7',
  },
  {
    icon: '⟨/⟩',
    title: 'Web Development',
    desc: 'React, Next.js, and Vite — built for speed, built to last. No templates, all custom.',
    features: ['Sub-second load times', 'Core Web Vitals 100', 'Accessible markup', 'API integrations'],
    accent: '#06b6d4',
  },
  {
    icon: '↗',
    title: 'SEO & Performance',
    desc: 'Rank on page one. Technical SEO baked in from day one, not bolted on at the end.',
    features: ['Lighthouse 100 score', 'Schema markup', 'Structured content', 'Local SEO'],
    accent: '#39d353',
  },
  {
    icon: '⊕',
    title: 'CMS & Content',
    desc: 'Sanity, Contentful, or custom — you own your content, forever.',
    features: ['Visual editor', 'Multi-locale', 'Version history', 'Team roles'],
    accent: '#f97316',
  },
  {
    icon: '◎',
    title: 'E-Commerce',
    desc: 'Shopify, custom carts, and everything between. Conversion-optimized from first pixel.',
    features: ['Custom checkout', 'Product 3D view', 'Abandoned cart flows', 'Analytics'],
    accent: '#e94560',
  },
  {
    icon: '∞',
    title: 'Ongoing Retainer',
    desc: 'Your site is never done. Monthly retainers cover edits, A/B tests, and improvements.',
    features: ['Priority support', 'Monthly sprints', 'Analytics review', 'Growth experiments'],
    accent: '#a78bfa',
  },
];

const process = [
  { num: '01', title: 'Discovery', desc: 'We learn your business, goals, competitors, and users. A strategic brief that makes everything downstream easier.', duration: '1–2 days' },
  { num: '02', title: 'Design', desc: 'Wireframes, then high-fidelity Figma prototypes. You see exactly what you\'re getting before a single line of code.', duration: '3–5 days' },
  { num: '03', title: 'Build', desc: 'Custom React/Next.js development. No templates. No WordPress. Every component is purpose-built for your site.', duration: '5–14 days' },
  { num: '04', title: 'Launch', desc: 'We handle hosting setup, DNS, analytics, SEO baseline, and a post-launch performance audit.', duration: '1–2 days' },
];

const plans = [
  {
    name: 'Launchpad',
    price: '2,900',
    desc: 'A fast, beautiful site to establish your presence.',
    features: ['Up to 5 pages', 'Mobile-first design', 'Contact form + CMS', 'Basic SEO', '30-day support'],
    cta: 'Start a Project',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '7,500',
    desc: 'A full-featured site engineered to convert.',
    features: ['Up to 15 pages', 'Custom animations', 'E-commerce ready', 'Technical SEO audit', 'CMS training', '60-day support + edits'],
    cta: 'Let\'s Build',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'Complex platforms, portals, and flagship products.',
    features: ['Unlimited scope', 'Dedicated dev team', 'API / backend integrations', 'Design system delivery', 'Ongoing retainer option', 'SLA guarantee'],
    cta: 'Talk to Us',
    highlight: false,
  },
];

const testimonials = [
  {
    quote: 'They took our brand from zero to a site that genuinely stops people in their tracks. Three clients have booked us just saying "I saw your website."',
    name: 'Sarah Chen',
    role: 'Founder, Lumière Studio',
    avatar: 'SC',
    accent: '#a78bfa',
  },
  {
    quote: 'Our old Squarespace took 8 seconds to load and converted at 0.9%. The new site loads in 0.8 seconds and we\'re at 3.4%. That\'s the whole story.',
    name: 'Marcus Webb',
    role: 'Head of Growth, Verdant SaaS',
    avatar: 'MW',
    accent: '#39d353',
  },
  {
    quote: 'Every agency says they\'ll deliver on time. These people actually did. Site went live 2 days early. The QA process alone was worth the entire fee.',
    name: 'Priya Okafor',
    role: 'COO, Axiom Law Group',
    avatar: 'PO',
    accent: '#60a5fa',
  },
];

const stats = [
  { value: '140+', label: 'Sites Delivered' },
  { value: '98%', label: 'Client Retention' },
  { value: '< 0.9s', label: 'Avg Load Time' },
  { value: '4.9★', label: 'Average Rating' },
];

/* ─────────────────── COMPONENTS ─────────────────── */

function MockBrowser({ item }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: item.mockScreenshot.bg, border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2.5" style={{ background: 'rgba(0,0,0,0.4)' }}>
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <div className="flex-1 mx-2 h-4 rounded-md" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>
      {/* Mock content */}
      <div className="p-4 space-y-3">
        <div className="h-1.5 rounded-full w-1/3" style={{ background: item.mockScreenshot.nav }} />
        <div className="grid grid-cols-3 gap-2">
          {item.mockScreenshot.blocks.map((c, i) => (
            <div key={i} className="h-12 rounded-lg opacity-80" style={{ background: c }} />
          ))}
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="h-1.5 rounded-full w-4/5" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-1.5 rounded-full w-2/3" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
        <div className="flex gap-2 mt-2">
          <div className="h-7 rounded-lg flex-1" style={{ background: item.accent, opacity: 0.9 }} />
          <div className="h-7 rounded-lg w-1/3" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    </div>
  );
}

function PortfolioCard({ item, index }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: item.gradient,
        border: `1px solid ${item.accent}22`,
        boxShadow: hovered ? `0 24px 60px ${item.accent}22, 0 4px 20px rgba(0,0,0,0.4)` : '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Top badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
          style={{ background: `${item.accent}22`, color: item.accent, border: `1px solid ${item.accent}33` }}>
          {item.category}
        </span>
      </div>

      {/* Stats badge */}
      <div className="absolute top-4 right-4 z-10 text-right">
        <div className="text-lg font-black" style={{ color: item.accent }}>{item.stats.metric}</div>
        <div className="text-[9px] font-semibold text-white/40 uppercase tracking-wider">{item.stats.label}</div>
      </div>

      {/* Mock browser preview */}
      <div className="pt-14 px-5 pb-4">
        <motion.div
          animate={{ y: hovered ? -4 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <MockBrowser item={item} />
        </motion.div>
      </div>

      {/* Info */}
      <div className="px-5 pb-6">
        <div className="text-2xl mb-1">{item.icon}</div>
        <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
        <p className="text-xs text-white/50 leading-relaxed mb-3">{item.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover overlay arrow */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ background: item.accent, color: '#fff' }}>
        ↗
      </motion.div>
    </motion.div>
  );
}

function ServiceCard({ service, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group p-7 rounded-2xl transition-all duration-500 hover:scale-[1.02]"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      whileHover={{ borderColor: `${service.accent}44`, boxShadow: `0 8px 40px ${service.accent}11` }}
    >
      <div className="text-3xl font-black mb-4 transition-transform duration-300 group-hover:scale-110 inline-block"
        style={{ color: service.accent }}>
        {service.icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
      <p className="text-sm text-white/50 leading-relaxed mb-5">{service.desc}</p>
      <ul className="space-y-2">
        {service.features.map(f => (
          <li key={f} className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: service.accent }} />
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function ProcessStep({ step, index, total }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex gap-6 md:gap-8"
    >
      {/* Line */}
      {index < total - 1 && (
        <div className="absolute left-7 top-16 bottom-0 w-px" style={{ background: 'linear-gradient(180deg, rgba(108,92,231,0.3), transparent)' }} />
      )}

      {/* Number circle */}
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(108,92,231,0.05))',
          border: '1px solid rgba(108,92,231,0.2)',
          color: '#6C5CE7',
        }}>
        {step.num}
      </div>

      {/* Content */}
      <div className="pb-12">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-white">{step.title}</h3>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
            style={{ background: 'rgba(108,92,231,0.08)', color: '#6C5CE7', border: '1px solid rgba(108,92,231,0.15)' }}>
            {step.duration}
          </span>
        </div>
        <p className="text-sm text-white/50 leading-relaxed max-w-md">{step.desc}</p>
      </div>
    </motion.div>
  );
}

function PlanCard({ plan, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const navigate = useNavigate();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative p-8 rounded-2xl"
      style={{
        background: plan.highlight
          ? 'linear-gradient(135deg, rgba(108,92,231,0.12), rgba(108,92,231,0.04))'
          : 'rgba(255,255,255,0.02)',
        border: plan.highlight ? '2px solid rgba(108,92,231,0.5)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: plan.highlight ? '0 8px 60px rgba(108,92,231,0.15)' : 'none',
      }}
    >
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)' }}>
          {plan.badge}
        </div>
      )}

      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 mb-3">{plan.name}</div>
      <div className="mb-2">
        {plan.price === 'Custom' ? (
          <span className="text-5xl font-black text-white">Custom</span>
        ) : (
          <span className="text-5xl font-black text-white">${plan.price}</span>
        )}
      </div>
      <p className="text-sm text-white/40 mb-7 leading-relaxed">{plan.desc}</p>

      <motion.button
        onClick={() => navigate('/dashboard')}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-xl font-bold text-sm mb-7 transition-all"
        style={plan.highlight
          ? { background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', color: '#fff', boxShadow: '0 4px 20px rgba(108,92,231,0.4)' }
          : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }
        }>
        {plan.cta} →
      </motion.button>

      <ul className="space-y-3">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-white/50">
            <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-md flex items-center justify-center text-[9px] font-bold"
              style={{ background: plan.highlight ? 'rgba(108,92,231,0.15)' : 'rgba(255,255,255,0.04)', color: plan.highlight ? '#6C5CE7' : 'rgba(255,255,255,0.3)' }}>
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function TestimonialCard({ t, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="p-7 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="text-3xl mb-5 leading-none" style={{ color: t.accent, opacity: 0.5 }}>"</div>
      <p className="text-sm text-white/70 leading-relaxed mb-6 italic">{t.quote}</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
          style={{ background: `${t.accent}33`, border: `1px solid ${t.accent}44` }}>
          {t.avatar}
        </div>
        <div>
          <div className="text-sm font-bold text-white">{t.name}</div>
          <div className="text-xs text-white/40">{t.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────── MAIN PAGE ─────────────────── */

export default function Business() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const yHero = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], isMobile ? [1, 1] : [1, 0]);

  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'E-Commerce', 'SaaS Landing', 'Creative Agency', 'Hospitality', 'Professional Services', 'Health & Wellness'];
  const filtered = activeFilter === 'All' ? portfolioItems : portfolioItems.filter(p => p.category === activeFilter);

  return (
    <div className="min-h-screen" style={{ background: '#080810', color: '#fff' }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16"
        style={{ background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">Freemi</span>
          <span className="text-white/20 mx-1">/</span>
          <span className="text-white/60 text-sm font-medium">Web Studio</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[['#portfolio', 'Portfolio'], ['#services', 'Services'], ['#process', 'Process'], ['#pricing', 'Pricing']].map(([href, label]) => (
            <a key={label} href={href}
              className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/[0.04]">
              {label}
            </a>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2 rounded-full text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', boxShadow: '0 4px 20px rgba(108,92,231,0.4)' }}>
          Start a Project →
        </motion.button>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-6 overflow-hidden">

        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.08), transparent 65%)' }} />
          <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06), transparent 65%)' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
        </div>

        <motion.div style={{ y: yHero, opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-bold tracking-widest uppercase"
            style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)', color: '#a78bfa' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-pulse" />
            Website Building Studio
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-black leading-[0.95] tracking-[-0.04em] mb-6"
            style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}>
            <span className="text-white">Websites that</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a78bfa 40%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              actually convert.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
            Custom React and Next.js sites — zero templates, no WordPress, no shortcuts. Built fast, built to rank, built to make your business money.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-14">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 rounded-full font-bold text-base text-white"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', boxShadow: '0 8px 32px rgba(108,92,231,0.4)' }}>
              Start a Project →
            </motion.button>
            <a href="#portfolio"
              className="px-8 py-3.5 rounded-full font-semibold text-base text-white/60 hover:text-white transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              View Portfolio
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {stats.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + i * 0.08 }}
                className="text-center">
                <div className="text-2xl md:text-3xl font-black text-white tracking-tight">{s.value}</div>
                <div className="text-[11px] font-semibold text-white/30 tracking-wider uppercase mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-xs font-medium tracking-widest uppercase">
          scroll
        </motion.div>
      </section>

      {/* ── PORTFOLIO ── */}
      <section id="portfolio" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-[10px] font-black tracking-[0.25em] uppercase mb-4 px-4 py-1.5 rounded-full"
              style={{ color: '#6C5CE7', background: 'rgba(108,92,231,0.08)', border: '1px solid rgba(108,92,231,0.15)' }}>
              Portfolio
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-black text-white leading-[1.05] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              140+ sites delivered.
              <br />
              <span className="text-white/30">Every one from scratch.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/40 max-w-lg mx-auto text-base leading-relaxed">
              A selection of recent work across industries. Real clients, real results, real code.
            </motion.p>
          </div>

          {/* Filter pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center gap-2 mb-12">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  background: activeFilter === f ? 'linear-gradient(135deg, #6C5CE7, #7C6CF7)' : 'rgba(255,255,255,0.04)',
                  color: activeFilter === f ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: activeFilter === f ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: activeFilter === f ? '0 4px 16px rgba(108,92,231,0.3)' : 'none',
                }}>
                {f}
              </button>
            ))}
          </motion.div>

          {/* Portfolio grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item, i) => (
                <PortfolioCard key={item.id} item={item} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-28 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-[10px] font-black tracking-[0.25em] uppercase mb-4 px-4 py-1.5 rounded-full"
              style={{ color: '#06b6d4', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
              Services
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-black text-white leading-tight tracking-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
              Everything your site needs.
              <br />
              <span className="text-white/30">Nothing it doesn't.</span>
            </motion.h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, i) => <ServiceCard key={s.title} service={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" className="py-28 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left label */}
            <div className="md:sticky md:top-28">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block text-[10px] font-black tracking-[0.25em] uppercase mb-5 px-4 py-1.5 rounded-full"
                style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
                Process
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="font-black text-white leading-tight tracking-tight mb-5"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Site live in
                <br />
                <span style={{ color: '#a78bfa' }}>as little as 2 weeks.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-white/40 text-sm leading-relaxed">
                No endless revision cycles. No agency bloat. We work fast because we have a battle-tested process. Here's exactly what happens after you reach out.
              </motion.p>
            </div>

            {/* Right steps */}
            <div className="pt-2">
              {process.map((step, i) => (
                <ProcessStep key={step.num} step={step} index={i} total={process.length} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-28 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-black text-white tracking-tight"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              Don't take our word for it.
            </motion.h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => <TestimonialCard key={t.name} t={t} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-[10px] font-black tracking-[0.25em] uppercase mb-4 px-4 py-1.5 rounded-full"
              style={{ color: '#39d353', background: 'rgba(57,211,83,0.08)', border: '1px solid rgba(57,211,83,0.15)' }}>
              Pricing
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-black text-white leading-tight tracking-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
              Transparent pricing.
              <br />
              <span className="text-white/30">No surprises.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/40 mt-4 max-w-md mx-auto text-sm leading-relaxed">
              Fixed-price projects, not hourly. You know exactly what you're getting before we start.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan, i) => <PlanCard key={plan.name} plan={plan} index={i} />)}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-white/25 text-xs mt-8">
            All projects include hosting setup, analytics, and a 30-day post-launch window.
          </motion.p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center px-8 py-14 rounded-3xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(108,92,231,0.04))',
              border: '1px solid rgba(108,92,231,0.25)',
              boxShadow: '0 0 80px rgba(108,92,231,0.12)',
            }}>
            {/* Orbs */}
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(108,92,231,0.15)' }} />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(6,182,212,0.08)' }} />

            <div className="relative z-10">
              <h2 className="font-black text-white leading-tight tracking-tight mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                Ready to build something
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #6C5CE7, #a78bfa, #06b6d4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  worth being proud of?
                </span>
              </h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-md mx-auto mb-8">
                Tell us about your project. We'll come back within 24 hours with a scope, timeline, and honest feedback.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/dashboard')}
                  className="px-10 py-3.5 rounded-full font-bold text-base text-white"
                  style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', boxShadow: '0 8px 32px rgba(108,92,231,0.45)' }}>
                  Start a Project →
                </motion.button>
                <a href="mailto:hello@freemi.ai"
                  className="px-8 py-3.5 rounded-full font-semibold text-sm text-white/50 hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  hello@freemi.ai
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-10" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)' }}>
              <div className="w-2 h-2 rounded-full bg-white/90" />
            </div>
            <span className="font-bold text-white/60 text-sm">Freemi Web Studio</span>
          </Link>
          <div className="text-xs text-white/20">© 2026 Freemi. Web Studio vertical.</div>
          <div className="flex items-center gap-5 text-xs text-white/30">
            <Link to="/" className="hover:text-white/60 transition-colors">Main Site</Link>
            <Link to="/about" className="hover:text-white/60 transition-colors">About</Link>
            <a href="mailto:hello@freemi.ai" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
