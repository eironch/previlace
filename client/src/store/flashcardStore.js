import { create } from "zustand";
import flashcardService from "../services/flashcardService";

export const useFlashcardStore = create((set, get) => ({
  dueFlashcards: [],
  flashcardDecks: [],
  publicDecks: [],
  flashcardStats: null,
  currentCardIndex: 0,
  cardReviews: {},
  isLoading: false,
  error: null,

  fetchDueFlashcards: async (limit = 20) => {
    set({ isLoading: true, error: null });

    try {
      const response = await flashcardService.getDueFlashcards(limit);

      if (response.success) {
        set({ dueFlashcards: response.data.flashcards, currentCardIndex: 0 });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFlashcardDecks: async () => {
    try {
      const response = await flashcardService.getFlashcardDecks();

      if (response.success) {
        set({ flashcardDecks: response.data.decks });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  fetchPublicDecks: async (limit = 10) => {
    try {
      const response = await flashcardService.getPublicFlashcardDecks(limit);

      if (response.success) {
        set({ publicDecks: response.data.decks });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  createFlashcardDeck: async (name, description, isPublic) => {
    try {
      const response = await flashcardService.createFlashcardDeck(
        name,
        description,
        isPublic
      );

      if (response.success) {
        const decks = get().flashcardDecks;
        set({ flashcardDecks: [...decks, response.data.deck] });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  recordFlashcardReview: async (flashcardId, quality, timeSpent) => {
    try {
      const response = await flashcardService.recordFlashcardReview(
        flashcardId,
        quality,
        timeSpent
      );

      if (response.success) {
        set((state) => ({
          cardReviews: {
            ...state.cardReviews,
            [flashcardId]: {
              quality,
              timeSpent,
              timestamp: Date.now(),
            },
          },
        }));
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  nextFlashcard: () => {
    set((state) => ({
      currentCardIndex: Math.min(
        state.currentCardIndex + 1,
        state.dueFlashcards.length - 1
      ),
    }));
  },

  previousFlashcard: () => {
    set((state) => ({
      currentCardIndex: Math.max(state.currentCardIndex - 1, 0),
    }));
  },

  fetchFlashcardStats: async () => {
    try {
      const response = await flashcardService.getFlashcardStats();

      if (response.success) {
        set({ flashcardStats: response.data.stats });
        return { success: true };
      }
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  getCurrentFlashcard: () => {
    const { dueFlashcards, currentCardIndex } = get();
    return dueFlashcards[currentCardIndex] || null;
  },

  getProgress: () => {
    const { dueFlashcards, currentCardIndex } = get();
    if (dueFlashcards.length === 0) return 0;
    return Math.round(((currentCardIndex + 1) / dueFlashcards.length) * 100);
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useFlashcardStore;
