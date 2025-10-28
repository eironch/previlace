import { create } from "zustand";
import examService from "../services/examService";

export const useAdaptiveQuizStore = create((set, get) => ({
  adaptiveSession: null,
  currentDifficulty: "beginner",
  performanceHistory: [],
  difficultyAdjustments: [],
  isAdaptive: false,
  error: null,

  startAdaptiveSession: async (config) => {
    set({ error: null, isAdaptive: true });

    try {
      const response = await examService.startAdaptiveQuizSession(config);

      if (response.success) {
        set({
          adaptiveSession: response.data.session,
          currentDifficulty: response.data.initialDifficulty || "beginner",
          performanceHistory: [],
          difficultyAdjustments: [],
        });

        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  recordPerformance: (isCorrect, timeSpent) => {
    set((state) => {
      const updatedHistory = [
        ...state.performanceHistory,
        { isCorrect, timeSpent, timestamp: Date.now() },
      ];

      const recentWindow = updatedHistory.slice(-10);
      const recentAccuracy =
        recentWindow.filter((p) => p.isCorrect).length / recentWindow.length;

      let newDifficulty = state.currentDifficulty;

      if (recentAccuracy >= 0.8 && state.currentDifficulty !== "advanced") {
        newDifficulty = "advanced";
        set({
          difficultyAdjustments: [
            ...state.difficultyAdjustments,
            {
              from: state.currentDifficulty,
              to: "advanced",
              reason: "High accuracy",
              timestamp: Date.now(),
            },
          ],
        });
      } else if (
        recentAccuracy < 0.5 &&
        state.currentDifficulty !== "beginner"
      ) {
        newDifficulty = "beginner";
        set({
          difficultyAdjustments: [
            ...state.difficultyAdjustments,
            {
              from: state.currentDifficulty,
              to: "beginner",
              reason: "Low accuracy",
              timestamp: Date.now(),
            },
          ],
        });
      }

      return {
        performanceHistory: updatedHistory,
        currentDifficulty: newDifficulty,
      };
    });
  },

  getDifficultyTrend: () => {
    const { performanceHistory } = get();

    if (performanceHistory.length < 3) {
      return "insufficient_data";
    }

    const chunks = [];
    const chunkSize = Math.floor(performanceHistory.length / 3);

    for (let i = 0; i < 3; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const chunk = performanceHistory.slice(start, end);
      const accuracy =
        chunk.filter((p) => p.isCorrect).length / chunk.length;
      chunks.push(accuracy);
    }

    const improving = chunks[2] > chunks[0];
    return improving ? "improving" : "declining";
  },

  getCurrentAccuracy: () => {
    const { performanceHistory } = get();

    if (performanceHistory.length === 0) return 0;

    const correctCount = performanceHistory.filter(
      (p) => p.isCorrect
    ).length;
    return Math.round((correctCount / performanceHistory.length) * 100);
  },

  resetAdaptiveSession: () => {
    set({
      adaptiveSession: null,
      currentDifficulty: "beginner",
      performanceHistory: [],
      difficultyAdjustments: [],
      isAdaptive: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAdaptiveQuizStore;
