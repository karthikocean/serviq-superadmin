import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("superadmin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry or unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response && error.response.status === 401;

    // Check if we are not already on the login page to prevent redirect loops
    if (isUnauthorized && window.location.pathname !== "/login") {
      // Clear token since session is expired or revoked
      localStorage.removeItem("superadmin_token");
      localStorage.removeItem("superadmin_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getRestaurants = async (page = 1, limit = 10) => {
  const response = await api.get(`/super-admin/restaurants?page=${page}&limit=${limit}`);
  return response.data;
};

export const createRestaurant = async (data) => {
  const response = await api.post("/super-admin/restaurants", data);
  return response.data;
};

export const updateRestaurant = async (id, data) => {
  const response = await api.put(`/super-admin/restaurants/${id}`, data);
  return response.data;
};

export const deleteRestaurant = async (id) => {
  const response = await api.delete(`/super-admin/restaurants/${id}`);
  return response.data;
};

export const getPlans = async () => {
  const response = await api.get("/super-admin/plans");
  return response.data;
};

export default api;
