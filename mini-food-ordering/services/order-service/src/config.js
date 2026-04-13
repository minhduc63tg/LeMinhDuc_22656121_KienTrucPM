// config.js — URL của các service khác
module.exports = {
  USER_SERVICE_URL: process.env.USER_SERVICE_URL || "http://localhost:8081",
  FOOD_SERVICE_URL: process.env.FOOD_SERVICE_URL || "http://localhost:8082",
};
