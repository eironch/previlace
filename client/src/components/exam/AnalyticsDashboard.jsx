import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Target, Clock, Zap } from "lucide-react";
import analyticsService from "../../services/analyticsService.js";
import useAnalyticsStore from "../../store/analyticsStore.js";

function AnalyticsDashboard() {
  const { categoryStats, progressData, weakAreas, readiness, updateAnalytics } =
    useAnalyticsStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [catStats, progress, weak, read] = await Promise.all([
          analyticsService.getCategoryStatistics(),
          analyticsService.getProgressReport(30),
          analyticsService.getWeakAreas(),
          analyticsService.getExamReadiness(),
        ]);

        updateAnalytics({
          categoryStats: catStats.categoryStats || [],
          progressData: progress.report?.dailyMetrics || [],
          weakAreas: weak.weakAreas || [],
          readiness: read.readiness || {},
        });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to load analytics:", error);
        }
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [updateAnalytics]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading data...</div>
      </div>
    );
  }

  const overallAccuracy =
    categoryStats.length > 0
      ? Math.round(
          categoryStats.reduce((sum, cat) => sum + cat.percentage, 0) /
            categoryStats.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Overall Accuracy
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {overallAccuracy}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Exam Readiness
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {readiness.readinessScore || 0}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-200">
                <Target size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">Average Time</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {readiness.avgTimePerQuestion || 0}s
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-200">
                <Clock size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">Study Streak</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {readiness.currentStreak || 0} days
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-200">
                <Zap size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Progress Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Category Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryStats}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  angle={-45}
                  height={80}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="percentage" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {categoryStats.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Radar Chart - All Categories
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={categoryStats}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <PolarRadiusAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Radar
                  name="Accuracy %"
                  dataKey="percentage"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {weakAreas.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Weak Areas</h2>
            <div className="space-y-3">
              {weakAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div>
                    <p className="font-semibold text-gray-900">{area.category}</p>
                    <p className="text-sm text-gray-600">
                      {area.count} questions • {(area.averageAccuracy * 100).toFixed(0)}%
                      accuracy
                    </p>
                  </div>
                  <div className="h-2 w-32 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${area.averageAccuracy * 100}%` }}
                    />
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

export default AnalyticsDashboard;
