import { X, Coffee, TrendingDown, AlertCircle, Lightbulb, Clock } from "lucide-react";

function AdaptiveFeedbackOverlay({ suggestions, onDismiss, onAction }) {
  if (!suggestions || suggestions.length === 0) return null;

  function getIcon(type) {
    switch (type) {
      case "break_suggestion":
        return Coffee;
      case "difficulty_reduction":
        return TrendingDown;
      case "encouragement":
        return Lightbulb;
      case "focus_reminder":
        return AlertCircle;
      case "pacing":
        return Clock;
      default:
        return Lightbulb;
    }
  }

  function getPriorityStyle(priority) {
    switch (priority) {
      case "high":
        return "border-gray-900 bg-gray-50";
      case "medium":
        return "border-gray-400 bg-white";
      default:
        return "border-gray-200 bg-white";
    }
  }

  function getActionButton(suggestion) {
    if (suggestion.type === "break_suggestion") {
      return (
        <button
          onClick={() => onAction?.(suggestion.type, "take_break")}
          className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Take Break
        </button>
      );
    }
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {suggestions.slice(0, 2).map((suggestion, index) => {
        const Icon = getIcon(suggestion.type);
        return (
          <div
            key={`${suggestion.type}-${index}`}
            className={`rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right ${getPriorityStyle(suggestion.priority)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Icon className="h-4 w-4 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{suggestion.message}</p>
                {getActionButton(suggestion) && (
                  <div className="mt-2">{getActionButton(suggestion)}</div>
                )}
              </div>
              <button
                onClick={() => onDismiss(suggestion.type)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AdaptiveFeedbackOverlay;
