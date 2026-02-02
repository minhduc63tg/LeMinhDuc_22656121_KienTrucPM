const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3001;

// Biến để mô phỏng failures
let failureRate = 0; // 0 = không fail, 0.5 = 50% fail
let requestCount = 0;

app.use(express.json());

// Endpoint để test
app.get("/api/data", async (req, res) => {
  requestCount++;

  // Mô phỏng failure theo tỷ lệ
  if (Math.random() < failureRate) {
    console.log(`Request ${requestCount}: Simulated failure`);
    return res.status(500).json({ error: "Service temporarily unavailable" });
  }

  // Mô phỏng delay
  const delay = Math.random() * 1000; // 0-1 giây
  await new Promise((resolve) => setTimeout(resolve, delay));

  console.log(`Request ${requestCount}: Success after ${delay.toFixed(0)}ms`);
  res.json({
    message: "Data from Service A",
    requestNumber: requestCount,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint để điều chỉnh failure rate
app.post("/api/config/failure-rate", (req, res) => {
  failureRate = req.body.rate || 0;
  console.log(`Failure rate set to: ${failureRate * 100}%`);
  res.json({
    failureRate,
    message: `Failure rate set to ${failureRate * 100}%`,
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "Service A" });
});

app.listen(PORT, () => {
  console.log(`Service A running on port ${PORT}`);
  console.log(`Current failure rate: ${failureRate * 100}%`);
});
