import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
	currentPage: 'home',
	currentAuthForm: 'login',
	showAuthModal: false,
	sidebarOpen: false,
	ticketForm: {
		show: false,
		subjectId: null,
		subjectName: null,
	},
	
	setCurrentPage: (page) => set({ currentPage: page }),
	setCurrentAuthForm: (form) => set({ currentAuthForm: form }),
	setShowAuthModal: (show) => set({ showAuthModal: show }),
	setSidebarOpen: (open) => set({ sidebarOpen: open }),
	
	openAuthModal: (form = 'login') => set({ 
		showAuthModal: true, 
		currentAuthForm: form 
	}),
	
	closeAuthModal: () => set({ 
		showAuthModal: false, 
		currentAuthForm: 'login' 
	}),
	
	toggleSidebar: () => set((state) => ({ 
		sidebarOpen: !state.sidebarOpen 
	})),
	
	setShowTicketForm: (data) => set({ ticketForm: data }),
}));

export default useAppStore;
