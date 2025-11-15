import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Menu, X, Flag, Clock, CheckCircle2, Send } from "lucide-react";
import useExamStore from "@/store/examStore";
import QuestionDisplay from "@/components/exam/QuestionDisplay";
import QuizTimer from "@/components/exam/QuizTimer";
import AnswerInput from "@/components/exam/AnswerInput";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

function QuizSessionPage() {
  const navigate = useNavigate();
  const [showNavigation, setShowNavigation] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [timeWarningShown, setTimeWarningShown] = useState(false);
  
  const {
    sessionQuestions,
    currentQuestionIndex,
    currentSession,
    answers,
    sessionActive,
    loading,
    timeRemaining,
    getCurrentQuestion,
    setCurrentQuestionIndex,
    nextQuestion,
    previousQuestion,
    updateAnswer,
    completeSession
  } = useExamStore();

  const currentQuestion = getCurrentQuestion();
  const totalQuestions = sessionQuestions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  useEffect(() => {
    if (!currentSession && !loading) {
      navigate("/dashboard/subjects");
    }
  }, [currentSession, loading, navigate]);

  useEffect(() => {
    if (timeRemaining <= 300 && timeRemaining > 0 && !timeWarningShown) {
      setTimeWarningShown(true);
    }
  }, [timeRemaining, timeWarningShown]);

  useEffect(() => {
    if (timeRemaining <= 0 && sessionActive) {
      handleAutoSubmit();
    }
  }, [timeRemaining, sessionActive]);

  function handleAnswerSelect(answer) {
    if (!currentQuestion || !sessionActive) return;
    
    updateAnswer(currentQuestion._id, {
      questionId: currentQuestion._id,
      answer,
      timeSpent: 0
    });
  }

  function handleQuestionNavigation(index) {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
      setShowNavigation(false);
    }
  }

  async function handleSubmitQuiz() {
    setShowConfirmSubmit(false);
    try {
      await completeSession();
      navigate("/dashboard/results");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to submit quiz:", error);
      }
    }
  }

  async function handleAutoSubmit() {
    try {
      await completeSession();
      navigate("/dashboard/results");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Auto-submit failed:", error);
      }
    }
  }

  if (!currentSession || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <div className="mx-auto max-w-7xl">
            <SkeletonLoader variant="title" className="mb-2" />
            <div className="flex items-center gap-4">
              <SkeletonLoader className="w-32" />
              <SkeletonLoader className="w-32" />
            </div>
          </div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 py-6">
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
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">{currentSession.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{answeredCount} answered</span>
                  </div>
                  {unansweredCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Flag className="h-4 w-4 text-gray-600" />
                      <span>{unansweredCount} remaining</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <QuizTimer />
              
              <button
                onClick={() => setShowNavigation(!showNavigation)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
              >
                {showNavigation ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                Questions
              </button>
            </div>
          </div>

          <div className="mt-2 h-1 rounded-full bg-gray-200">
            <div 
              className="h-1 rounded-full bg-black transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          <div className="min-w-0 flex-1">
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <QuestionDisplay 
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  isAnswered={!!answers[currentQuestion?._id]}
                  userAnswer={answers[currentQuestion?._id]?.answer}
                />
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <AnswerInput
                  question={currentQuestion}
                  selectedAnswer={answers[currentQuestion?._id]?.answer}
                  onAnswerSelect={handleAnswerSelect}
                  disabled={!sessionActive}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                {currentQuestionIndex === totalQuestions - 1 ? (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700"
                  >
                    <Send className="h-4 w-4" />
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-gray-800"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showNavigation && (
                <div className="block lg:hidden">
                  <QuestionNavigation
                    questions={sessionQuestions}
                    currentIndex={currentQuestionIndex}
                    answers={answers}
                    onNavigate={handleQuestionNavigation}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="hidden w-80 space-y-4 lg:block">
            <QuestionNavigation
              questions={sessionQuestions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              onNavigate={handleQuestionNavigation}
            />
            
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-medium text-gray-900">Quiz Controls</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                  Submit Quiz
                </button>
                
                <button
                  onClick={() => navigate("/dashboard/subjects")}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  Exit Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <Send className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Submit Quiz?</h3>
            </div>
            <p className="mb-4 text-gray-600">
              Are you sure you want to submit your quiz? You have answered {answeredCount} out of {totalQuestions} questions.
            </p>
            {unansweredCount > 0 && (
              <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    You have {unansweredCount} unanswered questions. These will be marked as incorrect.
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {loading ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionNavigation({ questions, currentIndex, answers, onNavigate }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
        <Menu className="h-4 w-4" />
        Question Navigation
      </h3>
      <div className="grid grid-cols-6 gap-2">
        {questions.map((question, index) => {
          const isAnswered = !!answers[question?._id];
          const isCurrent = index === currentIndex;
          
          return (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              className={`relative h-8 w-8 rounded text-xs font-medium transition-all ${
                isCurrent
                  ? "bg-black text-white"
                  : isAnswered
                  ? "border border-green-500 bg-green-50 text-green-800 hover:bg-green-100"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {index + 1}
              {isAnswered && !isCurrent && (
                <CheckCircle2 className="absolute -right-1 -top-1 h-3 w-3 text-green-600" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded bg-black"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded border border-green-500 bg-green-50"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded border border-gray-200 bg-white"></div>
            <span>Unanswered</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizSessionPage;
