const express = require("express");
const router = express.Router();
const authService = require("../services/auth.service");
const { authenticateToken } = require("../middleware/auth");

// POST /api/auth/register - Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin (username, email, password)",
      });
    }

    const result = await authService.register(username, email, password);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/auth/login - Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền email và password",
      });
    }

    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/auth/profile - Lấy thông tin user (cần token)
router.get("/profile", authenticateToken, (req, res) => {
  try {
    const user = authService.getUserById(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/auth/users - Lấy danh sách users (cần token)
router.get("/users", authenticateToken, (req, res) => {
  try {
    const users = authService.getAllUsers();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
