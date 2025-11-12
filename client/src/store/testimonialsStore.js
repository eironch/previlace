import { create } from "zustand";
import testimonialService from "../services/testimonialService"; 

export const useTestimonialsStore = create((set, get) => ({
    // --- STATE ---
    testimonials: [],
    isLoading: false, 
    error: null,      
    
    // 💡 REMOVED: filters state object

    // --- ASYNC ACTIONS ---

    /**
     * @desc Fetches ALL testimonials (for Admin view).
     */
    fetchTestimonials: async () => {
        set({ isLoading: true, error: null });
        try {
            // FIX: Pass empty params to the service so the backend returns ALL records
            const response = await testimonialService.fetchAllTestimonials({});
            
            set({ 
                testimonials: response.testimonials || [], 
                isLoading: false,
                error: null 
            });
        } catch (err) {
            console.error("Error fetching testimonials:", err);
            set({ 
                isLoading: false, 
                error: err.message || "Failed to load testimonials." 
            });
            throw err; 
        }
    },

    // (submitTestimonial, approveTestimonial, rejectTestimonial, requestChanges actions remain the same)
    // ...
}));