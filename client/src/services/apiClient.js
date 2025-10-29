import { useAuthStore } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.requestCounts = new Map();
    this.resetTime = Date.now() + 60000;
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { requestFn, resolve, reject } = this.queue.shift();
      
      try {
        const result = await this.executeWithRetry(requestFn);
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      await this.delay(100);
    }
    
    this.processing = false;
  }

  async executeWithRetry(requestFn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (error.status === 429 && attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
          await this.delay(delay);
          continue;
        }
        throw error;
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const requestQueue = new RequestQueue();

function getAuthHeaders() {
  const accessToken = localStorage.getItem("access_token");
  
  if (accessToken) {
    return {
      "Authorization": `Bearer ${accessToken}`,
    };
  }
  
  return {};
}

async function apiCall(endpoint, options = {}) {
  const authHeaders = getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 401 && !endpoint.includes("/auth/")) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.data?.accessToken) {
          localStorage.setItem("access_token", refreshData.data.accessToken);
          
          const retryHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${refreshData.data.accessToken}`,
            ...options.headers,
          };

          const retryResponse = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            ...options,
            credentials: "include",
            headers: retryHeaders,
          });

          if (retryResponse.ok) {
            return await retryResponse.json();
          }
        }
      }
    } catch (refreshError) {
      const { logout } = useAuthStore.getState();
      logout();
      throw new Error("Authentication required. Please login again.");
    }
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "An error occurred");
    error.status = response.status;
    
    if (response.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      error.message = "Authentication required. Please login again.";
    }
    
    if (response.status === 429) {
      error.message = "Too many requests. Please wait and try again.";
    }
    
    throw error;
  }

  return data;
}

const apiClient = {
  async get(endpoint, options = {}) {
    const { params, ...restOptions } = options;
    let url = endpoint;

    if (params) {
      const searchParams = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== "")
        )
      ).toString();
      url = `${endpoint}?${searchParams}`;
    }

    return requestQueue.add(async () => {
      const response = await apiCall(url, {
        method: "GET",
        ...restOptions,
      });
      return { data: response };
    });
  },

  async post(endpoint, data = {}, options = {}) {
    return requestQueue.add(async () => {
      const response = await apiCall(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
        ...options,
      });
      return { data: response };
    });
  },

  async patch(endpoint, data = {}, options = {}) {
    return requestQueue.add(async () => {
      const response = await apiCall(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...options,
      });
      return { data: response };
    });
  },

  async put(endpoint, data = {}, options = {}) {
    return requestQueue.add(async () => {
      const response = await apiCall(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
        ...options,
      });
      return { data: response };
    });
  },

  async delete(endpoint, options = {}) {
    return requestQueue.add(async () => {
      const response = await apiCall(endpoint, {
        method: "DELETE",
        ...options,
      });
      return { data: response };
    });
  },
};

export default apiClient;
