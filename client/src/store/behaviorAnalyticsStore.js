import { create } from "zustand";
import behaviorAnalyticsService from "@/services/behaviorAnalyticsService";

const useBehaviorAnalyticsStore = create((set, get) => ({
  overview: null,
  patterns: null,
  integrityDistribution: null,
  interventionQueue: null,
  flaggedSessions: null,
  userDetail: null,
  trends: null,
  isLoading: false,
  error: null,

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await behaviorAnalyticsService.getAdminAnalyticsOverview();
      set({ overview: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchPatterns: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await behaviorAnalyticsService.getAdminBehaviorPatterns();
      set({ patterns: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchIntegrityDistribution: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await behaviorAnalyticsService.getAdminIntegrityDistribution();
      set({ integrityDistribution: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchInterventionQueue: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await behaviorAnalyticsService.getInterventionQueue();
      set({ interventionQueue: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchFlaggedSessions: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await behaviorAnalyticsService.getFlaggedSessions(filters);
      set({ flaggedSessions: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchUserDetail: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await behaviorAnalyticsService.getUserBehaviorDetail(userId);
      set({ userDetail: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  reviewSession: async (sessionId, reviewData) => {
    try {
      const response = await behaviorAnalyticsService.reviewFlaggedSession(sessionId, reviewData);
      const { flaggedSessions } = get();
      if (flaggedSessions) {
        set({
          flaggedSessions: flaggedSessions.filter((s) => s._id !== sessionId),
        });
      }
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchAllDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [overview, patterns, distribution, queue] = await Promise.all([
        behaviorAnalyticsService.getAdminAnalyticsOverview(),
        behaviorAnalyticsService.getAdminBehaviorPatterns(),
        behaviorAnalyticsService.getAdminIntegrityDistribution(),
        behaviorAnalyticsService.getInterventionQueue(),
      ]);
      set({
        overview: overview.data,
        patterns: patterns.data,
        integrityDistribution: distribution.data,
        interventionQueue: queue.data,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({
    overview: null,
    patterns: null,
    integrityDistribution: null,
    interventionQueue: null,
    flaggedSessions: null,
    userDetail: null,
    trends: null,
    isLoading: false,
    error: null,
  }),
}));

export default useBehaviorAnalyticsStore;
