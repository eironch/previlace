import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubjectStore } from "@/store/subjectStore";
import { useTopicStore } from "@/store/topicStore";
import { useAuthStore } from "@/store/authStore";
import useExamStore from "@/store/examStore";
import { ChevronLeft, BookOpen, Trophy, Play } from "lucide-react";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

function SubjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSubject, loading: subjectLoading, fetchSubjectById } = useSubjectStore();
  const { topics, loading: topicsLoading, fetchTopicsBySubject } = useTopicStore();
  const { user } = useAuthStore();
  const { startQuizSession, loading: quizLoading } = useExamStore();
  const [quizError, setQuizError] = useState(null);

  useEffect(() => {
    fetchSubjectById(id);
    fetchTopicsBySubject(id);
  }, [id, fetchSubjectById, fetchTopicsBySubject]);

  async function handleTestAllTopics() {
    try {
      setQuizError(null);

      await startQuizSession({
        mode: "subject",
        subjectId: id,
        examLevel: user?.examLevel,
        questionCount: 20,
        timeLimit: 600,
      });

      navigate("/dashboard/quiz-session");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Start subject quiz error:", error);
      }
      setQuizError(error.message || "Failed to start quiz. Please try again.");
    }
  }

  function handleTopicClick(topicId) {
    navigate(`/dashboard/topics/${topicId}`);
  }

  if (subjectLoading || topicsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-300 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <SkeletonLoader variant="circle" className="h-5 w-5" />
                <SkeletonLoader className="h-6 w-48" />
              </div>
              <div className="flex items-center gap-4">
                <SkeletonLoader className="h-4 w-24" />
                <SkeletonLoader variant="button" className="h-10 w-24" />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-lg border border-gray-300 bg-white p-6">
            <div className="mb-4 flex items-center gap-4">
              <SkeletonLoader variant="circle" className="h-16 w-16" />
              <div className="flex-1">
                <SkeletonLoader variant="title" className="mb-2" />
                <SkeletonLoader className="w-3/4" />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <SkeletonLoader variant="card" className="h-20" />
              <SkeletonLoader variant="card" className="h-20" />
              <SkeletonLoader variant="card" className="h-20" />
            </div>
            <SkeletonLoader variant="button" />
          </div>

          <div className="mb-4">
            <SkeletonLoader variant="title" className="mb-2 h-6 w-32" />
            <SkeletonLoader className="w-64" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg border border-gray-300 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <SkeletonLoader className="h-6 w-24" />
                  <SkeletonLoader variant="circle" className="h-6 w-6" />
                </div>
                <SkeletonLoader variant="title" className="mb-2 h-6" />
                <SkeletonLoader className="mb-2" />
                <SkeletonLoader className="w-2/3" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!currentSubject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-600">Subject not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-black"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg border border-gray-300 bg-white p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
              <BookOpen className="h-8 w-8 text-gray-900" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900">
                {currentSubject.name}
              </h2>
              <p className="mt-1 text-gray-600">{currentSubject.description}</p>
            </div>
          </div>

          {currentSubject.progress && (
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-sm text-gray-600">Topics Completed</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {currentSubject.progress.completedTopics || 0}/
                  {currentSubject.totalTopics || 0}
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-sm text-gray-600">Average Score</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {Math.round(currentSubject.progress.averageScore || 0)}%
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-sm text-gray-600">Total Attempts</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {currentSubject.progress.totalAttempts || 0}
                </div>
              </div>
            </div>
          )}

          {quizError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{quizError}</p>
            </div>
          )}

          <button
            onClick={handleTestAllTopics}
            disabled={quizLoading}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center justify-center gap-2">
              {quizLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Starting Quiz...</span>
                </>
              ) : (
                <>
                  <Trophy className="h-5 w-5" />
                  <span>Test All Topics</span>
                </>
              )}
            </div>
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">Topics</h3>
          <p className="mt-1 text-gray-600">
            Choose a topic to learn and practice
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <button
              key={topic._id}
              onClick={() => handleTopicClick(topic._id)}
              className="group overflow-hidden rounded-lg border border-gray-300 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900 transition-colors group-hover:bg-black group-hover:text-white">
                  {topic.difficulty}
                </div>
                {topic.progress && topic.progress.isCompleted && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <h4 className="mb-2 text-lg font-bold text-gray-900">
                {topic.name}
              </h4>
              <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                {topic.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{topic.estimatedMinutes || 30} mins</span>
                {topic.progress && (
                  <span className="font-semibold">
                    Best: {Math.round(topic.progress.bestScore || 0)}%
                  </span>
                )}
              </div>

              {topic.hasLearningContent && (
                <div className="mt-4 flex items-center gap-1 text-xs text-gray-600">
                  <Play className="h-3 w-3" />
                  <span>Learning content available</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default SubjectDetailPage;
