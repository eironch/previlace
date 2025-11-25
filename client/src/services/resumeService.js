import apiClient from "./apiClient";

export const resumeService = {
  getMyResume: async () => {
    const response = await apiClient.get("/resumes");
    return response.data;
  },

  updateResume: async (data) => {
    const response = await apiClient.patch("/resumes", data);
    return response.data;
  },

  generatePDF: async () => {
    const response = await apiClient.get("/resumes/pdf");
    return response.data;
  },
};

export default resumeService;
