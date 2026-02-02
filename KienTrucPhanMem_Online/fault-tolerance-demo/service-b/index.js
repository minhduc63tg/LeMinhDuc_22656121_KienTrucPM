const express = require("express");
const axios = require("axios");
const { combinedPolicy, circuitBreakerPolicy } = require("./resilience-config");

const app = express();
const PORT = 3002;
const SERVICE_A_URL = "http://service-a:3001";

app.use(express.json());

// Statistics
let stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  retriedRequests: 0,
  circuitBreakerOpen: 0,
};

// Endpoint để gọi Service A với resilience patterns
app.get("/api/call-service-a", async (req, res) => {
  stats.totalRequests++;

  try {
    // Sử dụng combined policy (retry + circuit breaker + bulkhead + timeout)
    const result = await combinedPolicy.execute(async () => {
      const response = await axios.get(`${SERVICE_A_URL}/api/data`);
      return response.data;
    });

    stats.successfulRequests++;
    res.json({
      success: true,
      data: result,
      stats,
    });
  } catch (error) {
    stats.failedRequests++;

    // Check if circuit breaker is open
    if (error.message && error.message.includes("circuit")) {
      stats.circuitBreakerOpen++;
      return res.status(503).json({
        success: false,
        error: "Circuit breaker is OPEN - Service A is unavailable",
        fallback: "Using cached data or default response",
        stats,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
      stats,
    });
  }
});

// Endpoint để xem stats
app.get("/api/stats", (req, res) => {
  res.json({
    ...stats,
    circuitBreakerState: circuitBreakerPolicy.state,
  });
});

// Reset stats
app.post("/api/stats/reset", (req, res) => {
  stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    retriedRequests: 0,
    circuitBreakerOpen: 0,
  };
  res.json({ message: "Stats reset", stats });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "Service B" });
});

app.listen(PORT, () => {
  console.log(`Service B running on port ${PORT}`);
  console.log("Resilience patterns enabled:");
  console.log("- Retry with exponential backoff");
  console.log("- Circuit Breaker");
  console.log("- Rate Limiter");
  console.log("- Bulkhead");
  console.log("- Timeout");
});
