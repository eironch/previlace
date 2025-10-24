import { create } from "zustand";
import { questionTemplateService } from "../services/questionTemplateService";

export const useQuestionTemplateStore = create((set, get) => ({
	templates: [],
	categories: [],
	popularTemplates: [],
	selectedTemplate: null,
	isLoading: false,
	error: null,
	filters: {
		category: "",
		examLevel: "",
		search: "",
	},

	setFilters: (newFilters) => {
		set((state) => ({
			filters: { ...state.filters, ...newFilters }
		}));
	},

	fetchTemplates: async (filters = {}) => {
		set({ isLoading: true, error: null });
		
		try {
			const currentFilters = { ...get().filters, ...filters };
			const data = await questionTemplateService.getTemplates(currentFilters);
			
			set({
				templates: data.templates,
				isLoading: false,
				error: null,
			});
			
			return { success: true };
		} catch (error) {
			set({
				isLoading: false,
				error: error.message,
			});
			
			return { success: false, error: error.message };
		}
	},

	fetchCategories: async () => {
		try {
			const data = await questionTemplateService.getCategories();
			
			set({
				categories: data.categories,
				error: null,
			});
			
			return { success: true };
		} catch (error) {
			set({ error: error.message });
			return { success: false, error: error.message };
		}
	},

	fetchPopularTemplates: async (limit = 5) => {
		try {
			const data = await questionTemplateService.getPopularTemplates(limit);
			
			set({
				popularTemplates: data.templates,
				error: null,
			});
			
			return { success: true };
		} catch (error) {
			set({ error: error.message });
			return { success: false, error: error.message };
		}
	},

	fetchTemplateById: async (id) => {
		set({ isLoading: true, error: null });
		
		try {
			const data = await questionTemplateService.getTemplateById(id);
			
			set({
				selectedTemplate: data.template,
				isLoading: false,
				error: null,
			});
			
			return { success: true, template: data.template };
		} catch (error) {
			set({
				isLoading: false,
				error: error.message,
			});
			
			return { success: false, error: error.message };
		}
	},

	createTemplate: async (templateData) => {
		set({ isLoading: true, error: null });
		
		try {
			const data = await questionTemplateService.createTemplate(templateData);
			
			set((state) => ({
				templates: [data.template, ...state.templates],
				isLoading: false,
				error: null,
			}));
			
			return { success: true, template: data.template };
		} catch (error) {
			set({
				isLoading: false,
				error: error.message,
			});
			
			return { success: false, error: error.message };
		}
	},

	updateTemplate: async (id, templateData) => {
		set({ isLoading: true, error: null });
		
		try {
			const data = await questionTemplateService.updateTemplate(id, templateData);
			
			set((state) => ({
				templates: state.templates.map((template) =>
					template._id === id ? data.template : template
				),
				selectedTemplate: data.template,
				isLoading: false,
				error: null,
			}));
			
			return { success: true, template: data.template };
		} catch (error) {
			set({
				isLoading: false,
				error: error.message,
			});
			
			return { success: false, error: error.message };
		}
	},

	deleteTemplate: async (id) => {
		set({ isLoading: true, error: null });
		
		try {
			await questionTemplateService.deleteTemplate(id);
			
			set((state) => ({
				templates: state.templates.filter((template) => template._id !== id),
				selectedTemplate: state.selectedTemplate?._id === id ? null : state.selectedTemplate,
				isLoading: false,
				error: null,
			}));
			
			return { success: true };
		} catch (error) {
			set({
				isLoading: false,
				error: error.message,
			});
			
			return { success: false, error: error.message };
		}
	},

	selectTemplate: (template) => {
		set({ selectedTemplate: template });
	},

	clearSelectedTemplate: () => {
		set({ selectedTemplate: null });
	},

	clearError: () => {
		set({ error: null });
	},

	resetFilters: () => {
		set({
			filters: {
				category: "",
				examLevel: "",
				search: "",
			}
		});
	},
}));
