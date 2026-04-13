// src/index.js — Order Service
const express = require("express");
const cors = require("cors");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 8083;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ service: "order-service", status: "ok", port: PORT }),
);
app.use("/", orderRoutes);

app.listen(PORT, () => {
  console.log(`✅ Order Service đang chạy tại http://localhost:${PORT}`);
});
