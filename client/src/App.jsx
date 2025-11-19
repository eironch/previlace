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
import AdminPage from "@/pages/AdminPage";
import OnboardingPage from "@/pages/OnboardingPage";
import QuizSetupPage from "@/pages/quiz/QuizSetupPage";
import QuizSessionPage from "@/pages/quiz/QuizSessionPage";
import QuizResultsPage from "@/pages/quiz/QuizResultsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import MockExamStartPage from "@/pages/quiz/MockExamStartPage";
import AchievementsPage from "@/pages/AchievementsPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import PerformancePage from "@/pages/PerformancePage";
import ExamReadinessPage from "@/pages/ExamReadinessPage";

import StudyPlanPage from "@/pages/StudyPlanPage";
import StudyStreakPage from "@/pages/StudyStreakPage";
import ChallengePage from "@/pages/ChallengePage";
import JobsPage from "@/pages/JobsPage";
import SubjectsPage from "@/pages/SubjectsPage";
import SubjectDetailPage from "@/pages/SubjectDetailPage";
import TopicDetailPage from "@/pages/TopicDetailPage";
import ResumeBuilderPage from "@/pages/ResumeBuilderPage";
import InterviewPrepPage from "@/pages/InterviewPrepPage";
import ProfileSettingsPage from "@/pages/settings/ProfileSettingsPage";
import AuthModal from "@/components/auth/AuthModal";
import DevTools from "@/components/ui/DevTools";
import RoleDashboard from "@/components/dashboard/RoleDashboard";
import { mathService } from "@/services/mathService";

function App() {
  const { isAuthenticated, user, isLoading, initializeAuth, isInitialized } =
    useAuthStore();
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

    if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "super_admin")) {
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
      const redirectPath = user.role === "admin" || user.role === "super_admin" ? "/admin" : "/dashboard";
      return <Navigate to={redirectPath} replace />;
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
                {user?.role === "admin" || user?.role === "super_admin" ? <RoleDashboard /> : <StudentPage />}
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/quiz"
            element={
              <DashboardRoute>
                <QuizSetupPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/quiz-session"
            element={
              <DashboardRoute>
                <QuizSessionPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/results"
            element={
              <DashboardRoute>
                <QuizResultsPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/analytics"
            element={
              <DashboardRoute>
                <AnalyticsPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/achievements"
            element={
              <DashboardRoute>
                <AchievementsPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/leaderboard"
            element={
              <DashboardRoute>
                <LeaderboardPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/mock-exam"
            element={
              <DashboardRoute>
                <MockExamStartPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/performance"
            element={
              <DashboardRoute>
                <PerformancePage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/exam-readiness"
            element={
              <DashboardRoute>
                <ExamReadinessPage />
              </DashboardRoute>
            }
          />



          <Route
            path="/dashboard/study-plan"
            element={
              <DashboardRoute>
                <StudyPlanPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/study-streak"
            element={
              <DashboardRoute>
                <StudyStreakPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/challenges"
            element={
              <DashboardRoute>
                <ChallengePage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/jobs"
            element={
              <DashboardRoute>
                <JobsPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/resume"
            element={
              <DashboardRoute>
                <ResumeBuilderPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/interview-prep"
            element={
              <DashboardRoute>
                <InterviewPrepPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/subjects"
            element={
              <DashboardRoute>
                <SubjectsPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/subjects/:id"
            element={
              <DashboardRoute>
                <SubjectDetailPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/topics/:id"
            element={
              <DashboardRoute>
                <TopicDetailPage />
              </DashboardRoute>
            }
          />

          <Route
            path="/dashboard/settings"
            element={
              <DashboardRoute>
                <ProfileSettingsPage />
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
