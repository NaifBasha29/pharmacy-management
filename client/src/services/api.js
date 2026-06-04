import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5005/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    // Check both localStorage and sessionStorage for token
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("[API] No auth token found in storage");
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Check both storages for refresh token
        const refreshToken =
          localStorage.getItem("refreshToken") ||
          sessionStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {
              refreshToken,
            },
          );

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          // Sync both storages
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          sessionStorage.setItem("accessToken", accessToken);
          sessionStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          console.warn("[API] No refresh token found, redirecting to login");
        }
      } catch (refreshError) {
        console.error("[API] Token refresh failed:", refreshError.message);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("currentUser");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  loginAdmin: (credentials) => api.post("/auth/login/admin", credentials),
  loginClinic: (credentials) => api.post("/auth/login/clinic", credentials),
  loginPatient: (credentials) => api.post("/auth/login/patient", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getCurrentUser: () => api.get("/auth/me"),
  getMe: () => api.get("/auth/me"), // Alias for backward compatibility
  logout: () => api.post("/auth/logout"),
  changePassword: (data) => api.put("/auth/change-password", data),
  // Password reset flow
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  verifyOTP: (data) => api.post("/auth/verify-otp", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  refreshToken: (token) =>
    api.post("/auth/refresh-token", { refreshToken: token }),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateProfile: (data) => api.put("/users/profile", data),
  getStats: () => api.get("/users/stats/overview"),
};

// Medicines API
export const medicinesAPI = {
  getAll: (params) => api.get("/medicines", { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post("/medicines", data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  updateStock: (id, data) => api.put(`/medicines/${id}/stock`, data),
  getLowStock: () => api.get("/medicines/alerts/low-stock"),
  getExpiringSoon: () => api.get("/medicines/alerts/expiring-soon"),
  getStats: () => api.get("/medicines/stats/overview"),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Suppliers API
export const suppliersAPI = {
  getAll: (params) => api.get("/suppliers", { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post("/suppliers", data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders", data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancel: (id, data) => api.put(`/orders/${id}/cancel`, data),
  track: (id) => api.get(`/orders/${id}/track`),
  dispense: (id) => api.post(`/orders/${id}/dispense`),
};

// Prescriptions API
export const prescriptionsAPI = {
  getAll: (params) => api.get("/prescriptions", { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  upload: (formData) =>
    api.post("/prescriptions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  verify: (id, data) => api.put(`/prescriptions/${id}/verify`, data),
  fulfill: (id, data) => api.put(`/prescriptions/${id}/fulfill`, data),
};

// Patients API
export const patientsAPI = {
  getAll: (params) => api.get("/patients", { params }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post("/patients", data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  // Update own patient profile (for patient users)
  updateProfile: (data) => api.put(`/patients/profile`, data),
  addMedicalHistory: (id, data) =>
    api.put(`/patients/${id}/medical-history`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getSales: (params) => api.get("/analytics/sales", { params }),
  getPopularMedicines: (params) =>
    api.get("/analytics/popular-medicines", { params }),
  getTransactions: (params) => api.get("/analytics/transactions", { params }),
};

// Settings API
export const settingsAPI = {
  get: () => api.get("/settings"),
  getPublic: () => api.get("/settings/public"),
  update: (data) => api.put("/settings", data),
};

// Audit Logs API
export const auditLogsAPI = {
  getAll: (params) => api.get("/audit-logs", { params }),
  getActions: () => api.get("/audit-logs/actions"),
};

// Support API
export const supportAPI = {
  getAll: (params) => api.get("/support", { params }),
  getById: (id) => api.get(`/support/${id}`),
  create: (data) => api.post("/support", data),
  updateStatus: (id, data) => api.put(`/support/${id}/status`, data),
  reply: (id, data) => api.post(`/support/${id}/reply`, data),
};

// Clinics API
export const clinicsAPI = {
  getAll: (params) => api.get("/clinics", { params }),
  getStats: () => api.get("/clinics/stats"),
  getById: (id) => api.get(`/clinics/${id}`),
  create: (data) =>
    api.post("/clinics", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/clinics/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateStatus: (id, data) => api.put(`/clinics/${id}/status`, data),
  verify: (id, data) => api.put(`/clinics/${id}/verify`, data),
  activate: (id) => api.put(`/clinics/${id}/activate`),
  sendCredentials: (id) => api.post(`/clinics/${id}/send-credentials`),
  delete: (id) => api.delete(`/clinics/${id}`),
};

// Admin Dashboard API
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getClinicsOverview: () => api.get("/admin/clinics/overview"),
};

// AI API
export const aiAPI = {
  chat: (payload) => {
    // Accept either a string (single message) or an object { message, history }
    if (typeof payload === "string")
      return api.post("/ai/chat", { message: payload });
    return api.post("/ai/chat", payload);
  },
  symptomCheck: (symptoms) => api.post("/ai/symptom-check", { symptoms }),
  recommendations: () => api.get("/ai/recommendations"),
};

// User favorites API (wishlist)
export const favoritesAPI = {
  getAll: () => api.get("/user/favorites"),
  add: (data) => api.post("/user/favorites", data),
  remove: (medicineId) => api.delete(`/user/favorites/${medicineId}`),
};

// Home medicine cabinet API
export const homeMedicinesAPI = {
  getAll: () => api.get("/user/home-medicines"),
  create: (data) => api.post("/user/home-medicines", data),
  delete: (id) => api.delete(`/user/home-medicines/${id}`),
};

export default api;

// Export base URLs for other modules that need to build absolute file URLs
export const API_HOST = API_BASE_URL.replace(/\/api$/i, "");
export { API_BASE_URL };
