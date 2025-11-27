import { Clock, CheckCircle2 } from "lucide-react";
import MathRenderer from "../ui/MathRenderer";

function QuestionPreview({ question, questionType }) {
  function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg bg-gray-50 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-black">Question Preview</h3>
            <p className="text-gray-600">Type: {questionType.name}</p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(question.timeLimit)}
            </div>
            <div className="rounded bg-gray-200 px-2 py-1 text-xs">
              {question.difficulty}
            </div>
            <div className="rounded bg-gray-200 px-2 py-1 text-xs">
              {question.points} point{question.points !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {question.passageText && (
          <div className="mb-6 rounded border bg-white p-4">
            {question.passageTitle && (
              <h4 className="mb-3 font-semibold text-black">{question.passageTitle}</h4>
            )}
            <div className="prose prose-sm max-w-none">
              {question.passageText.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-2 text-gray-800">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <div className="mb-2 font-medium text-black">
              {question.questionText}
              {question.questionMath && (
                <div className="mt-3">
                  <MathRenderer 
                    latex={question.questionMath} 
                    displayMode={true}
                    className="text-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  option.isCorrect 
                    ? "border-green-200 bg-green-50" 
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="mt-0.5 flex items-center">
                  <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    option.isCorrect 
                      ? "border-green-500 bg-green-500" 
                      : "border-gray-300"
                  }`}>
                    {option.isCorrect && (
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <span className="mr-2 font-medium text-gray-700">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-gray-800">{option.text}</span>
                  {option.math && (
                    <div className="mt-2">
                      <MathRenderer 
                        latex={option.math} 
                        displayMode={false}
                        className="text-base"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {question.explanation && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h5 className="mb-2 font-semibold text-blue-900">Explanation</h5>
              <p className="mb-2 text-blue-800">{question.explanation}</p>
              {question.explanationMath && (
                <div className="mt-3">
                  <MathRenderer 
                    latex={question.explanationMath} 
                    displayMode={true}
                    className="text-base"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {question.tags.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <h4 className="mb-3 font-semibold text-black">Question Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <span className="text-gray-600">Category:</span>
            <div className="font-medium text-black">{question.category}</div>
          </div>
          <div>
            <span className="text-gray-600">Subject Area:</span>
            <div className="font-medium text-black">{question.subjectArea}</div>
          </div>
          <div>
            <span className="text-gray-600">Exam Level:</span>
            <div className="font-medium text-black">{question.examLevel}</div>
          </div>
          <div>
            <span className="text-gray-600">Language:</span>
            <div className="font-medium text-black">{question.language}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionPreview;