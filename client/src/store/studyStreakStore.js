import { create } from "zustand";
import studyStreakService from "../services/studyStreakService";

export const useStudyStreakStore = create((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  streakMilestones: [],
  studyDatesThisMonth: [],
  isLoading: false,
  error: null,

  fetchStudyStreakData: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await studyStreakService.getStudyStreakData();

      if (response.success) {
        set({
          currentStreak: response.data.currentStreak || 0,
          longestStreak: response.data.longestStreak || 0,
          lastStudyDate: response.data.lastStudyDate,
          streakMilestones: response.data.streakMilestones || [],
          studyDatesThisMonth: response.data.studyDatesThisMonth || [],
        });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  recordStudySession: async (sessionId) => {
    try {
      const response = await studyStreakService.recordStudySession(sessionId);

      if (response.success) {
        set({
          currentStreak: response.data.currentStreak,
          longestStreak: response.data.longestStreak,
          lastStudyDate: response.data.lastStudyDate,
          streakMilestones: response.data.streakMilestones || [],
        });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  getStreakStatus: () => {
    const { currentStreak, lastStudyDate } = get();

    if (!lastStudyDate) {
      return "no_streak";
    }

    const lastDate = new Date(lastStudyDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) {
      return "active_today";
    }

    if (daysDifference === 1) {
      return "can_continue";
    }

    return "broken";
  },

  getDaysUntilNextMilestone: () => {
    const { currentStreak } = get();

    const milestones = [5, 10, 25, 50, 100];
    const nextMilestone = milestones.find((m) => m > currentStreak);

    return nextMilestone ? nextMilestone - currentStreak : null;
  },

  getStreakStatusMessage: () => {
    const status = get().getStreakStatus();
    const daysUntilMilestone = get().getDaysUntilNextMilestone();

    const messages = {
      no_streak: "Start a study streak by taking a quiz today",
      active_today: `Great work! Keep your streak going tomorrow`,
      can_continue: `Your streak can still be saved. Study today to continue`,
      broken: `Streak broken. Start fresh today`,
    };

    const baseMessage = messages[status] || "";

    if (daysUntilMilestone) {
      return `${baseMessage}. ${daysUntilMilestone} days until milestone!`;
    }

    return baseMessage;
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useStudyStreakStore;
