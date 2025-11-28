import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import LandingPage from "./pages/LandingPage";
import AdminPage from "./pages/AdminPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import SubjectsPage from "./pages/SubjectsPage";
import SubjectDetailPage from "./pages/SubjectDetailPage";
import TopicDetailPage from "./pages/TopicDetailPage";
import QuizSetupPage from "./pages/quiz/QuizSetupPage";
import QuizAttemptPage from "./pages/quiz/QuizAttemptPage";
import QuizResultsPage from "./pages/quiz/QuizResultsPage";
import MockExamStartPage from "./pages/quiz/MockExamStartPage";
import AssessmentStartPage from "./pages/quiz/AssessmentStartPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfileSettingsPage from "./pages/settings/ProfileSettingsPage";
import AchievementsPage from "./pages/AchievementsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ChallengePage from "./pages/ChallengePage";

import ExamReadinessPage from "./pages/ExamReadinessPage";

import InstructorDashboardPage from "./pages/InstructorDashboardPage";
import MyTicketsPage from "./pages/student/MyTicketsPage";
import TicketInboxPage from "./pages/instructor/TicketInboxPage";
import InstructorClassesPage from "./pages/instructor/InstructorClassesPage";
import InstructorAvailabilityPage from "./pages/instructor/InstructorAvailabilityPage";
import NotificationsPage from "./pages/NotificationsPage";
import JobBoardPage from "./pages/career/JobBoardPage";
import ResumePage from "./pages/career/ResumePage";
import InterviewPrepPage from "./pages/career/InterviewPrepPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import AuthModal from "./components/auth/AuthModal";
import { ScrollToTop } from "./components/ScrollToTop";
import DevTools from "./components/ui/DevTools";
import { useAppStore } from "./store/appStore";

import DashboardLayout from "./components/layout/DashboardLayout";
import NotFoundPage from "./pages/NotFoundPage";

function ProtectedRoute({ children, requireAdmin = false, requireProfileComplete = true }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireProfileComplete && !user?.isProfileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requireAdmin && user?.role !== "admin" && user?.role !== "super_admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireAdmin && (user?.role === "admin" || user?.role === "super_admin")) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function DashboardRoute({ children, requireAdmin = false }) {
  return (
    <ProtectedRoute requireAdmin={requireAdmin}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function App() {
  const { isAuthenticated, user, initializeAuth, isInitialized } = useAuthStore();
  const { showAuthModal } = useAppStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={ <LandingPage />}
        />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              user?.isProfileComplete ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <OnboardingPage />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <DashboardRoute>
              <DashboardPage />
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
              <QuizAttemptPage />
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
          path="/dashboard/mock-exam"
          element={
            <DashboardRoute>
              <MockExamStartPage />
            </DashboardRoute>
          }
        />

        <Route
          path="/dashboard/assessment"
          element={
            <DashboardRoute>
              <AssessmentStartPage />
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
          path="/dashboard/settings"
          element={
            <DashboardRoute>
              <ProfileSettingsPage />
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
          path="/dashboard/challenges"
          element={
            <DashboardRoute>
              <ChallengePage />
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
          path="/dashboard/jobs"
          element={
            <DashboardRoute>
              <JobBoardPage />
            </DashboardRoute>
          }
        />

        <Route
          path="/dashboard/tickets"
          element={
            <DashboardRoute>
              <MyTicketsPage />
            </DashboardRoute>
          }
        />



        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/classes"
          element={
            <DashboardRoute>
              <InstructorClassesPage />
            </DashboardRoute>
          }
        />

        <Route
          path="/instructor/availability"
          element={
            <DashboardRoute>
              <InstructorAvailabilityPage />
            </DashboardRoute>
          }
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
      {showAuthModal && <AuthModal />}
      <DevTools />
    </BrowserRouter>
  );
}

export default App;
