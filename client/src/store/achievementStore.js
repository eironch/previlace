import { create } from "zustand";

const useAchievementStore = create((set) => ({
  achievements: [],
  stats: {},

  updateAchievements: (data) =>
    set({
      achievements: data.achievements || [],
      stats: data.stats || {},
    }),

  reset: () =>
    set({
      achievements: [],
      stats: {},
    }),
}));

export default useAchievementStore;
