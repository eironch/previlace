import api from './apiClient';

export const getCategoryStatistics = async () => {
  const response = await api.get('/analytics/categories');
  return response.data;
};

export const getWeakAreas = async () => {
  const response = await api.get('/analytics/weak-areas');
  return response.data;
};

export const getExamReadiness = async () => {
  const response = await api.get('/analytics/readiness');
  return response.data;
};

export const getProgressReport = async () => {
  const response = await api.get('/analytics/progress');
  return response.data;
};

export const getPercentileRank = async () => {
  const response = await api.get('/analytics/percentile');
  return response.data;
};

export const getStudentAnalytics = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

export default {
  getCategoryStatistics,
  getWeakAreas,
  getExamReadiness,
  getProgressReport,
  getPercentileRank,
  getStudentAnalytics,
};
