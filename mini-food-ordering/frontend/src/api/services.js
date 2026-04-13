// src/api/services.js — Các hàm gọi API đến từng service
import axios from 'axios';
import BASE from './config';

// ── User Service ──────────────────────────────────────────
export const userApi = {
  register: (data) => axios.post(`${BASE.USER}/register`, data),
  login: (data) => axios.post(`${BASE.USER}/login`, data),
  getAll: () => axios.get(`${BASE.USER}/users`),
};

// ── Food Service ──────────────────────────────────────────
export const foodApi = {
  getAll: () => axios.get(`${BASE.FOOD}/foods`),
  getById: (id) => axios.get(`${BASE.FOOD}/foods/${id}`),
  create: (data) => axios.post(`${BASE.FOOD}/foods`, data),
  update: (id, data) => axios.put(`${BASE.FOOD}/foods/${id}`, data),
  delete: (id) => axios.delete(`${BASE.FOOD}/foods/${id}`),
};

// ── Order Service ─────────────────────────────────────────
export const orderApi = {
  create: (data) => axios.post(`${BASE.ORDER}/orders`, data),
  getAll: (userId) =>
    axios.get(`${BASE.ORDER}/orders`, { params: userId ? { userId } : {} }),
  getById: (id) => axios.get(`${BASE.ORDER}/orders/${id}`),
};

// ── Payment Service ───────────────────────────────────────
export const paymentApi = {
  process: (data) => axios.post(`${BASE.PAYMENT}/payments`, data),
  getNotifications: () => axios.get(`${BASE.PAYMENT}/notifications`),
};
