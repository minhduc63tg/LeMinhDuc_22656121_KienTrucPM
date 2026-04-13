// src/index.js — Payment + Notification Service
const express = require("express");
const cors = require("cors");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const PORT = process.env.PORT || 8084;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ service: "payment-service", status: "ok", port: PORT }),
);
app.use("/", paymentRoutes);

app.listen(PORT, () => {
  console.log(
    `✅ Payment + Notification Service đang chạy tại http://localhost:${PORT}`,
  );
});
