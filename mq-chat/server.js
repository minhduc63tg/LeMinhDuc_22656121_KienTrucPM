require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const rabbitMQService = require("./services/rabbitmq.service");

// Import routes
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS (nếu cần)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Chat App API - RabbitMQ + JWT",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/profile (requires token)",
        users: "GET /api/auth/users (requires token)",
      },
      chat: {
        send: "POST /api/chat/send (requires token)",
        messages: "GET /api/chat/messages (requires token)",
        status: "GET /api/chat/status (requires token)",
      },
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
async function startServer() {
  try {
    // Kết nối RabbitMQ
    const rabbitConnected = await rabbitMQService.connect();

    if (!rabbitConnected) {
      console.warn(
        "⚠️ Warning: RabbitMQ không kết nối được. Chat feature sẽ không hoạt động."
      );
    }

    // Lắng nghe messages từ RabbitMQ và log ra console
    rabbitMQService.onMessage((messageData) => {
      console.log("\n📨 New Message Received:");
      console.log(`   User: ${messageData.username}`);
      console.log(`   Message: ${messageData.message}`);
      console.log(`   Time: ${messageData.timestamp}\n`);
    });

    // Start Express server
    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(60));
      console.log("🚀 SERVER STARTED SUCCESSFULLY");
      console.log("=".repeat(60));
      console.log(`📡 Server running at: http://localhost:${PORT}`);
      console.log(
        `🐰 RabbitMQ: ${rabbitConnected ? "✅ Connected" : "❌ Disconnected"}`
      );
      console.log("\n📚 API ENDPOINTS:");
      console.log("\n🔐 Authentication:");
      console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
      console.log(`   GET    http://localhost:${PORT}/api/auth/profile`);
      console.log(`   GET    http://localhost:${PORT}/api/auth/users`);
      console.log("\n💬 Chat (RabbitMQ):");
      console.log(`   POST   http://localhost:${PORT}/api/chat/send`);
      console.log(`   GET    http://localhost:${PORT}/api/chat/messages`);
      console.log(`   GET    http://localhost:${PORT}/api/chat/status`);
      console.log("\n" + "=".repeat(60) + "\n");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  await rabbitMQService.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  await rabbitMQService.close();
  process.exit(0);
});

// Start the server
startServer();
