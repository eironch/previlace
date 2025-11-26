import { create } from "zustand";
import { authService } from "../services/authService";

let initializationInProgress = false;

export const useAuthStore = create((set, get) => ({
  user: null,
  permissions: [],
  isLoading: false,
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
      const tokenData = urlParams.get("tokens");
      const error = urlParams.get("error");

      if (authStatus === "success" && userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData));

          if (tokenData) {
            const tokens = JSON.parse(decodeURIComponent(tokenData));
            authService.setTokens(tokens.accessToken, tokens.refreshToken);
          }

          localStorage.setItem("user_data", JSON.stringify(user));

          set({
            user,
            permissions: user.permissions || [],
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isInitialized: true,
          });
          window.history.replaceState({}, document.title, window.location.pathname);

          // Redirect based on user role/status after successful Google Auth
          if (user.role === "admin" || user.role === "super_admin") {
            window.location.href = "/admin";
          } else if (!user.isProfileComplete) {
            window.location.href = "/onboarding";
          } else {
            window.location.href = "/dashboard";
          }
          return;
        } catch (parseError) {
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
        authService.clearTokens();
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
          permissions: verifiedUser.permissions || [],
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitialized: true,
        });
      } catch (verificationError) {
        authService.clearTokens();
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

      set({
        user,
        permissions: user.permissions || [],
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      });

      return { success: true, user };
    } catch (error) {
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
      authService.clearTokens();
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

      if (user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }

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
  },

  hasPermission: (permission) => {
    const { permissions } = get();
    return permissions.includes(permission);
  },

  hasAnyPermission: (requiredPermissions) => {
    const { permissions } = get();
    return requiredPermissions.some(perm => permissions.includes(perm));
  },

  hasAllPermissions: (requiredPermissions) => {
    const { permissions } = get();
    return requiredPermissions.every(perm => permissions.includes(perm));
  },

  isStudent: () => {
    const { user } = get();
    return user?.role === "student";
  },

  isAdmin: () => {
    const { user } = get();
    return user?.role === "admin";
  },

  isSuperAdmin: () => {
    const { user } = get();
    return user?.role === "super_admin";
  },

  canManageUsers: () => {
    const { user } = get();
    return user?.role === "admin" || user?.role === "super_admin";
  },

  canAccessAdminPanel: () => {
    const { user } = get();
    return user?.role === "admin" || user?.role === "super_admin";
  },
}));

export default useAuthStore;
