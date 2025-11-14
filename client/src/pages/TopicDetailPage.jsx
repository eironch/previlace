import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTopicStore } from "@/store/topicStore";
import { useAuthStore } from "@/store/authStore";
import learningService from "@/services/learningService";
import { ArrowLeft, BookOpen, Play, CheckCircle, AlertCircle, LogOut } from "lucide-react";

function TopicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTopic, loading: topicLoading, fetchTopicById } = useTopicStore();
  const { user, logout } = useAuthStore();
  const [learningContent, setLearningContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    fetchTopicById(id);
    loadLearningContent();
  }, [id, fetchTopicById]);

  async function loadLearningContent() {
    try {
      setContentLoading(true);
      const response = await learningService.fetchLearningContent(id);
      if (response.success) {
        setLearningContent(response.data);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Load learning content error:", error);
      }
    } finally {
      setContentLoading(false);
    }
  }

  async function handleQuizMe() {
    try {
      const response = await learningService.startTopicQuiz(
        id,
        user?.examLevel,
        10
      );

      if (response.success) {
        navigate("/dashboard/quiz-session", {
          state: { session: response.data },
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Start topic quiz error:", error);
      }
    }
  }

  async function handleLogout() {
    await logout();
  }

  if (topicLoading || contentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (!currentTopic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-600">Topic not found</p>
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
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-black"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-black">{currentTopic.name}</h1>
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
              <BookOpen className="h-8 w-8 text-gray-900" />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {currentTopic.name}
                </h2>
                {currentTopic.progress && currentTopic.progress.isCompleted && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
              <p className="text-gray-600">{currentTopic.description}</p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-900">
              {currentTopic.difficulty}
            </span>
            <span className="text-sm text-gray-600">
              {currentTopic.estimatedMinutes || 30} minutes
            </span>
            {currentTopic.progress && (
              <span className="text-sm font-semibold text-gray-900">
                Best Score: {Math.round(currentTopic.progress.bestScore || 0)}%
              </span>
            )}
          </div>

          <button
            onClick={handleQuizMe}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
          >
            <div className="flex items-center justify-center gap-2">
              <Play className="h-5 w-5" />
              <span>Quiz Me</span>
            </div>
          </button>
        </div>

        {learningContent ? (
          <div className="space-y-8">
            {learningContent.content.introduction && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Introduction
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {learningContent.content.introduction}
                </div>
              </div>
            )}

            {learningContent.content.sections &&
              learningContent.content.sections.length > 0 && (
                <div className="space-y-4">
                  {learningContent.content.sections
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((section, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-200 bg-white p-6"
                      >
                        <h4 className="mb-3 text-xl font-bold text-gray-900">
                          {section.title}
                        </h4>
                        <div className="prose prose-sm max-w-none text-gray-700">
                          {section.content}
                        </div>
                      </div>
                    ))}
                </div>
              )}

            {learningContent.content.keyPoints &&
              learningContent.content.keyPoints.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h4 className="mb-4 text-xl font-bold text-gray-900">
                    Key Points
                  </h4>
                  <ul className="space-y-2">
                    {learningContent.content.keyPoints.map((point, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-gray-700"
                      >
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {learningContent.content.examples &&
              learningContent.content.examples.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h4 className="mb-4 text-xl font-bold text-gray-900">
                    Examples
                  </h4>
                  <div className="space-y-4">
                    {learningContent.content.examples.map((example, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-gray-50 p-4"
                      >
                        <h5 className="mb-2 font-semibold text-gray-900">
                          {example.title}
                        </h5>
                        <p className="text-gray-700">{example.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {learningContent.commonMistakes &&
              learningContent.commonMistakes.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h4 className="mb-4 text-xl font-bold text-gray-900">
                    Common Mistakes
                  </h4>
                  <ul className="space-y-2">
                    {learningContent.commonMistakes.map((mistake, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-gray-700"
                      >
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {learningContent.tips && learningContent.tips.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h4 className="mb-4 text-xl font-bold text-gray-900">
                  Tips
                </h4>
                <ul className="space-y-2">
                  {learningContent.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">
              No learning content available for this topic yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default TopicDetailPage;
