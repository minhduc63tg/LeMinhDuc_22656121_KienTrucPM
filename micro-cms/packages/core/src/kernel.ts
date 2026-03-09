import { PluginManager } from "./plugin-manager";
import { EventBus } from "./event-bus";
import { ServiceRegistry } from "./service-registry";
import { HookSystem } from "./hook-system";
import type { IPlugin, PluginContext } from "./types";
import type { Application } from "express";

export class Kernel {
  readonly plugins = new PluginManager();
  readonly events = new EventBus();
  readonly services = new ServiceRegistry();
  readonly hooks = new HookSystem();

  private ctx!: PluginContext;

  init(app: Application, config: Record<string, unknown> = {}): void {
    this.ctx = {
      app,
      events: this.events,
      services: this.services,
      hooks: this.hooks,
      config,
      logger: console,
    };
    this.plugins.setContext(this.ctx);
  }

  use(plugin: IPlugin): this {
    this.plugins.register(plugin);
    return this; // chainable
  }

  async boot(): Promise<void> {
    this.events.emit("kernel:before-boot", {});
    await this.plugins.bootAll();
    this.events.emit("kernel:after-boot", {});
    console.log("[CMS] 🚀 Kernel khởi động thành công");
  }
}
