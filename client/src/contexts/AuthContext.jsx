import { createContext, useContext, useReducer, useEffect } from "react";

const AuthContext = createContext();

const authReducer = (state, action) => {
	switch (action.type) {
		case "AUTH_START":
			return {
				...state,
				isLoading: true,
				error: null,
			};
		case "AUTH_SUCCESS":
			return {
				...state,
				isLoading: false,
				isAuthenticated: true,
				user: action.payload.user,
				error: null,
			};
		case "AUTH_ERROR":
			return {
				...state,
				isLoading: false,
				isAuthenticated: false,
				user: null,
				error: action.payload.error,
			};
		case "LOGOUT":
			return {
				...state,
				isLoading: false,
				isAuthenticated: false,
				user: null,
				error: null,
			};
		case "CLEAR_ERROR":
			return {
				...state,
				error: null,
			};
		case "UPDATE_USER":
			return {
				...state,
				user: { ...state.user, ...action.payload },
			};
		default:
			return state;
	}
};

const initialState = {
	isLoading: true,
	isAuthenticated: false,
	user: null,
	error: null,
};

export const AuthProvider = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, initialState);

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

	const register = async (userData) => {
		try {
			dispatch({ type: "AUTH_START" });

			const data = await apiCall("/auth/register", {
				method: "POST",
				body: JSON.stringify(userData),
			});

			dispatch({
				type: "AUTH_SUCCESS",
				payload: { user: data.data.user },
			});

			return data;
		} catch (error) {
			dispatch({
				type: "AUTH_ERROR",
				payload: { error: error.message },
			});
			throw error;
		}
	};

	const login = async (credentials) => {
		try {
			dispatch({ type: "AUTH_START" });

			const data = await apiCall("/auth/login", {
				method: "POST",
				body: JSON.stringify(credentials),
			});

			dispatch({
				type: "AUTH_SUCCESS",
				payload: { user: data.data.user },
			});

			return data;
		} catch (error) {
			dispatch({
				type: "AUTH_ERROR",
				payload: { error: error.message },
			});
			throw error;
		}
	};

	const logout = async () => {
		try {
			await apiCall("/auth/logout", {
				method: "POST",
			});
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			dispatch({ type: "LOGOUT" });
		}
	};

	const forgotPassword = async (email) => {
		try {
			const data = await apiCall("/auth/forgot-password", {
				method: "POST",
				body: JSON.stringify({ email }),
			});

			return data;
		} catch (error) {
			throw error;
		}
	};

	const resetPassword = async (token, password) => {
		try {
			const data = await apiCall("/auth/reset-password", {
				method: "POST",
				body: JSON.stringify({ token, password }),
			});

			return data;
		} catch (error) {
			throw error;
		}
	};

	const updateProfile = async (profileData) => {
		try {
			const data = await apiCall("/users/profile", {
				method: "PATCH",
				body: JSON.stringify(profileData),
			});

			dispatch({
				type: "UPDATE_USER",
				payload: data.data.user,
			});

			return data;
		} catch (error) {
			throw error;
		}
	};

	const updatePassword = async (passwordData) => {
		try {
			const data = await apiCall("/auth/update-password", {
				method: "POST",
				body: JSON.stringify(passwordData),
			});

			return data;
		} catch (error) {
			throw error;
		}
	};

	const checkAuth = async () => {
		try {
			dispatch({ type: "AUTH_START" });

			const data = await apiCall("/auth/me");

			dispatch({
				type: "AUTH_SUCCESS",
				payload: { user: data.data.user },
			});
		} catch (error) {
			dispatch({ type: "LOGOUT" });
		}
	};

	const clearError = () => {
		dispatch({ type: "CLEAR_ERROR" });
	};

	const openGoogleAuth = () => {
		return new Promise((resolve, reject) => {
			dispatch({ type: "AUTH_START" });

			const popupWidth = 500;
			const popupHeight = 600;
			const left = window.screen.width / 2 - popupWidth / 2;
			const top = window.screen.height / 2 - popupHeight / 2;

			const popup = window.open(
				`${API_BASE_URL}/api/auth/google`,
				"google-auth",
				`width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
			);

			if (!popup) {
				dispatch({
					type: "AUTH_ERROR",
					payload: { error: "Popup blocked. Please allow popups for this site." }
				});
				reject(new Error("Popup blocked"));
				return;
			}

			let authCompleted = false;
			let popupClosed = false;

			const handleMessage = (event) => {
				const allowedOrigins = [
					window.location.origin,
					new URL(API_BASE_URL).origin
				];

				if (!allowedOrigins.includes(event.origin)) {
					return;
				}

				if (event.data && event.data.type === "GOOGLE_AUTH_SUCCESS") {
					authCompleted = true;
					clearInterval(checkClosed);
					window.removeEventListener("message", handleMessage);
					
					try {
						if (!popup.closed) {
							popup.close();
						}
					} catch (e) {
						// Popup already closed or can't be accessed
					}

					dispatch({
						type: "AUTH_SUCCESS",
						payload: { user: event.data.user },
					});
					resolve(event.data.user);
				} else if (event.data && event.data.type === "GOOGLE_AUTH_ERROR") {
					authCompleted = true;
					clearInterval(checkClosed);
					window.removeEventListener("message", handleMessage);
					
					try {
						if (!popup.closed) {
							popup.close();
						}
					} catch (e) {
						// Popup already closed or can't be accessed
					}

					dispatch({
						type: "AUTH_ERROR",
						payload: { error: event.data.error || "Authentication failed" }
					});
					reject(new Error(event.data.error || "Authentication failed"));
				}
			};

			const checkClosed = setInterval(() => {
				try {
					if (popup.closed) {
						popupClosed = true;
						clearInterval(checkClosed);
						window.removeEventListener("message", handleMessage);
						
						if (!authCompleted) {
							dispatch({
								type: "AUTH_ERROR",
								payload: { error: "Authentication was cancelled" }
							});
							reject(new Error("Authentication cancelled"));
						}
					}
				} catch (e) {
					// Can't access popup anymore, assume it's closed
					popupClosed = true;
					clearInterval(checkClosed);
					window.removeEventListener("message", handleMessage);
					
					if (!authCompleted) {
						dispatch({
							type: "AUTH_ERROR",
							payload: { error: "Authentication was cancelled" }
						});
						reject(new Error("Authentication cancelled"));
					}
				}
			}, 1000);

			window.addEventListener("message", handleMessage);

			// Timeout after 5 minutes
			setTimeout(() => {
				if (!authCompleted && !popupClosed) {
					clearInterval(checkClosed);
					window.removeEventListener("message", handleMessage);
					try {
						if (!popup.closed) {
							popup.close();
						}
					} catch (e) {
						// Popup already closed or can't be accessed
					}
					dispatch({
						type: "AUTH_ERROR",
						payload: { error: "Authentication timeout. Please try again." }
					});
					reject(new Error("Authentication timeout"));
				}
			}, 300000); // 5 minutes
		});
	};

	useEffect(() => {
		checkAuth();
	}, []);

	const value = {
		...state,
		register,
		login,
		logout,
		forgotPassword,
		resetPassword,
		updateProfile,
		updatePassword,
		openGoogleAuth,
		checkAuth,
		clearError,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export default AuthContext;
