import { create } from "zustand";
import learningService from "../services/learningService";

export const useTopicStore = create((set, get) => ({
  topics: [],
  currentTopic: null,
  loading: false,
  error: null,

  fetchTopicsBySubject: async (subjectId) => {
    // Check if we already have topics for this subject
    const currentTopics = get().topics || [];
    const hasTopicsForSubject = currentTopics.length > 0 && currentTopics[0]?.subjectId === subjectId;
    
    if (!hasTopicsForSubject) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const response = await learningService.fetchTopicsBySubject(subjectId);
      set({
        topics: response.data || [],
        loading: false,
      });
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  fetchTopicById: async (topicId) => {
    const current = get().currentTopic;
    if (!current || current._id !== topicId) {
      set({ loading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const response = await learningService.fetchTopicById(topicId);
      set({
        currentTopic: response.data,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  setCurrentTopic: (topic) => {
    set({ currentTopic: topic });
  },

  clearCurrentTopic: () => {
    set({ currentTopic: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useTopicStore;
