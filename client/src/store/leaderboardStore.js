import { create } from "zustand";

const useLeaderboardStore = create((set) => ({
  entries: [],
  userRank: {},
  totalPages: 1,

  updateLeaderboard: (data) =>
    set({
      entries: data.entries || [],
      userRank: data.userRank || {},
      totalPages: data.totalPages || 1,
    }),

  reset: () =>
    set({
      entries: [],
      userRank: {},
      totalPages: 1,
    }),
}));

export default useLeaderboardStore;
