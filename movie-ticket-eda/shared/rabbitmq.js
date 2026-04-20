// shared/rabbitmq.js — RabbitMQ helper dùng chung cho tất cả services
const amqplib = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

// Exchange name (fanout per event type → dùng direct exchange)
const EXCHANGE = 'movie_ticket_events';

let connection = null;
let channel = null;

/**
 * Kết nối RabbitMQ với retry
 */
async function connect(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      connection = await amqplib.connect(RABBITMQ_URL);
      channel = await connection.createChannel();

      // Khai báo topic exchange (dùng routing key = event name)
      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

      connection.on('error', (err) => {
        console.error('[RabbitMQ] Connection error:', err.message);
      });

      connection.on('close', () => {
        console.warn('[RabbitMQ] Connection closed. Reconnecting...');
        setTimeout(() => connect(), delay);
      });

      console.log(`✅ [RabbitMQ] Đã kết nối thành công tại ${RABBITMQ_URL}`);
      return channel;
    } catch (err) {
      console.warn(`[RabbitMQ] Thử kết nối lần ${i}/${retries}... (${err.message})`);
      if (i === retries) {
        console.error('[RabbitMQ] Không thể kết nối sau nhiều lần thử.');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

/**
 * Publish một event lên exchange
 * @param {string} eventName - Tên event (VD: BOOKING_CREATED)
 * @param {object} payload   - Dữ liệu kèm theo
 */
async function publish(eventName, payload) {
  if (!channel) throw new Error('RabbitMQ channel chưa được khởi tạo');

  const message = JSON.stringify({
    event: eventName,
    timestamp: new Date().toISOString(),
    data: payload,
  });

  channel.publish(EXCHANGE, eventName, Buffer.from(message), {
    persistent: true,
    contentType: 'application/json',
  });

  console.log(`📤 [PUBLISH] ${eventName}:`, JSON.stringify(payload).slice(0, 120));
}

/**
 * Subscribe (consume) một hoặc nhiều event
 * @param {string[]} eventNames - Danh sách event cần lắng nghe
 * @param {string}   queueName  - Tên queue riêng của service
 * @param {Function} handler    - Hàm xử lý (eventName, data) => void
 */
async function subscribe(eventNames, queueName, handler) {
  if (!channel) throw new Error('RabbitMQ channel chưa được khởi tạo');

  // Khai báo queue bền vững
  await channel.assertQueue(queueName, { durable: true });

  // Bind queue với từng event
  for (const eventName of eventNames) {
    await channel.bindQueue(queueName, EXCHANGE, eventName);
    console.log(`📥 [SUBSCRIBE] ${queueName} ← ${eventName}`);
  }

  channel.prefetch(1);

  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const { event, data, timestamp } = JSON.parse(msg.content.toString());
      console.log(`📨 [CONSUME] ${event} @ ${timestamp}`);
      await handler(event, data);
      channel.ack(msg);
    } catch (err) {
      console.error('[RabbitMQ] Lỗi xử lý message:', err.message);
      channel.nack(msg, false, false); // discard lỗi, không requeue
    }
  });
}

/**
 * Lấy channel hiện tại
 */
function getChannel() {
  return channel;
}

module.exports = { connect, publish, subscribe, getChannel, EXCHANGE };
