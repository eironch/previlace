import { create } from "zustand";
import apiClient from "../services/apiClient";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    const currentNotifications = get().notifications || [];
    if (currentNotifications.length === 0) {
      set({ loading: true });
    }
    try {
      const response = await apiClient.get("/notifications");
      set({
        notifications: response.notifications || [],
        unreadCount: response.unreadCount || 0,
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      // Optimistic update
      set((state) => {
        const notification = state.notifications.find((n) => n._id === id);
        if (notification && !notification.isRead) {
          return {
            notifications: state.notifications.map((n) =>
              n._id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        }
        return state;
      });

      await apiClient.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Revert on error would be ideal, but skipping for simplicity
    }
  },

  markAllAsRead: async () => {
    try {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));

      await apiClient.patch("/notifications/read-all");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  },

  deleteNotification: async (id) => {
    try {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: state.notifications.find((n) => n._id === id)?.isRead
          ? state.unreadCount
          : Math.max(0, state.unreadCount - 1),
      }));

      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  },
}));
