// src/worker.js
const mq = require("./services/mqService");
const db = require("../config/db"); // Require đúng đường dẫn
const redisClient = require("./services/redisService");

async function startWorker() {
  await mq.consume("ORDER_QUEUE", async (msg) => {
    const order = JSON.parse(msg.content.toString());
    // Service write --> read MQ --> ghi vào DB (Yêu cầu 4)
    try {
      const conn = await db.getConnection();
      await conn.query(
        "INSERT INTO orders (userId, productId, qty) VALUES (?, ?, ?)",
        [order.userId, order.productId, order.quantity],
      );

      // Cập nhật lại tồn kho thực trong DB
      await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [
        order.quantity,
        order.productId,
      ]);
      conn.release();
      mq.ack(msg); // Xác nhận đã xử lý
    } catch (error) {
      console.error("Lỗi ghi DB:", error);
    }
  });

  await mq.consume("LOAD_DATA_QUEUE", async (msg) => {
    const task = JSON.parse(msg.content.toString());
    // Service ReadDB --> bỏ lên Redis (Yêu cầu 5)
    if (task.type === "PRODUCT") {
      const conn = await db.getConnection();
      const rows = await conn.query("SELECT * FROM products WHERE id = ?", [
        task.id,
      ]);
      conn.release();

      if (rows.length > 0) {
        // Đưa lên Redis với thời gian hết hạn (TTL)
        await redisClient.setex(
          `product:${task.id}`,
          3600,
          JSON.stringify(rows[0]),
        );
      }
      mq.ack(msg);
    }
  });
}

startWorker();
