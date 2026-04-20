// src/controllers/userController.js
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { users } = require("../db");
const { publish } = require("../../../../shared/rabbitmq");
const EVENTS = require("../../../../shared/events");

const JWT_SECRET = "movie-ticket-secret";

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: "Thiếu thông tin" });

  if (users.find((u) => u.email === email))
    return res
      .status(409)
      .json({ success: false, message: "Email đã tồn tại" });

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: bcrypt.hashSync(password, 8),
    role: "USER",
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);

  // Publish event USER_REGISTERED
  try {
    await publish(EVENTS.USER_REGISTERED, {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (err) {
    console.warn("[UserService] Không thể publish event:", err.message);
  }

  const { password: _, ...safe } = newUser;
  return res
    .status(201)
    .json({ success: true, message: "Đăng ký thành công", data: safe });
};

const login = (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res
      .status(401)
      .json({ success: false, message: "Sai email hoặc mật khẩu" });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "24h",
  });
  const { password: _, ...safe } = user;
  return res.json({ success: true, data: { ...safe, token } });
};

const getUserById = (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy user" });
  const { password, ...safe } = user;
  return res.json({ success: true, data: safe });
};

const getAllUsers = (req, res) => {
  const safe = users.map(({ password, ...u }) => u);
  return res.json({ success: true, data: safe });
};

module.exports = { register, login, getUserById, getAllUsers };
