import { useState, useEffect } from 'react';

const mockSubscriptionHistory = [
  {
    id: 'SUB-001',
    restaurantId: 'R-02',
    restaurantName: 'Serviq Express Cafe',
    planName: 'Premium Plan',
    startDate: '2025-03-22',
    endDate: '2026-09-22',
    amount: 50000,
    status: 'Completed'
  }
];

export function useSubscriptions() {
  const [subscriptionHistory, setSubscriptionHistory] = useState(() => {
    try {
      const item = localStorage.getItem('serviq_subscriptions');
      return item ? JSON.parse(item) : mockSubscriptionHistory;
    } catch {
      return mockSubscriptionHistory;
    }
  });

  const [viewingSubscriptionRest, setViewingSubscriptionRest] = useState(null);

  useEffect(() => {
    localStorage.setItem('serviq_subscriptions', JSON.stringify(subscriptionHistory));
  }, [subscriptionHistory]);

  return { subscriptionHistory, setSubscriptionHistory, viewingSubscriptionRest, setViewingSubscriptionRest };
}
