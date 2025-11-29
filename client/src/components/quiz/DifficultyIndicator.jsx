import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function DifficultyIndicator({ currentDifficulty, previousDifficulty, showLabel = true }) {
  function getDifficultyConfig(difficulty) {
    switch (difficulty) {
      case "beginner":
        return { label: "Easy", color: "text-gray-500", bg: "bg-gray-100" };
      case "intermediate":
        return { label: "Medium", color: "text-gray-700", bg: "bg-gray-200" };
      case "advanced":
        return { label: "Hard", color: "text-gray-900", bg: "bg-gray-300" };
      default:
        return { label: "Medium", color: "text-gray-700", bg: "bg-gray-200" };
    }
  }

  function getTrendIcon() {
    if (!previousDifficulty || previousDifficulty === currentDifficulty) {
      return <Minus className="h-3 w-3 text-gray-400" />;
    }
    const levels = { beginner: 1, intermediate: 2, advanced: 3 };
    const current = levels[currentDifficulty] || 2;
    const previous = levels[previousDifficulty] || 2;
    if (current > previous) {
      return <TrendingUp className="h-3 w-3 text-gray-700" />;
    }
    return <TrendingDown className="h-3 w-3 text-gray-500" />;
  }

  const config = getDifficultyConfig(currentDifficulty);

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${config.bg}`}>
        {showLabel && (
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        )}
        {previousDifficulty && getTrendIcon()}
      </div>
    </div>
  );
}

export default DifficultyIndicator;
