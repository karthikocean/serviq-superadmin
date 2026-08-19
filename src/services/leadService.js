import api from "./api";

export const getLeads = async (params) => {
  const response = await api.get("/leads", { params });
  return response.data;
};

export const createLead = async (data) => {
  const response = await api.post("/leads", data);
  return response.data;
};

export const updateLeadStatus = async (id, status) => {
  const response = await api.patch(`/leads/${id}/status`, { status });
  return response.data;
};

export const assignLead = async (id, assignedTo) => {
  const response = await api.patch(`/leads/${id}/assign`, { assignedTo });
  return response.data;
};

export const updateFollowUp = async (id, followUpDate) => {
  const response = await api.patch(`/leads/${id}/follow-up`, { followUpDate });
  return response.data;
};

export const convertLeadToRestaurant = async (id) => {
  const response = await api.post(`/leads/${id}/convert`);
  return response.data;
};
