import { useState, useCallback } from 'react';
import {
  getSuperAdminNotifications,
  getSystemNotifications,
  getSystemNotificationById,
  getNotificationDetails,
  createNotification,
  updateNotification,
  cancelNotification,
  sendDraftNotification,
  deleteNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuperAdminFeed = useCallback(async (type = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSuperAdminNotifications(type);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSystemList = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSystemNotifications(params);
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setNotifications(list);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notifications,
    setNotifications,
    loading,
    error,
    fetchSuperAdminFeed,
    fetchSystemList,
    getSystemNotificationById,
    getNotificationDetails,
    createNotification,
    updateNotification,
    cancelNotification,
    sendDraftNotification,
    deleteNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead
  };
}

