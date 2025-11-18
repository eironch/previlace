import apiClient from "./apiClient";

const testimonialService = {
    // 1. ADMIN FETCH: Gets ALL testimonials (protected by requireAdmin)
    // Used by the management component to see all statuses (pending, approved, etc.)
    async fetchAllTestimonials(params) {
        // Calls GET /api/testimonials (Can include status filter in params)
        const response = await apiClient.get("/testimonials", { params });
        return response.data;
    },

    // 2. PUBLIC FETCH: Gets ONLY APPROVED testimonials for the public page/landing page.
    async fetchApprovedTestimonials() {
        // Calls GET /api/public/testimonials/approved
        const response = await apiClient.get("/public/testimonials/approved");
        return response.data;
    },

    // 3. SUBMIT: Allows a user to submit a new testimonial (status defaults to 'pending').
    async submitTestimonial(data) {
        // Calls POST /api/testimonials
        const response = await apiClient.post("/testimonials", data);
        return response.data;
    },

    // 4. UPDATE: Handles status changes (approve, revert to pending).
    // This is the core function used by approveTestimonial and revertToPending in the store.
    async updateTestimonial(id, data) {
        // Calls PUT /api/testimonials/:id
        const response = await apiClient.put(`/testimonials/${id}`, data);
        return response.data;
    },
    
    // NOTE: deleteTestimonial has been removed as it was not used by the component or store actions.
};

export default testimonialService;