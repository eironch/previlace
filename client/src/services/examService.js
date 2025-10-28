import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const examService = {
  async startQuiz(config) {
    const response = await axios.post(`${API_BASE}/exam/start`, config);
    return response.data.data;
  },

  async submitAnswer(sessionId, questionId, answer, timeSpent) {
    const response = await axios.post(`${API_BASE}/exam/${sessionId}/answer`, {
      questionId,
      answer,
      timeSpent,
    });
    return response.data.data;
  },

  async completeQuiz(sessionId) {
    const response = await axios.post(`${API_BASE}/exam/${sessionId}/complete`);
    return response.data.data;
  },

  async getQuizResult(sessionId) {
    const response = await axios.get(`${API_BASE}/exam/${sessionId}/result`);
    return response.data.data;
  },

  async getSessionHistory(page = 1, limit = 10, filters = {}) {
    const params = { page, limit, ...filters };
    const response = await axios.get(`${API_BASE}/exam/history`, { params });
    return response.data.data;
  },

  async pauseQuiz(sessionId) {
    const response = await axios.post(`${API_BASE}/exam/${sessionId}/pause`);
    return response.data.data;
  },

  async resumeQuiz(sessionId) {
    const response = await axios.post(`${API_BASE}/exam/${sessionId}/resume`);
    return response.data.data;
  },

  async getUserStats() {
    const response = await axios.get(`${API_BASE}/exam/stats/user`);
    return response.data.data;
  },
};

export { examService };
export default examService;
