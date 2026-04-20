// src/routes/index.js
const express = require('express');
const router = express.Router();
const { getPayments } = require('../services/paymentProcessor');
const { getNotifications } = require('../services/notificationService');

// Lấy danh sách thanh toán
router.get('/payments', (req, res) => {
  return res.json({ success: true, data: getPayments() });
});

// Lấy danh sách thông báo (Frontend polling)
router.get('/notifications', (req, res) => {
  return res.json({ success: true, data: getNotifications() });
});

// SSE endpoint để frontend nhận real-time notifications
router.get('/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Gửi ping mỗi 30s để giữ kết nối
  const heartbeat = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`);
  }, 30000);

  // Đăng ký nhận notification mới
  const { registerSSEClient, unregisterSSEClient } = require('../services/notificationService');
  const clientId = Date.now().toString();

  registerSSEClient(clientId, (notif) => {
    res.write(`data: ${JSON.stringify(notif)}\n\n`);
  });

  req.on('close', () => {
    clearInterval(heartbeat);
    unregisterSSEClient(clientId);
  });
});

module.exports = router;
