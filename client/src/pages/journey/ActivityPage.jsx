import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useActivityStore from "../../store/activityStore";
import useJourneyStore from "../../store/journeyStore";

function ActivityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentActivity,
    currentQuestion,
    loading,
    fetchActivity,
    startActivity,
    submitAnswer,
    nextQuestion,
    completeActivity,
    clearActivity,
  } = useActivityStore();
  const { fetchJourney } = useJourneyStore();

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showingSummary, setShowingSummary] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchActivity(id);
    startActivity(id);

    return () => clearActivity();
  }, [id]);

  async function handleSubmitAnswer() {
    if (!selectedAnswer) return;

    const question = currentActivity.content.questions[currentQuestion];
    const result = await submitAnswer(id, question._id, selectedAnswer);

    setFeedback(result.feedback);
    setSelectedAnswer(null);
  }

  async function handleNext() {
    const hasMore = nextQuestion();
    setFeedback(null);

    if (!hasMore) {
      const result = await completeActivity(id);
      setSummary(result.summary);
      setShowingSummary(true);
      await fetchJourney();
    }
  }

  function handleFinish() {
    navigate("/journey");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  if (showingSummary && summary) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="rounded-lg border border-gray-300 bg-white p-6">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Activity Complete</h1>
            <p className="text-lg text-gray-600">Great work</p>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-200 p-4 text-center">
              <p className="text-xs text-gray-600">Score</p>
              <p className="text-2xl font-bold text-gray-900">{summary.score}%</p>
            </div>
            <div className="rounded-lg bg-gray-200 p-4 text-center">
              <p className="text-xs text-gray-600">Correct</p>
              <p className="text-2xl font-bold text-gray-900">{summary.correctAnswers}/{summary.totalQuestions}</p>
            </div>
            <div className="rounded-lg bg-gray-200 p-4 text-center">
              <p className="text-xs text-gray-600">XP Earned</p>
              <p className="text-2xl font-bold text-gray-900">+{summary.xpEarned}</p>
            </div>
          </div>

          {summary.strengths.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 font-semibold text-gray-900">Strong Areas</h3>
              <div className="space-y-1">
                {summary.strengths.map((strength, i) => (
                  <div key={i} className="flex items-center justify-between rounded bg-green-50 px-3 py-2 text-sm">
                    <span className="text-gray-900">{strength.topic}</span>
                    <span className="font-semibold text-green-600">{strength.accuracy}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.weaknesses.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Needs Practice</h3>
              <div className="space-y-1">
                {summary.weaknesses.map((weakness, i) => (
                  <div key={i} className="flex items-center justify-between rounded bg-yellow-50 px-3 py-2 text-sm">
                    <span className="text-gray-900">{weakness.topic}</span>
                    <span className="font-semibold text-yellow-600">{weakness.accuracy}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.recommendations.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Recommendations</h3>
              <div className="space-y-2">
                {summary.recommendations.map((rec, i) => (
                  <div key={i} className="rounded-lg border border-gray-300 p-3">
                    <p className="text-sm font-medium text-gray-900">{rec.message}</p>
                    <ul className="mt-1 space-y-1">
                      {rec.actions.map((action, j) => (
                        <li key={j} className="text-xs text-gray-600">• {action}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleFinish}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Continue Journey
          </button>
        </div>
      </div>
    );
  }

  if (!currentActivity) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <p className="text-center text-gray-600">Activity not found</p>
      </div>
    );
  }

  const questions = currentActivity.content.questions || [];
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">{currentActivity.title}</h2>
          <p className="text-sm text-gray-600">
            {currentQuestion + 1} / {questions.length}
          </p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-black transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {question && (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-300 bg-white p-6">
            <p className="text-lg text-gray-900">{question.question}</p>
          </div>

          <div className="space-y-3">
            {question.choices?.map((choice, i) => (
              <button
                key={i}
                onClick={() => !feedback && setSelectedAnswer(choice.text)}
                disabled={!!feedback}
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  selectedAnswer === choice.text
                    ? "border-black bg-gray-50"
                    : "border-gray-300 bg-white hover:border-black"
                } ${feedback ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <p className="text-gray-900">{choice.text}</p>
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`rounded-lg border p-4 ${
              feedback.isCorrect
                ? "border-green-600 bg-green-50"
                : "border-red-600 bg-red-50"
            }`}>
              <p className="mb-2 font-semibold text-gray-900">
                {feedback.isCorrect ? "Correct" : "Incorrect"}
              </p>
              <p className="text-sm text-gray-700">{feedback.explanation}</p>
              {!feedback.isCorrect && (
                <p className="mt-2 text-sm font-medium text-gray-900">
                  Correct answer: {feedback.correctAnswer}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end">
            {!feedback ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
              >
                {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityPage;
