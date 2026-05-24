import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy-loaded pages for code splitting
const LandingPage   = lazy(() => import('@/pages/LandingPage'));
const AuthPage      = lazy(() => import('@/pages/AuthPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const RedirectPage  = lazy(() => import('@/pages/RedirectPage'));
const NotFoundPage  = lazy(() => import('@/pages/NotFoundPage'));

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Auth route (redirect if already logged in)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return <LoadingSpinner fullScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public */}
        <Route path="/"        element={<LandingPage />} />
        <Route path="/login"   element={<AuthRoute><AuthPage mode="login" /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><AuthPage mode="register" /></AuthRoute>} />

        {/* Protected */}
        <Route path="/dashboard"           element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/analytics/:linkId" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />

        {/* Short URL redirect — must be LAST */}
        <Route path="/:slug" element={<RedirectPage />} />
        <Route path="*"      element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
