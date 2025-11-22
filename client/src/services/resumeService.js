import apiClient from "./apiClient";

export const resumeService = {
  getMyResume: async () => {
    const response = await apiClient.get("/resumes");
    return response;
  },

  updateResume: async (data) => {
    const response = await apiClient.patch("/resumes", data);
    return response;
  },

  generatePDF: async () => {
    // In a real app, this would download a file
    const response = await apiClient.get("/resumes/pdf");
    return response;
  },
};
