import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

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

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showToast = (typeOrMsg, message) => {
    let type = 'info';
    let msg = typeOrMsg;

    if (message !== undefined) {
      type = typeOrMsg;
      msg = message;
    }

    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message: msg }]);
    setTimeout(() => {
      removeToast(id);
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

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: '#ffffff',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          accent: '#10b981',
          iconBg: '#e6f4ea',
          icon: <CheckCircle2 size={18} color="#10b981" />,
          textColor: '#0f172a',
          progressBg: '#10b981'
        };
      case 'error':
        return {
          bg: '#ffffff',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          accent: '#ef4444',
          iconBg: '#fce8e8',
          icon: <XCircle size={18} color="#ef4444" />,
          textColor: '#0f172a',
          progressBg: '#ef4444'
        };
      case 'warning':
        return {
          bg: '#ffffff',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          accent: '#f59e0b',
          iconBg: '#fef3c7',
          icon: <AlertTriangle size={18} color="#f59e0b" />,
          textColor: '#0f172a',
          progressBg: '#f59e0b'
        };
      default:
        return {
          bg: '#ffffff',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          accent: '#3b82f6',
          iconBg: '#e0f2fe',
          icon: <Info size={18} color="#3b82f6" />,
          textColor: '#0f172a',
          progressBg: '#3b82f6'
        };
    }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Visual Floating Toast Container */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes toastSlideIn {
            from {
              opacity: 0;
              transform: translateX(100%) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
          @keyframes toastProgress {
            from { width: 100%; }
            to { width: 0%; }
          }
        `
      }} />
      <div 
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '12px',
          pointerEvents: 'none'
        }}
      >
        {toasts.map(toast => {
          const config = getToastStyle(toast.type);
          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justify: 'space-between',
                gap: '14px',
                padding: '12px 16px',
                backgroundColor: config.bg,
                border: config.border,
                borderLeft: `4px solid ${config.accent}`,
                borderRadius: '10px',
                boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
                color: config.textColor,
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                fontSize: '0.88rem',
                fontWeight: 600,
                width: 'fit-content',
                maxWidth: '380px',
                position: 'relative',
                overflow: 'hidden',
                animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: config.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  flexShrink: 0
                }}>
                  {config.icon}
                </div>
                <span style={{ color: config.textColor, lineHeight: 1.3 }}>{toast.message}</span>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  marginLeft: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  color: '#64748b',
                  borderRadius: '50%',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)'
                  e.currentTarget.style.color = '#0f172a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none'
                  e.currentTarget.style.color = '#64748b'
                }}
                aria-label="Close notification"
              >
                <X size={15} />
              </button>

              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '3px',
                  backgroundColor: config.progressBg,
                  animation: 'toastProgress 4s linear forwards'
                }}
              />
            </div>
          );
        })}
      </div>
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
