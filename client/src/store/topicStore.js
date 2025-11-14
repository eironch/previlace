import { create } from "zustand";
import learningService from "../services/learningService";

export const useTopicStore = create((set, get) => ({
  topics: [],
  currentTopic: null,
  loading: false,
  error: null,

  fetchTopicsBySubject: async (subjectId) => {
    set({ loading: true, error: null });
    try {
      const response = await learningService.fetchTopicsBySubject(subjectId);
      set({
        topics: response.data,
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
    set({ loading: true, error: null });
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
