import TopNav from '../components/TopNav';
import SamDemo from '../components/SamDemo';
import SiteFooter from '../components/SiteFooter';
import InteractiveGrid from '../components/InteractiveGrid';
import SystemMetadata from '../components/SystemMetadata';

export default function MeetSam() {
  return (
    <div className="relative min-h-screen bg-[#EEF0F8] text-surface overflow-y-auto overflow-x-hidden">
      <InteractiveGrid />
      <SystemMetadata />
      <TopNav />

      <main className="pt-20 pb-20">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 mb-16">
          <div className="text-center">
            <span className="text-sm font-bold px-4 py-2 rounded-full inline-block mb-4" style={{ background: 'rgba(74,108,247,0.08)', color: '#4A6CF7' }}>
              Product Demo
            </span>
            <h1 className="text-5xl font-extrabold mb-4" style={{ color: '#0A0A1A', letterSpacing: '-0.03em' }}>
              Meet Sam
            </h1>
            <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#6B7280' }}>
              Experience the future of task management. Sam is your AI co-pilot for organizing work, coordinating teams, and shipping faster.
            </p>
          </div>
        </section>

        {/* Demo */}
        <SamDemo />

        {/* Features grid */}
        <section className="max-w-5xl mx-auto px-4 mt-20">
          <h2 className="text-3xl font-extrabold text-center mb-12" style={{ color: '#0A0A1A', letterSpacing: '-0.02em' }}>
            What Sam Can Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📋', title: 'Task Management', desc: 'Create, organize, and prioritize tasks across teams.' },
              { icon: '📅', title: 'Calendar Sync', desc: 'Integrate with your calendar and schedule efficiently.' },
              { icon: '💬', title: 'Team Coordination', desc: 'Keep your team aligned with real-time updates.' },
              { icon: '🔔', title: 'Smart Reminders', desc: 'Get notified about deadlines and important events.' },
              { icon: '📊', title: 'Progress Tracking', desc: 'Monitor project status and team velocity.' },
              { icon: '🚀', title: 'Automation', desc: 'Automate repetitive workflows and save time.' },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #E8EAFF', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-bold mb-2" style={{ color: '#0A0A1A' }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 mt-20 text-center">
          <h2 className="text-3xl font-extrabold mb-4" style={{ color: '#0A0A1A' }}>Ready to transform your workflow?</h2>
          <p className="text-lg mb-8" style={{ color: '#6B7280' }}>Deploy Sam for your team and watch productivity soar.</p>
          <button
            className="px-10 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4A6CF7, #6B63FF)',
              boxShadow: '0 12px 40px rgba(74,108,247,0.35)'
            }}
          >
            🚀 Get Started
          </button>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}