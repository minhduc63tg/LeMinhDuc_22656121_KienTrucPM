// src/api.js (Chạy trên Máy 2)
const express = require("express");
const cors = require("cors");
const redisClient = require("./services/redisService");
const mq = require("./services/mqService");
const db = require("../config/db"); // Tạm thời query thẳng DB cho get products nếu cần

const app = express();

app.use(cors());
app.use(express.json());

// API lấy danh sách sản phẩm (Demo: Load từ Redis)
app.get("/products", async (req, res) => {
  try {
    const productsCache = await redisClient.get("products");
    if (productsCache) {
      return res.json(JSON.parse(productsCache));
    }

    // Nếu không có, load từ DB rồi cache vào Redis
    const conn = await db.getConnection();
    const products = await conn.query("SELECT * FROM products");
    conn.release();

    await redisClient.set("products", JSON.stringify(products), {
      EX: 3600, // cache 1 hour
    });

    // Đổ stock vào Redis luôn
    for (let p of products) {
      await redisClient.set(`inventory:${p.id}`, p.stock);
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Load chi tiết 1 product (như cũ)
app.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  const productKey = `product:${id}`;

  let product = await redisClient.get(productKey);

  if (!product) {
    await mq.sendToQueue("LOAD_DATA_QUEUE", { type: "PRODUCT", id });
    return res.status(202).json({
      message: "Hệ thống đang nạp dữ liệu, vui lòng thử lại sau giây lát.",
    });
  }

  res.json(JSON.parse(product));
});

// API Add to Cart (Lưu vào Redis)
app.post("/cart", async (req, res) => {
  const { userId, productId, quantity, productName, price } = req.body;
  const cartKey = `cart:${userId}`;

  const cartItem = { productId, quantity, productName, price };

  try {
    let cart = await redisClient.get(cartKey);
    let cartArray = cart ? JSON.parse(cart) : [];

    const existingIndex = cartArray.findIndex(
      (item) => item.productId === productId,
    );
    if (existingIndex >= 0) {
      cartArray[existingIndex].quantity += quantity;
    } else {
      cartArray.push(cartItem);
    }

    await redisClient.set(cartKey, JSON.stringify(cartArray));
    res.json({ message: "Đã thêm vào giỏ hàng", cart: cartArray });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Truy xuất giỏ hàng
app.get("/cart/:userId", async (req, res) => {
  try {
    const cart = await redisClient.get(`cart:${req.params.userId}`);
    res.json(cart ? JSON.parse(cart) : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Checkout (Order PU)
app.post("/checkout", async (req, res) => {
  const { userId } = req.body;
  const cartKey = `cart:${userId}`;

  try {
    const cartStr = await redisClient.get(cartKey);
    if (!cartStr) {
      return res.status(400).json({ message: "Giỏ hàng rỗng" });
    }

    const cart = JSON.parse(cartStr);

    // Order PU: Lấy giỏ -> Gọi Inventory Redis -> Giảm Stock -> OK thì đặt MQ
    let successItems = [];
    let outOfStockItems = [];

    for (let item of cart) {
      const inventoryKey = `inventory:${item.productId}`;

      // check if exists
      const hasKey = await redisClient.exists(inventoryKey);
      if (!hasKey) {
        // fallback set default if not initialized
        await redisClient.set(inventoryKey, 0);
      }

      // Giảm stock trên Redis
      const stockLeft = await redisClient.decrBy(inventoryKey, item.quantity);

      if (stockLeft < 0) {
        // Hết hàng -> rollback
        await redisClient.incrBy(inventoryKey, item.quantity);
        outOfStockItems.push(item);
      } else {
        successItems.push(item);
        const orderData = {
          userId,
          productId: item.productId,
          quantity: item.quantity,
          timestamp: Date.now(),
        };
        // Gửi MQ
        await mq.sendToQueue("ORDER_QUEUE", orderData);
      }
    }

    if (successItems.length > 0) {
      // Clear cart
      await redisClient.del(cartKey);
      res.status(200).json({
        message: "Checkout hoàn tất!",
        success: successItems,
        failed: outOfStockItems,
      });
    } else {
      res
        .status(400)
        .json({
          message: "Không thể mua bất kỳ sản phẩm nào vì hết hàng",
          failed: outOfStockItems,
        });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend NodeJS đang chạy tại port ${PORT}`);
});
