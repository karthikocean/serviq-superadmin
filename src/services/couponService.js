import api from "./api";

export const getCouponsApi = async (pageIndex = 0, limit = 10, search = "") => {
  const response = await api.get(`/coupons?pageIndex=${pageIndex}&limit=${limit}&search=${encodeURIComponent(search)}`);
  return response.data;
};

export const createCouponApi = async (data) => {
  const response = await api.post("/coupons", data);
  return response.data;
};

export const updateCouponApi = async (id, data) => {
  const response = await api.put(`/coupons/${id}`, data);
  return response.data;
};

export const deleteCouponApi = async (id) => {
  const response = await api.delete(`/coupons/${id}`);
  return response.data;
};
