import apiClient from "./apiClient";

export const fileService = {
  uploadFile: async (file, relatedType, relatedId) => {
    const formData = new FormData();
    formData.append("file", file);
    if (relatedType) formData.append("relatedType", relatedType);
    if (relatedId) formData.append("relatedId", relatedId);

    const response = await apiClient.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  getFiles: async (relatedType, relatedId) => {
    const params = {};
    if (relatedType) params.relatedType = relatedType;
    if (relatedId) params.relatedId = relatedId;

    const response = await apiClient.get("/files", { params });
    return response;
  },

  downloadFile: async (id, filename) => {
    const response = await apiClient.get(`/files/${id}/download`, {
      responseType: "blob",
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  deleteFile: async (id) => {
    const response = await apiClient.delete(`/files/${id}`);
    return response;
  },
};
