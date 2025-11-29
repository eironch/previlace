import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTopicStore } from "@/store/topicStore";
import { useAuthStore } from "@/store/authStore";
import useExamStore from "@/store/examStore";
import learningService from "@/services/learningService";
import { ChevronLeft, BookOpen, Play, CheckCircle, AlertCircle, Eye, EyeOff, Clock } from "lucide-react";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import FileUploadButton from "@/components/files/FileUploadButton";
import FileList from "@/components/files/FileList";

function TopicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTopic, loading: topicLoading, fetchTopicById, toggleTopicPublish } = useTopicStore();
  const { user } = useAuthStore();
  const { startQuizAttempt, loading: quizLoading } = useExamStore();
  const [learningContent, setLearningContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState(null);
  const [quizError, setQuizError] = useState(null);

  const [learningStatus, setLearningStatus] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    fetchTopicById(id);
    loadLearningContent();
    loadLearningStatus();

    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (timeSpent > 5) {
        learningService.trackView(id, timeSpent);
      }
    };
  }, [id, fetchTopicById]);

  async function loadLearningStatus() {
    try {
      const response = await learningService.getLearningStatus(id);
      if (response.success) {
        setLearningStatus(response.data);
      }
    } catch (error) {
      console.error("Failed to load learning status", error);
    }
  }

  async function loadLearningContent() {
    try {
      setContentLoading(true);
      setContentError(null);
      const response = await learningService.fetchLearningContent(id);
      if (response.success) {
        setLearningContent(response.data);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Load learning content error:", error);
      }
      setContentError("Learning content not available for this topic yet");
    } finally {
      setContentLoading(false);
    }
  }

  async function handleQuizMe() {
    try {
      setQuizError(null);

      // Mark as complete if they spent enough time (e.g., > 30s)
      if (timeSpent > 30) {
          await learningService.markLearningComplete(id, timeSpent);
      }

      await startQuizAttempt({
        mode: "topic",
        topicId: id,
        examLevel: user?.examLevel,
        questionCount: 10,
        timeLimit: 600,
      });

      navigate("/dashboard/quiz-session");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Start topic quiz error:", error);
      }
      setQuizError(error.message || "Failed to start quiz. Please try again.");
    }
  }

  // SWR: Only show skeleton if we have NO data (loading is true AND no currentTopic)
  // If we have currentTopic, we show it while fetching updates in background
  // Also show skeleton if we have no topic and no error (initial load)
  if ((topicLoading && !currentTopic) || (!currentTopic && !contentError)) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-40 border-b border-gray-300 bg-white shadow-sm">
          <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SkeletonLoader variant="circle" className="h-10 w-10" />
                <div className="space-y-2">
                  <SkeletonLoader className="h-6 w-48" />
                  <SkeletonLoader className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-lg border border-gray-300 bg-white p-6">
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div className="w-full max-w-2xl">
                  <SkeletonLoader variant="title" className="mb-4 h-8" />
                  <SkeletonLoader className="mb-2" />
                  <SkeletonLoader className="w-3/4" />
                </div>
                <SkeletonLoader className="h-8 w-24 rounded-full" />
              </div>
              
              <div className="mt-6 flex items-center gap-6">
                <SkeletonLoader className="h-5 w-32" />
                <SkeletonLoader className="h-5 w-24 rounded-full" />
              </div>
            </div>

            <SkeletonLoader variant="button" className="mt-8" />
          </div>

          <div className="space-y-6">
            <SkeletonLoader className="h-64 rounded-lg" />
            <SkeletonLoader className="h-48 rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 border-b border-gray-300 bg-white shadow-sm">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50"
                title="Back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentTopic?.name || "Topic Details"}
                </h1>
                <p className="text-sm text-gray-600">
                  {currentTopic?.subject?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Optional: Add progress or other actions here */}
            </div>
          </div>
        </div>
      </div>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg border border-gray-300 bg-white p-6">
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentTopic?.name}</h2>
                <p className="mt-2 text-gray-600">{currentTopic?.description}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {/* Time removed as requested */}
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>{currentTopic?.totalQuestions || 0} Questions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  currentTopic?.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                  currentTopic?.difficulty === 'Advanced' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {currentTopic?.difficulty || 'Intermediate'}
                </span>
              </div>
            </div>
          </div>

          {/* Learning Recommendation Banner */}
          {learningStatus && !learningStatus.hasViewedContent && learningContent && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Recommended: Read First</h4>
                  <p className="text-sm text-yellow-700">
                    We recommend reading the learning content below before taking the quiz to improve your mastery.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ... (rest of the component) ... */}
          
          <button
            onClick={handleQuizMe}
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
                  <CheckCircle className="h-5 w-5" />
                  <span>Start Quiz</span>
                </>
              )}
            </div>
          </button>
        </div>

        {contentError ? (
          <div className="rounded-lg border border-gray-300 bg-white p-8 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-gray-600">{contentError}</p>
          </div>
        ) : contentLoading ? (
          <div className="space-y-6">
            <SkeletonLoader className="h-64 rounded-lg" />
            <SkeletonLoader className="h-48 rounded-lg" />
          </div>
        ) : learningContent ? (
          <div className="space-y-8">
            {learningContent.content.introduction && (
              <div className="rounded-lg border border-gray-300 bg-white p-6">
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
                        className="rounded-lg border border-gray-300 bg-white p-6"
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
                <div className="rounded-lg border border-gray-300 bg-white p-6">
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
                <div className="rounded-lg border border-gray-300 bg-white p-6">
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
                <div className="rounded-lg border border-gray-300 bg-white p-6">
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
              <div className="rounded-lg border border-gray-300 bg-white p-6">
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
          <div className="rounded-lg border border-gray-300 bg-white p-8 text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-gray-600">
              No learning content available for this topic yet.
            </p>
          </div>
        )}
        
        <div className="mt-8 rounded-lg border border-gray-300 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xl font-bold text-gray-900">Resources</h4>
            {(user?.role === "admin" || user?.role === "instructor") && (
              <FileUploadButton 
                relatedType="topic" 
                relatedId={id} 
                onUploadComplete={() => window.location.reload()} 
              />
            )}
          </div>
          <FileList relatedType="topic" relatedId={id} />
        </div>
      </main>
    </div>
  );
}
export default TopicDetailPage;
