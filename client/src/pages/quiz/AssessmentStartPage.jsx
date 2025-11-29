import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import useExamStore from "@/store/examStore";
import { Target, Clock, BookOpen, ChevronLeft } from "lucide-react";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

function AssessmentStartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { startQuizAttempt, loading, error, currentSession } = useExamStore();

  useEffect(() => {
    async function initiateAssessment() {
      const examLevel = user?.examType || "Professional";
      // Start a quiz session with mode 'assessment'
      await startQuizAttempt({
        mode: "assessment",
        examLevel,
        questionCount: 50, // Standard pre-assessment size
        timeLimit: 3600, // 1 hour
        title: "Pre-Assessment",
        currentWeekNumber: 1
      });
    }

    initiateAssessment();
  }, [startQuizAttempt, user]);

  useEffect(() => {
    if (currentSession && !loading) {
      navigate("/dashboard/quiz-session");
    }
  }, [currentSession, loading, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-30 border-b border-gray-300 bg-white">
          <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-black"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        </header>
        <div className="flex h-[calc(100vh-73px)] items-center justify-center">
          <div className="mx-4 max-w-md text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-200">
                <Target className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Failed to Start Assessment
            </h2>
            <p className="mb-6 text-gray-600">{error}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
              <Target className="h-10 w-10 text-black" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Preparing Pre-Assessment
          </h1>
          <p className="text-gray-600">
            Setting up your {user?.examType || "Professional"} level assessment
          </p>
        </div>

        <div className="space-y-3 rounded-lg border border-gray-300 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
              <BookOpen className="h-5 w-5 text-gray-900" />
            </div>
            <div className="flex-1">
              <SkeletonLoader variant="text" className="mb-2 w-24" />
              <SkeletonLoader variant="text" className="w-32" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
              <Clock className="h-5 w-5 text-gray-900" />
            </div>
            <div className="flex-1">
              <SkeletonLoader variant="text" className="mb-2 w-24" />
              <SkeletonLoader variant="text" className="w-32" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
              <Target className="h-5 w-5 text-gray-900" />
            </div>
            <div className="flex-1">
              <SkeletonLoader variant="text" className="mb-2 w-24" />
              <SkeletonLoader variant="text" className="w-32" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-2 inline-block h-2 w-48 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-2/3 animate-pulse bg-black"></div>
          </div>
          <p className="text-sm text-gray-500">Loading questions...</p>
        </div>
      </div>
    </div>
  );
}

export default AssessmentStartPage;
