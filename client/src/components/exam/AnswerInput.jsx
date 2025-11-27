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

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Select your answer</h3>
      
      <div className="space-y-2">
        {question.options?.map((option, index) => {
          const isSelected = selectedAnswer === option.text;
          
          return (
            <button
              key={index}
              onClick={() => handleOptionSelect(option.text)}
              disabled={disabled}
              className={`flex w-full items-start gap-3 rounded-lg border-2 p-3 sm:p-4 text-left transition-all cursor-pointer ${
                disabled
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                  : isSelected
                  ? "border-black bg-white hover:border-black hover:bg-gray-50"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {isSelected ? (
                <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isSelected
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
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
