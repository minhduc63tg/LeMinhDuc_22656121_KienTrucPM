// controllers/userController.js
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../db');

const JWT_SECRET = 'mini-food-secret-key';

const register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng ký' });
  }

  const exists = users.find((u) => u.email === email);
  if (exists) {
    return res.status(409).json({ success: false, message: 'Email đã tồn tại' });
  }

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: bcrypt.hashSync(password, 8),
    role: 'USER',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  const { password: _, ...userSafe } = newUser;
  return res.status(201).json({ success: true, message: 'Đăng ký thành công', data: userSafe });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu email hoặc mật khẩu' });
  }

  const user = users.find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  const { password: _, ...userSafe } = user;

  return res.json({ success: true, message: 'Đăng nhập thành công', data: { ...userSafe, token } });
};

const getAllUsers = (req, res) => {
  const safeUsers = users.map(({ password, ...u }) => u);
  return res.json({ success: true, data: safeUsers });
};

const getUserById = (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
  }
  const { password, ...userSafe } = user;
  return res.json({ success: true, data: userSafe });
};

module.exports = { register, login, getAllUsers, getUserById };
