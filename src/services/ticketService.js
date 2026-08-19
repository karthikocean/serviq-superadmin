import api from "./api";

export const getTickets = async (params) => {
  const response = await api.get("/tickets", { params });
  return response.data;
};

export const createTicket = async (data) => {
  const response = await api.post("/tickets", data);
  return response.data;
};

export const updateTicketStatus = async (id, status) => {
  const response = await api.patch(`/tickets/${id}/status`, { status });
  return response.data;
};

export const assignTicket = async (id, assignedUser) => {
  const response = await api.patch(`/tickets/${id}/assign`, { assignedUser });
  return response.data;
};
