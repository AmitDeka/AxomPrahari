import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://axomprahari-api.onrender.com",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request Interceptor: Attach the Admin JWT & Prepend /api/v1
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Prepend /api/v1/ to the URL if it doesn't already have it
  if (config.url && !config.url.startsWith("/api/v1") && !config.url.startsWith("http")) {
    config.url = `/api/v1${config.url.startsWith("/") ? "" : "/"}${config.url}`;
  }

  return config;
});

// Response Interceptor: Handle global 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url && (
        error.config.url.includes("/auth/admin/login") || 
        error.config.url.includes("/login")
      );
      if (!isLoginRequest && typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
