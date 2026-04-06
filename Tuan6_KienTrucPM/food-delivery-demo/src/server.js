// src/server.js — Entry point
// Architecture: Server-based (single process), MariaDB with partitioning
// Demonstrates: REST API, connection pooling, RANGE + HASH partitioning, outbox pattern

require("dotenv").config();
const express = require("express");
const { testConnection } = require("./config/db");
const logger = require("./middleware/logger");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(logger);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/restaurants", require("./routes/restaurants"));
app.use("/orders", require("./routes/orders"));
app.use("/users", require("./routes/users"));
app.use("/events", require("./routes/events"));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "food-delivery-demo",
    ts: new Date().toISOString(),
  });
});

// Architecture info endpoint — useful for demo
app.get("/", (req, res) => {
  res.json({
    service: "Online Food Delivery — Demo API",
    architecture: "Server-based (monolith demo, microservices-ready)",
    database: "MariaDB with partitioning",
    partitioning: {
      users: "HASH(id) × 4  — even distribution",
      orders: "RANGE(created_ts) by quarter — time-based pruning",
    },
    endpoints: {
      "GET  /restaurants": "List open restaurants",
      "GET  /restaurants/:id/menu": "Restaurant menu",
      "GET  /users": "List users (HASH partitioned)",
      "POST /users": "Create user",
      "GET  /orders": "List orders (supports ?from=&to= for partition pruning)",
      "POST /orders": "Create order + emit event (outbox pattern)",
      "PATCH /orders/:id/status": "Update order status",
      "GET  /events": "Pending outbox events (→ Kafka in prod)",
      "POST /events/:id/publish": "Simulate publishing event to Kafka",
      "GET  /events/partition-info": "Show MariaDB partition metadata",
    },
    async_pattern:
      "Outbox: events written in same DB transaction, processor publishes to Kafka",
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error(`❌ [${req.method} ${req.url}]`, err.message);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

// ── Start ────────────────────────────────────────────────────────────────────
async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n Food Delivery API running → http://localhost:${PORT}`);
    console.log(` API docs: GET http://localhost:${PORT}/`);
    console.log(
      `  Partition info: GET http://localhost:${PORT}/events/partition-info\n`,
    );
  });
}

start();
