import apiClient from "./apiClient";

const bookmarkService = {
  async createBookmark(questionId, notes, priority, folderId) {
    const { data } = await apiClient.post("/bookmarks", {
      questionId,
      notes,
      priority,
      folderId,
    });
    return data;
  },

  async getBookmarks(filters = {}) {
    const { data } = await apiClient.get("/bookmarks", { params: filters });
    return data;
  },

  async updateBookmark(bookmarkId, updates) {
    const { data } = await apiClient.put(`/bookmarks/${bookmarkId}`, updates);
    return data;
  },

  async deleteBookmark(bookmarkId) {
    const { data } = await apiClient.delete(`/bookmarks/${bookmarkId}`);
    return data;
  },

  async createBookmarkFolder(name, description, color) {
    const { data } = await apiClient.post("/bookmarks/folders", {
      name,
      description,
      color,
    });
    return data;
  },

  async getBookmarkFolders() {
    const { data } = await apiClient.get("/bookmarks/folders/list");
    return data;
  },

  async deleteBookmarkFolder(folderId) {
    const { data } = await apiClient.delete(`/bookmarks/folders/${folderId}`);
    return data;
  },

  async getBookmarkStats() {
    const { data } = await apiClient.get("/bookmarks/stats/all");
    return data;
  },
};

export { bookmarkService };
export default bookmarkService;
