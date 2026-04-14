import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useParams } from 'react-router-dom';
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
import DashboardProjects from './pages/dashboard/Projects';
import DashboardAutomations from './pages/dashboard/Automations';
import DashboardIntegrations from './pages/dashboard/Integrations';
import DashboardWidget from './pages/dashboard/Widget';
import DashboardSkills from './pages/dashboard/Skills';
import DashboardSettings from './pages/dashboard/Settings';
import DashboardSupport from './pages/dashboard/Support';
import DashboardCredits from './pages/dashboard/Credits';
import DashboardPicker from './pages/dashboard/Picker';
import DashboardWizard from './pages/dashboard/Wizard';
import DashboardCustomAgent from './pages/dashboard/CustomAgent';
import DashboardInstances from './pages/dashboard/Instances';
import DashboardTeam from './pages/dashboard/Team';
import DashboardGoals from './pages/dashboard/Goals';
import DashboardApprovals from './pages/dashboard/Approvals';
import DashboardBudget from './pages/dashboard/Budget';
import DashboardRoutines from './pages/dashboard/Routines';
import DashboardChat from './pages/dashboard/Chat';
import AdminDashboardLayout from './components/AdminDashboardLayout';
import FloatingChatWidget from './components/FloatingChatWidget';
import AdminDashboard from './pages/admin/Dashboard';
import AdminInstances from './pages/admin/Instances';
import AdminSites from './pages/admin/Sites';
import AdminUsers from './pages/admin/Users';
import AdminWebsites from './pages/admin/AdminWebsites';
import AdminWidgets from './pages/admin/AdminWidgets';
import AdminVoice from './pages/admin/AdminVoice';
import AdminBilling from './pages/admin/AdminBilling';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import DashboardCompanies from './pages/dashboard/Companies';
import Blog from './pages/Blog';
import About from './pages/About';
import BlogArticle from './pages/BlogArticle';
import Solutions from './pages/Solutions';
import SolutionPharmacy from './pages/solutions/Pharmacy';
import IndustrySaaS from './pages/industries/SaaS';
import IndustryECommerce from './pages/industries/ECommerce';
import IndustryHospitality from './pages/industries/Hospitality';
import IndustryHealthcare from './pages/industries/Healthcare';
import IndustryAgencies from './pages/industries/Agencies';
import IndustryLogistics from './pages/industries/Logistics';
import ForBusiness from './pages/ForBusiness';
import HowItWorks from './pages/HowItWorks';
import SolutionAIOperators from './pages/solutions/AIOperators';
import SolutionWidget from './pages/solutions/Widget';
import SolutionPhoneAI from './pages/solutions/PhoneAI';
import DashboardConversations from './pages/dashboard/Conversations';
import DashboardTools from './pages/dashboard/Tools';
import DashboardCallLog from './pages/dashboard/CallLog';
import DashboardVoiceSetup from './pages/dashboard/VoiceSetup';
import DashboardWebsitePages from './pages/dashboard/WebsitePages';
import DashboardWebsiteAnalytics from './pages/dashboard/WebsiteAnalytics';
import DashboardWebsiteSettings from './pages/dashboard/WebsiteSettings';
import ClipsLanding from './pages/clips/Landing';
import ClipsHome from './pages/dashboard/ClipsHome';
import ClipsProject from './pages/dashboard/ClipsProject';
import ClipsEditor from './pages/dashboard/ClipsEditor';
import ClipsBrandKit from './pages/dashboard/ClipsBrandKit';
import ClipsScheduler from './pages/dashboard/ClipsScheduler';
import ClipsAnalytics from './pages/dashboard/ClipsAnalytics';
import ClipsSettings from './pages/dashboard/ClipsSettings';
import ClipsAppLayout from './components/clips/ClipsAppLayout';
import ProductStudio from './pages/products/Studio';
import ProductConcierge from './pages/products/Concierge';
import ProductVoice from './pages/products/Voice';
import ProductWhatsApp from './pages/products/WhatsApp';
import ProductBookings from './pages/products/Bookings';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function RequireAuth({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function NavigateToClips() {
  const params = useParams();
  const location = useLocation();
  const newPath = location.pathname.replace('/dashboard/clips/', '/clips/studio/');
  return <Navigate to={newPath} replace />;
}

function RedirectIfAuth({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

const AuthenticatedApp = () => {
  // Auth temporarily bypassed — render immediately

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/meet-sam" element={<MeetSam />} />
      <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route path="picker" element={<DashboardPicker />} />
        <Route path="wizard" element={<DashboardWizard />} />
        <Route index element={<DashboardHome />} />
        <Route path="companies" element={<DashboardCompanies />} />
        <Route path="agents" element={<DashboardAgents />} />
        <Route path="inbox" element={<DashboardInbox />} />
        <Route path="files" element={<DashboardFiles />} />
        <Route path="tasks" element={<DashboardTasks />} />
        <Route path="projects" element={<DashboardProjects />} />
        <Route path="automations" element={<DashboardAutomations />} />
        <Route path="integrations" element={<DashboardIntegrations />} />
        <Route path="widget" element={<DashboardWidget />} />
        <Route path="skills" element={<DashboardSkills />} />
        <Route path="settings" element={<DashboardSettings />} />
        <Route path="support" element={<DashboardSupport />} />
        <Route path="credits" element={<DashboardCredits />} />
        <Route path="custom-agent" element={<DashboardCustomAgent />} />
        <Route path="instances" element={<DashboardInstances />} />
        <Route path="team" element={<DashboardTeam />} />
        <Route path="goals" element={<DashboardGoals />} />
        <Route path="approvals" element={<DashboardApprovals />} />
        <Route path="budget" element={<DashboardBudget />} />
        <Route path="routines" element={<DashboardRoutines />} />
        <Route path="chat" element={<DashboardChat />} />
        <Route path="conversations" element={<DashboardConversations />} />
        <Route path="tools" element={<DashboardTools />} />
        <Route path="call-log" element={<DashboardCallLog />} />
        <Route path="voice-setup" element={<DashboardVoiceSetup />} />
        <Route path="website-pages" element={<DashboardWebsitePages />} />
        <Route path="website-analytics" element={<DashboardWebsiteAnalytics />} />
        <Route path="website-settings" element={<DashboardWebsiteSettings />} />
        <Route path="clips" element={<Navigate to="/clips/studio" replace />} />
        <Route path="clips/project/:projectId" element={<NavigateToClips />} />
        <Route path="clips/editor/:clipId" element={<NavigateToClips />} />
        <Route path="clips/brand-kit" element={<Navigate to="/clips/studio/brand-kit" replace />} />
        <Route path="clips/scheduler" element={<Navigate to="/clips/studio/scheduler" replace />} />
        <Route path="clips/analytics" element={<Navigate to="/clips/studio/analytics" replace />} />
        <Route path="clips/settings" element={<Navigate to="/clips/studio/settings" replace />} />
      </Route>
      <Route path="/admin" element={<AdminDashboardLayout />} >
        <Route index element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        <Route path="instances" element={<ProtectedAdminRoute><AdminInstances /></ProtectedAdminRoute>} />
        <Route path="sites"     element={<ProtectedAdminRoute><AdminSites /></ProtectedAdminRoute>} />
        <Route path="users"     element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
        <Route path="websites"  element={<ProtectedAdminRoute><AdminWebsites /></ProtectedAdminRoute>} />
        <Route path="widgets"   element={<ProtectedAdminRoute><AdminWidgets /></ProtectedAdminRoute>} />
        <Route path="voice"     element={<ProtectedAdminRoute><AdminVoice /></ProtectedAdminRoute>} />
        <Route path="billing"   element={<ProtectedAdminRoute><AdminBilling /></ProtectedAdminRoute>} />
      </Route>
      <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
      <Route path="/signup" element={<RedirectIfAuth><Signup /></RedirectIfAuth>} />
      <Route path="/forgot-password" element={<RedirectIfAuth><ForgotPassword /></RedirectIfAuth>} />
      <Route path="/clips" element={<Navigate to="/clips/studio" replace />} />
      <Route path="/clips/studio" element={<ClipsAppLayout />}>
        <Route index element={<ClipsHome />} />
        <Route path="project/:projectId" element={<ClipsProject />} />
        <Route path="editor/:clipId" element={<ClipsEditor />} />
        <Route path="brand-kit" element={<ClipsBrandKit />} />
        <Route path="scheduler" element={<ClipsScheduler />} />
        <Route path="analytics" element={<ClipsAnalytics />} />
        <Route path="settings" element={<ClipsSettings />} />
      </Route>
      <Route path="/chat" element={<Navigate to="/dashboard/chat" replace />} />
      <Route path="/products/studio" element={<ProductStudio />} />
      <Route path="/products/concierge" element={<ProductConcierge />} />
      <Route path="/products/voice" element={<ProductVoice />} />
      <Route path="/products/whatsapp" element={<ProductWhatsApp />} />
      <Route path="/products/bookings" element={<ProductBookings />} />
      <Route path="/for-business" element={<ForBusiness />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/solutions/ai-operators" element={<SolutionAIOperators />} />
      <Route path="/solutions/widget" element={<SolutionWidget />} />
      <Route path="/solutions/phone" element={<SolutionPhoneAI />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog/:slug" element={<BlogArticle />} />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/solutions/pharmacy" element={<SolutionPharmacy />} />
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
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
  // Note: FloatingChatWidget removed from global level — FloatingFreemiChat is rendered per-dashboard-page inside DashboardLayout
}

export default App