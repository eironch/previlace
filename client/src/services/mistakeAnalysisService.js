import apiClient from "./apiClient";

const mistakeAnalysisService = {
  async getMistakeAnalysis(days = 30) {
    const { data } = await apiClient.get("/mistakes/analysis", {
      params: { days },
    });
    return data;
  },

  async getRemediationPlan() {
    const { data } = await apiClient.get("/mistakes/remediation");
    return data;
  },

  async getMistakeFrequency() {
    const { data } = await apiClient.get("/mistakes/frequency");
    return data;
  },

  async getSystematicErrors() {
    const { data } = await apiClient.get("/mistakes/systematic-errors");
    return data;
  },

  async createMistakeQuiz(category) {
    const { data } = await apiClient.post("/mistakes/quiz", { category });
    return data;
  },
};

export { mistakeAnalysisService };
export default mistakeAnalysisService;
