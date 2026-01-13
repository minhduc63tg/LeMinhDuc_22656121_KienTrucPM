const express = require("express");
const router = express.Router();
const rabbitMQService = require("../services/rabbitmq.service");
const { authenticateToken } = require("../middleware/auth");

// Lưu trữ messages (trong thực tế dùng database)
// Giới hạn số lượng messages trong memory
const MAX_MESSAGES = 1000;
const messages = [];

// POST /api/chat/send - Gửi message (cần token)
router.post("/send", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập nội dung tin nhắn",
      });
    }

    // Gửi message qua RabbitMQ
    const messageData = await rabbitMQService.sendMessage(
      message,
      req.user.username
    );

    // Lưu vào array (trong thực tế lưu vào database)
    messages.push(messageData);

    // Giới hạn số lượng messages để tránh memory leak
    if (messages.length > MAX_MESSAGES) {
      messages.shift(); // Xóa message cũ nhất
    }

    res.json({
      success: true,
      message: "Gửi tin nhắn thành công",
      data: messageData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/chat/messages - Lấy danh sách messages (cần token)
router.get("/messages", authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/chat/status - Kiểm tra RabbitMQ status
router.get("/status", authenticateToken, (req, res) => {
  const isConnected = rabbitMQService.channel !== null;

  res.json({
    success: true,
    data: {
      rabbitmq: isConnected ? "connected" : "disconnected",
      totalMessages: messages.length,
    },
  });
});

module.exports = router;
