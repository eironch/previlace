import apiClient from "./apiClient";

export const manualQuestionService = {
  async getQuestions(params = {}) {
    const { data } = await apiClient.get("/manual-questions", { params });
    return data.data;
  },

  async getQuestionById(id) {
    const { data } = await apiClient.get(`/manual-questions/${id}`);
    return data.data;
  },

  async createQuestion(questionData) {
    const { data } = await apiClient.post("/manual-questions", questionData);
    return data.data;
  },

  async updateQuestion(id, questionData) {
    const { data } = await apiClient.put(`/manual-questions/${id}`, questionData);
    return data.data;
  },

  async deleteQuestion(id) {
    const { data } = await apiClient.delete(`/manual-questions/${id}`);
    return data.data;
  },

  async duplicateQuestion(id) {
    const { data } = await apiClient.post(`/manual-questions/${id}/duplicate`);
    return data.data;
  },

  async submitForReview(id) {
    const { data } = await apiClient.patch(`/manual-questions/${id}/submit`);
    return data.data;
  },

  async reviewQuestion(id, action, notes) {
    const { data } = await apiClient.patch(`/manual-questions/${id}/review`, {
      action,
      notes,
    });
    return data.data;
  },

  async getQuestionStats() {
    const { data } = await apiClient.get("/manual-questions/stats");
    return data.data;
  },

  async getRandomQuestions(params = {}) {
    const { data } = await apiClient.get("/manual-questions/random", {
      params,
    });
    return data.data;
  },

  async validateQuestionContent(questionData) {
    const { data } = await apiClient.post(
      "/manual-questions/validate",
      questionData
    );
    return data.data;
  },

  async getQuestionCounts(params = {}) {
    const { data } = await apiClient.get("/manual-questions/counts", {
      params,
    });
    return data.data;
  },

  async publishQuestion(id) {
    const { data } = await apiClient.patch(`/manual-questions/${id}/publish`);
    return data.data;
  },

  async sendBackToReview(id) {
    const { data } = await apiClient.patch(
      `/manual-questions/${id}/send-back-to-review`
    );
    return data.data;
  },
};
