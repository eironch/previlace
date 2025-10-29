import apiClient from "./apiClient";

let verificationPromise = null;
let lastVerificationTime = 0;
const VERIFICATION_CACHE_DURATION = 5 * 60 * 1000;

class AuthService {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  setTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
  }

  clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  }

  async refreshTokens() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

      this.setTokens(newAccessToken, newRefreshToken);
      this.processQueue(null, newAccessToken);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      this.processQueue(error, null);
      this.clearTokens();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  async login(credentials) {
    const response = await apiClient.post("/auth/login", credentials);
    const { data } = response.data;

    if (data?.user && data?.accessToken && data?.refreshToken) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
      this.setTokens(data.accessToken, data.refreshToken);
      return { user: data.user };
    }

    throw new Error("Invalid response format");
  }

  async register(userData) {
    const response = await apiClient.post("/auth/register", userData);
    const { data } = response.data;

    if (data?.user && data?.accessToken && data?.refreshToken) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
      this.setTokens(data.accessToken, data.refreshToken);
      return { user: data.user };
    }

    throw new Error("Invalid response format");
  }

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      this.clearTokens();
      verificationPromise = null;
      lastVerificationTime = 0;
    }
  }

  async forgotPassword(email) {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  }

  async resetPassword(token, password) {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await apiClient.patch("/users/profile", profileData);
    const { data } = response.data;

    if (data?.user) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
      return { user: data.user };
    }

    return response.data;
  }

  async updatePassword(passwordData) {
    const response = await apiClient.post("/auth/update-password", passwordData);
    return response.data;
  }

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
        this.clearTokens();
        verificationPromise = null;
        lastVerificationTime = 0;
        throw new Error("Token verification failed");
      }
    })();

    return verificationPromise;
  }

  getStoredUser() {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  }

  openGoogleAuth() {
    let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    
    if (baseUrl.endsWith("/api")) {
      baseUrl = baseUrl.slice(0, -4);
    }
    
    window.location.href = `${baseUrl}/api/auth/google`;
  }
}

export const authService = new AuthService();
