import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

function ImmediateFeedback({ feedback, userAnswer }) {
  if (!feedback) return null;

  const { isCorrect, correctAnswer, explanation, explanationMath } = feedback;

  function renderMath(text, math) {
    if (!text) return null;

    if (math) {
      try {
        return <BlockMath math={math} />;
      } catch (error) {
        return <p className="text-gray-700">{text}</p>;
      }
    }

    const parts = text.split(/(\$.*?\$)/g);
    return (
      <span>
        {parts.map((part, index) => {
          if (part.startsWith("$") && part.endsWith("$")) {
            try {
              return <InlineMath key={index} math={part.slice(1, -1)} />;
            } catch (error) {
              return <span key={index}>{part}</span>;
            }
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start gap-3 sm:mb-6 sm:items-center">
        {isCorrect ? (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-50 sm:h-12 sm:w-12">
            <CheckCircle2 className="h-6 w-6 text-green-600 sm:h-7 sm:w-7" />
          </div>
        ) : (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50 sm:h-12 sm:w-12">
            <XCircle className="h-6 w-6 text-red-600 sm:h-7 sm:w-7" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
            {isCorrect ? "Correct!" : "Incorrect"}
          </h3>
          <p className="text-sm text-gray-600">
            {isCorrect
              ? "Great job! Keep it up."
              : "Don't worry, let's learn from this."}
          </p>
        </div>
      </div>

      {userAnswer && !isCorrect && (
        <div className="mb-4 rounded-lg border-2 border-red-200 bg-red-50 p-3 sm:mb-6 sm:p-4">
          <p className="mb-1 text-sm font-semibold text-red-900">
            Your Answer:
          </p>
          <p className="text-base text-red-900 sm:text-lg">
            {userAnswer}
          </p>
        </div>
      )}

      {correctAnswer && (
        <div className="mb-4 rounded-lg border-2 border-green-200 bg-green-50 p-3 sm:mb-6 sm:p-4">
          <p className="mb-1 text-sm font-semibold text-green-900">
            Correct Answer:
          </p>
          <p className="text-base  text-green-900 sm:text-lg">
            {correctAnswer}
          </p>
        </div>
      )}

      {(explanation || explanationMath) && (
        <div className="rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <p className="font-semibold text-gray-900">Explanation</p>
          </div>
          <div className="text-sm leading-relaxed text-gray-700 sm:text-base">
            {renderMath(explanation, explanationMath)}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImmediateFeedback;
