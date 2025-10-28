import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const leaderboardService = {
  async getLeaderboard(category = "overall", limit = 100, page = 1) {
    const response = await axios.get(`${API_BASE}/leaderboard`, {
      params: { category, limit, page },
    });
    return response.data.data;
  },

  async getUserRank(category = "overall") {
    const response = await axios.get(`${API_BASE}/leaderboard/user/rank`, {
      params: { category },
    });
    return response.data.data;
  },

  async getTopUsers(category = "overall", limit = 10) {
    const response = await axios.get(`${API_BASE}/leaderboard/top-users`, {
      params: { category, limit },
    });
    return response.data.data;
  },

  async getNearbyUsers(category = "overall", range = 5) {
    const response = await axios.get(`${API_BASE}/leaderboard/nearby`, {
      params: { category, range },
    });
    return response.data.data;
  },

  async getCategoryLeaderboard(categoryName, limit = 50, page = 1) {
    const response = await axios.get(`${API_BASE}/leaderboard/category`, {
      params: { categoryName, limit, page },
    });
    return response.data.data;
  },

  async updateLeaderboard() {
    const response = await axios.post(`${API_BASE}/leaderboard/update`);
    return response.data.data;
  },
};

export { leaderboardService };
export default leaderboardService;
