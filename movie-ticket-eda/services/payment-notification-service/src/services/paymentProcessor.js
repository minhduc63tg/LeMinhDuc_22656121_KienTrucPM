// src/services/paymentProcessor.js
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { publish, subscribe } = require("../../../../shared/rabbitmq");
const EVENTS = require("../../../../shared/events");

const BOOKING_SERVICE =
  process.env.BOOKING_SERVICE_URL || "http://localhost:3003";

// In-memory store for payments
const payments = [];

async function processPayment(eventName, data) {
  const {
    bookingId,
    bookingCode,
    userId,
    userName,
    userEmail,
    movieTitle,
    showTime,
    seats,
    totalAmount,
  } = data;

  console.log(
    `💳 [PaymentService] Xử lý thanh toán cho booking ${bookingCode}...`,
  );

  // Giả lập xử lý thanh toán (80% thành công)
  await new Promise((r) => setTimeout(r, 1500));
  const isSuccess = Math.random() < 0.8;

  const payment = {
    id: uuidv4(),
    paymentCode: `PAY-${Date.now()}`,
    bookingId,
    bookingCode,
    userId,
    userName,
    totalAmount,
    status: isSuccess ? "COMPLETED" : "FAILED",
    processedAt: new Date().toISOString(),
  };

  payments.push(payment);

  if (isSuccess) {
    // Cập nhật booking status → CONFIRMED
    try {
      await axios.patch(`${BOOKING_SERVICE}/bookings/${bookingId}/status`, {
        status: "CONFIRMED",
      });
    } catch (err) {
      console.warn("[PaymentService] Không thể cập nhật booking:", err.message);
    }

    // Publish PAYMENT_COMPLETED
    await publish(EVENTS.PAYMENT_COMPLETED, {
      bookingId,
      bookingCode,
      paymentCode: payment.paymentCode,
      userId,
      userName,
      userEmail,
      movieTitle,
      showTime,
      seats,
      totalAmount,
    });

    console.log(
      `✅ [PaymentService] Thanh toán THÀNH CÔNG: ${payment.paymentCode}`,
    );
  } else {
    // Cập nhật booking status → CANCELLED
    try {
      await axios.patch(`${BOOKING_SERVICE}/bookings/${bookingId}/status`, {
        status: "CANCELLED",
      });
    } catch (err) {
      console.warn("[PaymentService] Không thể cập nhật booking:", err.message);
    }

    // Publish PAYMENT_FAILED
    await publish(EVENTS.PAYMENT_FAILED, {
      bookingId,
      bookingCode,
      userId,
      userName,
      userEmail,
      movieTitle,
      totalAmount,
      reason: "Thanh toán thất bại do lỗi hệ thống ngân hàng",
    });

    console.log(`❌ [PaymentService] Thanh toán THẤT BẠI: ${bookingCode}`);
  }
}

async function startPaymentConsumer() {
  await subscribe(
    [EVENTS.BOOKING_CREATED],
    "payment_service_queue",
    processPayment,
  );
  console.log("👂 [PaymentService] Đang lắng nghe event BOOKING_CREATED...");
}

function getPayments() {
  return payments;
}

module.exports = { startPaymentConsumer, getPayments };
