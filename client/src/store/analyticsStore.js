import { create } from "zustand";

const useAnalyticsStore = create((set) => ({
  categoryStats: [],
  progressData: [],
  weakAreas: [],
  readiness: {},

  updateAnalytics: (data) =>
    set({
      categoryStats: data.categoryStats || [],
      progressData: data.progressData || [],
      weakAreas: data.weakAreas || [],
      readiness: data.readiness || {},
    }),

  reset: () =>
    set({
      categoryStats: [],
      progressData: [],
      weakAreas: [],
      readiness: {},
    }),
}));

export default useAnalyticsStore;
