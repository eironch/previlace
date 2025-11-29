import { create } from "zustand";
import testimonialService from "../services/testimonialService";

export const useTestimonialsStore = create((set, get) => ({
    // --- STATE ---
    testimonials: [],             // Used for ALL (Admin/Review view)
    approvedTestimonials: [],     // State for public/approved list
    isLoading: false,
    error: null,

    // --- ASYNC ACTIONS ---

    /**
     * @desc Fetches ALL testimonials (for Admin view).
     */
    fetchTestimonials: async () => {
        const { testimonials } = get();
        // SWR: Only set loading if we don't have data yet
        if (testimonials.length === 0) {
            set({ isLoading: true, error: null });
        }

        try {
            // Add minimum delay to ensure animation is visible only on initial load
            const fetchPromise = testimonialService.fetchAllTestimonials({});
            
            // If we are loading for the first time, add a small delay to prevent flash
            const response = testimonials.length === 0 
                ? await Promise.all([fetchPromise, new Promise(resolve => setTimeout(resolve, 500))]).then(res => res[0])
                : await fetchPromise;

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
     * @desc Fetches ONLY APPROVED testimonials for the public page.
     */
    fetchApprovedTestimonials: async () => {
        set({ isLoading: true, error: null });
        try {
            // Add minimum delay to ensure animation is visible
            const [response] = await Promise.all([
                testimonialService.fetchApprovedTestimonials(),
                new Promise(resolve => setTimeout(resolve, 500))
            ]);

            set({
                approvedTestimonials: response.testimonials || [],
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

    /**
     * @desc Generic function to update a testimonial's status.
     * @param {string} id - Testimonial ID
     * @param {string} newStatus - 'pending' or 'approved'
     * @param {string} adminNotes - Optional notes
     */
    updateTestimonialStatus: async (id, newStatus, adminNotes = '') => {
        try {
            const updateData = { status: newStatus, adminNotes };

            // 1. Call the service layer to update the backend/API
            const updatedItem = await testimonialService.updateTestimonial(id, updateData);

            // 2. Update the local store state to refresh the UI
            set(state => ({
                testimonials: state.testimonials.map(t =>
                    t._id === id ? { ...t, ...updateData, adminNotes } : t
                )
            }));

            return updatedItem;
        } catch (err) {
            console.error(`Error updating testimonial status to ${newStatus}:`, err);
            throw err;
        }
    },

    /**
     * @desc Approves a testimonial using the generic status update.
     */
    approveTestimonial: async (id, notes) => {
        // The limit check happens in the React component before calling this function.
        await get().updateTestimonialStatus(id, 'approved', notes);
    },

    /**
     * @desc Reverts an approved testimonial back to pending status.
     */
    revertToPending: async (id, notes) => {
        await get().updateTestimonialStatus(id, 'pending', notes);
    },
}));
