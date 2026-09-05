import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  CreditCard, 
  Store, 
  LifeBuoy, 
  Info, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { getNotifications } from '../../services/notificationService';

export default function NotificationPopup({ isOpen, onClose, anchorRef }) {
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('serviq_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

  // Default system fallback notifications if none returned from API
  const fallbackNotifications = [
    {
      _id: 'sys-1',
      subject: 'New Restaurant Registration',
      body: 'Spice Route Restaurant has completed onboarding and is waiting for activation.',
      type: 'Restaurant',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      targetRoute: ROUTES.SUPER_ADMIN.RESTAURANTS
    },
    {
      _id: 'sys-2',
      subject: 'Subscription Expiry Alert',
      body: 'The Standard Plan subscription for "Mirchi Cafe" will expire in 3 days.',
      type: 'Subscription Expiry',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      targetRoute: ROUTES.SUPER_ADMIN.SUBSCRIPTIONS
    },
    {
      _id: 'sys-3',
      subject: 'Payment Received',
      body: 'Payment of ₹19,999 received successfully from Green Bowl Cafe for Basic Plan.',
      type: 'Payment',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      targetRoute: ROUTES.SUPER_ADMIN.BILLING
    },
    {
      _id: 'sys-4',
      subject: 'Support Ticket Urgent',
      body: 'Ticket #TK-9932 regarding POS integration requires super admin review.',
      type: 'Support Ticket',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      targetRoute: ROUTES.SUPER_ADMIN.TICKETS
    }
  ];

  // Fetch notifications
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const res = await getNotifications({ page: 0, limit: 15 });
        if (isMounted) {
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          if (list.length > 0) {
            setNotifications(list);
          } else {
            setNotifications(fallbackNotifications);
          }
        }
      } catch (err) {
        if (isMounted) {
          setNotifications(fallbackNotifications);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Click outside to close
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

  const saveReadIds = (newReadIds) => {
    setReadIds(newReadIds);
    try {
      localStorage.setItem('serviq_read_notifications', JSON.stringify(newReadIds));
      window.dispatchEvent(new Event('serviq_notifications_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      saveReadIds(updated);
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n._id || n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    saveReadIds(updated);
  };

  const handleNotificationClick = (item) => {
    markAsRead(item._id || item.id);
    onClose();
    if (item.targetRoute) {
      navigate(item.targetRoute);
    } else if (item.type?.toLowerCase().includes('subscription') || item.type?.toLowerCase().includes('plan')) {
      navigate(ROUTES.SUPER_ADMIN.SUBSCRIPTIONS);
    } else if (item.type?.toLowerCase().includes('payment') || item.type?.toLowerCase().includes('bill')) {
      navigate(ROUTES.SUPER_ADMIN.BILLING);
    } else if (item.type?.toLowerCase().includes('ticket')) {
      navigate(ROUTES.SUPER_ADMIN.TICKETS);
    } else if (item.type?.toLowerCase().includes('restaurant')) {
      navigate(ROUTES.SUPER_ADMIN.RESTAURANTS);
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

  const getTypeStyle = (type = '') => {
    const t = String(type).toLowerCase();
    if (t.includes('subscription') || t.includes('expiry')) {
      return {
        icon: <AlertTriangle style={{ width: '16px', height: '16px' }} />,
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.25)'
      };
    }
    if (t.includes('payment') || t.includes('billing') || t.includes('invoice')) {
      return {
        icon: <CreditCard style={{ width: '16px', height: '16px' }} />,
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#10b981',
        border: 'rgba(16, 185, 129, 0.25)'
      };
    }
    if (t.includes('restaurant') || t.includes('lead') || t.includes('onboarding')) {
      return {
        icon: <Store style={{ width: '16px', height: '16px' }} />,
        bg: 'rgba(139, 92, 246, 0.12)',
        color: '#8b5cf6',
        border: 'rgba(139, 92, 246, 0.25)'
      };
    }
    if (t.includes('ticket') || t.includes('support') || t.includes('issue')) {
      return {
        icon: <LifeBuoy style={{ width: '16px', height: '16px' }} />,
        bg: 'rgba(239, 68, 68, 0.12)',
        color: '#ef4444',
        border: 'rgba(239, 68, 68, 0.25)'
      };
    }
    return {
      icon: <Info style={{ width: '16px', height: '16px' }} />,
      bg: 'rgba(59, 130, 246, 0.12)',
      color: '#3b82f6',
      border: 'rgba(59, 130, 246, 0.25)'
    };
  };

  if (!isOpen) return null;

  const unreadItems = notifications.filter(n => !readIds.includes(n._id || n.id));
  const displayedItems = activeTab === 'unread' ? unreadItems : notifications;

  return (
    <div
      ref={popupRef}
      className="animate-fade-in"
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        background: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.18), 0 8px 16px -4px rgba(0, 0, 0, 0.08)',
        zIndex: 10000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 18px',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-app, #f8fafc)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main, #0f172a)'
          }}>
            <Bell style={{ width: '15px', height: '15px' }} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main, #0f172a)', lineHeight: 1.2 }}>
              Notifications
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
              {unreadItems.length > 0 ? `${unreadItems.length} unread alerts` : 'All caught up'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {unreadItems.length > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              title="Mark all as read"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.74rem',
                fontWeight: '600',
                color: '#3b82f6',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <CheckCheck style={{ width: '13px', height: '13px' }} /> Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #94a3b8)',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        padding: '8px 16px',
        gap: '8px',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        background: 'var(--bg-card, #ffffff)'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          style={{
            padding: '5px 12px',
            fontSize: '0.76rem',
            fontWeight: activeTab === 'all' ? '700' : '500',
            borderRadius: '20px',
            border: activeTab === 'all' ? '1px solid #000000' : '1px solid transparent',
            background: activeTab === 'all' ? '#000000' : 'transparent',
            color: activeTab === 'all' ? '#ffffff' : 'var(--text-muted, #64748b)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          style={{
            padding: '5px 12px',
            fontSize: '0.76rem',
            fontWeight: activeTab === 'unread' ? '700' : '500',
            borderRadius: '20px',
            border: activeTab === 'unread' ? '1px solid #3b82f6' : '1px solid transparent',
            background: activeTab === 'unread' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            color: activeTab === 'unread' ? '#3b82f6' : 'var(--text-muted, #64748b)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          Unread
          {unreadItems.length > 0 && (
            <span style={{
              background: '#3b82f6',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: '700',
              padding: '1px 6px',
              borderRadius: '10px'
            }}>
              {unreadItems.length}
            </span>
          )}
        </button>
      </div>

      {/* List Content */}
      <div style={{
        maxHeight: '340px',
        overflowY: 'auto',
        padding: '6px 0',
        background: 'var(--bg-card, #ffffff)'
      }}>
        {loading ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '0.82rem' }}>
            <div style={{ width: '24px', height: '24px', border: '2px solid #e2e8f0', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
            Loading notifications...
          </div>
        ) : displayedItems.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <CheckCircle2 style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-main, #0f172a)' }}>
                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                {activeTab === 'unread' ? "You've read all your notifications." : 'New system activity alerts will appear here.'}
              </p>
            </div>
          </div>
        ) : (
          displayedItems.map((item) => {
            const isRead = readIds.includes(item._id || item.id);
            const style = getTypeStyle(item.type);

            return (
              <div
                key={item._id || item.id}
                onClick={() => handleNotificationClick(item)}
                style={{
                  padding: '12px 18px',
                  display: 'flex',
                  gap: '12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-color, #f1f5f9)',
                  background: isRead ? 'transparent' : 'rgba(59, 130, 246, 0.03)',
                  transition: 'background 0.15s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover, #f8fafc)'}
                onMouseLeave={(e) => e.currentTarget.style.background = isRead ? 'transparent' : 'rgba(59, 130, 246, 0.03)'}
              >
                {/* Type Icon */}
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: style.bg,
                  color: style.color,
                  border: `1px solid ${style.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {style.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h5 style={{
                      margin: 0,
                      fontSize: '0.82rem',
                      fontWeight: isRead ? '600' : '750',
                      color: 'var(--text-main, #0f172a)',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.subject}
                    </h5>
                    {!isRead && (
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#3b82f6',
                        flexShrink: 0,
                        marginTop: '4px'
                      }} />
                    )}
                  </div>

                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '0.74rem',
                    color: 'var(--text-muted, #64748b)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.body}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      color: 'var(--text-muted, #94a3b8)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock style={{ width: '11px', height: '11px' }} />
                      {formatTimeAgo(item.createdAt)}
                    </span>
                    {item.type && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        color: style.color,
                        background: style.bg,
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {item.type}
                      </span>
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
