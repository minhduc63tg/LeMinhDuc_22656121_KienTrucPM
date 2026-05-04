require("dotenv").config();
const amqp = require("amqplib");

let channel;

async function connectQueue() {
  try {
    const connection = await amqp.connect(
      process.env.RABBITMQ_URL || "amqp://localhost",
    );
    channel = await connection.createChannel();
    await channel.assertQueue("ORDER_QUEUE");
    await channel.assertQueue("LOAD_DATA_QUEUE");
  } catch (error) {
    console.error("RabbitMQ connection failed:", error);
  }
}

connectQueue();

async function sendToQueue(queueName, data) {
  if (!channel) await connectQueue();
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
}

async function consume(queueName, callback) {
  if (!channel) await connectQueue();
  channel.consume(queueName, callback);
}

function ack(msg) {
  if (channel) {
    channel.ack(msg);
  }
}

module.exports = {
  sendToQueue,
  consume,
  ack,
};
