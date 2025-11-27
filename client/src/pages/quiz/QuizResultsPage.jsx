import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Target, 
  RotateCcw, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp,
  Award,
  BarChart3
} from "lucide-react";
import useExamStore from "@/store/examStore";
import StandardHeader from "@/components/ui/StandardHeader";

function QuizResultsPage() {
  const navigate = useNavigate();
  const sessionResult = useExamStore((state) => state.sessionResult);
  const resetSession = useExamStore((state) => state.resetSession);
  const currentSession = useExamStore((state) => state.currentSession);

  // Redirect if no result
  useEffect(() => {
    if (!sessionResult && !currentSession) {
      navigate("/dashboard");
    }
  }, [sessionResult, currentSession, navigate]);

  if (!sessionResult) {
    return null; // Or a loading spinner
  }

  const { score, timing, analytics, answers } = sessionResult;
  const [expandedQuestions, setExpandedQuestions] = React.useState({});

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleRetake = () => {
    resetSession();
    // Navigate back to setup or restart? 
    // Usually resetSession clears everything. 
    // If we want to retake the SAME quiz, we might need logic for that.
    // For now, go back to dashboard or quiz setup.
    navigate("/dashboard/quiz");
  };

  const handleDashboard = () => {
    resetSession();
    navigate("/dashboard");
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 80) return "Excellent work!";
    if (percentage >= 60) return "Good job, keep practicing!";
    return "Keep studying, you'll get there!";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader title="Quiz Results" subtitle="Review your performance" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Score Summary Card */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-300">
          <div className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-gray-300 bg-white">
                <div className="text-center">
                  <span className={`block text-3xl font-bold ${getScoreColor(score.percentage)}`}>
                    {score.percentage}%
                  </span>
                  <span className="text-xs text-gray-500 uppercase font-medium tracking-wide">Score</span>
                </div>
                <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="48"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className={getScoreColor(score.percentage)}
                    strokeWidth="4"
                    strokeDasharray={`${score.percentage * 3.01} 301`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="48"
                    cx="50"
                    cy="50"
                  />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900">{getScoreMessage(score.percentage)}</h2>
            <p className="mt-2 text-gray-600">
              You answered {score.correct} out of {score.total} questions correctly.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </button>
              <button
                onClick={handleDashboard}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-300 bg-gray-50 sm:grid-cols-4">
            <div className="p-6 text-center">
              <div className="mb-2 flex justify-center text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{score.correct}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correct</div>
            </div>
            <div className="p-6 text-center">
              <div className="mb-2 flex justify-center text-red-600">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{score.incorrect}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Incorrect</div>
            </div>
            <div className="p-6 text-center">
              <div className="mb-2 flex justify-center text-blue-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatTime(timing.totalTimeSpent)}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time Taken</div>
            </div>
            <div className="p-6 text-center">
              <div className="mb-2 flex justify-center text-purple-600">
                <Target className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{Math.round((score.correct / score.total) * 100)}%</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {(analytics?.strongAreas?.length > 0 || analytics?.weakAreas?.length > 0) && (
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {analytics.strongAreas?.length > 0 && (
              <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <h3 className="font-bold text-gray-900">Strong Areas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analytics.strongAreas.map((area, i) => (
                    <span key={i} className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 border border-green-200">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {analytics.weakAreas?.length > 0 && (
              <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-bold text-gray-900">Areas to Improve</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analytics.weakAreas.map((area, i) => (
                    <span key={i} className="rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700 border border-yellow-200">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Review */}
        <div className="rounded-xl border border-gray-300 bg-white shadow-sm">
          <div className="border-b border-gray-300 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900">Detailed Review</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {answers.map((answer, index) => (
              <div key={index} className="p-6 transition-colors hover:bg-gray-50">
                <div 
                  className="flex cursor-pointer items-start justify-between gap-4"
                  onClick={() => toggleQuestion(index)}
                >
                  <div className="flex gap-4">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold text-white ${answer.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{answer.question?.questionText}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className={`font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          Your Answer: {answer.userAnswer}
                        </span>
                        {!answer.isCorrect && (
                          <span className="font-medium text-green-600">
                            Correct Answer: {answer.correctAnswer}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400">
                    {expandedQuestions[index] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>

                {expandedQuestions[index] && (
                  <div className="mt-4 pl-12">
                    <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                      <p className="font-semibold text-gray-900 mb-1">Explanation:</p>
                      <p>{answer.question?.explanation || "No explanation available."}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

export default QuizResultsPage;
