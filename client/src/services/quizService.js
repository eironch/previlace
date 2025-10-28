import apiClient from "./apiClient";

export const quizService = {
  async startQuiz(config) {
    const { data } = await apiClient.post("/exam/start", config);
    return data;
  },

  async startAdaptiveQuiz(config) {
    const { data } = await apiClient.post("/exam/adaptive-start", config);
    return data;
  },

  async submitAnswer(sessionId, questionId, answer, timeSpent) {
    const { data } = await apiClient.post(`/exam/${sessionId}/answer`, {
      questionId,
      answer,
      timeSpent,
    });
    return data;
  },

  async submitAdaptiveAnswer(sessionId, questionId, answer, timeSpent) {
    const { data } = await apiClient.post(`/exam/${sessionId}/adaptive-answer`, {
      questionId,
      answer,
      timeSpent,
    });
    return data;
  },

  async completeQuiz(sessionId) {
    const { data } = await apiClient.post(`/exam/${sessionId}/complete`);
    return data;
  },

  async completeAdaptiveQuiz(sessionId) {
    const { data } = await apiClient.post(`/exam/${sessionId}/adaptive-complete`);
    return data;
  },

  async getQuizResult(sessionId) {
    const { data } = await apiClient.get(`/exam/${sessionId}/result`);
    return data;
  },

  async getQuizHistory(page = 1, limit = 10, filters = {}) {
    const params = { page, limit, ...filters };
    const { data } = await apiClient.get("/exam/history", { params });
    return data;
  },

  async pauseQuiz(sessionId) {
    const { data } = await apiClient.post(`/exam/${sessionId}/pause`);
    return data;
  },

  async resumeQuiz(sessionId) {
    const { data } = await apiClient.post(`/exam/${sessionId}/resume`);
    return data;
  },

  async getDifficultyProgression(sessionId) {
    const { data } = await apiClient.get(`/exam/${sessionId}/difficulty-progression`);
    return data;
  },

  async getUserStats() {
    const { data } = await apiClient.get("/exam/stats/user");
    return data;
  },
};
