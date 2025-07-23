import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ActivityStart from "./pages/ActivityStart";
import ActivityTracking from "./pages/ActivityTracking";
import ActivityResults from "./pages/ActivityResults";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Races from "./pages/admin/Races";
import Events from "./pages/admin/Events";
import Suor from "./pages/admin/Suor";
import Challenges from "./pages/admin/Challenges";
import Partners from "./pages/admin/Partners";
import Welcome from "./pages/Welcome";
import Login from "./pages/onboarding/Login";
import Signup from "./pages/onboarding/Signup";
import ForgotPassword from "./pages/onboarding/ForgotPassword";
import ProfileSetup from "./pages/onboarding/ProfileSetup";
import Integrations from "./pages/onboarding/Integrations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Onboarding Routes */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/onboarding/login" element={<Login />} />
          <Route path="/onboarding/signup" element={<Signup />} />
          <Route path="/onboarding/forgot-password" element={<ForgotPassword />} />
          <Route path="/onboarding/profile-setup" element={<ProfileSetup />} />
          <Route path="/onboarding/integrations" element={<Integrations />} />
          
          {/* Main App Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/activity/start" element={<ActivityStart />} />
          <Route path="/activity/:activityType/tracking" element={<ActivityTracking />} />
          <Route path="/activity/results" element={<ActivityResults />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><Users /></AdminLayout>} />
          <Route path="/admin/races" element={<AdminLayout><Races /></AdminLayout>} />
          <Route path="/admin/routes" element={<AdminLayout><div>Percursos - Em desenvolvimento</div></AdminLayout>} />
          <Route path="/admin/events" element={<AdminLayout><Events /></AdminLayout>} />
          <Route path="/admin/activities" element={<AdminLayout><div>Atividades - Em desenvolvimento</div></AdminLayout>} />
          <Route path="/admin/suor" element={<AdminLayout><Suor /></AdminLayout>} />
          <Route path="/admin/challenges" element={<AdminLayout><Challenges /></AdminLayout>} />
          <Route path="/admin/partners" element={<AdminLayout><Partners /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout><div>Configurações - Em desenvolvimento</div></AdminLayout>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
