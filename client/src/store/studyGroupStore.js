import { create } from "zustand";
import studyGroupService from "../services/studyGroupService";

const useStudyGroupStore = create((set, get) => ({
  publicGroups: [],
  userGroups: [],
  currentGroup: null,
  groupMessages: [],
  groupLeaderboard: [],
  pagination: null,
  loading: false,
  error: null,

  fetchPublicGroups: async (params) => {
    set({ loading: true });
    try {
      const data = await studyGroupService.getPublicGroups(params);
      set({
        publicGroups: data.groups,
        pagination: data.pagination,
        error: null,
      });
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch public groups:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchUserGroups: async () => {
    set({ loading: true });
    try {
      const groups = await studyGroupService.getUserGroups();
      set({ userGroups: groups, error: null });
      return groups;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch user groups:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchGroupDetails: async (groupId) => {
    set({ loading: true });
    try {
      const data = await studyGroupService.getGroupDetails(groupId);
      set({ currentGroup: data.group, error: null });
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch group details:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createStudyGroup: async (formData) => {
    set({ loading: true });
    try {
      const group = await studyGroupService.createGroup(formData);
      set((state) => ({
        userGroups: [...state.userGroups, group],
        error: null,
      }));
      return group;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to create study group:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  joinGroup: async (groupId) => {
    set({ loading: true });
    try {
      const membership = await studyGroupService.joinGroup(groupId);
      const { userGroups } = get();
      const groupIndex = userGroups.findIndex((g) => g._id === groupId);
      if (groupIndex >= 0) {
        userGroups[groupIndex].member = membership;
      }
      set({ userGroups, error: null });
      return membership;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to join group:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  joinGroupByCode: async (inviteCode) => {
    set({ loading: true });
    try {
      const membership = await studyGroupService.joinByCode(inviteCode);
      set({ error: null });
      return membership;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to join group by code:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  leaveGroup: async (groupId) => {
    set({ loading: true });
    try {
      await studyGroupService.leaveGroup(groupId);
      set((state) => ({
        userGroups: state.userGroups.filter((g) => g._id !== groupId),
        error: null,
      }));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to leave group:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateGroup: async (groupId, data) => {
    set({ loading: true });
    try {
      const group = await studyGroupService.updateGroup(groupId, data);
      set((state) => ({
        currentGroup: state.currentGroup?._id === groupId ? group : state.currentGroup,
        error: null,
      }));
      return group;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to update group:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  manageMember: async (groupId, memberId, action, role) => {
    set({ loading: true });
    try {
      const membership = await studyGroupService.manageMember(
        groupId,
        memberId,
        action,
        role
      );
      return membership;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to manage member:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    try {
      const message = await studyGroupService.sendMessage(groupId, messageData);
      set((state) => ({
        groupMessages: [...state.groupMessages, message],
        error: null,
      }));
      return message;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to send message:", error);
      }
      set({ error: error.message });
      throw error;
    }
  },

  getGroupMessages: async (groupId, limit, skip) => {
    set({ loading: true });
    try {
      const data = await studyGroupService.getMessages(groupId, 1, limit);
      set({ groupMessages: data.messages, error: null });
      return data.messages;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch messages:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteGroupMessage: async (groupId, messageId) => {
    try {
      await studyGroupService.deleteMessage(groupId, messageId);
      set((state) => ({
        groupMessages: state.groupMessages.filter((m) => m._id !== messageId),
        error: null,
      }));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to delete message:", error);
      }
      set({ error: error.message });
      throw error;
    }
  },

  getGroupLeaderboard: async (groupId) => {
    set({ loading: true });
    try {
      const leaderboard = await studyGroupService.getGroupLeaderboard(groupId);
      set({ groupLeaderboard: leaderboard, error: null });
      return leaderboard;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch leaderboard:", error);
      }
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  scheduleGroupSession: async (groupId, sessionData) => {
    try {
      const session = await studyGroupService.scheduleSession(
        groupId,
        sessionData
      );
      return session;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to schedule session:", error);
      }
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () =>
    set({
      publicGroups: [],
      userGroups: [],
      currentGroup: null,
      groupMessages: [],
      groupLeaderboard: [],
      pagination: null,
      loading: false,
      error: null,
    }),
}));

export default useStudyGroupStore;
