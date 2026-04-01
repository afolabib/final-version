import InteractiveGrid from '../components/InteractiveGrid';
import TopNav from '../components/TopNav';
import HeroSection from '../components/HeroSection';
import AlwaysWorkingSection from '../components/AlwaysWorkingSection';
import UseCasesSection from '../components/UseCasesSection';
import PricingSection from '../components/PricingSection';
import FAQSection from '../components/FAQSection';
import CTASection from '../components/CTASection';
import SiteFooter from '../components/SiteFooter';

export default function Home() {
  return (
    <div className="relative w-full text-surface" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #F8F9FE 50%, #F0F1FF 100%)', minHeight: '100vh', overflowX: 'clip' }}>
      <InteractiveGrid />
      <TopNav />

      <main className="relative z-10">
        <HeroSection />
        <AlwaysWorkingSection />
        <UseCasesSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>

      <SiteFooter />
    </div>
  );
}