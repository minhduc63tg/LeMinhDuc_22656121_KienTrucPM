const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Database giả lập (thực tế dùng MongoDB, PostgreSQL)
const users = [];

class AuthService {
  // Đăng ký user mới
  async register(username, email, password) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Email không hợp lệ");
    }

    // Validate password length
    if (password.length < 6) {
      throw new Error("Password phải có ít nhất 6 ký tự");
    }

    // Validate username length
    if (username.length < 3) {
      throw new Error("Username phải có ít nhất 3 ký tự");
    }

    // Kiểm tra email đã tồn tại
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      throw new Error("Email đã được sử dụng");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    users.push(newUser);

    // Tạo token
    const token = this.generateToken(newUser);

    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
      token,
    };
  }

  // Đăng nhập
  async login(email, password) {
    // Tìm user
    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new Error("Email hoặc password không đúng");
    }

    // Kiểm tra password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Email hoặc password không đúng");
    }

    // Tạo token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    };
  }

  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  // Lấy thông tin user
  getUserById(userId) {
    const user = users.find((u) => u.id === userId);
    if (!user) {
      throw new Error("Không tìm thấy user");
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  // Lấy tất cả users
  getAllUsers() {
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      createdAt: u.createdAt,
    }));
  }
}

module.exports = new AuthService();
