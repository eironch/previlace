// src/store/testimonialsStore.js

import { create } from "zustand";
import apiClient from "../services/apiClient"; // Assuming apiClient is correctly exported from your services folder

export const useTestimonialsStore = create((set, get) => ({
    // --- State ---
    
    /** Array of testimonials for the Admin view (includes pending, approved, rejected) */
    testimonials: [],
    
    /** Status flags for UI feedback */
    isLoading: false,
    error: null,

    // --- Actions ---

    /**
     * @desc Fetches all testimonials (pending, approved, rejected) for the Admin view.
     */
    fetchTestimonials: async () => {
        set({ isLoading: true, error: null });
        try {
            // Calls GET /api/testimonials (protected by requireAdmin)
            const response = await apiClient.get("/testimonials");
            
            // Assuming the API returns { data: { testimonials: [...] } }
            const data = response.data.testimonials || [];
            
            set({ 
                testimonials: data, 
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
     * @desc Submits a new testimonial from the public/learner modal.
     * @param {object} data - { content, role, rating }
     */
    submitTestimonial: async (data) => {
        // We don't set global loading state as this is called from a modal component
        try {
            // Calls POST /api/testimonials (protected by 'protect' middleware)
            const response = await apiClient.post("/testimonials", data);
            
            // Optionally, add the new testimonial to the admin list if the admin page is open
            const newTestimonial = response.data.data;
            if (newTestimonial) {
                set((state) => ({
                    testimonials: [newTestimonial, ...state.testimonials],
                }));
            }
            return response.data;
        } catch (err) {
            console.error("Error submitting testimonial:", err);
            throw err; 
        }
    },
    
    /**
     * @desc Approves a testimonial via Admin interface.
     * @param {string} id - Testimonial ID
     * @param {string} notes - Admin notes (optional)
     */
    approveTestimonial: async (id, notes) => {
        try {
            // Calls POST /api/testimonials/:id/approve (protected by requireAdmin)
            const response = await apiClient.post(`/testimonials/${id}/approve`, { notes });
            const updatedTestimonial = response.data.data;
            
            // Update the state with the new status
            set((state) => ({
                testimonials: state.testimonials.map((t) =>
                    t._id === id ? updatedTestimonial : t
                ),
            }));
            return response.data;
        } catch (err) {
            console.error("Error approving testimonial:", err);
            throw err;
        }
    },

    /**
     * @desc Rejects a testimonial via Admin interface.
     * @param {string} id - Testimonial ID
     * @param {string} notes - Admin notes (optional)
     */
    rejectTestimonial: async (id, notes) => {
        try {
            // Calls POST /api/testimonials/:id/reject (protected by requireAdmin)
            const response = await apiClient.post(`/testimonials/${id}/reject`, { notes });
            const updatedTestimonial = response.data.data;
            
            // Update the state with the new status
            set((state) => ({
                testimonials: state.testimonials.map((t) =>
                    t._id === id ? updatedTestimonial : t
                ),
            }));
            return response.data;
        } catch (err) {
            console.error("Error rejecting testimonial:", err);
            throw err;
        }
    },

    /**
     * @desc Requests changes on a testimonial via Admin interface.
     * @param {string} id - Testimonial ID
     * @param {string} notes - Admin notes
     */
    requestChanges: async (id, notes) => {
        try {
            // Calls POST /api/testimonials/:id/request-changes (protected by requireAdmin)
            const response = await apiClient.post(`/testimonials/${id}/request-changes`, { notes });
            const updatedTestimonial = response.data.data;
            
            // Update the state with the new status
            set((state) => ({
                testimonials: state.testimonials.map((t) =>
                    t._id === id ? updatedTestimonial : t
                ),
            }));
            return response.data;
        } catch (err) {
            console.error("Error requesting changes on testimonial:", err);
            throw err;
        }
    },
}));