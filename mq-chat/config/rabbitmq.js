require("dotenv").config();

module.exports = {
  url: process.env.RABBITMQ_URL || "amqp://localhost",
  queue: process.env.RABBITMQ_QUEUE || "chat_queue",
};
