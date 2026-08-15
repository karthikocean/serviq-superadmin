import api from './api';

export const getAllPlansApi = async (page = 1, limit = 100) => {
  const response = await api.get('/plans', { params: { page, limit } });
  return response.data;
};

export const createPlanApi = async (planData) => {
  const response = await api.post('/plans', planData);
  return response.data;
};

export const updatePlanApi = async (id, planData) => {
  const response = await api.put(`/plans/${id}`, planData);
  return response.data;
};

export const deletePlanApi = async (id) => {
  const response = await api.delete(`/plans/${id}`);
  return response.data;
};
