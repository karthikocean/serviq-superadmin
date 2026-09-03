import axios from "axios";

const APP_ENV = (typeof process !== "undefined" && process.env?.REACT_APP_ENV) || import.meta.env.VITE_APP_ENV || "production";
let IMAGE_BASE_URL = "";
let BASE_URL = "";
let server = "";

switch (APP_ENV) {
  case "dev":
    IMAGE_BASE_URL = "http://192.168.1.16:5000/public";
    BASE_URL = "http://192.168.1.16:5000/api/super-admin";
    server = "http://192.168.1.16:5000";
    break;

  case "production":
    IMAGE_BASE_URL = "http://65.0.84.181:4000/public";
    BASE_URL = "http://65.0.84.181:4000/api/super-admin";
    server = "http://65.0.84.181:4000";
    break;

  case "local":
  default:
    IMAGE_BASE_URL = "http://192.168.88.28:5000/public";
    BASE_URL = "http://192.168.88.28:5000/api/super-admin";
    server = "http://192.168.88.28:5000";
    break;
}

export { IMAGE_BASE_URL, BASE_URL, server };

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  function (config) {
    const token =
      sessionStorage.getItem("superadmin_token") ||
      localStorage.getItem("superadmin_token") ||
      sessionStorage.getItem("userToken") ||
      localStorage.getItem("userToken") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("token");

    if (token && token !== "null" && token !== "undefined") {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export const isTokenExpired = (token) => {
  if (!token || typeof token !== "string") return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload.exp) {
      return Date.now() >= payload.exp * 1000;
    }
  } catch (e) {
    return false;
  }
  return false;
};

apiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const isUnauthorized = status === 401;
    const isDeactivated =
      status === 403 &&
      (code === "USER_INACTIVE" || code === "ROLE_INACTIVE");

    if (
      (isUnauthorized || isDeactivated) &&
      window.location.pathname !== "/login"
    ) {
      sessionStorage.removeItem("superadmin_token");
      sessionStorage.removeItem("superadmin_user");
      sessionStorage.removeItem("superadmin_roleName");
      localStorage.removeItem("superadmin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
