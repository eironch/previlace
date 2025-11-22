import { create } from "zustand";
import analyticsService from "../services/analyticsService";

const useAnalyticsStore = create((set, get) => ({
  categoryStats: [],
  progressData: [],
  weakAreas: [],
  readiness: {},
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
        readiness: {
          overall: data.totalQuestions?.accuracy || 0,
          details: data.totalQuestions || {}
        },
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
      isLoading: false,
      error: null,
    }),
}));

export default useAnalyticsStore;
