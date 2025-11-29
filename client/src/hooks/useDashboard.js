import useSWR from "swr";
import apiClient from "../services/apiClient";

const fetcher = (url) => apiClient.get(url).then((res) => res.data);

export function useDashboard() {
  // Fetch base data (User, Streak) - Fast
  const { data: baseData, error: baseError, isLoading: isBaseLoading, mutate: mutateBase } = useSWR(
    "/users/dashboard/base",
    fetcher
  );

  // Fetch schedule (Full plan) - Medium
  const { data: scheduleData, error: scheduleError, isLoading: isScheduleLoading, mutate: mutateSchedule } = useSWR(
    "/users/dashboard/schedule",
    fetcher
  );

  // Fetch analytics (Charts) - Slow
  const { data: analyticsData, error: analyticsError, isLoading: isAnalyticsLoading, mutate: mutateAnalytics } = useSWR(
    "/users/dashboard/analytics",
    fetcher
  );

  const isLoading = isBaseLoading || isScheduleLoading || isAnalyticsLoading;
  const error = baseError || scheduleError || analyticsError;

  // Combine data
  const user = baseData?.data?.user;
  const streak = baseData?.data?.streak;
  const studyPlan = scheduleData?.data?.studyPlan;
  const analytics = analyticsData?.data?.analytics;

  const refreshDashboard = () => {
    mutateBase();
    mutateSchedule();
    mutateAnalytics();
  };

  return {
    user,
    streak,
    studyPlan,
    analytics,
    isLoading,
    isBaseLoading,
    isScheduleLoading,
    isAnalyticsLoading,
    error,
    refreshDashboard,
  };
}
