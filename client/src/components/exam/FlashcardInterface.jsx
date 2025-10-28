import { useState } from "react";
import { useFlashcardStore } from "../../store/flashcardStore";

function FlashcardInterface() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewQuality, setReviewQuality] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const {
    dueFlashcards,
    currentCardIndex,
    nextFlashcard,
    previousFlashcard,
    recordFlashcardReview,
    getProgress,
    getCurrentFlashcard,
    isLoading,
  } = useFlashcardStore();

  const currentFlashcard = getCurrentFlashcard();
  const progress = getProgress();

  function handleFlip() {
    if (!isFlipped && !sessionStartTime) {
      setSessionStartTime(Date.now());
    }
    setIsFlipped(!isFlipped);
  }

  async function handleQualitySubmit(quality) {
    const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
    await recordFlashcardReview(currentFlashcard._id, quality, elapsed);
    setIsFlipped(false);
    setReviewQuality(null);
    setSessionStartTime(null);
    nextFlashcard();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!currentFlashcard) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-900">No flashcards to review</p>
        <p className="mt-2 text-gray-600">Great job! All cards are up to date.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Card {currentCardIndex + 1} of {dueFlashcards.length}</span>
          <div className="h-2 w-32 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div
          onClick={handleFlip}
          className="relative h-64 cursor-pointer rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-8 transition-transform hover:scale-105"
        >
          <div className="flex h-full items-center justify-center">
            {!isFlipped ? (
              <div className="text-center">
                <p className="text-sm text-gray-600">Front</p>
                <p className="mt-4 text-2xl font-semibold text-gray-900">
                  {currentFlashcard.questionId?.questionText || "Loading..."}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600">Back</p>
                <p className="mt-4 text-xl font-semibold text-green-700">
                  {currentFlashcard.questionId?.options?.find((o) => o.isCorrect)?.text || "Loading..."}
                </p>
              </div>
            )}
          </div>
          <p className="absolute bottom-3 right-3 text-xs text-gray-500">
            Click to flip
          </p>
        </div>

        {isFlipped && (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-gray-700">How well did you remember this?</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: 0, label: "Fail" },
                { value: 1, label: "Poor" },
                { value: 2, label: "OK" },
                { value: 3, label: "Good" },
                { value: 4, label: "Easy" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleQualitySubmit(value)}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={previousFlashcard}
          disabled={currentCardIndex === 0}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={nextFlashcard}
          disabled={currentCardIndex === dueFlashcards.length - 1}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default FlashcardInterface;
