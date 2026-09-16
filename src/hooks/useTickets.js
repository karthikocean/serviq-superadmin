import { useState, useEffect } from 'react';

const mockTickets = [];

export function useTickets() {
  const [tickets, setTickets] = useState(() => {
    try {
      const item = sessionStorage.getItem('serviq_tickets');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem('serviq_tickets', JSON.stringify(tickets));
  }, [tickets]);

  return { tickets, setTickets };
}
