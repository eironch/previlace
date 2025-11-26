import React, { useState, useEffect } from "react";
import StandardHeader from "@/components/ui/StandardHeader";
import PerformanceAnalytics from "@/components/admin/analytics/PerformanceAnalytics";
import LearningPatterns from "@/components/admin/analytics/LearningPatterns";
import AdminSkeleton from "@/components/ui/AdminSkeleton";
import useAdminCacheStore from "@/store/adminCacheStore";
import { AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getCachedData, setCachedData } = useAdminCacheStore();
  const CACHE_KEY = 'admin-analytics-stats';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const cached = getCachedData(CACHE_KEY);
    if (cached) {
      setStats(cached.data);
      setIsLoading(false);
      if (!cached.isStale) return;
    }

    await fetchStats(!!cached);
  }

  async function fetchStats(isBackgroundRefresh = false) {
    if (!isBackgroundRefresh) setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, { 
        credentials: "include" 
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
        setCachedData(CACHE_KEY, data.data);
      } else {
        throw new Error(data.message || "Failed to load analytics");
      }
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
      // Only show error if we don't have cached data
      if (!stats) {
        setError("Failed to load analytics data");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader 
        title="Analytics Overview" 
        description="Monitor system performance and learning patterns"
        onRefresh={() => fetchStats()}
      />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading && !stats ? (
          <AdminSkeleton />
        ) : (
          <div className="grid gap-6">
            <PerformanceAnalytics stats={stats} />
            <LearningPatterns stats={stats} />
          </div>
        )}
      </div>
    </div>
  );
}
