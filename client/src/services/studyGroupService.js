import { apiClient } from "./apiClient";

export const studyGroupService = {
  async createGroup(data) {
    const response = await apiClient.post("/api/study-groups", data);
    return response.data.data.studyGroup;
  },

  async getPublicGroups(params) {
    const response = await apiClient.get("/api/study-groups/public", {
      params,
    });
    return response.data.data;
  },

  async getUserGroups() {
    const response = await apiClient.get("/api/study-groups");
    return response.data.data.groups;
  },

  async getGroupDetails(groupId) {
    const response = await apiClient.get(`/api/study-groups/${groupId}`);
    return response.data.data;
  },

  async joinGroup(groupId, inviteCode) {
    const response = await apiClient.post(
      `/api/study-groups/${groupId}/join`,
      { inviteCode }
    );
    return response.data.data.membership;
  },

  async joinByCode(inviteCode) {
    const response = await apiClient.post(
      "/api/study-groups/join-by-code",
      { inviteCode }
    );
    return response.data.data.membership;
  },

  async leaveGroup(groupId) {
    const response = await apiClient.post(
      `/api/study-groups/${groupId}/leave`
    );
    return response.data.data;
  },

  async updateGroup(groupId, data) {
    const response = await apiClient.put(
      `/api/study-groups/${groupId}`,
      data
    );
    return response.data.data.group;
  },

  async manageMember(groupId, memberId, action, role) {
    const response = await apiClient.post(
      `/api/study-groups/${groupId}/members/${memberId}`,
      { action, role }
    );
    return response.data.data.membership;
  },

  async sendMessage(groupId, data) {
    const response = await apiClient.post(
      `/api/study-groups/${groupId}/messages`,
      data
    );
    return response.data.data.message;
  },

  async getMessages(groupId, page = 1, limit = 50) {
    const response = await apiClient.get(
      `/api/study-groups/${groupId}/messages`,
      {
        params: { page, limit },
      }
    );
    return response.data.data;
  },

  async deleteMessage(groupId, messageId) {
    const response = await apiClient.delete(
      `/api/study-groups/${groupId}/messages/${messageId}`
    );
    return response.data.data;
  },

  async getGroupLeaderboard(groupId) {
    const response = await apiClient.get(
      `/api/study-groups/${groupId}/leaderboard`
    );
    return response.data.data.leaderboard;
  },
};

export default studyGroupService;
