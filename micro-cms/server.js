/**
 * SERVER + BOOTSTRAP
 * ------------------
 * Nơi:
 * 1. Tạo Kernel
 * 2. Đăng ký các plugin
 * 3. Boot kernel
 * 4. Expose API endpoints để test
 */

const express = require("express");
const path = require("path");
const Kernel = require("./core/kernel");

// Import các plugin
const markdownPlugin = require("./plugins/markdown-renderer");
const authPlugin = require("./plugins/auth");
const analyticsPlugin = require("./plugins/analytics");

// ── 1. KHỞI TẠO KERNEL ──────────────────────────────────
const kernel = new Kernel();

// ── 2. ĐĂNG KÝ PLUGIN (thứ tự quan trọng cho hook pipeline) ──
kernel.register(authPlugin); // Chạy đầu tiên: xác thực
kernel.register(analyticsPlugin); // Chạy thứ hai: ghi thống kê
kernel.register(markdownPlugin); // Chạy thứ ba: render content

// ── 3. BOOT
kernel.boot().then(() => {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "public")));

  // ── API ENDPOINTS

  /**
   * GET /api/render?text=...
   * Chạy qua toàn bộ pipeline:
   * request:incoming → content:render
   */
  app.get("/api/render", async (req, res) => {
    // Bước 1: Chạy pipeline "request:incoming"
    const ctx = await kernel.emit("request:incoming", {
      path: req.path,
      headers: req.headers,
    });

    // Bước 2: Chạy pipeline "content:render"
    const markdownText =
      req.query.text || "# Hello\n**Microkernel** is *awesome*!";
    const rendered = await kernel.emit("content:render", markdownText);

    res.json({
      input: markdownText,
      output: rendered,
      user: ctx.user,
    });
  });

  /**
   * GET /api/status
   * Xem trạng thái của kernel: plugins, hooks, services
   */
  app.get("/api/status", (req, res) => {
    res.json(kernel.getStatus());
  });

  /**
   * GET /api/analytics
   * Dùng service của analytics plugin
   */
  app.get("/api/analytics", async (req, res) => {
    // Ghi nhận request này vào analytics
    await kernel.emit("request:incoming", {
      path: req.path,
      headers: req.headers,
    });

    const analytics = kernel.getService("analytics");
    res.json(analytics.getSummary());
  });

  // ── START SERVER
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`📋 Dashboard:  http://localhost:${PORT}`);
    console.log(`🔌 API Status: http://localhost:${PORT}/api/status`);
    console.log(`📊 Analytics:  http://localhost:${PORT}/api/analytics`);
    console.log(
      `✏️  Render:     http://localhost:${PORT}/api/render?text=# Hello`,
    );
  });
});
