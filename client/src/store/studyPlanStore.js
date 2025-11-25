import { create } from "zustand";
import studyPlanService from "../services/studyPlanService";

export const useStudyPlanStore = create((set, get) => ({
  activePlan: null,
  loading: false,
  error: null,

  fetchActivePlan: async () => {
    const currentPlan = get().activePlan;
    if (!currentPlan) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const data = await studyPlanService.getActiveStudyPlan();
      set({ activePlan: data.plan || null, loading: false });
      return data.plan;
    } catch (error) {
      set({ error: error.message, loading: false });
      // Don't throw if we want to handle it gracefully in UI, but throwing allows UI to know it failed
      // For now, let's just set error state.
    }
  },
  
  generateStudyPlan: async (targetDate) => {
    set({ loading: true, error: null });
    try {
      const data = await studyPlanService.createStudyPlan({ targetExamDate: targetDate });
      set({ activePlan: data.plan, loading: false });
      return data.plan;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useStudyPlanStore;
