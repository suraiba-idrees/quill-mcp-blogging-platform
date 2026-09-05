import { dashboardLayout } from "./layout.js";
import { escapeHtml } from "../lib/html-escape.js";
import type { Post } from "../../core/types/domain.js";

function postRow(post: Post): string {
  return `
    <div class="card" style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h3 style="margin:0 0 4px;">${escapeHtml(post.title)}</h3>
          <p style="margin:0;color:#6b7280;font-size:14px;">
            Status: ${escapeHtml(post.status)} · Updated: ${new Date(post.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <a class="button" href="/dashboard/posts/${post.id}/edit">Edit</a>
      </div>
    </div>
  `;
}

export function dashboardPage(posts: Post[]): string {
  const postsHtml =
    posts.length === 0
      ? `
        <div class="card">
          <p>You don't have any posts yet.</p>
          <a class="button" href="/dashboard/posts/new">Create your first post</a>
        </div>
      `
      : posts.map(postRow).join("");

  return dashboardLayout(
    "Dashboard",
    `
      <div class="page-header">
        <h1>Posts</h1>
        <p>Manage your blog posts.</p>
      </div>
      ${postsHtml}
    `,
  );
}