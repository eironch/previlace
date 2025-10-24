import { create } from "zustand";
import { manualQuestionService } from "../services/manualQuestionService";

export const useReviewQuestionStore = create((set, get) => ({
  questions: [],
  selectedQuestion: null,
  isLoading: false,
  isLoadingCounts: false,
  error: null,
  questionCounts: {},
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },

  fetchQuestions: async (page = 1) => {
    set({ isLoading: true, error: null });

    try {
      const data = await manualQuestionService.getQuestions({
        status: ["draft", "review"],
        page,
        limit: 20,
      });

      set({
        questions: data.questions,
        pagination: data.pagination,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Fetch review questions error:", error);
      }
      set({
        isLoading: false,
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  },

  fetchQuestionById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const data = await manualQuestionService.getQuestionById(id);

      set({
        selectedQuestion: data.question,
        isLoading: false,
        error: null,
      });

      return { success: true, question: data.question };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Fetch review question by ID error:", error);
      }
      set({
        isLoading: false,
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  },

  reviewQuestion: async (id, action, notes) => {
    set({ isLoading: true, error: null });

    try {
      const data = await manualQuestionService.reviewQuestion(id, action, notes);

      set((state) => ({
        questions: state.questions.map((question) =>
          question._id === id ? data.question : question
        ),
        selectedQuestion: data.question,
        isLoading: false,
        error: null,
      }));

      return { success: true, question: data.question };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Review question error:", error);
      }
      set({
        isLoading: false,
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  },

  deleteQuestion: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await manualQuestionService.deleteQuestion(id);

      set((state) => ({
        questions: state.questions.filter((question) => question._id !== id),
        selectedQuestion:
          state.selectedQuestion?._id === id ? null : state.selectedQuestion,
        isLoading: false,
        error: null,
      }));

      return { success: true };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Delete review question error:", error);
      }
      set({
        isLoading: false,
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  },

  duplicateQuestion: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const data = await manualQuestionService.duplicateQuestion(id);

      set((state) => ({
        questions: [data.question, ...state.questions],
        isLoading: false,
        error: null,
      }));

      return { success: true, question: data.question };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Duplicate review question error:", error);
      }
      set({
        isLoading: false,
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  },

  fetchQuestionCounts: async () => {
    set({ isLoadingCounts: true, error: null });

    try {
      const data = await manualQuestionService.getQuestionCounts({
        status: ["draft", "review"],
      });

      set({
        questionCounts: data.counts,
        isLoadingCounts: false,
        error: null,
      });

      return { success: true, counts: data.counts };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Fetch review question counts error:", error);
      }
      set({
        isLoadingCounts: false,
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  },

  selectQuestion: (question) => {
    set({ selectedQuestion: question });
  },

  clearSelectedQuestion: () => {
    set({ selectedQuestion: null });
  },

  clearError: () => {
    set({ error: null });
  },

  setPage: (page) => {
    get().fetchQuestions(page);
  },

  approveQuestion: async (id, notes) => {
    set({ isLoading: true, error: null });

    try {
      const data = await manualQuestionService.reviewQuestion(id, "approved", notes);

      set((state) => ({
        questions: state.questions.map((question) =>
          question._id === id ? data.question : question
        ),
        selectedQuestion: data.question,
        isLoading: false,
        error: null,
      }));

      return { success: true, question: data.question };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Approve question error:", error);
      }
      set({
        isLoading: false,
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  },

  rejectQuestion: async (id, notes) => {
    set({ isLoading: true, error: null });

    try {
      const data = await manualQuestionService.reviewQuestion(id, "rejected", notes);

      set((state) => ({
        questions: state.questions.map((question) =>
          question._id === id ? data.question : question
        ),
        selectedQuestion: data.question,
        isLoading: false,
        error: null,
      }));

      return { success: true, question: data.question };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Reject question error:", error);
      }
      set({
        isLoading: false,
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  },

  requestChanges: async (id, notes) => {
    set({ isLoading: true, error: null });

    try {
      const data = await manualQuestionService.reviewQuestion(id, "requested_changes", notes);

      set((state) => ({
        questions: state.questions.map((question) =>
          question._id === id ? data.question : question
        ),
        selectedQuestion: data.question,
        isLoading: false,
        error: null,
      }));

      return { success: true, question: data.question };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Request changes error:", error);
      }
      set({
        isLoading: false,
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  },

  publishQuestion: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const data = await manualQuestionService.publishQuestion(id);

      set((state) => ({
        questions: state.questions.map((question) =>
          question._id === id ? data.question : question
        ),
        selectedQuestion: data.question,
        isLoading: false,
        error: null,
      }));

      return { success: true, question: data.question };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Publish question error:", error);
      }
      set({
        isLoading: false,
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  },
}));
