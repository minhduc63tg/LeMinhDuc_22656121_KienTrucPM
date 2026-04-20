// src/index.js — Payment + Notification Service
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connect } = require("../../../shared/rabbitmq");
const { startPaymentConsumer } = require("./services/paymentProcessor");
const { startNotificationConsumer } = require("./services/notificationService");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({
    service: "payment-notification-service",
    status: "ok",
    port: PORT,
  }),
);
app.use("/", routes);

async function start() {
  // Kết nối RabbitMQ
  await connect();

  // Khởi động các consumer
  await startPaymentConsumer();
  await startNotificationConsumer();

  app.listen(PORT, () =>
    console.log(
      `✅ Payment+Notification Service chạy tại http://localhost:${PORT}`,
    ),
  );
}

start();
