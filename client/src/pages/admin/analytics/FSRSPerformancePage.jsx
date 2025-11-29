import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, Target, Calendar, TrendingUp, RefreshCw, Settings } from "lucide-react";
import useAdminAnalyticsStore from "@/store/adminAnalyticsStore";
import RetentionCurveChart from "@/components/admin/charts/RetentionCurveChart";
import WorkloadProjectionChart from "@/components/admin/charts/WorkloadProjectionChart";
import ParameterDistributionChart from "@/components/admin/charts/ParameterDistributionChart";
import FSRSOptimizationStatus from "@/components/admin/FSRSOptimizationStatus";
import adminAnalyticsService from "@/services/adminAnalyticsService";

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
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
    </div>
  );
}

export default function FSRSPerformancePage() {
  const navigate = useNavigate();
  const { fsrsHealth, workloadProjection, isLoading, fetchAllFSRSData } = useAdminAnalyticsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [optimizationData, setOptimizationData] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    fetchAllFSRSData();
    loadOptimizationData();
  }, [fetchAllFSRSData]);

  async function loadOptimizationData() {
    try {
      const response = await adminAnalyticsService.getOptimizationQueue();
      if (response.success) {
        setOptimizationData(response.data);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load optimization data:", error);
      }
    }
  }

  async function handleTriggerOptimization(userIds) {
    setIsOptimizing(true);
    try {
      await adminAnalyticsService.triggerOptimization(userIds);
      await loadOptimizationData();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Optimization failed:", error);
      }
    } finally {
      setIsOptimizing(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchAllFSRSData();
    setRefreshing(false);
  }

  const accuracy = fsrsHealth?.accuracy || {};
  const optimization = fsrsHealth?.userOptimization || {};
  const retention = fsrsHealth?.retentionCurve || {};

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/behavior-analytics")}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FSRS System Health</h1>
              <p className="text-sm text-gray-500">Spaced repetition algorithm performance metrics</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("optimization")}
            className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "optimization"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Settings className="h-4 w-4" />
            Optimization
            {optimizationData?.pendingOptimization > 0 && (
              <span className="rounded-full bg-gray-900 px-1.5 py-0.5 text-xs text-white">
                {optimizationData.pendingOptimization}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "optimization" && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">FSRS Parameter Optimization</h3>
            <p className="mb-4 text-sm text-gray-500">
              Optimize spaced repetition parameters for users based on their learning patterns
            </p>
            <FSRSOptimizationStatus
              data={optimizationData}
              onTriggerOptimization={handleTriggerOptimization}
              isOptimizing={isOptimizing}
            />
          </div>
        )}

        {activeTab === "overview" && isLoading && !fsrsHealth ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Prediction Accuracy"
                value={`${accuracy.predicted || 0}%`}
                subtitle={`Actual: ${accuracy.actual || 0}% (${accuracy.deviation || 0}% deviation)`}
                icon={Target}
              />
              <StatCard
                title="Optimized Users"
                value={`${optimization.optimizedUsers || 0}`}
                subtitle={`${optimization.pendingOptimization || 0} pending`}
                icon={Activity}
              />
              <StatCard
                title="Avg Daily Workload"
                value={`${workloadProjection?.avgDue || 0}`}
                subtitle={`Reviews/day (${workloadProjection?.trend || "stable"})`}
                icon={Calendar}
              />
              <StatCard
                title="Sample Size"
                value={accuracy.sampleSize?.toLocaleString() || "0"}
                subtitle="Last 30 days"
                icon={TrendingUp}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Retention Curve</h3>
                <p className="mb-4 text-sm text-gray-500">Predicted vs actual retention over time</p>
                <RetentionCurveChart
                  predicted={retention.predicted}
                  actual={retention.actual}
                />
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">7-Day Workload Projection</h3>
                <p className="mb-4 text-sm text-gray-500">Expected due reviews per day</p>
                <WorkloadProjectionChart data={workloadProjection} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Retention Target Distribution</h3>
                <p className="mb-4 text-sm text-gray-500">User optimal retention settings</p>
                {optimization.retentionTargets ? (
                  <ParameterDistributionChart
                    data={Object.entries(optimization.retentionTargets).map(([range, count]) => ({
                      label: range,
                      count,
                      percentage: optimization.totalUsers > 0
                        ? Math.round((count / optimization.totalUsers) * 100)
                        : 0,
                    }))}
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center text-gray-500">
                    No distribution data available
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">System Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-sm text-gray-600">Total Users</span>
                    <span className="font-semibold text-gray-900">{optimization.totalUsers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-sm text-gray-600">Optimization Rate</span>
                    <span className="font-semibold text-gray-900">
                      {optimization.totalUsers > 0
                        ? Math.round((optimization.optimizedUsers / optimization.totalUsers) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-sm text-gray-600">Last Batch Optimized</span>
                    <span className="font-semibold text-gray-900">
                      {optimization.lastBatchOptimized
                        ? new Date(optimization.lastBatchOptimized).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Prediction Deviation</span>
                    <span className={`font-semibold ${accuracy.deviation > 10 ? "text-red-600" : "text-gray-900"}`}>
                      {accuracy.deviation || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
