const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const apiCall = async (endpoint, options = {}) => {
	try {
		const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || "An error occurred");
		}

		return data;
	} catch (error) {
		throw new Error(error.message || "Network error");
	}
};

export const authService = {
	async login(credentials) {
		try {
			const data = await apiCall("/auth/login", {
				method: "POST",
				body: JSON.stringify(credentials),
			});
			
			if (data?.data?.user) {
				localStorage.setItem('user_data', JSON.stringify(data.data.user));
				return { user: data.data.user };
			}
			
			throw new Error('Invalid response format');
		} catch (error) {
			throw new Error(error.message || 'Login failed');
		}
	},

	async register(userData) {
		try {
			const data = await apiCall("/auth/register", {
				method: "POST",
				body: JSON.stringify(userData),
			});
			
			if (data?.data?.user) {
				localStorage.setItem('user_data', JSON.stringify(data.data.user));
				return { user: data.data.user };
			}
			
			throw new Error('Invalid response format');
		} catch (error) {
			throw new Error(error.message || 'Registration failed');
		}
	},

	async logout() {
		try {
			await apiCall("/auth/logout", {
				method: "POST",
			});
		} catch (error) {
		} finally {
			localStorage.removeItem('user_data');
		}
	},

	async forgotPassword(email) {
		try {
			const data = await apiCall("/auth/forgot-password", {
				method: "POST",
				body: JSON.stringify({ email }),
			});
			return data;
		} catch (error) {
			throw error;
		}
	},

	async resetPassword(token, password) {
		try {
			const data = await apiCall("/auth/reset-password", {
				method: "POST",
				body: JSON.stringify({ token, password }),
			});
			return data;
		} catch (error) {
			throw error;
		}
	},

	async updateProfile(profileData) {
		try {
			const data = await apiCall("/users/profile", {
				method: "PATCH",
				body: JSON.stringify(profileData),
			});
			
			if (data?.data?.user) {
				localStorage.setItem('user_data', JSON.stringify(data.data.user));
				return { user: data.data.user };
			}
			
			return data;
		} catch (error) {
			throw error;
		}
	},

	async updatePassword(passwordData) {
		try {
			const data = await apiCall("/auth/update-password", {
				method: "POST",
				body: JSON.stringify(passwordData),
			});
			return data;
		} catch (error) {
			throw error;
		}
	},

	async verifyToken() {
		try {
			const data = await apiCall("/auth/me");
			return data.data.user;
		} catch (error) {
			localStorage.removeItem('user_data');
			throw new Error('Token verification failed');
		}
	},

	getStoredUser() {
		const userData = localStorage.getItem('user_data');
		return userData ? JSON.parse(userData) : null;
	},

	openGoogleAuth() {
		window.location.href = `${API_BASE_URL}/api/auth/google`;
	}
};
