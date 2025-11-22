import { create } from "zustand";
import learningService from "../services/learningService";

export const useSubjectStore = create((set, get) => ({
  subjects: [],
  currentSubject: null,
  loading: false,
  error: null,

  fetchSubjects: async (examLevel = null) => {
    // Only set loading if we don't have data
    const currentSubjects = get().subjects || [];
    if (currentSubjects.length === 0) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }
    
    try {
      const response = await learningService.fetchSubjects(examLevel);
      set({
        subjects: response.data || [],
        loading: false,
      });
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  fetchSubjectById: async (subjectId) => {
    // Only set loading if we don't have this specific subject
    const current = get().currentSubject;
    if (!current || current._id !== subjectId) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const response = await learningService.fetchSubjectById(subjectId);
      set({
        currentSubject: response.data,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  setCurrentSubject: (subject) => {
    set({ currentSubject: subject });
  },

  clearCurrentSubject: () => {
    set({ currentSubject: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useSubjectStore;
