import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import LandingPage from "@/pages/LandingPage";
import StudentPage from "@/pages/StudentPage";
import TestInterface from "@/components/questionBank/TestInterface";
import AdminPage from "@/pages/AdminPage";
import OnboardingPage from "@/pages/OnboardingPage";
import AuthModal from "@/components/auth/AuthModal";
import { mathService } from "@/services/mathService";
import DevTools from "@/components/ui/DevTools";

function App() {
  const { isAuthenticated, user, isLoading, initializeAuth, isInitialized } = useAuthStore();
  const { showAuthModal } = useAppStore();

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
      mathService.initialize();
    }
  }, [initializeAuth, isInitialized]);

  function ProtectedRoute({ children }) {
    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return children;
  }

  function AdminRoute({ children }) {
    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
        </div>
      );
    }

    if (!isAuthenticated || user?.role !== "admin") {
      return <Navigate to="/" replace />;
    }

    return children;
  }

  function OnboardingRoute({ children }) {
    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    if (user?.isProfileComplete) {
      return (
        <Navigate
          to={user.role === "admin" ? "/admin" : "/dashboard"}
          replace
        />
      );
    }

    return children;
  }

  function DashboardRoute({ children }) {
    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    if (!user?.isProfileComplete) {
      return <Navigate to="/onboarding" replace />;
    }

    return children;
  }

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <OnboardingPage />
              </OnboardingRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <DashboardRoute>
                <StudentPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/test"
            element={
              <DashboardRoute>
                <TestInterface />
              </DashboardRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {showAuthModal && <AuthModal />}
        <DevTools />
      </div>
    </Router>
  );
}

export default App;
