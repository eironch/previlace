import { create } from "zustand";
import learningService from "../services/learningService";

export const useSubjectStore = create((set, get) => ({
  subjects: [],
  currentSubject: null,
  loading: false,
  error: null,

  fetchSubjects: async (examLevel = null) => {
    set({ loading: true, error: null });
    try {
      const response = await learningService.fetchSubjects(examLevel);
      set({
        subjects: response.data,
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
    set({ loading: true, error: null });
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
