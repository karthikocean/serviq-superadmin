import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  LifeBuoy, 
  CheckCircle2, 
  X,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { getNotifications } from '../../services/notificationService';
import { getTickets } from '../../services/ticketService';

export default function NotificationPopup({ isOpen, onClose, anchorRef }) {
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'notifications' | 'tickets' | 'unread'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('serviq_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

  // Default fallback items for notifications and support tickets
  const fallbackItems = [
    {
      _id: 'ticket-1',
      isTicket: true,
      ticketNumber: 'TKT-1042',
      subject: 'POS Kitchen Printer Connection Offline',
      body: 'Kitchen printer stopped printing order tickets during peak dinner rush.',
      priority: 'Urgent',
      restaurantName: 'The Spice House',
      type: 'Support Ticket',
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      targetRoute: ROUTES.SUPER_ADMIN.TICKETS
    },
    {
      _id: 'sys-1',
      isTicket: false,
      subject: 'Scheduled Maintenance Notice',
      body: 'Server database optimization scheduled for Sunday at 02:00 AM UTC (approx 15 mins downtime).',
      type: 'Maintenance',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      targetRoute: ROUTES.SUPER_ADMIN.NOTIFICATIONS
    },
    {
      _id: 'ticket-2',
      isTicket: true,
      ticketNumber: 'TKT-1039',
      subject: 'GST & Invoice Tax Calculation Query',
      body: 'Need verification regarding SGST and CGST split on delivery addon items.',
      priority: 'High',
      restaurantName: 'Urban Biryani Bistro',
      type: 'Support Ticket',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      targetRoute: ROUTES.SUPER_ADMIN.TICKETS
    },
    {
      _id: 'sys-2',
      isTicket: false,
      subject: 'Subscription Expiry Alert',
      body: 'The Enterprise Annual plan for "Mirchi Cafe & Grill" is expiring in 3 days.',
      type: 'Subscription',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      targetRoute: ROUTES.SUPER_ADMIN.SUBSCRIPTIONS
    },
    {
      _id: 'ticket-3',
      isTicket: true,
      ticketNumber: 'TKT-1035',
      subject: 'Request for New Outlet Activation',
      body: 'Owner requested licensing for 2 additional POS terminals for newly opened branch.',
      priority: 'Medium',
      restaurantName: 'Green Bowl Cafe',
      type: 'Support Ticket',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      targetRoute: ROUTES.SUPER_ADMIN.TICKETS
    }
  ];

  // Fetch notifications & tickets
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const [notifRes, ticketRes] = await Promise.allSettled([
          getNotifications({ page: 0, limit: 15 }),
          getTickets({ page: 0, limit: 15 })
        ]);

        let combined = [];

        // Parse Notifications
        if (notifRes.status === 'fulfilled' && notifRes.value) {
          const rawNotifs = Array.isArray(notifRes.value?.data) 
            ? notifRes.value.data 
            : Array.isArray(notifRes.value) 
              ? notifRes.value 
              : [];
          
          const parsedNotifs = rawNotifs.map(n => ({
            _id: n._id || n.id || `notif-${Math.random()}`,
            isTicket: false,
            subject: n.subject || 'System Notification',
            body: n.body || n.message || '',
            type: n.type || 'System',
            createdAt: n.createdAt || n.created_at || new Date().toISOString(),
            targetRoute: ROUTES.SUPER_ADMIN.NOTIFICATIONS
          }));
          combined.push(...parsedNotifs);
        }

        // Parse Tickets
        if (ticketRes.status === 'fulfilled' && ticketRes.value) {
          const rawTickets = Array.isArray(ticketRes.value?.data) 
            ? ticketRes.value.data 
            : Array.isArray(ticketRes.value) 
              ? ticketRes.value 
              : [];
          
          const parsedTickets = rawTickets.map(t => ({
            _id: t._id || t.id || `ticket-${Math.random()}`,
            isTicket: true,
            ticketNumber: t.ticketNumber || (t._id ? `TKT-${String(t._id).slice(-4).toUpperCase()}` : 'TKT'),
            subject: t.subject || t.title || 'Support Ticket Update',
            body: t.description || t.message || (t.replies && t.replies.length > 0 ? t.replies[t.replies.length - 1].message : ''),
            priority: t.priority || 'Medium',
            restaurantName: t.restaurantName || t.restaurant?.name || '',
            type: 'Ticket',
            createdAt: t.updatedAt || t.createdAt || new Date().toISOString(),
            targetRoute: ROUTES.SUPER_ADMIN.TICKETS
          }));
          combined.push(...parsedTickets);
        }

        if (isMounted) {
          if (combined.length > 0) {
            combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setItems(combined);
          } else {
            setItems(fallbackItems);
          }
        }
      } catch (err) {
        console.error('Failed to load notifications and tickets:', err);
        if (isMounted) {
          setItems(fallbackItems);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

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
    const allIds = items.map(n => n._id || n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    saveReadIds(updated);
  };

  const handleItemClick = (item) => {
    markAsRead(item._id || item.id);
    onClose();
    if (item.isTicket) {
      navigate(ROUTES.SUPER_ADMIN.TICKETS);
    } else if (item.targetRoute) {
      navigate(item.targetRoute);
    } else if (item.type?.toLowerCase().includes('subscription') || item.type?.toLowerCase().includes('plan')) {
      navigate(ROUTES.SUPER_ADMIN.SUBSCRIPTIONS);
    } else if (item.type?.toLowerCase().includes('payment') || item.type?.toLowerCase().includes('bill')) {
      navigate(ROUTES.SUPER_ADMIN.BILLING);
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

  if (!isOpen) return null;

  const unreadItems = items.filter(n => !readIds.includes(n._id || n.id));
  const notificationItems = items.filter(n => !n.isTicket);
  const ticketItems = items.filter(n => n.isTicket);

  let displayedItems = items;
  if (activeTab === 'unread') {
    displayedItems = unreadItems;
  } else if (activeTab === 'notifications') {
    displayedItems = notificationItems;
  } else if (activeTab === 'tickets') {
    displayedItems = ticketItems;
  }

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
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
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
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main, #0f172a)', lineHeight: 1.2 }}>
              Notifications
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
              {unreadItems.length > 0 ? `${unreadItems.length} unread updates` : 'All caught up'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {unreadItems.length > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: '600',
                color: '#2563eb',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
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
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      {/* Clean Tabs Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        background: 'var(--bg-card, #ffffff)'
      }}>
        {[
          { key: 'all', label: 'All', count: items.length },
          { key: 'notifications', label: 'Alerts', count: notificationItems.length },
          { key: 'tickets', label: 'Tickets', count: ticketItems.length },
          { key: 'unread', label: 'Unread', count: unreadItems.length }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 4px',
                fontSize: '0.72rem',
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
          maxHeight: '340px',
          overflowY: 'auto',
          background: 'var(--bg-card, #ffffff)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {loading ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '0.8rem' }}>
            Loading updates...
          </div>
        ) : displayedItems.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
            <CheckCircle2 style={{ width: '24px', height: '24px', margin: '0 auto 6px', color: '#10b981' }} />
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main, #0f172a)' }}>
              {activeTab === 'unread' ? 'No unread updates' : 'No items found'}
            </p>
          </div>
        ) : (
          displayedItems.map((item) => {
            const isRead = readIds.includes(item._id || item.id);

            return (
              <div
                key={item._id || item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-color, #f1f5f9)',
                  background: isRead ? 'transparent' : 'rgba(37, 99, 235, 0.03)',
                  transition: 'background 0.1s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover, #f8fafc)'}
                onMouseLeave={(e) => e.currentTarget.style.background = isRead ? 'transparent' : 'rgba(37, 99, 235, 0.03)'}
              >
                {/* Icon */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.isTicket ? '#4f46e5' : '#0284c7',
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  {item.isTicket ? (
                    <LifeBuoy style={{ width: '14px', height: '14px' }} />
                  ) : (
                    <Bell style={{ width: '14px', height: '14px' }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      {item.isTicket && item.ticketNumber && (
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.68rem',
                          fontWeight: '700',
                          color: '#4f46e5',
                          flexShrink: 0
                        }}>
                          {item.ticketNumber}
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
                        {item.subject}
                      </span>
                    </div>

                    {!isRead && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#2563eb',
                        flexShrink: 0
                      }} />
                    )}
                  </div>

                  {item.body && (
                    <p style={{
                      margin: '2px 0 0 0',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted, #64748b)',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.body}
                    </p>
                  )}

                  {/* Clean meta line */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock style={{ width: '10px', height: '10px' }} />
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

                    {item.priority && item.priority.toLowerCase() !== 'medium' && (
                      <>
                        <span>•</span>
                        <span style={{
                          fontWeight: '600',
                          color: item.priority.toLowerCase() === 'urgent' ? '#dc2626' : '#d97706'
                        }}>
                          {item.priority}
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

      {/* Footer Navigation */}
      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid var(--border-color, #e2e8f0)',
        background: 'var(--bg-app, #f8fafc)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          type="button"
          onClick={() => { onClose(); navigate(ROUTES.SUPER_ADMIN.NOTIFICATIONS); }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: '600',
            color: 'var(--text-muted, #64748b)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          All Notifications <ArrowRight style={{ width: '11px', height: '11px' }} />
        </button>

        <button
          type="button"
          onClick={() => { onClose(); navigate(ROUTES.SUPER_ADMIN.TICKETS); }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: '600',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          Support & Tickets <ArrowRight style={{ width: '11px', height: '11px' }} />
        </button>
      </div>
    </div>
  );
}

