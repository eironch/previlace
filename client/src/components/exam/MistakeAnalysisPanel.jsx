import { useEffect } from "react";
import { useMistakeAnalysisStore } from "../../store/mistakeAnalysisStore";

function MistakeAnalysisPanel() {
  const {
    mistakeAnalysis,
    remediationPlan,
    getTotalMistakes,
    getMostCommonMistakeType,
    getTopMistakeCategories,
    fetchAllAnalytics,
    isLoading,
  } = useMistakeAnalysisStore();

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const totalMistakes = getTotalMistakes();
  const commonMistakeType = getMostCommonMistakeType();
  const topCategories = getTopMistakeCategories();

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Mistake Analysis</h2>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-600">Total Mistakes</p>
            <p className="mt-2 text-3xl font-bold text-red-700">{totalMistakes}</p>
          </div>

          {commonMistakeType && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Most Common Mistake Type</p>
              <div className="rounded-lg bg-gray-100 px-4 py-3">
                <p className="font-semibold text-gray-900">{commonMistakeType.type}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {commonMistakeType.percentage}% of mistakes
                </p>
              </div>
            </div>
          )}

          {topCategories.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Problem Areas</p>
              <div className="space-y-2">
                {topCategories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-lg bg-yellow-50 px-4 py-3"
                  >
                    <span className="font-medium text-gray-900">{category}</span>
                    <span className="text-xs font-semibold text-yellow-700">Focus</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {remediationPlan && remediationPlan.remediationPlan && remediationPlan.remediationPlan.length > 0 && (
        <div className="rounded-lg bg-blue-50 p-6 shadow-sm">
          <h3 className="font-semibold text-blue-900">Recommended Study Plan</h3>

          <div className="mt-4 space-y-3">
            {remediationPlan.remediationPlan.slice(0, 3).map((item) => (
              <div key={item.category} className="rounded-lg bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{item.category}</span>
                  <span className="text-xs font-semibold text-blue-600">
                    {item.recommendedSessions} sessions
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Priority: {Math.round(item.priority * 100)}%
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-blue-700">
            Estimated time to mastery: {remediationPlan.estimatedTimeToMastery} hours
          </p>
        </div>
      )}
    </div>
  );
}

export default MistakeAnalysisPanel;
