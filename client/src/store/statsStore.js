import { create } from 'zustand';
import statService from '../services/statsService'; // Updated to use the default export

// Map labels to the simple form keys used in the AdminStatsEditor
const STAT_KEYS = {
    "Average CSE Pass Rate": "averagePassRate",
    "Previlace User Pass Rate": "previlaceUserPassRate",
    "Successful Students": "successfulStudents",
    "Government Jobs Matched": "governmentJobsMatched",
};

const initialState = {
    stats: [],
    isLoading: false,
    error: null,
};

export const useStatsStore = create((set, get) => ({
    ...initialState,

    /**
     * @desc Fetches public stats via the service layer (used by Admin/Public display).
     */
    fetchStats: async () => {
        set({ isLoading: true, error: null });

        try {
            // Use the new service object method
            const fetchedStats = await statService.fetchStats(); 

            set({
                stats: fetchedStats,
                isLoading: false,
                error: null
            });

        } catch (err) {
            console.error("Error fetching statistics from API:", err);
            set({
                isLoading: false,
                error: err.message || 'Failed to fetch public statistics from API',
            });
            // Propagate the error to allow components to handle failure (e.g., the infinite loop fix)
            throw err;
        }
    },
    
    /**
     * @desc Saves updated stats to the API, handling the object-to-array transformation.
     * @param {Object} formData - Flat object from the admin form (e.g., {averagePassRate: "90%"}).
     * @returns {Object} { success: boolean, error?: string }
     */
    updateAdminStats: async (formData) => {
        const currentStats = get().stats;

        // 1. Transform the flat formData back into the array structure expected by the API
        // NOTE: The backend controller is now fixed to handle this array structure.
        const updatedStatsArray = currentStats.map(stat => {
            const formKey = STAT_KEYS[stat.label]; 
            
            if (formKey && formData[formKey] !== undefined) {
                // Update the 'number' value with the data from the form
                return { ...stat, number: formData[formKey] };
            }
            return stat;
        });

        // Robustness check
        if (updatedStatsArray.length !== 4) {
            return { success: false, error: "Data structure error: Cannot save non-standard number of stats." };
        }

        try {
            // 2. Call the service layer with the correctly structured array
            await statService.saveStats(updatedStatsArray); 
            
            // 3. Update the store's state with the new values upon success
            set({ stats: updatedStatsArray }); 
            
            return { success: true };
            
        } catch (err) {
            console.error("Error saving statistics via API:", err);
            return { success: false, error: err.message || 'API save operation failed.' };
        }
    }
}));