import apiClient from "./apiClient";

const adaptiveQuizService = {
  async startAdaptiveQuizSession(config) {
    const { data } = await apiClient.post("/exam/adaptive-start", config);
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

  async completeAdaptiveSession(sessionId) {
    const { data } = await apiClient.post(`/exam/${sessionId}/adaptive-complete`);
    return data;
  },

  async getDifficultyProgression(sessionId) {
    const { data } = await apiClient.get(`/exam/${sessionId}/difficulty-progression`);
    return data;
  },
};

export { adaptiveQuizService };
export default adaptiveQuizService;
