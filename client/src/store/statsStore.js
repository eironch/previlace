import { create } from 'zustand';
// Assuming statService is located in a sibling 'services' folder or configured alias
import statService from '../services/statsService'; 

/**
 * Zustand store for managing site statistics (CSE Pass Rate, Students, etc.).
 * Data is fetched via the statService which communicates with the REST API.
 */
export const useStatsStore = create((set, get) => ({
    stats: [],
    isLoading: false,
    error: null,

    /**
     * Fetches the latest statistics from the backend service via statService.
     */
    fetchStats: async () => {
        set({ isLoading: true, error: null });

        try {
            // Use the statService to fetch data
            const result = await statService.fetchStats();
            const fetchedStats = result.data; // Assuming result.data holds the stats object

            // Transform the fetched object into the array structure the components expect
            const transformedStats = [
                { number: fetchedStats.averagePassRate, label: "Average CSE Pass Rate" },
                { number: fetchedStats.previlaceUserPassRate, label: "Previlace User Pass Rate" },
                { number: fetchedStats.successfulStudents, label: "Successful Students" },
                { number: fetchedStats.governmentJobsMatched, label: "Government Jobs Matched" },
            ];
            
            set({ stats: transformedStats, isLoading: false });

        } catch (error) {
            console.error("Failed to fetch dynamic stats from API:", error);
            
            // Fallback: If the API call fails, load the original hardcoded defaults
            const defaultStats = [
                { number: "17.22%", label: "Average CSE Pass Rate" },
                { number: "85%", label: "Previlace User Pass Rate" },
                { number: "3,000+", label: "Successful Students" },
                { number: "500+", label: "Government Jobs Matched" },
            ];
            
            set({ 
                stats: defaultStats, 
                isLoading: false, 
                error: "Failed to load dynamic data. Displaying defaults." 
            });
        }
    },

    /**
     * Admin action to update the statistics.
     * NOTE: This would typically be called from an admin dashboard component.
     * @param {object} updatedData - Object containing the new stat values.
     */
    updateAdminStats: async (updatedData) => {
        try {
            await statService.updateStats(updatedData);
            
            // Refetch the stats to update the UI after a successful admin update
            get().fetchStats(); 
            
            return { success: true, message: "Statistics updated successfully!" };
        } catch (error) {
            console.error("Admin stat update failed:", error);
            // Propagate error details back to the admin UI
            return { success: false, error: error.response?.data?.error || "Failed to update statistics due to server error." };
        }
    }
}));