import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set, get) => ({
	user: null,
	isLoading: false,
	isAuthenticated: false,
	error: null,

	initializeAuth: () => {
		const urlParams = new URLSearchParams(window.location.search);
		const authStatus = urlParams.get('auth');
		const userData = urlParams.get('user');
		const error = urlParams.get('error');

		if (authStatus === 'success' && userData) {
			try {
				const user = JSON.parse(decodeURIComponent(userData));
				localStorage.setItem('user_data', JSON.stringify(user));
				set({
					user,
					isAuthenticated: true,
					isLoading: false,
					error: null
				});
				window.history.replaceState({}, document.title, window.location.pathname);
				return;
			} catch (err) {
				set({
					error: 'Authentication data error. Please try logging in again.',
					isLoading: false
				});
				window.history.replaceState({}, document.title, window.location.pathname);
				return;
			}
		}

		if (error) {
			set({
				error: 'Authentication failed. Please try again.',
				isLoading: false
			});
			window.history.replaceState({}, document.title, window.location.pathname);
			return;
		}

		const user = authService.getStoredUser();
		
		if (user) {
			set({
				user,
				isAuthenticated: true
			});
			
			authService.verifyToken().catch(() => {
				get().logout();
			});
		} else {
			set({ isLoading: false });
		}
	},

	login: async (credentials) => {
		set({ isLoading: true, error: null });
		
		try {
			const { user } = await authService.login(credentials);
			
			set({
				user,
				isAuthenticated: true,
				isLoading: false,
				error: null
			});
			
			return { success: true };
		} catch (error) {
			set({
				isLoading: false,
				error: error.message,
				isAuthenticated: false,
				user: null
			});
			
			return { success: false, error: error.message };
		}
	},

	register: async (userData) => {
		set({ isLoading: true, error: null });
		
		try {
			const { user } = await authService.register(userData);
			
			set({
				user,
				isAuthenticated: true,
				isLoading: false,
				error: null
			});
			
			return { success: true };
		} catch (error) {
			set({
				isLoading: false,
				error: error.message,
				isAuthenticated: false,
				user: null
			});
			
			return { success: false, error: error.message };
		}
	},

	logout: async () => {
		set({ isLoading: true });
		
		try {
			await authService.logout();
		} finally {
			set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error: null
			});
		}
	},

	forgotPassword: async (email) => {
		try {
			const result = await authService.forgotPassword(email);
			return { success: true, data: result };
		} catch (error) {
			return { success: false, error: error.message };
		}
	},

	resetPassword: async (token, password) => {
		try {
			const result = await authService.resetPassword(token, password);
			return { success: true, data: result };
		} catch (error) {
			return { success: false, error: error.message };
		}
	},

	updateProfile: async (profileData) => {
		try {
			const { user } = await authService.updateProfile(profileData);
			set({ user });
			return { success: true, user };
		} catch (error) {
			return { success: false, error: error.message };
		}
	},

	updatePassword: async (passwordData) => {
		try {
			const result = await authService.updatePassword(passwordData);
			return { success: true, data: result };
		} catch (error) {
			return { success: false, error: error.message };
		}
	},

	clearError: () => set({ error: null }),

	handleGoogleAuth: () => {
		authService.openGoogleAuth();
	}
}));
