import type { IPlugin, PluginContext, PluginMeta } from "@micro-cms/core";
import { BlogService } from "./service";
import { createRoutes } from "./routes";

export class BlogPlugin implements IPlugin {
  readonly meta: PluginMeta = {
    id: "cms-blog",
    name: "Blog",
    version: "1.0.0",
    description: "Quản lý bài viết blog",
    author: "Your Name",
    requires: ["cms-auth"], // phụ thuộc plugin auth
  };

  async install(ctx: PluginContext): Promise<void> {
    // 1. Đăng ký service vào registry
    const blogService = new BlogService();
    ctx.services.register("blog.service", blogService);

    // 2. Đăng ký HTTP routes
    ctx.app.use("/api/posts", createRoutes(ctx));

    // 3. Đăng ký filters để các plugin khác có thể sửa dữ liệu
    ctx.hooks.addFilter("blog:before-save", (post: any) => {
      return { ...post, updatedAt: new Date().toISOString() };
    });

    ctx.logger.info("[BlogPlugin] Installed ✓");
  }

  async activate(ctx: PluginContext): Promise<void> {
    // Lắng nghe sự kiện từ plugin khác
    ctx.events.on("auth:user-deleted", (data: { userId: string }) => {
      const svc = ctx.services.resolve<BlogService>("blog.service");
      svc.deleteByAuthor(data.userId);
    });

    ctx.events.emit("blog:activated", { pluginId: this.meta.id });
  }

  async deactivate(ctx: PluginContext): Promise<void> {
    ctx.logger.info("[BlogPlugin] Deactivated");
  }
}
