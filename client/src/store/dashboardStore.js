import { create } from "zustand";
import apiClient from "@/services/apiClient";

const useDashboardStore = create((set) => ({
  user: null,
  level: 1,
  exp: 0,
  nextLevelExp: 1000,
  currentStreak: 0,
  longestStreak: 0,
  analytics: null,
  studyPlan: null,
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get("/users/dashboard");
      
      if (response.data.success) {
        const { user, streak, analytics, studyPlan } = response.data.data;
        
        set({
          user,
          level: user.level,
          exp: user.exp,
          nextLevelExp: user.nextLevelExp,
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          analytics,
          studyPlan,
          isLoading: false,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch dashboard data:", error);
      }
      set({ error: error.message, isLoading: false });
    }
  },

  reset: () => set({
    user: null,
    level: 1,
    exp: 0,
    nextLevelExp: 1000,
    currentStreak: 0,
    longestStreak: 0,
    analytics: null,
    studyPlan: null,
    isLoading: false,
    error: null,
  }),
}));

export default useDashboardStore;
