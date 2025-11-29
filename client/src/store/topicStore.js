import { create } from "zustand";
import learningService from "../services/learningService";

export const useTopicStore = create((set, get) => ({
  topics: [],
  topicsSubjectId: null, // Track which subject the current topics belong to
  currentTopic: null,
  loading: false,
  error: null,

  fetchTopicsBySubject: async (subjectId) => {
    // Check if we already have topics for this SPECIFIC subject
    const { topics, topicsSubjectId } = get();
    const isSameSubject = topicsSubjectId === subjectId;
    
    if (isSameSubject && topics.length > 0) {
       // SWR: We have data for this subject. Keep loading false to show data.
       set({ error: null });
    } else {
       // New subject or no data. Clear old topics to avoid showing wrong data.
       set({ topics: [], topicsSubjectId: subjectId, loading: true, error: null });
    }

    try {
      const response = await learningService.fetchTopicsBySubject(subjectId);
      set({
        topics: response.data || [],
        topicsSubjectId: subjectId, // Ensure ID is set
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
    // SWR: Check if we have this topic in our list
    const existingTopic = get().topics.find(t => t._id === topicId);
    
    if (existingTopic) {
      set({ currentTopic: existingTopic, loading: false, error: null });
    } else {
      const current = get().currentTopic;
      if (!current || current._id !== topicId) {
        // Clear currentTopic if it's a different topic, so we show skeleton instead of wrong data
        set({ currentTopic: null, loading: true, error: null });
      }
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

  toggleTopicPublish: async (topicId) => {
    try {
      const response = await learningService.toggleTopicPublish(topicId);
      const updatedTopic = response.data;
      
      set((state) => ({
        topics: state.topics.map((t) => 
          t._id === topicId ? { ...t, isPublished: updatedTopic.isPublished } : t
        ),
        currentTopic: state.currentTopic?._id === topicId 
          ? { ...state.currentTopic, isPublished: updatedTopic.isPublished } 
          : state.currentTopic
      }));
      
      return updatedTopic;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

export default useTopicStore;
