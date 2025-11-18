import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Flag, CircleCheck } from "lucide-react";
import useExamStore from "@/store/examStore";
import QuestionDisplay from "@/components/exam/QuestionDisplay";
import QuizTimer from "@/components/exam/QuizTimer";
import AnswerInput from "@/components/exam/AnswerInput";
import ImmediateFeedback from "@/components/exam/ImmediateFeedback";
import QuestionNavigation from "@/components/exam/QuestionNavigation";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

function QuizSessionPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  } = useExamStore();

  const currentQuestion = getCurrentQuestion();
  const totalQuestions = sessionQuestions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  useEffect(() => {
    if (!currentSession && !loading) {
      navigate("/dashboard");
    }
  }, [currentSession, loading, navigate]);

  useEffect(() => {
    if (hasTimer && timeRemaining <= 0 && sessionActive) {
      handleAutoSubmit();
    }
  }, [timeRemaining, sessionActive, hasTimer]);

  function handleAnswerSelect(answer) {
    if (!currentQuestion || !sessionActive || showingFeedback) return;
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
      await confirmAnswer();
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
    return pendingAnswer ? "Confirm" : "Next";
  }

  function isNextButtonDisabled() {
    if (showingFeedback) return false;
    return !pendingAnswer || isConfirmingAnswer || isSubmitting;
  }

  async function handleSubmitQuiz() {
    setIsSubmitting(true);
    try {
      await completeSession();
      navigate("/dashboard/results");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to submit quiz:", error);
      }
      setIsSubmitting(false);
    }
  }

  async function handleAutoSubmit() {
    try {
      await completeSession();
      navigate("/dashboard/results");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Auto-submit failed:", error);
      }
    }
  }

  if (!currentSession || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <div className="mx-auto max-w-4xl">
            <SkeletonLoader variant="title" className="mb-2" />
            <div className="flex items-center gap-4">
              <SkeletonLoader className="w-32" />
              <SkeletonLoader className="w-32" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <SkeletonLoader variant="title" className="mb-4" />
              <SkeletonLoader className="mb-2" />
              <SkeletonLoader className="mb-2 w-3/4" />
              <SkeletonLoader className="w-1/2" />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="space-y-3">
                <SkeletonLoader className="h-12" />
                <SkeletonLoader className="h-12" />
                <SkeletonLoader className="h-12" />
                <SkeletonLoader className="h-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:gap-4 sm:text-sm">
            <button
              onClick={handleExitQuiz}
              className="flex items-center justify-center gap-4 rounded-lg bg-white p-2 font-medium text-gray-700 hover:bg-gray-50"
              title="Exit Quiz"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <span className="text-xl font-medium">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <div className="flex items-center gap-1">
              <CircleCheck className="h-3 w-3 text-green-600 sm:h-4 sm:w-4" />
              <span>{answeredCount} answered</span>
            </div>
            {unansweredCount > 0 && (
              <div className="flex items-center gap-1">
                <Flag className="h-3 w-3 text-gray-600 sm:h-4 sm:w-4" />
                <span>{unansweredCount} remaining</span>
              </div>
            )}
          </div>
          <div className="h-1 rounded-full bg-gray-200">
            <div
              className="h-1 rounded-full bg-black transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="space-y-4 sm:space-y-6">
          <QuestionNavigation
            questions={sessionQuestions}
            currentIndex={currentQuestionIndex}
            answers={answers}
            onNavigate={handleQuestionNavigation}
            disabled={false}
          />
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              isAnswered={!!answers[currentQuestion?._id]}
            />
          </div>

          {!showingFeedback && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0 && !showingFeedback}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="hidden sm:inline">Previous</span>
            </button>
            {hasTimer && <QuizTimer />}
            <button
              onClick={handleNextAction}
              disabled={isNextButtonDisabled()}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-6 py-2.5 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {(isConfirmingAnswer || isSubmitting) && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {getNextButtonText()}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default QuizSessionPage;
