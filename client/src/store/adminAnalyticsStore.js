import { create } from "zustand";
import adminAnalyticsService from "@/services/adminAnalyticsService";

const useAdminAnalyticsStore = create((set, get) => ({
  fsrsHealth: null,
  retentionCurve: null,
  workloadProjection: null,
  contentEffectiveness: null,
  subjectCompletion: null,
  behaviorHeatmap: null,
  systemHealth: null,
  behaviorTrends: null,
  userTimeline: null,
  isLoading: false,
  error: null,

  fetchFSRSHealth: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAnalyticsService.getFSRSHealth();
      set({ fsrsHealth: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchRetentionCurve: async () => {
    try {
      const response = await adminAnalyticsService.getRetentionCurve();
      set({ retentionCurve: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchWorkloadProjection: async (days = 7) => {
    try {
      const response = await adminAnalyticsService.getWorkloadProjection(days);
      set({ workloadProjection: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchContentEffectiveness: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAnalyticsService.getContentEffectiveness();
      set({ contentEffectiveness: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchSubjectCompletion: async () => {
    try {
      const response = await adminAnalyticsService.getSubjectCompletionRates();
      set({ subjectCompletion: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchBehaviorHeatmap: async () => {
    try {
      const response = await adminAnalyticsService.getBehaviorHeatmap();
      set({ behaviorHeatmap: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchSystemHealth: async () => {
    try {
      const response = await adminAnalyticsService.getSystemHealth();
      set({ systemHealth: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchBehaviorTrends: async (days = 30) => {
    try {
      const response = await adminAnalyticsService.getBehaviorTrends(days);
      set({ behaviorTrends: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchUserTimeline: async (userId, days = 30) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAnalyticsService.getUserBehaviorTimeline(userId, days);
      set({ userTimeline: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchAllFSRSData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [health, workload] = await Promise.all([
        adminAnalyticsService.getFSRSHealth(),
        adminAnalyticsService.getWorkloadProjection(7),
      ]);
      set({
        fsrsHealth: health.data,
        workloadProjection: workload.data,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchAllContentData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [effectiveness, completion] = await Promise.all([
        adminAnalyticsService.getContentEffectiveness(),
        adminAnalyticsService.getSubjectCompletionRates(),
      ]);
      set({
        contentEffectiveness: effectiveness.data,
        subjectCompletion: completion.data,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      fsrsHealth: null,
      retentionCurve: null,
      workloadProjection: null,
      contentEffectiveness: null,
      subjectCompletion: null,
      behaviorHeatmap: null,
      systemHealth: null,
      behaviorTrends: null,
      userTimeline: null,
      isLoading: false,
      error: null,
    }),
}));

export default useAdminAnalyticsStore;
