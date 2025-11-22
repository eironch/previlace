import { create } from "zustand";
import activityService from "../services/activityService";

const useActivityStore = create((set, get) => ({
  currentActivity: null,
  activities: [],
  weekActivities: [],
  mistakes: [],
  todayActivity: null,
  weeklyProgress: [],

  fetchTodayActivity: async () => {
    const current = get().todayActivity;
    // We might want to refresh today's activity if it's a new day, but for now let's cache it.
    // A simple check is if we have it.
    if (!current) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }
    try {
      const data = await activityService.getTodayActivity();
      set({ todayActivity: data.activity, loading: false });
      return data.activity;
    } catch (error) {
      set({ error: error.message, loading: false });
      // Don't throw to avoid crashing UI, just let error state handle it
    }
  },

  fetchWeeklyProgress: async () => {
    const current = get().weeklyProgress || [];
    if (current.length === 0) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }
    try {
      const data = await activityService.getWeeklyProgress();
      set({ weeklyProgress: data.weeklyProgress || [], loading: false });
      return data.weeklyProgress;
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  loading: false,
  error: null,
  currentQuestion: 0,
  answers: [],
  startTime: null,
  questionStartTime: null,

  fetchActivitiesByWeek: async (studyPlanId, weekNumber) => {
    const currentActivities = get().weekActivities || [];
    if (currentActivities.length === 0) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }
    try {
      const data = await activityService.getActivitiesByWeek(studyPlanId, weekNumber);
      set({ weekActivities: data.activities || [], loading: false });
      return data.activities;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchActivity: async (id) => {
    const current = get().currentActivity;
    if (!current || current._id !== id) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }
    try {
      const data = await activityService.getActivity(id);
      set({
        currentActivity: data.activity,
        loading: false,
        currentQuestion: 0,
        answers: [],
        startTime: Date.now(),
        questionStartTime: Date.now(),
      });
      return data.activity;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  startActivity: async (id) => {
    try {
      const data = await activityService.startActivity(id);
      set({ startTime: Date.now(), questionStartTime: Date.now() });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  submitAnswer: async (activityId, questionId, selectedAnswer) => {
    const timeSpent = Math.floor((Date.now() - get().questionStartTime) / 1000);

    try {
      const data = await activityService.submitAnswer(activityId, questionId, selectedAnswer, timeSpent);
      set({
        answers: [...(get().answers || []), { questionId, selectedAnswer, isCorrect: data.isCorrect }],
        questionStartTime: Date.now(),
      });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  nextQuestion: () => {
    const { currentQuestion, currentActivity } = get();
    const totalQuestions = currentActivity?.content?.questions?.length || 0;

    if (currentQuestion < totalQuestions - 1) {
      set({
        currentQuestion: currentQuestion + 1,
        questionStartTime: Date.now(),
      });
      return true;
    }
    return false;
  },

  previousQuestion: () => {
    const { currentQuestion } = get();
    if (currentQuestion > 0) {
      set({
        currentQuestion: currentQuestion - 1,
        questionStartTime: Date.now(),
      });
      return true;
    }
    return false;
  },

  completeActivity: async (id) => {
    set({ loading: true });
    try {
      const data = await activityService.completeActivity(id);
      set({
        summary: data.summary,
        loading: false,
      });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchMistakes: async (limit = 10) => {
    const currentMistakes = get().mistakes || [];
    if (currentMistakes.length === 0) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }
    try {
      const data = await activityService.getMistakeReview(limit);
      set({ mistakes: data.mistakes || [], loading: false });
      return data.mistakes;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchSummary: async (id) => {
    const current = get().summary;
    // Check if we have a summary and if it matches the requested activity ID (assuming summary has activityId or we can infer)
    // The current store structure for summary is just the object. Let's assume if we have it, we might want to refresh but show it.
    // However, summary is usually for a specific completed activity. If we view a different one, we need to load.
    // Ideally summary should have an ID check. For now, let's just check if it exists.
    if (!current) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }
    try {
      const data = await activityService.getActivitySummary(id);
      set({ summary: data.summary, loading: false });
      return data.summary;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearActivity: () => {
    set({
      currentActivity: null,
      currentQuestion: 0,
      answers: [],
      summary: null,
      startTime: null,
      questionStartTime: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useActivityStore;
