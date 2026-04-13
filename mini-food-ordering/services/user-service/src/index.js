// src/index.js — User Service
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) =>
  res.json({ service: "user-service", status: "ok", port: PORT }),
);

// Routes
app.use("/", userRoutes);

app.listen(PORT, () => {
  console.log(`✅ User Service đang chạy tại http://localhost:${PORT}`);
});
