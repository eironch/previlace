import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Menu, X, Flag, Clock, CheckCircle2, Pause, Play, RotateCcw, Send } from "lucide-react";
import useExamStore from "../../store/examStore";
import QuestionDisplay from "./QuestionDisplay";
import QuizTimer from "./QuizTimer";
import AnswerInput from "./AnswerInput";

function QuizInterface() {
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
    isPaused,
    loading,
    timeRemaining,
    getCurrentQuestion,
    setCurrentQuestionIndex,
    nextQuestion,
    previousQuestion,
    updateAnswer,
    pauseSession,
    resumeSession,
    completeSession,
    updateTimer
  } = useExamStore();

  const currentQuestion = getCurrentQuestion();
  const totalQuestions = sessionQuestions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  useEffect(() => {
    if (!currentSession && !loading) {
      navigate("/dashboard/quiz");
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
    
    updateAnswer(currentQuestionIndex, {
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

  async function handlePauseResume() {
    try {
      if (isPaused) {
        await resumeSession();
      } else {
        await pauseSession();
      }
    } catch (err) {
      if (import.meta.env.DEV && console.error) {
        console.error("Failed to pause/resume session:", err);
      }
    }
  }

  async function handleSubmitQuiz() {
    setShowConfirmSubmit(false);
    try {
      await completeSession();
      navigate("/dashboard/results");
    } catch (err) {
      if (import.meta.env.DEV && console.error) {
        console.error("Failed to submit quiz:", err);
      }
    }
  }

  async function handleAutoSubmit() {
    try {
      await completeSession();
      navigate("/dashboard/results");
    } catch (err) {
      if (import.meta.env.DEV && console.error) {
        console.error("Auto-submit failed:", err);
      }
    }
  }

  function handleExitQuiz() {
    setShowConfirmExit(true);
  }

  const [showConfirmExit, setShowConfirmExit] = useState(false);

  if (!currentSession || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 border-b bg-white shadow-sm">
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
                      <Flag className="h-4 w-4 text-orange-600" />
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
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 lg:hidden"
              >
                {showNavigation ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                Questions
              </button>
            </div>
          </div>

          <div className="mt-2 h-1 bg-gray-200 rounded-full">
            <div 
              className="h-1 bg-blue-600 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {isPaused ? (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="rounded-lg bg-white p-8 shadow-lg text-center max-w-md">
            <Clock className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz Paused</h2>
            <p className="text-gray-600 mb-6">Your quiz has been paused. Click resume to continue.</p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 rounded-lg border border-gray-300 py-2 px-4 font-medium text-gray-700 hover:bg-gray-50"
              >
                Exit Quiz
              </button>
              <button
                onClick={handlePauseResume}
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 py-2 px-4 font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4" />
                Resume Quiz
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <div className="space-y-6">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <QuestionDisplay 
                    question={currentQuestion}
                    questionNumber={currentQuestionIndex + 1}
                    isAnswered={!!answers[currentQuestion?._id]}
                    userAnswer={answers[currentQuestion?._id]?.answer}
                  />
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm">
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
                    className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
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

            <div className="hidden lg:block w-80 space-y-4">
              <QuestionNavigation
                questions={sessionQuestions}
                currentIndex={currentQuestionIndex}
                answers={answers}
                onNavigate={handleQuestionNavigation}
              />
              
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Quiz Controls
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={handlePauseResume}
                    disabled={loading}
                    className="w-full rounded-lg bg-yellow-600 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    {isPaused ? "Resume" : "Pause"} Quiz
                  </button>
                  
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Quiz
                  </button>
                  
                  <button
                    onClick={handleExitQuiz}
                    className="w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Exit Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Send className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Submit Quiz?</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to submit your quiz? You have answered {answeredCount} out of {totalQuestions} questions.
            </p>
            {unansweredCount > 0 && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 mb-4">
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
                className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={loading}
                className="flex-1 rounded-lg bg-green-600 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
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

      {showConfirmExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <X className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">Exit Quiz?</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to exit? Your progress will be lost and this quiz session will be terminated.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmExit(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Stay in Quiz
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 rounded-lg bg-red-600 py-2 font-medium text-white hover:bg-red-700"
              >
                Exit Quiz
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
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Menu className="h-4 w-4" />
        Question Navigation
      </h3>
      <div className="grid grid-cols-6 gap-2">
        {questions.map((_, index) => {
          const isAnswered = !!answers[questions[index]?._id];
          const isCurrent = index === currentIndex;
          
          return (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              className={`relative h-8 w-8 rounded text-xs font-medium transition-all ${
                isCurrent
                  ? "bg-blue-600 text-white"
                  : isAnswered
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {index + 1}
              {isAnswered && !isCurrent && (
                <CheckCircle2 className="absolute -top-1 -right-1 h-3 w-3 text-green-600" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded bg-blue-600"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded bg-green-100 border border-green-300"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded bg-gray-100 border border-gray-300"></div>
            <span>Unanswered</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizInterface;