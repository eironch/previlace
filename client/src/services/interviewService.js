import apiClient from "./apiClient";

export const interviewService = {
  startInterview: async (data) => {
    const response = await apiClient.post("/interviews", data);
    return response;
  },

  getInterviews: async () => {
    const response = await apiClient.get("/interviews");
    return response;
  },

  getInterview: async (id) => {
    const response = await apiClient.get(`/interviews/${id}`);
    return response;
  },

  submitAnswer: async (id, data) => {
    const response = await apiClient.post(`/interviews/${id}/answer`, data);
    return response;
  },

  completeInterview: async (id) => {
    const response = await apiClient.patch(`/interviews/${id}/complete`);
    return response;
  },
};
