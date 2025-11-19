import { create } from "zustand";
import { manualQuestionService } from "../services/manualQuestionService";

export const useEnhancedQuestionBankStore = create((set, get) => ({
  templates: [],
  questions: [],
  currentTemplate: null,
  currentQuestion: null,
  fieldValues: {},
  validationResults: {},
  previewContent: "",
  bulkQuestions: [],
  reviewQueue: [],
  versions: [],
  collaborators: [],
  isLoading: false,
  isSaving: false,
  error: null,
  filters: {
    category: "",
    subject: "",
    difficulty: "",
    status: "",
    search: "",
    dateRange: null,
  },
  searchQuery: "",
  activeFilters: {
    category: "",
    difficulty: "",
    examLevel: "",
    questionType: "",
    source: "",
  },
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },

  setFilters: (filters) => {
    set({ activeFilters: filters });
    const { searchQuery } = get();
    get().fetchQuestions({ page: 1, search: searchQuery, filters });
  },

  setSearchQuery: (search) => {
    set({ searchQuery: search });
    const { activeFilters } = get();
    get().fetchQuestions({ page: 1, search, filters: activeFilters });
  },

  setPage: (page) => {
    const { searchQuery, activeFilters } = get();
    get().fetchQuestions({ page, search: searchQuery, filters: activeFilters });
  },

  fetchTemplates: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await manualQuestionService.getTemplates({
        ...get().filters,
        ...filters,
      });
      set({
        templates: response.templates,
        isLoading: false,
      });
      return { success: true, data: response.templates };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  selectTemplate: async (templateId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await manualQuestionService.getTemplateById(templateId);
      set({
        currentTemplate: response.template,
        fieldValues: {},
        validationResults: {},
        isLoading: false,
      });
      return { success: true, data: response.template };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  setFieldValue: (fieldId, value) => {
    set((state) => ({
      fieldValues: {
        ...state.fieldValues,
        [fieldId]: value,
      },
    }));
    get().validateField(fieldId, value);
    get().updatePreview();
  },

  validateField: async (fieldId, value) => {
    const template = get().currentTemplate;
    if (!template) return;

    const field = template.field_definitions.find((f) => f.id === fieldId);
    if (!field) return;

    try {
      const result = await manualQuestionService.validateField(
        field,
        value,
        get().fieldValues
      );
      set((state) => ({
        validationResults: {
          ...state.validationResults,
          [fieldId]: result,
        },
      }));
    } catch (error) {
      set((state) => ({
        validationResults: {
          ...state.validationResults,
          [fieldId]: { isValid: false, error: error.message },
        },
      }));
    }
  },

  updatePreview: () => {
    const template = get().currentTemplate;
    const fieldValues = get().fieldValues;
    if (!template) return;

    const previewContent = manualQuestionService.renderPreview(
      template,
      fieldValues
    );
    set({ previewContent });
  },

  saveQuestion: async () => {
    set({ isSaving: true, error: null });
    const { currentTemplate, fieldValues } = get();

    try {
      const response = await manualQuestionService.createQuestion({
        template_id: currentTemplate._id,
        template_version: currentTemplate.version,
        field_values: fieldValues,
        metadata: {
          difficulty: fieldValues.difficulty || "medium",
          tags: fieldValues.tags || [],
        },
      });

      set((state) => ({
        questions: [response.question, ...state.questions],
        fieldValues: {},
        validationResults: {},
        previewContent: "",
        isSaving: false,
      }));

      return { success: true, data: response.question };
    } catch (error) {
      set({ isSaving: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  createBulkQuestions: async (questionsData) => {
    set({ isSaving: true, error: null });
    try {
      const response = await manualQuestionService.createBulkQuestions({
        template_id: get().currentTemplate._id,
        questions: questionsData,
        batch_options: {
          validation_level: "moderate",
          auto_publish: false,
        },
      });

      set((state) => ({
        questions: [...response.questions, ...state.questions],
        bulkQuestions: [],
        isSaving: false,
      }));

      return { success: true, data: response.questions };
    } catch (error) {
      set({ isSaving: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  fetchQuestions: async ({ page = 1, search = "", filters = {} } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await manualQuestionService.getQuestions({
        ...get().filters,
        ...filters,
        page,
        limit: 20,
        search,
      });
      set({
        questions: response.questions,
        pagination: response.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: response.questions?.length || 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        isLoading: false,
      });
      return { success: true, data: response.questions };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  deleteQuestion: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await manualQuestionService.deleteQuestion(id);
      set((state) => ({
        questions: state.questions.filter((q) => q._id !== id),
        reviewQueue: state.reviewQueue.filter((r) => r._id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  duplicateQuestion: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await manualQuestionService.duplicateQuestion(id);
      set((state) => ({
        questions: [response.question, ...state.questions],
        isLoading: false,
      }));
      return { success: true, question: response.question };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  sendBackToReview: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await manualQuestionService.sendBackToReview(id);
      set((state) => ({
        questions: state.questions.filter((q) => q._id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  submitForReview: async (questionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await manualQuestionService.submitForReview(questionId);
      set((state) => ({
        questions: state.questions.map((q) =>
          q._id === questionId ? response.question : q
        ),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  approveQuestion: async (questionId, feedback) => {
    set({ isLoading: true, error: null });
    try {
      const response = await manualQuestionService.approveQuestion(
        questionId,
        feedback
      );
      set((state) => ({
        questions: state.questions.map((q) =>
          q._id === questionId ? response.question : q
        ),
        reviewQueue: state.reviewQueue.filter((r) => r._id !== questionId),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  rejectQuestion: async (questionId, feedback) => {
    set({ isLoading: true, error: null });
    try {
      const response = await manualQuestionService.rejectQuestion(
        questionId,
        feedback
      );
      set((state) => ({
        questions: state.questions.map((q) =>
          q._id === questionId ? response.question : q
        ),
        reviewQueue: state.reviewQueue.filter((r) => r._id !== questionId),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  fetchReviewQueue: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await manualQuestionService.getReviewQueue();
      set({
        reviewQueue: response.questions,
        isLoading: false,
      });
      return { success: true, data: response.questions };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  fetchVersionHistory: async (questionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await manualQuestionService.getVersionHistory(questionId);
      set({
        versions: response.versions,
        isLoading: false,
      });
      return { success: true, data: response.versions };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  restoreVersion: async (questionId, versionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await manualQuestionService.restoreVersion(
        questionId,
        versionId
      );
      set((state) => ({
        questions: state.questions.map((q) =>
          q._id === questionId ? response.question : q
        ),
        currentQuestion: response.question,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  addCollaborator: async (questionId, collaboratorData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await manualQuestionService.addCollaborator(
        questionId,
        collaboratorData
      );
      set((state) => ({
        collaborators: [...state.collaborators, response.collaborator],
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  clearCurrentTemplate: () => {
    set({
      currentTemplate: null,
      fieldValues: {},
      validationResults: {},
      previewContent: "",
    });
  },

  clearError: () => {
    set({ error: null });
  },

  resetFilters: () => {
    set({
      filters: {
        category: "",
        subject: "",
        difficulty: "",
        status: "",
        search: "",
        dateRange: null,
      },
    });
  },
}));
