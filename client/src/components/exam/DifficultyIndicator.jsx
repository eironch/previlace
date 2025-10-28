import { useAdaptiveQuizStore } from "../../store/adaptiveQuizStore";

function DifficultyIndicator() {
  const { currentDifficulty, getCurrentAccuracy, getDifficultyTrend } = useAdaptiveQuizStore();

  const accuracy = getCurrentAccuracy();
  const trend = getDifficultyTrend();

  const difficultyConfig = {
    beginner: {
      color: "bg-green-100 text-green-700",
      bgColor: "bg-green-50",
      label: "Beginner",
      description: "Building fundamentals",
    },
    intermediate: {
      color: "bg-blue-100 text-blue-700",
      bgColor: "bg-blue-50",
      label: "Intermediate",
      description: "Strengthening skills",
    },
    advanced: {
      color: "bg-purple-100 text-purple-700",
      bgColor: "bg-purple-50",
      label: "Advanced",
      description: "Mastering concepts",
    },
  };

  const config = difficultyConfig[currentDifficulty];

  return (
    <div className={`rounded-lg p-4 ${config.bgColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${config.color}`}>
            {config.label}
          </div>
          <p className="mt-2 text-sm text-gray-600">{config.description}</p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{accuracy}%</p>
          <p className="text-xs text-gray-600">Accuracy</p>
          {trend !== "insufficient_data" && (
            <p className={`mt-1 text-xs font-semibold ${trend === "improving" ? "text-green-600" : "text-red-600"}`}>
              {trend === "improving" ? "Improving" : "Declining"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DifficultyIndicator;
