import apiClient from "./apiClient";

const statService = {
    /**
     * Fetches the current site statistics from the backend.
     * @returns {Promise<object>} The response data containing stat fields.
     */
    async fetchStats() {
        // Calls GET /api/stats (Publicly accessible)
        const response = await apiClient.get("/stats");
        return response.data;
    },

    /**
     * Updates the site statistics (Admin function).
     * @param {object} data - The updated stat values (e.g., { successfulStudents: "5k+" }).
     * @returns {Promise<object>} The response data from the update operation.
     */
    async updateStats(data) {
        // Calls PUT /api/stats (Requires admin authentication/authorization on the backend)
        const response = await apiClient.put("/stats", data);
        return response.data;
    },
};

export default statService;