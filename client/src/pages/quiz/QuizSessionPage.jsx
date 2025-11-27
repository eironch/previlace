import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Flag, CheckCircle2, Clock, BookOpen } from "lucide-react";
import useExamStore from "@/store/examStore";
import QuestionDisplay from "@/components/exam/QuestionDisplay";
import QuizTimer from "@/components/exam/QuizTimer";
import AnswerInput from "@/components/exam/AnswerInput";
import ImmediateFeedback from "@/components/exam/ImmediateFeedback";
import QuestionNavigation from "@/components/exam/QuestionNavigation";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

import { useAuthStore } from "@/store/authStore";

function QuizSessionPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const {
    sessionQuestions,
    currentQuestionIndex,
    currentSession,
    answers,
    sessionActive,
    loading,
    timeRemaining,
    currentFeedback,
    hasImmediateFeedback,
    hasTimer,
    pendingAnswer,
    showingFeedback,
    isConfirmingAnswer,
    getCurrentQuestion,
    setCurrentQuestionIndex,
    nextQuestion,
    previousQuestion,
    setPendingAnswer,
    confirmAnswer,
    completeSession,
    trackQuestionTime,
  } = useExamStore();

  const currentQuestion = getCurrentQuestion();
  const totalQuestions = sessionQuestions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercentage = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("subjectId");
  const topicId = searchParams.get("topicId");
  const { startQuizSession } = useExamStore();

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const getTimeSpentOnQuestion = useCallback(() => {
    return Date.now() - questionStartTime;
  }, [questionStartTime]);

  useEffect(() => {
    async function initSession() {
      if (currentSession || loading) return;

      const examLevel = user?.examType || "Professional";

      if (subjectId) {
        try {
          await startQuizSession({
            mode: "subject",
            subjectId: subjectId,
            examLevel: examLevel,
            questionCount: 10,
          });
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to start session:", error);
          }
          navigate("/dashboard");
        }
      } else if (topicId) {
        try {
          await startQuizSession({
            mode: "topic",
            topicId: topicId,
            examLevel: examLevel,
            questionCount: 10,
          });
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to start session:", error);
          }
          navigate("/dashboard");
        }
      } else {
        navigate("/dashboard");
      }
    }

    if (user) {
      initSession();
    }
  }, [currentSession, loading, navigate, subjectId, topicId, startQuizSession, user]);

  useEffect(() => {
    if (hasTimer && timeRemaining <= 0 && sessionActive) {
      handleAutoSubmit();
    }
  }, [timeRemaining, sessionActive, hasTimer]);

  function handleAnswerSelect(answer) {
    if (!currentQuestion || !sessionActive || showingFeedback) return;
    const timeSpent = getTimeSpentOnQuestion();
    if (trackQuestionTime) {
      trackQuestionTime(currentQuestion._id, timeSpent);
    }
    setPendingAnswer(answer);
  }

  async function handleNextAction() {
    if (showingFeedback) {
      if (currentQuestionIndex === totalQuestions - 1) {
        await handleSubmitQuiz();
      } else {
        nextQuestion();
      }
    } else if (pendingAnswer) {
      if (hasImmediateFeedback) {
        await confirmAnswer();
      } else {
        nextQuestion();
      }
    }
  }

  function handleQuestionNavigation(index) {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  }

  function handleExitQuiz() {
    navigate("/dashboard");
  }

  function getNextButtonText() {
    if (showingFeedback) {
      return currentQuestionIndex === totalQuestions - 1
        ? "Submit Quiz"
        : "Next";
    }
    if (!hasImmediateFeedback) {
      return currentQuestionIndex === totalQuestions - 1
        ? "Submit Quiz"
        : "Next";
    }
    return pendingAnswer ? "Next" : "Next";
  }

  function isNextButtonDisabled() {
    if (showingFeedback) return false;
    if (!hasImmediateFeedback) {
      return !pendingAnswer || isSubmitting;
    }
    return !pendingAnswer || isConfirmingAnswer || isSubmitting;
  }

  const [submitError, setSubmitError] = useState(null);

  async function handleSubmitQuiz() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await completeSession();
      navigate("/dashboard/results");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to submit quiz:", error);
      }
      setSubmitError(error.message || "Failed to submit quiz. Please try again.");
      setIsSubmitting(false);
    }
  }

  async function handleAutoSubmit() {
    setSubmitError(null);
    try {
      await completeSession();
      navigate("/dashboard/results");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Auto-submit failed:", error);
      }
      setSubmitError(error.message || "Failed to auto-submit quiz. Please try again.");
    }
  }

  if (!currentSession || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-40 border-b border-gray-300 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <SkeletonLoader variant="circle" className="h-10 w-10" />
              <SkeletonLoader className="h-6 w-48" />
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-200" />
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-gray-300 bg-white p-4">
                <SkeletonLoader className="mb-3 h-5 w-32" />
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <SkeletonLoader key={i} className="h-10" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6 lg:col-span-3">
              <div className="rounded-lg border border-gray-300 bg-white p-6">
                <SkeletonLoader variant="title" className="mb-4" />
                <SkeletonLoader className="mb-2" />
                <SkeletonLoader className="w-3/4" />
              </div>
              <div className="rounded-lg border border-gray-300 bg-white p-6">
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonLoader key={i} className="h-14" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 border-b border-gray-300 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleExitQuiz}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50"
                title="Exit Quiz"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentSession?.title || "Quiz"}
                </h1>
                <p className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {hasTimer && <QuizTimer />}
              <div className="hidden items-center gap-4 text-sm sm:flex">
                <div className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{answeredCount}</span>
                </div>
                {unansweredCount > 0 && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Flag className="h-4 w-4" />
                    <span>{unansweredCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="order-2 lg:order-1 lg:col-span-1">
            <div className="sticky top-32">
              <QuestionNavigation
                questions={sessionQuestions}
                currentIndex={currentQuestionIndex}
                answers={answers}
                onNavigate={handleQuestionNavigation}
                disabled={false}
              />

              <div className="mt-4 rounded-lg border border-gray-300 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Session Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Mode</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {currentSession?.mode || "Practice"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Answered</span>
                    <span className="font-medium text-gray-900">
                      {answeredCount}/{totalQuestions}
                    </span>
                  </div>
                  {currentQuestion?.difficulty && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Difficulty</span>
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 capitalize">
                        {currentQuestion.difficulty}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 space-y-6 lg:order-2 lg:col-span-3">
            <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
              <QuestionDisplay
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                isAnswered={!!answers[currentQuestion?._id]}
              />
            </div>

            {!showingFeedback && (
              <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
                <AnswerInput
                  question={currentQuestion}
                  selectedAnswer={pendingAnswer}
                  onAnswerSelect={handleAnswerSelect}
                  disabled={!sessionActive || showingFeedback}
                />
              </div>
            )}

            {showingFeedback && currentFeedback && (
              <ImmediateFeedback
                feedback={currentFeedback}
                userAnswer={answers[currentQuestion?._id]?.answer}
              />
            )}

            {submitError && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200 flex items-center gap-2">
                <Flag className="h-4 w-4" />
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0 && !showingFeedback}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNextAction}
                disabled={isNextButtonDisabled()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                {(isConfirmingAnswer || isSubmitting) && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {getNextButtonText()}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default QuizSessionPage;
