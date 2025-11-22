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
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/subjects"
          element={
            <ProtectedRoute>
              <SubjectsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/subjects/:id"
          element={
            <ProtectedRoute>
              <SubjectDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/topics/:id"
          element={
            <ProtectedRoute>
              <TopicDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/quiz"
          element={
            <ProtectedRoute>
              <QuizSetupPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/quiz-session"
          element={
            <ProtectedRoute>
              <QuizSessionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/results"
          element={
            <ProtectedRoute>
              <QuizResultsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/mock-exam"
          element={
            <ProtectedRoute>
              <MockExamStartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <ProfileSettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/study-streak"
          element={
            <ProtectedRoute>
              <StudyStreakPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/achievements"
          element={
            <ProtectedRoute>
              <AchievementsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/challenges"
          element={
            <ProtectedRoute>
              <ChallengePage />
            </ProtectedRoute>
          }
        />



        <Route
          path="/dashboard/exam-readiness"
          element={
            <ProtectedRoute>
              <ExamReadinessPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/study-plan"
          element={
            <ProtectedRoute>
              <StudyPlanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/performance"
          element={
            <ProtectedRoute>
              <PerformancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor"
          element={
            <ProtectedRoute>
              <InstructorDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/tickets"
          element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/inbox"
          element={
            <ProtectedRoute>
              <TicketInboxPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/jobs"
          element={
            <ProtectedRoute>
              <JobBoardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/resume"
          element={
            <ProtectedRoute>
              <ResumeBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/interview"
          element={
            <ProtectedRoute>
              <InterviewPrepPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/question-bank"
          element={
            <ProtectedRoute requireAdmin>
              <QuestionBankPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/review-queue"
          element={
            <ProtectedRoute requireAdmin>
              <ReviewQueuePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/files"
          element={
            <ProtectedRoute requireAdmin>
              <FileManagementPage />
            </ProtectedRoute>
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
