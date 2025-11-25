import { create } from "zustand";
import apiClient from "@/services/apiClient";

const useLevelStore = create((set, get) => ({
  level: 1,
  xp: 0,
  xpToNextLevel: 1000,
  loading: false,
  error: null,

  fetchLevel: async () => {
    try {
      set({ loading: true, error: null });
      const response = await apiClient.get("/users/level");
      
      if (response.data.success) {
        const { level, xp, xpToNextLevel } = response.data.data;
        set({ level, xp, xpToNextLevel, loading: false });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch level:", error);
      }
      set({ error: error.message, loading: false });
    }
  },

  addXp: (amount) => {
    const { xp, xpToNextLevel, level } = get();
    const newXp = xp + amount;
    
    if (newXp >= xpToNextLevel) {
      set({
        level: level + 1,
        xp: newXp - xpToNextLevel,
        xpToNextLevel: Math.floor(xpToNextLevel * 1.5),
      });
    } else {
      set({ xp: newXp });
    }
  },

  calculateProgress: () => {
    const { xp, xpToNextLevel } = get();
    return Math.min((xp / xpToNextLevel) * 100, 100);
  },
}));

export default useLevelStore;
