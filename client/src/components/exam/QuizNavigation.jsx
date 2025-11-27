import { useMemo } from "react";
import useExamStore from "../../store/examStore";

function QuizNavigation({ onQuestionSelect }) {
  const sessionQuestions = useExamStore((state) => state.sessionQuestions);
  const currentQuestionIndex = useExamStore(
    (state) => state.currentQuestionIndex
  );
  const answers = useExamStore((state) => state.answers);
  const setCurrentQuestionIndex = useExamStore(
    (state) => state.setCurrentQuestionIndex
  );

  function handleQuestionClick(index) {
    setCurrentQuestionIndex(index);
    onQuestionSelect?.(index);
  }

  const questionStatusMap = useMemo(() => {
    return sessionQuestions.map((question, index) => ({
      index,
      questionId: question._id,
      isAnswered: answers[question._id] !== undefined,
      isCurrent: index === currentQuestionIndex,
    }));
  }, [sessionQuestions, answers, currentQuestionIndex]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900">Questions</h3>
        <p className="mt-1 text-sm text-gray-600">
          {Object.keys(answers).length} of {sessionQuestions.length} answered
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-300 bg-white p-4">
        <div className="grid grid-cols-4 gap-2">
          {questionStatusMap.map(
            ({ index, questionId, isAnswered, isCurrent }) => (
              <button
                key={questionId}
                onClick={() => handleQuestionClick(index)}
                className={`aspect-square rounded-lg font-semibold transition-all ${
                  isCurrent
                    ? "border-2 border-blue-600 bg-blue-50 text-blue-700"
                    : isAnswered
                      ? "border border-green-300 bg-green-50 text-green-700"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full border border-blue-600 bg-blue-50" />
          <span className="text-gray-600">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-200" />
          <span className="text-gray-600">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-white" />
          <span className="text-gray-600">Unanswered</span>
        </div>
      </div>
    </div>
  );
}

export default QuizNavigation;
