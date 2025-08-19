import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AchievementNotification from "@/components/AchievementNotification";
import { AchievementNotificationProvider, useAchievementNotificationContext } from "@/contexts/AchievementNotificationContext";

// Pages
import Index from "./pages/Index";
import ActivityStart from "./pages/ActivityStart";
import ActivityTracking from "./pages/ActivityTracking";
import ActivityResults from "./pages/ActivityResults";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";

// Admin
import { AdminLayout } from "./layouts/AdminLayout";
import AdminRoute from "@/components/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Races from "./pages/admin/Races";
import AdminEvents from "./pages/admin/Events";
import Suor from "./pages/admin/Suor";
import Challenges from "./pages/admin/Challenges";
import Partners from "./pages/admin/Partners";
import ActivitiesAdmin from "./pages/admin/Activities";

// Auth & Onboarding
import Welcome from "./pages/Welcome";
import Login from "./pages/onboarding/Login";
import Signup from "./pages/onboarding/Signup";
import ForgotPassword from "./pages/onboarding/ForgotPassword";
import ProfileSetup from "./pages/onboarding/ProfileSetup";
import Integrations from "./pages/onboarding/Integrations";

// Other Pages
import Achievements from "./pages/Achievements";
import Activities from "./pages/Activities";
import Store from "./pages/Store";
import Rewards from "./pages/admin/Rewards";
import Profile from "./pages/Profile";
import Social from "./pages/Social";
import Events from "./pages/Events";

const queryClient = new QueryClient();

// Component to handle global achievement notifications
const AppWithNotifications = ({ children }: { children: React.ReactNode }) => {
  const { currentNotification, closeCurrentNotification } = useAchievementNotificationContext();

  return (
    <>
      {children}
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          onClose={closeCurrentNotification}
          show={!!currentNotification}
        />
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AchievementNotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppWithNotifications>
          <BrowserRouter>
          <Routes>
            {/* OAuth Callback Route */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Public Routes - Redirect to app if already authenticated */}
            <Route path="/welcome" element={
              <ProtectedRoute requireAuth={false}>
                <Welcome />
              </ProtectedRoute>
            } />
            <Route path="/onboarding/login" element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } />
            <Route path="/onboarding/signup" element={
              <ProtectedRoute requireAuth={false}>
                <Signup />
              </ProtectedRoute>
            } />
            <Route path="/onboarding/forgot-password" element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPassword />
              </ProtectedRoute>
            } />
            
            {/* Semi-Protected Onboarding Routes - Allow access during onboarding flow */}
            <Route path="/onboarding/profile-setup" element={<ProfileSetup />} />
            <Route path="/onboarding/integrations" element={<Integrations />} />
            
            {/* Protected App Routes - Require authentication */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/activity/start" element={
              <ProtectedRoute>
                <ActivityStart />
              </ProtectedRoute>
            } />
            <Route path="/activity/:activityType/tracking" element={
              <ProtectedRoute>
                <ActivityTracking />
              </ProtectedRoute>
            } />
            <Route path="/activity/results" element={
              <ProtectedRoute>
                <ActivityResults />
              </ProtectedRoute>
            } />
                            <Route path="/achievements" element={
                  <ProtectedRoute>
                    <Achievements />
                  </ProtectedRoute>
                } />
                <Route path="/activities" element={
                  <ProtectedRoute>
                    <Activities />
                  </ProtectedRoute>
                } />
                <Route path="/store" element={
                  <ProtectedRoute>
                    <Store />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/profiles" element={<Navigate to="/profile" replace />} />
                <Route path="/social" element={
                  <ProtectedRoute>
                    <Social />
                  </ProtectedRoute>
                } />
                <Route path="/events" element={
                  <ProtectedRoute>
                    <Events />
                  </ProtectedRoute>
                } />
            
            {/* Protected Admin Routes - Require authentication */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout><AdminDashboard /></AdminLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout><Users /></AdminLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/races" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout><Races /></AdminLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/routes" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout><div>Percursos - Em desenvolvimento</div></AdminLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout><AdminEvents /></AdminLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/activities" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout><ActivitiesAdmin /></AdminLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/suor" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout><Suor /></AdminLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/challenges" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout><Challenges /></AdminLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/partners" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout><Partners /></AdminLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout><div>Configurações - Em desenvolvimento</div></AdminLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/rewards" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout><Rewards /></AdminLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            {/* 404 - Keep as last route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </AppWithNotifications>
        </TooltipProvider>
      </AchievementNotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
