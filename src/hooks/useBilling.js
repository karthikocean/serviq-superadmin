import { useState, useEffect } from 'react';

const mockInvoices = [
  { id: 'INV-2026-001', restaurantName: 'Serviq', subscriptionPlan: 'Premium Plan', amount: 4999, taxAmount: 900, paymentMethod: 'UPI', paymentDate: '2026-06-01', dueDate: '2026-07-01', status: 'Paid', transactionId: 'TXN-8472917462' },
  { id: 'INV-2026-002', restaurantName: 'Sunset Diner', subscriptionPlan: 'Standard Plan', amount: 1999, taxAmount: 360, paymentMethod: 'Credit Card', paymentDate: '2026-05-28', dueDate: '2026-06-28', status: 'Paid', transactionId: 'TXN-1098273645' },
  { id: 'INV-2026-003', restaurantName: 'Ocean Breeze Grill', subscriptionPlan: 'Premium Plan', amount: 4999, taxAmount: 900, paymentMethod: 'Net Banking', paymentDate: '', dueDate: '2026-06-15', status: 'Pending', transactionId: '—' },
  { id: 'INV-2026-004', restaurantName: 'Mountain Lodge Cafe', subscriptionPlan: 'Premium Plan', amount: 4999, taxAmount: 900, paymentMethod: 'UPI', paymentDate: '2026-05-15', dueDate: '2026-06-15', status: 'Refunded', transactionId: 'TXN-9018273645' },
  { id: 'INV-2026-005', restaurantName: 'Downtown Bakery', subscriptionPlan: 'Free Plan', amount: 0, taxAmount: 0, paymentMethod: 'N/A', paymentDate: '2026-05-20', dueDate: '2026-06-20', status: 'Paid', transactionId: 'TXN-SYSTEM-001' }
];

export function useBilling() {
  const [invoices, setInvoices] = useState(() => {
    try {
      const item = localStorage.getItem('serviq_invoices');
      return item ? JSON.parse(item) : mockInvoices;
    } catch {
      return mockInvoices;
    }
  });

  useEffect(() => {
    localStorage.setItem('serviq_invoices', JSON.stringify(invoices));
  }, [invoices]);

  return { invoices, setInvoices };
}
