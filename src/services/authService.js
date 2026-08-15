import api from "./api";

export const login = async (credentials, showToast) => {
  try {
    const response = await api.post("/auth/login", credentials);
    if (showToast) showToast('success', 'Logged in successfully!');
    return response.data;
  } catch (error) {
    if (showToast) {
      showToast('error', error.response?.data?.message || 'Login failed. Please check credentials.');
    }
    return { error: true };
  }
};

export const logout = async () => {
  // Crucial: Call the backend API to delete the token from the DB
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put("/auth/profile", data);
  return response.data;
};

export const updatePassword = async (data) => {
  const response = await api.put("/auth/change-password", data);
  return response.data;
};

