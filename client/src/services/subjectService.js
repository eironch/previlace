import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const subjectService = {
  getAllSubjects: async (examLevel) => {
    const response = await axios.get(`${API_URL}/api/subjects`, {
      params: { examLevel },
      withCredentials: true,
    });
    return response.data.data;
  },

  getSubjectById: async (id) => {
    const response = await axios.get(`${API_URL}/api/subjects/${id}`, {
      withCredentials: true,
    });
    return response.data.data;
  },

  createSubject: async (subjectData) => {
    const response = await axios.post(`${API_URL}/api/subjects`, subjectData, {
      withCredentials: true,
    });
    return response.data.data;
  },

  updateSubject: async (id, updates) => {
    const response = await axios.patch(`${API_URL}/api/subjects/${id}`, updates, {
      withCredentials: true,
    });
    return response.data.data;
  },

  deleteSubject: async (id) => {
    const response = await axios.delete(`${API_URL}/api/subjects/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Topic methods
  getTopicsBySubject: async (subjectId) => {
    const response = await axios.get(`${API_URL}/api/topics/subject/${subjectId}`, {
      withCredentials: true,
    });
    return response.data.data;
  },

  createTopic: async (topicData) => {
    const response = await axios.post(`${API_URL}/api/topics`, topicData, {
      withCredentials: true,
    });
    return response.data.data;
  },

  updateTopic: async (id, updates) => {
    const response = await axios.patch(`${API_URL}/api/topics/${id}`, updates, {
      withCredentials: true,
    });
    return response.data.data;
  },

  deleteTopic: async (id) => {
    const response = await axios.delete(`${API_URL}/api/topics/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },
};

export default subjectService;
