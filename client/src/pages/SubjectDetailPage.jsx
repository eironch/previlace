import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubjectStore } from "@/store/subjectStore";
import { useTopicStore } from "@/store/topicStore";
import { useAuthStore } from "@/store/authStore";
import learningService from "@/services/learningService";
import { ArrowLeft, BookOpen, Trophy, Play, LogOut } from "lucide-react";

function SubjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSubject, loading: subjectLoading, fetchSubjectById } = useSubjectStore();
  const { topics, loading: topicsLoading, fetchTopicsBySubject } = useTopicStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchSubjectById(id);
    fetchTopicsBySubject(id);
  }, [id, fetchSubjectById, fetchTopicsBySubject]);

  async function handleTestAllTopics() {
    try {
      const response = await learningService.startSubjectQuiz(
        id,
        user?.examLevel,
        20
      );

      if (response.success) {
        navigate("/dashboard/quiz-session", {
          state: { session: response.data },
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Start subject quiz error:", error);
      }
    }
  }

  function handleTopicClick(topicId) {
    navigate(`/dashboard/topics/${topicId}`);
  }

  async function handleLogout() {
    await logout();
  }

  if (subjectLoading || topicsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard/subjects")}
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-black"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-black">{currentSubject.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
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

          <button
            onClick={handleTestAllTopics}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5" />
              <span>Test All Topics</span>
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
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
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
