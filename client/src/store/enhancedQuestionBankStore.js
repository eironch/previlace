import { create } from "zustand";
import { questionBankService } from "../services/questionBankService";

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

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  fetchTemplates: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await questionBankService.getTemplates({
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
      const response = await questionBankService.getTemplateById(templateId);
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
      const result = await questionBankService.validateField(
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

    const previewContent = questionBankService.renderPreview(
      template,
      fieldValues
    );
    set({ previewContent });
  },

  saveQuestion: async () => {
    set({ isSaving: true, error: null });
    const { currentTemplate, fieldValues } = get();

    try {
      const response = await questionBankService.createQuestion({
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
      const response = await questionBankService.createBulkQuestions({
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

  fetchQuestions: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await questionBankService.getQuestions({
        ...get().filters,
        ...filters,
      });
      set({
        questions: response.questions,
        isLoading: false,
      });
      return { success: true, data: response.questions };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  submitForReview: async (questionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await questionBankService.submitForReview(questionId);
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
      const response = await questionBankService.approveQuestion(
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
      const response = await questionBankService.rejectQuestion(
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
      const response = await questionBankService.getReviewQueue();
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
      const response = await questionBankService.getVersionHistory(questionId);
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
      const response = await questionBankService.restoreVersion(
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
      const response = await questionBankService.addCollaborator(
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
