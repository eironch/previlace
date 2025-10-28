import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const achievementService = {
  async getUserAchievements() {
    const response = await axios.get(`${API_BASE}/achievements`);
    return response.data.data;
  },

  async getDisplayedAchievements() {
    const response = await axios.get(`${API_BASE}/achievements/displayed`);
    return response.data.data;
  },

  async getAvailableAchievements() {
    const response = await axios.get(`${API_BASE}/achievements/available`);
    return response.data.data;
  },

  async getAchievementsByCategory(category) {
    const response = await axios.get(`${API_BASE}/achievements/category/${category}`);
    return response.data.data;
  },

  async getAchievementStats() {
    const response = await axios.get(`${API_BASE}/achievements/stats`);
    return response.data.data;
  },

  async checkNewAchievements() {
    const response = await axios.post(`${API_BASE}/achievements/check-new`);
    return response.data.data;
  },

  async toggleAchievementDisplay(achievementId) {
    const response = await axios.put(`${API_BASE}/achievements/${achievementId}/display`);
    return response.data.data;
  },
};

export { achievementService };
export default achievementService;
