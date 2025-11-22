import api from './apiClient';

export const getStudyPlans = async (status) => {
  const response = await api.get('/study-plans', { params: { status } });
  return response.data;
};

export const getStudyPlan = async (id) => {
  const response = await api.get(`/study-plans/${id}`);
  return response.data;
};

export const getActiveStudyPlan = async () => {
  const response = await api.get('/study-plans/active');
  return response.data;
};

export const createStudyPlan = async (data) => {
  const response = await api.post('/study-plans', data);
  return response.data;
};

export const updateStudyPlan = async (id, data) => {
  const response = await api.put(`/study-plans/${id}`, data);
  return response.data;
};

export const publishStudyPlan = async (id) => {
  const response = await api.post(`/study-plans/${id}/publish`);
  return response.data;
};

export const activateStudyPlan = async (id) => {
  const response = await api.post(`/study-plans/${id}/activate`);
  return response.data;
};

export const enrollStudent = async (id, studentId) => {
  const response = await api.post(`/study-plans/${id}/enroll`, { studentId });
  return response.data;
};

export default {
  getStudyPlans,
  getStudyPlan,
  getActiveStudyPlan,
  createStudyPlan,
  updateStudyPlan,
  publishStudyPlan,
  activateStudyPlan,
  enrollStudent,
};
