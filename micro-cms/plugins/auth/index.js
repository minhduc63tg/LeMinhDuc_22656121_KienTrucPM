/**
 * PLUGIN: Auth
 * ------------
 * Nhiệm vụ: Xác thực người dùng
 *
 * Plugin này:
 * 1. Lắng nghe hook "request:incoming" để kiểm tra auth header
 * 2. Expose service "auth" cho các plugin khác check quyền
 *
 * Demo: Dùng simple token, KHÔNG dùng cho production thực tế!
 */

const authPlugin = {
  name: "auth",
  version: "1.0.0",
  description: "Xác thực người dùng qua Bearer token",

  // Giả lập database users
  _users: {
    "token-admin-123": { id: 1, name: "Admin", role: "admin" },
    "token-editor-456": { id: 2, name: "Editor", role: "editor" },
    "token-guest-789": { id: 3, name: "Guest", role: "guest" },
  },

  init(kernel) {
    // Tham gia pipeline xử lý request
    kernel.on("request:incoming", (ctx) => {
      const authHeader = ctx.headers?.authorization || "";
      const token = authHeader.replace("Bearer ", "");
      const user = this._users[token] || null;

      kernel._log(
        `[auth] ${user ? `✓ User: ${user.name} (${user.role})` : "✗ Anonymous"}`,
      );

      // Gắn user vào context để plugin sau dùng
      return { ...ctx, user };
    });

    // Expose service
    kernel.provideService("auth", {
      getUser: (token) => this._users[token] || null,
      isAdmin: (user) => user?.role === "admin",
      hasRole: (user, role) => user?.role === role,
    });
  },
};

module.exports = authPlugin;
