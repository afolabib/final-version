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
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(180deg, #EEF0F8 0%, #F8FAFF 40%, #FFFFFF 100%)' }}>
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