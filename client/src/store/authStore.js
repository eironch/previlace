import { create } from "zustand";
import { authService } from "../services/authService";

let initializationInProgress = false;

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  isInitialized: false,

  initializeAuth: async () => {
    const state = get();
    
    if (state.isInitialized || initializationInProgress) {
      return;
    }

    initializationInProgress = true;
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const authStatus = urlParams.get("auth");
      const userData = urlParams.get("user");
      const error = urlParams.get("error");

      if (authStatus === "success" && userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData));
          localStorage.setItem("user_data", JSON.stringify(user));
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isInitialized: true,
          });
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        } catch (parseError) {
          if (process.env.NODE_ENV === "development") {
            console.error("Authentication data parsing failed:", parseError);
          }
          set({
            error: "Authentication data error. Please try logging in again.",
            isLoading: false,
            isAuthenticated: false,
            user: null,
            isInitialized: true,
          });
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }

      if (error) {
        localStorage.removeItem("user_data");
        set({
          error: "Authentication failed. Please try again.",
          isLoading: false,
          isAuthenticated: false,
          user: null,
          isInitialized: true,
        });
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      const storedUser = authService.getStoredUser();
      
      if (!storedUser) {
        set({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          error: null,
          isInitialized: true,
        });
        return;
      }

      try {
        const verifiedUser = await authService.verifyToken();
        set({
          user: verifiedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitialized: true,
        });
      } catch (verificationError) {
        if (process.env.NODE_ENV === "development") {
          console.error("Token verification failed:", verificationError);
        }
        localStorage.removeItem("user_data");
        set({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          error: null,
          isInitialized: true,
        });
      }
    } finally {
      initializationInProgress = false;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const { user } = await authService.login(credentials);
      localStorage.setItem("user_data", JSON.stringify(user));
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      });

      return { success: true };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Login failed:", error);
      }
      set({
        isLoading: false,
        error: error.message,
        isAuthenticated: false,
        user: null,
      });

      return { success: false, error: error.message };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });

    try {
      const { user } = await authService.register(userData);
      localStorage.setItem("user_data", JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      });

      window.location.href = "/onboarding";
      return { success: true };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Registration failed:", error);
      }
      set({
        isLoading: false,
        error: error.message,
        isAuthenticated: false,
        user: null,
      });

      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    initializationInProgress = false;

    try {
      await authService.logout();
    } catch (logoutError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Logout failed:", logoutError);
      }
    } finally {
      localStorage.removeItem("user_data");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: false,
      });

      window.location.href = "/";
    }
  },

  verifySession: async () => {
    const currentUser = get().user;
    if (!currentUser) return { success: false };

    try {
      const user = await authService.verifyToken();
      set({ user, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Session verification failed:", error);
      }
      localStorage.removeItem("user_data");
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
      return { success: false, error: error.message };
    }
  },

  forgotPassword: async (email) => {
    try {
      const result = await authService.forgotPassword(email);
      return { success: true, data: result };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Forgot password failed:", error);
      }
      return { success: false, error: error.message };
    }
  },

  resetPassword: async (token, password) => {
    try {
      const result = await authService.resetPassword(token, password);
      return { success: true, data: result };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Reset password failed:", error);
      }
      return { success: false, error: error.message };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { user } = await authService.updateProfile(profileData);
      set({ user });

      if (user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }

      return { success: true, user };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Profile update failed:", error);
      }
      return { success: false, error: error.message };
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const result = await authService.updatePassword(passwordData);
      return { success: true, data: result };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Password update failed:", error);
      }
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),

  handleGoogleAuth: () => {
    authService.openGoogleAuth();
  },
}));