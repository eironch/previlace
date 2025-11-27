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
    set({ isLoading: true, error: null });

    try {
      // Add minimum delay to ensure animation is visible
      const [data] = await Promise.all([
        analyticsService.getStudentAnalytics(),
        new Promise(resolve => setTimeout(resolve, 500))
      ]);

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
