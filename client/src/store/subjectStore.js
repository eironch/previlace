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
    // SWR: Check if we have this subject in our list
    const existingSubject = get().subjects.find(s => s._id === subjectId);
    
    if (existingSubject) {
      set({ currentSubject: existingSubject, loading: false, error: null });
    } else {
      // Only set loading if we don't have the data
      const current = get().currentSubject;
      if (!current || current._id !== subjectId) {
        set({ loading: true, error: null });
      }
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

  toggleSubjectPublish: async (subjectId) => {
    try {
      const response = await learningService.toggleSubjectPublish(subjectId);
      const updatedSubject = response.data;
      
      set((state) => ({
        subjects: state.subjects.map((s) => 
          s._id === subjectId ? { ...s, isPublished: updatedSubject.isPublished } : s
        ),
        currentSubject: state.currentSubject?._id === subjectId 
          ? { ...state.currentSubject, isPublished: updatedSubject.isPublished } 
          : state.currentSubject
      }));
      
      return updatedSubject;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

export default useSubjectStore;
