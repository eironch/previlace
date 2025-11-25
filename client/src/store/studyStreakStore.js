import { create } from "zustand";
import studyStreakService from "../services/studyStreakService";

function isToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export const useStudyStreakStore = create((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  streakMilestones: [],
  studyDatesThisMonth: [],
  streakHistory: [],
  todayCompleted: false,
  isLoading: false,
  error: null,

  fetchStudyStreakData: async () => {
    // Check if we have data (lastStudyDate is a good proxy)
    if (!get().lastStudyDate) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const response = await studyStreakService.getStudyStreakData();

      if (response.streak) {
        set({
          currentStreak: response.streak.currentStreak || 0,
          longestStreak: response.streak.longestStreak || 0,
          lastStudyDate: response.streak.lastActivityDate,
          streakMilestones: response.streak.milestones || [],
          studyDatesThisMonth: [], // Not returned by API currently
          streakHistory: response.history || [], 
          todayCompleted: isToday(response.streak.lastActivityDate),
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

      if (response.streak) {
        set({
          currentStreak: response.streak.currentStreak,
          longestStreak: response.streak.longestStreak,
          lastStudyDate: response.streak.lastActivityDate,
          streakMilestones: response.streak.milestones || [],
          streakHistory: [], // Not returned by API currently
          todayCompleted: isToday(response.streak.lastActivityDate),
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
