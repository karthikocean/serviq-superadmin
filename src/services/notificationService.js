import api from "./api";

export const getNotifications = async (params) => {
  const response = await api.get("/notifications", { params });
  return response.data;
};

export const createNotification = async (data) => {
  const response = await api.post("/notifications", data);
  return response.data;
};

export const cancelNotification = async (id) => {
  const response = await api.post(`/notifications/${id}/cancel`);
  return response.data;
};

export const sendDraftNotification = async (id) => {
  const response = await api.post(`/notifications/${id}/send`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};
