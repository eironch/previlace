import { CheckCircle2 } from "lucide-react";

function QuestionNavigation({
  questions,
  currentIndex,
  answers,
  onNavigate,
  disabled,
}) {
  const totalQuestions = questions?.length || 0;
  const answeredCount = Object.keys(answers).length;

  function getGridCols() {
    if (totalQuestions <= 10) return "grid-cols-5";
    if (totalQuestions <= 20) return "grid-cols-5 sm:grid-cols-10";
    return "grid-cols-5 sm:grid-cols-10";
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Questions</h3>
        <span className="text-xs text-gray-500">
          {answeredCount}/{totalQuestions} answered
        </span>
      </div>

      <div className={`grid gap-2 ${getGridCols()}`}>
        {questions.map((question, index) => {
          const isAnswered = !!answers[question?._id];
          const isCurrent = index === currentIndex;

          return (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              disabled={disabled}
              className={`relative flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                isCurrent
                  ? "bg-black text-white shadow-sm"
                  : isAnswered
                    ? "border border-green-500 bg-green-50 text-green-800 hover:bg-green-200"
                    : "border border-gray-300 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {index + 1}
              {isAnswered && !isCurrent && (
                <CheckCircle2 className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-white text-green-600" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-black" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border border-green-500 bg-green-50" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border border-gray-300 bg-white" />
          <span>Unanswered</span>
        </div>
      </div>
    </div>
  );
}

export default QuestionNavigation;
