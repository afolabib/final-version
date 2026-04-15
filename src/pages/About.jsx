import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import FreemiCharacter from '../components/FreemiCharacter';
import AboutHero from '../components/about/AboutHero';
import AboutCapabilities from '../components/about/AboutCapabilities';
import AboutHowItWorks from '../components/about/AboutHowItWorks';
import AboutPrinciples from '../components/about/AboutPrinciples';
import AboutCTA from '../components/about/AboutCTA';

export default function About() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #F8F9FE 30%, #EEF2FF 60%, #F0F7FF 100%)' }}>
      <TopNav />
      <div className="flex-1 overflow-y-auto">
        <AboutHero />
        <AboutCapabilities />
        <AboutHowItWorks />
        <AboutPrinciples />
        <AboutCTA />
        <SiteFooter />
      </div>
    </div>
  );
}