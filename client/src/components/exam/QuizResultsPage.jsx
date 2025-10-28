import useExamStore from "../../store/examStore";
import { useNavigate } from "react-router-dom";

function QuizResultsPage() {
  const navigate = useNavigate();
  const sessionResult = useExamStore((state) => state.sessionResult);
  const resetSession = useExamStore((state) => state.resetSession);

  if (!sessionResult) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-gray-50 py-12">
        <p className="text-gray-500">No results available</p>
      </div>
    );
  }

  const { score, timing, analytics, answers } = sessionResult;

  function handleRetakeQuiz() {
    resetSession();
  }

  function handleViewAllResults() {
    navigate("/dashboard/quiz-history");
  }

  function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <span className="text-4xl font-bold text-green-600">
                {score.percentage}%
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quiz Completed!
            </h1>
            <p className="mt-2 text-gray-600">
              You scored {score.correct} out of {score.total} questions
              correctly
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm font-medium text-green-600">Correct</p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {score.correct}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-sm font-medium text-red-600">Incorrect</p>
              <p className="mt-2 text-3xl font-bold text-red-700">
                {score.incorrect}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-sm font-medium text-blue-600">Time Taken</p>
              <p className="mt-2 text-2xl font-bold text-blue-700">
                {formatTime(timing.totalTimeSpent)}
              </p>
            </div>
          </div>

          {analytics?.strongAreas && analytics.strongAreas.length > 0 ? (
            <div className="mt-8">
              <h2 className="font-semibold text-gray-900">Strong Areas</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {analytics.strongAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-green-100 px-4 py-2 text-sm text-green-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {analytics?.weakAreas && analytics.weakAreas.length > 0 ? (
            <div className="mt-6">
              <h2 className="font-semibold text-gray-900">Areas to Improve</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {analytics.weakAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-yellow-100 px-4 py-2 text-sm text-yellow-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 space-y-3 border-t border-gray-200 pt-8">
            <button
              onClick={handleRetakeQuiz}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Retake Quiz
            </button>
            <button
              onClick={handleViewAllResults}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              View All Results
            </button>
          </div>
        </div>

        {answers && answers.length > 0 ? (
          <div className="mt-8 rounded-lg bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Answer Review</h2>
            <div className="mt-6 space-y-4">
              {answers.map((answer, index) => (
                <div
                  key={index}
                  className={`rounded-lg border-l-4 p-4 ${
                    answer.isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <p className="font-semibold text-gray-900">
                    Question {index + 1}
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    {answer.question?.questionText}
                  </p>
                  <div className="mt-3 space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Your answer:</span>{" "}
                      <span
                        className={
                          answer.isCorrect ? "text-green-700" : "text-red-700"
                        }
                      >
                        {answer.userAnswer}
                      </span>
                    </p>
                    {!answer.isCorrect ? (
                      <p>
                        <span className="font-medium">Correct answer:</span>{" "}
                        <span className="text-green-700">
                          {answer.correctAnswer}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default QuizResultsPage;
