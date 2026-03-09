import { Router } from "express";
import type { PluginContext } from "@micro-cms/core";
import type { BlogService } from "./service";

export function createRoutes(ctx: PluginContext): Router {
  const router = Router();
  const svc = ctx.services.resolve<BlogService>("blog.service");

  // GET /api/posts
  router.get("/", async (req, res) => {
    const posts = await svc.findAll();
    // Hook cho phép plugin khác filter danh sách bài
    const filtered = ctx.hooks.applyFilter("blog:posts-list", posts);
    res.json(filtered);
  });

  // POST /api/posts
  router.post("/", async (req, res) => {
    const data = ctx.hooks.applyFilter("blog:before-save", req.body);
    const post = await svc.create(data);
    ctx.events.emit("blog:post-created", post);
    res.status(201).json(post);
  });

  // GET /api/posts/:id
  router.get("/:id", async (req, res) => {
    const post = await svc.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
  });

  return router;
}
