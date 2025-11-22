import { create } from "zustand";
import { challengeService } from "../services/challengeService";

const useChallengeStore = create((set, get) => ({
  pendingChallenges: [],
  activeChallenges: [],
  challengeHistory: [],
  challengeStats: null,
  leaderboardData: [],
  loading: false,
  error: null,

  fetchPendingChallenges: async () => {
    const currentPending = get().pendingChallenges || [];
    if (currentPending.length === 0) {
      set({ loading: true });
    }
    try {
      const challenges = await challengeService.getPendingChallenges();
      set({ pendingChallenges: challenges || [], error: null });
      return challenges;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch pending challenges:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchActiveChallenges: async () => {
    const currentActive = get().activeChallenges || [];
    if (currentActive.length === 0) {
      set({ loading: true });
    }
    try {
      const challenges = await challengeService.getActiveChallenges();
      set({ activeChallenges: challenges || [], error: null });
      return challenges;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch active challenges:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchChallengeHistory: async (page = 1, limit = 20) => {
    const currentHistory = get().challengeHistory || [];
    if (currentHistory.length === 0) {
      set({ loading: true });
    }
    try {
      const data = await challengeService.getChallengeHistory(page, limit);
      set({ challengeHistory: data.challenges || [], error: null });
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch challenge history:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchChallengeStats: async () => {
    if (!get().challengeStats) {
      // No explicit loading state for stats in this store, but we can assume it's fine to just fetch
      // Or we could add one. But for now let's just not block.
    }
    try {
      const stats = await challengeService.getUserStats();
      set({ challengeStats: stats, error: null });
      return stats;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch challenge stats:", error);
      }
      set({ error: error.message });
      throw error;
    }
  },

  fetchChallengeLeaderboard: async () => {
    if (get().leaderboardData.length === 0) {
       // No explicit loading state for leaderboard in this store either?
       // Wait, the store has `loading: false` at the top.
       set({ loading: true });
    }
    try {
      const leaderboard = await challengeService.getLeaderboard();
      set({ leaderboardData: leaderboard, error: null });
      return leaderboard;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch challenge leaderboard:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  sendChallenge: async (opponentId, challengeConfig) => {
    set({ loading: true });
    try {
      const challenge = await challengeService.sendChallenge(
        opponentId,
        challengeConfig
      );
      set((state) => ({
        activeChallenges: [...state.activeChallenges, challenge],
        error: null,
      }));
      return challenge;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to send challenge:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  acceptChallenge: async (challengeId) => {
    set({ loading: true });
    try {
      const challenge = await challengeService.acceptChallenge(challengeId);
      set((state) => ({
        pendingChallenges: state.pendingChallenges.filter(
          (c) => c._id !== challengeId
        ),
        activeChallenges: [...state.activeChallenges, challenge],
        error: null,
      }));
      return challenge;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to accept challenge:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  declineChallenge: async (challengeId) => {
    set({ loading: true });
    try {
      await challengeService.declineChallenge(challengeId);
      set((state) => ({
        pendingChallenges: state.pendingChallenges.filter(
          (c) => c._id !== challengeId
        ),
        error: null,
      }));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to decline challenge:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  recordChallengeScore: async (challengeId, scoreData) => {
    set({ loading: true });
    try {
      const challenge = await challengeService.recordScore(
        challengeId,
        scoreData
      );
      set((state) => ({
        activeChallenges: state.activeChallenges.filter(
          (c) => c._id !== challengeId
        ),
        challengeHistory: [challenge, ...state.challengeHistory],
        error: null,
      }));
      return challenge;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to record challenge score:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
  reset: () =>
    set({
      pendingChallenges: [],
      activeChallenges: [],
      challengeHistory: [],
      challengeStats: null,
      leaderboardData: [],
      loading: false,
      error: null,
    }),
}));

export default useChallengeStore;
