import api from './apiClient';

export const getUpcomingClass = async () => {
  const response = await api.get('/weekend-classes/upcoming');
  return response.data;
};

export const createOrUpdateClass = async (classData) => {
  const response = await api.post('/weekend-classes', classData);
  return response.data;
};

export default {
  getUpcomingClass,
  createOrUpdateClass,
};
