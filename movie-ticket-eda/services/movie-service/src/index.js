// src/index.js — Movie Service (không cần RabbitMQ)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const movieRoutes = require("./routes/movieRoutes");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ service: "movie-service", status: "ok", port: PORT }),
);
app.use("/", movieRoutes);

app.listen(PORT, () =>
  console.log(`✅ Movie Service chạy tại http://localhost:${PORT}`),
);
