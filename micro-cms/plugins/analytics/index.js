/**
 * PLUGIN: Analytics
 * -----------------
 * Nhiệm vụ: Đếm số lần content được xem
 *
 * Plugin này hoàn toàn KHÔNG biết markdown-renderer hay auth tồn tại.
 * Nó chỉ lắng nghe hook "content:render" và ghi lại thống kê.
 *
 * → Đây là sức mạnh của Microkernel: plugin độc lập hoàn toàn!
 */

const analyticsPlugin = {
  name: "analytics",
  version: "1.0.0",
  description: "Thu thập thống kê lượt xem content",

  _stats: {}, // { contentId: count }
  _history: [], // Lịch sử 50 event gần nhất

  init(kernel) {
    // Lắng nghe TRƯỚC khi render để ghi nhận request
    kernel.on("request:incoming", (ctx) => {
      this._record("page_view", {
        path: ctx.path,
        user: ctx.user?.name || "anonymous",
        time: new Date().toISOString(),
      });
      return ctx; // Trả về ctx không đổi, chỉ side-effect
    });

    // Lắng nghe sau khi content được render
    kernel.on("content:render", (content) => {
      const preview =
        typeof content === "string"
          ? content.substring(0, 30).replace(/\n/g, " ")
          : "(non-string)";
      this._record("content_render", { preview });
      return content; // Không thay đổi content
    });

    // Expose service để ai cũng có thể query stats
    kernel.provideService("analytics", {
      getStats: () => ({ ...this._stats }),
      getHistory: () => [...this._history],
      getSummary: () => ({
        totalEvents: this._history.length,
        pageViews: this._stats["page_view"] || 0,
        contentRenders: this._stats["content_render"] || 0,
      }),
    });
  },

  _record(event, data) {
    this._stats[event] = (this._stats[event] || 0) + 1;
    this._history.unshift({ event, data, time: new Date().toISOString() });
    if (this._history.length > 50) this._history.pop();
  },
};

module.exports = analyticsPlugin;
