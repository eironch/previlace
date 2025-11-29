import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  AlertTriangle,
  Users,
  TrendingUp,
  Activity,
  Eye,
  Clock,
  ChevronRight,
  RefreshCw,
  BarChart3,
  BookOpen,
  Target,
} from "lucide-react";
import StandardHeader from "@/components/ui/StandardHeader";
import useBehaviorAnalyticsStore from "@/store/behaviorAnalyticsStore";
import useAdminAnalyticsStore from "@/store/adminAnalyticsStore";
import BehaviorHeatmap from "@/components/admin/charts/BehaviorHeatmap";
import BehaviorTrendChart from "@/components/admin/charts/BehaviorTrendChart";

function StatCard({ title, value, subtitle, icon: Icon, trend, onClick }) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 ${onClick ? "cursor-pointer hover:border-black transition-colors" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <Icon className="h-5 w-5 text-gray-900" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          <TrendingUp className={`h-4 w-4 ${trend > 0 ? "text-green-600" : "text-red-600"}`} />
          <span className={trend > 0 ? "text-green-600" : "text-red-600"}>
            {Math.abs(trend)}%
          </span>
          <span className="text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}

function IntegrityDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.range} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{item.range}</span>
            <span className="text-gray-500">{item.count} ({item.percentage}%)</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-black transition-all"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function InterventionQueuePreview({ data, onViewAll }) {
  if (!data?.interventionQueue || data.interventionQueue.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-gray-500">
        No users require intervention
      </div>
    );
  }

  const queue = data.interventionQueue.slice(0, 5);

  return (
    <div className="space-y-3">
      {queue.map((item) => (
        <div
          key={item.userId}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                item.priority === "high"
                  ? "bg-red-100 text-red-600"
                  : item.priority === "medium"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {item.user?.firstName} {item.user?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {item.flaggedSessions} flagged sessions
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              item.priority === "high"
                ? "bg-red-50 text-red-700"
                : item.priority === "medium"
                ? "bg-yellow-50 text-yellow-700"
                : "bg-gray-50 text-gray-700"
            }`}
          >
            {item.priority}
          </span>
        </div>
      ))}
      {data.interventionQueue.length > 5 && (
        <button
          onClick={onViewAll}
          className="flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          View all {data.interventionQueue.length} users
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function PeakHoursDisplay({ hours }) {
  if (!hours || hours.length === 0) return null;

  function formatHour(hour) {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {hours.slice(0, 6).map((hour) => (
        <span
          key={hour}
          className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
        >
          {formatHour(hour)}
        </span>
      ))}
    </div>
  );
}

export default function BehaviorAnalyticsDashboard() {
  const navigate = useNavigate();
  const {
    overview,
    patterns,
    integrityDistribution,
    interventionQueue,
    isLoading,
    fetchAllDashboardData,
  } = useBehaviorAnalyticsStore();

  const {
    behaviorHeatmap,
    behaviorTrends,
    fetchBehaviorHeatmap,
    fetchBehaviorTrends,
  } = useAdminAnalyticsStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllDashboardData();
    fetchBehaviorHeatmap();
    fetchBehaviorTrends(30);
  }, [fetchAllDashboardData, fetchBehaviorHeatmap, fetchBehaviorTrends]);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([
      fetchAllDashboardData(),
      fetchBehaviorHeatmap(),
      fetchBehaviorTrends(30),
    ]);
    setRefreshing(false);
  }

  const avgScores = overview?.averages || {};

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <StandardHeader
        title="Behavior Analytics"
        description="Monitor user behavior, integrity scores, and intervention needs"
        endContent={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
        {isLoading && !overview ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Sessions Today"
                value={overview?.sessions?.today || 0}
                subtitle={`${overview?.sessions?.week || 0} this week`}
                icon={Activity}
              />
              <StatCard
                title="Avg Integrity"
                value={`${Math.round(avgScores.avgIntegrity || 100)}%`}
                subtitle="Last 30 days"
                icon={Shield}
              />
              <StatCard
                title="Avg Engagement"
                value={`${Math.round(avgScores.avgEngagement || 100)}%`}
                subtitle="Last 30 days"
                icon={Eye}
              />
              <StatCard
                title="Flagged Sessions"
                value={overview?.flaggedCount || 0}
                subtitle="Pending review"
                icon={AlertTriangle}
                onClick={() => navigate("/admin/behavior-analytics/flagged")}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Integrity Score Distribution
                </h3>
                <IntegrityDistributionChart data={integrityDistribution} />
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Intervention Queue
                  </h3>
                  <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                    {interventionQueue?.totalFlagged || 0} total
                  </span>
                </div>
                <InterventionQueuePreview
                  data={interventionQueue}
                  onViewAll={() => navigate("/admin/behavior-analytics/intervention")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Peak Usage Hours</h3>
                </div>
                <PeakHoursDisplay hours={patterns?.peakUsageHours} />
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Tab Switch Rate</h3>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {patterns?.tabSwitchRate?.average?.toFixed(1) || 0}
                    </span>
                    <span className="text-gray-500">avg per session</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Based on {patterns?.totalSessions || 0} sessions
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Focus Loss Rate</h3>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {patterns?.focusLossRate?.average?.toFixed(1) || 0}
                    </span>
                    <span className="text-gray-500">avg per session</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Based on {patterns?.totalSessions || 0} sessions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/admin/behavior-analytics/flagged")}
                className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                <AlertTriangle className="h-5 w-5" />
                Review Flagged Sessions
              </button>
              <button
                onClick={() => navigate("/admin/behavior-analytics/intervention")}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Users className="h-5 w-5" />
                Intervention Queue
              </button>
              <button
                onClick={() => navigate("/admin/analytics/fsrs-performance")}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Target className="h-5 w-5" />
                FSRS Health
              </button>
              <button
                onClick={() => navigate("/admin/analytics/content-effectiveness")}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                Content Analysis
              </button>
            </div>

            {behaviorTrends?.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">30-Day Behavior Trends</h3>
                <BehaviorTrendChart data={behaviorTrends} />
              </div>
            )}

            {behaviorHeatmap && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Activity Heatmap</h3>
                <p className="mb-4 text-sm text-gray-500">Session distribution by day and hour (last 30 days)</p>
                <BehaviorHeatmap data={behaviorHeatmap.heatmap} maxValue={behaviorHeatmap.maxValue} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
