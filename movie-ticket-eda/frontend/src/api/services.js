// src/api/services.js
import axios from "axios";

// Tự động lấy hostname hiện tại (có thể là localhost hoặc IP LAN)
const currentHost = window.location.hostname;

const BASE = {
  USER: import.meta.env.VITE_USER_SERVICE_URL || `http://${currentHost}:3001`,
  MOVIE: import.meta.env.VITE_MOVIE_SERVICE_URL || `http://${currentHost}:3002`,
  BOOKING:
    import.meta.env.VITE_BOOKING_SERVICE_URL || `http://${currentHost}:3003`,
  PAYMENT:
    import.meta.env.VITE_PAYMENT_SERVICE_URL || `http://${currentHost}:3004`,
};

export const userApi = {
  register: (d) => axios.post(`${BASE.USER}/register`, d),
  login: (d) => axios.post(`${BASE.USER}/login`, d),
  getAll: () => axios.get(`${BASE.USER}/users`),
};

export const movieApi = {
  getAll: (params) => axios.get(`${BASE.MOVIE}/movies`, { params }),
  getById: (id) => axios.get(`${BASE.MOVIE}/movies/${id}`),
  create: (d) => axios.post(`${BASE.MOVIE}/movies`, d),
  update: (id, d) => axios.put(`${BASE.MOVIE}/movies/${id}`, d),
  delete: (id) => axios.delete(`${BASE.MOVIE}/movies/${id}`),
};

export const bookingApi = {
  create: (d) => axios.post(`${BASE.BOOKING}/bookings`, d),
  getAll: (userId) =>
    axios.get(`${BASE.BOOKING}/bookings`, { params: userId ? { userId } : {} }),
  getById: (id) => axios.get(`${BASE.BOOKING}/bookings/${id}`),
};

export const notificationApi = {
  getAll: () => axios.get(`${BASE.PAYMENT}/notifications`),
  // SSE stream URL
  streamUrl: () => `${BASE.PAYMENT}/notifications/stream`,
};
