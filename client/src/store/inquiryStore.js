import { create } from "zustand";
import apiClient from "../services/apiClient";

export const useInquiryStore = create((set, get) => ({
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,

  createTicket: async (data) => {
    try {
      const response = await apiClient.post("/inquiry-tickets", data);
      set((state) => ({
        tickets: [response, ...state.tickets],
      }));
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  getStudentTickets: async (status) => {
    const currentTickets = get().tickets || [];
    if (currentTickets.length === 0) {
      set({ loading: true });
    }
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get("/inquiry-tickets/student", {
        params,
      });
      // Ensure tickets is always an array
      const ticketsData = Array.isArray(response) ? response : (response?.tickets || response?.data || []);
      set({ tickets: ticketsData, loading: false });
    } catch (error) {
      set({ error: error.message, tickets: [], loading: false });
    }
  },

  getInstructorTickets: async (status, subjectId) => {
    const currentTickets = get().tickets || [];
    if (currentTickets.length === 0) {
      set({ loading: true });
    }
    try {
      const params = {};
      if (status) params.status = status;
      if (subjectId) params.subjectId = subjectId;
      const response = await apiClient.get("/inquiry-tickets/instructor", {
        params,
      });
      // Ensure tickets is always an array
      const ticketsData = Array.isArray(response) ? response : (response?.tickets || response?.data || []);
      set({ tickets: ticketsData, loading: false });
    } catch (error) {
      set({ error: error.message, tickets: [], loading: false });
    }
  },

  getTicketById: async (id) => {
    const current = get().currentTicket;
    if (!current || current._id !== id) {
      set({ loading: true });
    }
    try {
      const ticket = await apiClient.get(`/inquiry-tickets/${id}`);
      set({ currentTicket: ticket, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addResponse: async (id, message) => {
    try {
      const ticket = await apiClient.post(`/inquiry-tickets/${id}/response`, {
        message,
      });
      set({ currentTicket: ticket });
      return ticket;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  addInternalNote: async (id, note) => {
    try {
      const ticket = await apiClient.post(
        `/inquiry-tickets/${id}/internal-note`,
        { note }
      );
      set({ currentTicket: ticket });
      return ticket;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTicketStatus: async (id, status) => {
    try {
      const ticket = await apiClient.patch(`/inquiry-tickets/${id}/status`, {
        status,
      });
      set({ currentTicket: ticket });
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
      // Refresh tickets after bulk update
      // Note: We might want to optimistically update instead if performance is key
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
