import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
  Home,
  BarChart3,
  BookOpen,
  AlertCircle,
  Download,
} from "lucide-react";
import useExamStore from "@/store/examStore";
import StandardHeader from "@/components/ui/StandardHeader";
import apiClient from "@/services/apiClient";

function QuizResultsPage() {
  const navigate = useNavigate();
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [exportingPdf, setExportingPdf] = useState(false);

  const { currentResult, resetSession } = useExamStore();

  useEffect(() => {
    if (!currentResult) {
      navigate("/dashboard/quiz");
    }
  }, [currentResult, navigate]);

  function handleReturnHome() {
    resetSession();
    navigate("/dashboard");
  }

  function handleTakeAnother() {
    resetSession();
    navigate("/dashboard/quiz");
  }

  function handleViewAnalytics() {
    navigate("/dashboard/analytics");
  }

  async function handleExportPdf() {
    if (!currentResult?.sessionId) return;

    setExportingPdf(true);
    try {
      const response = await apiClient.post(
        `/exam/${currentResult.sessionId}/export-pdf`,
        {},
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quiz-results-${currentResult.sessionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to export PDF:", error);
      }
    } finally {
      setExportingPdf(false);
    }
  }

  function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  function getScoreColor(percentage) {
    if (percentage >= 85) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  function getScoreBackground(percentage) {
    if (percentage >= 85) return "bg-green-50 border-green-200";
    if (percentage >= 70) return "bg-blue-50 border-blue-200";
    if (percentage >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  }

  function getPerformanceMessage(percentage) {
    if (percentage >= 85)
      return "Excellent performance! You're ready for the exam.";
    if (percentage >= 70)
      return "Good job! Keep practicing to improve further.";
    if (percentage >= 60) return "Fair performance. Focus on weak areas.";
    return "More practice needed. Review the topics you struggled with.";
  }

  if (!currentResult) {
    return (
      <div className="min-h-screen bg-white">
        <StandardHeader title="Quiz Results" showBack={true} />
        <div className="flex h-[calc(100vh-73px)] items-center justify-center">
          <div>
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            <p className="text-center text-sm text-gray-600">
              Loading results...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    score = {},
    timing = {},
    analytics = {},
    answers = [],
    title = "",
    mode = "practice",
  } = currentResult || {};
  const averageTimePerQuestion =
    score.total > 0 ? timing.totalTimeSpent / score.total : 0;

  const topicPerformance = analytics.topicPerformance
    ? Array.from(analytics.topicPerformance.entries())
    : [];
  const weakTopics = topicPerformance
    .filter(([, perf]) => perf.percentage < 70)
    .map(([topic]) => topic);
  const hasWeakAreas = weakTopics.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <StandardHeader title="Quiz Results" showBack={true} />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <Trophy className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Quiz Complete!
          </h1>
          <p className="text-gray-600">{title}</p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div
            className={`rounded-lg border p-6 text-center ${getScoreBackground(score.percentage)}`}
          >
            <div className="mb-2 flex items-center justify-center">
              <Target
                className={`h-8 w-8 ${getScoreColor(score.percentage)}`}
              />
            </div>
            <h3 className="mb-1 text-2xl font-bold text-gray-900">
              {score.percentage}%
            </h3>
            <p className="text-sm text-gray-600">Overall Score</p>
            <p className="mt-1 text-xs text-gray-500">
              {score.correct} of {score.total} correct
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
            <div className="mb-2 flex items-center justify-center">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mb-1 text-2xl font-bold text-gray-900">
              {formatTime(timing.totalTimeSpent)}
            </h3>
            <p className="text-sm text-gray-600">Total Time</p>
            <p className="mt-1 text-xs text-gray-500">
              ~{Math.round(averageTimePerQuestion / 1000)}s per question
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
            <div className="mb-2 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="mb-1 text-2xl font-bold text-gray-900">
              {mode === "mock"
                ? "Mock"
                : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </h3>
            <p className="text-sm text-gray-600">Quiz Mode</p>
            <p className="mt-1 text-xs text-gray-500">
              {timing.startedAt
                ? new Date(timing.startedAt).toLocaleDateString()
                : "Today"}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Performance Summary
            </h3>
            <p className="text-gray-600">
              {getPerformanceMessage(score.percentage)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-green-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">
                  Correct Answers
                </span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {score.correct}
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">
                  Incorrect Answers
                </span>
              </div>
              <p className="text-2xl font-bold text-red-700">
                {score.incorrect}
              </p>
            </div>
          </div>
        </div>

        {hasWeakAreas && (
          <div className="mb-6 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-bold text-yellow-900">
                Areas for Review
              </h3>
            </div>
            <p className="mb-4 text-sm text-yellow-800">
              Based on your performance, we recommend reviewing these topics:
            </p>
            <div className="space-y-2">
              {weakTopics.map((topic) => {
                const performance = analytics.topicPerformance.get(topic);
                return (
                  <div
                    key={topic}
                    className="flex items-center justify-between rounded-lg bg-white p-3"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{topic}</span>
                      <p className="text-sm text-gray-600">
                        {performance.correct} of {performance.total} correct (
                        {performance.percentage}%)
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        resetSession();
                        navigate("/dashboard/subjects");
                      }}
                      className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                    >
                      Review
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {topicPerformance.length > 0 && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Topic Performance
            </h3>
            <div className="space-y-3">
              {topicPerformance.map(([topic, performance]) => (
                <div
                  key={topic}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div>
                    <span className="font-medium text-gray-900">{topic}</span>
                    <p className="text-sm text-gray-600">
                      {performance.correct} of {performance.total} correct
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${
                          performance.percentage >= 70
                            ? "bg-green-500"
                            : performance.percentage >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${performance.percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm font-medium text-gray-900">
                      {performance.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics && analytics.categoryPerformance && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Category Performance
            </h3>
            <div className="space-y-3">
              {Array.from(analytics.categoryPerformance.entries()).map(
                ([category, performance]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {category}
                      </span>
                      <p className="text-sm text-gray-600">
                        {performance.correct} of {performance.total} correct
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${performance.percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-medium text-gray-900">
                        {performance.percentage}%
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Answer Review</h3>
            <button
              onClick={() => setShowAnswerReview(!showAnswerReview)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Eye className="h-4 w-4" />
              {showAnswerReview ? "Hide" : "Show"} Answers
            </button>
          </div>

          {showAnswerReview && answers && answers.length > 0 ? (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-4">
                {answers.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedQuestionIndex(index)}
                    className={`h-8 w-8 flex-shrink-0 rounded text-xs font-medium transition-all ${
                      selectedQuestionIndex === index
                        ? "bg-blue-600 text-white"
                        : answer?.isCorrect
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {answers[selectedQuestionIndex] && (
                <QuestionReviewCard
                  question={answers[selectedQuestionIndex]}
                  questionNumber={selectedQuestionIndex + 1}
                />
              )}
            </div>
          ) : showAnswerReview ? (
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              <p className="text-gray-600">No answers available to review.</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleReturnHome}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </button>

          <button
            onClick={handleViewAnalytics}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 hover:bg-gray-50"
          >
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          >
            {exportingPdf ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export PDF
              </>
            )}
          </button>

          <button
            onClick={handleTakeAnother}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            <RotateCcw className="h-4 w-4" />
            Take Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionReviewCard({ question, questionNumber }) {
  if (!question) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-gray-600">Question data unavailable.</p>
      </div>
    );
  }

  const isCorrect = question?.isCorrect || false;
  const borderColor = isCorrect ? "border-green-200" : "border-red-200";
  const bgColor = isCorrect ? "bg-green-50" : "bg-red-50";

  return (
    <div className={`rounded-lg border p-4 ${borderColor} ${bgColor}`}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            Question {questionNumber}
          </span>
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </div>

        <span
          className={`rounded px-2 py-1 text-xs font-medium ${
            isCorrect
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isCorrect ? "Correct" : "Incorrect"}
        </span>
      </div>

      {question?.question && (
        <div className="mb-4">
          <div className="mb-2 text-gray-900">
            {question.question.questionText || "No question text available"}
          </div>

          {question.question.questionMath && (
            <div className="rounded border border-gray-300 bg-gray-100 p-3 font-mono text-sm text-gray-800">
              {question.question.questionMath}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Your Answer:
          </span>
          <span
            className={`rounded px-2 py-1 text-sm font-medium ${
              isCorrect
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {question?.userAnswer || "No answer provided"}
          </span>
        </div>

        {!isCorrect && question?.correctAnswer && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Correct Answer:
            </span>
            <span className="rounded bg-green-100 px-2 py-1 text-sm font-medium text-green-700">
              {question.correctAnswer}
            </span>
          </div>
        )}
      </div>

      {question?.question?.explanation && (
        <div className="mt-4 rounded border border-blue-200 bg-blue-50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Explanation
            </span>
          </div>
          <div className="text-sm text-gray-800">
            {question.question.explanation}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizResultsPage;
