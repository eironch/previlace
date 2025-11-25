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
import QuizSessionPage from "./pages/quiz/QuizSessionPage";
import QuizResultsPage from "./pages/quiz/QuizResultsPage";
import MockExamStartPage from "./pages/quiz/MockExamStartPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfileSettingsPage from "./pages/settings/ProfileSettingsPage";
import StudyStreakPage from "./pages/StudyStreakPage";
import AchievementsPage from "./pages/AchievementsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ChallengePage from "./pages/ChallengePage";

import ExamReadinessPage from "./pages/ExamReadinessPage";
import StudyPlanPage from "./pages/StudyPlanPage";
import PerformancePage from "./pages/PerformancePage";
import QuestionBankPage from "./pages/admin/QuestionBankPage";
import ReviewQueuePage from "./pages/admin/ReviewQueuePage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import FileManagementPage from "./pages/admin/FileManagementPage";
import InstructorDashboardPage from "./pages/InstructorDashboardPage";
import MyTicketsPage from "./pages/student/MyTicketsPage";
import TicketInboxPage from "./pages/instructor/TicketInboxPage";
import NotificationsPage from "./pages/NotificationsPage";
import JobBoardPage from "./pages/career/JobBoardPage";
import ResumeBuilderPage from "./pages/career/ResumeBuilderPage";
import InterviewPrepPage from "./pages/career/InterviewPrepPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import AuthModal from "./components/auth/AuthModal";
import { ScrollToTop } from "./components/ScrollToTop";
import DevTools from "./components/ui/DevTools";
import { useAppStore } from "./store/appStore";

import DashboardLayout from "./components/layout/DashboardLayout";

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
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
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
          element={
            isAuthenticated ? (
              user?.isProfileComplete ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : (
              <LandingPage />
            )
          }
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
          path="/dashboard/mock-exam"
          element={
            <DashboardRoute>
              <MockExamStartPage />
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
          path="/dashboard/study-streak"
          element={
            <DashboardRoute>
              <StudyStreakPage />
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
          path="/dashboard/study-plan"
          element={
            <DashboardRoute>
              <StudyPlanPage />
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
          path="/admin"
          element={
            <DashboardRoute requireAdmin>
              <AdminPage />
            </DashboardRoute>
          }
        />

        <Route
          path="/instructor"
          element={
            <DashboardRoute>
              <InstructorDashboardPage />
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
          path="/dashboard/inbox"
          element={
            <DashboardRoute>
              <TicketInboxPage />
            </DashboardRoute>
          }
        />

        <Route
          path="/dashboard/notifications"
          element={
            <DashboardRoute>
              <NotificationsPage />
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
          path="/dashboard/resume"
          element={
            <DashboardRoute>
              <ResumeBuilderPage />
            </DashboardRoute>
          }
        />

        <Route
          path="/dashboard/interview"
          element={
            <DashboardRoute>
              <InterviewPrepPage />
            </DashboardRoute>
          }
        />

        <Route
          path="/admin/question-bank"
          element={
            <DashboardRoute requireAdmin>
              <QuestionBankPage />
            </DashboardRoute>
          }
        />

        <Route
          path="/admin/review-queue"
          element={
            <DashboardRoute requireAdmin>
              <ReviewQueuePage />
            </DashboardRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <DashboardRoute requireAdmin>
              <UserManagementPage />
            </DashboardRoute>
          }
        />

        <Route
          path="/admin/files"
          element={
            <DashboardRoute requireAdmin>
              <FileManagementPage />
            </DashboardRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? user?.isProfileComplete
                    ? "/dashboard"
                    : "/onboarding"
                  : "/"
              }
              replace
            />
          }
        />
      </Routes>
      {showAuthModal && <AuthModal />}
      <DevTools />
    </BrowserRouter>
  );
}

export default App;
