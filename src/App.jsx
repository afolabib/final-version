import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import MeetSam from './pages/MeetSam';
import AgentChat from './pages/AgentChat';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/dashboard/Home';
import DashboardAgents from './pages/dashboard/Agents';
import DashboardInbox from './pages/dashboard/Inbox';
import DashboardFiles from './pages/dashboard/Files';
import DashboardTasks from './pages/dashboard/Tasks';
import DashboardAutomations from './pages/dashboard/Automations';
import DashboardIntegrations from './pages/dashboard/Integrations';
import DashboardSkills from './pages/dashboard/Skills';
import DashboardSettings from './pages/dashboard/Settings';
import DashboardSupport from './pages/dashboard/Support';
import DashboardCredits from './pages/dashboard/Credits';
import DashboardPicker from './pages/dashboard/Picker';
import DashboardWizard from './pages/dashboard/Wizard';
import DashboardCustomAgent from './pages/dashboard/CustomAgent';
import DashboardInstances from './pages/dashboard/Instances';
import AdminDashboardLayout from './components/AdminDashboardLayout';
import FloatingChatWidget from './components/FloatingChatWidget';
import AdminDashboard from './pages/admin/Dashboard';
import AdminInstances from './pages/admin/Instances';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Blog from './pages/Blog';
import About from './pages/About';
import BlogArticle from './pages/BlogArticle';
import Solutions from './pages/Solutions';
import IndustrySaaS from './pages/industries/SaaS';
import IndustryECommerce from './pages/industries/ECommerce';
import IndustryHospitality from './pages/industries/Hospitality';
import IndustryHealthcare from './pages/industries/Healthcare';
import IndustryAgencies from './pages/industries/Agencies';
import IndustryLogistics from './pages/industries/Logistics';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Temporary fallback while Sprint 1 is cutting over from Base44 auth.
      // Keep the app visible instead of hard-bouncing into a broken auth loop.
      console.warn('Base44 auth required; continuing in degraded mode during Firebase cutover.');
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/meet-sam" element={<MeetSam />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="picker" element={<DashboardPicker />} />
        <Route path="wizard" element={<DashboardWizard />} />
        <Route index element={<DashboardHome />} />
        <Route path="agents" element={<DashboardAgents />} />
        <Route path="inbox" element={<DashboardInbox />} />
        <Route path="files" element={<DashboardFiles />} />
        <Route path="tasks" element={<DashboardTasks />} />
        <Route path="automations" element={<DashboardAutomations />} />
        <Route path="integrations" element={<DashboardIntegrations />} />
        <Route path="skills" element={<DashboardSkills />} />
        <Route path="settings" element={<DashboardSettings />} />
        <Route path="support" element={<DashboardSupport />} />
        <Route path="credits" element={<DashboardCredits />} />
        <Route path="custom-agent" element={<DashboardCustomAgent />} />
        <Route path="instances" element={<DashboardInstances />} />
      </Route>
      <Route path="/admin" element={<AdminDashboardLayout />} >
        <Route index element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        <Route path="instances" element={<ProtectedAdminRoute><AdminInstances /></ProtectedAdminRoute>} />
      </Route>
      <Route path="/chat" element={<AgentChat />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog/:slug" element={<BlogArticle />} />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/industries/saas" element={<IndustrySaaS />} />
      <Route path="/industries/ecommerce" element={<IndustryECommerce />} />
      <Route path="/industries/hospitality" element={<IndustryHospitality />} />
      <Route path="/industries/healthcare" element={<IndustryHealthcare />} />
      <Route path="/industries/agencies" element={<IndustryAgencies />} />
      <Route path="/industries/logistics" element={<IndustryLogistics />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
          <FloatingChatWidget />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App