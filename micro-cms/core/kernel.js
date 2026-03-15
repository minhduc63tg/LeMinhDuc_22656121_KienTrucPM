/**
 * MICROKERNEL (Core)
 * -----------------
 * Đây là "trái tim" của hệ thống.
 * Kernel chỉ làm MỘT việc: quản lý plugin (register, load, communicate).
 * Mọi tính năng thực sự đều nằm trong plugin.
 */

class Kernel {
  constructor() {
    this.plugins = new Map(); // Lưu trữ tất cả plugin đã đăng ký
    this.hooks = new Map(); // Event bus: plugin giao tiếp qua đây
    this.services = new Map(); // Service registry: plugin expose API cho nhau
    this.logs = []; // Audit log
  }

  // ── PLUGIN MANAGEMENT

  /**
   * Đăng ký một plugin vào kernel
   * Plugin phải có: { name, version, init(kernel) }
   */
  register(plugin) {
    if (!plugin.name || !plugin.version || typeof plugin.init !== "function") {
      throw new Error(`Plugin thiếu required fields: name, version, init`);
    }

    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" đã được đăng ký`);
    }

    this.plugins.set(plugin.name, {
      ...plugin,
      status: "registered",
      registeredAt: new Date().toISOString(),
    });

    this._log(`[KERNEL] Plugin registered: ${plugin.name}@${plugin.version}`);
  }

  /**
   * Kích hoạt tất cả plugin đã đăng ký
   */
  async boot() {
    this._log(`[KERNEL] Booting with ${this.plugins.size} plugins...`);

    for (const [name, plugin] of this.plugins) {
      try {
        // Kernel truyền chính nó vào plugin → plugin có thể dùng hooks & services
        await plugin.init(this);
        plugin.status = "active";
        this._log(`[KERNEL] ✓ Plugin activated: ${name}`);
      } catch (err) {
        plugin.status = "error";
        this._log(`[KERNEL] ✗ Plugin failed: ${name} — ${err.message}`);
      }
    }

    this._log(`[KERNEL] Boot complete!`);
  }

  // ── HOOK SYSTEM (Event Bus)
  // Plugin giao tiếp với nhau qua hooks, KHÔNG gọi trực tiếp nhau
  // → Loose coupling!

  /**
   * Plugin đăng ký lắng nghe một event
   */
  on(hookName, handler) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName).push(handler);
  }

  /**
   * Kernel (hoặc plugin) phát một event, tất cả listener sẽ được gọi theo thứ tự
   * Mỗi listener có thể transform data (pipeline pattern)
   */
  async emit(hookName, data) {
    const handlers = this.hooks.get(hookName) || [];
    let result = data;

    for (const handler of handlers) {
      result = (await handler(result)) ?? result;
    }

    return result;
  }

  // ── SERVICE REGISTRY
  // Plugin expose API của mình để plugin khác dùng

  /**
   * Plugin đăng ký một service (expose API)
   */
  provideService(name, implementation) {
    this.services.set(name, implementation);
    this._log(`[KERNEL] Service provided: ${name}`);
  }

  /**
   * Plugin lấy service của plugin khác
   */
  getService(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service "${name}" không tồn tại`);
    }
    return this.services.get(name);
  }

  // ── INTROSPECTION

  getStatus() {
    const pluginList = [];
    for (const [name, p] of this.plugins) {
      pluginList.push({
        name,
        version: p.version,
        description: p.description || "",
        status: p.status,
        registeredAt: p.registeredAt,
      });
    }
    return {
      plugins: pluginList,
      hooks: [...this.hooks.keys()],
      services: [...this.services.keys()],
      logs: this.logs.slice(-20),
    };
  }

  _log(message) {
    const entry = `${new Date().toISOString().split("T")[1].split(".")[0]} ${message}`;
    this.logs.push(entry);
    console.log(entry);
  }
}

module.exports = Kernel;
