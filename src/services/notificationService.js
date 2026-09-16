import api from "./api";

/**
 * Fetch Super Admin notification activity feed for header dropdown & popup.
 * Endpoint: GET /api/super-admin/notifications?type={all|alerts|tickets|unread}
 */
export const getSuperAdminNotifications = async (type = "all") => {
  const response = await api.get("/notifications", { params: { type } });
  return response.data;
};

/**
 * Mark a single notification or ticket as read.
 * Endpoint: /api/super-admin/notifications/:id/read
 */
export const markNotificationAsRead = async (id) => {
  const methods = ["patch", "post", "put"];
  let lastErr = null;
  for (const method of methods) {
    try {
      const response = await api[method](`/notifications/${id}/read`);
      if (response && response.data) return response.data;
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) throw lastErr;
};

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsAsRead = async (unreadIds = []) => {
  const methods = ["patch", "post", "put"];
  for (const method of methods) {
    try {
      const response = await api[method]("/notifications/read-all");
      if (response && response.data) return response.data;
    } catch (e) {
      // try next
    }
  }
  for (const method of methods) {
    try {
      const response = await api[method]("/notifications/read");
      if (response && response.data) return response.data;
    } catch (e) {
      // try next
    }
  }
  // Fallback: mark individual unread items in parallel
  if (Array.isArray(unreadIds) && unreadIds.length > 0) {
    await Promise.allSettled(unreadIds.map((id) => markNotificationAsRead(id)));
  }
  return { success: true };
};

/**
 * Fetch system/broadcast notifications for the Notifications Management table.
 * Endpoint: GET /api/super-admin/notifications/system
 */
export const getSystemNotifications = async (params = {}) => {
  try {
    const response = await api.get("/notifications/system", { params });
    return response.data;
  } catch (err) {
    // Fallback to /notifications if system endpoint fails
    const response = await api.get("/notifications", { params });
    return response.data;
  }
};

/**
 * General getter - handles both feed and system notifications
 */
export const getNotifications = async (params) => {
  if (params && typeof params === "object" && (params.type || typeof params.type === "string")) {
    return getSuperAdminNotifications(params.type);
  }
  return getSystemNotifications(params);
};

export const createNotification = async (data) => {
  try {
    const response = await api.post("/notifications/system", data);
    return response.data;
  } catch (err) {
    const response = await api.post("/notifications", data);
    return response.data;
  }
};

export const cancelNotification = async (id) => {
  const endpoints = [`/notifications/system/${id}/cancel`, `/notifications/${id}/cancel`];
  for (const ep of endpoints) {
    try {
      const response = await api.post(ep);
      if (response && response.data) return response.data;
    } catch (err) {
      // try next
    }
  }
};

export const sendDraftNotification = async (id) => {
  const endpoints = [`/notifications/system/${id}/send`, `/notifications/${id}/send`];
  for (const ep of endpoints) {
    try {
      const response = await api.post(ep);
      if (response && response.data) return response.data;
    } catch (err) {
      // try next
    }
  }
};

export const updateNotification = async (id, data) => {
  const endpoints = [`/notifications/system/${id}`, `/notifications/${id}`];
  const methods = ["put", "patch", "post"];
  let lastErr = null;
  for (const ep of endpoints) {
    for (const method of methods) {
      try {
        const response = await api[method](ep, data);
        if (response && response.data) return response.data;
      } catch (err) {
        lastErr = err;
      }
    }
  }
  if (lastErr) throw lastErr;
};

export const deleteNotification = async (id) => {
  const endpoints = [`/notifications/system/${id}`, `/notifications/${id}`];
  for (const ep of endpoints) {
    try {
      const response = await api.delete(ep);
      if (response && response.data) return response.data;
    } catch (err) {
      // try next
    }
  }
};

