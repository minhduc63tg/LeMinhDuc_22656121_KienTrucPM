import type { IPlugin, PluginContext } from "./types";

type PluginState = "registered" | "installed" | "active" | "inactive" | "error";

interface PluginRecord {
  plugin: IPlugin;
  state: PluginState;
  error?: Error;
}

export class PluginManager {
  private registry = new Map<string, PluginRecord>();
  private ctx!: PluginContext;

  setContext(ctx: PluginContext): void {
    this.ctx = ctx;
  }

  /** Đăng ký plugin vào hệ thống */
  register(plugin: IPlugin): void {
    const { id, version } = plugin.meta;
    if (this.registry.has(id)) {
      throw new Error(`Plugin "${id}" đã được đăng ký`);
    }
    this.registry.set(id, { plugin, state: "registered" });
    console.log(`[CMS] Plugin đăng ký: ${id}@${version}`);
  }

  /** Resolve thứ tự load theo dependency graph */
  private resolveOrder(): IPlugin[] {
    const visited = new Set<string>();
    const order: IPlugin[] = [];

    const visit = (id: string) => {
      if (visited.has(id)) return;
      const rec = this.registry.get(id);
      if (!rec) throw new Error(`Dependency "${id}" không tìm thấy`);
      rec.plugin.meta.requires?.forEach(visit);
      visited.add(id);
      order.push(rec.plugin);
    };

    this.registry.forEach((_, id) => visit(id));
    return order;
  }

  /** Cài đặt và kích hoạt tất cả plugin */
  async bootAll(): Promise<void> {
    const ordered = this.resolveOrder();

    for (const plugin of ordered) {
      await this.installPlugin(plugin);
      await this.activatePlugin(plugin.meta.id);
    }
  }

  private async installPlugin(plugin: IPlugin): Promise<void> {
    const rec = this.registry.get(plugin.meta.id)!;
    try {
      await plugin.install(this.ctx);
      rec.state = "installed";
    } catch (err) {
      rec.state = "error";
      rec.error = err as Error;
      console.error(`[CMS] Lỗi install plugin ${plugin.meta.id}:`, err);
    }
  }

  async activatePlugin(id: string): Promise<void> {
    const rec = this.registry.get(id);
    if (!rec || rec.state !== "installed") return;
    await rec.plugin.activate?.(this.ctx);
    rec.state = "active";
    console.log(`[CMS] ✓ Plugin active: ${id}`);
  }

  async deactivatePlugin(id: string): Promise<void> {
    const rec = this.registry.get(id);
    if (!rec || rec.state !== "active") return;
    await rec.plugin.deactivate?.(this.ctx);
    rec.state = "inactive";
  }

  getStatus() {
    return [...this.registry.entries()].map(([id, rec]) => ({
      id,
      state: rec.state,
      version: rec.plugin.meta.version,
    }));
  }
}
