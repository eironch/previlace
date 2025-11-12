import apiClient from "./apiClient";

const testimonialService = {
    // 1. ADMIN FETCH: Gets ALL testimonials (protected by requireAdmin)
    async fetchAllTestimonials(params) {
        // Calls GET /api/testimonials (Can include status filter in params)
        const response = await apiClient.get("/testimonials", { params });
        return response.data;
    },

    // 2. PUBLIC FETCH: Gets ONLY approved testimonials (public endpoint)
    async fetchApprovedTestimonials() {
        // Calls GET /api/public/testimonials/approved
        const response = await apiClient.get("/public/testimonials/approved");
        return response.data;
    },

    // 3. USER SUBMISSION: Sends new testimonial from the modal (protected by protect)
    async submitTestimonial(data) {
        // Calls POST /api/testimonials
        const response = await apiClient.post("/testimonials", data);
        return response.data;
    },

    // 4. ADMIN ACTIONS: Status updates (protected by requireAdmin)
    async approveTestimonial(id, notes) {
        const response = await apiClient.post(`/testimonials/${id}/approve`, { notes });
        return response.data;
    },

    async rejectTestimonial(id, notes) {
        const response = await apiClient.post(`/testimonials/${id}/reject`, { notes });
        return response.data;
    },

    async requestChanges(id, notes) {
        const response = await apiClient.post(`/testimonials/${id}/request-changes`, { notes });
        return response.data;
    },

    // 5. ADMIN CRUD: Edit/Delete
    async updateTestimonial(id, data) {
        const response = await apiClient.put(`/testimonials/${id}`, data);
        return response.data;
    },
    
    async deleteTestimonial(id) {
        const response = await apiClient.delete(`/testimonials/${id}`);
        return response.data;
    },
};

export default testimonialService;