import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([
    'New Order #847 placed on Table 03',
    'Special Request: allergy notes on Table 01 order',
    'Table 05 order marked ready by Kitchen'
  ]);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const showToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({
      open: true,
      title,
      message,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setConfirmModal(prev => ({ ...prev, open: false }));
      }
    });
  };

  const addNotification = (message) => {
    setNotifications(prev => [message, ...prev]);
  };

  const value = {
    toasts,
    notifications,
    confirmModal,
    setConfirmModal,
    showToast,
    showConfirm,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
