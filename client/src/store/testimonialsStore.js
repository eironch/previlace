import { create } from "zustand";
import testimonialService from "../services/testimonialService"; 

export const useTestimonialsStore = create((set, get) => ({
    // --- STATE ---
    testimonials: [],             // Used for ALL (Admin/Review view)
    approvedTestimonials: [],     // 💡 New state for public/approved list
    isLoading: false, 
    error: null,      
    
    // --- ASYNC ACTIONS ---

    /**
     * @desc Fetches ALL testimonials (for Admin view).
     */
    fetchTestimonials: async () => {
        set({ isLoading: true, error: null });
        try {
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

    /**
     * 💡 NEW ACTION: Fetches ONLY APPROVED testimonials for the public page.
     */
    fetchApprovedTestimonials: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await testimonialService.fetchApprovedTestimonials();
            
            set({ 
                approvedTestimonials: response.testimonials || [], // Assuming service returns { testimonials: [...] }
                isLoading: false,
                error: null 
            });
        } catch (err) {
            console.error("Error fetching approved testimonials:", err);
            set({ 
                isLoading: false, 
                error: err.message || "Failed to load public testimonials." 
            });
        }
    },

    /**
     * @desc Submits a new testimonial for review.
     */
    submitTestimonial: async (data) => {
        try {
            const response = await testimonialService.submitTestimonial(data);
            return response;
        } catch (err) {
            throw err;
        }
    },
    
    // (Other admin actions like approveTestimonial, rejectTestimonial, etc., go here)
}));