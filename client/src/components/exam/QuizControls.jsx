import useExamStore from "../../store/examStore";

function QuizControls() {
  const sessionActive = useExamStore((state) => state.sessionActive);
  const isPaused = useExamStore((state) => state.isPaused);
  const pauseSession = useExamStore((state) => state.pauseSession);
  const resumeSession = useExamStore((state) => state.resumeSession);
  const completeSession = useExamStore((state) => state.completeSession);
  const resetSession = useExamStore((state) => state.resetSession);

  async function handlePause() {
    await pauseSession();
  }

  async function handleResume() {
    await resumeSession();
  }

  async function handleSubmit() {
    await completeSession();
  }

  function handleExit() {
    if (window.confirm("Are you sure? Your progress will be lost.")) {
      resetSession();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {sessionActive ? (
        <button
          onClick={handlePause}
          className="w-full rounded-lg bg-yellow-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-yellow-700 disabled:opacity-50"
        >
          Pause Quiz
        </button>
      ) : null}

      {isPaused ? (
        <button
          onClick={handleResume}
          className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          Resume Quiz
        </button>
      ) : null}

      <button
        onClick={handleSubmit}
        disabled={!sessionActive && !isPaused}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        Submit Quiz
      </button>

      <button
        onClick={handleExit}
        className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        Exit Quiz
      </button>
    </div>
  );
}

export default QuizControls;
