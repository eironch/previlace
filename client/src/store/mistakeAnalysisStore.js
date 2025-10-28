import { create } from "zustand";
import mistakeAnalysisService from "../services/mistakeAnalysisService";

export const useMistakeAnalysisStore = create((set, get) => ({
  mistakeAnalysis: null,
  remediationPlan: null,
  mistakeFrequency: [],
  systematicErrors: [],
  isLoading: false,
  error: null,

  fetchMistakeAnalysis: async (days = 30) => {
    set({ isLoading: true, error: null });

    try {
      const response = await mistakeAnalysisService.getMistakeAnalysis(days);

      if (response.success) {
        set({ mistakeAnalysis: response.data.analysis });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRemediationPlan: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await mistakeAnalysisService.getRemediationPlan();

      if (response.success) {
        set({ remediationPlan: response.data.remediationPlan });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMistakeFrequency: async () => {
    try {
      const response = await mistakeAnalysisService.getMistakeFrequency();

      if (response.success) {
        set({ mistakeFrequency: response.data.frequency });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  fetchSystematicErrors: async () => {
    try {
      const response = await mistakeAnalysisService.getSystematicErrors();

      if (response.success) {
        set({ systematicErrors: response.data.patterns });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  createMistakeQuiz: async (category) => {
    try {
      const response = await mistakeAnalysisService.createMistakeQuiz(category);

      if (response.success) {
        return { success: true, sessionId: response.data.sessionId };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  getTopMistakeCategories: () => {
    const { mistakeAnalysis } = get();
    if (!mistakeAnalysis || !mistakeAnalysis.topProblemCategories) return [];
    return mistakeAnalysis.topProblemCategories;
  },

  getMostCommonMistakeType: () => {
    const { mistakeAnalysis } = get();
    if (!mistakeAnalysis || !mistakeAnalysis.mistakeTrend) return null;
    return mistakeAnalysis.mistakeTrend[0] || null;
  },

  getTotalMistakes: () => {
    const { mistakeAnalysis } = get();
    return mistakeAnalysis?.totalMistakes || 0;
  },

  fetchAllAnalytics: async () => {
    set({ isLoading: true, error: null });

    try {
      await Promise.all([
        get().fetchMistakeAnalysis(),
        get().fetchRemediationPlan(),
        get().fetchMistakeFrequency(),
        get().fetchSystematicErrors(),
      ]);
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useMistakeAnalysisStore;
