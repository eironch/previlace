import apiClient from "./apiClient";

/**
 * Defines the service layer for interacting with the /api/stats endpoint.
 * All requests use the shared apiClient, making the methods concise.
 */
const statService = {
    
    /**
     * @desc Fetches the current public statistics (GET /api/stats).
     * @returns {Promise<Array<{key: string, number: string, label: string}>>} The array of statistics.
     */
    async fetchStats() {
        // apiClient.get handles the full URL, headers, and response parsing.
        // The backend controller returns the stats array directly.
        const response = await apiClient.get("/stats"); 
        
        const data = response.data;
        
        // Basic check to ensure the response format is what the store expects (an array)
        if (!Array.isArray(data)) {
             throw new Error("API response was not a list of statistics (expected array).");
        }
        
        return data;
    },

    /**
     * @desc Saves the updated statistics array (PUT /api/stats).
     * @param {Array<{key: string, number: string, label: string}>} statsArray The array of updated stats.
     * @returns {Promise<any>} Response data from the server (e.g., the saved document).
     */
    async saveStats(statsArray) {
        // apiClient.put handles method, headers, and JSON stringification.
        const response = await apiClient.put("/stats", statsArray);
        
        return response.data;
    }
};

export default statService;