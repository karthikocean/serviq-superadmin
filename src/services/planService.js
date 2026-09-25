import api from './api';

export const getAllPlansApi = async (page = 0, limit = 100) => {
  const response = await api.get('/plans', { params: { page, limit } });
  return response.data;
};

export const createPlanApi = async (planData) => {
  const response = await api.post('/plans', planData);
  return response.data;
};

export const updatePlanApi = async (id, planData) => {
  const methods = ['put', 'patch', 'post'];
  let lastErr = null;
  for (const method of methods) {
    try {
      const response = await api[method](`/plans/${id}`, planData);
      if (response && response.data) return response.data;
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) throw lastErr;
};

export const deletePlanApi = async (id) => {
  const response = await api.delete(`/plans/${id}`);
  return response.data;
};
