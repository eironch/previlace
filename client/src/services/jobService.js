import apiClient from "./apiClient";

export const jobService = {
  getJobs: async (params) => {
    const response = await apiClient.get("/jobs", { params });
    return response;
  },

  getJob: async (id) => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response;
  },

  createJob: async (data) => {
    const response = await apiClient.post("/jobs", data);
    return response;
  },

  updateJob: async (id, data) => {
    const response = await apiClient.patch(`/jobs/${id}`, data);
    return response;
  },

  deleteJob: async (id) => {
    const response = await apiClient.delete(`/jobs/${id}`);
    return response;
  },
};
