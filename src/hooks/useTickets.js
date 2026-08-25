import { useState, useEffect } from 'react';

const mockTickets = [
  {
    id: 'TKT-1001',
    restaurantName: 'Spice Garden Bistro',
    subject: 'QR code not scanning under low light conditions',
    category: 'QR Scanning',
    priority: 'High',
    assignedUser: 'Admin User',
    status: 'Open',
    createdDate: '2026-06-10',
    description: 'Customers are reporting that they cannot scan the QR codes on the corner tables when the ambient dining room lighting is dimmed.'
  },
  {
    id: 'TKT-1002',
    restaurantName: 'Urban Tiffin House',
    subject: 'Billing module GST rounding error',
    category: 'Billing',
    priority: 'Medium',
    assignedUser: 'Jane Doe (Support)',
    status: 'In Progress',
    createdDate: '2026-06-09',
    description: 'The final printed receipt rounds the GST to the nearest rupee, but the simulator screen displays decimals. Need consistent rounding.'
  },
  {
    id: 'TKT-1003',
    restaurantName: 'Blue Plate Cafe',
    subject: 'KDS display screen delay during peak hours',
    category: 'KDS Lag',
    priority: 'Low',
    assignedUser: 'John Smith (Dev)',
    status: 'Resolved',
    createdDate: '2026-06-08',
    description: 'The kitchen orders are taking up to 10 seconds to appear on the secondary display screen when there are more than 15 active tickets.'
  },
  {
    id: 'TKT-1004',
    restaurantName: 'Serviq Bistro',
    subject: 'Menu upload images failing size limits',
    category: 'Menu',
    priority: 'Low',
    assignedUser: 'Unassigned',
    status: 'Closed',
    createdDate: '2026-06-05',
    description: 'Images larger than 2MB fail to upload silently. We should add a warning toast indicating image size limits.'
  }
];

export function useTickets() {
  const [tickets, setTickets] = useState(() => {
    try {
      const item = sessionStorage.getItem('serviq_tickets');
      return item ? JSON.parse(item) : mockTickets;
    } catch {
      return mockTickets;
    }
  });

  useEffect(() => {
    sessionStorage.setItem('serviq_tickets', JSON.stringify(tickets));
  }, [tickets]);

  return { tickets, setTickets };
}
