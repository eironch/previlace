import { useState } from "react";
import { useTestStore } from "../../store/testStore";
import MathRenderer from "../ui/MathRenderer";
import { CheckCircle2, Circle } from "lucide-react";

function TestQuestion({ question }) {
  const { answers, answerQuestion, isQuestionAnswered } = useTestStore();
  const [selectedOption, setSelectedOption] = useState(
    answers[question._id]?.answer || ""
  );

  function handleOptionSelect(optionText) {
    setSelectedOption(optionText);
    answerQuestion(question._id, optionText);
  }

  const isAnswered = isQuestionAnswered(question._id);

  return (
    <div className="rounded-lg bg-white p-8 shadow-sm">
      {question.passageText && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          {question.passageTitle && (
            <h3 className="mb-4 text-lg font-semibold text-black">
              {question.passageTitle}
            </h3>
          )}
          <div className="prose prose-sm max-w-none text-gray-800">
            {question.passageText.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-3">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="mb-4 flex items-start justify-between">
        <h2 className="text-xl font-semibold text-black">
        {question.questionText}
        </h2>
        <div className="flex items-center gap-2">
        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
        {question.difficulty}
        </span>
        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
        {question.category}
        </span>
        </div>
        </div>

        {question.questionMath && (
          <div className="mb-4">
            <MathRenderer
              latex={question.questionMath}
              displayMode={true}
              className="text-lg"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`cursor-pointer rounded-lg border p-4 transition-all ${
              selectedOption === option.text
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
            onClick={() => handleOptionSelect(option.text)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 items-center justify-center">
                {selectedOption === option.text ? (
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-800">{option.text}</p>
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
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
        <div className="text-sm text-gray-600">
          {isAnswered ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Answered
            </span>
          ) : (
            <span>Select an option to continue</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestQuestion;