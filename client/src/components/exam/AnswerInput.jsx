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

  function getOptionStyle(option) {
    const isSelected = selectedAnswer === option.text;
    const baseStyle = "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-all cursor-pointer";
    
    if (disabled) {
      return `${baseStyle} border-gray-200 bg-gray-50 cursor-not-allowed opacity-60`;
    }
    
    if (isSelected) {
      return `${baseStyle} border-blue-500 bg-blue-50 hover:bg-blue-100`;
    }
    
    return `${baseStyle} border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50`;
  }

  function getOptionIcon(option) {
    const isSelected = selectedAnswer === option.text;
    const iconClass = isSelected ? "text-blue-600" : "text-gray-400";
    
    return isSelected 
      ? <CheckCircle2 className={`h-5 w-5 ${iconClass} flex-shrink-0 mt-0.5`} />
      : <Circle className={`h-5 w-5 ${iconClass} flex-shrink-0 mt-0.5`} />;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Select your answer:</h3>
      
      <div className="space-y-2">
        {question.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(option.text)}
            disabled={disabled}
            className={getOptionStyle(option)}
          >
            {getOptionIcon(option)}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  {String.fromCharCode(65 + index)}
                </span>
              </div>
              
              <p className="text-sm text-gray-900 leading-relaxed">
                {option.text}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selectedAnswer && (
        <div className="rounded-lg bg-green-50 px-3 py-2">
          <p className="text-sm text-green-700">
            Answer selected: <span className="font-medium">{selectedAnswer}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default AnswerInput;