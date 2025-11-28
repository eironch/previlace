import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTopicStore } from "@/store/topicStore";
import { useAuthStore } from "@/store/authStore";
import useExamStore from "@/store/examStore";
import learningService from "@/services/learningService";
import { ChevronLeft, BookOpen, Play, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
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

  // ... (rest of the render logic)

  return (
    <div className="min-h-screen bg-white">
      {/* ... (header) ... */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg border border-gray-300 bg-white p-6">
          {/* ... (topic header) ... */}

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
            {/* ... */}
          </button>
        </div>

        {contentError ? (
          <div className="rounded-lg border border-gray-300 bg-white p-8 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-gray-600">{contentError}</p>
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
