import { Coffee, X, Play } from "lucide-react";

function BreakReminderModal({ isOpen, onDismiss, onTakeBreak, questionsCompleted }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <Coffee className="h-5 w-5 text-gray-700" />
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h3 className="text-lg font-semibold text-gray-900">Time for a Break?</h3>
        <p className="mt-2 text-sm text-gray-600">
          You've completed {questionsCompleted} questions. Taking short breaks helps maintain focus and improves retention.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onDismiss}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Play className="h-4 w-4" />
            Continue
          </button>
          <button
            onClick={onTakeBreak}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            <Coffee className="h-4 w-4" />
            Take 5 min
          </button>
        </div>
      </div>
    </div>
  );
}

export default BreakReminderModal;
