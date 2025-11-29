import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Flag, CheckCircle2 } from "lucide-react";
import useExamStore from "@/store/examStore";
import useAdaptiveSession from "@/hooks/useAdaptiveSession";
import QuestionDisplay from "@/components/exam/QuestionDisplay";
import QuizTimer from "@/components/exam/QuizTimer";
import AnswerInput from "@/components/exam/AnswerInput";
import ImmediateFeedback from "@/components/exam/ImmediateFeedback";
import QuestionNavigation from "@/components/exam/QuestionNavigation";
import AdaptiveFeedbackOverlay from "@/components/quiz/AdaptiveFeedbackOverlay";
import BreakReminderModal from "@/components/quiz/BreakReminderModal";
import DifficultyIndicator from "@/components/quiz/DifficultyIndicator";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import { useAuthStore } from "@/store/authStore";
import behaviorAnalyticsService from "@/services/behaviorAnalyticsService";

function QuizAttemptPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [submitError, setSubmitError] = useState(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const breakTimerRef = useRef(null);
  const previousDifficultyRef = useRef(null);

  const {
    sessionQuestions,
    currentQuestionIndex,
    currentSession,
    answers,
    sessionActive,
    loading,
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
    selectAnswer,
  } = useExamStore();

  const currentQuestion = getCurrentQuestion();
  const totalQuestions = sessionQuestions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercentage = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

  const adaptive = useAdaptiveSession(currentSession?._id, {
    enabled: !!currentSession?._id && sessionActive,
    questionCount: totalQuestions,
    examLevel: user?.examType || "Professional",
    mode: currentSession?.mode || "practice",
    checkInterval: 5,
  });

  useEffect(() => {
    if (adaptive.currentDifficulty && adaptive.currentDifficulty !== previousDifficultyRef.current) {
      previousDifficultyRef.current = adaptive.currentDifficulty;
    }
  }, [adaptive.currentDifficulty]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    if (currentQuestion?._id) {
      adaptive.proctoring.setQuestion(currentQuestion._id);
    }
  }, [currentQuestionIndex, currentQuestion?._id]);

  useEffect(() => {
    return () => {
      if (breakTimerRef.current) {
        clearTimeout(breakTimerRef.current);
      }
    };
  }, []);

  const getTimeSpentOnQuestion = useCallback(() => {
    return Date.now() - questionStartTime;
  }, [questionStartTime]);

  function handleAnswerSelect(answer) {
    if (!currentQuestion || !sessionActive || showingFeedback || isOnBreak) return;
    const timeSpent = getTimeSpentOnQuestion();
    if (trackQuestionTime) {
      trackQuestionTime(currentQuestion._id, timeSpent);
    }
    setPendingAnswer(answer);
  }

  function saveProgress() {
    if (!hasImmediateFeedback && pendingAnswer && currentQuestion) {
      selectAnswer(currentQuestion._id, pendingAnswer);
    }
  }

  async function handleNextAction() {
    if (isOnBreak) return;

    const isCorrect = currentFeedback?.isCorrect || false;
    const timeSpent = getTimeSpentOnQuestion();
    adaptive.recordAnswer(isCorrect, timeSpent);

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
        saveProgress();
        if (currentQuestionIndex === totalQuestions - 1) {
          await handleSubmitQuiz();
        } else {
          nextQuestion();
        }
      }
    }
  }

  function handlePreviousAction() {
    if (isOnBreak) return;
    saveProgress();
    previousQuestion();
  }

  function handleQuestionNavigation(index) {
    if (isOnBreak) return;
    if (index >= 0 && index < totalQuestions) {
      saveProgress();
      setCurrentQuestionIndex(index);
    }
  }

  function handleExitQuiz() {
    saveProgress();
    navigate("/dashboard");
  }

  function handleTakeBreak() {
    setIsOnBreak(true);
    adaptive.dismissBreak();
    breakTimerRef.current = setTimeout(() => {
      setIsOnBreak(false);
    }, 5 * 60 * 1000);
  }

  function handleEndBreak() {
    setIsOnBreak(false);
    if (breakTimerRef.current) {
      clearTimeout(breakTimerRef.current);
    }
  }

  function handleDismissBreak() {
    adaptive.dismissBreak();
  }

  function handleDismissSuggestion(type) {
    adaptive.dismissSuggestion(type);
  }

  function handleSuggestionAction(type, action) {
    if (type === "break_suggestion" && action === "take_break") {
      handleTakeBreak();
    }
    adaptive.handleSuggestionAction(type, action);
  }

  function getNextButtonText() {
    if (showingFeedback) {
      return currentQuestionIndex === totalQuestions - 1 ? "Submit Quiz" : "Next";
    }
    if (!hasImmediateFeedback) {
      return currentQuestionIndex === totalQuestions - 1 ? "Submit Quiz" : "Next";
    }
    return "Next";
  }

  function isNextButtonDisabled() {
    if (isOnBreak) return true;
    if (showingFeedback) return false;
    if (!hasImmediateFeedback) {
      return !pendingAnswer || isSubmitting;
    }
    return !pendingAnswer || isConfirmingAnswer || isSubmitting;
  }

  async function handleSubmitQuiz() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const behaviorSummary = adaptive.proctoring.getBehaviorSummary();
      if (currentSession?._id && user?._id) {
        await behaviorAnalyticsService.saveQuizBehavior(currentSession._id, {
          totalDuration: adaptive.getSessionStats().totalTime,
          integrityEvents: behaviorSummary.events,
          integrityScore: behaviorSummary.integrityScore,
          questionsAnswered: adaptive.getSessionStats().questionsAnswered,
          correctAnswers: adaptive.getSessionStats().correctAnswers,
          posthogSessionId: null,
        }).catch(() => {});
      }
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

  if (!currentSession || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-40 border-b border-gray-300 bg-white shadow-sm">
          <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <SkeletonLoader variant="circle" className="h-10 w-10" />
              <SkeletonLoader className="h-6 w-48" />
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-200" />
          </div>
        </div>
        <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
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
        <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
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
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {currentSession?.title || "Quiz"}
                  </h1>
                  {adaptive.currentDifficulty && (
                    <DifficultyIndicator
                      currentDifficulty={adaptive.currentDifficulty}
                      previousDifficulty={previousDifficultyRef.current}
                    />
                  )}
                </div>
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

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-6">
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
                  disabled={!sessionActive || showingFeedback || isOnBreak}
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
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <Flag className="h-4 w-4" />
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePreviousAction}
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
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <QuestionNavigation
              questions={sessionQuestions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              onNavigate={handleQuestionNavigation}
              disabled={isOnBreak}
              hasImmediateFeedback={hasImmediateFeedback}
            />
            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Quiz Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mode</span>
                  <span className="font-medium capitalize text-gray-900">
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
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium capitalize text-gray-700">
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                )}
                {adaptive.proctoring.integrityScore < 100 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Focus Score</span>
                    <span className={`font-medium ${adaptive.proctoring.integrityScore >= 80 ? "text-gray-900" : "text-gray-500"}`}>
                      {Math.round(adaptive.proctoring.integrityScore)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AdaptiveFeedbackOverlay
        suggestions={adaptive.suggestions}
        onDismiss={handleDismissSuggestion}
        onAction={handleSuggestionAction}
      />

      <BreakReminderModal
        isOpen={adaptive.showBreakReminder && !isOnBreak}
        onDismiss={handleDismissBreak}
        onTakeBreak={handleTakeBreak}
        questionsCompleted={answeredCount}
      />

      {isOnBreak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
            <div className="mb-4 text-4xl">5:00</div>
            <h3 className="text-lg font-semibold text-gray-900">Taking a Break</h3>
            <p className="mt-2 text-sm text-gray-600">
              Relax and refocus. The quiz will resume when you're ready.
            </p>
            <button
              onClick={handleEndBreak}
              className="mt-6 w-full rounded-lg bg-black px-4 py-2.5 font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Resume Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizAttemptPage;
