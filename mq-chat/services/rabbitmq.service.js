const amqp = require("amqplib");
const config = require("../config/rabbitmq");

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.messageCallbacks = [];
  }

  // Kết nối tới RabbitMQ
  async connect() {
    try {
      this.connection = await amqp.connect(config.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(config.queue, { durable: true });

      console.log("✅ Connected to RabbitMQ");

      // Bắt đầu lắng nghe messages
      this.startConsuming();

      return true;
    } catch (error) {
      console.error("❌ RabbitMQ connection error:", error.message);
      return false;
    }
  }

  // Gửi message vào queue
  async sendMessage(message, username) {
    if (!this.channel) {
      throw new Error("RabbitMQ chưa được kết nối");
    }

    const messageData = {
      username,
      message,
      timestamp: new Date().toISOString(),
    };

    this.channel.sendToQueue(
      config.queue,
      Buffer.from(JSON.stringify(messageData))
    );

    return messageData;
  }

  // Bắt đầu nhận messages
  startConsuming() {
    this.channel.consume(config.queue, (msg) => {
      if (msg !== null) {
        try {
          const messageData = JSON.parse(msg.content.toString());

          // Gọi tất cả callbacks đã đăng ký
          this.messageCallbacks.forEach((callback) => {
            callback(messageData);
          });

          this.channel.ack(msg);
        } catch (error) {
          console.error("❌ Error parsing message:", error.message);
          // Reject message và không requeue
          this.channel.nack(msg, false, false);
        }
      }
    });
  }

  // Đăng ký callback để nhận messages
  onMessage(callback) {
    this.messageCallbacks.push(callback);
  }

  // Đóng kết nối
  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    console.log("🔌 Disconnected from RabbitMQ");
  }
}

module.exports = new RabbitMQService();
