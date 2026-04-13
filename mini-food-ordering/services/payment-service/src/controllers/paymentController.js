// controllers/paymentController.js
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:8083";
const payments = [];
const notifications = [];

// Giả lập gửi notification
const sendNotification = (message, type = "SUCCESS") => {
  const notification = {
    id: uuidv4(),
    message,
    type,
    timestamp: new Date().toISOString(),
  };
  notifications.push(notification);
  console.log(`🔔 NOTIFICATION [${type}]: ${message}`);
  return notification;
};

const processPayment = async (req, res) => {
  const { orderId, method, amount, userName } = req.body;

  if (!orderId || !method) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin thanh toán" });
  }

  try {
    // 1. Lấy thông tin order từ Order Service
    const orderRes = await axios.get(`${ORDER_SERVICE_URL}/orders/${orderId}`);
    const order = orderRes.data.data;

    if (order.status === "PAID") {
      return res
        .status(400)
        .json({ success: false, message: "Đơn hàng đã được thanh toán" });
    }

    // 2. Tạo bản ghi thanh toán
    const payment = {
      id: uuidv4(),
      paymentCode: `PAY-${Date.now()}`,
      orderId,
      orderCode: order.orderCode,
      amount: order.totalAmount,
      method,
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
    };

    payments.push(payment);

    // 3. Cập nhật trạng thái order → PAID
    await axios.patch(`${ORDER_SERVICE_URL}/orders/${orderId}/status`, {
      status: "PAID",
    });

    // 4. Gửi thông báo
    const notifMsg = `✅ ${order.userName} đã đặt đơn ${order.orderCode} thành công! Tổng: ${order.totalAmount.toLocaleString()}đ - Phương thức: ${method}`;
    const notification = sendNotification(notifMsg, "SUCCESS");

    return res.status(201).json({
      success: true,
      message: "Thanh toán thành công",
      data: { payment, notification },
    });
  } catch (error) {
    console.error(
      "Lỗi thanh toán:",
      error.message,
      error.response?.data || error.stack,
    );
    if (error.response?.status === 404) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }
    return res
      .status(500)
      .json({
        success: false,
        message: "Lỗi hệ thống khi thanh toán: " + (error.message || ""),
      });
  }
};

const getAllPayments = (req, res) => {
  return res.json({ success: true, data: payments });
};

const getAllNotifications = (req, res) => {
  return res.json({ success: true, data: notifications.slice().reverse() });
};

module.exports = { processPayment, getAllPayments, getAllNotifications };
