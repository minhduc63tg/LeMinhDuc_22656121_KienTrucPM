// src/index.js — Booking Service (CORE)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");
const { connect } = require("../../../shared/rabbitmq");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ service: "booking-service", status: "ok", port: PORT }),
);
app.use("/", bookingRoutes);

async function start() {
  await connect();
  app.listen(PORT, () =>
    console.log(`✅ Booking Service chạy tại http://localhost:${PORT}`),
  );
}

start();
