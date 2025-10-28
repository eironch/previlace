import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const challengeService = {
  async sendChallenge(opponentId, type = "quiz", category, difficulty = "intermediate", questionCount = 10, timeLimit = 600) {
    const response = await axios.post(`${API_BASE}/challenges/send`, {
      opponentId,
      type,
      category,
      difficulty,
      questionCount,
      timeLimit,
    });
    return response.data.data;
  },

  async getPendingChallenges() {
    const response = await axios.get(`${API_BASE}/challenges/pending`);
    return response.data.data;
  },

  async getActiveChallenges() {
    const response = await axios.get(`${API_BASE}/challenges/active`);
    return response.data.data;
  },

  async getChallengeHistory(limit = 20, page = 1) {
    const response = await axios.get(`${API_BASE}/challenges/history`, {
      params: { limit, page },
    });
    return response.data.data;
  },

  async getUserChallengeStats() {
    const response = await axios.get(`${API_BASE}/challenges/stats`);
    return response.data.data;
  },

  async acceptChallenge(challengeId) {
    const response = await axios.put(`${API_BASE}/challenges/${challengeId}/accept`);
    return response.data.data;
  },

  async declineChallenge(challengeId) {
    const response = await axios.put(`${API_BASE}/challenges/${challengeId}/decline`);
    return response.data.data;
  },

  async recordChallengeScore(challengeId, sessionId, score, percentage, timeSpent) {
    const response = await axios.post(`${API_BASE}/challenges/${challengeId}/score`, {
      sessionId,
      score,
      percentage,
      timeSpent,
    });
    return response.data.data;
  },
};

export { challengeService };
export default challengeService;
