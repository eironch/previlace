import React, { useState, useEffect } from "react";
import StandardHeader from "@/components/ui/StandardHeader";
import PerformanceAnalytics from "@/components/admin/analytics/PerformanceAnalytics";
import LearningPatterns from "@/components/admin/analytics/LearningPatterns";
import UserRetention from "@/components/admin/analytics/UserRetention";
import QuizAnalytics from "@/components/admin/analytics/QuizAnalytics";
import CategoryPerformanceChart from "@/components/admin/analytics/CategoryPerformanceChart";
import AdminSkeleton from "@/components/ui/AdminSkeleton";
import useAdminCacheStore from "@/store/adminCacheStore";
import ChartCard from "@/components/ui/ChartCard";

import { DateRangePicker } from "@/components/ui/DateRangePicker";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date Filter State
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { getCachedData, setCachedData } = useAdminCacheStore();
  const CACHE_KEY = 'admin-analytics-stats';

  useEffect(() => {
    loadData();
  }, [dateRange]);

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
      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics?${queryParams}`, { 
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
    <div className="flex flex-col h-full bg-gray-50">
      <StandardHeader 
        title="Analytics Overview" 
        description="Monitor system performance and learning patterns"
        onRefresh={() => fetchStats()}
        endContent={
          <DateRangePicker 
            date={{
              from: dateRange.startDate ? new Date(dateRange.startDate) : undefined,
              to: dateRange.endDate ? new Date(dateRange.endDate) : undefined
            }}
            setDate={(range) => {
              if (range?.from) {
                setDateRange({
                  startDate: range.from.toISOString().split('T')[0],
                  endDate: range.to ? range.to.toISOString().split('T')[0] : range.from.toISOString().split('T')[0]
                });
              }
            }}
          />
        }
      />
      
      <div className="flex-1 overflow-y-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        {isLoading && !stats ? (
          <AdminSkeleton />
        ) : (
          <div className="space-y-6">
            <PerformanceAnalytics stats={stats} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <LearningPatterns stats={stats} />
                <UserRetention data={stats?.userRetention} />
            </div>
            <QuizAnalytics data={stats?.quizStats} />
            <CategoryPerformanceChart data={stats?.categoryStats} />
          </div>
        )}
      </div>
    </div>
  );
}
