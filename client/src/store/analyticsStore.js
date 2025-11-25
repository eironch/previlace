import { create } from "zustand";
import analyticsService from "../services/analyticsService";

const useAnalyticsStore = create((set, get) => ({
  categoryStats: [],
  progressData: [],
  weakAreas: [],
  overallProgress: [],
  subjectWeeklyProgress: {},
  analyticsData: null,
  isLoading: false,
  error: null,

  fetchAnalytics: async () => {
    const currentStats = get().categoryStats || [];
    if (currentStats.length === 0) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const data = await analyticsService.getStudentAnalytics();
      set({
        categoryStats: data.categories || [],
        progressData: data.recentProgress || [],
        weakAreas: data.weakAreas || [],
        analyticsData: data, // Store full data for PerformancePage
        readiness: {
          overall: data.accuracy || 0,
          details: {
            totalQuestions: data.totalQuestions || 0,
            readinessLevel: data.readiness || "Low"
          }
        },
        overallProgress: data.overallProgress || [],
        subjectWeeklyProgress: data.subjectWeeklyProgress || {},
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  reset: () =>
    set({
      categoryStats: [],
      progressData: [],
      weakAreas: [],
      readiness: {},
      overallProgress: [],
      subjectWeeklyProgress: {},
      analyticsData: null,
      isLoading: false,
      error: null,
    }),
}));

export default useAnalyticsStore;
