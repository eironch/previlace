import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const analyticsService = {
  async getCategoryStatistics() {
    const response = await axios.get(`${API_BASE}/analytics/categories`);
    return response.data.data;
  },

  async getWeakAreas() {
    const response = await axios.get(`${API_BASE}/analytics/weak-areas`);
    return response.data.data;
  },

  async getExamReadiness() {
    const response = await axios.get(`${API_BASE}/analytics/readiness`);
    return response.data.data;
  },

  async getProgressReport(days = 30) {
    const response = await axios.get(`${API_BASE}/analytics/progress`, { params: { days } });
    return response.data.data;
  },

  async getPercentileRank(metric = "averageScore") {
    const response = await axios.get(`${API_BASE}/analytics/percentile`, { params: { metric } });
    return response.data.data;
  },
};

export { analyticsService };
export default analyticsService;
