import { create } from "zustand";
import adaptivityService from "@/services/adaptivityService";

const useAdaptiveStore = create((set, get) => ({
  config: null,
  suggestions: [],
  behaviorMetrics: null,
  sessionRecommendations: null,
  isLoadingConfig: false,
  isCheckingAdjustments: false,
  error: null,
  currentDifficulty: "intermediate",
  difficultyHistory: [],
  showBreakReminder: false,
  lastBreakTime: null,
  questionsAnswered: 0,
  correctAnswers: 0,
  totalTimeSpent: 0,

  loadConfig: async (options = {}) => {
    set({ isLoadingConfig: true, error: null });
    try {
      const response = await adaptivityService.getAdaptedQuizConfig(options);
      if (response.success) {
        const difficulty = response.data?.config?.difficultyBias || "intermediate";
        set({
          config: response.data,
          currentDifficulty: difficulty,
          difficultyHistory: [{ difficulty, timestamp: Date.now(), reason: "initial" }],
          isLoadingConfig: false,
        });
        return response.data;
      }
      throw new Error(response.message || "Failed to load config");
    } catch (error) {
      set({ error: error.message, isLoadingConfig: false });
      return null;
    }
  },

  checkMidQuizAdjustments: async (quizAttemptId, currentBehavior) => {
    if (!quizAttemptId) return null;
    set({ isCheckingAdjustments: true });
    try {
      const response = await adaptivityService.getMidQuizAdjustments(
        quizAttemptId,
        currentBehavior
      );
      if (response.success && response.data) {
        const { suggestions, metrics, adjustments } = response.data;
        set({
          suggestions: suggestions || [],
          behaviorMetrics: metrics || null,
          isCheckingAdjustments: false,
        });
        if (adjustments?.length > 0) {
          const difficultyAdjust = adjustments.find((a) => a.type === "difficulty_reduction");
          if (difficultyAdjust) {
            get().updateDifficulty("beginner", difficultyAdjust.reason);
          }
        }
        return response.data;
      }
      set({ isCheckingAdjustments: false });
      return null;
    } catch (error) {
      set({ isCheckingAdjustments: false });
      return null;
    }
  },

  loadSessionRecommendations: async () => {
    try {
      const response = await adaptivityService.getSessionRecommendations();
      if (response.success) {
        set({ sessionRecommendations: response.data });
        return response.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  updateDifficulty: (newDifficulty, reason = "adjustment") => {
    set((state) => ({
      currentDifficulty: newDifficulty,
      difficultyHistory: [
        ...state.difficultyHistory,
        { difficulty: newDifficulty, timestamp: Date.now(), reason },
      ],
    }));
  },

  recordAnswer: (isCorrect, timeSpent) => {
    set((state) => ({
      questionsAnswered: state.questionsAnswered + 1,
      correctAnswers: isCorrect ? state.correctAnswers + 1 : state.correctAnswers,
      totalTimeSpent: state.totalTimeSpent + timeSpent,
    }));
  },

  dismissSuggestion: (suggestionType) => {
    set((state) => ({
      suggestions: state.suggestions.filter((s) => s.type !== suggestionType),
    }));
  },

  triggerBreakReminder: () => {
    set({ showBreakReminder: true });
  },

  dismissBreakReminder: () => {
    set({ showBreakReminder: false, lastBreakTime: Date.now() });
  },

  getAccuracy: () => {
    const { questionsAnswered, correctAnswers } = get();
    if (questionsAnswered === 0) return 0;
    return Math.round((correctAnswers / questionsAnswered) * 100);
  },

  shouldCheckAdjustments: (questionNumber) => {
    return questionNumber > 0 && questionNumber % 5 === 0;
  },

  getBreakInterval: () => {
    const { config } = get();
    return config?.config?.breakSuggestionInterval || null;
  },

  reset: () => {
    set({
      config: null,
      suggestions: [],
      behaviorMetrics: null,
      currentDifficulty: "intermediate",
      difficultyHistory: [],
      showBreakReminder: false,
      lastBreakTime: null,
      questionsAnswered: 0,
      correctAnswers: 0,
      totalTimeSpent: 0,
      error: null,
    });
  },
}));

export default useAdaptiveStore;
