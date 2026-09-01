import apiClient, { BASE_URL, IMAGE_BASE_URL, server } from "../config/index.js";

const api = apiClient;

export { BASE_URL, IMAGE_BASE_URL, server, apiClient };

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/upload", formData, {
    baseURL: `${server}/api`,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getRestaurants = async (page = 0, limit = 10) => {
  const response = await api.get(`/restaurants?page=${page}&limit=${limit}`);
  return response.data;
};

export const createRestaurant = async (data) => {
  const response = await api.post("/restaurants", data);
  return response.data;
};

export const updateRestaurant = async (id, data) => {
  const response = await api.put(`/restaurants/${id}`, data);
  return response.data;
};

export const updateRestaurantStatus = async (id, status) => {
  const response = await api.put(`/restaurants/${id}/status`, { status });
  return response.data;
};

export const deleteRestaurant = async (id) => {
  const response = await api.delete(`/restaurants/${id}`);
  return response.data;
};

export const getPlans = async () => {
  const response = await api.get("/plans");
  return response.data;
};

export const assignSubscriptionAPI = async (data) => {
  const response = await api.post("/subscriptions", data);
  return response.data;
};

export const changePlanAPI = async (data) => {
  const response = await api.post("/subscriptions/change-plan", data);
  return response.data;
};

export const renewSubscriptionAPI = async (data) => {
  const response = await api.post(`/subscriptions/${data.subscriptionId}/renew`, data);
  return response.data;
};

export const manageAddonsAPI = async (data) => {
  const response = await api.post("/subscriptions/purchase-addon", data);
  return response.data;
};

export const getSubscriptionHistoryAPI = async (page = 0, limit = 10) => {
  const response = await api.get(`/subscriptions/history?page=${page}&limit=${limit}`);
  return response.data;
};

export const getAllSubscriptionsAPI = async (page = 0, limit = 100) => {
  const response = await api.get(`/subscriptions?page=${page}&limit=${limit}`);
  return response.data;
};

export const getAddonsAPI = async () => {
  const response = await api.get('/subscriptions/addons/all');
  return response.data;
};

export const createAddonAPI = async (data) => {
  const response = await api.post('/subscriptions/addons', data);
  return response.data;
};

export const updateAddonAPI = async (id, data) => {
  const response = await api.put(`/subscriptions/addons/${id}`, data);
  return response.data;
};

export const deleteAddonAPI = async (id) => {
  const response = await api.delete(`/subscriptions/addons/${id}`);
  return response.data;
};

export const prorateChangePlanAPI = async (data) => {
  const response = await api.post(`/subscriptions/prorate-change-plan`, data);
  return response.data;
};

export const cancelSubscriptionAPI = async (id) => {
  const response = await api.post(`/subscriptions/${id}/cancel`);
  return response.data;
};

export const getRoles = async (page = 0, limit = 100) => {
  const response = await api.get(`/roles?page=${page}&limit=${limit}`);
  return response.data;
};

export const createRoleAPI = async (data) => {
  const response = await api.post('/roles', data);
  return response.data;
};

export const updateRoleAPI = async (id, data) => {
  const response = await api.put(`/roles/${id}`, data);
  return response.data;
};

export const deleteRoleAPI = async (id) => {
  const response = await api.delete(`/roles/${id}`);
  return response.data;
};

export const getModulesAPI = async () => {
  const response = await api.get('/roles/modules');
  return response.data;
};

export const getManagers = async (page = 0, limit = 10) => {
  const response = await api.get(`/managers?page=${page}&limit=${limit}`);
  return response.data;
};

export const createManager = async (data) => {
  const response = await api.post("/managers", data);
  return response.data;
};

export const updateManager = async (id, data) => {
  const response = await api.put(`/managers/${id}`, data);
  return response.data;
};

export const deleteManager = async (id) => {
  const response = await api.delete(`/managers/${id}`);
  return response.data;
};

export { getPaymentsAPI, downloadReceiptAPI } from './billingService';

export default api;
