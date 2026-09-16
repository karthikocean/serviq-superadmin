import { useState, useEffect } from 'react';

const mockNotifications = [];

export function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    try {
      const item = sessionStorage.getItem('serviq_notifications');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem('serviq_notifications', JSON.stringify(notifications));
  }, [notifications]);

  return { notifications, setNotifications };
}
