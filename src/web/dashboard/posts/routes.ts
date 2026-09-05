import { Hono } from "hono";
import { postEditorPage } from "./pages.js";
import * as postService from "../../../core/services/post.service.js";
import { ServiceError } from "../../../core/services/errors.js";
import type { AuthedEnv } from "../../types.js";

const posts = new Hono<AuthedEnv>();

posts.get("/new", (c) => {
  return c.html(postEditorPage("create"));
});

posts.post("/new", async (c) => {
  const body = await c.req.parseBody();
  const title = String(body.title ?? "").trim();

  if (!title) {
    return c.html(postEditorPage("create", undefined, "Title is required."), 400);
  }

  try {
    postService.createPost(c.get("userId"), {
      title,
      contentMd: String(body.content ?? ""),
    });
    return c.redirect("/dashboard");
  } catch (err) {
    const message = err instanceof ServiceError ? err.message : "Something went wrong. Please try again.";
    return c.html(postEditorPage("create", undefined, message), 400);
  }
});

posts.get("/:id/edit", (c) => {
  try {
    const post = postService.getPost(c.get("userId"), c.req.param("id"));
    return c.html(postEditorPage("edit", post));
  } catch {
    return c.redirect("/dashboard");
  }
});

posts.post("/:id/edit", async (c) => {
  const id = c.req.param("id");
  const userId = c.get("userId");
  const body = await c.req.parseBody();
  const title = String(body.title ?? "").trim();

  // Load current state upfront — needed both for validation fallback
  // rendering and for the draft/unpublish comparison below.
  let current;
  try {
    current = postService.getPost(userId, id);
  } catch {
    return c.redirect("/dashboard");
  }

  if (!title) {
    return c.html(postEditorPage("edit", current, "Title is required."), 400);
  }

  try {
    postService.updatePost(userId, id, {
      title,
      contentMd: String(body.content ?? ""),
    });

    const seoTitle = body.seoTitle ? String(body.seoTitle).trim() : undefined;
    const seoDescription = body.seoDescription ? String(body.seoDescription).trim() : undefined;
    const slug = body.slug ? String(body.slug).trim() : undefined;
    if (seoTitle || seoDescription || slug) {
      postService.updateSeo(userId, id, {
        metaTitle: seoTitle || undefined,
        metaDescription: seoDescription || undefined,
        slug: slug || undefined,
      });
    }

    const status = String(body.status ?? "draft");
    if (status === "published") {
      postService.publishPost(userId, id);
    } else if (status === "scheduled") {
      const publishAt = String(body.publishAt ?? "");
      if (!publishAt) {
        const fallback = postService.getPost(userId, id);
        return c.html(postEditorPage("edit", fallback, "A schedule date/time is required for scheduled posts."), 400);
      }
      postService.schedulePost(userId, id, {
        scheduledAt: new Date(publishAt).toISOString(),
      });
    } else if (status === "draft" && current.status !== "draft") {
      postService.unpublishPost(userId, id);
    }

    return c.redirect("/dashboard");
  } catch (err) {
    const message = err instanceof ServiceError ? err.message : "Something went wrong. Please try again.";
    const fallback = postService.getPost(userId, id);
    return c.html(postEditorPage("edit", fallback, message));
  }
});

export default posts;