import apiClient from "./apiClient";

export const cvService = {
    getMyCv: async () => {
        // TODO: Update endpoint to /cv when backend is ready
        const response = await apiClient.get("/resumes");
        return response.data;
    },

    updateCv: async (data) => {
        // TODO: Update endpoint to /cv when backend is ready
        const response = await apiClient.patch("/resumes", data);
        return response.data;
    },

    generatePDF: async () => {
        // TODO: Update endpoint to /cv/pdf when backend is ready
        const response = await apiClient.get("/resumes/pdf");
        return response.data;
    },
};

export default cvService;
