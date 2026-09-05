import { Hono } from "hono";
import type { AuthedEnv } from "../types.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as postService from "../../core/services/post.service.js";
import { handleServiceError } from "../lib/http-error.js";
import type { PostStatus } from "../../core/types/domain.js";

export const postRoutes = new Hono<AuthedEnv>();

postRoutes.use("*", authMiddleware);

postRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const post = postService.createPost(c.get("userId"), body);
    return c.json({ post }, 201);
  } catch (err) {
    return handleServiceError(c, err);
  }
});

postRoutes.get("/", (c) => {
  try {
    const status = c.req.query("status") as PostStatus | undefined;
    const posts = postService.listPosts(c.get("userId"), status);
    return c.json({ posts });
  } catch (err) {
    return handleServiceError(c, err);
  }
});

postRoutes.get("/:id", (c) => {
  try {
    const post = postService.getPost(c.get("userId"), c.req.param("id"));
    return c.json({ post });
  } catch (err) {
    return handleServiceError(c, err);
  }
});

postRoutes.patch("/:id", async (c) => {
  try {
    const body = await c.req.json();
    const post = postService.updatePost(c.get("userId"), c.req.param("id"), body);
    return c.json({ post });
  } catch (err) {
    return handleServiceError(c, err);
  }
});

postRoutes.delete("/:id", (c) => {
  try {
    postService.deletePost(c.get("userId"), c.req.param("id"));
    return c.body(null, 204);
  } catch (err) {
    return handleServiceError(c, err);
  }
});

postRoutes.post("/:id/publish", (c) => {
  try {
    const post = postService.publishPost(c.get("userId"), c.req.param("id"));
    return c.json({ post });
  } catch (err) {
    return handleServiceError(c, err);
  }
});

postRoutes.post("/:id/schedule", async (c) => {
  try {
    const body = await c.req.json();
    const post = postService.schedulePost(c.get("userId"), c.req.param("id"), body);
    return c.json({ post });
  } catch (err) {
    return handleServiceError(c, err);
  }
});

postRoutes.post("/:id/unpublish", (c) => {
  try {
    const post = postService.unpublishPost(c.get("userId"), c.req.param("id"));
    return c.json({ post });
  } catch (err) {
    return handleServiceError(c, err);
  }
});

postRoutes.patch("/:id/seo", async (c) => {
  try {
    const body = await c.req.json();
    const post = postService.updateSeo(c.get("userId"), c.req.param("id"), body);
    return c.json({ post });
  } catch (err) {
    return handleServiceError(c, err);
  }
});