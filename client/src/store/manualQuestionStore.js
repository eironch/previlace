import { create } from "zustand";
import { manualQuestionService } from "../services/manualQuestionService";

export const useManualQuestionStore = create((set, get) => ({
	questions: [],
	selectedQuestion: null,
	questionStats: null,
	questionCounts: {},
	isLoading: false,
	isCreating: false,
	isLoadingCounts: false,
	error: null,
	pagination: {
		currentPage: 1,
		totalPages: 0,
		totalItems: 0,
		hasNextPage: false,
		hasPrevPage: false,
	},
	filters: {
		category: "",
		subjectArea: "",
		difficulty: "",
		examLevel: "",
		status: "",
		language: "",
		search: "",
		questionType: "",
		source: "",
	},

	setFilters: (newFilters) => {
		set((state) => ({
			filters: { ...state.filters, ...newFilters }
		}));
	},

	fetchQuestions: async (page = 1, filters = {}) => {
		set({ isLoading: true, error: null });
		
		try {
			const currentFilters = { ...get().filters, ...filters };
			const cleanFilters = Object.fromEntries(
				Object.entries(currentFilters).filter(([_, value]) => value !== "")
			);
			
			const data = await manualQuestionService.getQuestions({
				...cleanFilters,
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
				console.error("Fetch questions error:", error);
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
				console.error("Fetch question by ID error:", error);
			}
			set({
				isLoading: false,
				error: error.message,
			});
			
			return { success: false, error: error.message };
		}
	},

	createQuestion: async (questionData) => {
		set({ isCreating: true, error: null });
		
		try {
			const data = await manualQuestionService.createQuestion(questionData);
			
			set((state) => ({
				questions: [data.question, ...state.questions],
				isCreating: false,
				error: null,
			}));
			
			return { success: true, question: data.question };
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Create question error:", error);
			}
			set({
				isCreating: false,
				error: error.message,
			});
			
			return { success: false, error: error.message };
		}
	},

	updateQuestion: async (id, questionData) => {
		set({ isLoading: true, error: null });
		
		try {
			const data = await manualQuestionService.updateQuestion(id, questionData);
			
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
				console.error("Update question error:", error);
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
				selectedQuestion: state.selectedQuestion?._id === id ? null : state.selectedQuestion,
				isLoading: false,
				error: null,
			}));
			
			return { success: true };
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Delete question error:", error);
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
				console.error("Duplicate question error:", error);
			}
			set({
				isLoading: false,
				error: error.message,
			});
			
			return { success: false, error: error.message };
		}
	},

	submitForReview: async (id) => {
		set({ isLoading: true, error: null });
		
		try {
			await manualQuestionService.submitForReview(id);
			
			set((state) => ({
				questions: state.questions.map((question) =>
					question._id === id
						? { ...question, status: "review" }
						: question
				),
				isLoading: false,
				error: null,
			}));
			
			return { success: true };
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Submit for review error:", error);
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

	fetchQuestionStats: async () => {
		try {
			const data = await manualQuestionService.getQuestionStats();
			
			set({
				questionStats: data,
				error: null,
			});
			
			return { success: true, stats: data };
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Fetch question stats error:", error);
			}
			set({ error: error.message });
			return { success: false, error: error.message };
		}
	},

	getRandomQuestions: async (filters, limit = 10) => {
		try {
			const data = await manualQuestionService.getRandomQuestions({
				...filters,
				limit,
			});
			
			return { success: true, questions: data.questions };
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Get random questions error:", error);
			}
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

	clearQuestionCounts: () => {
		set({ questionCounts: {} });
	},

	resetFilters: () => {
		set({
			filters: {
				category: "",
				subjectArea: "",
				difficulty: "",
				examLevel: "",
				status: "",
				language: "",
				search: "",
				questionType: "",
				source: "",
			}
		});
	},

	setPage: (page) => {
		get().fetchQuestions(page);
	},

	fetchQuestionCounts: async (filters = {}) => {
		set({ isLoadingCounts: true, error: null });
		
		try {
			const currentFilters = { ...get().filters, ...filters };
			const cleanFilters = Object.fromEntries(
				Object.entries(currentFilters).filter(([key, value]) => 
					value !== "" && key !== "questionType"
				)
			);
			
			const data = await manualQuestionService.getQuestionCounts(cleanFilters);
			
			set({
				questionCounts: data.counts,
				isLoadingCounts: false,
				error: null,
			});
			
			return { success: true, counts: data.counts };
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Fetch question counts error:", error);
			}
			set({
				isLoadingCounts: false,
				error: error.message,
			});
			
			return { success: false, error: error.message };
		}
	},
}));
