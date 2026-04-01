import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';
import FreemiCharacter from './FreemiCharacter';

const testimonials = [
  { name: 'Ahmed Omar', title: 'CEO, Founder AI', initial: 'A', quote: 'We cut our response time from 4 hours to 8 minutes. Freemi handles what used to take half our team.', color: '#2563EB' },
  { name: 'Kelly Reinward', title: 'CEO, Scale XYZ', initial: 'K', quote: 'I stopped hiring for the role. Freemi does it better, faster, and never takes a sick day.', color: '#7C3AED' },
  { name: 'Josh Fowles', title: 'CEO, ActivePath AI', initial: 'J', quote: 'We identified $250k/year in efficiency savings. This changes what a 10-person team can ship.', color: '#059669' },
  { name: 'Jess Mak', title: 'CEO, Avo HRIS', initial: 'J', quote: "It fit right into our stack — Slack, HubSpot, Gmail. Zero workflow changes, instant results.", color: '#D97706' },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-32 px-6 overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.04), transparent 70%)' }} />

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-16">
          <ScrollReveal>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5"
              style={{ color: '#7C3AED', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)' }}>
              Testimonials
            </span>
          </ScrollReveal>
          <TextReveal delay={0.1}>
            <h2 className="text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold tracking-[-0.03em] text-surface leading-[1.08]">
              Don't Take Our Word For It
            </h2>
          </TextReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex justify-center mt-4 mb-2">
              <motion.div animate={{ y: [0, -5, 0], rotate: [0, 3, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <FreemiCharacter size="sm" />
              </motion.div>
            </div>
            <p className="text-gray-500 mt-2 text-lg">Real results from teams who let Freemi handle the busywork.</p>
          </ScrollReveal>
        </div>

        {/* Trust logos strip */}
        <ScrollReveal delay={0.15}>
          <div className="flex flex-wrap items-center justify-center gap-8 mb-14 py-6 px-4 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.03)' }}>
            {['Founder AI', 'Scale XYZ', 'ActivePath AI', 'Avo HRIS'].map(name => (
              <div key={name} className="text-sm font-bold tracking-tight" style={{ color: 'rgba(0,0,0,0.18)' }}>
                {name}
              </div>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div className="h-full p-8 rounded-3xl bg-white/80 backdrop-blur-sm group transition-all duration-500 hover:shadow-xl relative overflow-hidden"
                style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                {/* Hover accent glow */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: `${t.color}10` }} />

                <div className="relative">
                  <div className="text-4xl font-serif mb-2" style={{ color: t.color, opacity: 0.2 }}>"</div>
                  <p className="text-gray-600 leading-relaxed mb-8 text-[15px]">{t.quote}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}CC)`, boxShadow: `0 4px 12px ${t.color}30` }}>
                      {t.initial}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-surface">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.title}</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}