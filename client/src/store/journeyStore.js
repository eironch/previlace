import { create } from "zustand";
import { journeyService } from "../services/journeyService";

const useJourneyStore = create((set, get) => ({
  journey: null,
  path: [],
  todayActivities: [],
  weekProgress: null,
  loading: false,
  error: null,

  fetchJourney: async () => {
    if (!get().journey) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }
    
    try {
      const data = await journeyService.getJourney();
      set({ journey: data.journey, loading: false });
      return data.journey;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchJourneyPath: async () => {
    const currentPath = get().path || [];
    if (currentPath.length === 0) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const data = await journeyService.getJourneyPath();
      set({ path: data.path || [], loading: false });
      return data.path;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchTodayActivities: async () => {
    const currentActivities = get().todayActivities || [];
    if (currentActivities.length === 0) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const data = await journeyService.getTodayActivities();
      set({ todayActivities: data.activities || [], loading: false });
      return data.activities;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchWeekProgress: async (weekNumber) => {
    // For week progress, we might want to be careful if weekNumber changes
    // But the store doesn't track current week number. 
    // We'll just check if we have any progress data for now.
    if (!get().weekProgress) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const data = await journeyService.getWeekProgress(weekNumber);
      set({ weekProgress: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  unlockNext: async () => {
    try {
      const data = await journeyService.unlockNextActivity();
      await get().fetchJourney();
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateDailyGoal: async (dailyGoal) => {
    try {
      const data = await journeyService.updateDailyGoal(dailyGoal);
      set({ journey: data.journey });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  switchJourneyType: async (journeyType) => {
    try {
      const data = await journeyService.switchJourneyType(journeyType);
      set({ journey: data.journey });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useJourneyStore;
