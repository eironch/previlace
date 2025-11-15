import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import useExamStore from "@/store/examStore";
import { Target, Clock, BookOpen, ChevronRight, AlertCircle } from "lucide-react";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

function MockExamStartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { startMockExam, loading, error, currentSession } = useExamStore();

  useEffect(() => {
    async function initiateMockExam() {
      const examLevel = user?.examLevel?.toLowerCase() || "professional";
      await startMockExam(examLevel);
    }

    initiateMockExam();
  }, [startMockExam, user]);

  useEffect(() => {
    if (currentSession && !loading) {
      navigate("/dashboard/quiz-session");
    }
  }, [currentSession, loading, navigate]);

  if (error) {
    const isInsufficientQuestions = error.includes("Insufficient questions");
    const questionMatch = error.match(/Found (\d+) questions/);
    const availableCount = questionMatch ? parseInt(questionMatch[1]) : 0;
    const minRequired = 50;

    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="mx-4 max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            {isInsufficientQuestions ? "Not Enough Questions Available" : "Failed to Start Mock Exam"}
          </h2>
          
          {isInsufficientQuestions ? (
            <div className="space-y-3">
              <p className="text-gray-600">
                The question bank currently has {availableCount} questions, but at least {minRequired} are required to start a mock exam.
              </p>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  This usually happens when the database needs to be seeded with more questions. Please contact your administrator.
                </p>
              </div>
            </div>
          ) : (
            <p className="mb-6 text-gray-600">{error}</p>
          )}

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Target className="h-10 w-10 text-black" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Preparing Mock Exam
          </h1>
          <p className="text-gray-600">
            Setting up your {user?.examLevel || "Professional"} level exam
          </p>
        </div>

        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <BookOpen className="h-5 w-5 text-gray-900" />
            </div>
            <div className="flex-1">
              <SkeletonLoader variant="text" className="mb-2 w-24" />
              <SkeletonLoader variant="text" className="w-32" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Clock className="h-5 w-5 text-gray-900" />
            </div>
            <div className="flex-1">
              <SkeletonLoader variant="text" className="mb-2 w-24" />
              <SkeletonLoader variant="text" className="w-32" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <ChevronRight className="h-5 w-5 text-gray-900" />
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

export default MockExamStartPage;
