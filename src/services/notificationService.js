import api from "./api";

/**
 * 1. Fetch Super Admin notification activity feed for header dropdown & popup.
 * Endpoint: GET /api/super-admin/notifications?type={all|alerts|tickets|unread}
 */
export const getSuperAdminNotifications = async (type = "all") => {
  const params = typeof type === "object" ? type : { type };
  const response = await api.get("/notifications", { params });
  return response.data;
};

/**
 * 2. Fetch notifications for the System / Notifications Management.
 * Endpoint: GET /api/super-admin/notifications/system
 */
export const getSystemNotifications = async (params = {}) => {
  const cleanParams = {};
  if (params && typeof params === 'object') {
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.limit !== undefined) cleanParams.limit = params.limit;
    if (params.type && params.type !== 'All' && params.type !== 'all') cleanParams.type = params.type;
    if (params.status && params.status !== 'All' && params.status !== 'all') cleanParams.status = params.status;
  }

  try {
    const response = await api.get("/notifications/system", { params: cleanParams });
    return response.data;
  } catch (err) {
    const response = await api.get("/notifications", { params: cleanParams });
    return response.data;
  }
};

/**
 * 3. Fetch specific system notification by ID.
 * Endpoint: GET /api/super-admin/notifications/system/:id
 */
export const getSystemNotificationById = async (id) => {
  const response = await api.get(`/notifications/system/${id}`);
  return response.data;
};

/**
 * 4. Fetch detailed notification by ID.
 * Endpoint: GET /api/super-admin/notifications/details/:id
 */
export const getNotificationDetails = async (id) => {
  try {
    const response = await api.get(`/notifications/details/${id}`);
    return response.data;
  } catch (err) {
    // Fallback to system/:id if details/:id fails
    return await getSystemNotificationById(id);
  }
};

/**
 * General getter - handles both feed and system notifications.
 */
export const getNotifications = async (params) => {
  if (params && typeof params === "object" && typeof params.type === "string" && !params.page && !params.limit) {
    return getSuperAdminNotifications(params.type);
  }
  return getSystemNotifications(params);
};

/**
 * 5. Create a new system notification (broadcast, draft, or schedule).
 * Endpoint: POST /api/super-admin/notifications
 * Body includes deliveryOption: "draft" | "schedule" | "broadcast"
 */
export const createNotification = async (data) => {
  const response = await api.post("/notifications", data);
  return response.data;
};

/**
 * 6. Update an existing system notification / editing a draft.
 * Endpoint: PUT /api/super-admin/notifications/:id
 */
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

/**
 * 7. Cancel a scheduled notification.
 * Endpoint: POST /api/super-admin/notifications/:id/cancel
 */
export const cancelNotification = async (id) => {
  const response = await api.post(`/notifications/${id}/cancel`);
  return response.data;
};

/**
 * 8. Send a draft notification immediately.
 * Endpoint: POST /api/super-admin/notifications/:id/send
 */
export const sendDraftNotification = async (id) => {
  const response = await api.post(`/notifications/${id}/send`);
  return response.data;
};

/**
 * 9. Permanently delete a notification.
 * Endpoint: DELETE /api/super-admin/notifications/:id
 */
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

/**
 * 10. Mark all unread Super Admin notifications as read.
 * Endpoints:
 * - PUT /api/super-admin/notifications/read-all
 * - PUT /api/super-admin/notifications/mark-all-read
 */
export const markAllNotificationsAsRead = async (unreadIds = []) => {
  const endpoints = [
    { method: "put", url: "/notifications/read-all" },
    { method: "put", url: "/notifications/mark-all-read" },
    { method: "patch", url: "/notifications/read-all" },
    { method: "post", url: "/notifications/read-all" }
  ];

  for (const ep of endpoints) {
    try {
      const response = await api[ep.method](ep.url);
      if (response && response.data) return response.data;
    } catch (e) {
      // try next endpoint
    }
  }

  // Fallback: mark individual unread items in parallel
  if (Array.isArray(unreadIds) && unreadIds.length > 0) {
    await Promise.allSettled(unreadIds.map((id) => markNotificationAsRead(id)));
  }
  return { success: true };
};

export const markAllNotificationsReadAlt = async () => {
  const response = await api.put("/notifications/mark-all-read");
  return response.data;
};

/**
 * 11. Mark a specific single notification as read.
 * Endpoint: PUT /api/super-admin/notifications/:id/read
 */
export const markNotificationAsRead = async (id) => {
  const methods = ["put", "patch", "post"];
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


