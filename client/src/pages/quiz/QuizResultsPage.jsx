import React, { useEffect, useState } from "react";
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
  BarChart3,
  Loader2,
  Eye
} from "lucide-react";
import useExamStore from "@/store/examStore";
import StandardHeader from "@/components/ui/StandardHeader";

function QuizResultsPage() {
  const navigate = useNavigate();
  const currentResult = useExamStore((state) => state.currentResult);
  const resetSession = useExamStore((state) => state.resetSession);
  const currentSession = useExamStore((state) => state.currentSession);
  const fetchQuizReview = useExamStore((state) => state.fetchQuizReview);
  
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingReview, setLoadingReview] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Redirect if no result
  useEffect(() => {
    if (!currentResult && !currentSession) {
      navigate("/dashboard");
    } else if (currentResult) {
      setLoading(false);
    }
  }, [currentResult, currentSession, navigate]);

  if (!currentResult && !loading) {
    return null; 
  }

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleRetake = () => {
    resetSession();
    navigate("/dashboard/quiz");
  };

  const handleDashboard = () => {
    resetSession();
    navigate("/dashboard");
  };

  const handleShowReview = async () => {
    if (currentResult.answers && currentResult.answers.length > 0) {
      setShowReview(true);
      return;
    }

    setLoadingReview(true);
    await fetchQuizReview(currentResult.sessionId);
    setLoadingReview(false);
    setShowReview(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StandardHeader title="Quiz Results" subtitle="Review your performance" />
        <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
          {/* Score Skeleton */}
          <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-300 p-8">
            <div className="flex flex-col items-center">
              <div className="h-32 w-32 rounded-full bg-gray-200 animate-pulse mb-6"></div>
              <div className="h-8 w-64 bg-gray-200 animate-pulse mb-2 rounded"></div>
              <div className="h-4 w-48 bg-gray-200 animate-pulse rounded"></div>
              <div className="mt-8 flex gap-4">
                <div className="h-12 w-32 rounded-lg bg-gray-200 animate-pulse"></div>
                <div className="h-12 w-40 rounded-lg bg-gray-200 animate-pulse"></div>
              </div>
            </div>
            {/* Stats Grid Skeleton */}
            <div className="mt-8 grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-300 pt-8 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center p-4">
                  <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse mb-2"></div>
                  <div className="h-8 w-12 bg-gray-200 animate-pulse mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Skeleton */}
          <div className="mb-8 space-y-6">
            <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm w-full">
              <div className="h-6 w-32 bg-gray-200 animate-pulse mb-4 rounded"></div>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-24 rounded-full bg-gray-200 animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm w-full">
              <div className="h-6 w-40 bg-gray-200 animate-pulse mb-4 rounded"></div>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-24 rounded-full bg-gray-200 animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Review Skeleton */}
          <div className="rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-300 px-6 py-4 bg-gray-50 flex justify-between items-center">
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-9 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { score, timing, analytics, answers } = currentResult;

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader title="Quiz Results" subtitle="Review your performance" />

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Score Summary Card */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-300">
          <div className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-gray-100 bg-white">
                <div className="text-center">
                  <span className={`block text-3xl font-bold ${getScoreColor(score.percentage)}`}>
                    {score.percentage}%
                  </span>
                  <span className="text-xs text-gray-500 uppercase font-medium tracking-wide">Score</span>
                </div>
                <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-100"
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
              <div className="mb-2 flex justify-center text-gray-900">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{score.correct}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correct</div>
            </div>
            <div className="p-6 text-center">
              <div className="mb-2 flex justify-center text-gray-900">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{score.incorrect}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Incorrect</div>
            </div>
            <div className="p-6 text-center">
              <div className="mb-2 flex justify-center text-gray-900">
                <Clock className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatTime(timing.totalTimeSpent)}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time Taken</div>
            </div>
            <div className="p-6 text-center">
              <div className="mb-2 flex justify-center text-gray-900">
                <Target className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{Math.round((score.correct / score.total) * 100)}%</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Analytics Section - Full Width */}
        {(analytics?.strongTopics?.length > 0 || analytics?.strongAreas?.length > 0 || analytics?.weakTopics?.length > 0 || analytics?.weakAreas?.length > 0) && (
          <div className="mb-8 space-y-6">
            {(analytics.strongTopics?.length > 0 || analytics.strongAreas?.length > 0) && (
              <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm w-full">
                <div className="mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-gray-900" />
                  <h3 className="font-bold text-gray-900">Strong Areas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(analytics.strongTopics?.length > 0 ? analytics.strongTopics : analytics.strongAreas).map((area, i) => (
                    <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900 border border-gray-200">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(analytics.weakTopics?.length > 0 || analytics.weakAreas?.length > 0) && (
              <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm w-full">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-gray-900" />
                  <h3 className="font-bold text-gray-900">Areas to Improve</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(analytics.weakTopics?.length > 0 ? analytics.weakTopics : analytics.weakAreas).map((area, i) => (
                    <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900 border border-gray-200">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Review - Accordion Style with Lazy Loading */}
        <div className="rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-300 px-6 py-4 bg-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Detailed Review</h3>
            {!showReview && (
              <button 
                onClick={handleShowReview}
                disabled={loadingReview}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {loadingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Review Answers
              </button>
            )}
          </div>
          
          {showReview && (
            <div className="divide-y divide-gray-200">
              {answers && answers.length > 0 ? (
                answers.map((answer, index) => (
                  <div key={index} className="bg-white">
                    <button 
                      onClick={() => toggleQuestion(index)}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold text-white ${answer.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                          {answer.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Question {index + 1}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {answer.isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 truncate pr-4">
                            {answer.question?.questionText}
                          </p>
                        </div>
                      </div>
                      {expandedQuestions[index] ? <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />}
                    </button>

                    {expandedQuestions[index] && (
                      <div className="px-6 pb-6 pt-0 pl-[4.5rem]">
                        <div className="mb-4 text-gray-800 text-lg font-medium">
                          {answer.question?.questionText}
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          {answer.question?.options.map((option, optIndex) => {
                            const isSelected = option.text === answer.userAnswer;
                            const isCorrect = option.isCorrect;
                            
                            let optionClass = "border-gray-200 bg-white hover:bg-gray-50";
                            if (isCorrect) optionClass = "border-green-500 bg-green-50 text-green-900 ring-1 ring-green-500";
                            else if (isSelected && !isCorrect) optionClass = "border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500";
                            else if (isSelected && isCorrect) optionClass = "border-green-500 bg-green-50 text-green-900 ring-1 ring-green-500";

                            return (
                              <div 
                                key={optIndex} 
                                className={`flex items-center p-4 rounded-lg border ${optionClass} transition-all`}
                              >
                                <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${
                                  isSelected || isCorrect ? 'border-current' : 'border-gray-400'
                                }`}>
                                  {(isSelected || isCorrect) && <div className="h-2.5 w-2.5 rounded-full bg-current" />}
                                </div>
                                <span className="font-medium">{option.text}</span>
                                {isCorrect && <span className="ml-auto text-xs font-bold uppercase tracking-wider text-green-600">Correct Answer</span>}
                                {isSelected && !isCorrect && <span className="ml-auto text-xs font-bold uppercase tracking-wider text-red-600">Your Answer</span>}
                              </div>
                            );
                          })}
                        </div>

                        <div className="rounded-lg bg-gray-50 p-5 border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                            Explanation
                          </h4>
                          <p className="text-gray-700 leading-relaxed">
                            {answer.question?.explanation || "No explanation available."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No detailed answers available.
                </div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default QuizResultsPage;
