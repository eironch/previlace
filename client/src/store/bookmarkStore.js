import { create } from "zustand";
import bookmarkService from "../services/bookmarkService";

export const useBookmarkStore = create((set, get) => ({
  bookmarks: [],
  bookmarkFolders: [],
  bookmarkStats: null,
  isLoading: false,
  error: null,

  fetchBookmarks: async (filters = {}) => {
    set({ isLoading: true, error: null });

    try {
      const response = await bookmarkService.getBookmarks(filters);

      if (response.success) {
        set({ bookmarks: response.data.bookmarks });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  createBookmark: async (questionId, notes, priority, folderId) => {
    try {
      const response = await bookmarkService.createBookmark(
        questionId,
        notes,
        priority,
        folderId
      );

      if (response.success) {
        const bookmarks = get().bookmarks;
        set({ bookmarks: [...bookmarks, response.data.bookmark] });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  updateBookmark: async (bookmarkId, updates) => {
    try {
      const response = await bookmarkService.updateBookmark(bookmarkId, updates);

      if (response.success) {
        const bookmarks = get().bookmarks.map((b) =>
          b._id === bookmarkId ? response.data.bookmark : b
        );
        set({ bookmarks });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  deleteBookmark: async (bookmarkId) => {
    try {
      const response = await bookmarkService.deleteBookmark(bookmarkId);

      if (response.success) {
        const bookmarks = get().bookmarks.filter((b) => b._id !== bookmarkId);
        set({ bookmarks });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  isQuestionBookmarked: (questionId) => {
    const { bookmarks } = get();
    return bookmarks.some((b) => b.questionId === questionId);
  },

  getBookmarkForQuestion: (questionId) => {
    const { bookmarks } = get();
    return bookmarks.find((b) => b.questionId === questionId);
  },

  fetchBookmarkFolders: async () => {
    try {
      const response = await bookmarkService.getBookmarkFolders();

      if (response.success) {
        set({ bookmarkFolders: response.data.folders });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  createBookmarkFolder: async (name, description, color) => {
    try {
      const response = await bookmarkService.createBookmarkFolder(
        name,
        description,
        color
      );

      if (response.success) {
        const folders = get().bookmarkFolders;
        set({ bookmarkFolders: [...folders, response.data.folder] });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  deleteBookmarkFolder: async (folderId) => {
    try {
      const response = await bookmarkService.deleteBookmarkFolder(folderId);

      if (response.success) {
        const folders = get().bookmarkFolders.filter((f) => f._id !== folderId);
        set({ bookmarkFolders: folders });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  fetchBookmarkStats: async () => {
    try {
      const response = await bookmarkService.getBookmarkStats();

      if (response.success) {
        set({ bookmarkStats: response.data.stats });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useBookmarkStore;
