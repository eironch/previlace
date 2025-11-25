import { useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Brain,
  Award,
} from "lucide-react";
import StandardHeader from "@/components/ui/StandardHeader";
import useAnalyticsStore from "@/store/analyticsStore";

function PerformancePage() {
  const { analyticsData: analytics, fetchAnalytics, isLoading: loading } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  function getPerformanceColor(percentage) {
    if (percentage >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (percentage >= 60)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  }

  function getTrendIcon(current, previous) {
    if (!previous) return null;
    return current > previous ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  }

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-white">
        <StandardHeader title="Performance" />
        <div className="flex h-[calc(100vh-73px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-white">
        <StandardHeader title="Performance" />
        <div className="flex h-[calc(100vh-73px)] items-center justify-center">
          <p className="text-gray-400">
            No performance data available yet. Take a quiz to see your
            analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Performance</h1>
          <p className="text-gray-600">Analyze your quiz results and improvement</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Overall Accuracy
                </p>
                <p className="text-2xl font-bold text-black">
                  {analytics.overall?.accuracy?.toFixed(1) || 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Questions Answered
                </p>
                <p className="text-2xl font-bold text-black">
                  {analytics.overall?.totalQuestions || 0}
                </p>
              </div>
              <Brain className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Time</p>
                <p className="text-2xl font-bold text-black">
                  {Math.round(
                    (analytics.overall?.totalTimeSpent || 0) / 3600000
                  )}
                  h
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best Score</p>
                <p className="text-2xl font-bold text-black">
                  {analytics.overall?.bestScore?.toFixed(0) || 0}%
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold text-black">
              Category Performance
            </h3>
            <div className="space-y-4">
              {analytics.categories?.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black">
                      {category.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded border px-2 py-1 text-xs ${getPerformanceColor(category.accuracy)}`}
                      >
                        {category.accuracy?.toFixed(0)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {category.totalQuestions} questions
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${category.accuracy || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold text-black">
              Difficulty Analysis
            </h3>
            <div className="space-y-4">
              {analytics.difficulty?.map((diff) => (
                <div key={diff.difficulty} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black capitalize">
                      {diff.difficulty}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded border px-2 py-1 text-xs ${getPerformanceColor(diff.accuracy)}`}
                      >
                        {diff.accuracy?.toFixed(0)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round((diff.averageTime || 0) / 1000)}s avg
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${diff.accuracy || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {analytics.trends && analytics.trends.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold text-black">
              Recent Performance Trends
            </h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
              {analytics.trends.map((trend, index) => (
                <div
                  key={trend._id}
                  className="rounded-lg border p-3 text-center"
                >
                  <div className="mb-1 text-xs text-gray-500">{trend._id}</div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-black">
                      {trend.averageScore?.toFixed(0)}%
                    </span>
                    {index > 0 &&
                      getTrendIcon(
                        trend.averageScore,
                        analytics.trends[index - 1]?.averageScore
                      )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {trend.sessionCount} sessions
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics.recommendations && analytics.recommendations.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold text-black">
              Recommendations
            </h3>
            <div className="space-y-3">
              {analytics.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${
                    rec.priority === "high"
                      ? "border-red-200 bg-red-50"
                      : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`rounded border px-2 py-1 text-xs font-medium ${rec.priority === "high" ? "text-red-600" : "text-yellow-600"}`}
                    >
                      {rec.priority}
                    </span>
                    <div>
                      <p className="font-medium text-black">{rec.message}</p>
                      {rec.categories && (
                        <p className="mt-1 text-sm text-gray-600">
                          Focus areas: {rec.categories.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerformancePage;
