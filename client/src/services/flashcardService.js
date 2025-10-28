import apiClient from "./apiClient";

const flashcardService = {
  async getDueFlashcards(limit = 20) {
    const { data } = await apiClient.get("/flashcards/due", {
      params: { limit },
    });
    return data;
  },

  async recordFlashcardReview(flashcardId, quality, timeSpent) {
    const { data } = await apiClient.post(`/flashcards/${flashcardId}/review`, {
      quality,
      timeSpent,
    });
    return data;
  },

  async getFlashcardStats() {
    const { data } = await apiClient.get("/flashcards/stats");
    return data;
  },

  async createFlashcardDeck(name, description, isPublic) {
    const { data } = await apiClient.post("/flashcards/decks", {
      name,
      description,
      isPublic,
    });
    return data;
  },

  async getFlashcardDecks() {
    const { data } = await apiClient.get("/flashcards/decks/list");
    return data;
  },

  async getPublicFlashcardDecks(limit = 10) {
    const { data } = await apiClient.get("/flashcards/decks/public", {
      params: { limit },
    });
    return data;
  },

  async deleteFlashcardDeck(deckId) {
    const { data } = await apiClient.delete(`/flashcards/decks/${deckId}`);
    return data;
  },

  async addQuestionToFlashcardDeck(deckId, questionId) {
    const { data } = await apiClient.post(`/flashcards/decks/${deckId}/questions`, {
      questionId,
    });
    return data;
  },
};

export { flashcardService };
export default flashcardService;
