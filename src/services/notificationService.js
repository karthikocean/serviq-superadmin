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

export const updateNotification = async (id, data) => {
  const methods = ["put", "patch", "post"];
  let lastErr = null;
  for (const method of methods) {
    try {
      const response = await api[method](`/notifications/${id}`, data);
      if (response && response.data) return response.data;
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) throw lastErr;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};
