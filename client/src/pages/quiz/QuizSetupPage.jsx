import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Play, Clock } from "lucide-react";
import useExamStore from "@/store/examStore";
import useAuthStore from "@/store/authStore";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

function QuizSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { startQuizSession, loading } = useExamStore();
  
  const [mode, setMode] = useState("practice");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("");
  const [error, setError] = useState("");

  const examLevel = user?.examType || "Professional";

  async function handleStartQuiz() {
    if (questionCount < 5 || questionCount > 50) {
      setError("Question count must be between 5 and 50");
      return;
    }

    setError("");

    const config = {
      mode,
      examLevel,
      questionCount: parseInt(questionCount),
      difficulty,
      categories: [],
      title: `${mode === "practice" ? "Practice" : "Timed Practice"} Quiz`,
    };

    try {
      await startQuizSession(config);
      navigate("/dashboard/quiz-session");
    } catch (err) {
      setError(err.message || "Failed to start quiz");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <SkeletonLoader variant="title" className="mb-6" />
          <div className="space-y-4">
            <SkeletonLoader className="h-32" />
            <SkeletonLoader className="h-32" />
            <SkeletonLoader className="h-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-300 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Start Practice Quiz</h1>
          <p className="mt-2 text-gray-600">Configure your quiz settings</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-900">
              Quiz Mode
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setMode("practice")}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  mode === "practice"
                    ? "border-black bg-gray-50"
                    : "border-gray-300 hover:border-gray-300"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    <span className="font-semibold text-gray-900">Practice</span>
                  </div>
                  {mode === "practice" && (
                    <div className="h-5 w-5 rounded-full border-2 border-black bg-black" />
                  )}
                  {mode !== "practice" && (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Learn at your own pace with immediate feedback
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>No time limit</span>
                  <span>Instant feedback</span>
                </div>
              </button>

              <button
                onClick={() => setMode("timed")}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  mode === "timed"
                    ? "border-black bg-gray-50"
                    : "border-gray-300 hover:border-gray-300"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold text-gray-900">Timed Practice</span>
                  </div>
                  {mode === "timed" && (
                    <div className="h-5 w-5 rounded-full border-2 border-black bg-black" />
                  )}
                  {mode !== "timed" && (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Simulate test conditions with countdown timer
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>Time limit</span>
                  <span>Results at end</span>
                </div>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Exam Level
                </label>
                <div className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900">
                  {examLevel}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Set in your profile settings
                </p>
              </div>

              <div>
                <label
                  htmlFor="questionCount"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Number of Questions
                </label>
                <input
                  id="questionCount"
                  type="number"
                  min="5"
                  max="50"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <p className="mt-1 text-xs text-gray-500">Between 5 and 50</p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Difficulty Level
            </label>
            <div className="grid gap-2">
              {[
                { value: "", label: "Mixed", desc: "All difficulty levels" },
                { value: "Beginner", label: "Beginner", desc: "Easier questions" },
                { value: "Intermediate", label: "Intermediate", desc: "Medium difficulty" },
                { value: "Advanced", label: "Advanced", desc: "Challenging questions" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDifficulty(option.value)}
                  className={`flex items-center justify-between rounded-lg border-2 p-3 text-left transition-all ${
                    difficulty === option.value
                      ? "border-black bg-gray-50"
                      : "border-gray-300 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        difficulty === option.value
                          ? "border-black bg-black"
                          : "border-gray-300"
                      }`}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-600">{option.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:flex-initial sm:px-8"
            >
              Cancel
            </button>
            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 sm:px-12"
            >
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {loading ? "Starting..." : "Start Quiz"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default QuizSetupPage;
