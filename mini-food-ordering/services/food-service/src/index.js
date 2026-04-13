// src/index.js — Food Service
const express = require("express");
const cors = require("cors");
const foodRoutes = require("./routes/foodRoutes");

const app = express();
const PORT = process.env.PORT || 8082;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ service: "food-service", status: "ok", port: PORT }),
);
app.use("/", foodRoutes);

app.listen(PORT, () => {
  console.log(`✅ Food Service đang chạy tại http://localhost:${PORT}`);
});
