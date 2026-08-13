export const INITIAL_ORDERS = [
  {
    id: '#ORD-042',
    table: 'T-01',
    waiter: 'Ravi M.',
    items: [
      { name: 'Paneer Tikka', quantity: 2, price: 140 },
      { name: 'Dal Makhani', quantity: 1, price: 160 }
    ],
    time: '12:34',
    timestamp: new Date(Date.now() - 600000),
    status: 'Preparing',
    payment: 'Pending',
    note: ''
  },
  {
    id: '#ORD-043',
    table: 'T-03',
    waiter: 'Rahul S.',
    items: [
      { name: 'Butter Chicken', quantity: 2, price: 260 },
      { name: 'Gulab Jamun', quantity: 1, price: 80 }
    ],
    time: '12:21',
    timestamp: new Date(Date.now() - 1200000),
    status: 'Ready',
    payment: 'Pending',
    note: ''
  },
  {
    id: '#ORD-044',
    table: 'T-06',
    waiter: 'Arjun K.',
    items: [
      { name: 'Chicken 65', quantity: 1, price: 180 },
      { name: 'Masala Chai', quantity: 2, price: 40 }
    ],
    time: '12:10',
    timestamp: new Date(Date.now() - 1800000),
    status: 'Delivered',
    payment: 'Paid',
    note: ''
  },
  {
    id: '#ORD-045',
    table: 'T-08',
    waiter: 'Ravi M.',
    items: [
      { name: 'Fish Curry', quantity: 2, price: 250 },
      { name: 'Mango Lassi', quantity: 2, price: 60 }
    ],
    time: '12:40',
    timestamp: new Date(Date.now() - 300000),
    status: 'Pending',
    payment: 'Pending',
    note: ''
  },
  {
    id: '#ORD-040',
    table: 'T-02',
    waiter: 'Rahul S.',
    items: [
      { name: 'Paneer Tikka', quantity: 1, price: 140 },
      { name: 'Masala Chai', quantity: 1, price: 40 }
    ],
    time: '11:55',
    timestamp: new Date(Date.now() - 3600000),
    status: 'Paid',
    payment: 'Paid',
    note: ''
  }
];
