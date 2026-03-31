import api from "../config/api";
import * as SecureStore from "../utils/storage";

// Auth API
export const authAPI = {
  loginPatient: (credentials) => api.post("/auth/login/patient", credentials),
  registerPatient: (data) => api.post("/auth/register/patient", data),
  getCurrentUser: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders", data),
  cancel: (id, data) => api.put(`/orders/${id}/cancel`, data),
  track: (id) => api.get(`/orders/${id}/track`),
};

// Prescriptions API
export const prescriptionsAPI = {
  getAll: (params) => api.get("/prescriptions", { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  upload: async (formData) => {
    // Use fetch for file uploads in React Native to avoid axios multipart boundary issues
    const url = `${api.defaults.baseURL}/prescriptions`;
    const token = await SecureStore.getItemAsync("userToken");

    const headers = {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data?.message || "Upload failed");
      err.response = { data, status: res.status };
      throw err;
    }
    return data;
  },
};

// Patients API
export const patientsAPI = {
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  addMedicalHistory: (id, data) =>
    api.put(`/patients/${id}/medical-history`, data),
};

// Medicines API (for catalog/search)
export const medicinesAPI = {
  getAll: (params) => api.get("/medicines", { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  getStats: () => api.get("/medicines/stats/overview"),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get("/analytics/dashboard"),
};

// Categories API (for catalog filters)
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
};

// Favorites API
export const favoritesAPI = {
  getAll: () => api.get("/favorites"),
  add: (medicineId) => api.post("/favorites", { medicineId }),
  remove: (medicineId) => api.delete(`/favorites/${medicineId}`),
  check: (medicineId) => api.get(`/favorites/check/${medicineId}`),
};

// Refills API
export const refillsAPI = {
  create: (orderId) => api.post("/refills", { orderId }),
};

// AI API
export const aiAPI = {
  symptomCheck: (symptoms) => api.post("/ai/symptom-check", { symptoms }),
  chat: (message) => api.post("/ai/chat", { message }),
  recommendations: () => api.get("/ai/recommendations"),
};

// Home Medicines API (expiry tracking)
export const homeMedicinesAPI = {
  getAll: () => api.get("/home-medicines"),
  add: (data) => api.post("/home-medicines", data),
  update: (id, data) => api.put(`/home-medicines/${id}`, data),
  remove: (id) => api.delete(`/home-medicines/${id}`),
  getExpiring: (days) =>
    api.get("/home-medicines/expiring", { params: { days } }),
};

// Payments API
export const paymentsAPI = {
  createIntent: (orderId, paymentMethod) =>
    api.post("/payments/create-intent", { orderId, paymentMethod }),
  verify: (transactionId, orderId) =>
    api.post("/payments/verify", { transactionId, orderId }),
};

// Reviews API
export const reviewsAPI = {
  create: (orderId, rating, comment) =>
    api.post("/reviews", { orderId, rating, comment }),
  getAll: () => api.get("/reviews"),
  getByOrder: (orderId) => api.get(`/reviews/order/${orderId}`),
};

// Support Tickets API
export const supportAPI = {
  create: (data) => api.post("/support", data),
  getAll: () => api.get("/support"),
  getById: (id) => api.get(`/support/${id}`),
};

export default {
  authAPI,
  ordersAPI,
  prescriptionsAPI,
  patientsAPI,
  medicinesAPI,
  analyticsAPI,
  categoriesAPI,
  favoritesAPI,
  refillsAPI,
  aiAPI,
  homeMedicinesAPI,
  paymentsAPI,
  reviewsAPI,
  supportAPI,
};
