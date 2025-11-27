import { CheckCircle2 } from "lucide-react";

function QuestionNavigation({
  questions,
  currentIndex,
  answers,
  onNavigate,
  disabled,
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="grid grid-cols-10 gap-2">
        {questions.map((question, index) => {
          const isAnswered = !!answers[question?._id];
          const isCurrent = index === currentIndex;

          return (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              disabled={disabled}
              className={`relative flex h-10 w-full items-center justify-center rounded text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
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
    </div>
  );
}

export default QuestionNavigation;
