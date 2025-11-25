import apiClient from "./apiClient";

const userManagementService = {
  async getAllUsers(params) {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  async updateUserStatus(userId, action, reason = null) {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, {
      action,
      reason,
    });
    return response.data;
  },

  async bulkUserAction(userIds, action, reason = null) {
    const response = await apiClient.post("/admin/users/bulk-action", {
      userIds,
      action,
      reason,
    });
    return response.data;
  },

  async getUserActivity(userId) {
    const response = await apiClient.get(`/admin/users/${userId}/activity`);
    return response.data;
  },

  async searchUsers(query) {
    const response = await apiClient.get("/admin/users/search", {
      params: { q: query },
    });
    return response.data;
  },

  async exportUsers(format = "json", filters = {}) {
    const response = await apiClient.get("/admin/users/export", {
      params: { format, filters },
    });
    return response.data;
  },

  async createUser(userData) {
    const response = await apiClient.post("/admin/users", userData);
    return response.data;
  },
};

export default userManagementService;
