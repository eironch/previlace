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
  BookOpen
} from "lucide-react";
import useExamStore from "../../store/examStore";
import useAnalyticsStore from "../../store/analyticsStore";

function QuizResults() {
  const navigate = useNavigate();
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  
  const { currentResult, resetSession } = useExamStore();
  const { updateAnalytics } = useAnalyticsStore();

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

  function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
    if (percentage >= 85) return "Excellent performance! You're ready for the exam.";
    if (percentage >= 70) return "Good job! Keep practicing to improve further.";
    if (percentage >= 60) return "Fair performance. Focus on weak areas.";
    return "More practice needed. Review the topics you struggled with.";
  }

  if (!currentResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const { score, timing, analytics, answers, title, mode } = currentResult;
  const averageTimePerQuestion = timing.totalTimeSpent / score.total;
  const correctAnswers = answers.filter(answer => answer.isCorrect);
  const incorrectAnswers = answers.filter(answer => !answer.isCorrect);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <Trophy className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
          <p className="text-gray-600">{title}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className={`rounded-lg border p-6 text-center ${getScoreBackground(score.percentage)}`}>
            <div className="flex items-center justify-center mb-2">
              <Target className={`h-8 w-8 ${getScoreColor(score.percentage)}`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {score.percentage}%
            </h3>
            <p className="text-sm text-gray-600">Overall Score</p>
            <p className="text-xs text-gray-500 mt-1">
              {score.correct} of {score.total} correct
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatTime(timing.totalTimeSpent)}
            </h3>
            <p className="text-sm text-gray-600">Total Time</p>
            <p className="text-xs text-gray-500 mt-1">
              ~{Math.round(averageTimePerQuestion / 1000)}s per question
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === "mock" ? "Mock" : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </h3>
            <p className="text-sm text-gray-600">Quiz Mode</p>
            <p className="text-xs text-gray-500 mt-1">
              {timing.startedAt ? new Date(timing.startedAt).toLocaleDateString() : "Today"}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Performance Summary</h3>
            <p className="text-gray-600">{getPerformanceMessage(score.percentage)}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Correct Answers</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{score.correct}</p>
            </div>

            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Incorrect Answers</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{score.incorrect}</p>
            </div>
          </div>
        </div>

        {analytics && (
          <div className="rounded-lg bg-white p-6 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Category Performance</h3>
            <div className="space-y-3">
              {Array.from(analytics.categoryPerformance || new Map()).map(([category, performance]) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <span className="font-medium text-gray-900">{category}</span>
                    <p className="text-sm text-gray-600">
                      {performance.correct} of {performance.total} correct
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${performance.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                      {performance.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg bg-white p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Answer Review</h3>
            <button
              onClick={() => setShowAnswerReview(!showAnswerReview)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Eye className="h-4 w-4" />
              {showAnswerReview ? "Hide" : "Show"} Answers
            </button>
          </div>

          {showAnswerReview && (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {answers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedQuestionIndex(index)}
                    className={`flex-shrink-0 h-8 w-8 rounded text-xs font-medium transition-all ${
                      selectedQuestionIndex === index
                        ? "bg-blue-600 text-white"
                        : answers[index].isCorrect
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <QuestionReviewCard 
                question={answers[selectedQuestionIndex]}
                questionNumber={selectedQuestionIndex + 1}
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleReturnHome}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </button>

          <button
            onClick={handleViewAnalytics}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </button>

          <button
            onClick={handleTakeAnother}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
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
  if (!question) return null;

  const isCorrect = question.isCorrect;
  const borderColor = isCorrect ? "border-green-200" : "border-red-200";
  const bgColor = isCorrect ? "bg-green-50" : "bg-red-50";

  return (
    <div className={`rounded-lg border p-4 ${borderColor} ${bgColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">Question {questionNumber}</span>
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </div>
        
        <span className={`text-xs px-2 py-1 rounded ${
          isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {isCorrect ? "Correct" : "Incorrect"}
        </span>
      </div>

      {question.question && (
        <div className="mb-4">
          <div 
            className="text-gray-900 mb-2"
            dangerouslySetInnerHTML={{ __html: question.question.questionText }}
          />
          
          {question.question.questionMath && (
            <div 
              className="p-3 bg-white rounded border font-mono text-sm"
              dangerouslySetInnerHTML={{ __html: question.question.questionMath }}
            />
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Your Answer:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {question.userAnswer}
          </span>
        </div>

        {!isCorrect && question.correctAnswer && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Correct Answer:</span>
            <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-700">
              {question.correctAnswer}
            </span>
          </div>
        )}
      </div>

      {question.question?.explanation && (
        <div className="mt-4 p-3 bg-white rounded border">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Explanation</span>
          </div>
          <div 
            className="text-sm text-gray-700"
            dangerouslySetInnerHTML={{ __html: question.question.explanation }}
          />
        </div>
      )}
    </div>
  );
}

export default QuizResults;