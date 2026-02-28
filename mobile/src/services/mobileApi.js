import api from '../config/api';

// Auth API
export const authAPI = {
  loginPatient: (credentials) => api.post('/auth/login/patient', credentials),
  registerPatient: (data) => api.post('/auth/register/patient', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  cancel: (id, data) => api.put(`/orders/${id}/cancel`, data),
  track: (id) => api.get(`/orders/${id}/track`),
};

// Prescriptions API
export const prescriptionsAPI = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  upload: (formData) => api.post('/prescriptions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Patients API
export const patientsAPI = {
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  addMedicalHistory: (id, data) => api.put(`/patients/${id}/medical-history`, data),
};

// Medicines API (for catalog/search)
export const medicinesAPI = {
  getAll: (params) => api.get('/medicines', { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  getStats: () => api.get('/medicines/stats/overview'), 
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

// Categories API (for catalog filters)
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
};

export default {
  authAPI,
  ordersAPI,
  prescriptionsAPI,
  patientsAPI,
  medicinesAPI,
  analyticsAPI,
  categoriesAPI,
};
