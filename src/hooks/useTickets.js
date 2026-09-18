import { useState } from 'react';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  return { tickets, setTickets };
}
