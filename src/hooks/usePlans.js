import { useState, useEffect } from 'react';

const mockPlans = [
  { id: 'plan-basic', name: 'Basic Plan', description: 'Essential tools for small eateries, QR menu ordering and simple table management.', monthlyPrice: 999, annualPrice: 9999, branchLimit: 1, userLimit: 3, orderLimit: 500, features: ['QR Ordering', 'Menu Management', 'Table Management', 'Order Management'], status: 'Active' },
  { id: 'plan-standard', name: 'Standard Plan', description: 'Includes everything in Basic, plus tableside waiter service and app integrations.', monthlyPrice: 1999, annualPrice: 19999, branchLimit: 2, userLimit: 5, orderLimit: 1000, features: ['QR Ordering', 'Menu Management', 'Table Management', 'Order Management', 'Waiter Management'], status: 'Active' },
  { id: 'plan-premium', name: 'Premium Plan', description: 'Advanced operations with integrated Kitchen KDS displays and advanced billing.', monthlyPrice: 4999, annualPrice: 49999, branchLimit: 5, userLimit: 15, orderLimit: 5000, features: ['QR Ordering', 'Menu Management', 'Table Management', 'Order Management', 'Waiter Management', 'Kitchen Management'], status: 'Active' },
];

export function usePlans() {
  const [plans, setPlans] = useState(() => {
    try {
      const item = localStorage.getItem('serviq_plans');
      return item ? JSON.parse(item) : mockPlans;
    } catch {
      return mockPlans;
    }
  });

  useEffect(() => {
    localStorage.setItem('serviq_plans', JSON.stringify(plans));
  }, [plans]);

  return { plans, setPlans };
}
