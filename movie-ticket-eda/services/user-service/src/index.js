// src/index.js — User Service
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const { connect } = require("../../../shared/rabbitmq");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ service: "user-service", status: "ok", port: PORT }),
);
app.use("/", userRoutes);

async function start() {
  await connect();
  app.listen(PORT, () =>
    console.log(`✅ User Service chạy tại http://localhost:${PORT}`),
  );
}

start();
