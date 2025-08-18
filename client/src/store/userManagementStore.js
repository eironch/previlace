import { create } from "zustand";
import userManagementService from "../services/userManagementService";

const useUserManagementStore = create((set, get) => ({
  users: [],
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalUsers: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    search: "",
    role: "all",
    status: "all",
    examType: "all",
    education: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  selectedUsers: [],
  isLoading: false,
  error: null,

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  setSelectedUsers: (userIds) => set({ selectedUsers: userIds }),

  toggleUserSelection: (userId) =>
    set((state) => ({
      selectedUsers: state.selectedUsers.includes(userId)
        ? state.selectedUsers.filter((id) => id !== userId)
        : [...state.selectedUsers, userId],
    })),

  selectAllUsers: () =>
    set((state) => ({
      selectedUsers: state.users.map((user) => user._id),
    })),

  deselectAllUsers: () => set({ selectedUsers: [] }),

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters,
      };

      const response = await userManagementService.getAllUsers(params);
      
      set({
        users: response.data.users,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || "Failed to fetch users",
        isLoading: false,
      });
    }
  },

  updateUserStatus: async (userId, action, reason) => {
    try {
      await userManagementService.updateUserStatus(userId, action, reason);
      await get().fetchUsers();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update user status",
      };
    }
  },

  performBulkAction: async (action, reason) => {
    const { selectedUsers } = get();
    if (selectedUsers.length === 0) {
      return { success: false, error: "No users selected" };
    }

    try {
      await userManagementService.bulkUserAction(
        selectedUsers,
        action,
        reason
      );
      set({ selectedUsers: [] });
      await get().fetchUsers();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to perform bulk action",
      };
    }
  },

  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, currentPage: page },
    })),

  setLimit: (limit) =>
    set((state) => ({
      pagination: { ...state.pagination, limit, currentPage: 1 },
    })),

  resetFilters: () =>
    set({
      filters: {
        search: "",
        role: "all",
        status: "all",
        examType: "all",
        education: "all",
        sortBy: "createdAt",
        sortOrder: "desc",
      },
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalUsers: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    }),
}));

export default useUserManagementStore;
