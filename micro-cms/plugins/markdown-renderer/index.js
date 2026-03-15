/**
 * PLUGIN: Markdown Renderer
 * -------------------------
 * Nhiệm vụ: Chuyển đổi Markdown → HTML khi content được render
 *
 * Plugin này:
 * 1. Lắng nghe hook "content:render"
 * 2. Chuyển đổi markdown syntax cơ bản → HTML
 * 3. Expose service "renderer" để plugin khác dùng
 */

const markdownPlugin = {
  name: "markdown-renderer",
  version: "1.0.0",
  description: "Chuyển đổi Markdown sang HTML",

  init(kernel) {
    // Đăng ký tham gia vào pipeline render content
    kernel.on("content:render", (content) => {
      kernel._log(`[markdown-renderer] Processing content...`);
      return this.parseMarkdown(content);
    });

    // Expose service để plugin khác có thể dùng
    kernel.provideService("renderer", {
      render: (text) => this.parseMarkdown(text),
    });
  },

  parseMarkdown(text) {
    if (typeof text !== "string") return text;

    return (
      text
        // Headings
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
        // Bold & Italic
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        // Code inline
        .replace(/`(.+?)`/g, "<code>$1</code>")
        // Links
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        // Line breaks
        .replace(/\n/g, "<br>")
    );
  },
};

module.exports = markdownPlugin;
