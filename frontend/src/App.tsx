import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import PricingPage from './pages/public/PricingPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome';
import UploadReport from './pages/dashboard/UploadReport';
import MedicalHistory from './pages/dashboard/MedicalHistory';
import HealthTimeline from './pages/dashboard/HealthTimeline';
import AIHealthAssistant from './pages/dashboard/AIHealthAssistant';
import Notifications from './pages/dashboard/Notifications';
import UserSettings from './pages/dashboard/UserSettings';
import OAuthCallback from './pages/auth/OAuthCallback';
import AnalysisResult from './pages/dashboard/AnalysisResult';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const hasToken = !!localStorage.getItem('accessToken');

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/auth/login" replace />;
  }
  return <>{children}</>;
};

const LegacyAnalysisRedirect = () => {
  const { reportId } = useParams();
  return <Navigate to={`/dashboard/analysis/${reportId}`} replace />;
};

export default function App() {
  const mode = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="callback" element={<OAuthCallback />} />
        </Route>

        {/* Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute children={undefined}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="upload" element={<UploadReport />} />
          <Route path="analysis/:id" element={<AnalysisResult />} />
          <Route path="history" element={<MedicalHistory />} />
          <Route path="timeline" element={<HealthTimeline />} />
          <Route path="assistant" element={<AIHealthAssistant />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>

        {/* Legacy upload redirect */}
        <Route path="/analysis/:reportId" element={<LegacyAnalysisRedirect />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}
