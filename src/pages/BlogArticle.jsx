import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Copy } from 'lucide-react';
import { toast } from 'sonner';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import MarkdownRenderer from '../components/blog/MarkdownRenderer';
import articlesData from '../data/blogArticles';

export default function BlogArticle() {
  const { slug } = useParams();
  const article = articlesData[slug];

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F4FF' }}>
        <div className="text-center">
          <p className="text-lg font-bold mb-2" style={{ color: '#0F172A' }}>Article not found</p>
          <Link to="/blog" className="text-sm font-bold" style={{ color: '#6C5CE7' }}>← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const otherSlugs = Object.keys(articlesData).filter(s => s !== slug).slice(0, 2);

  return (
    <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(180deg, #F0F4FF 0%, #F8FAFF 30%, #FFFFFF 100%)' }}>
      <TopNav />
      <div className="flex-1 overflow-y-auto">
        <div className="pt-24">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-8 transition-colors"
                style={{ color: '#94A3B8' }}
                onMouseEnter={e => e.currentTarget.style.color = '#6C5CE7'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
                <ArrowLeft size={14} /> Back to Blog
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}
              className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                style={{ background: 'rgba(108,92,231,0.06)', color: '#6C5CE7', border: '1px solid rgba(108,92,231,0.1)' }}>
                {article.category}
              </span>
              <span className="text-xs flex items-center gap-1" style={{ color: '#94A3B8' }}>
                <Clock size={10} /> {article.readTime}
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
              style={{ color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: 'var(--font-serif)' }}>
              {article.title}
            </motion.h1>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.12 }}
              className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6C5CE7, #7C6CF7)', boxShadow: '0 4px 12px rgba(108,92,231,0.25)' }}>
                  {article.author[0]}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{article.author}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{article.authorRole}</p>
                </div>
              </div>
              <span style={{ color: '#E5E7EB' }}>·</span>
              <span className="text-sm" style={{ color: '#94A3B8' }}>{article.date}</span>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="max-w-4xl mx-auto px-6 mb-12">
            <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
              <img src={article.image} alt={article.title} className="w-full aspect-video object-cover" />
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}
          className="max-w-3xl mx-auto px-6 pb-16">
          <div className="flex items-center gap-2 mb-10 pb-8" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <span className="text-xs font-bold tracking-widest uppercase mr-2" style={{ color: '#94A3B8' }}>Share</span>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ color: '#94A3B8', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#6C5CE7'; e.currentTarget.style.borderColor = 'rgba(108,92,231,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)'; }}>
              <Copy size={14} />
            </button>
          </div>

          <MarkdownRenderer content={article.content} />
        </motion.div>

        <div className="max-w-4xl mx-auto px-6 pb-24">
          <div className="pt-10" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 className="text-xl font-extrabold tracking-tight mb-6" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>Continue Reading</h3>
            <div className="grid md:grid-cols-2 gap-5">
              {otherSlugs.map(s => {
                const a = articlesData[s];
                return (
                  <Link key={s} to={`/blog/${s}`} className="group">
                    <div className="rounded-2xl overflow-hidden card-lift"
                      style={{
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.6)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                      }}>
                      <div className="aspect-video overflow-hidden">
                        <img src={a.image} alt={a.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <div className="p-5">
                        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#6C5CE7' }}>{a.category}</span>
                        <h4 className="text-sm font-bold mt-1 transition-colors" style={{ color: '#0F172A' }}>{a.title}</h4>
                        <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{a.readTime}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}