import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Add a request interceptor for JWT Auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration easily
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('tt_token');
      localStorage.removeItem('tt_auth_user');
      if (window.location.pathname !== '/' && window.location.pathname !== '/signup') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
};

// Faculty
export const facultyAPI = {
  list: () => api.get('/api/faculty/'),
  create: (data) => api.post('/api/faculty/', data),
  update: (id, data) => api.put(`/api/faculty/${id}`, data),
  delete: (id) => api.delete(`/api/faculty/${id}`),
  markLeave: (id, dates) => api.post(`/api/faculty/${id}/leave`, dates),
};

// Subjects
export const subjectsAPI = {
  list: () => api.get('/api/subjects/'),
  create: (data) => api.post('/api/subjects/', data),
  update: (id, data) => api.put(`/api/subjects/${id}`, data),
  delete: (id) => api.delete(`/api/subjects/${id}`),
};

// Rooms
export const roomsAPI = {
  list: () => api.get('/api/rooms/'),
  create: (data) => api.post('/api/rooms/', data),
  update: (id, data) => api.put(`/api/rooms/${id}`, data),
  delete: (id) => api.delete(`/api/rooms/${id}`),
  utilization: () => api.get('/api/rooms/analytics/utilization'),
};

// Batches
export const batchesAPI = {
  list: () => api.get('/api/batches/'),
  create: (data) => api.post('/api/batches/', data),
  update: (id, data) => api.put(`/api/batches/${id}`, data),
  delete: (id) => api.delete(`/api/batches/${id}`),
};

// Timetable
export const timetableAPI = {
  generate: (batchIds) => api.post('/api/timetable/generate', { batch_ids: batchIds }),
  list: () => api.get('/api/timetable/'),
  getByBatch: (batchId) => api.get(`/api/timetable/batch/${batchId}`),
  getById: (id) => api.get(`/api/timetable/${id}`),
  approve: (id) => api.post(`/api/timetable/${id}/approve`),
  delete: (id) => api.delete(`/api/timetable/${id}`),
  analytics: () => api.get('/api/timetable/analytics/summary'),
  editSlot: (id, params) => api.patch(`/api/timetable/${id}/slot`, null, { params }),
};

export default api;
