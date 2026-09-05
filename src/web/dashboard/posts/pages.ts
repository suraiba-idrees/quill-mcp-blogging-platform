import { dashboardLayout } from "../layout.js";
import { escapeHtml } from "../../lib/html-escape.js";
import type { Post } from "../../../core/types/domain.js";

export function postEditorPage(mode: "create" | "edit", post?: Post, error?: string): string {
  const isEdit = mode === "edit";
  const action = isEdit ? `/dashboard/posts/${post!.id}/edit` : "/dashboard/posts/new";
  const errorHtml = error
    ? `<div style="background:#fee2e2;color:#991b1b;padding:10px 14px;border-radius:6px;margin-bottom:18px;font-size:14px;">${escapeHtml(error)}</div>`
    : "";

  return dashboardLayout(
    isEdit ? "Edit Post" : "New Post",
    `
      <div class="page-header">
        <h1>${isEdit ? "Edit Post" : "Create New Post"}</h1>
        <p>
          ${isEdit
            ? "Update your blog post and its publishing settings."
            : "Write and configure your new blog post."}
        </p>
      </div>
      ${errorHtml}
      <form method="POST" action="${action}">
        <div class="card">
          <h2>Post Content</h2>
          <label for="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Enter post title"
            value="${escapeHtml(post?.title ?? "")}"
            required
          />
          <label for="content">Markdown Content</label>
          <textarea
            id="content"
            name="content"
            rows="18"
            placeholder="# Write your post in Markdown..."
          >${escapeHtml(post?.contentMd ?? "")}</textarea>
        </div>
        <div class="card">
          <h2>Publishing</h2>
          <label for="status">Status</label>
          <select id="status" name="status">
            <option value="draft" ${post?.status === "draft" ? "selected" : ""}>Draft</option>
            <option value="published" ${post?.status === "published" ? "selected" : ""}>Published</option>
            <option value="scheduled" ${post?.status === "scheduled" ? "selected" : ""}>Scheduled</option>
          </select>
          <label for="publishAt">Schedule Date & Time</label>
          <input
            id="publishAt"
            name="publishAt"
            type="datetime-local"
            value="${post?.scheduledAt ? post.scheduledAt.slice(0, 16) : ""}"
          />
          <div style="margin-top: 20px;">
            <button class="button" type="submit">
              ${isEdit ? "Save Changes" : "Create Post"}
            </button>
          </div>
        </div>
        <div class="card">
          <h2>SEO</h2>
          <label for="seoTitle">SEO Title</label>
          <input
            id="seoTitle"
            name="seoTitle"
            type="text"
            placeholder="SEO title"
            value="${escapeHtml(post?.metaTitle ?? "")}"
          />
          <label for="seoDescription">Meta Description</label>
          <textarea
            id="seoDescription"
            name="seoDescription"
            rows="4"
            placeholder="Write a short description for search engines..."
          >${escapeHtml(post?.metaDescription ?? "")}</textarea>
          <label for="slug">URL Slug</label>
          <input
            id="slug"
            name="slug"
            type="text"
            placeholder="my-blog-post"
            value="${escapeHtml(post?.slug ?? "")}"
          />
        </div>
      </form>
    `,
  );
}