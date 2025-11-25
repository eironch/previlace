import { CheckCircle2, Circle } from "lucide-react";

function AnswerInput({ question, selectedAnswer, onAnswerSelect, disabled = false }) {
  if (!question) {
    return (
      <div className="rounded-lg bg-gray-50 p-6 text-center">
        <p className="text-gray-500">No question available</p>
      </div>
    );
  }

  function handleOptionSelect(optionText) {
    if (!disabled) {
      onAnswerSelect(optionText);
    }
  }

  const answeredCount = question.options?.filter((_, i) => selectedAnswer).length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Select your answer</h3>
        {selectedAnswer && (
          <span className="text-xs text-green-600">Answer selected</span>
        )}
      </div>
      
      <div className="space-y-3">
        {question.options?.map((option, index) => {
          const isSelected = selectedAnswer === option.text;
          
          return (
            <button
              key={index}
              onClick={() => handleOptionSelect(option.text)}
              disabled={disabled}
              className={`flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                disabled
                  ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                  : isSelected
                    ? "border-black bg-gray-50 shadow-sm"
                    : "cursor-pointer border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-black" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-900 sm:text-base">
                  {option.text}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AnswerInput;
