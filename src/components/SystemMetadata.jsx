import { useEffect, useState, useRef } from 'react';

export default function SystemMetadata() {
  const [scroll, setScroll] = useState(0);
  const [section, setSection] = useState('01');
  const rafRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const s = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScroll(max > 0 ? Math.round((s / max) * 100) : 0);

        const sections = ['hero', 'always-working', 'use-cases', 'testimonials', 'pricing', 'faq', 'cta'];
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i]);
          if (el && el.getBoundingClientRect().top < window.innerHeight / 2) {
            setSection(String(i + 1).padStart(2, '0'));
            break;
          }
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-4">
        <span className="text-[9px] tracking-widest text-gray-400" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          SEC {section}
        </span>
        <div className="w-px h-12 bg-gray-300" />
        <span className="text-[9px] tracking-widest text-gray-400" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          {scroll}%
        </span>
      </div>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-4">
        <span className="text-[9px] tracking-widest text-gray-300" style={{ writingMode: 'vertical-rl' }}>
          FREEMI.SYS
        </span>
      </div>
    </>
  );
}