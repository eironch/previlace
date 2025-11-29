import { create } from "zustand";
import apiClient from "../services/apiClient";
import { mutate } from "swr";

export const useInquiryStore = create((set, get) => ({
  // We removed tickets/currentTicket state as it's now managed by SWR
  error: null,

  createTicket: async (data) => {
    try {
      const response = await apiClient.post("/inquiry-tickets", data);
      const ticket = response.data;
      // Trigger SWR revalidation for student tickets
      mutate((key) => typeof key === 'string' && key.startsWith('/inquiry-tickets/student'));
      return ticket;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Removed getStudentTickets, getInstructorTickets, getTicketById (handled by useTickets hook)

  addResponse: async (id, message) => {
    try {
      const response = await apiClient.post(`/inquiry-tickets/${id}/response`, {
        message,
      });
      const ticket = response.data;
      
      // Update the specific ticket cache immediately
      mutate(`/inquiry-tickets/${id}`, ticket, false);
      // Trigger revalidation to ensure consistency
      mutate(`/inquiry-tickets/${id}`);
      
      return ticket;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  addInternalNote: async (id, note) => {
    try {
      const response = await apiClient.post(
        `/inquiry-tickets/${id}/internal-note`,
        { note }
      );
      const ticket = response.data;
      
      mutate(`/inquiry-tickets/${id}`, ticket, false);
      mutate(`/inquiry-tickets/${id}`);

      return ticket;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTicketStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/inquiry-tickets/${id}/status`, {
        status,
      });
      const ticket = response.data;
      
      mutate(`/inquiry-tickets/${id}`, ticket, false);
      mutate(`/inquiry-tickets/${id}`);
      // Also revalidate lists
      mutate((key) => typeof key === 'string' && key.startsWith('/inquiry-tickets'));

      return ticket;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  bulkUpdateTickets: async (data) => {
    try {
      const response = await apiClient.patch(
        "/inquiry-tickets/bulk-update",
        data
      );
      // Revalidate all ticket lists
      mutate((key) => typeof key === 'string' && key.startsWith('/inquiry-tickets'));
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
