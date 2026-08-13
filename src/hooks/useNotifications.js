import { useState, useEffect } from 'react';

const mockNotifications = [
  {
    id: 'NTF-101',
    subject: 'Scheduled Platform Maintenance - June 15th',
    type: 'Maintenance Notice',
    channel: 'Email',
    recipients: 'All Restaurants',
    status: 'Scheduled',
    scheduledDate: '2026-06-15 02:00 AM',
    body: 'Our platform will undergo scheduled maintenance to optimize order routing speeds on June 15th between 2:00 AM and 4:00 AM IST. QR menus will remain active, but KDS sync might experience brief interruptions.'
  },
  {
    id: 'NTF-102',
    subject: 'Urgent: Subscription Expiring Soon',
    type: 'Subscription Expiry',
    channel: 'SMS',
    recipients: 'Spice Garden Bistro',
    status: 'Sent',
    scheduledDate: '2026-06-10 10:30 AM',
    body: 'Your Serviq QR Menu Standard Subscription expires in 3 days. Renew now to avoid interruption of guests scanning menu tables.'
  },
  {
    id: 'NTF-103',
    subject: 'Introduce UPI Auto-Settlements for Cashiers!',
    type: 'Feature Updates',
    channel: 'WhatsApp',
    recipients: 'Premium Subscribers',
    status: 'Sent',
    scheduledDate: '2026-06-08 04:15 PM',
    body: 'You can now configure instant UPI bank deposits directly in your settlement panel. Go to Settings > Billing to try it out!'
  },
  {
    id: 'NTF-104',
    subject: 'Monsoon Feast Special Promotional Campaigns',
    type: 'Promotional Messages',
    channel: 'Email',
    recipients: 'All Restaurants',
    status: 'Draft',
    scheduledDate: 'Unscheduled',
    body: 'Get up to 25% discount on custom QR menu banner prints this monsoon season. Order directly from the Serviq print portal.'
  }
];

export function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    try {
      const item = localStorage.getItem('serviq_notifications');
      return item ? JSON.parse(item) : mockNotifications;
    } catch {
      return mockNotifications;
    }
  });

  useEffect(() => {
    localStorage.setItem('serviq_notifications', JSON.stringify(notifications));
  }, [notifications]);

  return { notifications, setNotifications };
}
