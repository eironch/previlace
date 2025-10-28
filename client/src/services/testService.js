import apiClient from "./apiClient";

export const testService = {
  async startTest(testConfig) {
    const { data } = await apiClient.post("/tests/start", testConfig);
    return data;
  },

  async submitTest(testId, answers) {
    const { data } = await apiClient.post(`/tests/${testId}/submit`, { answers });
    return data;
  },

  async getTestResult(testId) {
    const { data } = await apiClient.get(`/tests/${testId}/result`);
    return data;
  },

  async getTestHistory(userId) {
    const { data } = await apiClient.get("/tests/history", { 
      params: { userId } 
    });
    return data;
  },

  async pauseTest(testId) {
    const { data } = await apiClient.patch(`/tests/${testId}/pause`);
    return data;
  },

  async resumeTest(testId) {
    const { data } = await apiClient.patch(`/tests/${testId}/resume`);
    return data;
  },
};