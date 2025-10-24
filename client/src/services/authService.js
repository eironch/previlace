import apiClient from "./apiClient";

let verificationPromise = null;
let lastVerificationTime = 0;
const VERIFICATION_CACHE_DURATION = 5 * 60 * 1000;

export const authService = {
  async login(credentials) {
    const response = await apiClient.post("/auth/login", credentials);
    const { data } = response.data;

    if (data?.user) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
      return { user: data.user };
    }

    throw new Error("Invalid response format");
  },

  async register(userData) {
    const response = await apiClient.post("/auth/register", userData);
    const { data } = response.data;

    if (data?.user) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
      return { user: data.user };
    }

    throw new Error("Invalid response format");
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Logout API error:", error);
      }
    } finally {
      localStorage.removeItem("user_data");
      verificationPromise = null;
      lastVerificationTime = 0;
    }
  },

  async forgotPassword(email) {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  async resetPassword(token, password) {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await apiClient.patch("/users/profile", profileData);
    const { data } = response.data;

    if (data?.user) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
      return { user: data.user };
    }

    return response.data;
  },

  async updatePassword(passwordData) {
    const response = await apiClient.post("/auth/update-password", passwordData);
    return response.data;
  },

  async verifyToken() {
    const now = Date.now();
    const storedUser = this.getStoredUser();

    if (!storedUser) {
      throw new Error("No stored user data");
    }

    if (now - lastVerificationTime < VERIFICATION_CACHE_DURATION && verificationPromise) {
      return verificationPromise;
    }

    if (verificationPromise) {
      return verificationPromise;
    }

    verificationPromise = (async () => {
      try {
        const response = await apiClient.get("/auth/me");
        lastVerificationTime = now;
        return response.data.data.user;
      } catch (error) {
        localStorage.removeItem("user_data");
        verificationPromise = null;
        lastVerificationTime = 0;
        throw new Error("Token verification failed");
      }
    })();

    return verificationPromise;
  },

  getStoredUser() {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  },

  openGoogleAuth() {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  },
};