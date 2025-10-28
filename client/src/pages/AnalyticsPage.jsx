import { useEffect } from "react";
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
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Target, Clock, Zap } from "lucide-react";
import StandardHeader from "@/components/ui/StandardHeader";
import useExamStore from "@/store/examStore";

function AnalyticsPage() {
  const { fetchAnalytics, analytics, loading } = useExamStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <StandardHeader title="Analytics" showBack={true} />
        <div className="flex h-[calc(100vh-73px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  const categoryData = analytics?.categories || [];
  const overallStats = analytics?.overall || {};
  const trendsData = analytics?.trends || [];

  return (
    <div className="min-h-screen bg-white">
      <StandardHeader title="Analytics" showBack={true} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  OVERALL ACCURACY
                </p>
                <p className="mt-2 text-3xl font-bold text-black">
                  {Math.round(overallStats?.accuracy || 0)}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  QUESTIONS ANSWERED
                </p>
                <p className="mt-2 text-3xl font-bold text-black">
                  {overallStats?.totalQuestions || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">AVG TIME</p>
                <p className="mt-2 text-3xl font-bold text-black">
                  {Math.round(overallStats?.averageSessionTime / 1000 / 60 || 0)}m
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">SESSIONS</p>
                <p className="mt-2 text-3xl font-bold text-black">
                  {overallStats?.totalSessions || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {categoryData.length > 0 && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-bold text-black">
                  Category Performance
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      angle={-45}
                      height={80}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Bar dataKey="accuracy" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-bold text-black">
                  Progress Over Time
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendsData}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="_id"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="averageScore"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mb-8 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-bold text-black">
                Radar Chart - All Categories
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={categoryData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <PolarRadiusAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Radar
                    name="Accuracy %"
                    dataKey="accuracy"
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

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-bold text-black">
                Detailed Performance
              </h2>
              <div className="space-y-3">
                {categoryData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div>
                      <p className="font-semibold text-black">
                        {item.category}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.correctAnswers} correct out of {item.totalQuestions} questions
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${Math.min(100, item.accuracy)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-black">
                        {Math.round(item.accuracy)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {(!categoryData || categoryData.length === 0) && (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-600">
              No analytics data available. Complete some quizzes to see your
              performance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
