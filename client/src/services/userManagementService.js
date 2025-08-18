import apiClient from "./authService";

const userManagementService = {
  getAllUsers: async (params) => {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  updateUserStatus: async (userId, action, reason = null) => {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, {
      action,
      reason,
    });
    return response.data;
  },

  bulkUserAction: async (userIds, action, reason = null) => {
    const response = await apiClient.post("/admin/users/bulk-action", {
      userIds,
      action,
      reason,
    });
    return response.data;
  },

  getUserActivity: async (userId) => {
    const response = await apiClient.get(`/admin/users/${userId}/activity`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await apiClient.get("/admin/users/search", {
      params: { q: query },
    });
    return response.data;
  },

  exportUsers: async (format = "json", filters = {}) => {
    const response = await apiClient.get("/admin/users/export", {
      params: { format, filters },
    });
    return response.data;
  },
};

export default userManagementService;
