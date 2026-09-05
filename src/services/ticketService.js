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

export const replyToTicket = async (id, reply) => {
  const response = await api.post(`/tickets/${id}/reply`, { reply, message: reply });
  return response.data;
};

export const updateTicket = async (id, data) => {
  const response = await api.patch(`/tickets/${id}`, data);
  return response.data;
};

