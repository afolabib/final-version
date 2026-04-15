import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, User, Tag, Search, ChevronLeft } from 'lucide-react';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';

const categories = ['All', 'AI Strategy', 'Automation', 'Product Updates', 'Guides', 'Industry'];

const articles = [
  {
    slug: 'why-ai-operators-replace-saas',
    title: 'Why AI Operators Will Replace Your Entire SaaS Stack',
    excerpt: 'The future of work isn\'t more tools — it\'s fewer tools and smarter operators. Here\'s how AI agents are collapsing the SaaS stack into a single intelligent layer.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/b5cc3319d_generated_image.png',
    category: 'AI Strategy',
    author: 'Sarah Chen',
    date: 'Mar 22, 2026',
    readTime: '8 min read',
    featured: true,
  },
  {
    slug: 'building-autonomous-workflows',
    title: 'Building Autonomous Workflows: A Practical Guide',
    excerpt: 'Step-by-step guide to designing workflows that run themselves. From email triage to lead qualification — no code required.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/895c2bb26_generated_image.png',
    category: 'Guides',
    author: 'Marcus Reid',
    date: 'Mar 18, 2026',
    readTime: '12 min read',
  },
  {
    slug: 'data-driven-decisions-ai',
    title: 'How AI Agents Turn Raw Data Into Strategic Decisions',
    excerpt: 'Your business generates terabytes of data daily. Learn how AI operators synthesize signals from CRM, email, and analytics into actionable insights.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/4f9a8b5f3_generated_image.png',
    category: 'AI Strategy',
    author: 'Sarah Chen',
    date: 'Mar 14, 2026',
    readTime: '6 min read',
  },
  {
    slug: 'freemi-spring-2026-update',
    title: 'Spring 2026 Update: Memory, Multi-Agent Handoffs & More',
    excerpt: 'Persistent memory, cross-agent task handoffs, and 40 new integrations. Everything shipping in our biggest update yet.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/695cf5989_generated_image.png',
    category: 'Product Updates',
    author: 'Freemi Team',
    date: 'Mar 10, 2026',
    readTime: '5 min read',
  },
  {
    slug: 'future-of-work-ai-employees',
    title: 'The Future of Work: AI Employees That Never Clock Out',
    excerpt: 'What happens when your best employee works 24/7, never takes a sick day, and costs less than a monthly software subscription? We\'re about to find out.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/adf1cc571_generated_image.png',
    category: 'Industry',
    author: 'James Park',
    date: 'Mar 6, 2026',
    readTime: '10 min read',
  },
  {
    slug: 'ai-onboarding-playbook',
    title: 'The AI Onboarding Playbook: From Day 1 to Full Autonomy',
    excerpt: 'How to deploy an AI operator and get it running at full capacity within a week. Real timelines, real benchmarks, and the mistakes to avoid.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/deb4ec5e4_generated_image.png',
    category: 'Guides',
    author: 'Marcus Reid',
    date: 'Mar 2, 2026',
    readTime: '9 min read',
  },
  {
    slug: 'why-chatbots-fail-operators-dont',
    title: 'Why Chatbots Fail and AI Operators Don\'t',
    excerpt: 'Chatbots answer questions. Operators do work. Here\'s the fundamental difference — and why the market is shifting from one to the other.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/6b93ab098_generated_image.png',
    category: 'AI Strategy',
    author: 'Sarah Chen',
    date: 'Feb 26, 2026',
    readTime: '7 min read',
  },
  {
    slug: 'automating-customer-success',
    title: 'Automating Customer Success Without Losing the Human Touch',
    excerpt: 'Your customers expect personalized attention. AI operators deliver it at scale — proactive check-ins, health scoring, and churn prevention that feels genuinely human.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/3fb6347ce_generated_image.png',
    category: 'Automation',
    author: 'Emily Tran',
    date: 'Feb 20, 2026',
    readTime: '11 min read',
  },
  {
    slug: 'roi-of-ai-operators',
    title: 'The ROI of AI Operators: A CFO\'s Perspective',
    excerpt: 'We broke down the numbers across 200+ deployments. The average payback period? 11 days. Here\'s the full financial analysis.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/48784ed94_generated_image.png',
    category: 'Industry',
    author: 'James Park',
    date: 'Feb 14, 2026',
    readTime: '8 min read',
  },
  {
    slug: 'multi-agent-workflows-explained',
    title: 'Multi-Agent Workflows: When One Operator Isn\'t Enough',
    excerpt: 'The real power of AI operators isn\'t individual agents — it\'s when they collaborate. Learn how to orchestrate multi-agent workflows that handle entire business processes.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/dceb530e6_generated_image.png',
    category: 'Guides',
    author: 'Marcus Reid',
    date: 'Feb 8, 2026',
    readTime: '14 min read',
  },
  {
    slug: 'ai-security-enterprise-guide',
    title: 'Enterprise AI Security: What You Actually Need to Know',
    excerpt: 'SOC 2, encryption, data residency, access controls — a no-nonsense guide to evaluating AI operator platforms for enterprise security requirements.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/21e862bab_generated_image.png',
    category: 'Guides',
    author: 'Freemi Team',
    date: 'Feb 2, 2026',
    readTime: '6 min read',
  },
  {
    slug: 'from-sdr-to-ai-operator',
    title: 'I Replaced My SDR Team with AI Operators. Here\'s What Happened.',
    excerpt: 'A founder\'s honest account of transitioning from a 4-person SDR team to AI-powered outbound. The wins, the surprises, and the one thing he\'d do differently.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/ebfe96c98_generated_image.png',
    category: 'Industry',
    author: 'David Kim',
    date: 'Jan 27, 2026',
    readTime: '13 min read',
  },
  {
    slug: 'ai-agents-vs-rpa',
    title: 'AI Agents vs. RPA: The End of Robotic Process Automation',
    excerpt: 'RPA was the bridge. AI operators are the destination. Why rigid automation scripts are being replaced by intelligent, adaptive agents.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/3084750ac_generated_image.png',
    category: 'AI Strategy',
    author: 'Sarah Chen',
    date: 'Jan 20, 2026',
    readTime: '9 min read',
  },
  {
    slug: 'winter-2026-product-update',
    title: 'Winter 2026: Voice Agents, Zapier Integration & Dashboard V2',
    excerpt: 'Voice-enabled operators, native Zapier triggers, and a completely redesigned dashboard. Everything new in our winter release.',
    image: 'https://media.base44.com/images/public/69c33793e2f72e04b51160c6/d76dba2d2_generated_image.png',
    category: 'Product Updates',
    author: 'Freemi Team',
    date: 'Jan 12, 2026',
    readTime: '4 min read',
  },
];

function ArticleCard({ article, index, featured }) {
  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Link to={`/blog/${article.slug}`} className="block group">
          <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden card-lift"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
            }}>
            <div className="aspect-video md:aspect-auto relative overflow-hidden">
              <img src={article.image} alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.1), transparent)' }} />
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ background: 'rgba(123,97,255,0.06)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.1)' }}>
                  Featured
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.03)', color: '#64748B' }}>
                  {article.category}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 transition-colors"
                style={{ color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.15 }}
                onMouseEnter={e => e.currentTarget.style.color = '#7B61FF'}
                onMouseLeave={e => e.currentTarget.style.color = '#0F172A'}>
                {article.title}
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: '#64748B' }}>{article.excerpt}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)' }}>
                    {article.author[0]}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#374151' }}>{article.author}</span>
                </div>
                <span className="text-xs" style={{ color: '#CBD5E1' }}>·</span>
                <span className="text-xs" style={{ color: '#94A3B8' }}>{article.date}</span>
                <span className="text-xs" style={{ color: '#CBD5E1' }}>·</span>
                <span className="text-xs flex items-center gap-1" style={{ color: '#94A3B8' }}>
                  <Clock size={10} /> {article.readTime}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
    >
      <Link to={`/blog/${article.slug}`} className="block group">
        <div className="rounded-3xl overflow-hidden card-lift h-full flex flex-col"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          }}>
          <div className="aspect-video relative overflow-hidden">
            <img src={article.image} alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute top-4 left-4">
              <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', color: '#7B61FF' }}>
                {article.category}
              </span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-1">
            <h3 className="text-lg font-extrabold tracking-tight mb-2 transition-colors"
              style={{ color: '#0F172A', letterSpacing: '-0.01em', lineHeight: 1.25 }}
              onMouseEnter={e => e.currentTarget.style.color = '#7B61FF'}
              onMouseLeave={e => e.currentTarget.style.color = '#0F172A'}>
              {article.title}
            </h3>
            <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: '#64748B' }}>{article.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7B61FF, #6C4AE8)' }}>
                  {article.author[0]}
                </div>
                <span className="text-xs font-semibold" style={{ color: '#374151' }}>{article.author}</span>
                <span className="text-xs" style={{ color: '#94A3B8' }}>{article.date}</span>
              </div>
              <span className="text-xs flex items-center gap-1" style={{ color: '#94A3B8' }}>
                <Clock size={10} /> {article.readTime}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Blog() {
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');

  const featured = articles.find(a => a.featured);
  const rest = articles.filter(a => !a.featured);
  const filtered = rest.filter(a =>
    (activeCat === 'All' || a.category === activeCat) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)' }}>
      <TopNav />

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="min-h-screen flex flex-col justify-center pt-32 pb-16 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.06), transparent 70%)' }} />
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
              style={{ color: '#7B61FF', background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.1)' }}>
              Blog
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}
              className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4"
              style={{ color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.08, fontFamily: 'var(--font-serif)' }}>
              Insights & Updates
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
              className="text-lg max-w-xl mx-auto" style={{ color: '#64748B' }}>
              Thoughts on AI agents, automation strategy, and the future of work from the Freemi team.
            </motion.p>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-6xl mx-auto px-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c} onClick={() => setActiveCat(c)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: activeCat === c ? 'linear-gradient(135deg, #7B61FF, #6C4AE8)' : 'rgba(255,255,255,0.8)',
                    color: activeCat === c ? '#fff' : '#6B7280',
                    border: activeCat === c ? 'none' : '1px solid rgba(0,0,0,0.05)',
                    boxShadow: activeCat === c ? '0 4px 12px rgba(123,97,255,0.25)' : '0 2px 8px rgba(0,0,0,0.02)',
                  }}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl input-focus-ring"
              style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <Search size={14} style={{ color: '#CBD5E1' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..."
                className="text-sm outline-none bg-transparent w-48 font-medium" style={{ color: '#374151' }} />
            </div>
          </motion.div>
        </div>

        {/* Featured */}
        <div className="max-w-6xl mx-auto px-6 mb-10">
          {featured && (activeCat === 'All' || activeCat === featured.category) && (
            <ArticleCard article={featured} featured />
          )}
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((article, i) => (
              <ArticleCard key={article.slug} article={article} index={i} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 float"
                style={{ background: 'rgba(123,97,255,0.06)' }}>
                <Search size={22} style={{ color: '#CBD5E1' }} />
              </div>
              <p className="text-sm font-bold" style={{ color: '#374151' }}>No articles found</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Try a different search or category</p>
            </div>
          )}
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}