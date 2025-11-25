import { create } from "zustand";
import { quizService } from "../services/quizService";

export const usePostTestStore = create((set) => ({
  postTestStatus: [],
  pretestAvailable: false,
  loading: false,
  error: null,

  fetchPostTestStatus: async () => {
    set({ loading: true, error: null });
    try {
      const response = await quizService.getPostTestStatus();
      set({ postTestStatus: response.data.status, loading: false });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching post-test status:", error);
      }
      set({ error: error.message, loading: false });
    }
  },

  checkPretestAvailability: async () => {
    set({ loading: true, error: null });
    try {
      const response = await quizService.checkPretestAvailability();
      set({ pretestAvailable: response.data.available, loading: false });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error checking pretest availability:", error);
      }
      set({ error: error.message, loading: false });
    }
  },

  hasCompletedPostTest: (weekNumber) => {
    const state = usePostTestStore.getState();
    const status = state.postTestStatus.find((s) => s.weekNumber === weekNumber);
    return status ? status.completed : false;
  },

  clearError: () => set({ error: null }),
}));

export default usePostTestStore;
