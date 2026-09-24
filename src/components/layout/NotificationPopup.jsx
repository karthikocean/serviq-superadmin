import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  LifeBuoy, 
  CheckCircle2, 
  X,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { 
  getSuperAdminNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../../services/notificationService';

export default function NotificationPopup({ isOpen, onClose, anchorRef }) {
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' | 'tickets'
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ all: 0, alerts: 0, tickets: 0, unread: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch notifications based on active tab
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await getSuperAdminNotifications(activeTab);
      if (res?.success && res?.data) {
        const data = res.data;
        if (data.counts) {
          setCounts({
            all: data.counts.all ?? 0,
            alerts: data.counts.alerts ?? 0,
            tickets: data.counts.tickets ?? 0,
            unread: data.counts.unread ?? (data.unreadCount ?? 0)
          });
        }

        let list = [];
        if (activeTab === 'alerts' && Array.isArray(data.alerts)) {
          list = data.alerts;
        } else if (activeTab === 'tickets' && Array.isArray(data.tickets)) {
          list = data.tickets;
        } else if (Array.isArray(data.notifications)) {
          list = data.notifications;
        } else if (Array.isArray(data)) {
          list = data;
        }

        setItems(list);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to load notifications feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFeed();
    }
  }, [isOpen, activeTab]);

  // Click outside and Esc to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(e.target) && 
        anchorRef?.current && 
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, anchorRef]);

  const handleMarkItemRead = async (item) => {
    const id = item._id || item.id;
    if (!item.isRead && id) {
      try {
        await markNotificationAsRead(id);
      } catch (e) {
        console.error('Failed to mark notification as read:', e);
      }
      // Optimistically update
      setItems(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true } : n));
      setCounts(prev => ({
        ...prev,
        unread: Math.max(0, (prev.unread || 0) - 1)
      }));
      window.dispatchEvent(new Event('serviq_notifications_updated'));
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = items.filter(n => !n.isRead).map(n => n._id || n.id);
    try {
      await markAllNotificationsAsRead(unreadIds);
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
    }
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
    setCounts(prev => ({ ...prev, unread: 0 }));
    window.dispatchEvent(new Event('serviq_notifications_updated'));
  };

  const handleItemClick = async (item) => {
    await handleMarkItemRead(item);
    onClose();

    const isTicket = item.source === 'TICKET' || item.type === 'Tickets' || item.category === 'Tickets' || Boolean(item.ticketNumber);
    if (isTicket) {
      navigate(ROUTES.SUPER_ADMIN.TICKETS);
    } else {
      navigate(ROUTES.SUPER_ADMIN.NOTIFICATIONS);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  if (!isOpen) return null;

  const unreadCount = counts.unread ?? items.filter(n => !n.isRead).length;

  return (
    <div
      ref={popupRef}
      className="animate-fade-in"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '390px',
        maxWidth: 'calc(100vw - 24px)',
        background: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '12px',
        boxShadow: '0 14px 35px rgba(0, 0, 0, 0.14)',
        zIndex: 10000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'inherit'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-app, #f8fafc)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell style={{ width: '16px', height: '16px', color: 'var(--text-main, #0f172a)' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-main, #0f172a)', lineHeight: 1.2 }}>
              Notifications
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
              {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.74rem',
                fontWeight: '600',
                color: '#2563eb',
                padding: '3px 6px',
                borderRadius: '4px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <CheckCheck style={{ width: '13px', height: '13px' }} /> Mark read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #64748b)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px'
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        background: 'var(--bg-card, #ffffff)'
      }}>
        {[
          { key: 'alerts', label: 'Alerts', count: counts.alerts ?? 0 },
          { key: 'tickets', label: 'Tickets', count: counts.tickets ?? 0 }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 4px',
                fontSize: '0.78rem',
                fontWeight: isActive ? '700' : '500',
                border: 'none',
                borderBottom: isActive ? '2px solid #0f172a' : '2px solid transparent',
                background: 'transparent',
                color: isActive ? '#0f172a' : 'var(--text-muted, #64748b)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* List Items */}
      <div 
        className="invisible-scrollbar"
        style={{
          maxHeight: '360px',
          ovemmmmmmmmmmmmmmmmmmrflowY: 'auto',
          background: 'var(--bg-card, #ffffff)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {loading ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '0.8rem' }}>
            Loading updates...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
            <CheckCircle2 style={{ width: '26px', height: '26px', margin: '0 auto 8px', color: '#10b981' }} />
            <p style={{ margin: 0, fontSize: '0.84rem', fontWeight: '600', color: 'var(--text-main, #0f172a)' }}>
              No {activeTab === 'alerts' ? 'alert' : 'ticket'} notifications found
            </p>
          </div>
        ) : (
          items.map((item) => {
            const isTicket = item.source === 'TICKET' || item.type === 'Tickets' || item.category === 'Tickets' || Boolean(item.ticketNumber);
            const isRead = Boolean(item.isRead);

            // Clean title & ticket number split if title starts with ticket number
            let ticketNo = item.ticketNumber || '';
            let titleText = item.title || item.subject || '';

            if (isTicket && !ticketNo && titleText.startsWith('TKT-')) {
              const parts = titleText.split(' ');
              ticketNo = parts[0];
              titleText = parts.slice(1).join(' ');
            } else if (ticketNo && titleText.startsWith(ticketNo)) {
              titleText = titleText.replace(ticketNo, '').trim();
            }

            return (
              <div
                key={item._id || item.id || `item-${Math.random()}`}
                onClick={() => handleItemClick(item)}
                style={{
                  padding: '11px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-color, #f1f5f9)',
                  background: isRead ? 'transparent' : 'rgba(37, 99, 235, 0.03)',
                  transition: 'background 0.12s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover, #f8fafc)'}
                onMouseLeave={(e) => e.currentTarget.style.background = isRead ? 'transparent' : 'rgba(37, 99, 235, 0.03)'}
              >
                {/* Icon */}
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '7px',
                  background: isTicket ? 'rgba(79, 70, 229, 0.08)' : 'rgba(2, 132, 199, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isTicket ? '#4f46e5' : '#0284c7',
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  {isTicket ? (
                    <LifeBuoy style={{ width: '15px', height: '15px' }} />
                  ) : (
                    <Bell style={{ width: '15px', height: '15px' }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      {isTicket && ticketNo && (
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          color: '#4f46e5',
                          flexShrink: 0
                        }}>
                          {ticketNo}
                        </span>
                      )}
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: isRead ? '500' : '700',
                        color: 'var(--text-main, #0f172a)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {titleText || 'Notification'}
                      </span>
                    </div>

                    {!isRead && (
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#2563eb',
                        flexShrink: 0
                      }} />
                    )}
                  </div>

                  {(item.message || item.body) && (
                    <p style={{
                      margin: '2px 0 0 0',
                      fontSize: '0.74rem',
                      color: 'var(--text-muted, #64748b)',
                      lineHeight: 1.35,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.message || item.body}
                    </p>
                  )}

                  {/* Clean meta line */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock style={{ width: '11px', height: '11px' }} />
                      {formatTimeAgo(item.createdAt)}
                    </span>

                    {item.restaurantName && (
                      <>
                        <span>•</span>
                        <span style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.restaurantName}
                        </span>
                      </>
                    )}

                    {item.status && (
                      <>
                        <span>•</span>
                        <span style={{
                          fontWeight: '600',
                          color: item.status === 'Open' ? '#2563eb' : item.status === 'Resolved' ? '#10b981' : item.status === 'In Progress' ? '#d97706' : '#64748b'
                        }}>
                          {item.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
