// src/api/config.js — Cấu hình URL các service
const BASE = {
  // Thay thế localhost bằng IP máy tính của bạn khi chạy LAN (VD: 'http://192.168.1.10:8081')
  USER: import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:8081",
  FOOD: import.meta.env.VITE_FOOD_SERVICE_URL || "http://localhost:8082",
  ORDER: import.meta.env.VITE_ORDER_SERVICE_URL || "http://localhost:8083",
  PAYMENT: import.meta.env.VITE_PAYMENT_SERVICE_URL || "http://localhost:8084",
};

export default BASE;
