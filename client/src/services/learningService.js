import apiClient from "./apiClient";

const learningService = {
  fetchSubjects: async (examLevel = null) => {
    try {
      const params = examLevel ? { examLevel } : {};
      const response = await apiClient.get("/subjects", { params });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Fetch subjects error:", error);
      }
      throw error;
    }
  },

  fetchSubjectById: async (subjectId) => {
    try {
      const response = await apiClient.get(`/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Fetch subject error:", error);
      }
      throw error;
    }
  },

  fetchTopicsBySubject: async (subjectId) => {
    try {
      const response = await apiClient.get(`/topics/subject/${subjectId}`);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Fetch topics error:", error);
      }
      throw error;
    }
  },

  fetchTopicById: async (topicId) => {
    try {
      const response = await apiClient.get(`/topics/${topicId}`);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Fetch topic error:", error);
      }
      throw error;
    }
  },

  fetchLearningContent: async (topicId) => {
    try {
      const response = await apiClient.get(`/learning-content/topic/${topicId}`);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Fetch learning content error:", error);
      }
      throw error;
    }
  },

  startSubjectQuiz: async (subjectId, examLevel, questionCount = 20) => {
    try {
      const response = await apiClient.post("/exams/subject-quiz", {
        subjectId,
        examLevel,
        questionCount,
      });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Start subject quiz error:", error);
      }
      throw error;
    }
  },

  startTopicQuiz: async (topicId, examLevel, questionCount = 10) => {
    try {
      const response = await apiClient.post("/exams/topic-quiz", {
        topicId,
        examLevel,
        questionCount,
      });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Start topic quiz error:", error);
      }
      throw error;
    }
  },
};

export default learningService;
