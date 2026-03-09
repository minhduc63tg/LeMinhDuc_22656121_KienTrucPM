import express from "express";
import { Kernel } from "@micro-cms/core";
import { BlogPlugin } from "@micro-cms/plugin-blog";
import { AuthPlugin } from "@micro-cms/plugin-auth";
import { MediaPlugin } from "@micro-cms/plugin-media";
import config from "../../cms.config.json";

const app = express();
const kernel = new Kernel();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

kernel.init(app, config);

// Đăng ký plugins theo thứ tự hoặc tự động qua dependency
kernel.use(new AuthPlugin()).use(new MediaPlugin()).use(new BlogPlugin());

// Admin API để quản lý plugin
app.get("/api/plugins", (req, res) => {
  res.json(kernel.plugins.getStatus());
});

kernel.boot().then(() => {
  app.listen(3000, () => console.log("🌐 Server: http://localhost:3000"));
});
