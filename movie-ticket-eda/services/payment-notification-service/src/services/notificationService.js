// src/services/notificationService.js
const { subscribe } = require("../../../../shared/rabbitmq");
const EVENTS = require("../../../../shared/events");

// In-memory notification log
const notifications = [];

// SSE clients registry
const sseClients = new Map();

async function handleNotification(eventName, data) {
  let message = "";
  let type = "INFO";

  switch (eventName) {
    case EVENTS.PAYMENT_COMPLETED:
      message = `🎉 ${data.userName} đã đặt vé "${data.movieTitle}" thành công! Mã vé: ${data.bookingCode} — ${data.seats} ghế — ${data.totalAmount?.toLocaleString("vi-VN")}đ`;
      type = "SUCCESS";
      break;

    case EVENTS.PAYMENT_FAILED:
      message = `❌ Thanh toán cho vé "${data.movieTitle}" của ${data.userName} thất bại. Lý do: ${data.reason}`;
      type = "FAILED";
      break;

    default:
      message = `[${eventName}] ${JSON.stringify(data)}`;
  }

  const notif = {
    id: Date.now().toString(),
    event: eventName,
    message,
    type,
    data,
    timestamp: new Date().toISOString(),
  };

  notifications.unshift(notif); // Mới nhất lên đầu
  if (notifications.length > 50) notifications.pop(); // Giới hạn 50 thông báo

  // Push to SSE clients
  sseClients.forEach((cb) => {
    try {
      cb(notif);
    } catch (_) {}
  });

  console.log(`🔔 [Notification] [${type}] ${message}`);
}

async function startNotificationConsumer() {
  await subscribe(
    [EVENTS.PAYMENT_COMPLETED, EVENTS.PAYMENT_FAILED],
    "notification_service_queue",
    handleNotification,
  );
  console.log(
    "👂 [NotificationService] Đang lắng nghe PAYMENT_COMPLETED & PAYMENT_FAILED...",
  );
}

// SSE clients registry - already declared above

function registerSSEClient(id, callback) {
  sseClients.set(id, callback);
}

function unregisterSSEClient(id) {
  sseClients.delete(id);
}

function getNotifications() {
  return notifications;
}

module.exports = {
  startNotificationConsumer,
  getNotifications,
  registerSSEClient,
  unregisterSSEClient,
};
