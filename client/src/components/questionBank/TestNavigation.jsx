import { useState } from "react";
import { useTestStore } from "../../store/testStore";
import Button from "../ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react";

function TestNavigation() {
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const {
    testQuestions,
    currentQuestionIndex,
    answers,
    isSubmitting,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    submitTest,
    getAnsweredCount,
    getProgress,
    isQuestionAnswered,
  } = useTestStore();

  const answeredCount = getAnsweredCount();
  const progress = getProgress();
  const canGoBack = currentQuestionIndex > 0;
  const canGoNext = currentQuestionIndex < testQuestions.length - 1;

  async function handleSubmitTest() {
    await submitTest();
    setShowSubmitConfirm(false);
  }

  function handleSubmitClick() {
    setShowSubmitConfirm(true);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-black">Test Progress</h3>

        <div className="mb-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-black">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-black">{answeredCount}</div>
            <div className="text-xs text-gray-600">Answered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-400">
              {testQuestions.length - answeredCount}
            </div>
            <div className="text-xs text-gray-600">Remaining</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-black">Questions</h3>

        <div className="grid grid-cols-5 gap-2">
          {testQuestions.map((question, index) => (
            <button
              key={question._id}
              onClick={() => goToQuestion(index)}
              className={`flex h-10 w-10 items-center justify-center rounded text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? "bg-blue-600 text-white"
                  : isQuestionAnswered(question._id)
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {index === currentQuestionIndex ? (
                index + 1
              ) : isQuestionAnswered(question._id) ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          <Button
            onClick={previousQuestion}
            disabled={!canGoBack}
            variant="ghost"
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={nextQuestion}
            disabled={!canGoNext}
            variant="ghost"
            className="flex-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleSubmitClick}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2"
          variant={
            answeredCount === testQuestions.length ? "default" : "outline"
          }
        >
          <Flag className="h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Submit Test"}
        </Button>

        {showSubmitConfirm && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">
                Confirm Submission
              </span>
            </div>
            <p className="mb-4 text-sm text-orange-700">
              Are you sure you want to submit your test? This action cannot be
              undone.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                size="sm"
                className="flex-1"
              >
                Yes, Submit
              </Button>
              <Button
                onClick={() => setShowSubmitConfirm(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {answeredCount < testQuestions.length && (
          <p className="text-center text-sm text-yellow-600">
            {testQuestions.length - answeredCount} questions remaining
          </p>
        )}
      </div>
    </div>
  );
}

export default TestNavigation;
