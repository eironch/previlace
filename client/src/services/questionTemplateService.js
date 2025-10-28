import apiClient from "./apiClient";

export const questionTemplateService = {
  async getTemplates(filters = {}) {
    const { data } = await apiClient.get("/question-templates", { params: filters });
    return data;
  },

  async getTemplateById(id) {
    const { data } = await apiClient.get(`/question-templates/${id}`);
    return data;
  },

  async createTemplate(templateData) {
    const { data } = await apiClient.post("/question-templates", templateData);
    return data;
  },

  async updateTemplate(id, templateData) {
    const { data } = await apiClient.put(`/question-templates/${id}`, templateData);
    return data;
  },

  async deleteTemplate(id) {
    const { data } = await apiClient.delete(`/question-templates/${id}`);
    return data;
  },

  async getCategories() {
    const { data } = await apiClient.get("/question-templates/categories");
    return data;
  },

  async getPopularTemplates(limit = 5) {
    const { data } = await apiClient.get("/question-templates/popular", {
      params: { limit },
    });
    return data;
  },
};
