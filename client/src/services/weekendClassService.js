import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const weekendClassService = {
  getUpcomingClass: async () => {
    const response = await axios.get(`${API_URL}/api/weekend-classes/upcoming`, {
      withCredentials: true,
    });
    return response.data;
  },

  getAllClasses: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/api/weekend-classes`, {
      params: filters,
      withCredentials: true,
    });
    return response.data.data;
  },

  createClass: async (classData) => {
    const response = await axios.post(`${API_URL}/api/weekend-classes`, classData, {
      withCredentials: true,
    });
    return response.data.data;
  },

  updateClass: async (id, updates) => {
    const response = await axios.patch(`${API_URL}/api/weekend-classes/${id}`, updates, {
      withCredentials: true,
    });
    return response.data.data;
  },

  deleteClass: async (id) => {
    const response = await axios.delete(`${API_URL}/api/weekend-classes/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },

  createOrUpdateClass: async (classData) => {
      return weekendClassService.createClass(classData);
  }
};

export default weekendClassService;
